# Testing Guide — Step by Step for Each Team Member

**Version:** 1.2
**Date:** 30 June 2026 (Updated for Sprint 5)
**Project:** Volunteering Rewards App (C3000C)
**Sprint 5 Period:** 29 Jun – 6 Jul 2026 — Final Testing, APK Testing & Delivery

---

## Overview

This document assigns specific tests to each team member for Sprint 5. Follow your section's instructions step by step, mark results in the Test Plan document, and report any bugs found.

**Four types of tests this sprint:**

1. **Automated Unit Tests** — Run with a single command. No manual steps needed.
2. **Manual Integration / UAT Tests** — Follow the step-by-step instructions.
3. **APK Testing** — Install and test the native Android APK on a real device (see separate `apk-testing-guide_V4.md`).
4. **PWA Verification** — Verify the PWA now shows the same tab-based GUI as the APK.

### Sprint 5 Milestones

| Date | Milestone | Owner |
|------|-----------|-------|
| 30 Jun | ✅ PWA-APK Unification complete | Xon |
| 1 Jul | APK testing starts on real devices | Vivian, Nurain |
| 3 Jul | Security, integration, UAT tests complete | All |
| 5 Jul | Documentation complete | Nurain |
| 6 Jul | Sprint 5 dry-run & handover | All |

---

## Prerequisites (Everyone)

Before starting any tests, ensure:

```bash
# Terminal 1: Backend running
cd D:\c3000c\volunteering-rewards-app\backend
npm run dev

# Terminal 2: Frontend running (for UAT tests)
cd D:\c3000c\volunteering-rewards-app\frontend\web_portals
npm run dev

# Terminal 3: Run migrations if not done
cd D:\c3000c\volunteering-rewards-app\backend
node src/utils/migrationRunner.js

# Seed test data
node scripts/init_coupons.js
```

**Test accounts:**

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Merchant | cheryl@test.com | password123 |

---

## Section A: Xon — Auth & Admin API Tests + APK/PWA

### A1. Re-run Automated Unit Tests (Auth Service)

```bash
cd D:\c3000c\volunteering-rewards-app\backend
node --test tests/unit/auth.service.test.js
```

**Tests covered automatically:**
| ID | Test | What It Checks |
|----|------|---------------|
| UT-01 | Register Success | New user created with valid token |
| UT-02 | Register Duplicate | 409 error for existing email |
| UT-03 | Login Success | Returns user + tokens for valid credentials |
| UT-04 | Login Wrong Password | 401 error for wrong password |
| UT-05 | Token Refresh Success | New tokens returned for valid refresh token |
| UT-06 | Token Refresh Invalid | 401 error for invalid refresh token |

**Expected output:** All tests pass (✓ or ✔).

---

### A2. Run Admin Service Automated Tests

```bash
cd D:\c3000c\volunteering-rewards-app\backend
node --test tests/unit/admin.service.test.js
```

| ID | Test | What It Checks |
|----|------|---------------|
| UT-07 | Points Calculation | $5 Coffee = 500 pts at ppd=100 |
| UT-08 | Config Change | Points update when config changes (ppd=50 → 250) |
| UT-09 | Auto-Calc on Create | `createCoupon` auto-calculates points from value |
| UT-10 | PIN Hashing | HMAC-SHA256 output is deterministic |

---

### A3. APK Build Verification (NEW)

APK is already built at:
```
frontend/mobile_app/android/app/build/outputs/apk/release/app-release.apk
```

**Quick checks:**
1. Confirm APK file exists and is ~83 MB
2. Confirm CI build passes at GitHub Actions
3. Install on test device and verify app launches to login screen

**Full APK testing instructions:** See `docs/apk-testing-guide_V4.md`

---

### A4. PWA Verification (NEW — KAN-157 Complete)

PWA is now deployed at **https://volunteering-rewards-app.vercel.app**

**Verify:**
1. Open PWA in browser — should show Vivian's tab-based GUI (Home / Events / Rewards / Profile)
2. Login with `alice@test.com` / `password123`
3. Confirm bottom tabs appear (Home, Events, Rewards, Profile)
4. Browse events → join one → confirm QR code displays
5. Test rewards browsing

---

### A5. Manual Integration Tests (Admin API)

Run these with backend running locally:

```bash
cd D:\c3000c\volunteering-rewards-app\backend

:: IT-01: Health Check
curl http://localhost:3000/api/health
:: EXPECTED: {"status":"ok","timestamp":"...","uptime":...}

:: Get admin token
set TOKEN_ADMIN=
for /f "tokens=*" %i in ('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"carol@test.com\",\"password\":\"password123\"}" ^| node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))"') do set TOKEN_ADMIN=%i

:: IT-03: Admin Dashboard
curl http://localhost:3000/api/admin/dashboard -H "Authorization: Bearer %TOKEN_ADMIN%"
:: EXPECTED: {"stats":{"total_users":...,"total_organisers":...,"total_events":...}}

:: IT-04: List Users
curl "http://localhost:3000/api/admin/users?limit=5" -H "Authorization: Bearer %TOKEN_ADMIN%"
:: EXPECTED: {"data":[...],"total":...,"page":1,"limit":5}

:: IT-15: Redemption List
curl "http://localhost:3000/api/admin/redemptions?limit=5&sort=points_spent&order=asc" -H "Authorization: Bearer %TOKEN_ADMIN%"
:: EXPECTED: Sorted by points_spent ascending
```

---

## Section B: Grace — Rewards & Merchant Tests

### B1. Run Automated Unit Tests

```bash
cd D:\c3000c\volunteering-rewards-app\backend
node --test tests/unit/merchant.service.test.js
```

| ID | Test | What It Checks |
|----|------|---------------|
| UT-12 | PIN Verify Success | Valid PIN returns coupon details |
| UT-13 | PIN Verify Invalid | Non-existent PIN returns 404 |
| UT-16 | Reverse Expired Window | >5 min reversal attempts are rejected |

---

### B2. Manual Integration Tests

```bash
:: Get merchant token
set TOKEN_MERCHANT=
for /f "tokens=*" %i in ('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"cheryl@test.com\",\"password\":\"password123\"}" ^| node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))"') do set TOKEN_MERCHANT=%i

:: IT-28: Merchant Verify PIN
curl -X POST http://localhost:3000/api/coupons/verify -H "Authorization: Bearer %TOKEN_MERCHANT%" -H "Content-Type: application/json" -d "{\"pin\":\"123456\"}"
:: EXPECTED: {"data":{"user_coupon_id":...,"status":"unused","coupon_title":"...","volunteer_name":"...","expiry_date":"..."}}
:: NOTE: Replace "123456" with an actual valid PIN

:: IT-30: Merchant History
curl http://localhost:3000/api/merchant/history -H "Authorization: Bearer %TOKEN_MERCHANT%"
:: EXPECTED: {"data":[...]}
```

---

## Section C: Vivian — Events, QR Attendance & APK Testing

### C1. APK Testing (NEW — Priority Task)

**See separate guide:** `docs/apk-testing-guide_V4.md`

**APK location:** `frontend/mobile_app/android/app/build/outputs/apk/release/app-release.apk`

| Test | What to Do | Est. Time |
|------|-----------|-----------|
| APK-TEST-01 | Install APK → app launch → login flow → verify tab navigation | 45 min |
| APK-TEST-02 | Browse events → join event → check QR code → test rewards | 45 min |

Report any APK-specific bugs (crashes, UI glitches, missing features).

---

### C2. Manual Integration Tests

```bash
:: Get volunteer token
set TOKEN_VOL=
for /f "tokens=*" %i in ('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"alice@test.com\",\"password\":\"password123\"}" ^| node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))"') do set TOKEN_VOL=%i

:: IT-20: Browse Events
curl "http://localhost:3000/api/events?limit=5" -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: {"data":[{id,title,description,date,location,capacity,points_value,status,organiser_name,registered_count}]}

:: IT-21: Join Event
curl -X POST http://localhost:3000/api/events/1/register -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: {"message":"Registered successfully"}

:: IT-23: Get QR Code
curl http://localhost:3000/api/me/qr-code -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: {"qr_code":"uuid-string-here"}

:: IT-24: Get Points
curl http://localhost:3000/api/me/points -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: {"points_balance":...,"history":[...]}

:: IT-26: Browse Rewards
curl http://localhost:3000/api/rewards -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: {"data":[{id,title,description,points_required}]}
```

---

## Section D: Nurain — Organiser Portal Tests, APK Testing & Docs

### D1. APK Testing (NEW — Priority Task)

**See separate guide:** `docs/apk-testing-guide_V4.md`

| Test | What to Do | Est. Time |
|------|-----------|-----------|
| APK-TEST-03 | Rewards browsing → points → QR scanning flow | 45 min |
| APK-TEST-04 | Profile → settings → notifications | 45 min |

---

### D2. Manual Integration Tests

```bash
:: Login as organiser
set TOKEN_ORG=
for /f "tokens=*" %i in ('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"bob@test.com\",\"password\":\"password123\"}" ^| node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))"') do set TOKEN_ORG=%i

:: IT-31: Get Dashboard
curl http://localhost:3000/api/organiser/dashboard -H "Authorization: Bearer %TOKEN_ORG%"

:: IT-32: Create Event
curl -X POST http://localhost:3000/api/organiser/events -H "Authorization: Bearer %TOKEN_ORG%" -H "Content-Type: application/json" -d "{\"title\":\"Test Event\",\"description\":\"Testing\",\"location\":\"Test Location\",\"event_date\":\"2026-07-15T09:00:00+08:00\",\"capacity\":50,\"points_value\":30,\"category\":\"environment\"}"

:: View roster
curl "http://localhost:3000/api/organiser/events/1/roster" -H "Authorization: Bearer %TOKEN_ORG%"

:: IT-33: Role Guard — Try accessing admin endpoint
curl "http://localhost:3000/api/admin/users" -H "Authorization: Bearer %TOKEN_ORG%"
:: EXPECTED: 403 Forbidden
```

### D3. Documentation (Sprint 5)
- Fill in the Project Report draft
- Complete User Manual
- Prepare Presentation slides
- Document all test results in the Test Plan log

---

## Section E: Security Tests — Xon + Vivian

```bash
:: SEC-01: No Token -> 401
curl http://localhost:3000/api/admin/dashboard
:: EXPECTED: HTTP 401

:: SEC-02: Invalid Token -> 401
curl http://localhost:3000/api/admin/dashboard -H "Authorization: Bearer invalid.jwt.here"
:: EXPECTED: HTTP 401

:: SEC-03: Role Guard — Volunteer accessing admin -> 403
curl http://localhost:3000/api/admin/coupons -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: HTTP 403

:: SEC-04: Role Guard — Merchant accessing organiser -> 403
curl http://localhost:3000/api/organiser/events -H "Authorization: Bearer %TOKEN_MERCHANT%"
:: EXPECTED: HTTP 403

:: SEC-05: SQL Injection — Login bypass attempt
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"' OR 1=1--\",\"password\":\"' OR 1=1--\"}"
:: EXPECTED: HTTP 401 (NOT a database error)

:: SEC-06: SQL Injection — Search
curl "http://localhost:3000/api/admin/users?search=';DROP TABLE users;--" -H "Authorization: Bearer %TOKEN_ADMIN%"
:: EXPECTED: Empty search results (NOT a crash)

:: SEC-07: Rate Limiting — Rapid login attempts
for /l %i in (1,1,15) do curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"carol@test.com\",\"password\":\"wrong\"}" >nul
:: EXPECTED: Eventually returns HTTP 429

:: SEC-11: Password hash NOT exposed
curl http://localhost:3000/api/admin/users/1 -H "Authorization: Bearer %TOKEN_ADMIN%"
:: EXPECTED: Response must NOT contain "password_hash" field
```

---

## Section F: Performance Tests — Xon

```bash
:: Install autocannon (one time)
npm install -g autocannon

:: PT-01: Dashboard response time
autocannon -c 10 -d 10 http://localhost:3000/api/admin/dashboard

:: PT-02: User list response time
autocannon -c 10 -d 10 "http://localhost:3000/api/admin/users?limit=15"

:: PT-03: Login response time
autocannon -c 5 -d 10 -m POST -H "Content-Type: application/json" -b "{\"email\":\"carol@test.com\",\"password\":\"password123\"}" http://localhost:3000/api/auth/login

:: PT-07: Pagination correctness
:: Manually verify page 1 + page 2 + page 3 = total count, no duplicates
```

---

## How to Log Results

1. Open `docs/Test Plan & Case Spec v2.1.md`
2. Go to **Section 14 — Test Results Log**
3. For each test you run, update the row with:
   - **Date** (date executed)
   - **Status** (✅ Pass / ❌ Fail / ⏭️ Skipped)
   - **Notes** (if failed, describe the bug)

**If a test fails:**
1. Take a screenshot of the error
2. Note the exact command that failed
3. Report to the team chat immediately

---

## Quick Reference — Sprint 5 Assignments

| Person | Tasks | Est. Time |
|--------|-------|-----------|
| **Xon** | PWA-APK Unification ✅, UAT participation, bug fixes | ~2 hours |
| **Vivian** | APK-TEST-01/02, Security tests (with Xon), UAT volunteer + organiser flows | ~3 hours |
| **Grace** | Integration tests (API endpoints, QR scanning), UAT volunteer journey | ~2 hours |
| **Nurain** | APK-TEST-03/04, Organiser portal tests, Documentation (report, manual, slides) | ~5 hours |
| **All** | System walkthrough, dry-run presentation (5 Jul) | ~2 hours |

---

*End of Testing Guide v1.2*
