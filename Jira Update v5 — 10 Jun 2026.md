# Jira Update v5 — For Hermes

**Version:** 5.0  
**Date:** 10 June 2026  
**Board:** https://fengshui0011.atlassian.net/jira/software/projects/KAN/list  

---

## Instructions for Hermes

Please update the Jira board with the following:

---

## 1. Mark These as Done

| Key | Summary | Notes |
|-----|---------|-------|
| — | Bug Fix: Organiser role name spelling | Changed `organizer` → `organiser` in all queries to match DB |
| — | Bug Fix: User sort by role | Users now sorted Admin → Organiser → Merchant → Volunteer |
| — | Bug Fix: Events query column | `start_time` → `event_date` (column didn't exist in DB) |
| — | Bug Fix: RedeemReward arguments | Controller/service argument order mismatch fixed |
| — | Bug Fix: Duplicate scan rejection | `POST /api/attendance/scan` now returns 409 for duplicates |
| — | Bug Fix: Bob's role restored | Bob was changed to volunteer during testing, restored to organiser |
| — | Bug Fix: Test data cleanup | Deleted 5 test users, 9 test events, duplicate organisations |
| — | Test Plan updated to v1.2 | Expanded from 92 to 133 test cases — added F1-F4 feature tests, 25 manual test cases, 5 regression tests |
| — | Full test suite executed | 55/62 pass (11 unit, 29 integration, 9 smoke, 6 performance) |
| — | Project Status Report v1.0 | Complete change log document created |
| — | Smoke test script fixed | `grep` expected `"events"` key, was looking for wrong field |

---

## 2. No Change — Still Pending

| Item | Status | Notes |
|------|--------|-------|
| Manual Testing — Volunteer Mobile App | ⬜ Pending | Need to run Expo app and test all screens |
| Manual Testing — Cashier Merchant App | ⬜ Pending | Need to test PIN verify, redeem, history |
| Manual Testing — Organiser QR Scanner | ⬜ Pending | Need to scan volunteer QR for attendance |
| Manual Testing — Admin Portal UI | ⬜ Pending | Extended E2E testing beyond API calls |
| Sprint 5 — Deployment, Security, Report | ⬜ Pending (29 Jun) | Backend deployment, final E2E, security audit, report, slides |
