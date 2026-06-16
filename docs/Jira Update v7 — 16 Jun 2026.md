# Jira Update Instructions — Sprint 4 Completion

**Version:** 7  
**Date:** 16 June 2026  
**From:** Xon  
**To:** Hermes (Jira Admin)  
**Sprint:** Sprint 4 (15 Jun – 29 Jun 2026) — Testing, Hardening & Additional Features  
**Status:** SPRINT 4 FULLY DELIVERED ✅ (completed all tasks 16 Jun, ahead of 29 Jun deadline)

---

## Instructions

Please update Jira with the following changes. This update covers **Sprint 4 completion**. Sprint 3 was already marked done in Jira Update v6.

- **Sprint 4 tasks** → mark as **Done** per the tables below
- **Sprint 5 backlog** → create or update issues per Section H
- **Set fields:** Status → Done, Resolution → Completed, Assignee → as indicated

---

## Section A: Mobile App Auth Fix (Sprint 4 — HIGH Priority)

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Create shared mobile API helper `app/api.ts` with JWT Bearer auth | Xon | Done — 16 Jun |
| *(use existing key)* | Migrate all 26 mobile Expo screens from `?user_id=X` query params to JWT Bearer token auth | Xon | Done — 16 Jun |
| *(use existing key)* | Verify mobile API paths all use `/api/` prefix (no mismatches) | Xon | Done — 16 Jun — all already correct |

**Detail:** Created `app/api.ts` with `apiGet`/`apiPost`/`apiPut`/`apiDelete`/`apiUpload` helpers that automatically read JWT token from AsyncStorage and attach `Authorization: Bearer <token>` header. All 26 screen files updated to use the helper instead of raw `fetch()` with `?user_id=` parameters. Login flow already stored the JWT — the infrastructure was there but screens weren't using it.

---

## Section B: Testing — Regression & Performance

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Run unit regression tests (11/11 passing) | Xon | Done — 16 Jun |
| *(use existing key)* | Run performance load tests (17/17 tests, avg 101.7ms response time) | Xon | Done — 16 Jun |
| *(use existing key)* | Create performance test runner `backend/tests/performance/perf_test.js` | Xon | Done — 16 Jun |
| *(use existing key)* | Document performance results in `docs/Test Results — Performance v2.0.md` | Xon | Done — 16 Jun |

**Performance results:**
| Metric | Value |
|--------|-------|
| Tests run | 17 |
| Passed | 17 |
| Failed | 0 (1 bug fixed during testing — see Section F) |
| Overall avg response time | **101.7ms** |
| Fastest request | **3.9ms** (Health Check) |
| Concurrent avg (10x load) | **99.1ms** |

---

## Section C: Deployment Preparation

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Create `render.yaml` deployment blueprint (web + database services) | Xon | Done — 16 Jun |
| *(use existing key)* | Document all production environment variables | Xon | Done — 16 Jun |
| *(use existing key)* | Review Dockerfile for production readiness | Xon | Done — 16 Jun |
| *(use existing key)* | Document env vars in `docs/Deployment Environment Variables.md` | Xon | Done — 16 Jun |

**Note:** Deployment to Render is ready to go — code is pushed to GitHub (`origin/main`). Manual Render setup steps remain (connect repo, set env vars, run migrations).

---

## Section D: Security Audit

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Review auth middleware — JWT verification flow | Xon | Done — 16 Jun — Secure |
| *(use existing key)* | Review role middleware — role-based access guards | Xon | Done — 16 Jun — Secure |
| *(use existing key)* | Review rate limiter — global (100/15min), login (10/min), register (5/min) | Xon | Done — 16 Jun — Secure |
| *(use existing key)* | Review error handler — no sensitive data leaks in production | Xon | Done — 16 Jun — Secure |
| *(use existing key)* | Replace placeholder JWT secrets with generated cryptographic secrets | Xon | Done — 16 Jun |
| *(use existing key)* | Create `docs/Security Audit Report v1.0.md` | Xon | Done — 16 Jun |

---

## Section E: End-to-End Testing

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Run End-to-End test pass on all 4 portals | Xon | Done — 16 Jun |
| *(use existing key)* | Document E2E results in `docs/E2E Test Results v1.0.md` | Xon | Done — 16 Jun |

**E2E Results:**
| Portal | Result |
|--------|--------|
| Admin Portal (carol@test.com) | ✅ Pass — Users, coupons, redemptions all functional |
| Organiser Portal (johnny@test.com) | ✅ Pass — Dashboard, events, roster, QR scan, feedback all work |
| Merchant Portal (cheryl@test.com) | ✅ Pass — PIN verify, redeem, reverse, history all work |
| Volunteer Mobile (alice@test.com) | ✅ Pass — Browse events, register, check-in, redeem rewards, leaderboard all work |

**Overall:** ✅ All 4 portals pass. **Ready for deployment.**

---

## Section F: Bugs Found & Fixed During Sprint 4 Testing

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | **Bug: PIN hash mismatch** — JWT secret rotation broke all 40 coupon PIN hashes because PIN_SECRET was a placeholder. Added dedicated `PIN_SECRET` env var and regenerated all PIN hashes. | Xon | Fixed — 16 Jun |
| *(use existing key)* | **Bug: Missing `points_ledger` table** — `rewards.service.js:redeemReward()` inserted into a non-existent table inside a PG transaction, causing silent rollback. Redemption returned 201 but didn't actually work. Created migration `023_create_points_ledger.sql`. | Xon | Fixed — 16 Jun |
| *(use existing key)* | **Bug: Missing `points_spent` column in merchant routes** — `merchant.service.js:redeemCoupon()` and `reverseRedemption()` didn't include `points_required` from the coupon query, causing NOT NULL constraint failure. Fixed SQL to include `c.points_required` and `c.value_cents`. | Xon | Fixed — 16 Jun |
| *(use existing key)* | **Bug: `start_time` column alias** — `events.controller.js` used `event_date` in some queries but the DB column is `start_time`. Aliased `start_time AS event_date`. | Xon | Fixed — 16 Jun |

---

## Section G: Sprint 4 New Files Created

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Create `app/api.ts` — Shared JWT API helper for mobile app | Xon | Done — 16 Jun |
| *(use existing key)* | Create `render.yaml` — Render deployment blueprint | Xon | Done — 16 Jun |
| *(use existing key)* | Create `backend/migrations/023_create_points_ledger.sql` | Xon | Done — 16 Jun |
| *(use existing key)* | Create `backend/tests/performance/perf_test.js` — Performance test runner | Xon | Done — 16 Jun |
| *(use existing key)* | Create `docs/E2E Test Results v1.0.md` | Xon | Done — 16 Jun |
| *(use existing key)* | Create `docs/Security Audit Report v1.0.md` | Xon | Done — 16 Jun |
| *(use existing key)* | Create `docs/Test Results — Performance v2.0.md` | Xon | Done — 16 Jun |
| *(use existing key)* | Create `docs/Deployment Environment Variables.md` | Xon | Done — 16 Jun |
| *(use existing key)* | Create `docs/Sprint 4-5 Team Instructions v1.0.docx` | Xon | Done — 16 Jun |

---

## Section H: Create Sprint 5 Backlog

Create or update the following issues for **Sprint 5 (29 Jun – 6 Jul 2026)** — Deployment & Delivery:

| Priority | Task | Suggested Assignee | Estimate | Notes |
|---|---|---|---|---|
| 🔴 HIGH | Deploy backend to Render (web service + PostgreSQL + env vars + migrations) | Xon | 1 day | Code pushed to GitHub. Manual Render setup needed. |
| 🟡 MEDIUM | Deploy frontend to Vercel (admin + organiser + merchant PWAs) | Grace | 1 day | Vite build, set VITE_API_URL env var |
| 🟡 MEDIUM | Project report (from C300 Report Template.docx) — architecture, test results, features, contributions | Nurain | 3 days | Use docs in this Jira update as reference |
| 🟡 MEDIUM | Presentation slides — architecture, demo, AI features, test results, team contributions | Nurain | 2 days | |
| 🟢 LOW | User manual — step-by-step for volunteers, organisers, merchants, admins | Nurain | 2 days | |
| 🟡 MEDIUM | Dry-run presentation + team feedback | All | 4 Jul 2026 | |
| 🔴 HIGH | Final delivery — presentation, report, demo, deployment | All | 6 Jul 2026 | Hard deadline |

---

## Notes for Hermes

1. **Sprint 4 was completed ahead of the 29 June deadline** — all tasks finished on 16 June
2. **Sprint 4 was done by Xon alone** — Claude Desktop Code (Project) executed all tasks in a single session
3. **The mobile auth fix was the most impactful task** — all 26 screens migrated from `?user_id=X` to proper JWT Bearer auth
4. **4 bugs found and fixed** during Sprint 4 testing (see Section F) — these should be documented in the project report
5. **Deployment to Render is the only remaining manual step for Xon** — code is ready
6. **Sprint 5 assignments differ from Sprint 4:**
   - Nurain takes lead on documentation (report, slides, manual)
   - Grace handles frontend deployment to Vercel
   - Xon handles backend deployment + final E2E
7. **All documentation is in** `D:\c3000c\volunteering-rewards-app\docs\`
8. **Key documents for Sprint 4:**
   - E2E Test Results v1.0.md
   - Security Audit Report v1.0.md
   - Test Results — Performance v2.0.md
   - Deployment Environment Variables.md
   - Sprint 4-5 Team Instructions v1.0.docx
9. **Git status:** Latest commit pushed to `origin/main` on 16 Jun 2026 — includes both Sprint 3 and Sprint 4 work
