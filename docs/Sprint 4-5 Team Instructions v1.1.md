# Sprint 4-5 Team Instructions

**Version:** 1.1  
**Date:** 16 June 2026  
**Project:** Volunteering Rewards App (C3000C)  
**Final Delivery:** August 2026 (capstone deadline: 14 Aug, demo: end of Aug)  

---

## 1. Sprint Overview

| Phase | Dates | Focus |
|-------|-------|-------|
| **Sprint 4** | 15 Jun – 29 Jun | Comprehensive Testing (Whole Team) |
| **Sprint 5** | 29 Jun – 6 Jul | Deployment & Final Delivery |
| **Final Delivery** | **Aug 2026** | Presentation, Report, Demo, Deployment |

Sprint 4 = Testing + Hardening. Sprint 5 = Deployment + Delivery.

Every team member must complete their assigned tests and **document results**. The supervisor requires a complete test plan appendix in the project report, so *documentation is just as important as the tests themselves*.

---

## 2. Project Setup (Everyone — Do This First)

Before starting any work, ensure your environment is set up correctly.

### 2.1 Prerequisites

- Node.js v22+
- PostgreSQL 16
- Git
- A code editor (VS Code recommended)
- Expo Go app on phone (for mobile testing)
- Chrome or Edge browser (for PWA testing)

### 2.2 Clone & Install

```bash
git clone https://github.com/XonLoke/volunteering-rewards-app
cd volunteering-rewards-app

# Install backend dependencies
cd backend && npm install

# Create .env file with database config
# (ask Xon for the .env file — it contains secrets, never commit it)

# Install web portal dependencies
cd ../frontend/web_portals && npm install

# Install mobile app dependencies
cd ../../app && npm install
```

### 2.3 Start the Application

Open **three terminals**:

**Terminal 1 — Backend API** (port 3000):
```bash
cd D:\c3000c\volunteering-rewards-app\backend
npm run dev
```

**Terminal 2 — Admin Web Portal** (port 5173):
```bash
cd D:\c3000c\volunteering-rewards-app\frontend\web_portals
npm run dev
```

**Terminal 3 — Run latest migrations:**
```bash
cd D:\c3000c\volunteering-rewards-app\backend
node src/utils/migrationRunner.js
```

### 2.4 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Organiser 2 | johnny@test.com | password123 (owns events 25, 27, 29, 31) |
| Volunteer | alice@test.com | password123 |
| Merchant | cheryl@test.com | password123 |

### 2.5 Database Configuration

The backend `.env` file should contain:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=volunteering_rewards
DB_USER=postgres
DB_PASSWORD=9663
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
PIN_SECRET=volunteering-rewards-pin-secret-v1
```

Ask Xon for the actual `.env` file with the correct JWT secrets. **Never commit the `.env` file to git.**

---

## 3. What Is Already Complete (Do Not Redo)

Before assigning tasks, here is what has already been done by Xon to avoid duplicated effort.

### 3.1 Backend — All 45+ Endpoints Live ✅

Auth, Events, Attendance, Rewards, Leaderboard, Referral, Feedback, Admin, Me, Organiser, Merchant, Email. 22 database migrations. All services fully functional.

### 3.2 All 4 Portals Built & Wired ✅

| Portal | Pages/Screens | Status |
|--------|--------------|--------|
| Admin Portal | 13 pages (Dashboard, Users, Events, Coupons, Redemptions, Rewards Config, Sponsorship, QR, Merchants, etc.) | ✅ |
| Organiser Portal | 8 pages (Dashboard, Events, EventCreate, EventEdit, Roster, Feedback, Q&A, OnsiteController) | ✅ |
| Merchant Cashier PWA | 3 pages (Login, PinVerify, History) | ✅ |
| Volunteer Mobile App | 26 screens (Home, Events, Rewards, Scan, Profile, Leaderboard, Referral, etc.) | ✅ |

### 3.3 PWA Apps Configured ✅

- **Organiser Attendance Scanner** — QR camera with html5-qrcode, camera/manual toggle, offline queue with localStorage, batch sync
- **Cashier PIN App** — PIN verify, redeem, 5-min undo window, on-screen keypad, real API calls
- Both installable via browser (vite-plugin-pwa, manifest, service worker, workbox caching)

### 3.4 Additional Features (F1-F4) Built ✅

| Feature | Type | Algorithm |
|---------|------|-----------|
| F1: AI Event Recommendations | Content-based filtering | Preference vector, weighted category scoring |
| F2: AI Feedback Summarizer | Lexicon-based sentiment | Tokenisation, polarity scoring, pattern matching |
| F3: Volunteer Sponsorship Program | Multi-level referral DAG | 2-tier weighted incentive, viral coefficient |
| F4: Hall of Fame Leaderboard | Gamification / SQL ranking | Points, events, checkins, redeemed categories |

### 3.5 Mobile Auth Fixed ✅

All 26 mobile screens migrated from `?user_id=X` query params to JWT Bearer token auth using a new shared `app/api.ts` helper. The helper provides `apiGet/apiPost/apiPut/apiDelete/apiUpload` with automatic token attachment.

### 3.6 Testing Already Done ✅

- **11/11 unit tests** passing
- **34 integration tests** completed (3 bugs fixed)
- **17/17 performance tests** (avg 101.7ms response time)
- **Full E2E test pass** — all 4 portals verified
- **133 test cases** documented (Test Plan & Case Spec v1.2.md)
- **3 bugs found and fixed** during E2E testing (see Section 9)

### 3.7 Security Audit Completed ✅

| Middleware | Verdict |
|-----------|---------|
| Auth middleware (JWT verification) | ✅ Secure |
| Role middleware (role guards) | ✅ Secure |
| Rate limiter (100 req/15min, login: 10/min) | ✅ Secure |
| Error handler (no sensitive data leaks) | ✅ Secure |

Full report at `docs/Security Audit Report v1.0.md`

### 3.8 Deployment Config Ready ✅

- **Backend:** Render Web Service created (`vol-rewards-api`, free tier, Singapore region)
- **Database:** **Neon PostgreSQL** (serverless, free tier, **no expiry**) — replaces Render's built-in PG which expires in 30 days
- **SSL:** `backend/src/config/database.js` updated with `DB_SSL=true` support for Neon
- **Config:** `render.yaml`, `docs/Deployment Environment Variables.md`, `docs/Manual Operations Guide v1.0.md`
- **Git:** Commit `7062f7f` pushed to `origin/main`

---

## 4. Individual Assignments

### 4.1 Xon (John) — Team Lead

**Responsibilities:** Co-ordination, deployment, bug fixes, final verification.

**Task X1 — Deploy Backend to Render + Neon PostgreSQL**

1. Go to [render.com](https://render.com) and connect the GitHub repo (`XonLoke/volunteering-rewards-app`)
2. Create a new **Web Service** pointing at main branch. Use **Docker** runtime.
3. **Database:** Sign up at [neon.tech](https://neon.tech) → Create a project (region: Singapore, PG version 16) → Copy the connection string
4. Set these environment variables in Render dashboard:

   | Key | Value |
   |-----|-------|
   | `DB_HOST` | From Neon connection string (e.g. `ep-xxx.ap-southeast-1.aws.neon.tech`) |
   | `DB_PORT` | `5432` |
   | `DB_NAME` | `neondb` |
   | `DB_USER` | From Neon connection string |
   | `DB_PASSWORD` | From Neon connection string |
   | `DB_SSL` | `true` |
   | `JWT_ACCESS_SECRET` | Generated crypto secret |
   | `JWT_REFRESH_SECRET` | Generated crypto secret |
   | `PIN_SECRET` | `volunteering-rewards-pin-secret-v1` |

   > **IMPORTANT:** `PIN_SECRET=volunteering-rewards-pin-secret-v1` must match the seed data PIN hashes.

5. After deployment, open Render shell and run:
   ```bash
   cd backend && node src/utils/migrationRunner.js && node src/utils/seed.js
   ```
6. Verify: visit `https://your-app.onrender.com/api/health` — should return `200 OK`
7. If health check fails, check Render logs. Most issues are missing env vars or SSL config.

**Task X2 — Run E2E Verification After Deployment**

Test all 4 portals against the deployed backend.

**Task X3 — Dry-Run Presentation (4 Jul)**

Get each team member to demo their work. Note anything broken.

**Task X4 — Tag v1.0.0 Release**

Push final README update and tag the release.

---

### 4.2 Nurain — Project Report, Presentation, User Manual

**Responsibilities:** Sprint 5 documentation. Primary owner of the project report and presentation slides.

**Task N1 — Project Report**

Start from the template at `docs/C300 Report Template.docx`. Include:

- System architecture overview (4 portals, tech stack)
- All 4 additional features (F1-F4) — use descriptions in `Sprint Breakdown v7.2.md`
- Test results appendix — copy from these docs:
  - `docs/Test Plan & Case Spec v1.2.md` (133 test cases)
  - `docs/E2E Test Results v1.0.md` (portal-by-portal results)
  - `docs/Test Results — Performance v2.0.md` (17/17 tests, 101.7ms avg)
  - `docs/Security Audit Report v1.0.md` (all middleware passed)
- Bug fixes section (see Section 9 in this document)
- Individual contributions table

**Task N2 — Presentation Slides**

Create slides covering:

- Problem statement & solution overview
- Architecture diagram
- Demo walkthrough (one slide per portal)
- AI features showcase (F1-F4)
- Testing results
- Deployment architecture
- Team contributions

**Task N3 — User Manual**

Create a simple step-by-step guide covering:

- How volunteers register, find events, check in, and redeem rewards
- How organisers create events and scan attendance
- How merchants verify and redeem PINs
- How admins manage users, coupons, and rewards

---

### 4.3 Vivian — Security Testing & Mobile App Verification

**Responsibilities:** Run the 12 security test cases from the test plan. These test the app's defences.

**Task V1 — Security Tests (12 cases from Test Plan Section 8)**

Run each test and document pass/fail in the Test Plan document.

| ID | Test | Expected Result | How to Test |
|----|------|----------------|-------------|
| SEC-01 | Expired JWT token | 401 | Get a token, wait 15 min (or use an expired token from Xon), call any `/api` endpoint |
| SEC-02 | Tampered JWT token | 401 | Modify the token's middle section, call any endpoint |
| SEC-03 | Missing JWT token | 401 | Call `/api/events` without `Authorization` header |
| SEC-04 | Wrong role access | 403 | Login as alice@test.com, call `GET /api/admin/users` |
| SEC-05 | SQL injection attempt | Sanitised / empty results | Try: `GET /api/events?title=' OR 1=1 --` |
| SEC-06 | XSS attempt in feedback | Escaped text stored | POST `/api/events/1/feedback` with `<script>alert('xss')</script>` in body |
| SEC-07 | Rate limiting on login | 429 after 10 attempts | POST `/api/auth/login` 12× quickly with wrong password |
| SEC-08 | Rate limiting on register | 429 after 5 attempts | POST `/api/auth/register` 7× quickly |
| SEC-09 | Brute force PIN verification | Rate limited | POST `/api/coupons/verify` 12× with wrong PINs |
| SEC-10 | PIN hash NOT plaintext | 64-char hex hash | Check DB: `SELECT pin_code FROM user_coupons LIMIT 5;` |
| SEC-11 | Merchant accessing volunteer endpoints | 403 | Login as cheryl@test.com, call `GET /api/me/profile` |
| SEC-12 | Volunteer using another's coupon | 403/404 | Login as alice, try bob's coupon PIN |

**Task V2 — Test Mobile Auth Migration**

1. Install **Expo Go** on your phone
2. `cd app && npx expo start`
3. Test this flow:
   ```
   Register new account → Login → Browse events → Register for event
   → View QR code → View rewards → View leaderboard
   ```
4. Confirm JWT auth works — no `?user_id=X` in any URLs
5. Report any issues to Xon

---

### 4.4 Grace — Integration Testing & Frontend Deployment

**Responsibilities:** Run integration tests endpoint-by-endpoint. Prepare frontend for deployment.

**Task G1 — Integration Tests (34 cases from Test Plan Section 5)**

Test each API endpoint with real database queries. Verify correct response shapes and error codes.

**Auth endpoints:**
- `POST /api/auth/register` — create new user, verify JWT returned
- `POST /api/auth/login` — existing user, verify JWT returned
- `POST /api/auth/login` — wrong password, verify `401`
- `POST /api/auth/refresh` — valid refresh token, verify new access token

**Events endpoints:**
- `GET /api/events` — paginated events
- `GET /api/events?category=Environmental` — filter works
- `GET /api/events/today` — only today's events
- `GET /api/events/recommended` — recommendations (requires login)
- `GET /api/events/popular` — most registered
- `POST /api/events` — create event (organiser role)
- `PUT /api/events/:id` — update event
- `DELETE /api/events/:id` — delete event

**Attendance:**
- `POST /api/attendance/scan` — valid QR scan
- `POST /api/attendance/scan` — already checked in → `409`
- `GET /api/organiser/events/:id/roster` — attendee list

**Rewards & Coupons:**
- `GET /api/rewards` — available rewards
- `POST /api/rewards/redeem` — sufficient points
- `POST /api/rewards/redeem` — insufficient points → `400`
- `POST /api/coupons/verify` — valid 6-digit PIN
- `POST /api/coupons/verify` — invalid PIN → `404`
- `POST /api/coupons/redeem` — successful redemption
- `POST /api/coupons/reverse` — within 5 minutes
- `GET /api/merchant/history` — redemption history

**Leaderboard:**
- `GET /api/leaderboard` — all categories
- `GET /api/leaderboard/points` — top by points
- `GET /api/leaderboard/events` — top by events attended
- `GET /api/leaderboard/checkins` — top by check-ins
- `GET /api/leaderboard/redeemed` — top by points redeemed

**Referral:**
- `POST /api/referral/register` — with referral code
- `GET /api/me/sponsorship-profile` — downline display

**Admin:**
- `GET /api/admin/users` — all users with role sort
- `GET /api/admin/coupons` — coupon list
- `POST /api/admin/coupons` — create coupon
- `PUT /api/admin/rewards-config` — update config

---

**Task G2 — Deploy Frontend to Vercel**

1. Go to [vercel.com](https://vercel.com) and import the GitHub repo
2. Set framework to **Vite**
3. Root directory: `frontend/web_portals`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Set environment variable: `VITE_API_URL=https://your-api.onrender.com/api`
7. Deploy and test the public URL
8. Update `CORS_ORIGINS` in the Render backend env vars to include the Vercel URL

---

## 5. Sprint 5 — Combined Schedule

### 5.1 Final Timeline

| Date | Milestone | Owner |
|------|-----------|-------|
| 22 Jun | Sprint 4 midpoint: Integration + Security tests complete | All |
| 26 Jun | Documentation first draft complete | Nurain |
| 29 Jun | **Sprint 4 ends:** ALL tests complete with documented results | All |
| 1 Jul | Backend deployed (Render), Frontend deployed (Vercel) | Xon + Grace |
| 4 Jul | **Dry-run presentation** for team feedback | All |
| **6 Jul** | **FINAL DELIVERY** — Presentation, Report, Demo, Deployment | **All** |

### 5.2 What Happens If You're Stuck

- Check the `docs/` folder — there are 40+ documents with detailed instructions
- Check `HANDOFF.md` in the project root — contains current status
- Ask in the team chat — someone else may have solved it
- If truly blocked, tell Xon directly — virtual teammates (v-Nurain, v-Vivian, v-Grace) are available as backup

---

## 6. Git Workflow

We use a single `main` branch workflow for simplicity.

**Rules:**

1. Never push directly to main without testing
2. If you need to make changes, create a feature branch:
   ```bash
   git checkout -b yourname/task-name
   ```
3. When done, push and create a **Pull Request** to main
4. Xon will review and merge
5. Always pull latest before starting:
   ```bash
   git checkout main
   git pull origin main
   ```

---

## 7. Document Versioning Rule

> **IMPORTANT:** Every document must have the version number in **BOTH** the filename AND the document header.

Examples:
- `Test Plan & Case Spec v1.2.md`
- `E2E Test Results v1.0.md`
- `Sprint Breakdown v7.2.md`

When you create a new version, increment the number in both places.

---

## 8. Quick Reference

### 8.1 Useful Commands

```bash
# Start backend
cd D:\c3000c\volunteering-rewards-app\backend && npm run dev

# Start web portal
cd D:\c3000c\volunteering-rewards-app\frontend\web_portals && npm run dev

# Run all tests
cd D:\c3000c\volunteering-rewards-app\backend && npm test

# Run a single test file
cd D:\c3000c\volunteering-rewards-app\backend && node --test tests/unit/auth.service.test.js

# Run migrations
cd D:\c3000c\volunteering-rewards-app\backend && node src/utils/migrationRunner.js

# Run performance tests
cd D:\c3000c\volunteering-rewards-app\backend && node tests/performance/perf_test.js

# Start mobile app
cd D:\c3000c\volunteering-rewards-app\app && npx expo start
```

### 8.2 Key File Locations

| What | Where |
|------|-------|
| Backend services | `backend/src/services/` |
| Backend controllers | `backend/src/controllers/` |
| Database migrations | `backend/migrations/` (001 through 023) |
| Admin web pages | `frontend/web_portals/src/pages/admin/` |
| Organiser pages | `frontend/web_portals/src/pages/organiser/` |
| Merchant pages | `frontend/web_portals/src/pages/merchant/` |
| Scanner PWA pages | `frontend/web_portals/src/pages/scan/` |
| Mobile app screens | `app/*.tsx` (26 files) |
| Mobile API helper | `app/api.ts` |
| Documentation | `docs/` (40+ files) |
| Security audit report | `docs/Security Audit Report v1.0.md` |
| E2E test results | `docs/E2E Test Results v1.0.md` |
| Performance test results | `docs/Test Results — Performance v2.0.md` |
| Test Plan | `docs/Test Plan & Case Spec v1.2.md` |
| Deployment config | `render.yaml` |
| Deploy env vars | `docs/Deployment Environment Variables.md` |

---

## 9. Bug Fix Reference (Found During E2E, Already Fixed)

These bugs were found and fixed during Sprint 4 E2E testing. Document them in the project report as bugs found during testing. If you encounter them again, they've regressed.

### Bug 1: PIN Hash Mismatch

- **Symptom:** All existing coupon PINs stopped working after JWT secrets were regenerated
- **Root cause:** PINs were HMAC-hashed using `PIN_SECRET`, but the `.env` file had a placeholder value. After generating real JWT secrets, the PIN hashes no longer matched.
- **Fix:** Added dedicated `PIN_SECRET=volunteering-rewards-pin-secret-v1` env var and regenerated all 40 PIN hashes in the database
- **Files:** `backend/src/services/rewards.service.js`, `backend/.env`

### Bug 2: Missing `points_ledger` Table

- **Symptom:** Redemption API returned `201` but the coupon was not actually marked as redeemed and points were not deducted
- **Root cause:** `rewards.service.js:redeemReward()` inserts into a `points_ledger` table that did not exist. The INSERT caused a silent transaction rollback before COMMIT, so the `201` response was sent before the error was caught.
- **Fix:** Created migration `023_create_points_ledger.sql`
- **Files:** `backend/migrations/023_create_points_ledger.sql`

### Bug 3: Missing `points_spent` Column in Merchant Routes

- **Symptom:** Merchant `redeemCoupon()` and `reverseRedemption()` failed with NOT NULL constraint errors
- **Root cause:** SQL queries selected `points_required` from the coupon but never passed it as `points_spent` in the INSERT statement
- **Fix:** Updated SQL to include `c.points_required` and `c.value_cents` in SELECT, and `points_spent` in the INSERT
- **Files:** `backend/src/services/merchant.service.js`

### Bug 4: `start_time` Column Alias

- **Symptom:** Performance test failed on `events.controller.js` — column `event_date` not found
- **Root cause:** Some queries used `event_date` as column name, but the database column is `start_time`
- **Fix:** Aliased `start_time AS event_date` in the relevant query
- **Files:** `backend/src/controllers/events.controller.js`

---

## 10. Jira Update

Xon will prepare a final Jira update at Sprint 4 end (29 Jun). If you complete your tasks early, let Xon know so he can update the board. The current Jira update (v7, 16 Jun) is in `docs/Jira Update v7 — 16 Jun 2026.md`.
