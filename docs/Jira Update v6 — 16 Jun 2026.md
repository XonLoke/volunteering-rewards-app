# Jira Update Instructions — Sprint 3 Completion

**Date:** 16 June 2026  
**From:** Xon  
**To:** Hermes (Jira Admin)  
**Sprint:** Sprint 3 (25 May – 15 Jun 2026)  
**Status:** DELIVERED ✅

---

## Instructions

Please update Jira with the following changes. All Sprint 3 tasks should be marked as **Done**. Any tasks not explicitly listed here should remain at their current status.

---

## Section A: Mark All Sprint 3 Tasks as Done

Set the following fields for every Sprint 3 task:
- **Status** → Done
- **Resolution** → Completed
- **Assignee** → as indicated in the tables below

---

## Section B: Backend Services

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Fix 6 backend stubs (events/today, categories, roster, stats, feedback, Q&A) | Xon | Done — 12 Jun |
| *(use existing key)* | Create Migration 022: user_settings table | Xon | Done — 12 Jun |
| *(use existing key)* | Install nodemailer for email service | Xon | Done — 12 Jun |
| *(use existing key)* | Integrate Vivian's settings & contact routes into backend/src/ | Xon | Done — 12 Jun |

---

## Section C: Web Portals

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Admin Portal — wire Dashboard, Users, Events, Coupons, Redemptions pages | Xon | Done — 10 Jun |
| *(use existing key)* | Admin Portal — Coupon PIN View Modal with Active/Depleted/All filter | Xon | Done — 10 Jun |
| *(use existing key)* | Admin Portal — Redemption History overhaul (sortable, date filter, value snapshot) | Xon | Done — 10 Jun |
| *(use existing key)* | Admin Portal — User List sorted by role | Xon | Done — 10 Jun |
| *(use existing key)* | Organiser Portal — Dashboard, Events, EventCreate, EventEdit, Roster, Feedback, Q&A, OnsiteController | Xon + Nurain | Done — 12 Jun |
| *(use existing key)* | Merchant Portal — PinVerify UI (833 lines, PIN verify/redeem/undo) | Grace | Done — 10 Jun |
| *(use existing key)* | Merchant Portal — Redemption History page (544 lines) | Grace | Done — 10 Jun |
| *(use existing key)* | Merchant Portal — Merchant Login page | Grace | Done — 10 Jun |

---

## Section D: PWA Tasks

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Install and configure vite-plugin-pwa for React/Vite frontend | Xon | Done — 12 Jun |
| *(use existing key)* | Configure PWA manifest, service worker, and workbox caching in vite.config.js | Xon | Done — 12 Jun |
| *(use existing key)* | Generate PWA install icons (192x192 and 512x512) | Grace + Xon | Done — 12 Jun |
| *(use existing key)* | Create PWA entry routes for Scan and Merchant with standalone layouts | Xon | Done — 12 Jun |
| *(use existing key)* | Implement QR Camera Scanner with html5-qrcode, camera toggle, manual fallback | Xon | Done — 12 Jun |
| *(use existing key)* | Verify Merchant Portal uses real API calls (no mock data) | Xon | Done — 12 Jun |

---

## Section E: Additional Features (F1-F4)

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | F1: AI Event Recommendations — backend + app/ai-recommendations.tsx | Xon + Vivian | Done — 10 Jun |
| *(use existing key)* | F2: AI Feedback Summarizer — lexicon-based sentiment analysis on Feedback.jsx | Xon | Done — 10 Jun |
| *(use existing key)* | F3: Volunteer Sponsorship Program — multi-level referral system | Xon | Done — 10 Jun |
| *(use existing key)* | F4: Hall of Fame Leaderboard — backend + app/hall-of-fame.tsx | Xon + Vivian | Done — 10 Jun |

---

## Section F: Branch Management

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Merge Grace's branch to main (merchant controllers/services/icons) | Xon | Done — 12 Jun |
| *(use existing key)* | Review Nurain's branch for organiser backend additions | Xon | Done — 12 Jun |
| *(use existing key)* | Delete old backend/src/src/ directory | Xon | Done — 12 Jun |

---

## Section G: Testing

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Run unit tests (11/11 passing) | Xon | Done — 12 Jun |
| *(use existing key)* | Run integration tests (34 tests, 3 bugs fixed) | Xon | Done — 12 Jun |
| *(use existing key)* | Run performance tests (8 tests completed) | Xon | Done — 12 Jun |
| *(use existing key)* | Create Test Plan v1.2 (133 test cases across 6 testing types) | Xon | Done — 10 Jun |
| *(use existing key)* | Smoke test after PWA deployment (login, events, leaderboard) | Xon | Done — 12 Jun |

---

## Section H: Update Sprint 4 Backlog

Create or update the following issues for **Sprint 4 (15 Jun – 29 Jun)** :

| Priority | Task | Suggested Assignee | Estimate |
|---|---|---|---|
| 🔴 HIGH | Fix mobile app auth — replace ?user_id=X with JWT Bearer tokens across 8+ screen files | Xon | 5 days |
| 🟡 MEDIUM | Fix mobile app API paths to match backend contract (/api/...) | Xon | 3 days |
| 🟡 MEDIUM | Run full regression test suite | Xon | 2 days |
| 🟢 LOW | Performance load testing | Xon | 1 day |

---

## Notes for Hermes

1. **Git commit for Sprint 3 delivery:** `dc23809` on `origin/main`
2. **Sprint 3 was delivered ahead of the 15 June deadline** — actual completion was 12 June
3. **Nurain pushed additional files on 16 June** but these were in a standalone test directory (my-app-stable/) — no merge into main was needed
4. **All documentation is in** `D:\c3000c\volunteering-rewards-app\docs\`
5. **Key documents for Sprint 3:**
   - Sprint 3 Completion Report v1.0.md
   - Test Plan & Case Spec v1.2.md
   - Sprint Breakdown v7.2.md
