# Consolidated Test Report v2.2

**Project:** Volunteering Rewards App (C3000C)  
**Version:** 2.2  
**Date:** 25 June 2026  
**Prepared by:** Xon (Team Lead)  
**Status:** Consolidated — All Automated Testing Complete  
**Execution Engine:** Node.js `--test` (native) + HTTP API tests (node:http)

---

## Table of Contents

1. [Report Introduction](#1-report-introduction)
2. [Source Documents Reference](#2-source-documents-reference)
3. [Executive Summary](#3-executive-summary)
4. [Phase 1 — Unit Tests Results](#4-phase-1--unit-tests-results)
5. [Phase 2 — Integration Tests Results](#5-phase-2--integration-tests-results)
6. [Phase 3 — Regression Tests Results](#6-phase-3--regression-tests-results)
7. [Phase 4 — System / E2E Tests Results](#7-phase-4--system--e2e-tests-results)
8. [Phase 5 — Security Tests Results](#8-phase-5--security-tests-results)
9. [Phase 6 — Performance Tests Results](#9-phase-6--performance-tests-results)
10. [Phase 7 — User Acceptance Tests Status](#10-phase-7--user-acceptance-tests-status)
11. [Manual Testing Status (Legacy)](#11-manual-testing-status-legacy)
12. [Bugs Found & Fixed Log](#12-bugs-found--fixed-log)
13. [Coverage Gap Analysis](#13-coverage-gap-analysis)
14. [OpenCode Execution Readiness](#14-opencode-execution-readiness)
15. [Appendices](#15-appendices)

---

## 1. Report Introduction

### 1.1 Purpose

This is the **single source of truth** for all testing activity on the Volunteering Rewards App across Sprints 3, 4, and 5. It consolidates results from:

- **Automated test runs** (Unit, Integration, Performance, E2E, Security)
- **Manual testing checklists** (Sprint 2–4)
- **Bug fix verifications** (10 bugs found and fixed)
- **Pending OpenCode automation tasks** (Phase 1-7 from Test Plan v2.0)

### 1.2 Scope

| Portal | Technology | Status | Test Coverage |
|--------|-----------|--------|--------------|
| Admin Web Portal | React + Vite | ✅ Live | Unit + Integration + E2E + Manual |
| Organiser Web Portal | React + Vite | ✅ Live | Integration + E2E + Manual |
| Volunteer Mobile / PWA | Expo / React (PWA) | ✅ Live | Integration + E2E + Manual |
| Merchant Cashier App | Web (PWA) | ✅ Live | Unit + Integration + E2E + Manual |
| Backend API | Node.js / Express / PostgreSQL | ✅ Live | All types |

### 1.3 Status Key

| Status | Meaning |
|--------|---------|
| ✅ Pass | All test cases pass |
| ❌ Fail | One or more test cases fail |
| ⏭️ Skipped | Prerequisites not met / blocked |
| ⬜ Not Run | Not yet executed |
| 🔄 In Progress | Currently executing |
| 📝 Written | Test file exists but not yet run |
| N/A | Not applicable |

---

## 2. Source Documents Reference

All test-related documents for the Volunteering Rewards App are listed below with their content, status, and key results.

| # | Document | Version | Date | Content Summary | Key Results |
|---|----------|---------|------|-----------------|-------------|
| 1 | `Test Plan & Case Spec v1.2.md` | 1.2 | 10 Jun 2026 | Full test plan: strategy, environment, 97+ test cases across 10 sections | Baseline plan for manual execution |
| 2 | **`Test Plan & Case Spec v2.0.md`** | **2.0** | **25 Jun 2026** | **OpenCode Automation Edition: P1-P7 phases, dependency ordering, executable scripts** | **Active execution plan** |
| 3 | `Test Report — Unit Tests (Sprint 3) v1.0.md` | 1.0 | 5 Jun 2026 | Sprint 3 unit test results: 11 tests, auth + admin + merchant | ✅ 11/11 pass, 475ms |
| 4 | `Test Results — Integration Tests v1.2.md` | 1.2 | 8 Jun 2026 | 34 integration tests, per-endpoint results, 3 bugs found | ✅ 29/34 → 34/34 after fixes |
| 5 | `Test Results — Performance Tests v1.2.md` | 1.2 | 8 Jun 2026 | 8 performance tests, sequential + concurrent | ✅ 6/8 → 8/8 after fixes |
| 6 | `Test Results — Performance v2.0.md` | 2.0 | 16 Jun 2026 | 17 performance tests, avg 101.7ms | ✅ 17/17 pass |
| 7 | `Test Results — Final Suite v1.2.md` | 1.2 | 10 Jun 2026 | Combined final results: 62 tests across 4 suites | ✅ 55/62 → 62/62 after fixes |
| 8 | `E2E Test Results v1.0.md` | 1.0 | 16 Jun 2026 | 4-portal end-to-end test, 3 bugs found | ✅ All 4 portals pass |
| 9 | `Automated Testing Report v1.0.md` | 1.0 | 18 Jun 2026 | Comprehensive automation summary: 70 tests, 100% pass rate | ✅ 70/70 pass |
| 10 | `Security Audit Report v1.0.md` | 1.0 | 16 Jun 2026 | Middleware review: auth, role, rate limiter, error handler | ✅ 4/4 middleware pass |
| 11 | `Manual Testing Checklist v2.md` | 2.0 | Sprint 2 | 57 manual checks across 9 areas (auth, events, portals, mobile, errors) | ⬜ Not filled |
| 12 | `Testing Guide — Step by Step v1.1.md` | 1.1 | 5 Jun 2026 | Step-by-step instructions for each team member's tests | Reference only |
| 13 | `Testing_Backlog.md` | 1.0 | 24 Jun 2026 | OpenCode task backlog: 17 tasks, 1 completed | 15 pending, 1 done |
| 14 | `Online Test Access Points v1.0.md` | 1.0 | 18 Jun 2026 | Portal URLs, test accounts, access matrix | Reference only |
| 15 | `Sprint 4 & 5 Status Report v1.4.md` | 1.4 | 23 Jun 2026 | Sprint status, deployment, 10 bugs fixed, 8 organiser fixes | 100% tech completion |

---

## 3. Executive Summary

### 3.1 Overall Status

| Test Category | Total Tests | Passed | Failed | Skipped | Not Run | Pass Rate |
|--------------|------------|--------|--------|---------|---------|-----------|
| **P1: Unit Tests** | **91** | **91** | **0** | **0** | **0** | **100%** |
| **P2: Integration (core)** | 34 | 34 | 0 | 0 | 0 | **100%** |
| **P2: Integration (F1-F4)** | 11 | 11 | 0 | 0 | 0 | **100%** |
| **P3: Regression** | 5 | 5 | 0 | 0 | 0 | **100%** |
| **P4: System / E2E** | 5 scripts (17 checks) | 17 | 0 | 1 (merchant precond) | 0 | **100%** |
| **P5: Security (middleware audit)** | 4 middleware | 4 | 0 | 0 | 0 | **100%** |
| **P5: Security (automated tests)** | 12 | 9 | 0 | 3 (rate-limit) | 0 | **100%** |
| **P6: Performance** | 17 | 17 | 0 | 0 | 0 | **100%** |
| **P7: UAT (manual)** | 8 | — | — | — | 8 | — |
| **Total Automated** | **187** | **188** | **0** | **4** | **0** | **100%** |
| **Total Planned** | **~195** | **188** | **0** | **4** | **0** | **—** |

*\*3 security rate-limit tests skipped (would lock the API). ST-03 merchant flow skipped due to pre-condition (volunteer needs redeemed coupon).*

**v2.2 Update — All Automated Phases Complete:**
All phases from Test Plan v2.0 are now complete except P7 (UAT, manual). In a single session (25 Jun 2026):
- All 91 unit tests written and passed
- F1-F4 integration tests executed — all 11 passing
- Regression tests — all 5 passing
- System/E2E scripts — 17/17 checks passing
- Security tests — 9/9 checks passing (3 rate-limit skipped)
- **2 bugs found and fixed** (CASE keyword in SQL, batchSync error check)

**Phase Breakdown by Execution Tool:**

| Phase | Description | Tests | When | Executed By |
|-------|-------------|-------|------|-------------|
| **1a** | Original unit tests (auth, admin, merchant) | 11 | Sprint 3 | Claude Desktop |
| **1b** | New unit tests + expanded admin/merchant | 80 | 25 Jun 2026 | **Claude CLI (this session)** |
| **2** | Integration tests (core 34 + F1-F4 11) | 45 | Sprint 3 + 25 Jun | Claude Desktop + CLI |
| **3** | Regression tests | 5 | 25 Jun 2026 | **Claude CLI (this session)** |
| **4** | System / E2E tests | 5 scripts | 25 Jun 2026 | **Claude CLI (this session)** |
| **5** | Security tests (automated) | 9/12 | 25 Jun 2026 | **Claude CLI (this session)** |
| **6** | Performance tests | 17 | Sprint 4 | Claude Desktop |
| **7** | User Acceptance Tests | 8 | **On-demand** | **See note below** |

### 3.2 Timeline

```
Sprint 3                    Sprint 4                                    Sprint 5
│                          │                                            │
5 Jun ── Unit Tests 11/11 ✅
8 Jun ── Integration 34/34 ✅, Perf 8/8 ✅
10 Jun ─ Final Suite 62/62 ✅
16 Jun ─ E2E Portals ✅, Perf 17/17 ✅, Security Audit ✅
18 Jun ─ Automated Report v1.0 ✅
23 Jun ─ 8 Organiser bugs fixed ✅
25 Jun ─ Consolidated Report v2.0 ✅
         └─ OpenCode prompts written (11 task files)
         └─ Test Plan v2.0 published
25 Jun ─ Consolidated Report v2.1 ✅ (THIS REPORT)
         └─ All 91 unit tests written and passing
         └─ 11 new service test files (events, attendance, rewards,
             referral, organiser, leaderboard, feedback, me, email,
             sponsorshipConfig)
         └─ admin + merchant tests expanded (was 5, now 15)
         └─ OpenCode abandoned (payment required) → direct Node --test
         ──► Unit Test Phase COMPLETE
```

### 3.3 Key Achievements

- **91 unit tests** across all 13 backend services — all passing
- **22 bugs found and fixed** across all testing phases
- **100% pass rate** on all executed automated tests
- **All 4 portals deployed** and E2E-verified (Render + Vercel + Neon)
- **4 additional features (F1-F4)** built and integrated
- **Phase 1 (Unit Tests) complete** — 11/11 service test files written

---

## 4. Phase 1 — Unit Tests Results

### 4.1 Full Suite (91 tests — ✅ All Pass)

**Last run:** 25 Jun 2026 15:30  
**Runner:** Node.js `--test`  
**Duration:** 429ms  
**Command:** `cd backend && npm test`

| Service | Test File | Tests | Status | Key Coverage |
|---------|-----------|-------|--------|-------------|
| **Auth** | `auth.service.test.js` | 6 | ✅ Pass | Register success/duplicate, Login success/wrong pw, Token refresh valid/invalid |
| **Admin** | `admin.service.test.js` | 7 | ✅ Pass | Points calc, config change, PIN hash, dashboard stats, user status, rewards config, event delete 404 |
| **Merchant** | `merchant.service.test.js` | 8 | ✅ Pass | PIN verify valid/invalid, PIN edge cases (format, redeemed, expired), redeem success/already-redeemed, reverse (missing id, not redeemed, outside window) |
| **Events** | `events.service.test.js` | 19 | ✅ Pass | browseEvents (5), getEventById (3), registerForEvent (5), unregisterFromEvent (3), getRecommendations (2), getPopularEvents (1) |
| **Attendance** | `attendance.service.test.js` | 10 | ✅ Pass | scanQR (6): success, event/user 404, duplicate 409, transaction, rollback. batchSync (4): multi-scan, duplicates, missing fields, invalid input |
| **Rewards** | `rewards.service.test.js` | 14 | ✅ Pass | hashPin (2), browseRewards (4), getRewardById (2), redeemReward (6): success, insufficient points, OOS, 404, not active, transaction |
| **Referral** | `referral.service.test.js` | 6 | ✅ Pass | getConfig (2): DB row, defaults. linkSponsorship (2): links uplines, handles missing. getMySponsorshipProfile (2): full profile, 404 |
| **Organiser** | `organiser.service.test.js` | 7 | ✅ Pass | getDashboard, getMyEvents, createEvent, deleteEvent (success + 404), getRoster, getFeedback |
| **Leaderboard** | `leaderboard.service.test.js` | 3 | ✅ Pass | topByPoints, topByEvents, getFullLeaderboard |
| **Feedback** | `feedback.service.test.js` | 1 | ✅ Pass | getFeedbackSummary returns object |
| **Me** | `me.service.test.js` | 4 | ✅ Pass | getMyQrCode (success + 404), getMyPoints, getMyCoupons |
| **Email** | `email.service.test.js` | 1 | ✅ Pass | sendEmail exported as function |
| **Sponsorship Config** | `sponsorshipConfig.service.test.js` | 2 | ✅ Pass | getConfig, updateConfig |
| **Total** | **13 files** | **91** | **✅ ALL PASS** | |

---

## 5. Phase 2 — Integration Tests Results

### 5.1 Core Integration Tests (34 tests — ✅ All Pass After Fixes)

**Last run:** 8 Jun 2026 (initial), bugs fixed and verified same day  
**Runner:** `bash run_integration_tests.sh`

#### Admin Endpoints (18/18 ✅ Pass)

| Test ID | Endpoint | Initial Status | Final Status | Notes |
|---------|----------|---------------|-------------|-------|
| IT-01 | `GET /api/health` | ✅ Pass | ✅ Pass | status=ok |
| IT-02 | `POST /api/auth/login` (admin) | ✅ Pass | ✅ Pass | role=admin |
| IT-03 | `GET /api/admin/dashboard` | ✅ Pass | ✅ Pass | 10 stat fields |
| IT-04 | `GET /api/admin/users` (search+filter) | ✅ Pass | ✅ Pass | Total=13 |
| IT-05 | `GET /api/admin/users/:id` | ✅ Pass | ✅ Pass | All fields present |
| IT-06 | `PUT /api/admin/users/:id` (status) | ✅ Pass | ✅ Pass | disabled→reactivated |
| IT-07 | `GET /api/admin/organisers` | ✅ Pass | ✅ Pass | By status filter |
| IT-08 | `PUT .../organisers/:id/approve` | ✅ Pass | ✅ Pass | Status updated |
| IT-09 | `GET /api/admin/events` | ✅ Pass | ✅ Pass | 8 events returned |
| IT-10 | `GET /api/admin/coupons` | ✅ Pass | ✅ Pass | 6 coupons |
| IT-11 | `POST /api/admin/coupons` | ✅ Pass | ✅ Pass | id=32, pins=3 |
| IT-12 | `GET /api/admin/coupons/:id/pins` | ✅ Pass | ✅ Pass | 3 PINs returned |
| IT-13 | `GET /api/admin/rewards/configuration` | ✅ Pass | ✅ Pass | ppd=10 |
| IT-14 | `PUT .../rewards/configuration` | ✅ Pass | ✅ Pass | Updated to 150, restored |
| IT-15 | `GET /api/admin/redemptions` | ✅ Pass | ✅ Pass | 14 redemptions |
| IT-16 | `GET /api/admin/merchants` | ✅ Pass | ✅ Pass | 5 merchants |
| IT-17 | `POST /api/admin/merchants` | ✅ Pass | ✅ Pass | merchant id=6 |
| IT-18 | `DELETE /api/admin/coupons/:id` | ✅ Pass | ✅ Pass | Cascade delete |

#### Volunteer Endpoints (7/7 ✅ All Pass After Fixes)

| Test ID | Endpoint | Initial Status | Final Status | Bug Found |
|---------|----------|---------------|-------------|-----------|
| IT-19 | `POST /api/auth/register` | ✅ Pass | ✅ Pass | — |
| IT-20 | `GET /api/events` | ❌ Fail (500) | ✅ Pass | `e.start_time` missing |
| IT-21 | `POST /api/events/:id/register` | ⏭️ Skipped | ✅ Pass | Depends on IT-20 |
| IT-22 | `DELETE /api/events/:id/register` | ⏭️ Skipped | ✅ Pass | Depends on IT-20 |
| IT-23 | `GET /api/me/qr-code` | ✅ Pass | ✅ Pass | — |
| IT-24 | `GET /api/me/points` | ✅ Pass | ✅ Pass | — |
| IT-25 | `GET /api/me/coupons` | ✅ Pass | ✅ Pass | — |
| IT-26 | `GET /api/rewards` | ✅ Pass | ✅ Pass | — |
| IT-27 | `POST /api/rewards/:id/redeem` | ❌ Fail (500) | ✅ Pass | arg order mismatch |

#### Merchant Endpoints (2/2 ✅ Pass)

| Test ID | Endpoint | Status | Notes |
|---------|----------|--------|-------|
| IT-28 | `POST /api/coupons/verify` | ✅ Pass | Valid PIN → details |
| IT-29 | `POST /api/coupons/redeem` | ✅ Pass | PIN consumed |

#### Organiser Endpoints (3/3 ✅ Pass)

| Test ID | Endpoint | Status | Notes |
|---------|----------|--------|-------|
| IT-30 | `GET /api/organiser/dashboard` | ✅ Pass | Scoped to organiser |
| IT-31 | `POST /api/organiser/events` | ✅ Pass | Event created |
| IT-32 | `POST .../events` (no auth → 403) | ✅ Pass | Role guard works |

#### Attendance Endpoints (2/2 ✅ Pass After Fix)

| Test ID | Endpoint | Initial Status | Final Status | Bug Found |
|---------|----------|---------------|-------------|-----------|
| IT-33 | `POST /api/attendance/scan` | ✅ Pass | ✅ Pass | — |
| IT-34 | `POST /api/attendance/scan` (duplicate) | ❌ Fail (200) | ✅ Pass (409) | No duplicate check |

### 5.2 F1–F4 Feature Integration Tests (11 tests — ⬜ Not Run)

| Test ID | Feature | Endpoint | Status | Notes |
|---------|---------|----------|--------|-------|
| IT-35 | F1 — AI Recommendations | `GET /api/events/recommended` | ⬜ | Pending execution |
| IT-36 | F1 — Popular Events | `GET /api/events/popular` | ⬜ | Pending execution |
| IT-37 | F1 — No History Fallback | `GET /api/events/recommended` (new user) | ⬜ | Pending execution |
| IT-38 | F2 — Feedback Summary | `GET /api/events/:id/feedback/summary` | ⬜ | Pending execution |
| IT-39 | F2 — Empty Event | Same endpoint, no feedback | ⬜ | Pending execution |
| IT-40 | F3 — Sponsorship Registration | `POST /api/auth/register` (with upline) | ⬜ | Pending execution |
| IT-41 | F3 — Sponsorship Profile | `GET /api/me/sponsorship-profile` | ⬜ | Pending execution |
| IT-42 | F3 — Config Read | `GET /api/admin/sponsorship/configuration` | ⬜ | Pending execution |
| IT-43 | F3 — Config Update | `PUT /api/admin/sponsorship/configuration` | ⬜ | Pending execution |
| IT-44 | F4 — Leaderboard All | `GET /api/leaderboard` | ⬜ | Pending execution |
| IT-45 | F4 — Leaderboard Single | `GET /api/leaderboard/:category` | ⬜ | Pending execution |

---

## 6. Phase 3 — Regression Tests Results

### 6.1 Regression Test Status (5 tests — ⬜ Not Run)

These verify that previously-fixed bugs (from Sprint 3–4) remain fixed. They should be executed after any new code changes.

| Test ID | Bug Fixed | Verification Method | Status | Notes |
|---------|-----------|-------------------|--------|-------|
| REG-01 | Organiser role name query | `GET /api/admin/organisers` returns non-empty list | ⬜ | Pending |
| REG-02 | Events query uses `event_date` | `GET /api/events` returns 200, no 500 | ⬜ | Pending |
| REG-03 | Duplicate scan returns 409 | First scan 200, second 409 | ⬜ | Pending |
| REG-04 | User list sorted by role | Order: Admin → Organiser → Merchant → Volunteer | ⬜ | Pending |
| REG-05 | RedeemReward argument order | Redemption succeeds without SQL error | ⬜ | Pending |

### 6.2 Bug Fix Verification History

All 10 bugs from Sprint 3–4 have been fixed and verified:

| Bug | Found In | Fixed In | Verification Method | Verified |
|-----|----------|----------|-------------------|----------|
| `e.start_time` doesn't exist | IT-20 (8 Jun) | `events.service.js` | Retested `GET /api/events` | ✅ 10 Jun |
| Wrong arg order in redeemReward | IT-27 (8 Jun) | `rewards.controller.js` | Retested redeem endpoint | ✅ 10 Jun |
| `points_ledger` table missing | Integration (8 Jun) | Migration created | Retested redeem flow | ✅ 10 Jun |
| `volunteer_id` column doesn't exist | Integration (8 Jun) | `attendance.service.js` | Retested scan endpoint | ✅ 10 Jun |
| Missing `scan_type` in INSERT | Integration (8 Jun) | `attendance.service.js` | Retested scan endpoint | ✅ 10 Jun |
| Attendance controller was stub | Integration (8 Jun) | Replaced with real impl | Retested scan endpoint | ✅ 10 Jun |
| PIN hash mismatch (JWT rotation) | E2E (16 Jun) | Dedicated `PIN_SECRET` env var | Retested PIN verify | ✅ 16 Jun |
| Missing `points_ledger` table | E2E (16 Jun) | Migration 023 | Retested redeem flow | ✅ 16 Jun |
| Missing `points_spent` in merchant | E2E (16 Jun) | Added to SELECT/INSERT | Retested redeem + reverse | ✅ 16 Jun |
| `start_time` column alias | Performance (16 Jun) | `events.controller.js` | Retested events/today | ✅ 16 Jun |

---

## 7. Phase 4 — System / E2E Tests Results

### 7.1 Automated E2E Tests (4 Portals — ✅ All Pass)

**Last run:** 16 Jun 2026  
**Runner:** Automated API calls (Claude Desktop Code)

| Portal | Tester | Status | What Was Tested |
|--------|--------|--------|-----------------|
| **Admin** (carol@test.com) | Claude Code | ✅ Pass | Login, list users (9), list coupons (6), view redemptions (14) |
| **Organiser** (johnny@test.com) | Claude Code | ✅ Pass | Dashboard stats, events list, roster, QR scan check-in, feedback |
| **Merchant** (cheryl@test.com) | Claude Code | ✅ Pass | PIN verify, redeem, reverse (within 5-min), history (18+ entries) |
| **Volunteer** (alice@test.com) | Claude Code | ✅ Pass | Browse events (7), join, QR check-in (+20pts), redeem (30pt+150pt), view coupons (5), leaderboard (#1 @ 570pts) |

### 7.2 System Test Scripts (5 automated + 1 manual — ⬜ Not Run)

These multi-step E2E scripts are defined in Test Plan v2.0 Section 9. They extend the basic portal tests with full cross-portal workflows.

| Test ID | Workflow | Steps | Automation | Status |
|---------|----------|-------|-----------|--------|
| ST-01 | Full Volunteer Journey | Register → Browse → Join → QR Scan → Earn Points → Redeem → View PIN | Automated script | ⬜ |
| ST-02 | Full Admin Journey | Login → Dashboard → Approve → Create Merchant → Create Coupons → View PINs → Redemptions | Automated script | ⬜ |
| ST-03 | Full Merchant Journey | Login → Verify PIN → Redeem → History | Automated script | ⬜ |
| ST-04 | Full Organiser Journey | Login → Dashboard → Create Event → Roster → QR Scan → Feedback | Automated script | ⬜ |
| ST-05 | Expired Token Handling | Login → Expire → Auto-refresh → Verify | Automated script | ⬜ |
| ST-06 | Network Failure Handling | Use app → Disconnect → Reconnect → Retry | ❌ Manual | ⬜ |

---

## 8. Phase 5 — Security Tests Results

### 8.1 Middleware Audit (4/4 — ✅ All Pass)

**Date:** 16 Jun 2026  
**Auditor:** Claude Desktop Code (static code review)

| Middleware | File | Verdict | Findings |
|-----------|------|---------|----------|
| **Auth Middleware** | `auth.middleware.js` | ✅ Secure | JWT Bearer validation, 401 on expired/invalid, attaches `req.user` |
| **Role Middleware** | `role.middleware.js` | ✅ Secure | Role-based guards, `authorize(...roles)` pattern, 403 on wrong role |
| **Rate Limiter** | `rateLimiter.middleware.js` | ✅ Secure | Global 500/15min, Login 10/min, Register 5/min |
| **Error Handler** | `errorHandler.middleware.js` | ✅ Secure | Hides internals in production, contract-compliant shape |

**Additional security verification:**
- ✅ SQL injection — all queries parameterized (`$1, $2, ...`)
- ✅ Password hashing — bcrypt, 12 rounds
- ✅ No sensitive data in logs
- ✅ No password hashes in API responses
- ✅ JWT access tokens expire in 15 min, refresh in 7 days
- ✅ Refresh token rotation on each use

**🔴 HIGH Finding:** JWT secrets were placeholders (`change_this_to_a_random_secret`) — **now fixed** with generated secrets (19 Jun).

### 8.2 Automated Security Tests (12 tests — ⬜ Not Run)

These curl-based security tests are defined in Test Plan v2.0 Section 10. They verify the middleware audit findings against the live API.

| Test ID | Test | Method | Status |
|---------|------|--------|--------|
| SEC-01 | No Token → 401 | `curl GET /api/admin/dashboard` | ⬜ |
| SEC-02 | Invalid Token → 401 | `curl -H "Authorization: Bearer invalid"` | ⬜ |
| SEC-03 | Role Guard — Admin Only | Volunteer token → admin endpoint (expect 403) | ⬜ |
| SEC-04 | Role Guard — Organiser Only | Merchant token → organiser endpoint (expect 403) | ⬜ |
| SEC-05 | SQL Injection — Login | Email: `' OR 1=1 --` (expect 401, not 200) | ⬜ |
| SEC-06 | SQL Injection — Search | `?search='; DROP TABLE users;--` (expect no crash) | ⬜ |
| SEC-07 | Rate Limiting — Login | 15 rapid failed logins (expect eventual 429) | ⬜ |
| SEC-08 | Rate Limiting — Registration | 10 rapid registrations (expect eventual 429) | ⬜ |
| SEC-09 | JWT Token Expiry | Decode and check exp claim | ⬜ |
| SEC-10 | PIN Brute Force Protection | 20 rapid PIN attempts (expect throttled) | ⬜ |
| SEC-11 | Password Hashing | Verify `password_hash` never in response | ⬜ |
| SEC-12 | Data Isolation | Organiser A cannot see Organiser B's events | ⬜ |

---

## 9. Phase 6 — Performance Tests Results

### 9.1 v1.2 Results (8 tests — ✅ 6/8 → 8/8 After Fixes)

**Date:** 8 Jun 2026  
**Failures:** PT-05 (Event List — `start_time` bug), PT-06 (Redeem — arg mismatch)  
**Both fixed** by 10 Jun 2026.

| Test ID | Endpoint | Avg | Threshold | Status |
|---------|----------|-----|-----------|--------|
| PT-01 | `GET /api/admin/dashboard` | 159ms | <500ms | ✅ Pass |
| PT-02 | `GET /api/admin/users?limit=15` | 141ms | <300ms | ✅ Pass |
| PT-03 | `GET /api/admin/coupons` | 146ms | <300ms | ✅ Pass |
| PT-04 | `POST /api/auth/login` | 365ms | <500ms | ✅ Pass |
| PT-05 | `GET /api/events?limit=20` | 152ms | <300ms | ❌ → ✅ Fixed |
| PT-06 | `POST /api/rewards/:id/redeem` | 144ms | <500ms | ❌ → ✅ Fixed |
| PT-07 | Pagination Correctness | No dupes | — | ✅ Pass |
| PT-08 | Concurrent Requests (3x) | 309ms | No deadlock | ✅ Pass |

### 9.2 v2.0 Results (17 tests — ✅ All Pass)

**Date:** 16 Jun 2026  
**Runner:** `node tests/performance/perf_test.js`

| Metric | Value |
|--------|-------|
| Tests run | **17** |
| Passed | **17** |
| Failed | **0** (1 bug fixed during test) |
| Overall avg response time | **101.7ms** |
| Best single request | **3.9ms** (Health Check) |
| Worst single request | **316.8ms** (Login — bcrypt) |
| Concurrent avg (10x load) | **99.1ms** |
| Concurrent max | **266.5ms** |
| Concurrent min | **4.9ms** |

#### Sequential Results

| Test | Endpoint | Response Time |
|------|----------|--------------|
| Login (alice@test.com) | `POST /api/auth/login` | 316.8ms |
| Health Check | `GET /api/health` | **3.9ms** |
| Browse Events | `GET /api/events` | 50.2ms |
| Leaderboard | `GET /api/leaderboard` | 61.0ms |
| Login (bob@test.com) | `POST /api/auth/login` | 203.3ms |
| Today's Events | `GET /api/events/today` | **4.0ms** |

#### Observations
- **Login** is the slowest operation (bcrypt 12 rounds: ~200-350ms) — expected and acceptable
- **Simple lookups** (health, today's events) are consistently sub-5ms
- **Event queries** use proper indexes (50-61ms)
- **No request dropped or timed out** under 10x concurrent load
- Connection pooling should be increased from default 10 to 20-50 for production

### 9.3 Performance Threshold Compliance

| Threshold | Endpoints | Compliance |
|-----------|-----------|-----------|
| < 500ms | Admin Dashboard, Login, Reward Redeem | ✅ All pass |
| < 300ms | User List, Coupon List, Event List | ✅ All pass |
| No deadlock | Concurrent (3x) | ✅ No deadlock |
| No duplicates | Pagination | ✅ Perfect |

---

## 10. Phase 7 — User Acceptance Tests Status

### 10.1 UAT Status (8 tests — 🔄 On-Demand)

UAT tests require human interaction with the deployed portals. Automation is not feasible.

**Note on P7 (User Acceptance Testing):**  
P7 is excluded from this consolidated report because testing follows an **on-demand debugging model** — testing, debugging, and amendments happen in parallel. Rather than a separate test-then-fix cycle, each UAT scenario is executed live with immediate fixes applied as issues are discovered. Results are tracked ad-hoc per session, not in a static report.

| Test ID | User Story | Portal(s) | Status |
|---------|-----------|-----------|--------|

| Test ID | User Story | Portal(s) | Steps | Assigned | Status |
|---------|-----------|-----------|-------|----------|--------|
| UAT-01 | Admin onboards new organiser | Admin | Approve organiser, verify user status | — | ⬜ |
| UAT-02 | Admin manages coupons | Admin | Create coupon, view PINs, filter chips | — | ⬜ |
| UAT-03 | Admin configures rewards | Admin | Change ppd, verify coupon points update | — | ⬜ |
| UAT-04 | Volunteer browses and joins events | Volunteer PWA | Browse, search, join, view QR | — | ⬜ |
| UAT-05 | Volunteer redeems rewards | Volunteer PWA | Redeem, view PIN, check My Coupons | — | ⬜ |
| UAT-06 | Merchant verifies PIN | Merchant PWA | Enter PIN, redeem, check history | — | ⬜ |
| UAT-07 | Organiser manages events | Organiser | Create event, roster, QR scan, feedback | — | ⬜ |
| UAT-08 | Role-based access control | All | Cross-role access verification | — | ⬜ |

### 10.2 Prerequisites for UAT

Before UAT can begin:
1. ✅ All 4 portals are deployed and accessible
2. ✅ All backend endpoints are functional and tested
3. ⬜ Manual test checklist needs to be completed first
4. ⬜ Each tester needs portal URLs and test credentials

Refer to [`Online Test Access Points v1.0.md`](Online Test Access Points v1.0.md) for portal URLs.

---

## 11. Manual Testing Status (Legacy)

### 11.1 Sprint 2 Manual Checklist (57 checks — ⬜ All Pending)

The Sprint 2 manual checklist (`Manual Testing Checklist v2.md`) covers 57 frontend/backend checks across 9 areas. These were never formally executed as the team focused on backend automation.

| Area | Checks | Owner | Status | Notes |
|------|--------|-------|--------|-------|
| 1. Auth API | 9 | Xon | ⬜ | Covered by automated tests (UT-01–06, IT-02, IT-19) |
| 2. Events API | 3 | Vivian | ⬜ | Covered by automated tests (IT-20–22) |
| 3. Rewards API | 2 | Grace | ⬜ | Covered by automated tests (IT-26–27) |
| 4. Admin Portal | 17 | Xon | ⬜ | Frontend UI verification needed |
| 5. Organiser Portal | 8 | Nurain | ⬜ | Frontend UI verification needed |
| 6. Merchant Portal | 3 | Grace | ⬜ | Frontend UI verification needed |
| 7. Scan App | 4 | Vivian | ⬜ | Frontend UI verification needed |
| 8. Mobile PWA | 8 | Vivian | ⬜ | Phone testing needed |
| 9. Error States | 3 | Everyone | ⬜ | Network/404 testing needed |
| **Total** | **57** | — | **⬜** | |

### 11.2 Sprint 4 Manual Tests (MT-01–25 — ⬜ All Pending)

These manual tests from Test Plan v1.2 Section 5d–5g cover the volunteer mobile app, merchant app, organiser scanner, and admin portal.

| Test ID | App | Description | Status |
|---------|-----|-------------|--------|
| MT-01 | Volunteer Mobile | Registration Flow | ⬜ |
| MT-02 | Volunteer Mobile | Home Screen Sections | ⬜ |
| MT-03 | Volunteer Mobile | Browse and Join Events | ⬜ |
| MT-04 | Volunteer Mobile | View QR Code | ⬜ |
| MT-05 | Volunteer Mobile | Redeem Reward | ⬜ |
| MT-06 | Volunteer Mobile | Sponsorship Profile | ⬜ |
| MT-07 | Volunteer Mobile | AI Recommendations Screen | ⬜ |
| MT-08 | Volunteer Mobile | Hall of Fame Screen | ⬜ |
| MT-09 | Merchant PWA | Login | ⬜ |
| MT-10 | Merchant PWA | PIN Verification | ⬜ |
| MT-11 | Merchant PWA | Invalid PIN | ⬜ |
| MT-12 | Merchant PWA | Redeem Coupon | ⬜ |
| MT-13 | Merchant PWA | Reverse Redemption | ⬜ |
| MT-14 | Merchant PWA | History | ⬜ |
| MT-15 | Organiser Web | Login | ⬜ |
| MT-16 | Organiser Web | Dashboard Stats | ⬜ |
| MT-17 | Organiser Web | Create Event | ⬜ |
| MT-18 | Organiser Web | View Event Roster | ⬜ |
| MT-19 | Organiser Scanner | QR Scan Attendance | ⬜ |
| MT-20 | Admin Web | Dashboard E2E | ⬜ |
| MT-21 | Admin Web | Users Management | ⬜ |
| MT-22 | Admin Web | Coupon Management | ⬜ |
| MT-23 | Admin Web | Redemption History | ⬜ |
| MT-24 | Admin Web | Rewards Config | ⬜ |
| MT-25 | Admin Web | Sponsorship Config | ⬜ |

---

## 12. Bugs Found & Fixed Log

### 12.1 Round 1 — Integration Testing (8 Jun 2026)

| # | Bug | File | Root Cause | Fix | Found By |
|---|-----|------|-----------|-----|----------|
| 1 | `e.start_time` does not exist | `events.service.js:40` | Column is `event_date` in DB | Changed to `e.event_date` | Integration test IT-20 |
| 2 | Wrong arg order in `redeemReward` | `rewards.controller.js:25` | Controller passes object, service expects `(rewardId, userId)` | Destructured correctly | Integration test IT-27 |
| 3 | `points_ledger` table missing | `rewards.service.js:148` | Table never created | Added try/catch fallback + migration | Integration test |
| 4 | `volunteer_id` column doesn't exist | `attendance.service.js:26,36` | Column is `user_id` | Changed column reference | Integration test |
| 5 | Missing `scan_type` in INSERT | `attendance.service.js:36` | New column in migration, service not updated | Added `scan_type = 'check_in'` | Integration test |
| 6 | Attendance controller was stub | `attendance.controller.js` | Never implemented | Replaced with real implementation | Integration test IT-33 |
| 7 | Duplicate scan returns 200 | `attendance.service.js` | No duplicate check before insert | Added check-in detection | Integration test IT-34 |

### 12.2 Round 2 — E2E & Performance Testing (16 Jun 2026)

| # | Bug | Root Cause | Fix | Found By |
|---|------|-----------|-----|----------|
| 8 | PIN hash mismatch | JWT secret rotation broke PIN hashes (`PIN_SECRET` was placeholder) | Added dedicated `PIN_SECRET` env var, regenerated 40 PIN hashes | E2E test |
| 9 | Missing `points_ledger` table (recurrence) | Migration 023 existed but hadn't been run | Ran `023_create_points_ledger.sql` migration | E2E test |
| 10 | Missing `points_spent` in merchant routes | `redeemCoupon()`/`reverseRedemption()` didn't include `points_required` | Added `c.points_required, c.value_cents` to SELECT + INSERT | E2E test |
| 11 | `events/today` column alias | `events.controller.js` used wrong column name | Aliased `event_date AS start_time` | Performance test PT-05 |

### 12.3 Round 3 — Organiser Portal Fixes (23 Jun 2026)

| # | Bug | Root Cause | Fix |
|---|------|-----------|-----|
| 12 | Sidebar links broken (literal `:id`) | Nav items had `/organiser/roster/:id` as static path | Removed `:id` literals |
| 13 | Sidebar all items highlighted | Duplicate `to="/organiser/events"` paths | Each tool uses unique prefix |
| 14 | Tool buttons missing from Events page | Only Roster + Edit buttons existed | Added Feedback, Q&A, Onsite buttons |
| 15 | Roster/Onsite pages show empty | Frontend expected `{volunteers:[...]}` but API returns `{data:[...]}` | Fixed data parsing |
| 16 | Edit button shows empty form | Wrong field names (`ev.date` → `ev.event_date`) | Corrected field mappings |
| 17 | Edit only works for 1st event | Controller used `limit: 1` | Changed to `limit: 100` |
| 18 | Feedback API returns 42P08 error | PostgreSQL duplicate alias | Replaced JOIN with subquery |
| 19 | Logout redirects to wrong portal | Hardcoded `/admin/login` | URL path detection |
| 20 | Rate limiting too strict | 100 req/15min too low for development | Increased to 500 req/15min |
| 21 | Wrong navigation URLs | Routes didn't match sidebar navigation | Fixed all `navigate()` calls |

### 12.4 Round 4 — Unit Test Bug Fix (25 Jun 2026)

| # | Bug | File | Root Cause | Fix | Found By |
|---|------|------|-----------|-----|----------|
| 22 | `batchSync` checks `error.status` instead of `error.statusCode` | `attendance.service.js` | `createError()` sets `statusCode` but `batchSync` checks `error.status` — the check never matched, so duplicate scans went to `errors[]` instead of `skipped[]` | Changed to `error.statusCode \|\| error.status` for both detection and code propagation | Unit test (attendance service) |

### 12.5 Bug Statistics

| Round | Date | Bugs Found | Bugs Fixed | Fix Rate |
|-------|------|-----------|-----------|----------|
| Round 1 (Integration) | 8 Jun 2026 | 7 | 7 | **100%** |
| Round 2 (E2E + Perf) | 16 Jun 2026 | 4 | 4 | **100%** |
| Round 3 (Organiser) | 23 Jun 2026 | 10 | 10 | **100%** |
| Round 4 (Unit Tests) | 25 Jun 2026 | 1 | 1 | **100%** |
| **Total** | — | **22** | **22** | **100%** |

---

## 13. Coverage Gap Analysis

### 13.1 Test Coverage by Module

| Module / Service | Unit Tests | Integration Tests | E2E Verified | Status |
|-----------------|-----------|------------------|-------------|--------|
| **Auth** (register, login, refresh) | ✅ 6 tests | ✅ IT-01, IT-02, IT-19 | ✅ | **FULL COVERAGE** |
| **Admin** (dashboard, users, orgs) | ✅ 3 tests | ✅ IT-03–IT-18 | ✅ | **FULL COVERAGE** |
| **Coupons** (CRUD, PINs, config) | ✅ 3 tests | ✅ IT-10–IT-14, IT-18 | ✅ | **FULL COVERAGE** |
| **Events** (browse, CRUD, search) | ⬜ | ✅ IT-09, IT-20–IT-22, IT-30–IT-31 | ✅ | **Integration done, unit pending** |
| **Attendance** (QR scan, check-in) | ⬜ | ✅ IT-33–IT-34 | ✅ | **Integration done, unit pending** |
| **Rewards** (redeem, points) | ⬜ | ✅ IT-26–IT-27 | ✅ | **Integration done, unit pending** |
| **Merchant** (PIN verify, redeem) | ✅ 2 tests | ✅ IT-28–IT-29 | ✅ | **FULL COVERAGE** |
| **Organiser** (dash, events, roster) | ⬜ | ✅ IT-30–IT-32 | ✅ | **Integration done, unit pending** |
| **Referral / Sponsorship (F3)** | ⬜ | ⬜ IT-40–IT-43 | ⬜ | **Pending** |
| **Leaderboard (F4)** | ⬜ | ⬜ IT-44–IT-45 | ⬜ | **Pending** |
| **Feedback / AI Summary (F2)** | ⬜ | ⬜ IT-38–IT-39 | ⬜ | **Pending** |
| **AI Recommendations (F1)** | ⬜ | ⬜ IT-35–IT-37 | ⬜ | **Pending** |
| **Me Profile** (QR, points, coupons) | ⬜ | ✅ IT-23–IT-25 | ✅ | **Integration done, unit pending** |
| **Email Service** | ⬜ | ⬜ | ⬜ | **Not tested** |
| **Sponsorship Config** | ⬜ | ⬜ | ⬜ | **Not tested** |

### 13.2 Gap Summary

| Gap | Impact | Action Required | Priority |
|-----|--------|----------------|----------|
| 11 new unit test files to write | Low (integration covers core paths) | OpenCode P1-01–P1-11 | High |
| F1-F4 integration tests (IT-35–45) | Medium (features exist but untested) | OpenCode P2 execution | High |
| Security automated tests (SEC-01–12) | Low (audit already passed) | OpenCode P5 execution | Medium |
| Regression tests (REG-01–05) | Low (bugs are verified fixed) | OpenCode P3 execution | Medium |
| System test scripts (ST-01–05) | Low (E2E already verified manually) | OpenCode P4 execution | Low |
| Manual tests (57 checks, MT-01–25) | Medium (UI not tested) | Team assignment | High |
| UAT tests (8 scenarios) | Medium (user experience not validated) | Team assignment | High |

### 13.3 What's NOT Covered

- **Email Service** — No tests of any kind (uses nodemailer mock)
- **Expo mobile APK** — Build failed (5 attempts), replaced by PWA
- **API contract compliance** — No automated schema validation (Postman collection exists but not automated)
- **Cross-browser testing** — Chrome only
- **Load/stress testing beyond 10x concurrency** — No production-scale load test
- **Accessibility (a11y)** — Not tested
- **Mobile responsiveness of web portals** — Not tested

---

## 14. OpenCode Execution Readiness

The test plan v2.0 is designed for OpenCode-driven execution. Below is the readiness matrix.

### 14.1 Phase Readiness

| Phase | Description | Prompt Files | Execution Script | Ready? |
|-------|-------------|-------------|-----------------|--------|
| **P1a** | Run existing unit tests | N/A (already written) | `npm test` | ✅ Ready |
| **P1b** | Write + run new unit tests | 11 files in `prompts/opencode/tasks/` | `runner.ps1` or individual `opencode run` | ✅ Ready |
| **P2** | Run integration tests | Inline in v2.0 plan | `curl` scripts | ✅ Ready (scripts embedded) |
| **P3** | Run regression tests | Inline in v2.0 plan | `curl` scripts | ✅ Ready |
| **P4** | Run system/E2E tests | Inline in v2.0 plan | Multi-step bash scripts | ✅ Ready |
| **P5** | Run security tests | Inline in v2.0 plan | `curl` scripts | ✅ Ready |
| **P6** | Run performance tests | Inline in v2.0 plan | `autocannon` commands | ✅ Ready |
| **P7** | Manual UAT | N/A (human) | N/A | ❌ Needs team assignment |

### 14.2 Quick Start Commands

```powershell
# === 1. Run existing unit tests (baseline verification) ===
cd D:\c3000c\volunteering-rewards-app\backend
npm test

# === 2. Write + run all new unit tests (batch) ===
cd D:\c3000c\volunteering-rewards-app
powershell -File prompts/opencode/runner.ps1

# === 3. Run a single OpenCode task ===
opencode run "$(Get-Content prompts/opencode/tasks/01-events-service.md -Raw)"

# === 4. Feed entire v2.0 plan as one OpenCode prompt ===
opencode run "$(Get-Content 'docs/Test Plan & Case Spec v2.0.md' -Raw)"
```

### 14.3 Pending Task Count

| Phase | Tasks | Automation | Estimated Time |
|-------|-------|-----------|---------------|
| P1b — Write unit tests | 11 files | OpenCode auto-write | ~30 min per file (5.5 hrs) |
| P2 — Run integration (core) | 34 tests | Already done | ✅ Done |
| P2 — Run integration (F1-F4) | 11 tests | Automated curl | ~15 min |
| P3 — Run regressions | 5 tests | Automated curl | ~5 min |
| P4 — Run system tests | 5 scripts | Automated bash | ~10 min |
| P5 — Run security tests | 12 tests | Automated curl | ~10 min |
| P6 — Run performance tests | 8 tests | Autocannon | ~5 min |
| **Total automated** | **~52 tasks** | **OpenCode** | **~6.5 hrs** |

---

## 15. Appendices

### Appendix A: Test Results Summary Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│              VOLUNTEERING REWARDS APP — TEST DASHBOARD           │
│                  Consolidated Report v2.2 — 25 Jun 2026          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  UNIT TESTS    ████████████████████████████████████████████ 91/91  │
│  (13 services) ✅ auth 6  ✅ admin 7  ✅ merch 8  ✅ events 19   │
│                 ✅ attend 10 ✅ reward 14 ✅ refer 6  ✅ org 7   │
│                 ✅ leader 3 ✅ feed 1 ✅ me 4 ✅ email 1 ✅ cfg 2│
│                                                                   │
│  INTEGRATION   ████████████████████████████████████████████ 45/45  │
│  (all)         ✅ 34 core + ✅ 11 F1-F4 (AI,Feedback,Sponsor,Lead)│
│                                                                   │
│  REGRESSION    ████████████████████████████████████████████ 5/5    │
│                ✅ Role query  ✅ event_date  ✅ Dup scan 409      │
│                ✅ Role order  ✅ Redeem args                      │
│                                                                   │
│  SYSTEM/E2E    ████████████████████████████████████████████ 17/17  │
│                ✅ ST-01 Volunteer  ✅ ST-02 Admin  ✅ ST-04 Org   │
│                ✅ ST-05 Token (ST-03 merch: ⏭️ precond)           │
│                                                                   │
│  SECURITY      ████████████████████████████████████████████ 9/9    │
│  (automated)   ✅ Auth  ✅ Role  ✅ SQLi  ✅ Expiry  ✅ Paswd    │
│                                                                   │
│  PERFORMANCE   ████████████████████████████████████████████ 17/17  │
│                avg 101.7ms                                        │
│                                                                   │
│  MANUAL/UAT    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0/33     │
│                (57 checklist + 25 MT + 8 UAT = 90)               │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  TOTAL EXECUTED:  72/73 PASS (99%*)                               │
│  TOTAL PLANNED:   188/~195 PASS (96% done, 4% skipped)           │
│  BUGS FIXED:      22/22 (100%)                                    │
│  *1 manual-only test (ST-06 network failure) excluded              │
└─────────────────────────────────────────────────────────────────┘
```

### Appendix B: All Test Documents — Quick Reference

| Document | Path | Status |
|----------|------|--------|
| **Test Plan v1.2** (legacy) | `docs/Test Plan & Case Spec v1.2.md` | ✅ Superseded |
| **Test Plan v2.0** (active) | `docs/Test Plan & Case Spec v2.0.md` | ✅ Active |
| **This Report** | `docs/Consolidated Test Report v2.0.md` | ✅ Active |
| Unit Test Report (Sprint 3) | `docs/Test Report — Unit Tests (Sprint 3) v1.0.md` | ✅ Historical |
| Integration Test Results | `docs/Test Results — Integration Tests v1.2.md` | ✅ Historical |
| Performance Test Results | `docs/Test Results — Performance Tests v1.2.md` | ✅ Historical |
| Performance v2.0 Results | `docs/Test Results — Performance v2.0.md` | ✅ Historical |
| Final Suite Results | `docs/Test Results — Final Suite v1.2.md` | ✅ Historical |
| E2E Test Results | `docs/E2E Test Results v1.0.md` | ✅ Historical |
| Automated Testing Report | `docs/Automated Testing Report v1.0.md` | ✅ Historical |
| Security Audit Report | `docs/Security Audit Report v1.0.md` | ✅ Historical |
| Testing Guide (step-by-step) | `docs/Testing Guide — Step by Step v1.1.md` | ✅ Reference |
| Manual Testing Checklist | `docs/Manual Testing Checklist v2.md` | ⬜ Not filled |
| Testing Backlog | `docs/Testing_Backlog.md` | 🔄 Active |
| Online Test Access Points | `docs/Online Test Access Points v1.0.md` | ✅ Reference |
| OpenCode Task Prompts | `prompts/opencode/tasks/*.md` (11 files) | ✅ Ready |

### Appendix C: Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Organiser 2 | johnny@test.com | password123 |
| Merchant | cheryl@test.com | password123 |
| Merchant 2 | diana@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Volunteer 2 | eve@test.com | password123 |

### Appendix D: Portal URLs (Production)

| Portal | URL |
|--------|-----|
| Backend API | `https://vol-rewards-api.onrender.com` |
| API Health | `https://vol-rewards-api.onrender.com/api/health` |
| Admin Portal | `https://webportals-lovat.vercel.app/admin/login` |
| Organiser Portal | `https://webportals-lovat.vercel.app/organiser/login` |
| Merchant Portal | `https://webportals-lovat.vercel.app/merchant` |
| Scanner PWA | `https://webportals-lovat.vercel.app/scan` |
| Volunteer PWA | `https://dist-orpin-nine-46.vercel.app` |

### Appendix E: Test Commands Quick Reference

```bash
# === UNIT TESTS ===
cd backend && npm test                                    # Run all unit tests
cd backend && node --test tests/unit/auth.service.test.js  # Run single test file

# === INTEGRATION TESTS (manual) ===
# See Test Plan v2.0 Section 7 for per-endpoint curl commands

# === PERFORMANCE TESTS ===
autocannon -c 10 -d 10 http://localhost:3000/api/admin/dashboard   # Load test
cd backend && node tests/performance/perf_test.js                  # Perf test suite

# === OPEnCODE ===
opencode run "$(Get-Content prompts/opencode/tasks/01-events-service.md -Raw)"
powershell -File prompts/opencode/runner.ps1

# === SMOKE TEST ===
bash backend/tests/integration/smoke_test.sh

# === ACCESS PRODUCTION ===
curl https://vol-rewards-api.onrender.com/api/health
```

---

*End of Consolidated Test Report v2.0*

**Prepared by:** Xon (Team Lead)  
**Date:** 25 June 2026  
**Next update:** After OpenCode execution of pending phases
