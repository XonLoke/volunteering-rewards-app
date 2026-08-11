# UAT Amendment & Debugging Report — V1.0

**Date:** 20 July 2026  
**Project:** Volunteering Rewards App (C3000C Capstone)  
**Author:** Xon (with Claude Code)  
**Status:** Complete ✅  

---

## Executive Summary

This report documents all debugging, fixes, and feature improvements performed on 20 July 2026 following User Acceptance Testing (UAT) feedback from Vivian and the team. The primary issue was a **500 Internal Server Error** on the `POST /api/contact` endpoint in production, which led to a deeper investigation of the email delivery system, API configuration, and admin usability improvements.

**Key outcomes:**
- ✅ Contact form fixed and working in production
- ✅ Email sending via Mailgun REST API established (SMTP blocked from Render)
- ✅ Mailgun Auto-Discover feature added (admin needs only API key)
- ✅ 8 merge conflicts resolved integrating Vivian's mobile fixes
- ✅ Admin Portal UX improved with provider-specific help text

---

## Issue 1: Contact Form 500 Error (`POST /api/contact`)

### Symptom
`POST /api/contact` returned `{"error":{"code":"internal_error","message":"Internal server error"}}` on the production Render deployment.

### Investigation

**Route code** (`backend/src/routes/contact.routes.js`):
- Route correctly mounted at `/api/contact` in `index.js`
- Uses JWT `authenticate` middleware
- Fetches user from DB, validates subject/message, calls `sendEmail()`
- Errors are passed to `next(err)` → global error handler → generic 500 in production

**Email config** (`email_config` DB table via Admin Portal):
```json
{
  "smtp_host": "smtp.mailgun.org",
  "smtp_port": 465,
  "smtp_secure": true,
  "email_user": "postmaster@sandbox1ee88100e81b49c59a09c75a5dbb7a8f.mailgun.org",
  "email_pass": "********"  // masked, non-empty
}
```

### Root Cause

The `email.service.js` detected `smtp.mailgun.org` in the SMTP host and routed to `sendViaMailgunApi()`, which calls the **Mailgun REST API** (`api.mailgun.net/v3/{domain}/messages`). However, the Admin Portal stored **SMTP credentials** (username + password), not a Mailgun **API key**. The REST API requires a `key-xxxxxxxx` API key, so the SMTP password was rejected → 500 error.

Additionally:
- **Mailgun REST API** → works from Render (confirmed via direct test ✅)
- **Mailgun SMTP** (ports 465/587) → **blocked from Render** (connection timeout ❌)

### Fix Applied

1. **Routing logic** — `sendEmail()` now tries Mailgun REST API first; if it fails, falls back to SMTP
2. **API key handling** — REST API uses the stored password as-is (no `key-` prefix auto-prepended, confirmed correct through direct API testing)
3. **REST API timeout** — increased from 15s to 30s for Render's slower network
4. **Contact support email** — changed fallback from `support@volunteerrewards.app` to `xiaoai.assistant@proton.me` (an authorized Mailgun sandbox recipient)

### Verification

```json
// POST /api/contact with valid JWT
{
  "message": "Your message has been sent. We'll get back to you soon.",
  "sentTo": "xiaoai.assistant@proton.me"
}
```

✅ Contact email delivered successfully to admin's inbox.

### Files Changed

| File | Change |
|------|--------|
| `backend/src/services/email.service.js` | Dual-path send (REST API → SMTP), timeouts, removed `key-` prefix logic |
| `backend/src/middleware/errorHandler.middleware.js` | Show error code messages in production |
| `backend/src/routes/contact.routes.js` | Updated fallback support email |

---

## Issue 2: Mailgun Authentication / SMTP Configuration

### Symptoms
- `sendViaMailgunApi()` → `Mailgun API error (401): Forbidden`
- SMTP connection → `Connection timeout` (ports 465 and 587 blocked from Render)
- Direct API test with different key formats revealed correct auth

### Root Cause

| Credential Type | Works? | Endpoint |
|----------------|--------|----------|
| SMTP password `Password123@456` | SMTP ✅, REST API ❌ | Nodemailer SMTP / Mailgun API |
| API key `5de8e3...` (without `key-`) | REST API ✅ | `api.mailgun.net` |
| API key `key-5de8e3...` (with `key-`) | REST API ❌ Forbidden | `api.mailgun.net` |

The Mailgun API key for this sandbox domain **does NOT use the `key-` prefix** — authenticating as `api:5de8e3...` works, while `api:key-5de8e3...` returns Forbidden.

### Final Credentials Stored

| Field | Value |
|-------|-------|
| SMTP Host | `smtp.mailgun.org` |
| SMTP Port | `587` |
| SSL/TLS | false (STARTTLS) |
| Email User | `postmaster@sandbox1ee88100e81b49c59a09c75a5dbb7a8f.mailgun.org` |
| Email Password | `5de8e30605ee4dba7bf77f94e07dcc42-9889a0ac-0e4e4e0f` (API key) |

### SMTP Credentials Created

Mailgun SMTP credentials were created for the sandbox domain via API to enable SMTP fallback:
- Login: `postmaster@sandbox1ee88100e81b49c59a09c75a5dbb7a8f.mailgun.org`
- Password: `Password123@456`

---

## Issue 3: Error Handler Export (False Alarm)

### Report
Vivian reported that `errorHandler.middleware.js` has a broken export, citing:
```
node -e "const {errorHandler} = require('./src/middleware/errorHandler.middleware'); console.log(typeof errorHandler);"
// → undefined
```

### Investigation
The module exports:
```js
module.exports = errorHandler;           // exports the FUNCTION directly
module.exports.createError = createError; // adds .createError property to function object
```

The test command used **destructuring** (`{ errorHandler }`), which looks for a `.errorHandler` property on the export. Since the export IS the function (not a wrapper object), destructuring correctly returns `undefined`.

### Verdict: ✅ No Bug

All 15+ production import sites use the correct syntax:
```js
const errorHandler = require("./src/middleware/errorHandler.middleware"); // ✅ correct
const { createError } = require("./src/middleware/errorHandler.middleware"); // ✅ correct
```

The error handler IS functioning on production (evidenced by structured error responses from the contact endpoint).

---

## Feature: Mailgun Auto-Discover

### Motivation
An admin downloading the code cannot be expected to know `postmaster@sandbox...mailgun.org`. They only have access to their Mailgun **API key**.

### Implementation

**Backend endpoint** `POST /api/admin/email/discover-mailgun`:
- Accepts Mailgun API key
- Queries `GET /v3/domains` Mailgun API
- Finds first active domain (prefers non-sandbox)
- Returns full SMTP config with `postmaster@{domain}` as email_user

**Frontend UI** (Admin Portal → Email Config):
- New "Mailgun Auto-Discover" card with purple accent
- Input field for API key
- "Auto-Discover" button that calls the backend endpoint
- On success: auto-fills SMTP Host, Port, SSL, Email User, Email Password, Sender Name
- Displays discovered domain name and type

**Files Changed**

| File | Change |
|------|--------|
| `backend/src/services/emailConfig.service.js` | Added `discoverMailgun()` function |
| `backend/src/controllers/admin.controller.js` | Added `discoverMailgun` handler |
| `backend/src/routes/admin.routes.js` | Added route |
| `frontend/web_portals/src/pages/admin/EmailConfig.jsx` | Added Auto-Discover UI + handler |

---

## Feature: Admin Portal UX Improvements

### Email User Help Text
The "Email User" field now shows provider-specific help text below it:
- **Mailgun:** "Find this under Sending → Domains → your domain → SMTP Credentials. It looks like postmaster@yourdomain.mailgun.org"
- **Gmail:** "Use your full Gmail address"
- **SendGrid:** "Use 'apikey' as the username"
- **Other:** Generic guidance

### File Changed
`frontend/web_portals/src/pages/admin/EmailConfig.jsx`

---

## Merge: Vivian's Branch Integration

### Branch Merged
`origin/vivian` → `main` (commit `20aba53`)

### Fixes Included
- Redeem flow fixes
- PIN display fixes
- Home/rewards/coupons data parsing with better API response fallbacks
- Edit profile validation (added Singapore phone number format check `+65XXXXXXXX`)
- Referral menu link fix
- Forgot password screen (mobile)
- Attendance service column name fixes (`user_id` → `volunteer_id`, `points_value` → `points_reward`)
- Error handling simplifications

### Merge Conflicts Resolved (8 files)

| File | Resolution Strategy |
|------|-------------------|
| `app/ai-recommendations.tsx` | Merged: main's authFetch + Vivian's data parsing fallbacks |
| `app/contact.tsx` | Minor whitespace → took Vivian's |
| `app/edit-profile.tsx` | Merged: both email validation (main) + phone validation (Vivian) |
| `app/forgot-password.tsx` | Add/add → took Vivian's (correct API endpoints) |
| `app/home.tsx` | Took Vivian's (RefreshControl, better data parsing) |
| `app/profile.tsx` | Took Vivian's |
| `app/redeem-confirmation.tsx` | Took Vivian's |
| `app/settings.tsx` | Took Vivian's |

---

## Render Deployment Notes

### Docker Build Time
Render's free-tier Docker builds took **10+ minutes** per deployment. A switch to native Node (`render.yaml` env: `node`) was attempted but failed with exit code 1 (internal system error). The deployment was rolled back to Docker.

**Workaround:** Changed `render.yaml` back to `env: docker` and waited for builds to complete on each push.

### Current Workflow
Push to `main` on GitHub → Render auto-deploys via Docker → Available at `https://vol-rewards-api.onrender.com`

---

## Commit History (20 July 2026)

```
3153c69 Merge branch 'vivian' into main
831e4a5 feat: Mailgun Auto-Discover — enter API key only, SMTP login auto-fills
fc2d44a fix: set contact form support email to admin's authorized Mailgun recipient
bf2ab5f fix: try Mailgun REST API first (30s timeout), fall back to SMTP
395cc5e fix: revert render.yaml to Docker, expose error code messages
862606c fix: add help text to Email Config explaining SMTP login vs personal email
b18285d chore: switch from Docker to native Node deploy on Render (faster builds)
7fcfb57 chore: trigger fresh Render deploy
fcacc8c chore: add temporary debug endpoint for email testing
1aced63 fix: use SMTP for Mailgun instead of REST API (blocked from Render)
5620d5d fix: add 15s timeout to Mailgun API request to prevent hanging
9edeeee fix: remove key- prefix prepend — Mailgun API key already works without it
0f2ca95 fix: auto-prepend key- prefix for Mailgun API keys in sendViaMailgunApi
27a6404 fix: add SMTP timeouts and error handling for email delivery
bf55b7c fix: use SMTP (not REST API) for Mailgun SMTP credentials stored via Admin Portal
```

---

## Files Modified Today

**Backend (8 files):**
- `backend/src/services/email.service.js` — Major rewrite: dual-path sending, timeouts, removed `key-` prefix logic
- `backend/src/services/emailConfig.service.js` — Added `discoverMailgun()` function
- `backend/src/controllers/admin.controller.js` — Added `discoverMailgun` handler + export
- `backend/src/routes/admin.routes.js` — Added `POST /email/discover-mailgun` route
- `backend/src/routes/contact.routes.js` — Updated fallback support email
- `backend/src/middleware/errorHandler.middleware.js` — Expose error codes in production
- `backend/index.js` — Added temporary debug endpoint (later removed)
- `render.yaml` — Docker → Node (failed, reverted)

**Frontend (1 file):**
- `frontend/web_portals/src/pages/admin/EmailConfig.jsx` — Auto-Discover UI + help text

**Mobile App (8 files — merge resolutions):**
- `app/ai-recommendations.tsx`, `app/contact.tsx`, `app/edit-profile.tsx`,
- `app/forgot-password.tsx`, `app/home.tsx`, `app/profile.tsx`,
- `app/redeem-confirmation.tsx`, `app/settings.tsx`

---

## Future Recommendations

1. **Upgrade Mailgun to custom domain** — Removes the authorized-recipient restriction for production
2. **Consider SendGrid or other provider** — As alternative if Mailgun sandbox limits become problematic
3. **Monitor Render build times** — Docker builds are slow on free tier; revisit native Node deployment or optimize Dockerfile
4. **Test email verification flow** — Verify that registration email verification works end-to-end with the REST API path
5. **API response consistency** — Standardize backend response shapes so mobile apps don't need multiple fallback formats

---

*Report generated by Claude Code*
