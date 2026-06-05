# Testing Guide — Step by Step for Each Team Member

**Date:** 4 June 2026  
**Project:** Volunteering Rewards App (C3000C)  
**Sprint 4 Period:** 15 Jun – 29 Jun 2026  

---

## Overview

This document assigns specific tests to each team member. Follow your section's instructions step by step, mark results in the Test Plan document, and report any bugs found.

**Two types of tests:**
1. **Automated Unit Tests** — Run with a single command. No manual steps needed.
2. **Manual Integration / UAT / Security Tests** — Follow the step-by-step instructions.

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
| Merchant | (create one first via admin panel) | password123 |

---

## Section A: Xon — Auth & Admin API Tests

### A1. Run Automated Unit Tests (Auth Service)

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

**Expected output:** All tests pass (✓ or ✔). If any fail, note the failure in the Test Plan log.

---

### A2. Run Admin Service Automated Tests

```bash
cd D:\c3000c\volunteering-rewards-app\backend
node --test tests/unit/admin.service.test.js
```

**Tests covered automatically:**
| ID | Test | What It Checks |
|----|------|---------------|
| UT-07 | Points Calculation | $5 Coffee = 500 pts at ppd=100 |
| UT-08 | Config Change | Points update when config changes (ppd=50 → 250) |
| UT-09 | Auto-Calc on Create | `createCoupon` auto-calculates points from value |
| UT-10 | PIN Hashing | HMAC-SHA256 output is deterministic |

---

### A3. Manual Integration Tests

Run these commands in order. Record pass/fail in the Test Plan document.

**IT-01 to IT-06: Admin API**

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
```

**IT-15: Redemption List**
```bash
curl "http://localhost:3000/api/admin/redemptions?limit=5&sort=points_spent&order=asc" -H "Authorization: Bearer %TOKEN_ADMIN%"
:: EXPECTED: Sorted by points_spent ascending
```

**IT-18: Rewards Config Save**
```bash
curl -X PUT http://localhost:3000/api/admin/rewards/configuration -H "Authorization: Bearer %TOKEN_ADMIN%" -H "Content-Type: application/json" -d "{\"points_per_dollar\":100,\"min_redeem_points\":50,\"max_redeem_per_day\":5,\"default_event_points\":50}"
:: EXPECTED: {"message":"Configuration updated","updated_at":"..."}
```

---

## Section B: Grace — Rewards & Merchant Tests

### B1. Run Automated Unit Tests

```bash
cd D:\c3000c\volunteering-rewards-app\backend
node --test tests/unit/merchant.service.test.js
```

**Tests covered automatically:**
| ID | Test | What It Checks |
|----|------|---------------|
| UT-12 | PIN Verify Success | Valid PIN returns coupon details |
| UT-13 | PIN Verify Invalid | Non-existent PIN returns 404 |
| UT-16 | Reverse Expired Window | >5 min reversal attempts are rejected |

---

### B2. Manual Integration Tests

```bash
:: Get merchant token (login as merchant)
set TOKEN_MERCHANT=
for /f "tokens=*" %i in ('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"merchant@test.com\",\"password\":\"password123\"}" ^| node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))"') do set TOKEN_MERCHANT=%i

:: IT-28: Merchant Verify PIN
curl -X POST http://localhost:3000/api/coupons/verify -H "Authorization: Bearer %TOKEN_MERCHANT%" -H "Content-Type: application/json" -d "{\"pin\":\"123456\"}"
:: EXPECTED: {"data":{"user_coupon_id":...,"status":"unused","coupon_title":"...","volunteer_name":"...","expiry_date":"...","points_required":...}}
:: NOTE: Replace "123456" with an actual valid PIN. Get one by creating a coupon as admin.

:: IT-30: Merchant History
curl http://localhost:3000/api/merchant/history -H "Authorization: Bearer %TOKEN_MERCHANT%"
:: EXPECTED: {"data":[...]}
```

**UT-14 + UT-15: Full PIN Lifecycle Test (Manual):**
1. Create a coupon as admin (get a PIN)
2. Verify the PIN as merchant → should return coupon details ✅
3. Redeem the PIN → should succeed ✅
4. Verify the same PIN again → should return `already_redeemed` ✅
5. Immediately reverse the redemption → should succeed ✅

**UT-17 + UT-18: Points Deduction Test:**
1. Login as volunteer with known points
2. Note their points balance
3. Redeem a reward
4. Verify points deducted correctly
5. Try redeeming with insufficient points → should return `insufficient_points`

---

## Section C: Vivian — Events & QR Attendance Tests

### C1. Manual Integration Tests

```bash
:: Get volunteer token
set TOKEN_VOL=
for /f "tokens=*" %i in ('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"alice@test.com\",\"password\":\"password123\"}" ^| node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))"') do set TOKEN_VOL=%i

:: IT-20: Browse Events
curl "http://localhost:3000/api/events?limit=5" -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: {"data":[{id,title,description,date,location,capacity,points_value,status,organiser_name,registered_count}]}
:: VERIFY: organiser_name is resolved (not null)

:: IT-21: Join Event
:: Pick an event_id from the list above
curl -X POST http://localhost:3000/api/events/1/register -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: {"message":"Registered successfully"} or {"data":{...}}

:: IT-23: Get QR Code
curl http://localhost:3000/api/me/qr-code -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: {"qr_code":"uuid-string-here"}

:: IT-24: Get Points
curl http://localhost:3000/api/me/points -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: {"points_balance":...,"history":[...]}

:: IT-26: Browse Rewards
curl http://localhost:3000/api/rewards -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: {"data":[{id,title,description,points_required}]}

:: IT-30: Organiser Dashboard
:: Login as organiser
set TOKEN_ORG=
for /f "tokens=*" %i in ('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"bob@test.com\",\"password\":\"password123\"}" ^| node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))"') do set TOKEN_ORG=%i

curl http://localhost:3000/api/organiser/dashboard -H "Authorization: Bearer %TOKEN_ORG%"
:: EXPECTED: {"stats":{...}}

:: IT-33: Scan QR (Attendance)
curl -X POST http://localhost:3000/api/attendance/scan -H "Authorization: Bearer %TOKEN_ORG%" -H "Content-Type: application/json" -d "{\"event_id\":1,\"qr_code_value\":\"volunteer-qr-code-here\"}"
:: EXPECTED: check-in recorded
```

**System Test ST-01: Full Volunteer Journey (most important!)**
1. Register a new volunteer account
2. Browse events → join one
3. Check QR code is displayed
4. Organiser scans the QR code
5. Volunteer checks points increased
6. Browse rewards → redeem one
7. View the PIN code
8. Merchant verifies the PIN

---

## Section D: Nurain — Organiser Portal Tests

### D1. Manual Integration Tests

```bash
:: Login as organiser
set TOKEN_ORG=
for /f "tokens=*" %i in ('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"bob@test.com\",\"password\":\"password123\"}" ^| node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))"') do set TOKEN_ORG=%i

:: IT-31: Get Dashboard
curl http://localhost:3000/api/organiser/dashboard -H "Authorization: Bearer %TOKEN_ORG%"

:: IT-32: Create Event
curl -X POST http://localhost:3000/api/organiser/events -H "Authorization: Bearer %TOKEN_ORG%" -H "Content-Type: application/json" -d "{\"title\":\"Test Event\",\"description\":\"Testing\",\"location\":\"Test Location\",\"event_date\":\"2026-07-15T09:00:00+08:00\",\"capacity\":50,\"points_value\":30,\"category\":\"environment\"}"

:: View created event in list
curl "http://localhost:3000/api/organiser/events" -H "Authorization: Bearer %TOKEN_ORG%"

:: View roster for an event
curl "http://localhost:3000/api/organiser/events/1/roster" -H "Authorization: Bearer %TOKEN_ORG%"

:: IT-33: Role Guard — Try accessing admin endpoint
curl "http://localhost:3000/api/admin/users" -H "Authorization: Bearer %TOKEN_ORG%"
:: EXPECTED: 403 Forbidden
```

---

## Section E: Security Tests — Xon + Vivian

Run each of these and log results.

```bash
:: SEC-01: No Token -> 401
curl http://localhost:3000/api/admin/dashboard
:: EXPECTED: HTTP 401

:: SEC-02: Invalid Token -> 401
curl http://localhost:3000/api/admin/dashboard -H "Authorization: Bearer invalid.jwt.here"
:: EXPECTED: HTTP 401

:: SEC-03: Role Guard — Volunteer accessing admin -> 403
:: Use volunteer token from Section C
curl http://localhost:3000/api/admin/coupons -H "Authorization: Bearer %TOKEN_VOL%"
:: EXPECTED: HTTP 403

:: SEC-04: Role Guard — Merchant accessing organiser -> 403
:: Use merchant token from Section B
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
:: Manually verify that page 1 + page 2 + page 3 = total count
:: with no duplicate records
```

---

## How to Log Results

1. Open `Test Plan & Case Spec.md`
2. Go to **Section 10 — Test Results Log**
3. For each test you run, fill in:
   - **Test ID** (e.g., IT-03)
   - **Tester** (your name)
   - **Date** (date executed)
   - **Status** (✅ Pass / ❌ Fail / ⏭️ Skipped)
   - **Notes** (if failed, describe the bug)

**If a test fails:**
1. Take a screenshot of the error
2. Note the exact command that failed
3. Report to the team chat immediately
4. Create a quick bug note in a `bugs/` folder or team chat

---

## Running All Automated Tests at Once

```bash
cd D:\c3000c\volunteering-rewards-app\backend

:: Run ALL unit tests
node --test tests/unit/*.test.js

:: Expected output:
:: ▶ Auth Service - Register Success ... ✓
:: ▶ Auth Service - Duplicate Email ... ✓
:: ▶ Auth Service - Login Success ... ✓
:: ...
:: ▶ Merchant Service - Reverse Expired ... ✓
:: tests: 10
:: pass: 10
```

---

## Quick Reference — What Each Person Does

| Person | Automated Tests | Manual Tests | UAT Tests | Est. Time |
|--------|----------------|-------------|-----------|-----------|
| **Xon** | auth.service, admin.service | IT-01 to IT-18 | UAT-01, UAT-02, UAT-03 | ~2 hours |
| **Grace** | merchant.service | IT-28 to IT-30, UT-14, UT-15, UT-17, UT-18 | UAT-05, UAT-06 | ~2 hours |
| **Vivian** | — | IT-20 to IT-27, IT-33, IT-34 | UAT-04, UAT-07, ST-01 | ~3 hours |
| **Nurain** | — | IT-30 to IT-32 | UAT-07, UAT-08 | ~2 hours |
| **Xon + Vivian** | — | SEC-01 to SEC-12 | — | ~1 hour |
| **Xon** | — | PT-01 to PT-08 | — | ~1 hour |

**Total team effort: ~11 hours distributed across 4 people** — easily achievable within Sprint 4's 2 weeks.

---

*End of Testing Guide*
