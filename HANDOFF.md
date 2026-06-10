# Handoff: Full Project Takeover

**Handoff ID:** HO-20260610-001  
**Date:** 10 June 2026  
**From:** Cowork (Xon's AI — planning/analysis)  
**To:** Claude Desktop Code (execution)  
**Project:** Volunteering Rewards App (C3000C)  
**Location:** `D:\c3000c\volunteering-rewards-app`  
**Repo:** https://github.com/XonLoke/volunteering-rewards-app  
**Owner:** Xon (sole developer for all additional features)

---

## Project Overview

A volunteering rewards platform where volunteers earn points by attending events and redeem them for merchant-sponsored coupon rewards with 6-digit PINs.

| Portal | Tech | Location |
|--------|------|----------|
| Volunteer Mobile App | Expo / React Native | `app/` |
| Admin Web Portal | React + Vite | `frontend/web_portals/` |
| Organiser Web Portal | React + Vite | `frontend/web_portals/` |
| Merchant Cashier PWA | React + Vite | `frontend/web_portals/` |
| Backend API | Node.js / Express | `backend/` |
| Database | PostgreSQL 16 | localhost:5432 |

**Team:** 4 human (Xon, Vivian, Grace, Nurain) + 3 virtual teammates (backup)  
**Supervisor:** Andy

---

## How to Run

```bash
# Terminal 1: Backend
cd D:\c3000c\volunteering-rewards-app\backend
npm run dev

# Terminal 2: Admin/Oragniser/Merchant web portal
cd D:\c3000c\volunteering-rewards-app\frontend\web_portals
npm run dev

# Terminal 3: Mobile app
cd D:\c3000c\volunteering-rewards-app
npx expo start
```

---

## Database

| Field | Value |
|-------|-------|
| Host | localhost:5432 |
| Database | `volunteering_rewards` |
| User | `postgres` |
| Password | `9663` |

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Organiser | johnny@test.com | password123 |
| Organiser | ellen@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Merchant | cheryl@test.com | password123 |

---

## What's Already Built (Complete)

### Sprint 3 — Admin Portal (All Done ✅)

| Feature | Details |
|---------|---------|
| Coupon Real-Time Value | Formula: `Math.round(value_cents × ppd ÷ 100)`. Always overrides stored value. |
| Coupon PIN View Modal | Click "PINs" button → shows all PINs in table |
| Coupon Filter by Status | Active / Depleted / All filter chips |
| Redemption History | Sortable columns, date range filter, clickable user names, 7 per page |
| Value Snapshot | `value_cents` frozen in `redemption_logs` at redemption time |
| Rewards Config | Persistent save, real-time impact on coupon display |
| User Sort Order | Admin → Organiser → Merchant → Volunteer |
| Organiser Contact Email Fix | Field alias mismatch fixed |
| Role Name Fix | `organizer` → `organiser` (DB has 's', queries now match) |

### Additional Features F1–F4 (All Done ✅)

| Feature | Backend | Frontend | Type |
|---------|---------|----------|------|
| **F1:** AI Event Recommendations | `GET /api/events/recommended`, `GET /api/events/popular` | `app/ai-recommendations.tsx` (by Vivian) | Content-based filtering |
| **F2:** AI Feedback Summarizer | `GET /api/events/:id/feedback/summary` | AI Summary card on organiser Feedback.jsx | Lexicon-based sentiment analysis |
| **F3:** Volunteer Sponsorship | `GET /api/me/sponsorship-profile`, config via admin panel | `app/referral.tsx` + admin SponsorshipConfig.jsx | Email-based multi-level sponsorship |
| **F4:** Hall of Fame Leaderboard | `GET /api/leaderboard`, `/points`, `/events`, `/checkins`, `/redeemed` | `app/hall-of-fame.tsx` (by Vivian) | SQL ranking queries |

### Testing (All Done ✅)

| Test Type | Count | Result |
|-----------|-------|--------|
| Unit Tests | 11 | ✅ 11/11 pass |
| Integration Tests | 34 | ✅ 29 pass, 3 bugs fixed, 2 skipped |
| Performance Tests | 8 | ✅ 6 pass, 2 fail (caused by now-fixed bugs) |
| Test Cases Documented | 92 | In `docs/Test Plan & Case Spec v1.1.md` |

### Bug Fixes Applied ✅

- `start_time` → `event_date` in events query
- `redeemReward` argument order fixed
- Duplicate scan now rejected with 409
- Role name `organizer` → `organiser` everywhere
- User sort order by role hierarchy
- Test data cleaned up
- `max_depth` removed from sponsorship config

---

## Documents Created (with Version Numbers)

| Document | Version | Purpose |
|----------|---------|---------|
| `Sprint Breakdown v7.2.md` | v7.2 | Final sprint schedule |
| `Additional Features Proposal v1.2.md` | v1.2 | Approved feature proposals |
| `Test Plan & Case Spec v1.1.md` | v1.1 | 92 test cases (in `docs/`) |
| `Test Report — Unit Tests (Sprint 3) v1.0.md` | v1.0 | Unit test results (in `docs/`) |
| `Test Results — Integration Tests.md` | v1.0 | 34 IT results (in `docs/`) |
| `Test Results — Performance Tests.md` | v1.0 | 8 PT results (in `docs/`) |
| `Testing Guide — Step by Step v1.1.md` | v1.1 | Team test instructions (in `docs/`) |
| `Sprint 3 Status Report v1.1.md` | v1.1 | Sprint 3 status |
| `Jira Amendment List v1.2.md` | v1.2 | For Hermes to update Jira |
| `Jira Update v4 — 8 Jun 2026.md` | v4.0 | Latest Jira update |
| `Project Status Report v1.0.md` | v1.0 | Complete status report |

---

## API Reference — All Endpoints

### Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | None |
| POST | `/api/auth/login` | None |
| POST | `/api/auth/refresh` | None |
| GET | `/api/auth/me` | Any |
| PUT | `/api/auth/me` | Any |

### Events
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/events` | Volunteer |
| GET | `/api/events/recommended` | Volunteer |
| GET | `/api/events/popular` | Volunteer |
| GET | `/api/events/categories` | Volunteer |
| GET | `/api/events/today` | Organiser |
| GET | `/api/events/:id` | Volunteer |
| POST | `/api/events/:id/register` | Volunteer |
| DELETE | `/api/events/:id/register` | Volunteer |
| GET | `/api/events/:id/feedback/summary` | Any |
| GET | `/api/events/:id/roster` | Organiser |
| GET | `/api/events/:id/stats` | Organiser |

### Admin
| Method | Endpoint |
|--------|----------|
| GET | `/api/admin/dashboard` |
| GET/PUT | `/api/admin/users/:id` |
| GET | `/api/admin/users/:id` |
| GET/PUT | `/api/admin/organisers/:id/approve` |
| GET/DELETE | `/api/admin/events/:id` |
| GET/POST/PUT/DELETE | `/api/admin/coupons/:id` |
| GET | `/api/admin/coupons/:id/pins` |
| GET/PUT | `/api/admin/rewards/configuration` |
| GET/PUT | `/api/admin/sponsorship/configuration` |
| GET | `/api/admin/redemptions` |
| POST | `/api/admin/redemptions/cleanup` |
| GET/POST | `/api/admin/merchants` |
| GET/POST | `/api/admin/merchants/prospects` |

### Organiser
| Method | Endpoint |
|--------|----------|
| GET | `/api/organiser/dashboard` |
| GET/POST/PUT/DELETE | `/api/organiser/events/:id` |
| GET | `/api/organiser/events/:id/roster` |
| GET | `/api/organiser/events/:id/feedback` |
| GET/POST | `/api/organiser/events/:id/qna` |

### Volunteer (Me)
| Method | Endpoint |
|--------|----------|
| GET | `/api/me/events` |
| GET | `/api/me/points` |
| GET | `/api/me/coupons` |
| GET | `/api/me/qr-code` |
| GET | `/api/me/favorites` |
| GET | `/api/me/sponsorship-profile` |

### Rewards
| Method | Endpoint |
|--------|----------|
| GET | `/api/rewards` |
| GET/POST | `/api/rewards/:id` |

### Merchant
| Method | Endpoint |
|--------|----------|
| POST | `/api/coupons/verify` |
| POST | `/api/coupons/redeem` |
| POST | `/api/coupons/reverse` |
| GET | `/api/merchant/history` |

### Attendance
| Method | Endpoint |
|--------|----------|
| POST | `/api/attendance/scan` |
| POST | `/api/attendance/batch` |

### Leaderboard
| Method | Endpoint |
|--------|----------|
| GET | `/api/leaderboard` |
| GET | `/api/leaderboard/points` |
| GET | `/api/leaderboard/events` |
| GET | `/api/leaderboard/checkins` |
| GET | `/api/leaderboard/redeemed` |

---

## Tasks for Claude Desktop Code

### Priority Order

Work through these in order. Commit and push after each batch.

---

### Task 1: Push All Pending Changes to GitHub

**What to do:**
1. Check git status — there are uncommitted changes
2. `git add -A`
3. `git commit -m "Latest updates: F3 redesign, bug fixes, status report"`
4. `git push origin main`

**Acceptance:** All changes pushed to `origin/main`.

---

### Task 2: Verify Everything Still Works After Push

**What to do:**
1. Restart backend: `cd backend && npm run dev` (in separate terminal)
2. Run unit tests: `cd backend && npm test`
3. Login as admin and test key APIs:
   - `POST /api/auth/login` with carol@test.com
   - `GET /api/admin/dashboard`
   - `GET /api/events/recommended`
   - `GET /api/leaderboard`
   - `GET /api/me/sponsorship-profile`

**Acceptance:** All 11 unit tests pass. All 5 APIs return valid data.

---

### Task 3: Run Full Test Suite & Report

**What to do:**
1. Run integration smoke test: `bash tests/integration/smoke_test.sh`
2. Run all unit tests: `npm test`
3. Record results in `docs/Test Results — Final Suite.md`

**Acceptance:** Test results documented with pass/fail counts.

---

### Task 4: Sprint 5 — Backend Deployment Preparation

**When it's time (29 Jun – 6 Jul):**
1. Verify `.env.example` has all required variables
2. Ensure `Dockerfile` and `docker-compose.yml` are up to date
3. Test production build: `cd frontend/web_portals && npm run build`
4. Check for any hardcoded localhost URLs that need changing
5. Document deployment steps in README

**Acceptance:** Backend ready for Render/Railway deployment.

---

### Task 5: Sprint 5 — Security Audit (if Vivian doesn't deliver)

**What to do:**
1. Search for hardcoded secrets in codebase
2. Verify all auth endpoints have role guards
3. Check rate limiting is active on auth routes
4. Verify password hashes are never returned in API responses

**Acceptance:** Report generated in `docs/Security Audit.md`.

---

### Task 6: Sprint 5 — Final E2E Test Pass (if Grace doesn't deliver)

**What to do:**
1. Follow the system tests (ST-01 to ST-04) from `Test Plan & Case Spec v1.1.md`
2. Execute full volunteer journey: register → browse → join → scan → earn → redeem
3. Execute full admin journey: login → approve → create coupons → view redemptions
4. Execute full merchant journey: login → verify PIN → redeem → view history

**Acceptance:** All 4 end-to-end workflows verified and documented.

---

## Technical Context

### Auth Pattern (for all API calls)
```javascript
// Login
const res = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
const token = data.token;
```

### Admin/Oragniser/Merchant Web Pattern
```javascript
import { apiGet, apiPost, apiPut, apiDel } from '../../services/api';
const result = await apiGet('/admin/dashboard');
```

### Mobile App Pattern
```typescript
const stored = await AsyncStorage.getItem("user");
const user = JSON.parse(stored);
const resp = await fetch(`${BASE_URL}/path`, {
  headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
});
```

---

## Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| F1/F2/F4 frontends built by Vivian may need integration with live APIs | ⚠️ Verify | `app/ai-recommendations.tsx`, `app/hall-of-fame.tsx` — built 9 Jun, check they call the right endpoints |
| F2 frontend on organiser Feedback.jsx calls `GET /api/events/:id/feedback/summary` | ✅ Built | Uses new route mounted at `/api/events` |
| F3 frontend (`app/referral.tsx`) rewritten for email-based sponsorship | ✅ Done | Calls `GET /api/me/sponsorship-profile` |
| Bob's role was restored to organiser | ✅ Fixed | Was changed during testing |
| Test users cleaned up | ✅ Done | IDs 39-43, 5 deleted (one `test@test.com` may remain) |
| Test events cleaned up | ✅ Done | IDs 32-40 deleted |
| Duplicate organisations for bob@test.com | ✅ Cleaned | Only 1 remains |
| VM (Linux workspace) frequently crashes | ⚠️ Known | Code runs on Windows directly — no issue |
| GitHub blocked from Cowork | ⚠️ Known | Code can access GitHub directly |

---

## Quick Do's and Don'ts

| Do | Don't |
|----|-------|
| Push changes to `origin/main` | Don't force push |
| Run `npm test` before pushing | Don't push broken code |
| Keep version numbers in filenames | Don't create unversioned docs |
| Ask Xon if you're unsure | Don't delete team members' branches |

---

## Status Tracking

Update this table as you complete tasks.

| Task | Status | Notes |
|------|--------|-------|
| T1: Push pending changes | ⬜ Pending | |
| T2: Verify everything works | ⬜ Pending | |
| T3: Run full test suite | ⬜ Pending | |
| T4: Backend deployment prep | ⬜ Pending (29 Jun) | |
| T5: Security audit | ⬜ Pending (29 Jun) | |
| T6: Final E2E test pass | ⬜ Pending (29 Jun) | |

---

## Final Notes for Code

1. **Start by pushing pending changes** — there are uncommitted file edits from the last Cowork session
2. **Run the tests** to verify nothing is broken after push
3. **Read these key docs** for full context:
   - `Project Status Report v1.0.md` — Complete change log
   - `Sprint Breakdown v7.2.md` — Sprint schedule
   - `Test Plan & Case Spec v1.1.md` — Full test plan
4. **If anything fails**, fix it, commit, push, and update this status table
5. **Xon will come back** to check progress. Make sure this file is up to date when he does.

Good luck!
