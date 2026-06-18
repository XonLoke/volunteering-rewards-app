# Jira Update Instructions — Sprint 4 Completion (Updated 18 Jun)

**Version:** 8  
**Date:** 18 June 2026  
**From:** Xon  
**To:** Hermes (Jira Admin)  
**Sprint:** Sprint 4 (15 Jun – 29 Jun 2026) — Testing, Hardening & Additional Features  
**Status:** SPRINT 4 CORE DELIVERED ✅ (16 Jun) — Manual testing pending for rest of sprint  

---

## Instructions

Please update Jira with the following changes. This update covers the **Sprint 4 status refresh** after full deployment (Render + Neon + Vercel) and additional work done from 16–18 Jun.

- **Sprint 4 tasks completed since v7** → mark as **Done** per the tables below
- **Sprint 5 completed tasks** → mark as **Done** per the tables below
- **Sprint 5 remaining tasks** → update backlog
- **Set fields:** Status → Done, Resolution → Completed, Assignee → as indicated

---

## Section A: Backend Deployment (Sprint 4→5)

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Deploy backend to Render (Docker web service) | Xon | Done — 16 Jun |
| *(use existing key)* | Create Neon PostgreSQL database (no expiry) | Xon | Done — 16 Jun |
| *(use existing key)* | Add `DB_SSL=true` support for Neon SSL connections | Xon | Done — 16 Jun |
| *(use existing key)* | Fix Docker bcrypt binary mismatch (Windows → Linux Alpine) | Xon | Done — 16 Jun |
| *(use existing key)* | Fix 42P01 bug — wrong database connection (Shell vs web service) | Xon | Done — 16 Jun |
| *(use existing key)* | Fix CORS wildcard + credentials issue ("Failed to fetch") | Xon | Done — 16 Jun |
| *(use existing key)* | Run 23 migrations + seed database on Neon | Xon | Done — 16 Jun |
| *(use existing key)* | Write `docs/Deployment Architecture Report v1.0.md` | Xon | Done — 16 Jun |
| *(use existing key)* | Update deployment report to v1.1 (adds platform comparison tables, Expo section) | Xon | Done — 18 Jun |
| *(use existing key)* | Write `docs/Deployment Checklist v1.0.md` | Xon | Done — 18 Jun |

**Detail:** Backend is live at `https://vol-rewards-api.onrender.com`. Health check returns 200 OK with `db_connected: true`. All 23 migrations run. Seed data loaded (8 users, 3 merchants, 3 coupons, 3 events, sponsorship config).

---

## Section B: Frontend Deployment (Sprint 5)

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Deploy React frontend to Vercel | Xon | Done — 16 Jun |
| *(use existing key)* | Configure SPA rewrites for React Router | Xon | Done — 16 Jun |
| *(use existing key)* | Hardcode production API URL in `api.js` | Xon | Done — 16 Jun |

**Detail:** Frontend is live at `https://webportals-lovat.vercel.app`. All 4 portals accessible: Admin, Organiser, Merchant PWA, Scanner PWA.

---

## Section C: Seed Data Expansion (Sprint 4)

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Expand seed data — 8 users (2 per role), 3 merchants linked to users | Xon | Done — 16 Jun |
| *(use existing key)* | Add coupon value_cents and merchant_name to seed | Xon | Done — 16 Jun |
| *(use existing key)* | Generate 120 coupon PIN hashes for testing | Xon | Done — 16 Jun |
| *(use existing key)* | Fix sponsorship config `max_depth` column error | Xon | Done — 16 Jun |

---

## Section D: Additional Documentation (Sprint 4→5)

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Create `docs/Sprint 4-5 Team Instructions v1.1.md` | Xon | Done — 16 Jun |
| *(use existing key)* | Create `docs/Project Structure Diagram v1.svg` | Xon | Done — 16 Jun |
| *(use existing key)* | Create `docs/Jira Update v7 — 16 Jun 2026.md` | Xon | Done — 16 Jun |
| *(use existing key)* | Create `docs/Manual Operations Guide v1.0.md` | Xon | Done — 16 Jun |
| *(use existing key)* | Create `docs/Deployment Architecture Report v1.1.md` | Xon | Done — 18 Jun |
| *(use existing key)* | Create `docs/Deployment Checklist v1.0.md` | Xon | Done — 18 Jun |
| *(use existing key)* | Create `docs/Sprint 4 & 5 Status Report v1.0.md` | Xon | Done — 18 Jun |

---

## Section E: Automated Testing Results (Sprint 4)

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Unit tests — 11/11 passing | Xon | Done — 16 Jun |
| *(use existing key)* | Performance tests — 17/17, avg 101.7ms | Xon | Done — 16 Jun |
| *(use existing key)* | Security audit — all 4 middleware passed | Xon | Done — 16 Jun |
| *(use existing key)* | E2E test pass — all 4 portals verified | Xon | Done — 16 Jun |

---

## Section F: Team Member Tasks — Still Pending

These tasks remain unassigned/incomplete per the project plan. Update their status or keep in Sprint 4 backlog:

| Issue Key | Summary | Assignee | Status | Notes |
|---|---|---|---|---|
| *(use existing key)* | Integration tests (34 test cases from Test Plan) | Grace | ⬜ Pending | Not yet started |
| *(use existing key)* | System tests (6 E2E workflow tests) | Whole team | ⬜ Pending | Not yet started |
| *(use existing key)* | User Acceptance Tests (8 real-world scenarios) | Whole team | ⬜ Pending | Not yet started |
| *(use existing key)* | Test mobile auth migration on actual device | Vivian | ⬜ Pending | Not yet started |

---

## Section G: Sprint 5 Remaining Backlog

Update the following issues for the remaining Sprint 5 work (29 Jun – 6 Jul):

| Priority | Task | Suggested Assignee | Estimate | Notes |
|---|---|---|---|---|
| 🔴 HIGH | Build and deploy volunteer mobile PWA to Vercel | Xon | 2 days | APK blocked by Expo EAS AGP 8.11 bug — converting to web PWA |
| 🟡 MEDIUM | Project report (from C300 Report Template.docx) | Nurain | 3 days | Test results appendix, architecture, features, contributions |
| 🟡 MEDIUM | Presentation slides | Nurain | 2 days | Architecture, demo, AI features, testing, team contributions |
| 🟢 LOW | User manual — step-by-step for all roles | Nurain | 2 days | Volunteers, organisers, merchants, admins |
| 🟢 LOW | Final README update | Xon | 0.5 day | Add deployment URLs, architecture overview |
| 🟢 LOW | Tag v1.0.0 release on GitHub | Xon | 0.5 day | Tag and release notes |
| 🟡 MEDIUM | Dry-run presentation + team feedback | All | 4 Jul | Rehearsal before final delivery |
| 🔴 HIGH | Final delivery | All | 6 Jul | Hard deadline — presentation, report, demo, deployment |

---

## Section H: Known Issue — Mobile APK Build

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | EAS Build fails due to Expo SDK 54 / AGP 8.11 Gradle bug | Xon | 🔄 Blocked — 5 attempts failed |

**Detail:** Expo's EAS Build consistently fails at the Gradle compilation phase due to a known AGP 8.11 compatibility issue (Expo GitHub issues #42730, #42370). Five attempts were made with various fixes (missing assets, ThemeContext, AGP version pinning) — all failed. Workaround: convert mobile app to web PWA using `react-native-web` and deploy to Vercel.

---

## Notes for Hermes

1. **Sprint 4 core was delivered 13 days early** — all technical work completed by 16 Jun (deadline 29 Jun)
2. **Backend + Frontend fully deployed** — Render (API) + Neon (database) + Vercel (frontend) — zero cost
3. **4 bugs found and fixed** during Sprint 4 E2E testing (PIN hash, points_ledger, points_spent, start_time)
4. **4 additional features (F1-F4)** all built and integrated — AI Recommendations, Feedback Summarizer, Referral Program, Hall of Fame Leaderboard
5. **Mobile APK blocked** by known Expo build infrastructure bug — switching to web PWA as workaround
6. **Team tasks pending:** Integration tests (Grace), System/UAT tests (whole team), Mobile verification (Vivian), Documentation (Nurain)
7. **Deployment costs:** $0/month across all 4 platforms
8. **Key documents:**
   - Sprint 4 & 5 Status Report v1.0.md
   - Deployment Architecture Report v1.1.md
   - Deployment Checklist v1.0.md
   - E2E Test Results v1.0.md
   - Security Audit Report v1.0.md
   - Test Results — Performance v2.0.md
   - Sprint Breakdown v7.2.md
9. **Git status:** Latest commit `188e70f` on `origin/main`
