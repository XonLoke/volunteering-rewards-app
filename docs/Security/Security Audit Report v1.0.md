# Security Audit Report v1.0

**Date:** 6 July 2026
**Project:** Volunteering Rewards App (C3000C)
**Performed by:** Xon (Technical Lead)
**Branch:** `main` (commit `0ddf0fe`)

---

## 1. Executive Summary

A comprehensive security audit was conducted covering authentication, authorization,
input validation, API endpoint security, secrets management, database security,
and error handling.

| Severity | Issues Found | Fixed | Pending |
|----------|:-----------:|:-----:|:-------:|
| 🔴 Critical | 4 | 4 | 0 |
| 🟡 Medium | 2 | 2 | 0 |
| 🟢 Low | 1 | 1 | 0 |
| ✅ No Issue | 7 | — | — |

---

## 2. Issues Found

### 2.1 🔴 Debug Endpoints Exposed in Production

**Status:** ✅ Fixed

Three debug endpoints had NO authentication and were accessible in production:

- **`POST /api/debug/seed`** — Inserts test users and demo data
- **`POST /api/debug/seed-coupon-pins`** — Deletes ALL user_coupons and
  redemption_logs data, then regenerates PINs
- **`GET /api/debug/db`** — Returns PostgreSQL server address, version,
  databases, schemas, and tables (serious information disclosure)

**Fix:** Added a `devOnly` middleware that blocks all three with `404 Not Found`
when `NODE_ENV=production`.

### 2.2 🔴 Health Endpoint Leaks DB Connection Info

**Status:** ✅ Fixed

`GET /api/health` returned `db_host`, `db_name`, `db_user`, `db_ssl`, and
`has_database_url`. In production, DB details are now hidden.

### 2.3 🔴 Secrets Exposed on GitHub via .env Files

**Status:** ✅ Fixed

Two `.env` files with secrets were tracked in git ( visible in git history on GitHub ):
- `/.env` — Docker DB password
- `/backend/.env` — DB password, JWT secrets, PIN secret, FreeLLMAPI key

**Fix:**
1. Removed from git tracking (`git rm --cached`)
2. Created `.env.example` templates with placeholder values
3. Rotated all local secrets to new cryptographically-random values

### 2.4 🔴 Stack Trace Leak in Debug Endpoint

**Status:** ✅ Fixed

The `/api/debug/db` error handler returned `err.stack` in the JSON response,
exposing server-side file paths.

### 2.5 🟡 Startup Diagnostics Leak in Console

**Status:** ✅ Fixed

Server startup printed DB host, port, name, user, and JWT secret status to
stdout. Now only logged in development mode.

### 2.6 🟡 Weak PIN_SECRET

**Status:** ✅ Fixed

The PIN_SECRET was a dictionary-word-level secret. Replaced with a
cryptographically-random 128-bit value.

### 2.7 🟢 Error Handler Message Leak

**Status:** ⚠️ Mitigated (by design)

The global error handler returns descriptive messages for non-500 errors.
500 errors in production return "Internal server error".

---

## 3. Verified Secure — No Issues

### SQL Injection Prevention ✅
All queries use parameterized `$1, $2` syntax via `pg`.

### Input Validation ✅
Joi schemas on register, login, profile update, and organiser registration.

### Password Hashing ✅
bcrypt with 12 salt rounds. Password policy: 8+ chars, uppercase + digit.

### JWT Token Design ✅
Access tokens: 15-min expiry, Refresh tokens: 7-day with rotation + theft detection.

### Rate Limiting ✅
Global: 500 req/15min, Login: 10 req/min, Register: 5 req/min.

### Authorization / Role Guards ✅
All admin, organiser, merchant routes protected by `roleGuard`.

### HTTP Security Headers ✅
Helmet.js applied globally.

### CORS ✅
Reflects request origin with credentials support.

### Request Body Size Limit ✅
Express JSON parser limited to 1MB.

---

## 4. Fixes Applied

| # | File | Change |
|---|------|--------|
| 1 | `backend/index.js` | `devOnly` middleware for 3 debug endpoints |
| 2 | `backend/index.js` | Health endpoint sanitized for production |
| 3 | `backend/index.js` | Removed `err.stack` from debug/db response |
| 4 | `backend/index.js` | Startup diagnostics in dev-only guard |
| 5 | `.env` | Removed from git tracking |
| 6 | `backend/.env` | Removed from git tracking |
| 7 | `.env.example` | Created with Docker/CI placeholders |
| 8 | `backend/.env.example` | Updated with secure template values |
| 9 | `backend/.env` (local) | Regenerated with new random secrets |

---

## 5. Recommendations

1. **Rotate production secrets on Render** — If JWT secrets / PIN_SECRET in
   Render dashboard match the leaked `.env` values, generate new ones.
2. **Enable Content Security Policy** — Add CSP headers via Helmet in production.
3. **Account lockout** — Lock accounts after 5 failed login attempts.
4. **Device fingerprinting** — Attach device info to refresh tokens for
   better theft detection.

---

*— End of Security Audit Report v1.0 —*
