# Test Plan & Test Case Specification — OpenCode Automation Edition

**Project:** Volunteering Rewards App (C3000C)  
**Version:** 2.1  
**Date:** 30 June 2026  
**Prepared by:** Xon (Team Lead)  
**Status:** Sprint 4 Complete ✅ — 188/188 Tests Passing. Sprint 5 APK + PWA Testing Active  
**Execution Engine:** OpenCode CLI (AI-native test runner)

---

## Table of Contents

1. [Test Strategy Overview](#1-test-strategy-overview)
2. [OpenCode Automation Architecture](#2-opencode-automation-architecture)
3. [Test Environment](#3-test-environment)
4. [Test Deliverables](#4-test-deliverables)
5. [Master Execution Plan](#5-master-execution-plan)
6. [Phase 1 — Unit Tests (Write + Run)](#6-phase-1--unit-tests-write--run)
7. [Phase 2 — Integration Tests (Automated)](#7-phase-2--integration-tests-automated)
8. [Phase 3 — Regression Tests](#8-phase-3--regression-tests)
9. [Phase 4 — System Tests (Automated E2E)](#9-phase-4--system-tests-automated-e2e)
10. [Phase 5 — Security Tests](#10-phase-5--security-tests)
11. [Phase 6 — Performance Tests](#11-phase-6--performance-tests)
12. [Phase 7 — User Acceptance Tests (Manual)](#12-phase-7--user-acceptance-tests-manual)
13. [OpenCode Prompt References](#13-opencode-prompt-references)
14. [Test Results Log](#14-test-results-log)
15. [Appendices](#15-appendices)

---

## 1. Test Strategy Overview

### 1.1 Scope

Same scope as v1.2 — covers all four portals:

| Portal | Technology | Users |
|--------|-----------|-------|
| Admin Web Portal | React + Vite | System administrators |
| Organiser Web Portal | React + Vite | Event organisers |
| Volunteer Mobile App | Expo / React Native | Volunteers |
| Merchant Cashier App | Web (PWA) | Merchant cashiers |

### 1.2 Execution Model — v2.0 Change

| Aspect | v1.2 (Manual) | v2.0 (OpenCode) |
|--------|---------------|------------------|
| Primary runner | Human team members | OpenCode AI agent |
| Test writing | Manual coding | AI-generated from prompts |
| Test execution | `node --test` manually | Automated via OpenCode `run` command |
| Results logging | Human-edited table | AI-updated result log |
| Error recovery | Human debug | AI self-heal (3R: Retry → Reduce → Reroute) |

### 1.3 Test Types

| # | Test Type | Automation | OpenCode Phase |
|---|-----------|-----------|----------------|
| T1 | Unit Tests | ✅ Full automation | P1: Write → Execute |
| T2 | Integration Tests | ✅ Scripted via curl/API | P2: API endpoints |
| T3 | Regression Tests | ✅ Automated checks | P3: Verify fixes persist |
| T4 | System Tests | 🔄 Semi-automated | P4: Cross-portal E2E |
| T5 | Security Tests | ✅ Scripted | P5: Auth/Guard/Injection |
| T6 | Performance Tests | ✅ Autocannon | P6: Load testing |
| T7 | User Acceptance Tests | ❌ Manual (human verification) | P7: UX validation |

### 1.4 Test Data

All tests use the seeded test database with the following accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Merchant | cheryl@test.com | password123 |

---

## 2. OpenCode Automation Architecture

### 2.1 What Is OpenCode?

OpenCode is an AI coding assistant CLI (`opencode run <prompt>`) that reads a task description, writes code, executes tests, and self-corrects. It serves as the automated test execution engine for v2.0.

### 2.2 Automation Layers

```
Layer 1: Orchestrator (this document)
  └─ Master test plan with all cases & status tracking
      └─ Layer 2: OpenCode Prompt Files
          └─ `prompts/opencode/tasks/*.md` — one per service/module
              └─ Layer 3: OpenCode Runner
                  └─ `opencode run "$(cat <prompt-file>)"` — executes & logs results
                      └─ Layer 4: Test Output
                          └─ `node --test` results → SUCCESS/FAILURE → logged in Section 14
```

### 2.3 Quick Start Commands

```powershell
# === SETUP ===
# Start backend (required for integration, security, perf tests)
cd D:\c3000c\volunteering-rewards-app\backend
npm run dev
# Terminal 2: Frontend for manual UAT
cd D:\c3000c\volunteering-rewards-app\frontend\web_portals
npm run dev

# === RUN ALL UNIT TESTS (existing) ===
cd D:\c3000c\volunteering-rewards-app\backend
npm test

# === RUN OPEnCODE WRITE + TEST (single service) ===
opencode run "$(Get-Content prompts/opencode/tasks/01-events-service.md -Raw)"

# === RUN OPEnCODE BATCH (all pending) ===
powershell -File prompts/opencode/runner.ps1
```

### 2.4 Status Key

| Status | Meaning |
|--------|---------|
| ⬜ Not Run | Test not yet executed |
| ✅ Pass | Test produced expected result |
| ❌ Fail | Test did not produce expected result |
| ⏭️ Skipped | Test blocked or not applicable |
| 🔄 In Progress | OpenCode currently executing |
| 📝 Written | Test file written by OpenCode, not yet run |

---

## 3. Test Environment

### 3.1 Hardware / Software Requirements

| Component | Specification |
|-----------|---------------|
| Backend Server | Node.js v24+, Express, PostgreSQL 16 |
| Frontend Server | Vite dev server (port 5173) or production build |
| Mobile App | Expo Go (iOS/Android) or emulator |
| Database | PostgreSQL 16 on localhost:5432 |
| Browser | Chrome 125+, Edge 125+ (for PWA testing) |
| OpenCode CLI | `npm install -g opencode` |

### 3.2 Setup Procedure

```bash
# 1. Start backend
cd D:\c3000c\volunteering-rewards-app\backend
npm run dev

# 2. Start frontend (separate terminal)
cd D:\c3000c\volunteering-rewards-app\frontend\web_portals
npm run dev

# 3. Run database migrations (if not done)
cd D:\c3000c\volunteering-rewards-app\backend
node src/utils/migrationRunner.js

# 4. Seed test data (if needed)
node scripts/init_coupons.js
```

### 3.3 Environment Verification Smoke Test

```bash
# Quick smoke to verify environment before full test run
cd D:\c3000c\volunteering-rewards-app\backend
node --test tests/unit/auth.service.test.js
# Expected: All tests pass (UT-01 through UT-06)
```

---

## 4. Test Deliverables

| Deliverable | Description | Location |
|-------------|-------------|----------|
| Test Plan (this document) | Strategy, automation, all test cases, results log | `docs/Test Plan & Case Spec v2.1.md` |
| Unit Test Code | Node `--test` automated test scripts | `backend/tests/unit/*.test.js` |
| Integration Test Code | Bash/PowerShell API endpoint test scripts | `backend/tests/integration/` |
| OpenCode Task Prompts | AI-executable task definitions | `prompts/opencode/tasks/*.md` |
| OpenCode Runner | Batch automation script | `prompts/opencode/runner.ps1` |
| OpenCode Logs | Execution logs per task | `prompts/opencode/logs/` |
| Test Results Log | Recorded pass/fail for all test cases | Section 14 of this document |
| Bug Report | List of defects found during testing | Separate document |

---

## 5. Master Execution Plan

### 5.1 Execution Order

OpenCode must execute phases in this order due to dependencies:

```
P1: Unit Tests ──────────► P2: Integration Tests ──────────► P3: Regressions
  (write + run all)          (API endpoint verification)      (verify fixes)
        │                            │
        ▼                            ▼
P4: System Tests ◄──── P6: Performance Tests ◄──── P5: Security Tests
  (cross-portal E2E)       (load testing)             (auth/guard/injection)

P7: UAT (Manual — human tester)
```

### 5.2 Dependency Map

| Phase | Depends On | Reason |
|-------|-----------|--------|
| P1 Unit | None | Foundation — tests individual functions |
| P2 Integration | P1 ✅ | API requires stable backend |
| P3 Regression | P1 ✅ | Verify previously fixed bugs |
| P5 Security | P2 ✅ | Uses API tokens from integration flow |
| P6 Performance | P2 ✅ | Requires API endpoints working |
| P4 System | P2 + P5 ✅ | Full E2E needs everything stable |
| P7 UAT | P4 ✅ | Human verification after automation green |

### 5.3 OpenCode Task Status Overview

| Phase | Task Count | OpenCode Prompts | Automation Level | Status |
|-------|-----------|-----------------|------------------|--------|
| P1a | 4 existing unit test files | None (already written) | `npm test` | 🔄 Partial |
| P1b | 8 new unit tests to write | `prompts/opencode/tasks/01-11.md` | `opencode run` | ⬜ |
| P2 | 34 integration tests | Inline scripts | `curl` + `node` | ✅ Pass (25 Jun) |
| P3 | 5 regression tests | Inline scripts | `curl` | ✅ Pass (25 Jun) |
| P4 | 6 system tests | Inline scripts | Multi-step API | ✅ Pass (25 Jun) |
| P5 | 12 security tests | Inline scripts | `curl` | ✅ Pass (25 Jun) |
| P6 | 8 performance tests | Autocannon | `autocannon` | ✅ Pass (25 Jun) |
| P7 | 8 UAT tests | N/A (manual) | Human | ⬜ Sprint 5 |

---

## 6. Phase 1 — Unit Tests (Write + Run)

### Scope
Test individual service functions in isolation by mocking the database layer.

### Location
`backend/src/services/*.service.js` — test each exported function.

---

### 6.1 Existing Unit Tests (Already Written — Run Only)

These test files already exist at `backend/tests/unit/`. OpenCode should run them with `npm test`.

| Test ID | File | Coverage | OpenCode Action |
|---------|------|----------|----------------|
| UT-01 to UT-06 | `auth.service.test.js` | Register, Login, Token Refresh | `node --test tests/unit/auth.service.test.js` |
| UT-07 to UT-09 | `admin.service.test.js` | Points Calc, Config Change, PIN Hash | `node --test tests/unit/admin.service.test.js` |
| UT-10 to UT-11 | *covered in admin.service* | PIN Uniqueness (partial) | Run with admin tests |
| UT-12 to UT-13 | `merchant.service.test.js` | PIN Verify, Invalid PIN | `node --test tests/unit/merchant.service.test.js` |
| UT-14 to UT-18 | *not yet written* | Redeem, Reverse, Points Deduction | See P1b |

### 6.2 New Unit Tests to Write (via OpenCode)

OpenCode will generate these test files using the prompts in `prompts/opencode/tasks/`.

#### P1-01: Events Service Tests

| Field | Value |
|-------|-------|
| **OpenCode Prompt** | `prompts/opencode/tasks/01-events-service.md` |
| **Target File** | `backend/tests/unit/events.service.test.js` |
| **Functions to Test** | `browseEvents`, `getEventById`, `registerForEvent`, `unregisterFromEvent`, `getRecommendations`, `getPopularEvents` |
| **Test Cases** | Pagination, search filter, category filter, registration, capacity check, duplicate registration, unregister, AI recommendations, popular events fallback |
| **Verify** | `node --test tests/unit/events.service.test.js` |

#### P1-02: Attendance Service Tests

| Field | Value |
|-------|-------|
| **OpenCode Prompt** | `prompts/opencode/tasks/02-attendance-service.md` |
| **Target File** | `backend/tests/unit/attendance.service.test.js` |
| **Functions to Test** | `scanQR`, `checkIn`, `batchCheckIn` |
| **Test Cases** | Successful scan, duplicate scan → 409, invalid QR → 404, points awarded on check-in, batch check-in |
| **Verify** | `node --test tests/unit/attendance.service.test.js` |

#### P1-03: Rewards Service Tests

| Field | Value |
|-------|-------|
| **OpenCode Prompt** | `prompts/opencode/tasks/03-rewards-service.md` |
| **Target File** | `backend/tests/unit/rewards.service.test.js` |
| **Functions to Test** | `browseRewards`, `redeemReward`, `getRewardById` |
| **Test Cases** | Browse active rewards, redeem with sufficient points (UT-18), redeem with insufficient points (UT-17), redeem out-of-stock, PIN generation, auto-calculate points |
| **Verify** | `node --test tests/unit/rewards.service.test.js` |

#### P1-04: Referral Service Tests

| Field | Value |
|-------|-------|
| **OpenCode Prompt** | `prompts/opencode/tasks/04-referral-service.md` |
| **Target File** | `backend/tests/unit/referral.service.test.js` |
| **Functions to Test** | `createReferral`, `getSponsorshipProfile`, `getDownline` |
| **Test Cases** | Create referral with upline, sponsorship profile with correct counts, downline levels, invalid upline email |
| **Verify** | `node --test tests/unit/referral.service.test.js` |

#### P1-05: Organiser Service Tests

| Field | Value |
|-------|-------|
| **OpenCode Prompt** | `prompts/opencode/tasks/05-organiser-service.md` |
| **Target File** | `backend/tests/unit/organiser.service.test.js` |
| **Functions to Test** | `createEvent`, `getDashboard`, `getRoster`, `getFeedback` |
| **Test Cases** | Create event, dashboard stats scoped to organiser, roster with check-in status, organiser-only guard |
| **Verify** | `node --test tests/unit/organiser.service.test.js` |

#### P1-06: Leaderboard Service Tests

| Field | Value |
|-------|-------|
| **OpenCode Prompt** | `prompts/opencode/tasks/06-leaderboard-service.md` |
| **Target File** | `backend/tests/unit/leaderboard.service.test.js` |
| **Functions to Test** | `getLeaderboard`, `getLeaderboardByPoints`, `getByEvents`, `getByCheckins`, `getByRedeemed` |
| **Test Cases** | All categories return top 3, individual category endpoints, rank numbers correct |
| **Verify** | `node --test tests/unit/leaderboard.service.test.js` |

#### P1-07: Feedback Service Tests

| Field | Value |
|-------|-------|
| **OpenCode Prompt** | `prompts/opencode/tasks/07-feedback-service.md` |
| **Target File** | `backend/tests/unit/feedback.service.test.js` |
| **Functions to Test** | `createFeedback`, `getFeedbackSummary`, `getEventFeedback` |
| **Test Cases** | Create feedback, AI summary with sentiment, empty event → neutral, rating breakdown |
| **Verify** | `node --test tests/unit/feedback.service.test.js` |

#### P1-08: Me Service Tests

| Field | Value |
|-------|-------|
| **OpenCode Prompt** | `prompts/opencode/tasks/08-me-service.md` |
| **Target File** | `backend/tests/unit/me.service.test.js` |
| **Functions to Test** | `getProfile`, `getPoints`, `getCoupons`, `getQRCode` |
| **Test Cases** | Profile fields correct, points balance non-negative, coupons with masked PINs, QR UUID valid |
| **Verify** | `node --test tests/unit/me.service.test.js` |

#### P1-09: Email Service Tests

| Field | Value |
|-------|-------|
| **OpenCode Prompt** | `prompts/opencode/tasks/09-email-service.md` |
| **Target File** | `backend/tests/unit/email.service.test.js` |
| **Functions to Test** | `sendEmail`, `sendWelcomeEmail`, `sendRedemptionConfirmation` |
| **Test Cases** | Send with valid params, handle send failure gracefully, mock nodemailer transport |
| **Verify** | `node --test tests/unit/email.service.test.js` |

#### P1-10: Sponsorship Config Tests

| Field | Value |
|-------|-------|
| **OpenCode Prompt** | `prompts/opencode/tasks/10-sponsorshipConfig-service.md` |
| **Target File** | `backend/tests/unit/sponsorshipConfig.service.test.js` |
| **Functions to Test** | `getConfig`, `updateConfig` |
| **Test Cases** | Read config returns all fields, update persists values, validate point values > 0 |
| **Verify** | `node --test tests/unit/sponsorshipConfig.service.test.js` |

#### P1-11: Expand Existing Tests

| Field | Value |
|-------|-------|
| **OpenCode Prompt** | `prompts/opencode/tasks/11-expand-existing-tests.md` |
| **Target Files** | `backend/tests/unit/admin.service.test.js`, `merchant.service.test.js` |
| **New Coverage** | Dashboard stats, user CRUD, merchant redeem flow, coupon expiry checks |
| **Verify** | `node --test tests/unit/admin.service.test.js tests/unit/merchant.service.test.js` |

### 6.3 OpenCode Execution Protocol — Unit Tests

```powershell
# === Step 1: Run existing tests first ===
cd D:\c3000c\volunteering-rewards-app\backend
npm test
# Record baseline: all existing tests MUST pass

# === Step 2: Write + run each new service ===
# OpenCode auto-writes and runs. One command per service:
opencode run "$(Get-Content prompts/opencode/tasks/01-events-service.md -Raw)"

# === Step 3: After all services done, run full suite ===
npm test
# Expected: all tests pass
```

---

## 7. Phase 2 — Integration Tests (Automated)

### Scope
Test each API endpoint end-to-end with the live database. OpenCode executes curl commands and validates responses.

### Prerequisites
- Backend running on `http://localhost:3000`
- Database seeded with test data
- Admin token obtained

### 7.1 Authentication Token Setup (Used by all integration tests)

```bash
# OpenCode: run this first, store token for subsequent tests
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

VOLUNTEER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"password123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

ORGANISER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@test.com","password":"password123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

MERCHANT_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cheryl@test.com","password":"password123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")
```

### 7.2 Admin API Tests

#### IT-01: Health Check

```bash
# OpenCode: Execute and verify
curl -s http://localhost:3000/api/health
# EXPECTED: {"status":"ok","timestamp":"...","uptime":...}
# PASS IF: status is "ok"
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-02: Admin Login

```bash
# OpenCode: Execute and verify
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}'
# EXPECTED: {"user":{"id":...,"name":"Carol","email":"carol@test.com","role":"admin"},"token":"...","refresh_token":"..."}
# PASS IF: role is "admin" and token is valid JWT
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-03: Admin Dashboard

```bash
curl -s http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: {"stats":{"total_users":...,"total_organisers":...,"total_events":...,...},"recent_activity":[...]}
# PASS IF: all stat fields are non-negative integers
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-04: Admin — List Users (with search + filter)

```bash
# OpenCode: Run all 3 queries and verify each
# 1. Search
curl -s "http://localhost:3000/api/admin/users?search=alice" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: only users matching "alice" returned

# 2. Role filter
curl -s "http://localhost:3000/api/admin/users?role=volunteer" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: only volunteers returned

# 3. No params
curl -s "http://localhost:3000/api/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: {"data":[...],"total":...,"page":1,"limit":...,"total_pages":...}
# PASS IF: all 3 queries return correctly filtered results
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-05: Admin — Get User Detail

```bash
# OpenCode: Get first user ID from list, then get detail
USER_ID=$(curl -s "http://localhost:3000/api/admin/users?limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data[0].id))")
curl -s "http://localhost:3000/api/admin/users/$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: {"id":...,"name":"...","email":"...","phone":"...","role":"...","points_balance":...,"status":"...","created_at":"...","total_events_attended":...,"total_points_earned":...,"total_points_redeemed":...}
# PASS IF: all fields present
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-06: Admin — Update User Status

```bash
# OpenCode: Toggle user status and verify
curl -s -X PUT "http://localhost:3000/api/admin/users/$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"disabled"}'
# EXPECTED: {"id":...,"status":"disabled","updated_at":"..."}

# Verify disabled
curl -s "http://localhost:3000/api/admin/users/$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).status))"
# EXPECTED: "disabled"

# Reactivate
curl -s -X PUT "http://localhost:3000/api/admin/users/$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'
# EXPECTED: status returned to "active"
# PASS IF: status changes persist both ways
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-07: Admin — List Organisers (by status)

```bash
curl -s "http://localhost:3000/api/admin/organisers?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: {"data":[{id,name,email,organisation_name,...}]}

curl -s "http://localhost:3000/api/admin/organisers?status=approved" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# PASS IF: status filter works correctly
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-08: Admin — Approve Organiser

```bash
# OpenCode: Get first pending organiser
ORG_ID=$(curl -s "http://localhost:3000/api/admin/organisers?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);if(j.data.length)console.log(j.data[0].id)})")

if [ -n "$ORG_ID" ]; then
  curl -s -X PUT "http://localhost:3000/api/admin/organisers/$ORG_ID/approve" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"approved"}'
  # EXPECTED: {"organisation":{"id":...,"name":"...","type":"...","status":"approved"}}
  # PASS IF: both organisation and user status update
fi
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-09: Admin — List Events

```bash
curl -s "http://localhost:3000/api/admin/events?status=active" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: {"data":[{id,title,date,capacity,organiser_name,registered_count,checked_in_count}]}
# PASS IF: organiser name resolves, counts are correct
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-10: Admin — List Coupons (filter chips)

```bash
# Active
curl -s "http://localhost:3000/api/admin/coupons?status=active" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: only status='active'

# Depleted
curl -s "http://localhost:3000/api/admin/coupons?status=depleted" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: only 'depleted'

# All
curl -s "http://localhost:3000/api/admin/coupons" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# PASS IF: filter chips return correct counts
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-11: Admin — Create Coupon

```bash
curl -s -X POST http://localhost:3000/api/admin/coupons \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Coffee","value_cents":500,"quantity":3,"expiry_date":"2026-12-31"}'
# EXPECTED: {"coupon":{"id":...,"title":"Test Coffee","points_required":...},"pins_generated":3}
# PASS IF: points_required auto-calculated, 3 PINs generated
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-12: Admin — View Coupon PINs

```bash
# Store coupon ID from IT-11
COUPON_ID=$(curl -s "http://localhost:3000/api/admin/coupons" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data[0].id))")
curl -s "http://localhost:3000/api/admin/coupons/$COUPON_ID/pins" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: {"data":[{id,pin_code,status,created_at}]}
# PASS IF: PIN count matches coupon quantity, PINs are unmasked 6-digit strings
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-13: Admin — Rewards Config Read

```bash
curl -s http://localhost:3000/api/admin/rewards/configuration \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: {"points_per_dollar":...,"min_redeem_points":...,"max_redeem_per_day":...,"default_event_points":...,"updated_at":"..."}
# PASS IF: all fields present with valid values
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-14: Admin — Rewards Config Update

```bash
# Update config
curl -s -X PUT http://localhost:3000/api/admin/rewards/configuration \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"points_per_dollar":150}'

# Read back and verify
curl -s http://localhost:3000/api/admin/rewards/configuration \
  -H "Authorization: Bearer $ADMIN_TOKEN" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).points_per_dollar))"
# EXPECTED: 150

# Verify coupons recalculate
curl -s http://localhost:3000/api/admin/coupons \
  -H "Authorization: Bearer $ADMIN_TOKEN" | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);console.log('points:',j.data[0].points_required)})"
# EXPECTED: points values updated

# Restore
curl -s -X PUT http://localhost:3000/api/admin/rewards/configuration \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"points_per_dollar":100}'
# PASS IF: config persists and coupons update in real-time
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-15: Admin — List Redemptions

```bash
curl -s "http://localhost:3000/api/admin/redemptions?limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: {"data":[{id,user_name,redeemed_at,coupon_title,points_spent,value_cents}]}

# Date filter + sort
curl -s "http://localhost:3000/api/admin/redemptions?from=2026-06-01&to=2026-06-30&sort=points_spent&order=asc" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# PASS IF: all 3 query params (from, to, sort, order) function correctly
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-16: Admin — List Merchants

```bash
curl -s http://localhost:3000/api/admin/merchants \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: {"data":[{id,name,contact_person,contact_email,product_count}]}
# PASS IF: merchant list returns with product counts
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-17: Admin — Create Merchant

```bash
curl -s -X POST http://localhost:3000/api/admin/merchants \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Cafe","contact_person":"John","contact_email":"john@test.com"}'
# EXPECTED: {"merchant":{...},"message":"Merchant created. Login credentials: ..."}
# PASS IF: both merchant record and user account created
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-18: Admin — Delete Coupon

```bash
# Create a disposable coupon
DISP_COUPON_ID=$(curl -s -X POST http://localhost:3000/api/admin/coupons \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Delete Me","value_cents":100,"quantity":1,"expiry_date":"2026-12-31"}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).coupon.id))")

# Delete it
curl -s -X DELETE "http://localhost:3000/api/admin/coupons/$DISP_COUPON_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: {"message":"Coupon and related data deleted"}

# Verify gone
curl -s "http://localhost:3000/api/admin/coupons/$DISP_COUPON_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: 404
# PASS IF: cascade delete removes coupon + PINs + redemptions
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

### 7.3 Volunteer API Tests

#### IT-19: Volunteer — Register

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"OpenCode Test","email":"opencode_test_$(date +%s)@test.com","password":"password123"}'
# EXPECTED: {"user":{"id":...,"name":"OpenCode Test","email":"...","role":"volunteer"},"token":"..."}
# PASS IF: user is volunteer role and token is valid
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-20: Volunteer — Browse Events

```bash
curl -s "http://localhost:3000/api/events?page=1&limit=10" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"data":[{id,title,description,date,location,capacity,points_value,status,organiser_name,registered_count}]}

curl -s "http://localhost:3000/api/events?search=beach" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# PASS IF: events return with organiser name, search filters work
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-21: Volunteer — Join Event

```bash
# Get first available event
EVENT_ID=$(curl -s "http://localhost:3000/api/events?limit=1" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data[0].id))")

# Join
curl -s -X POST "http://localhost:3000/api/events/$EVENT_ID/register" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: 200 OK — registered successfully

# Try duplicate
curl -s -X POST "http://localhost:3000/api/events/$EVENT_ID/register" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: 409 already_registered error
# PASS IF: duplicate registration is rejected
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-22: Volunteer — Leave Event

```bash
# Leave
curl -s -X DELETE "http://localhost:3000/api/events/$EVENT_ID/register" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: 200 OK — unregistered successfully

# Try double leave
curl -s -X DELETE "http://localhost:3000/api/events/$EVENT_ID/register" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: 404 not_registered error
# PASS IF: double-unregister is rejected
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-23: Volunteer — Get My QR Code

```bash
curl -s http://localhost:3000/api/me/qr-code \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"qr_code":"uuid-string-here"}
# PASS IF: valid UUID returned
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-24: Volunteer — Get My Points

```bash
curl -s http://localhost:3000/api/me/points \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"points_balance":...,"history":[...]}
# PASS IF: balance is non-negative integer
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-25: Volunteer — Get My Coupons

```bash
curl -s http://localhost:3000/api/me/coupons \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"data":[{id,title,pin_code,status,points_cost}]}
# PASS IF: coupon list returns with masked PINs
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-26: Volunteer — Browse Rewards

```bash
curl -s http://localhost:3000/api/rewards \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"data":[{id,title,description,points_required,image_url}]}
# PASS IF: returns active, in-stock coupons only
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-27: Volunteer — Redeem Reward

```bash
# Get first available reward
REWARD_ID=$(curl -s http://localhost:3000/api/rewards \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data[0].id))")

# Redeem
curl -s -X POST "http://localhost:3000/api/rewards/$REWARD_ID/redeem" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"data":{"id":...,"coupon_title":"...","pin":"...","points_balance":...,"remaining_quantity":...}}
# PASS IF: points deducted, PIN generated, redemption logged, pin is 6 digits
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

### 7.4 Merchant API Tests

#### IT-28: Merchant — Verify PIN

```bash
# Get a valid PIN (from a coupon just created)
PIN=$(curl -s "http://localhost:3000/api/admin/coupons" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | node -e "
process.stdin.on('data',d=>{
  const j=JSON.parse(d);
  // Find a coupon with available PINs and get its first PIN
  // Need to call coupon/:id/pins endpoint
})")

# For manual testing, use a known PIN from a created coupon
curl -s -X POST http://localhost:3000/api/coupons/verify \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pin":"123456"}'
# EXPECTED: {"data":{"user_coupon_id":...,"status":"unused","coupon_title":"...","volunteer_name":"...","expiry_date":"..."}}
# PASS IF: valid PIN returns coupon details
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-29: Merchant — Redeem

```bash
# Verify first
curl -s -X POST http://localhost:3000/api/coupons/verify \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pin":"123456"}'

# Then redeem
curl -s -X POST http://localhost:3000/api/coupons/redeem \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pin":"123456"}'
# EXPECTED: PIN status changes to 'used'

# Verify again — should fail
curl -s -X POST http://localhost:3000/api/coupons/verify \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pin":"123456"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).error?.code||JSON.parse(d).data?.status))"
# EXPECTED: already_redeemed or similar
# PASS IF: PIN consumed and cannot be reused
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

### 7.5 Organiser API Tests

#### IT-30: Organiser — Get Dashboard

```bash
curl -s http://localhost:3000/api/organiser/dashboard \
  -H "Authorization: Bearer $ORGANISER_TOKEN"
# EXPECTED: {"stats":{"total_events":...,"total_volunteers":...,"upcoming_events":...}}
# PASS IF: stats are scoped to that organiser's events only
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-31: Organiser — Create Event

```bash
curl -s -X POST http://localhost:3000/api/organiser/events \
  -H "Authorization: Bearer $ORGANISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"OC Test Event","description":"Created by OpenCode","location":"Virtual","event_date":"2026-07-25T09:00:00+08:00","capacity":30,"points_value":20,"category":"education"}'
# EXPECTED: {"data":{"id":...,"title":"OC Test Event",...}}
# PASS IF: event belongs to creating organiser
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-32: Organiser — Create Event No Auth (Role Guard)

```bash
curl -s -X POST http://localhost:3000/api/organiser/events \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Should Fail","description":"test","location":"test","event_date":"2026-07-25","capacity":10,"points_value":10}'
# EXPECTED: 403 Forbidden
# PASS IF: role guard blocks non-organiser
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-33: Attendance — Scan QR (Check-in)

```bash
curl -s -X POST http://localhost:3000/api/attendance/scan \
  -H "Authorization: Bearer $ORGANISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_id":1,"qr_code_value":"'"$(curl -s http://localhost:3000/api/me/qr-code -H 'Authorization: Bearer $VOLUNTEER_TOKEN' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).qr_code))")"'"}'
# EXPECTED: check-in recorded, points awarded if applicable
# PASS IF: attendance_logs has new entry for that volunteer+event
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-34: Attendance — Duplicate Scan

```bash
# First scan
curl -s -X POST http://localhost:3000/api/attendance/scan \
  -H "Authorization: Bearer $ORGANISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_id":1,"qr_code_value":"test-qr-code"}'
# EXPECTED: 200 OK

# Duplicate scan
curl -s -X POST http://localhost:3000/api/attendance/scan \
  -H "Authorization: Bearer $ORGANISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_id":1,"qr_code_value":"test-qr-code"}'
# EXPECTED: 409 already_checked_in error
# PASS IF: duplicate scan is rejected
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

---

### 7.6 F1–F4 Feature Tests

#### IT-35: F1 — AI Event Recommendations

```bash
curl -s http://localhost:3000/api/events/recommended \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"data":[{id,title,event_date,category,points_value,relevance_score}]}
# PASS IF: returns array with relevance_score field, max 5 events
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-36: F1 — Popular Events (Fallback)

```bash
curl -s http://localhost:3000/api/events/popular \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"data":[{id,title,event_date,category,points_value,registrations}]}
# PASS IF: returns array sorted by registration count
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-37: F1 — Recommendations Without History

```bash
# Register new user with no history
NEW_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Fresh User","email":"fresh_'"$(date +%s)"'@test.com","password":"password123"}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

curl -s http://localhost:3000/api/events/recommended \
  -H "Authorization: Bearer $NEW_TOKEN"
# EXPECTED: Falls back to popular events (not empty)
# PASS IF: gracefully falls back to popular events
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-38: F2 — AI Feedback Summary

```bash
# Get completed event with feedback
FEEDBACK_EVENT_ID=1  # Use known event ID with feedback
curl -s "http://localhost:3000/api/events/$FEEDBACK_EVENT_ID/feedback/summary" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"data":{"event_title":"...","total_feedback":...,"overall_sentiment":"...","average_rating":...,"breakdown":{...},"top_positive_keywords":[...],"top_negative_keywords":[...]}}
# PASS IF: sentiment analysis returns valid structure
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-39: F2 — Feedback Summary Empty Event

```bash
# Use an event ID with no feedback
NEW_EVENT_ID=$(curl -s -X POST http://localhost:3000/api/organiser/events \
  -H "Authorization: Bearer $ORGANISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Empty Feedback Test","description":"test","location":"test","event_date":"2026-08-01T09:00:00+08:00","capacity":10,"points_value":10,"category":"education"}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data?.id||''))")

curl -s "http://localhost:3000/api/events/$NEW_EVENT_ID/feedback/summary" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"data":{"total_feedback":0,"overall_sentiment":"neutral"}}
# PASS IF: returns neutral with zero count
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-40: F3 — Sponsorship Registration with Upline

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Sponsored User","email":"sponsored_'"$(date +%s)"'@test.com","password":"password123","upline_1_email":"carol@test.com","upline_2_email":"alice@test.com"}'
# EXPECTED: User created. Upline emails saved.
# PASS IF: new user's profile shows both upline emails
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-41: F3 — Sponsorship Profile

```bash
SPONSORED_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sponsored_...@test.com","password":"password123"}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

curl -s http://localhost:3000/api/me/sponsorship-profile \
  -H "Authorization: Bearer $SPONSORED_TOKEN"
# EXPECTED: {"email":"...","upline_1_email":"carol@test.com","upline_2_email":"alice@test.com","downline_1st_level_count":...,"downline_2nd_level_count":...,"total_sponsorship_points":...}
# PASS IF: all fields present with correct upline data
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-42: F3 — Admin Sponsorship Config Read

```bash
curl -s http://localhost:3000/api/admin/sponsorship/configuration \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: {"direct_sponsor_points":...,"helped_sponsor_points":...,"upline_helper_points":...,"updated_at":"..."}
# PASS IF: returns all 3 point config fields
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-43: F3 — Admin Sponsorship Config Update

```bash
curl -s -X PUT http://localhost:3000/api/admin/sponsorship/configuration \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"direct_sponsor_points":20,"helped_sponsor_points":5,"upline_helper_points":10}'

# Read back
curl -s http://localhost:3000/api/admin/sponsorship/configuration \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);console.log(j.direct_sponsor_points,j.helped_sponsor_points,j.upline_helper_points)})"
# EXPECTED: 20 5 10
# PASS IF: values persist after save and reload
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-44: F4 — Leaderboard All Categories

```bash
curl -s http://localhost:3000/api/leaderboard \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"data":{"most_points":[...],"most_events":[...],"most_checkins":[...],"most_redeemed":[...]}}
# PASS IF: returns all 4 categories with rank numbers, max 3 items each
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### IT-45: F4 — Leaderboard Individual Categories

```bash
for category in points events checkins redeemed; do
  echo "=== $category ==="
  curl -s "http://localhost:3000/api/leaderboard/$category" \
    -H "Authorization: Bearer $VOLUNTEER_TOKEN"
done
# EXPECTED: Each returns {"data":[{id,name,score,rank}]}, max 3 items
# PASS IF: each endpoint returns valid data
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

---

## 8. Phase 3 — Regression Tests

### Scope
Verify previously identified bug fixes remain intact.

#### REG-01: Organiser Role Name Query

```bash
curl -s http://localhost:3000/api/admin/organisers \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: Returns list of organisers, NOT empty array
# PASS IF: organiser list is not empty (bug fix: role name query was broken)
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### REG-02: Events Query Uses event_date

```bash
curl -s http://localhost:3000/api/events \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: Returns events. No HTTP 500.
# PASS IF: 200 returned with event data (bug fix: was using start_time not event_date)
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### REG-03: Duplicate Scan Returns 409

```bash
# Covered by IT-34 — verify once more
curl -s -X POST http://localhost:3000/api/attendance/scan \
  -H "Authorization: Bearer $ORGANISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_id":1,"qr_code_value":"regression-test"}'

curl -s -X POST http://localhost:3000/api/attendance/scan \
  -H "Authorization: Bearer $ORGANISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_id":1,"qr_code_value":"regression-test"}' \
  | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);console.log(j.error?.code||j.statusCode)})
# EXPECTED: already_checked_in or 409
# PASS IF: duplicate scan correctly rejected
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### REG-04: User List Sorted by Role

```bash
curl -s http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | node -e "
process.stdin.on('data',d=>{
  const j=JSON.parse(d);
  const roles=j.data.map(u=>u.role);
  const order=['admin','organiser','merchant','volunteer'];
  const idx=roles.map(r=>order.indexOf(r));
  const sorted=[...idx].sort((a,b)=>a-b);
  console.log('Role order correct:',JSON.stringify(idx)===JSON.stringify(sorted));
})"
# EXPECTED: Users ordered: Admin → Organiser → Merchant → Volunteer
# PASS IF: role order matches hierarchy
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### REG-05: RedeemReward Argument Order

```bash
# Covered by IT-27 — verify no SQL/arg errors
REWARD_ID=$(curl -s http://localhost:3000/api/rewards \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data[0].id))")

curl -s -X POST "http://localhost:3000/api/rewards/$REWARD_ID/redeem" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"
# EXPECTED: {"data":{"id":...,"pin":"...","points_balance":...}} — no SQL error
# PASS IF: redemption succeeds without error (bug fix: controller/service arg mismatch)
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

---

## 9. Phase 4 — System Tests (Automated E2E)

### Scope
Complete end-to-end workflows spanning multiple portals and users. OpenCode executes all steps sequentially.

#### ST-01: Full Volunteer Journey

| Field | Value |
|-------|-------|
| **Workflow** | Register → Browse Events → Join Event → Attend (QR scan) → Earn Points → Check Points → Browse Rewards → Redeem → View PIN |
| **OpenCode Script** | Execute steps 1-8 sequentially, verify each |
| **Portals Involved** | Volunteer Mobile App, Organiser PWA, Backend API |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |

```bash
# OpenCode: Execute this entire block
echo "=== ST-01: Full Volunteer Journey ==="

# 1. Register new volunteer
REG=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"ST-01 User","email":"st01_'"$(date +%s)"'@test.com","password":"password123"}')
ST01_TOKEN=$(echo $REG | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")
echo "1. Registered: $(echo $REG | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).user?.id||'FAIL'))")"

# 2. Browse events
EVENTS=$(curl -s "http://localhost:3000/api/events?limit=5" -H "Authorization: Bearer $ST01_TOKEN")
echo "2. Events loaded: $(echo $EVENTS | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data?.length||0))") found"

# 3. Join first event
EVENT_ID=$(echo $EVENTS | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data[0]?.id||''))")
JOIN=$(curl -s -X POST "http://localhost:3000/api/events/$EVENT_ID/register" \
  -H "Authorization: Bearer $ST01_TOKEN")
echo "3. Joined event: $(echo $JOIN | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).message||'FAIL'))")"

# 4. Get QR code
QR=$(curl -s http://localhost:3000/api/me/qr-code -H "Authorization: Bearer $ST01_TOKEN")
QR_VAL=$(echo $QR | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).qr_code||'FAIL'))")
echo "4. QR Code: $QR_VAL"

# 5. Organiser scans QR (simulate check-in)
SCAN=$(curl -s -X POST http://localhost:3000/api/attendance/scan \
  -H "Authorization: Bearer $ORGANISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"event_id\":$EVENT_ID,\"qr_code_value\":\"$QR_VAL\"}")
echo "5. QR scanned: $(echo $SCAN | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);console.log(j.message||j.data?.message||'OK')})")"

# 6. Check points
POINTS=$(curl -s http://localhost:3000/api/me/points -H "Authorization: Bearer $ST01_TOKEN")
echo "6. Points: $(echo $POINTS | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).points_balance))")"

# 7. Browse + redeem reward
REWARDS=$(curl -s http://localhost:3000/api/rewards -H "Authorization: Bearer $ST01_TOKEN")
RW_ID=$(echo $REWARDS | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);console.log(j.data[0]?.id||'')})")
REDEEM=$(curl -s -X POST "http://localhost:3000/api/rewards/$RW_ID/redeem" \
  -H "Authorization: Bearer $ST01_TOKEN")
echo "7. Redeemed: $(echo $REDEEM | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d).data;console.log(j?.pin||'FAIL')})")"

# 8. View PIN
echo "8. PIN visible: $(echo $REDEEM | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d).data;console.log(j?.pin?.length===6?'YES':'NO')})")"

echo "=== ST-01 Complete ==="
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### ST-02: Full Admin Journey

```bash
echo "=== ST-02: Full Admin Journey ==="

# 1. Login
echo "1. Admin logged in: OK"

# 2. Dashboard
DASH=$(curl -s http://localhost:3000/api/admin/dashboard -H "Authorization: Bearer $ADMIN_TOKEN")
echo "2. Dashboard stats: $(echo $DASH | node -e "process.stdin.on('data',d=>console.log(Object.keys(JSON.parse(d).stats||{})).join(','))")"

# 3. Pending organisers
PEND=$(curl -s "http://localhost:3000/api/admin/organisers?status=pending" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "3. Pending organisers: $(echo $PEND | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data?.length||0))")"

# 4. Approve organiser
# (skipped if no pending)

# 5. Create merchant
MERC=$(curl -s -X POST http://localhost:3000/api/admin/merchants \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"ST-02 Cafe","contact_person":"Test","contact_email":"st02_'"$(date +%s)"'@test.com"}')
echo "5. Merchant created: $(echo $MERC | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).merchant?.id||(JSON.parse(d).message?.substring(0,30)||'FAIL')))")"

# 6. Create coupon batch
COUP=$(curl -s -X POST http://localhost:3000/api/admin/coupons \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"ST-02 Voucher","value_cents":500,"quantity":3,"expiry_date":"2026-12-31"}')
echo "6. Coupon created: PINs: $(echo $COUP | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).pins_generated))")"

# 7. View PINs
CID=$(echo $COUP | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).coupon?.id))")
PINS=$(curl -s "http://localhost:3000/api/admin/coupons/$CID/pins" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "7. PINs viewable: $(echo $PINS | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data?.length))")"

# 8. Redemption history
HIST=$(curl -s "http://localhost:3000/api/admin/redemptions?limit=5" -H "Authorization: Bearer $ADMIN_TOKEN")
echo "8. Redemption history: $(echo $HIST | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data?.length||0))") entries"

echo "=== ST-02 Complete ==="
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### ST-03: Full Merchant Journey

```bash
echo "=== ST-03: Full Merchant Journey ==="

# 1. Merchant login
echo "1. Merchant logged in: OK"

# 2. Enter PIN (use a PIN from a newly redeemed coupon)
# Need a volunteer to have redeemed a coupon first
PIN=$(curl -s http://localhost:3000/api/me/coupons \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" \
  | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d).data;if(j&&j.length)console.log(j[0].pin_code)})")

if [ -n "$PIN" ]; then
  # 3. Verify
  VERIFY=$(curl -s -X POST http://localhost:3000/api/coupons/verify \
    -H "Authorization: Bearer $MERCHANT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"pin\":\"$PIN\"}")
  echo "3. PIN verify: $(echo $VERIFY | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data?.coupon_title||JSON.parse(d).error?.code||'FAIL'))")"

  # 4. Redeem
  REDEEM=$(curl -s -X POST http://localhost:3000/api/coupons/redeem \
    -H "Authorization: Bearer $MERCHANT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"pin\":\"$PIN\"}")
  echo "4. Redeemed: $(echo $REDEEM | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data?.status||JSON.parse(d).message||'FAIL'))")"

  # 5. History
  HIST=$(curl -s http://localhost:3000/api/merchant/history \
    -H "Authorization: Bearer $MERCHANT_TOKEN")
  echo "5. History: $(echo $HIST | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data?.length||0))") entries"
else
  echo "3-5: Skipped — no volunteer coupons available"
fi

echo "=== ST-03 Complete ==="
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### ST-04: Full Organiser Journey

```bash
echo "=== ST-04: Full Organiser Journey ==="

# 1. Login
echo "1. Organiser logged in: OK"

# 2. Dashboard
DASH=$(curl -s http://localhost:3000/api/organiser/dashboard \
  -H "Authorization: Bearer $ORGANISER_TOKEN")
echo "2. Dashboard: $(echo $DASH | node -e "process.stdin.on('data',d=>{const s=JSON.parse(d).stats;console.log('events:',s?.total_events,'vols:',s?.total_volunteers)})")"

# 3. Create event
EVENT=$(curl -s -X POST http://localhost:3000/api/organiser/events \
  -H "Authorization: Bearer $ORGANISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"ST-04 Event","description":"System test","location":"Test","event_date":"2026-08-15T09:00:00+08:00","capacity":50,"points_value":25,"category":"environment"}')
EVENT_ID=$(echo $EVENT | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data?.id||''))")
echo "3. Event created: $EVENT_ID"

# 4. View roster
ROSTER=$(curl -s "http://localhost:3000/api/organiser/events/$EVENT_ID/roster" \
  -H "Authorization: Bearer $ORGANISER_TOKEN")
echo "4. Roster: $(echo $ROSTER | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);console.log(j.data?.length||0,'volunteers')})")"

# 5. Scan volunteer QR
echo "5. QR scan: (tested in ST-01)"

# 6. View feedback (use a completed event)
FEEDBACK=$(curl -s "http://localhost:3000/api/organiser/events/1/feedback" \
  -H "Authorization: Bearer $ORGANISER_TOKEN" 2>/dev/null)
echo "6. Feedback: $(echo $FEEDBACK | node -e "process.stdin.on('data',d=>{try{const j=JSON.parse(d);console.log(j.data?.length||'available')}catch(e){console.log('none')}})" )"

echo "=== ST-04 Complete ==="
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### ST-05: Error Handling — Expired Token

```bash
echo "=== ST-05: Expired Token ==="

# Get a fresh token
FRESH_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

# Decode token to get expiry
PAYLOAD=$(echo $FRESH_TOKEN | cut -d. -f2)
# Pad for base64 decode
case $((${#PAYLOAD} % 4)) in
  2) PAYLOAD="${PAYLOAD}==" ;;
  3) PAYLOAD="${PAYLOAD}=" ;;
esac
EXP=$(echo $PAYLOAD | openssl base64 -d 2>/dev/null | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).exp)}catch(e){console.log('0')}})" 2>/dev/null)
echo "Token expiry: $(date -d @$EXP 2>/dev/null || echo 'checking...')"

# Use a deliberately expired token (manipulate the payload)
# Or test with missing token
NOAUTH=$(curl -s http://localhost:3000/api/admin/dashboard)
echo "No auth: $(echo $NOAUTH | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).error?.code||JSON.parse(d).statusCode||'unknown'))")"
# EXPECTED: 401 unauthorized

# Test with invalid token
BADAUTH=$(curl -s http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.invalid")
echo "Bad token: $(echo $BADAUTH | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).error?.code||JSON.parse(d).statusCode||'unknown'))")"
# EXPECTED: 401

echo "=== ST-05 Complete ==="
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### ST-06: Error Handling — Network Failure

| Field | Value |
|-------|-------|
| **Workflow** | Use app → Disconnect network → Reconnect |
| **Type** | Manual test — requires physical interaction |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

---

## 10. Phase 5 — Security Tests

### Scope
Verify authentication, authorisation, injection protection, rate limiting, and data protection.

#### SEC-01: Authentication — No Token

```bash
curl -s http://localhost:3000/api/admin/dashboard
# EXPECTED: {"error":{"code":"unauthorized","message":"Authentication required"}} — HTTP 401
# PASS IF: 401 returned
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### SEC-02: Authentication — Invalid Token

```bash
curl -s http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer invalid.jwt.token"
# EXPECTED: HTTP 401 with appropriate error
# PASS IF: 401 returned
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### SEC-03: Role Guard — Admin Only

```bash
curl -s http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).error?.code||JSON.parse(d).statusCode||'unknown'))"
# EXPECTED: forbidden or 403
# PASS IF: volunteer cannot access admin API
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### SEC-04: Role Guard — Organiser Only

```bash
curl -s http://localhost:3000/api/organiser/dashboard \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).error?.code||JSON.parse(d).statusCode||'unknown'))"
# EXPECTED: 403
# PASS IF: role guard blocks wrong role
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### SEC-05: SQL Injection — Login

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'"'"' OR 1=1 --","password":"'"'"' OR 1=1 --"}'
# EXPECTED: {"error":{"code":"invalid_credentials"}} with status 401
# NOT a database error or successful login
# PASS IF: SQL injection attempt fails to bypass auth
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### SEC-06: SQL Injection — Admin Search

```bash
curl -s "http://localhost:3000/api/admin/users?search='"'"'; DROP TABLE users; --" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# EXPECTED: Empty search results or validation error. Users table NOT dropped.
# PASS IF: parameterized queries prevent injection
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### SEC-07: Rate Limiting — Login

```bash
echo "=== SEC-07: Rate Limiting ==="
for i in $(seq 1 15); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"carol@test.com","password":"wrong"}')
  echo "Attempt $i: $STATUS"
  if [ "$STATUS" = "429" ]; then
    echo "Rate limiter engaged at attempt $i!"
    break
  fi
done
# PASS IF: rate limiter kicks in after N failed attempts
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### SEC-08: Rate Limiting — Registration

```bash
echo "=== SEC-08: Registration Rate Limit ==="
for i in $(seq 1 10); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Bot","email":"bot_'"$i"_$(date +%s)"'@test.com","password":"password123"}')
  echo "Attempt $i: $STATUS"
  if [ "$STATUS" = "429" ]; then
    echo "Rate limiter engaged!"
    break
  fi
done
# PASS IF: registration rate limiter is active
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### SEC-09: JWT Token Expiry

```bash
# Obtain token and check exp claim
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

# Decode JWT payload (base64url)
PAYLOAD=$(echo "$TOKEN" | cut -d. -f2)
# Add padding
case $((${#PAYLOAD} % 4)) in
  2) PAYLOAD="${PAYLOAD}==" ;;
  3) PAYLOAD="${PAYLOAD}=" ;;
esac
DECODED=$(echo "$PAYLOAD" | openssl base64 -d 2>/dev/null || echo "{}")
echo "Token payload: $DECODED"
# EXPECTED: Token has reasonable expiry (e.g., exp set to 15-60 min from now)
# PASS IF: access token has exp claim and refresh mechanism works
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### SEC-10: PIN Brute Force Protection

```bash
echo "=== SEC-10: PIN Brute Force ==="
for i in $(seq 1 20); do
  RAND_PIN=$(printf "%06d" $((RANDOM % 1000000)))
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/coupons/verify \
    -H "Authorization: Bearer $MERCHANT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"pin\":\"$RAND_PIN\"}")
  if [ "$STATUS" != "404" ] && [ "$STATUS" != "400" ]; then
    echo "Attempt $i: $STATUS (unexpected)"
  fi
  if [ "$STATUS" = "429" ]; then
    echo "Rate limiting engaged at attempt $i!"
    break
  fi
done
# PASS IF: rapid sequential PIN attempts are throttled or rate-limited
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### SEC-11: Password Hashing

```bash
USER_ID=$(curl -s "http://localhost:3000/api/admin/users?limit=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data[0].id))")

curl -s "http://localhost:3000/api/admin/users/$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);console.log('has password_hash:',j.password_hash!==undefined);console.log('has password:',j.password!==undefined)})"
# EXPECTED: false for both (password_hash and password MUST NOT be in response)
# PASS IF: no password or hash is exposed in any endpoint
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### SEC-12: Data Isolation

```bash
echo "=== SEC-12: Data Isolation ==="

# Get organiser A's events
ORG_A_EVENTS=$(curl -s http://localhost:3000/api/organiser/events \
  -H "Authorization: Bearer $ORGANISER_TOKEN" \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data?.length||0))")
echo "Organiser A events: $ORG_A_EVENTS"

# Get organiser B's events (need a different organiser token)
# Or verify that a volunteer cannot access organiser events at all
VOL_ACCESS=$(curl -s http://localhost:3000/api/organiser/events \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).error?.code||JSON.parse(d).statusCode||'unknown'))")
echo "Volunteer accessing organiser endpoint: $VOL_ACCESS"
# EXPECTED: 403 — volunteer cannot see any organiser's events

# PASS IF: data isolation is enforced between roles and organisers only see their own events
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

---

## 11. Phase 6 — Performance Tests

### Scope
Verify response times under normal and moderate load. OpenCode runs `autocannon` and parses results.

#### PT-01: API Response Time — Dashboard

```bash
autocannon -c 10 -d 10 http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN" 2>&1 | tail -20
# EXPECTED: Average response time < 500ms
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### PT-02: API Response Time — User List

```bash
autocannon -c 10 -d 10 "http://localhost:3000/api/admin/users?limit=15" \
  -H "Authorization: Bearer $ADMIN_TOKEN" 2>&1 | tail -20
# EXPECTED: Average response time < 300ms
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### PT-03: API Response Time — Coupon List

```bash
autocannon -c 10 -d 10 http://localhost:3000/api/admin/coupons \
  -H "Authorization: Bearer $ADMIN_TOKEN" 2>&1 | tail -20
# EXPECTED: Average response time < 300ms
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### PT-04: API Response Time — Login

```bash
autocannon -c 5 -d 10 -m POST \
  -H "Content-Type: application/json" \
  -b '{"email":"carol@test.com","password":"password123"}' \
  http://localhost:3000/api/auth/login 2>&1 | tail -20
# EXPECTED: Average response time < 500ms
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### PT-05: API Response Time — Event List

```bash
autocannon -c 10 -d 10 "http://localhost:3000/api/events?limit=20" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" 2>&1 | tail -20
# EXPECTED: Average response time < 300ms
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### PT-06: API Response Time — Reward Redeem

```bash
REWARD_ID=$(curl -s http://localhost:3000/api/rewards \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data[0].id))")

autocannon -c 5 -d 10 -m POST \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/rewards/$REWARD_ID/redeem 2>&1 | tail -20
# EXPECTED: Average response time < 500ms (includes DB writes)
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### PT-07: Pagination Correctness

```bash
echo "=== PT-07: Pagination Correctness ==="

# Get page 1
P1=$(curl -s "http://localhost:3000/api/admin/users?page=1&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
P1_IDS=$(echo $P1 | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data.map(u=>u.id).join(',')))")
P1_TOTAL=$(echo $P1 | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).total))")

# Get page 2
P2=$(curl -s "http://localhost:3000/api/admin/users?page=2&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
P2_IDS=$(echo $P2 | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data.map(u=>u.id).join(',')))")

echo "Page 1 IDs: $P1_IDS"
echo "Page 2 IDs: $P2_IDS"
echo "Total users: $P1_TOTAL"

# Check for duplicates
DUPES=$(echo "$P1_IDS,$P2_IDS" | node -e "
process.stdin.on('data',d=>{
  const ids=d.toString().trim().split(',').filter(Boolean);
  const unique=[...new Set(ids)];
  console.log('Unique:',unique.length,'Total:',ids.length,'Duplicates:',ids.length-unique.length);
})")
echo "$DUPES"
# PASS IF: No duplicate IDs across pages, total count matches
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

#### PT-08: Concurrent Requests

```bash
echo "=== PT-08: Concurrent Requests ==="

# Simulate 3 concurrent users with autocannon to multiple endpoints
autocannon -c 3 -d 15 \
  http://localhost:3000/api/admin/dashboard \
  http://localhost:3000/api/events?limit=5 \
  http://localhost:3000/api/rewards 2>&1 | tail -20
# EXPECTED: No errors, all requests complete
# PASS IF: no deadlocks, no errors, all requests succeed
```

| Field | Value |
|-------|-------|
| **Status** | ⬜ |

---

## 12. Phase 7 — User Acceptance Tests (Manual)

### Scope
Real-world scenarios requiring human interaction. These are NOT automated by OpenCode — assign to team members.

| Test ID | User Story | Steps | Assigned To | Status |
|---------|-----------|-------|-------------|--------|
| UAT-01 | Admin onboards new organiser | Approve organiser, check user status | Xon | ⬜ |
| UAT-02 | Admin manages coupons | Create, view PINs, filter chips | Xon | ⬜ |
| UAT-03 | Admin configures rewards | Change ppd, verify coupon points update | Xon | ⬜ |
| UAT-04 | Volunteer browses and joins events | Browse, search, join, view QR | Vivian | ⬜ |
| UAT-05 | Volunteer redeems rewards | Redeem, view PIN, check coupons | Grace | ⬜ |
| UAT-06 | Merchant verifies PIN | Enter PIN, redeem, check history | Grace | ⬜ |
| UAT-07 | Organiser manages events | Create event, roster, QR scan | Vivian/Nurain | ⬜ |
| UAT-08 | Role-based access control | Cross-role access checks | Nurain | ⬜ |

Detailed step-by-step for each UAT is in the [v1.2 Reference](#) Section 7.

---

## 13. OpenCode Prompt References

### 13.1 Prompt File Inventory

All OpenCode task prompts are stored at `prompts/opencode/tasks/` and follow this naming convention:

| File | Phase | Purpose | Level |
|------|-------|---------|-------|
| `01-events-service.md` | P1 | Write events.service.test.js | Service |
| `02-attendance-service.md` | P1 | Write attendance.service.test.js | Service |
| `03-rewards-service.md` | P1 | Write rewards.service.test.js | Service |
| `04-referral-service.md` | P1 | Write referral.service.test.js | Service |
| `05-organiser-service.md` | P1 | Write organiser.service.test.js | Service |
| `06-leaderboard-service.md` | P1 | Write leaderboard.service.test.js | Service |
| `07-feedback-service.md` | P1 | Write feedback.service.test.js | Service |
| `08-me-service.md` | P1 | Write me.service.test.js | Service |
| `09-email-service.md` | P1 | Write email.service.test.js | Service |
| `10-sponsorshipConfig-service.md` | P1 | Write sponsorshipConfig.service.test.js | Service |
| `11-expand-existing-tests.md` | P1 | Expand admin + merchant test coverage | Service |

### 13.2 Runner Scripts

```powershell
# prompts/opencode/runner.ps1 — Batch run all tasks
# (created separately — see Testing_Backlog.md)
```

### 13.3 Master OpenCode Execution Command

For a full automated run of all phases (P1–P6), OpenCode can be invoked with the entire v2.0 document:

```powershell
# Feed this entire document as a prompt to OpenCode
opencode run "$(Get-Content 'docs/Test Plan & Case Spec v2.1.md' -Raw)"
```

Or use focused execution by phase:

```powershell
# Phase 1 only: Write and run unit tests
opencode run "Execute Phase 1 from docs/Test Plan & Case Spec v2.1.md"

# Phase 2–6: Run integration, regression, system, security, performance
opencode run "Execute Phases 2-6 from docs/Test Plan & Case Spec v2.1.md"
```

---

## 14. Test Results Log

*Execution status tracking. Updated by OpenCode after each phase execution.*

### 14.1 Unit Tests (Phase 1)

| Test ID | File | OpenCode Prompt | Date | Status | Notes |
|---------|------|-----------------|------|--------|-------|
| UT-01 | auth.service.test.js | (existing) | — | ✅ Pass | Register success |
| UT-02 | auth.service.test.js | (existing) | — | ✅ Pass | Duplicate email |
| UT-03 | auth.service.test.js | (existing) | — | ✅ Pass | Login success |
| UT-04 | auth.service.test.js | (existing) | — | ✅ Pass | Wrong password |
| UT-05 | auth.service.test.js | (existing) | — | ✅ Pass | Token refresh |
| UT-06 | auth.service.test.js | (existing) | — | ✅ Pass | Invalid refresh |
| UT-07 | admin.service.test.js | (existing) | — | ✅ Pass | Points calc (ppd=100) |
| UT-08 | admin.service.test.js | (existing) | — | ✅ Pass | Config change (ppd=50) |
| UT-09 | admin.service.test.js | (existing) | — | ✅ Pass | Auto-calc on create |
| UT-10 | admin.service.test.js | (existing) | — | ✅ Pass | PIN hash deterministic |
| UT-11 | *pending write* | 01-events-service | — | ⬜ | PIN uniqueness |
| UT-12 | merchant.service.test.js | (existing) | — | ✅ Pass | PIN verify valid |
| UT-13 | merchant.service.test.js | (existing) | — | ✅ Pass | PIN verify invalid |
| UT-14 | *pending write* | 03-rewards-service | — | ⬜ | Redeem used PIN |
| UT-15 | *pending write* | 03-rewards-service | — | ⬜ | Reverse within window |
| UT-16 | merchant.service.test.js | (existing) | — | ✅ Pass | Reverse expired window |
| UT-17 | *pending write* | 03-rewards-service | — | ⬜ | Insufficient points |
| UT-18 | *pending write* | 03-rewards-service | — | ⬜ | Sufficient points |

### 14.2 New Service Tests (Written by OpenCode)

| Test ID | File | Service | Date | Status | Notes |
|---------|------|---------|------|--------|-------|
| P1-01 | events.service.test.js | Events | — | ⬜ | |
| P1-02 | attendance.service.test.js | Attendance | — | ⬜ | |
| P1-03 | rewards.service.test.js | Rewards | — | ⬜ | |
| P1-04 | referral.service.test.js | Referral | — | ⬜ | |
| P1-05 | organiser.service.test.js | Organiser | — | ⬜ | |
| P1-06 | leaderboard.service.test.js | Leaderboard | — | ⬜ | |
| P1-07 | feedback.service.test.js | Feedback | — | ⬜ | |
| P1-08 | me.service.test.js | Me | — | ⬜ | |
| P1-09 | email.service.test.js | Email | — | ⬜ | |
| P1-10 | sponsorshipConfig.service.test.js | Sponsorship Config | — | ⬜ | |
| P1-11 | admin/merchant expanded | Admin + Merchant | — | ⬜ | |

### 14.3 Integration Tests (Phase 2)

| Test ID | Endpoint | Date | Status | Notes |
|---------|----------|------|--------|-------|
| IT-01 | `GET /api/health` | — | ⬜ | |
| IT-02 | `POST /api/auth/login` | — | ⬜ | |
| IT-03 | `GET /api/admin/dashboard` | — | ⬜ | |
| IT-04 | `GET /api/admin/users` | — | ⬜ | |
| IT-05 | `GET /api/admin/users/:id` | — | ⬜ | |
| IT-06 | `PUT /api/admin/users/:id` | — | ⬜ | |
| IT-07 | `GET /api/admin/organisers` | — | ⬜ | |
| IT-08 | `PUT /api/admin/organisers/:id/approve` | — | ⬜ | |
| IT-09 | `GET /api/admin/events` | — | ⬜ | |
| IT-10 | `GET /api/admin/coupons` | — | ⬜ | |
| IT-11 | `POST /api/admin/coupons` | — | ⬜ | |
| IT-12 | `GET /api/admin/coupons/:id/pins` | — | ⬜ | |
| IT-13 | `GET /api/admin/rewards/configuration` | — | ⬜ | |
| IT-14 | `PUT /api/admin/rewards/configuration` | — | ⬜ | |
| IT-15 | `GET /api/admin/redemptions` | — | ⬜ | |
| IT-16 | `GET /api/admin/merchants` | — | ⬜ | |
| IT-17 | `POST /api/admin/merchants` | — | ⬜ | |
| IT-18 | `DELETE /api/admin/coupons/:id` | — | ⬜ | |
| IT-19 | `POST /api/auth/register` | — | ⬜ | |
| IT-20 | `GET /api/events` | — | ⬜ | |
| IT-21 | `POST /api/events/:id/register` | — | ⬜ | |
| IT-22 | `DELETE /api/events/:id/register` | — | ⬜ | |
| IT-23 | `GET /api/me/qr-code` | — | ⬜ | |
| IT-24 | `GET /api/me/points` | — | ⬜ | |
| IT-25 | `GET /api/me/coupons` | — | ⬜ | |
| IT-26 | `GET /api/rewards` | — | ⬜ | |
| IT-27 | `POST /api/rewards/:id/redeem` | — | ⬜ | |
| IT-28 | `POST /api/coupons/verify` | — | ⬜ | |
| IT-29 | `POST /api/coupons/redeem` | — | ⬜ | |
| IT-30 | `GET /api/organiser/dashboard` | — | ⬜ | |
| IT-31 | `POST /api/organiser/events` | — | ⬜ | |
| IT-32 | `POST /api/organiser/events` (wrong role) | — | ⬜ | |
| IT-33 | `POST /api/attendance/scan` | — | ⬜ | |
| IT-34 | `POST /api/attendance/scan` (duplicate) | — | ⬜ | |
| IT-35 | `GET /api/events/recommended` | — | ⬜ | F1 |
| IT-36 | `GET /api/events/popular` | — | ⬜ | F1 |
| IT-37 | Recommendations no history | — | ⬜ | F1 |
| IT-38 | `GET /api/events/:id/feedback/summary` | — | ⬜ | F2 |
| IT-39 | Feedback summary empty | — | ⬜ | F2 |
| IT-40 | Register with upline | — | ⬜ | F3 |
| IT-41 | `GET /api/me/sponsorship-profile` | — | ⬜ | F3 |
| IT-42 | `GET /api/admin/sponsorship/configuration` | — | ⬜ | F3 |
| IT-43 | `PUT /api/admin/sponsorship/configuration` | — | ⬜ | F3 |
| IT-44 | `GET /api/leaderboard` | — | ⬜ | F4 |
| IT-45 | `GET /api/leaderboard/:category` | — | ⬜ | F4 |

### 14.4 Regression Tests (Phase 3)

| Test ID | Bug Fixed | Date | Status | Notes |
|---------|-----------|------|--------|-------|
| REG-01 | Organiser role name query | — | ⬜ | |
| REG-02 | Events query uses event_date | — | ⬜ | |
| REG-03 | Duplicate scan returns 409 | — | ⬜ | |
| REG-04 | User list sorted by role | — | ⬜ | |
| REG-05 | RedeemReward argument order | — | ⬜ | |

### 14.5 System Tests (Phase 4)

| Test ID | Workflow | Date | Status | Notes |
|---------|----------|------|--------|-------|
| ST-01 | Full Volunteer Journey | — | ⬜ | |
| ST-02 | Full Admin Journey | — | ⬜ | |
| ST-03 | Full Merchant Journey | — | ⬜ | |
| ST-04 | Full Organiser Journey | — | ⬜ | |
| ST-05 | Expired Token Handling | — | ⬜ | |
| ST-06 | Network Failure Handling | — | ⬜ | Manual |

### 14.6 Security Tests (Phase 5)

| Test ID | Test | Date | Status | Notes |
|---------|------|------|--------|-------|
| SEC-01 | No Token → 401 | — | ⬜ | |
| SEC-02 | Invalid Token → 401 | — | ⬜ | |
| SEC-03 | Role Guard — Admin Only | — | ⬜ | |
| SEC-04 | Role Guard — Organiser Only | — | ⬜ | |
| SEC-05 | SQL Injection — Login | — | ⬜ | |
| SEC-06 | SQL Injection — Search | — | ⬜ | |
| SEC-07 | Rate Limiting — Login | — | ⬜ | |
| SEC-08 | Rate Limiting — Registration | — | ⬜ | |
| SEC-09 | JWT Token Expiry | — | ⬜ | |
| SEC-10 | PIN Brute Force Protection | — | ⬜ | |
| SEC-11 | Password Hashing | — | ⬜ | |
| SEC-12 | Data Isolation | — | ⬜ | |

### 14.7 Performance Tests (Phase 6)

| Test ID | Endpoint | Date | Avg Resp | Status | Notes |
|---------|----------|------|----------|--------|-------|
| PT-01 | `GET /api/admin/dashboard` | — | — | ⬜ | < 500ms target |
| PT-02 | `GET /api/admin/users?limit=15` | — | — | ⬜ | < 300ms target |
| PT-03 | `GET /api/admin/coupons` | — | — | ⬜ | < 300ms target |
| PT-04 | `POST /api/auth/login` | — | — | ⬜ | < 500ms target |
| PT-05 | `GET /api/events?limit=20` | — | — | ⬜ | < 300ms target |
| PT-06 | `POST /api/rewards/:id/redeem` | — | — | ⬜ | < 500ms target |
| PT-07 | Pagination Correctness | — | — | ⬜ | No dupes |
| PT-08 | Concurrent Requests | — | — | ⬜ | No deadlock |

### 14.8 User Acceptance Tests (Phase 7 — Manual)

| Test ID | User Story | Tester | Date | Status | Notes |
|---------|-----------|--------|------|--------|-------|
| UAT-01 | Admin onboards organiser | — | — | ⬜ | |
| UAT-02 | Admin manages coupons | — | — | ⬜ | |
| UAT-03 | Admin configures rewards | — | — | ⬜ | |
| UAT-04 | Volunteer joins events | — | — | ⬜ | |
| UAT-05 | Volunteer redeems rewards | — | — | ⬜ | |
| UAT-06 | Merchant verifies PIN | — | — | ⬜ | |
| UAT-07 | Organiser manages events | — | — | ⬜ | |
| UAT-08 | Role-based access control | — | — | ⬜ | |

### 14.9 Summary

| Phase | Total | Pass | Fail | Not Run | Notes |
|-------|-------|------|------|---------|-------|
| P1 Unit Tests (existing) | 13 | 13 | 0 | 0 | All existing pass |
| P1 Unit Tests (new, to write) | 11 files | — | — | 11 | To be written by OpenCode |
| P2 Integration | 34 | — | — | 34 | |
| P3 Regression | 5 | — | — | 5 | |
| P4 System | 6 | — | — | 5 | 1 manual (ST-06) |
| P5 Security | 12 | — | — | 12 | |
| P6 Performance | 8 | — | — | 8 | |
| P7 UAT (manual) | 8 | — | — | 8 | Manual only |
| **Total** | **97** | **13** | **0** | **83** | |

---

## 15. Appendices

### Appendix A: OpenCode Batch Runner Script

```powershell
# prompts/opencode/runner.ps1
# Batch run ALL OpenCode test writing tasks sequentially

$ErrorActionPreference = "Continue"
$taskDir = "prompts/opencode/tasks"
$logDir = "prompts/opencode/logs"
$projectDir = "D:\c3000c\volunteering-rewards-app"

# Create logs directory
New-Item -ItemType Directory -Force -Path "$projectDir/$logDir" | Out-Null

# Tasks in priority order
$tasks = @(
    @{file="01-events-service.md"; name="Events Service"},
    @{file="02-attendance-service.md"; name="Attendance Service"},
    @{file="03-rewards-service.md"; name="Rewards Service"},
    @{file="04-referral-service.md"; name="Referral Service"},
    @{file="05-organiser-service.md"; name="Organiser Service"},
    @{file="06-leaderboard-service.md"; name="Leaderboard Service"},
    @{file="07-feedback-service.md"; name="Feedback Service"},
    @{file="08-me-service.md"; name="Me Service"},
    @{file="09-email-service.md"; name="Email Service"},
    @{file="10-sponsorshipConfig-service.md"; name="Sponsorship Config"},
    @{file="11-expand-existing-tests.md"; name="Expand Existing Tests"}
)

Set-Location $projectDir

foreach ($task in $tasks) {
    $promptFile = "$taskDir/$($task.file)"
    $logFile = "$logDir/$($task.file -replace '.md','.log')"
    $taskName = $task.name

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Running: $taskName" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Cyan

    # Run OpenCode
    $startTime = Get-Date
    opencode run "$(Get-Content $promptFile -Raw)" 2>&1 | Tee-Object -FilePath $logFile
    $elapsed = (Get-Date) - $startTime

    Write-Host "`n--- Completed: $taskName ($($elapsed.TotalMinutes.ToString('0.0')) min) ---" -ForegroundColor Green

    # Run npm test to verify
    Write-Host "`nRunning npm test to verify..." -ForegroundColor Yellow
    Set-Location "$projectDir/backend"
    npm test 2>&1 | Tee-Object -FilePath "$projectDir/$logDir/verify-after-$($task.file -replace '.md','').log"
    Set-Location $projectDir

    Write-Host "`nPress any key to continue to next task..." -ForegroundColor Magenta
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
```

### Appendix B: Phase 2–6 Automation Wrapper (Bash)

```bash
#!/bin/bash
# scripts/opencode_integration_runner.sh
# Runs all Phase 2–6 integration/regression/system/security/performance tests

PROJECT="D:/c3000c/volunteering-rewards-app"
LOG_DIR="$PROJECT/prompts/opencode/logs"
DATE=$(date +%Y%m%d_%H%M%S)

echo "=== OpenCode Integration Test Runner ==="
echo "Started: $(date)"
echo "Log dir: $LOG_DIR"

# 1. Verify backend is running
echo "--- Checking backend ---"
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "ERROR: Backend not running. Start with: cd backend && npm run dev"
    exit 1
fi
echo "Backend OK"

# 2. Obtain tokens
echo "--- Obtaining auth tokens ---"
source <(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}' | node -e "
process.stdin.on('data',d=>{
  const j=JSON.parse(d);
  console.log('ADMIN_TOKEN=\"'+j.token+'\"');
})")
# ... (token logic)
echo "Tokens obtained"

# 3. Run Phase 2 — Integration Tests
echo "--- Phase 2: Integration Tests ---"
# IT-01 through IT-45 — see Section 7 for full scripts

# 4. Run Phase 3 — Regression Tests
echo "--- Phase 3: Regression Tests ---"

# 5. Run Phase 4 — System Tests
echo "--- Phase 4: System Tests ---"

# 6. Run Phase 5 — Security Tests
echo "--- Phase 5: Security Tests ---"

# 7. Run Phase 6 — Performance Tests
echo "--- Phase 6: Performance Tests ---"

echo "=== All tests complete: $(date) ==="
```

### Appendix C: Automated Test Runner Reference

| Command | Purpose |
|---------|---------|
| `npm test` | Run all unit tests |
| `npm run test:unit` | Run unit tests only |
| `node --test tests/unit/{file}.test.js` | Run single test file |
| `opencode run "$(cat prompts/opencode/tasks/{task}.md)"` | OpenCode writes + runs tests |
| `powershell -File prompts/opencode/runner.ps1` | Batch run all OpenCode tasks |
| `autocannon -c 10 -d 10 {url}` | Performance load test |
| `curl -s {endpoint}` | Manual API endpoint test |

### Appendix D: Results Logging Format

When a test is executed, update Section 14 with:

```
| TEST-ID | Description | Date | ✅/❌/⏭️ | Notes |
```

OpenCode should follow this convention:
- ✅ **Pass** if response matches expected result and status code
- ❌ **Fail** if response differs from expected
- ⏭️ **Skipped** if prerequisite not met (e.g., no pending organisers)
- Log the actual result in Notes for any ❌ Fail

---

*End of Test Plan & Case Specification v2.1 — OpenCode Automation Edition*
