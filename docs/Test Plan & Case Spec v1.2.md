# Test Plan & Test Case Specification

**Project:** Volunteering Rewards App (C3000C)  
**Version:** 1.2  
**Date:** 10 June 2026 (Updated — added F1-F4 features, manual testing, bug fix regressions)  
**Prepared by:** Xon (Team Lead)  
**Status:** Final  

---

## Table of Contents

1. [Test Strategy Overview](#1-test-strategy-overview)
2. [Test Environment](#2-test-environment)
3. [Test Deliverables](#3-test-deliverables)
4. [Unit Tests](#4-unit-tests)
5. [Integration Tests](#5-integration-tests)
5b. [Additional Feature Tests (F1–F4)](#5b-additional-feature-integration-tests-f1f4)
5c. [Bug Fix Regression Tests](#5c-bug-fix-regression-tests)
5d. [Manual Tests — Volunteer Mobile App](#5d-manual-testing--volunteer-mobile-app)
5e. [Manual Tests — Cashier Merchant App](#5e-manual-testing--cashier-merchant-app)
5f. [Manual Tests — Organiser QR Scanner](#5f-manual-testing--organiser-qr-scanner)
5g. [Manual Tests — Admin Portal](#5g-manual-testing--admin-portal-extended)
5h. [End-to-End Cross-Portal Workflow](#5h-end-to-end-cross-portal-workflow)
6. [System Tests](#6-system-tests)
7. [User Acceptance Tests](#7-user-acceptance-tests)
8. [Security Tests](#8-security-tests)
9. [Performance Tests](#9-performance-tests)
10. [Test Results Log](#10-test-results-log)

---

## 1. Test Strategy Overview

### 1.1 Scope

This test plan covers the **Volunteering Rewards App** — a multi-portal platform consisting of:

| Portal | Technology | Users |
|--------|-----------|-------|
| Admin Web Portal | React + Vite | System administrators |
| Organiser Web Portal | React + Vite | Event organisers |
| Volunteer Mobile App | Expo / React Native | Volunteers |
| Merchant Cashier App | Web (PWA) | Merchant cashiers |

### 1.2 Test Types

| # | Test Type | Objective | Owner |
|---|-----------|-----------|-------|
| T1 | Unit Tests | Verify individual functions in isolation | Grace |
| T2 | Integration Tests | Verify API endpoints with real database queries | Grace + Xon |
| T3 | System Tests | Verify end-to-end user workflows across all portals | Whole Team |
| T4 | User Acceptance Tests | Simulate real-world usage scenarios | Whole Team |
| T5 | Security Tests | Verify authentication, authorisation, and data protection | Vivian + Xon |
| T6 | Performance Tests | Verify response times and system behaviour under load | Xon |

### 1.3 Test Data

All tests use the seeded test database with the following accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Merchant | cheryl@test.com | password123 |

---

## 2. Test Environment

### 2.1 Hardware / Software Requirements

| Component | Specification |
|-----------|---------------|
| Backend Server | Node.js v24+, Express, PostgreSQL 16 |
| Frontend Server | Vite dev server (port 5173) or production build |
| Mobile App | Expo Go (iOS/Android) or emulator |
| Database | PostgreSQL 16 on localhost:5432 |
| Browser | Chrome 125+, Edge 125+ (for PWA testing) |

### 2.2 Setup Procedure

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start frontend (separate terminal)
cd frontend/web_portals
npm run dev

# 3. Run database migrations (if not done)
cd backend
node src/utils/migrationRunner.js

# 4. Seed test data (if needed)
node scripts/init_coupons.js
```

### 2.3 Test Status Key

| Status | Meaning |
|--------|---------|
| ⬜ Not Run | Test not yet executed |
| ✅ Pass | Test produced expected result |
| ❌ Fail | Test did not produce expected result |
| ⏭️ Skipped | Test blocked or not applicable |

---

## 3. Test Deliverables

| Deliverable | Description | Included In |
|-------------|-------------|-------------|
| Test Plan (this document) | Strategy, scope, environment, test cases | Project Report Appendix |
| Unit Test Code | Automated test scripts (Node --test or Jest) | Backend `/tests` directory |
| Integration Test Code | API endpoint test scripts | Backend `/tests` directory |
| Test Results Log | Recorded pass/fail for all test cases | Section 10 of this document |
| Bug Report | List of defects found during testing | Separate document |

---

## 4. Unit Tests

### Scope
Test individual service functions in isolation by mocking the database layer or using a test database with known data.

### Location
`backend/src/services/*.service.js` — test each exported function.

---

### UT-01: Auth Service — Register

| Field | Value |
|-------|-------|
| **Function** | `authService.register(data)` |
| **API Endpoint** | `POST /api/auth/register` |
| **Prerequisites** | Database seeded with roles. No duplicate email in DB. |
| **Steps** | 1. Call `register({ name: "Test User", email: "test@test.com", password: "password123" })` |
| **Expected Result** | Returns `{ user: { id, name, email, role: 'volunteer' }, token }` with status 201 |
| **Pass/Fail Criteria** | Pass if user created in `users` table with correct role and token is valid JWT |

### UT-02: Auth Service — Register Duplicate Email

| Field | Value |
|-------|-------|
| **Function** | `authService.register(data)` |
| **API Endpoint** | `POST /api/auth/register` |
| **Prerequisites** | Email `alice@test.com` already exists in DB |
| **Steps** | 1. Call `register({ email: "alice@test.com", password: "password123" })` |
| **Expected Result** | Throws error with code `email_exists` and status 409 |
| **Pass/Fail Criteria** | Pass if 409 returned and no duplicate row created |

### UT-03: Auth Service — Login Success

| Field | Value |
|-------|-------|
| **Function** | `authService.login(data)` |
| **API Endpoint** | `POST /api/auth/login` |
| **Prerequisites** | Admin user `carol@test.com` exists |
| **Steps** | 1. Call `login({ email: "carol@test.com", password: "password123" })` |
| **Expected Result** | Returns `{ user: { id, name, email, role, points }, token, refresh_token }` with status 200 |
| **Pass/Fail Criteria** | Pass if tokens are valid JWTs, user object contains role = 'admin' |

### UT-04: Auth Service — Login Wrong Password

| Field | Value |
|-------|-------|
| **Function** | `authService.login(data)` |
| **API Endpoint** | `POST /api/auth/login` |
| **Prerequisites** | Admin user exists |
| **Steps** | 1. Call `login({ email: "carol@test.com", password: "wrongpassword" })` |
| **Expected Result** | Throws error with code `invalid_credentials` and status 401 |
| **Pass/Fail Criteria** | Pass if 401 returned |

### UT-05: Auth Service — Token Refresh

| Field | Value |
|-------|-------|
| **Function** | `authService.refreshTokens(refreshToken)` |
| **API Endpoint** | `POST /api/auth/refresh` |
| **Prerequisites** | Valid refresh token obtained from login |
| **Steps** | 1. Login to get refresh token. 2. Call `refreshTokens(refreshToken)` |
| **Expected Result** | Returns `{ accessToken, refreshToken, expires_at }` |
| **Pass/Fail Criteria** | Pass if new access token is valid and different from original |

### UT-06: Auth Service — Token Refresh Invalid

| Field | Value |
|-------|-------|
| **Function** | `authService.refreshTokens(refreshToken)` |
| **API Endpoint** | `POST /api/auth/refresh` |
| **Prerequisites** | Expired or invalid token |
| **Steps** | 1. Call `refreshTokens("invalid-token-string")` |
| **Expected Result** | Throws error with status 401 |
| **Pass/Fail Criteria** | Pass if 401 returned |

---

### UT-07: Coupon Service — Points Calculation

| Field | Value |
|-------|-------|
| **Function** | `listCoupons()` internal calculation |
| **API Endpoint** | `GET /api/admin/coupons` |
| **Prerequisites** | Rewards config has `points_per_dollar = 100`. Coupon with `value_cents = 500`. |
| **Steps** | 1. Call listCoupons. 2. Check the `points_cost` and `calculated_points` fields for the \$5 coupon. |
| **Expected Result** | `points_cost = 500` (Math.round(500 * 100 / 100) = 500) |
| **Pass/Fail Criteria** | Pass if calculated value matches formula: `Math.round(value_cents × ppd / 100)` |

### UT-08: Coupon Service — Points Calculation Config Change

| Field | Value |
|-------|-------|
| **Function** | `listCoupons()` internal calculation |
| **API Endpoint** | `GET /api/admin/coupons` |
| **Prerequisites** | Rewards config has `points_per_dollar = 50`. Coupon with `value_cents = 500`. |
| **Steps** | 1. Update config to ppd=50. 2. Call listCoupons. 3. Check points_cost for \$5 coupon. |
| **Expected Result** | `points_cost = 250` (Math.round(500 * 50 / 100) = 250) |
| **Pass/Fail Criteria** | Pass if value changes in real-time without modifying coupon record |

### UT-09: Coupon Service — Auto-Calculate on Create

| Field | Value |
|-------|-------|
| **Function** | `createCoupon(data)` |
| **API Endpoint** | `POST /api/admin/coupons` |
| **Prerequisites** | Rewards config has `points_per_dollar = 100` |
| **Steps** | 1. Create coupon with `value_cents = 750` but no `points_required`. 2. Check the stored `points_required`. |
| **Expected Result** | `points_required = 750` (Math.round(750 * 100 / 100)) |
| **Pass/Fail Criteria** | Pass if points_required is auto-calculated from value_cents |

### UT-10: Coupon Service — PIN Generation

| Field | Value |
|-------|-------|
| **Function** | `hashPin(pin)` |
| **Prerequisites** | None |
| **Steps** | 1. Call `hashPin("123456")` twice. |
| **Expected Result** | Both calls return the same HMAC-SHA256 hash |
| **Pass/Fail Criteria** | Pass if hash is deterministic (same input = same output) |

### UT-11: Coupon Service — PIN Uniqueness

| Field | Value |
|-------|-------|
| **Function** | PIN generation loop in `createCoupon()` |
| **Prerequisites** | None |
| **Steps** | 1. Create a coupon with `quantity = 100`. 2. Check all generated PINs. |
| **Expected Result** | All 100 PINs are unique 6-digit strings |
| **Pass/Fail Criteria** | Pass if no duplicate PINs found, all are 6 digits |

---

### UT-12: Merchant Service — PIN Verify

| Field | Value |
|-------|-------|
| **Function** | `merchantService.verifyPin(pin)` |
| **API Endpoint** | `POST /api/coupons/verify` |
| **Prerequisites** | An unused coupon PIN exists in `user_coupons` table |
| **Steps** | 1. Call `verifyPin("123456")` with a valid, unused PIN |
| **Expected Result** | Returns `{ data: { user_coupon_id, status, coupon_title, volunteer_name, expiry_date } }` |
| **Pass/Fail Criteria** | Pass if returns coupon details with status 'unused' |

### UT-13: Merchant Service — PIN Verify Invalid

| Field | Value |
|-------|-------|
| **Function** | `merchantService.verifyPin(pin)` |
| **API Endpoint** | `POST /api/coupons/verify` |
| **Prerequisites** | None |
| **Steps** | 1. Call `verifyPin("000000")` with a non-existent PIN |
| **Expected Result** | Throws error with code `invalid_pin` and status 404 |
| **Pass/Fail Criteria** | Pass if 404 returned |

### UT-14: Merchant Service — Redeem Used PIN

| Field | Value |
|-------|-------|
| **Function** | `merchantService.redeemPin(pin)` |
| **API Endpoint** | `POST /api/coupons/redeem` |
| **Prerequisites** | A PIN that has already been used/verified |
| **Steps** | 1. Verify PIN. 2. Redeem PIN. 3. Try to verify same PIN again. |
| **Expected Result** | Second verify returns error `already_redeemed` with status 409 |
| **Pass/Fail Criteria** | Pass if already-used PIN is rejected |

### UT-15: Merchant Service — Reverse Within Window

| Field | Value |
|-------|-------|
| **Function** | `merchantService.reverseRedemption(data)` |
| **API Endpoint** | `POST /api/coupons/reverse` |
| **Prerequisites** | A PIN that was just redeemed (within 5 minutes) |
| **Steps** | 1. Verify PIN. 2. Redeem PIN. 3. Call reverse immediately. |
| **Expected Result** | Returns success. PIN status returns to 'unused'. |
| **Pass/Fail Criteria** | Pass if reversal succeeds within 5-min window |

### UT-16: Merchant Service — Reverse Outside Window

| Field | Value |
|-------|-------|
| **Function** | `merchantService.reverseRedemption(data)` |
| **API Endpoint** | `POST /api/coupons/reverse` |
| **Prerequisites** | A PIN redeemed more than 5 minutes ago (manually set `redeemed_at` in DB) |
| **Steps** | 1. Manually set user_coupon.redeemed_at to 10 minutes ago. 2. Try to reverse. |
| **Expected Result** | Throws error `reverse_window_expired` with status 403 |
| **Pass/Fail Criteria** | Pass if 5-min window is enforced |

---

### UT-17: Points Deduction — Insufficient Points

| Field | Value |
|-------|-------|
| **Function** | `rewardsService.redeemReward(rewardId, userId)` |
| **API Endpoint** | `POST /api/rewards/:id/redeem` |
| **Prerequisites** | User has 0 points. Coupon costs 100 points. |
| **Steps** | 1. Call redeem with user who has insufficient points. |
| **Expected Result** | Throws error `insufficient_points` with status 403. No deduction occurs. |
| **Pass/Fail Criteria** | Pass if atomic check prevents overspend |

### UT-18: Points Deduction — Sufficient Points

| Field | Value |
|-------|-------|
| **Function** | `rewardsService.redeemReward(rewardId, userId)` |
| **API Endpoint** | `POST /api/rewards/:id/redeem` |
| **Prerequisites** | User has >= points_required. Coupon is active and in stock. |
| **Steps** | 1. Call redeem with valid user and coupon. |
| **Expected Result** | Points deducted. Coupon quantity decremented. PIN generated. Redemption log created. |
| **Pass/Fail Criteria** | Pass if all 4 conditions hold atomically |

---

## 5. Integration Tests

### Scope
Test each API endpoint end-to-end with the live database. Verify correct HTTP status codes, response shapes, and error handling.

### Test Authentication Token
```bash
# Obtain token for testing (replace email/password as needed)
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")
```

---

### IT-01: Health Check

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/health` |
| **Auth** | None |
| **Steps** | 1. Send GET request to `/api/health` |
| **Expected Result** | `{ status: "ok", timestamp, uptime }` with status 200 |
| **Pass/Fail Criteria** | Pass if status is "ok" |

### IT-02: Admin Login

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/auth/login` |
| **Auth** | None |
| **Steps** | 1. Send POST with `{ email: "carol@test.com", password: "password123" }` |
| **Expected Result** | `{ user: { id, name, email, role: "admin" }, token, refresh_token }` with status 200 |
| **Pass/Fail Criteria** | Pass if role is "admin" and token is valid |

### IT-03: Admin Dashboard

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/dashboard` |
| **Auth** | Admin token |
| **Steps** | 1. Login as admin. 2. Send GET with Bearer token. |
| **Expected Result** | `{ stats: { total_users, total_organisers, total_events, ... }, recent_activity }` |
| **Pass/Fail Criteria** | Pass if all stat fields are non-negative integers |

### IT-04: Admin — List Users (with search)

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/users` |
| **Auth** | Admin token |
| **Steps** | 1. `GET /api/admin/users?search=alice`. 2. `GET /api/admin/users?role=volunteer`. 3. `GET /api/admin/users` (no params). |
| **Expected Result** | `{ data: [...], total, page, limit, total_pages }`. Search returns only matching users. Role filter returns only that role. |
| **Pass/Fail Criteria** | Pass if all 3 queries return correctly filtered results |

### IT-05: Admin — Get User Detail

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/users/:id` |
| **Auth** | Admin token |
| **Steps** | 1. Get a user ID from list. 2. `GET /api/admin/users/{id}` |
| **Expected Result** | `{ id, name, email, phone, role, points_balance, status, created_at, total_events_attended, total_points_earned, total_points_redeemed }` |
| **Pass/Fail Criteria** | Pass if all fields present; merchant users additionally include `merchant_business` |

### IT-06: Admin — Update User Status

| Field | Value |
|-------|-------|
| **Endpoint** | `PUT /api/admin/users/:id` |
| **Auth** | Admin token |
| **Steps** | 1. `PUT /api/admin/users/{id}` with `{ status: "disabled" }`. 2. Verify user is disabled. 3. Reactivate with `{ status: "active" }`. |
| **Expected Result** | Returns `{ id, status, updated_at }`. User is disabled/enabled accordingly. |
| **Pass/Fail Criteria** | Pass if status changes persist and re-activation works |

### IT-07: Admin — List Organisers

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/organisers` |
| **Auth** | Admin token |
| **Steps** | 1. `GET /api/admin/organisers?status=pending`. 2. `GET /api/admin/organisers?status=approved`. |
| **Expected Result** | `{ data: [{ id, name, email, organisation_name, organisation_type, organisation_status, ... }] }` |
| **Pass/Fail Criteria** | Pass if status filter works correctly |

### IT-08: Admin — Approve Organiser

| Field | Value |
|-------|-------|
| **Endpoint** | `PUT /api/admin/organisers/:id/approve` |
| **Auth** | Admin token |
| **Steps** | 1. Get a pending organiser. 2. `PUT .../approve` with `{ status: "approved" }`. |
| **Expected Result** | `{ organisation: { id, name, type, status: "approved" } }`. User status updates to 'active'. |
| **Pass/Fail Criteria** | Pass if both organisation and user status update |

### IT-09: Admin — List Events

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/events` |
| **Auth** | Admin token |
| **Steps** | 1. `GET /api/admin/events?status=active`. 2. Paginate with `?page=1&limit=5`. |
| **Expected Result** | `{ data: [{ id, title, date, capacity, organiser_name, registered_count, checked_in_count }] }` |
| **Pass/Fail Criteria** | Pass if organiser name resolves and registered/checked-in counts are correct |

### IT-10: Admin — List Coupons

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/coupons` |
| **Auth** | Admin token |
| **Steps** | 1. `GET /api/admin/coupons?status=active`. 2. `GET /api/admin/coupons?status=depleted`. 3. `GET /api/admin/coupons` (all). |
| **Expected Result** | Active filter = only status 'active'. Depleted filter = only 'depleted'. All = both. |
| **Pass/Fail Criteria** | Pass if filter chips return correct counts |

### IT-11: Admin — Create Coupon

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/admin/coupons` |
| **Auth** | Admin token |
| **Steps** | 1. Create coupon with `{ title: "Test Coffee", value_cents: 500, quantity: 3, expiry_date: "2026-12-31" }`. |
| **Expected Result** | `{ coupon: { id, title, points_required, ... }, pins_generated: 3 }`. |
| **Pass/Fail Criteria** | Pass if points_required is auto-calculated and 3 PINs are generated |

### IT-12: Admin — View Coupon PINs

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/coupons/:id/pins` |
| **Auth** | Admin token |
| **Steps** | 1. Create coupon. 2. `GET /api/admin/coupons/{id}/pins`. |
| **Expected Result** | `{ data: [{ id, pin_code, status, created_at }] }`. PINs are unmasked 6-digit strings. |
| **Pass/Fail Criteria** | Pass if PIN count matches coupon quantity |

### IT-13: Admin — Rewards Config Read

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/rewards/configuration` |
| **Auth** | Admin token |
| **Steps** | 1. `GET /api/admin/rewards/configuration`. |
| **Expected Result** | `{ points_per_dollar, min_redeem_points, max_redeem_per_day, default_event_points, updated_at }` |
| **Pass/Fail Criteria** | Pass if all fields present with valid values |

### IT-14: Admin — Rewards Config Update

| Field | Value |
|-------|-------|
| **Endpoint** | `PUT /api/admin/rewards/configuration` |
| **Auth** | Admin token |
| **Steps** | 1. Change `points_per_dollar` to 150. 2. Read config back. 3. Verify coupon points update in real-time. |
| **Expected Result** | Config persists. Coupon list shows recalculated points. |
| **Pass/Fail Criteria** | Pass if config change reflects immediately in coupon listing |

### IT-15: Admin — List Redemptions

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/redemptions` |
| **Auth** | Admin token |
| **Steps** | 1. `GET /api/admin/redemptions`. 2. Filter with `?from=2026-06-01&to=2026-06-30`. 3. Sort with `?sort=points_spent&order=asc`. |
| **Expected Result** | `{ data: [{ id, user_name, redeemed_at, coupon_title, points_spent, value_cents }] }`. Date filter works. Sort works. |
| **Pass/Fail Criteria** | Pass if all 3 query params function correctly |

### IT-16: Admin — List Merchants

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/merchants` |
| **Auth** | Admin token |
| **Steps** | 1. `GET /api/admin/merchants`. |
| **Expected Result** | `{ data: [{ id, name, contact_person, contact_email, product_count }] }` |
| **Pass/Fail Criteria** | Pass if merchant list returns with product counts |

### IT-17: Admin — Create Merchant

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/admin/merchants` |
| **Auth** | Admin token |
| **Steps** | 1. Create merchant with `{ name: "Test Cafe", contact_person: "John", contact_email: "john@test.com" }`. |
| **Expected Result** | Merchant + user account created. Returns `{ merchant, message }` with login credentials. |
| **Pass/Fail Criteria** | Pass if both merchant record and user account are created |

### IT-18: Admin — Delete Coupon

| Field | Value |
|-------|-------|
| **Endpoint** | `DELETE /api/admin/coupons/:id` |
| **Auth** | Admin token |
| **Steps** | 1. Delete a test coupon. 2. Verify it's gone. |
| **Expected Result** | Returns `{ message }`. Coupon + its PINs + redemptions are deleted. |
| **Pass/Fail Criteria** | Pass if cascade delete removes all related records |

---

### IT-19: Volunteer — Register

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/auth/register` |
| **Auth** | None |
| **Steps** | 1. Register new user with unique email. |
| **Expected Result** | `{ user: { id, name, email, role: 'volunteer' }, token }`. User created in DB. |
| **Pass/Fail Criteria** | Pass if user is volunteer role and token is valid |

### IT-20: Volunteer — Browse Events

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/events` |
| **Auth** | Any authenticated user |
| **Steps** | 1. `GET /api/events?page=1&limit=10`. 2. Search with `?search=beach`. |
| **Expected Result** | `{ data: [{ id, title, description, date, location, capacity, points_value, status, organiser_name, registered_count }] }`. |
| **Pass/Fail Criteria** | Pass if events return with organiser name |

### IT-21: Volunteer — Join Event

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/events/:id/register` |
| **Auth** | Volunteer token |
| **Steps** | 1. Join an active event. 2. Try to join the same event again. |
| **Expected Result** | First call succeeds. Second call returns `already_registered` error. |
| **Pass/Fail Criteria** | Pass if duplicate registration is rejected |

### IT-22: Volunteer — Leave Event

| Field | Value |
|-------|-------|
| **Endpoint** | `DELETE /api/events/:id/register` |
| **Auth** | Volunteer token |
| **Steps** | 1. Join event. 2. Leave event. 3. Try to leave again. |
| **Expected Result** | First leave succeeds. Second leave returns `not_registered` error. |
| **Pass/Fail Criteria** | Pass if double-unregister is rejected |

### IT-23: Volunteer — Get My QR Code

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/me/qr-code` |
| **Auth** | Volunteer token |
| **Steps** | 1. Login as volunteer. 2. `GET /api/me/qr-code`. |
| **Expected Result** | `{ qr_code }` — a UUID string used for QR generation |
| **Pass/Fail Criteria** | Pass if valid UUID returned |

### IT-24: Volunteer — Get My Points

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/me/points` |
| **Auth** | Volunteer token |
| **Steps** | 1. Login as volunteer. 2. `GET /api/me/points`. |
| **Expected Result** | `{ points_balance, history: [...] }` |
| **Pass/Fail Criteria** | Pass if balance is non-negative integer |

### IT-25: Volunteer — Get My Coupons

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/me/coupons` |
| **Auth** | Volunteer token |
| **Steps** | 1. Login as volunteer who has redeemed a coupon. 2. `GET /api/me/coupons`. |
| **Expected Result** | `{ data: [{ id, title, pin_code, status, points_cost }] }` |
| **Pass/Fail Criteria** | Pass if coupon list returns with masked PINs |

### IT-26: Volunteer — Browse Rewards

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/rewards` |
| **Auth** | Any authenticated user |
| **Steps** | 1. `GET /api/rewards`. |
| **Expected Result** | `{ data: [{ id, title, description, points_required, image_url }] }` |
| **Pass/Fail Criteria** | Pass if returns active, in-stock coupons only |

### IT-27: Volunteer — Redeem Reward

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/rewards/:id/redeem` |
| **Auth** | Volunteer token with sufficient points |
| **Steps** | 1. Volunteer with enough points redeems a reward. |
| **Expected Result** | `{ data: { id, coupon_title, pin, points_balance, remaining_quantity } }`. Points deducted. PIN revealed. |
| **Pass/Fail Criteria** | Pass if points deducted, PIN generated, redemption logged |

---

### IT-28: Merchant — Verify PIN

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/coupons/verify` |
| **Auth** | Merchant token |
| **Steps** | 1. Merchant enters valid PIN. |
| **Expected Result** | `{ data: { user_coupon_id, status, coupon_title, volunteer_name, expiry_date } }` |
| **Pass/Fail Criteria** | Pass if valid PIN returns coupon details |

### IT-29: Merchant — Redeem

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/coupons/redeem` |
| **Auth** | Merchant token |
| **Steps** | 1. Merchant verifies PIN. 2. Merchant confirms redemption. |
| **Expected Result** | PIN status changes to 'used'. Redemption log created. |
| **Pass/Fail Criteria** | Pass if PIN is consumed and cannot be reused |

---

### IT-30: Organiser — Get Dashboard

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/organiser/dashboard` |
| **Auth** | Organiser token |
| **Steps** | 1. Login as organiser. 2. `GET /api/organiser/dashboard`. |
| **Expected Result** | `{ stats: { total_events, total_volunteers, upcoming_events } }` |
| **Pass/Fail Criteria** | Pass if stats are scoped to that organiser's events only |

### IT-31: Organiser — Create Event

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/organiser/events` |
| **Auth** | Organiser token |
| **Steps** | 1. Create event with `{ title, description, location, event_date, capacity, points_value, category }`. |
| **Expected Result** | `{ data: { id, title, ... } }`. Event created under that organiser. |
| **Pass/Fail Criteria** | Pass if event belongs to creating organiser |

### IT-32: Organiser — Create Event No Auth

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/organiser/events` |
| **Auth** | Volunteer token (not organiser) |
| **Steps** | 1. Login as volunteer. 2. Try to create event. |
| **Expected Result** | Returns `forbidden` error with status 403 |
| **Pass/Fail Criteria** | Pass if role guard blocks non-organiser |

### IT-33: Attendance — Scan QR (Check-in)

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/attendance/scan` |
| **Auth** | Organiser token |
| **Steps** | 1. Organiser scans volunteer QR code against an event. Send `{ event_id, qr_code_value }`. |
| **Expected Result** | Check-in recorded. Points awarded if applicable. |
| **Pass/Fail Criteria** | Pass if attendance_logs has new entry for that volunteer+event |

### IT-34: Attendance — Duplicate Scan

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/attendance/scan` |
| **Auth** | Organiser token |
| **Steps** | 1. Scan same volunteer+event twice. |
| **Expected Result** | First succeeds. Second returns `already_checked_in` error. |
| **Pass/Fail Criteria** | Pass if duplicate scan is rejected |

---

## 5b. Additional Feature Integration Tests (F1–F4)

### Scope
Test the four new features added during Sprint 3-4. Covers AI recommendations, feedback summarizer, sponsorship referral, and leaderboard.

---

### IT-35: F1 — AI Event Recommendations

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/events/recommended` |
| **Auth** | Volunteer token |
| **Steps** | 1. Login as volunteer alice@test.com. 2. `GET /api/events/recommended`. |
| **Expected Result** | `{ data: [{ id, title, event_date, category, points_value, relevance_score }] }`. Max 5 events. |
| **Pass/Fail Criteria** | Pass if returns array with relevance_score field |

### IT-36: F1 — Popular Events (Fallback)

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/events/popular` |
| **Auth** | Volunteer token |
| **Steps** | 1. Login as volunteer. 2. `GET /api/events/popular`. |
| **Expected Result** | `{ data: [{ id, title, event_date, category, points_value, registrations }] }`. Sorted by registration count. |
| **Pass/Fail Criteria** | Pass if returns array sorted by popularity |

### IT-37: F1 — Recommendations Without History

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/events/recommended` |
| **Auth** | Newly registered volunteer token (no event history) |
| **Steps** | 1. Register new volunteer. 2. `GET /api/events/recommended`. |
| **Expected Result** | Falls back to popular events. Returns `{ data: [...] }` — not empty. |
| **Pass/Fail Criteria** | Pass if gracefully falls back to popular events |

### IT-38: F2 — AI Feedback Summary

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/events/:id/feedback/summary` |
| **Auth** | Any authenticated user |
| **Steps** | 1. Login. 2. `GET /api/events/{eventId}/feedback/summary` for event with feedback. |
| **Expected Result** | `{ data: { event_title, total_feedback, overall_sentiment, average_rating, breakdown, top_positive_keywords, top_negative_keywords } }` |
| **Pass/Fail Criteria** | Pass if sentiment analysis returns valid structure |

### IT-39: F2 — Feedback Summary Empty Event

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/events/:id/feedback/summary` |
| **Auth** | Any authenticated user |
| **Steps** | 1. Login. 2. `GET /api/events/{eventId}/feedback/summary` for event with no feedback. |
| **Expected Result** | `{ data: { total_feedback: 0, overall_sentiment: "neutral" } }` |
| **Pass/Fail Criteria** | Pass if returns neutral with zero count |

### IT-40: F3 — Sponsorship Registration with Upline Emails

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/auth/register` |
| **Auth** | None |
| **Steps** | 1. Register new user with `{ ..., upline_1_email: "carol@test.com", upline_2_email: "alice@test.com" }`. |
| **Expected Result** | User created. Upline emails saved. Referral logs created. |
| **Pass/Fail Criteria** | Pass if new user's profile shows both upline emails |

### IT-41: F3 — Sponsorship Profile

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/me/sponsorship-profile` |
| **Auth** | Volunteer token |
| **Steps** | 1. Login as volunteer who was referred. 2. `GET /api/me/sponsorship-profile`. |
| **Expected Result** | `{ email, upline_1_email, upline_2_email, downline_1st_level_count, downline_2nd_level_count, total_sponsorship_points }` |
| **Pass/Fail Criteria** | Pass if all fields present with correct upline data |

### IT-42: F3 — Admin Sponsorship Config Read

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/sponsorship/configuration` |
| **Auth** | Admin token |
| **Steps** | 1. Login as admin. 2. `GET /api/admin/sponsorship/configuration`. |
| **Expected Result** | `{ direct_sponsor_points, helped_sponsor_points, upline_helper_points, updated_at }` |
| **Pass/Fail Criteria** | Pass if returns all 3 point config fields |

### IT-43: F3 — Admin Sponsorship Config Update

| Field | Value |
|-------|-------|
| **Endpoint** | `PUT /api/admin/sponsorship/configuration` |
| **Auth** | Admin token |
| **Steps** | 1. Login as admin. 2. Update with `{ direct_sponsor_points: 20, helped_sponsor_points: 5, upline_helper_points: 10 }`. 3. Read back. |
| **Expected Result** | Config persists. Updated values return on next read. |
| **Pass/Fail Criteria** | Pass if values persist after save and reload |

### IT-44: F4 — Leaderboard All Categories

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/leaderboard` |
| **Auth** | Any authenticated user |
| **Steps** | 1. Login. 2. `GET /api/leaderboard`. |
| **Expected Result** | `{ data: { most_points: [...], most_events: [...], most_checkins: [...], most_redeemed: [...] } }`. Each max 3 items with rank. |
| **Pass/Fail Criteria** | Pass if returns all 4 categories with rank numbers |

### IT-45: F4 — Leaderboard Individual Categories

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/leaderboard/points`, `/events`, `/checkins`, `/redeemed` |
| **Auth** | Any authenticated user |
| **Steps** | 1. Login. 2. Test each endpoint. |
| **Expected Result** | Each returns `{ data: [{ id, name, score, rank }] }`. Max 3 items. |
| **Pass/Fail Criteria** | Pass if each endpoint returns valid data |

---

## 5c. Bug Fix Regression Tests

### Scope
Verify previously identified bugs remain fixed.

---

### REG-01: Organiser Role Name Query

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/organisers` |
| **Auth** | Admin token |
| **Steps** | 1. Login as admin. 2. `GET /api/admin/organisers`. |
| **Expected Result** | Returns list of organisers, not empty array. |
| **Pass/Fail Criteria** | Pass if organiser list is not empty |

### REG-02: Events Query Uses event_date

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/events` |
| **Auth** | Volunteer token |
| **Steps** | 1. Login as volunteer. 2. `GET /api/events`. |
| **Expected Result** | Returns events. No HTTP 500. |
| **Pass/Fail Criteria** | Pass if 200 returned with event data |

### REG-03: Duplicate Scan Returns 409

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/attendance/scan` |
| **Auth** | Organiser token |
| **Steps** | 1. Login as organiser. 2. Scan volunteer QR. 3. Scan same volunteer+event again. |
| **Expected Result** | First: 200. Second: 409 already_checked_in. |
| **Pass/Fail Criteria** | Pass if duplicate scan correctly rejected |

### REG-04: User List Sorted by Role

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/users` |
| **Auth** | Admin token |
| **Steps** | 1. Login as admin. 2. `GET /api/admin/users`. 3. Check role order. |
| **Expected Result** | Users ordered: Admin → Organiser → Merchant → Volunteer |
| **Pass/Fail Criteria** | Pass if role order matches hierarchy |

### REG-05: RedeemReward Argument Order

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/rewards/:id/redeem` |
| **Auth** | Volunteer with sufficient points |
| **Steps** | 1. Login as volunteer. 2. POST to redeem a reward. |
| **Expected Result** | Returns `{ data: { id, pin, points_balance } }`. No SQL error. |
| **Pass/Fail Criteria** | Pass if redemption succeeds without error |

---

## 5d. Manual Testing — Volunteer Mobile App

### Scope
Manual tests on the Expo mobile app to verify UI, navigation, and flows.

---

### MT-01: Volunteer Registration Flow
| **App** | Volunteer Mobile App (Expo) |
| **Steps** | 1. Open app. 2. Tap Register. 3. Fill name, email, password. 4. Optionally enter upline emails. 5. Tap Create Account. |
| **Expected Result** | Account created. Redirected to home. | ⬜ |

### MT-02: Home Screen Sections
| **App** | Volunteer Mobile App (Expo) |
| **Steps** | 1. Login. 2. Verify upcoming events load. 3. Verify Recommended for You (F1) appears. 4. Verify Hall of Fame (F4) appears at bottom. |
| **Expected Result** | All 3 sections visible with live data. | ⬜ |

### MT-03: Browse and Join Events
| **App** | Volunteer Mobile App (Expo) |
| **Steps** | 1. Events tab. 2. Browse list. 3. Tap event for details. 4. Tap Join Event. |
| **Expected Result** | Joins confirmed. | ⬜ |

### MT-04: View QR Code
| **App** | Volunteer Mobile App (Expo) |
| **Steps** | 1. Navigate to QR screen. 2. Verify QR code displays. |
| **Expected Result** | QR code from user UUID. Scannable. | ⬜ |

### MT-05: Redeem Reward
| **App** | Volunteer Mobile App (Expo) |
| **Steps** | 1. Rewards tab. 2. Browse rewards. 3. Redeem one. 4. View PIN. |
| **Expected Result** | Points deducted. PIN shown. Coupon in My Coupons. | ⬜ |

### MT-06: Sponsorship Profile
| **App** | Volunteer Mobile App (Expo) |
| **Steps** | 1. Profile → Sponsorship. 2. Verify upline, downline, points. |
| **Expected Result** | All sponsorship data displayed. | ⬜ |

### MT-07: AI Recommendations Screen
| **App** | Volunteer Mobile App (Expo) |
| **Steps** | 1. Navigate to AI Recommendations screen. 2. Verify events load with scores. |
| **Expected Result** | Recommendations visible with relevance scores. | ⬜ |

### MT-08: Hall of Fame Screen
| **App** | Volunteer Mobile App (Expo) |
| **Steps** | 1. Hall of Fame screen. 2. Verify 4 tabs, top 3 with medals. |
| **Expected Result** | Leaderboard displays correctly. Tab switching works. | ⬜ |

---

## 5e. Manual Testing — Cashier Merchant App

### MT-09: Merchant Login
| **App** | Merchant Cashier PWA |
| **Steps** | Login as cheryl@test.com / password123. |
| **Expected Result** | Redirected to PIN verify. | ⬜ |

### MT-10: PIN Verification
| **App** | Merchant Cashier PWA |
| **Steps** | Enter valid 6-digit PIN from volunteer's redeemed coupon. |
| **Expected Result** | Coupon details displayed (title, volunteer, expiry). | ⬜ |

### MT-11: Invalid PIN
| **App** | Merchant Cashier PWA |
| **Steps** | Enter invalid PIN (e.g., 000000). |
| **Expected Result** | Error: Wrong 6-digit PIN. | ⬜ |

### MT-12: Redeem Coupon
| **App** | Merchant Cashier PWA |
| **Steps** | Verify valid PIN. Confirm redemption. |
| **Expected Result** | PIN marked as used. | ⬜ |

### MT-13: Reverse Redemption
| **App** | Merchant Cashier PWA |
| **Steps** | Verify + redeem PIN. Immediately reverse. |
| **Expected Result** | Reversal succeeds within 5-min window. PIN returns to unused. | ⬜ |

### MT-14: Merchant History
| **App** | Merchant Cashier PWA |
| **Steps** | Navigate to History. Verify past transactions listed. |
| **Expected Result** | History shows PIN, coupon title, date, status. | ⬜ |

---

## 5f. Manual Testing — Organiser QR Scanner

### MT-15: Organiser Login
| **App** | Organiser Web Portal |
| **Steps** | Login as bob@test.com / password123. |
| **Expected Result** | Dashboard shows event stats. | ⬜ |

### MT-16: Dashboard Stats
| **App** | Organiser Web Portal |
| **Steps** | Verify dashboard stats and event list. |
| **Expected Result** | Stats display correctly. | ⬜ |

### MT-17: Create Event
| **App** | Organiser Web Portal |
| **Steps** | Create event with title, date, location, capacity, points. |
| **Expected Result** | Event created. Shows in events list. | ⬜ |

### MT-18: View Event Roster
| **App** | Organiser Web Portal |
| **Steps** | Navigate to event. View roster. |
| **Expected Result** | Roster shows registered volunteers with check-in status. | ⬜ |

### MT-19: QR Scan Attendance
| **App** | Organiser Scanner |
| **Steps** | Scan volunteer's QR code. Verify check-in recorded. |
| **Expected Result** | Attendance recorded. Points awarded. | ⬜ |

---

## 5g. Manual Testing — Admin Portal (Extended)

### MT-20: Dashboard E2E
| **App** | Admin Web Portal |
| **Steps** | Login. Verify stats + recent activity. Navigate all sidebar sections. |
| **Expected Result** | Dashboard complete. Navigation works. | ⬜ |

### MT-21: Users Management
| **App** | Admin Web Portal |
| **Steps** | Users sorted by role. Search filter. Click View on user. |
| **Expected Result** | Sorted correctly. Detail modal works. | ⬜ |

### MT-22: Coupon Management
| **App** | Admin Web Portal |
| **Steps** | Test filter chips. Create coupon. View PINs. Delete. |
| **Expected Result** | CRUD works. PINs viewable. Filter works. | ⬜ |

### MT-23: Redemption History
| **App** | Admin Web Portal |
| **Steps** | Verify columns. Click sort. Use date filter. |
| **Expected Result** | Sorting and filtering work. | ⬜ |

### MT-24: Rewards Config
| **App** | Admin Web Portal |
| **Steps** | Change ppd. Save. Verify coupons update. |
| **Expected Result** | Config persists. Coupons update in real-time. | ⬜ |

### MT-25: Sponsorship Config
| **App** | Admin Web Portal |
| **Steps** | Change values. Save. Verify persists. |
| **Expected Result** | Sponsorship config page works. | ⬜ |

---

## 5h. End-to-End Cross-Portal Workflow

### E2E-01: Complete Volunteer + Organiser + Merchant Workflow

| Field | Value |
|-------|-------|
| **Workflow** | Admin creates coupons → Organiser creates event → Volunteer joins → Organiser scans QR → Volunteer earns points → Redeems reward → Merchant verifies PIN |
| **Steps** | 1. Admin: Create coupon batch. 2. Organiser: Create event. 3. Volunteer: Join event on mobile. 4. Organiser: Scan volunteer's QR code. 5. Volunteer: Check points. Redeem reward. View PIN. 6. Merchant: Enter PIN. Verify. Redeem. |
| **Expected Result** | Full cycle completes. Points earned, spent, PIN verified, redeemed. |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | ⬜ |

---

## 6. System Tests

### Scope
Test complete end-to-end workflows that span multiple portals and users. Each test simulates a real-world scenario from start to finish.

---

### ST-01: Full Volunteer Journey

| Field | Value |
|-------|-------|
| **Workflow** | Register → Browse Events → Join Event → Attend (QR scan) → Earn Points → Check Points → Browse Rewards → Redeem → View PIN |
| **Portals Involved** | Volunteer Mobile App, Organiser PWA, Backend API |
| **Prerequisites** | An active event exists with available slots. Volunteer has no prior registrations. |
| **Steps** | 1. Volunteer registers a new account. 2. Volunteer browses events and finds the active event. 3. Volunteer joins the event. 4. Organiser scans volunteer's QR code at check-in. 5. Volunteer checks points balance. 6. Volunteer browses available rewards. 7. Volunteer redeems a reward. 8. Volunteer views the generated PIN. |
| **Expected Result** | All 8 steps complete successfully. Points earned for attendance, deducted for redemption. PIN generated. |
| **Pass/Fail Criteria** | Pass if entire flow completes without errors and points balance is correct (starting + earned - spent) |

### ST-02: Full Admin Journey

| Field | Value |
|-------|-------|
| **Workflow** | Login → Dashboard → Approve Organiser → Register Merchant → Create Coupons → View Redemptions |
| **Portals Involved** | Admin Web Portal, Backend API |
| **Prerequisites** | There is a pending organiser. No merchant exists yet. |
| **Steps** | 1. Admin logs in. 2. Dashboard shows correct stats. 3. Admin views pending organisers. 4. Admin approves an organiser with a note. 5. Admin registers a new merchant with product info. 6. Admin creates a coupon batch with PINs. 7. Admin views coupon PINs. 8. Admin views redemption history. |
| **Expected Result** | All steps complete. Organiser status changes to approved. Merchant user created. PINs generated. |
| **Pass/Fail Criteria** | Pass if all admin functions work end-to-end |

### ST-03: Full Merchant Journey

| Field | Value |
|-------|-------|
| **Workflow** | Login → Enter PIN → Verify → Confirm Redemption → View History |
| **Portals Involved** | Merchant Cashier PWA, Backend API |
| **Prerequisites** | A volunteer has redeemed a coupon and received a PIN. |
| **Steps** | 1. Merchant logs into cashier portal. 2. Merchant enters the volunteer's 6-digit PIN. 3. System verifies PIN and shows coupon details. 4. Merchant confirms redemption. 5. Merchant views redemption history. |
| **Expected Result** | PIN validated. Coupon marked as used. History shows the transaction. |
| **Pass/Fail Criteria** | Pass if complete cashier flow works |

### ST-04: Full Organiser Journey

| Field | Value |
|-------|-------|
| **Workflow** | Login → Dashboard → Create Event → View Roster → Scan Volunteer → View Feedback |
| **Portals Involved** | Organiser Web Portal, Organiser PWA Scanner, Backend API |
| **Prerequisites** | Volunteers have joined the organiser's event. |
| **Steps** | 1. Organiser logs in. 2. Dashboard shows event statistics. 3. Organiser creates a new event. 4. Organiser views the roster of registered volunteers. 5. Organiser scans a volunteer's QR code for attendance. 6. Organiser views feedback for completed events. |
| **Expected Result** | All organiser functions work. Attendance tracking updates correctly. |
| **Pass/Fail Criteria** | Pass if complete organiser workflow functions end-to-end |

### ST-05: Error Handling — Expired Token

| Field | Value |
|-------|-------|
| **Workflow** | Login → Wait for token expiry → Make API call → Auto-refresh |
| **Portals Involved** | Any portal, Backend API |
| **Prerequisites** | A valid login session |
| **Steps** | 1. Login to obtain token. 2. Modify the token's expiry (or wait). 3. Make an API call with expired token. 4. Frontend auto-refreshes token. 5. Original request retries with new token. |
| **Expected Result** | Auto-refresh kicks in. User is not logged out. Request completes. |
| **Pass/Fail Criteria** | Pass if refresh flow works without user intervention |

### ST-06: Error Handling — Network Failure

| Field | Value |
|-------|-------|
| **Workflow** | Use app → Disconnect network → Reconnect |
| **Portals Involved** | Any portal |
| **Prerequisites** | App is running and connected |
| **Steps** | 1. Perform an action. 2. Disconnect from network. 3. Attempt another action. 4. Reconnect network. 5. Retry the action. |
| **Expected Result** | App shows appropriate error message. After reconnect, action succeeds. |
| **Pass/Fail Criteria** | Pass if graceful error handling and recovery works |

---

## 7. User Acceptance Tests

### Scope
Real-world scenarios that simulate how actual end users will interact with the system. Each test has a user story format.

---

### UAT-01: Admin Onboarding Workflow

| Field | Value |
|-------|-------|
| **User Story** | As an admin, I want to approve new organisers and manage system users so that only legitimate organisations can create events. |
| **Steps** | 1. Login as admin (carol@test.com). 2. Navigate to Organisers tab. 3. See list of pending organisers. 4. Click "View" on a pending organiser. 5. Verify their details (organisation name, contact, type). 6. Click "Approve". 7. Verify organiser status changes to "approved". 8. Navigate to Users tab. 9. Search for the approved organiser. 10. Verify their status is "active". |
| **Expected Result** | Approving an organiser updates both the organisation status and the user's account status. |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### UAT-02: Admin Coupon Management

| Field | Value |
|-------|-------|
| **User Story** | As an admin, I want to create coupon batches with PINs so that volunteers can redeem rewards. |
| **Steps** | 1. Login as admin. 2. Navigate to Coupons page. 3. Click "+ Create Coupon". 4. Fill in: Coupon Type = "Test Voucher", Value = $10.00 (1000¢), Quantity = 5. 5. Click "Create Coupon". 6. Verify success message shows "Created 5 PINs". 7. Find the new coupon in the list. 8. Click "PINs" button. 9. Verify 5 unique 6-digit PINs are shown. 10. Test the Active/Depleted/All filter chips. |
| **Expected Result** | PINs are generated at coupon creation time. Filter chips correctly show/hide coupons by status. |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### UAT-03: Admin Rewards Configuration

| Field | Value |
|-------|-------|
| **User Story** | As an admin, I want to configure the points-per-dollar rate so that coupon point costs update dynamically. |
| **Steps** | 1. Login as admin. 2. Navigate to Rewards Configuration. 3. Note current "Points Per Dollar" value and the coupon list points. 4. Change Points Per Dollar to 50. 5. Click "Save Changes". 6. Navigate to Coupons page. 7. Verify all coupon point costs have decreased proportionally. 8. Return to Config and change back to 100. 9. Verify coupons return to original values. |
| **Expected Result** | Coupon point costs change in real-time when the config is updated. |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### UAT-04: Volunteer Event Experience

| Field | Value |
|-------|-------|
| **User Story** | As a volunteer, I want to browse and join volunteering events so that I can participate and earn points. |
| **Steps** | 1. Register a new volunteer account or login as alice@test.com. 2. Browse available events. 3. Search for an event by keyword. 4. Click on an event to view details. 5. Click "Join Event". 6. Verify confirmation. 7. Go to "My Events" to see joined events. 8. Navigate to QR Code screen to see personal QR code. |
| **Expected Result** | Volunteer can discover, join, and view events. Personal QR code is displayed for scanning. |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### UAT-05: Volunteer Rewards Experience

| Field | Value |
|-------|-------|
| **User Story** | As a volunteer, I want to redeem my earned points for reward coupons so that I can enjoy the benefits of volunteering. |
| **Steps** | 1. Login as a volunteer with sufficient points. 2. Navigate to Rewards catalogue. 3. Browse available rewards with their point costs. 4. Select a reward to view details. 5. Click "Redeem". 6. Verify points are deducted from balance. 7. View the generated 6-digit PIN code. 8. Go to "My Coupons" to see all redeemed coupons. 9. Verify the redeemed coupon appears with its PIN. |
| **Expected Result** | Points deducted. PIN generated. Coupon appears in My Coupons. |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### UAT-06: Merchant PIN Verification

| Field | Value |
|-------|-------|
| **User Story** | As a merchant cashier, I want to verify a volunteer's 6-digit PIN so that they can claim their reward in-store. |
| **Steps** | 1. Login as merchant (merchant@test.com). 2. Volunteer shows their PIN. 3. Merchant enters the 6-digit PIN code. 4. System displays coupon details (title, value, expiry). 5. Merchant confirms redemption. 6. System marks PIN as used. 7. Merchant views history to see the completed transaction. |
| **Expected Result** | PIN verified, coupon redeemed, transaction in history. |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### UAT-07: Organiser Event Management

| Field | Value |
|-------|-------|
| **User Story** | As an organiser, I want to create and manage events so that volunteers can sign up for my activities. |
| **Steps** | 1. Login as organiser (bob@test.com). 2. View dashboard with event statistics. 3. Create a new event with title, date, location, capacity, and points value. 4. Verify event appears in events list. 5. View the roster of registered volunteers. 6. Scan a volunteer's QR code for attendance check-in. 7. View feedback from completed events. |
| **Expected Result** | Event created, roster visible, QR scan works for attendance. |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### UAT-08: Role-Based Access Control

| Field | Value |
|-------|-------|
| **User Story** | As a user, I should only be able to access portals and features that match my role. |
| **Steps** | 1. Login as volunteer. 2. Try to navigate to `/admin` — should be blocked. 3. Try to call `POST /api/admin/coupons` — should return 403. 4. Login as admin. 5. Try to navigate to `/merchant` — should be blocked. 6. Login as merchant. 7. Try to call `POST /api/organiser/events` — should return 403. |
| **Expected Result** | Each role can only access their authorised portals and APIs. |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

---

## 8. Security Tests

### Scope
Verify that the system protects against common security threats including unauthorised access, injection attacks, and brute force.

---

### ST-01: Authentication — No Token

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/dashboard` |
| **Auth** | None (no token) |
| **Steps** | 1. Send request to protected endpoint without Authorization header. |
| **Expected Result** | Returns `{ error: { code: "unauthorized", message: "Authentication required" } }` with status 401 |
| **Pass/Fail Criteria** | Pass if 401 returned |

### ST-02: Authentication — Invalid Token

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/dashboard` |
| **Auth** | Invalid JWT token |
| **Steps** | 1. Send request with header `Authorization: Bearer invalid.jwt.token` |
| **Expected Result** | Returns 401 with appropriate error |
| **Pass/Fail Criteria** | Pass if 401 returned |

### ST-03: Role Guard — Admin Only

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/dashboard` |
| **Auth** | Volunteer token |
| **Steps** | 1. Login as volunteer. 2. Use volunteer token to access admin endpoint. |
| **Expected Result** | Returns `forbidden` with status 403 |
| **Pass/Fail Criteria** | Pass if volunteer cannot access admin API |

### ST-04: Role Guard — Organiser Only

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/organiser/dashboard` |
| **Auth** | Merchant token |
| **Steps** | 1. Login as merchant. 2. Use merchant token to access organiser endpoint. |
| **Expected Result** | Returns 403 |
| **Pass/Fail Criteria** | Pass if role guard blocks wrong role |

### ST-05: SQL Injection — Login

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/auth/login` |
| **Steps** | 1. Send `{ email: "' OR 1=1 --", password: "' OR 1=1 --" }` |
| **Expected Result** | Returns `invalid_credentials` with status 401, not a database error |
| **Pass/Fail Criteria** | Pass if SQL injection attempt fails to bypass auth |

### ST-06: SQL Injection — Admin Search

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/users?search='; DROP TABLE users; --` |
| **Auth** | Admin token |
| **Steps** | 1. Send SQL injection payload in search parameter. |
| **Expected Result** | Returns empty search results or validation error. Users table is NOT dropped. |
| **Pass/Fail Criteria** | Pass if parameterized queries prevent injection |

### ST-07: Rate Limiting — Login

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/auth/login` |
| **Steps** | 1. Send 10+ rapid login requests with wrong password. |
| **Expected Result** | After threshold, returns `429 Too Many Requests` |
| **Pass/Fail Criteria** | Pass if rate limiter kicks in after N failed attempts |

### ST-08: Rate Limiting — Registration

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/auth/register` |
| **Steps** | 1. Send rapid registration requests in succession. |
| **Expected Result** | After threshold, returns 429 |
| **Pass/Fail Criteria** | Pass if registration rate limiter is active |

### ST-09: JWT Token Expiry

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/dashboard` |
| **Steps** | 1. Obtain a token. 2. Manually decode and check `exp` claim. 3. Wait for expiry (or use an expired token). |
| **Expected Result** | Token has reasonable expiry (e.g., 15-60 minutes for access tokens). Expired tokens return 401 with `token_expired`. |
| **Pass/Fail Criteria** | Pass if access token expires and refresh mechanism works |

### ST-10: PIN Brute Force Protection

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/coupons/verify` |
| **Auth** | Merchant token |
| **Steps** | 1. Send rapid PIN verification attempts with random PINs. |
| **Expected Result** | Rate limiting or progressive delay should prevent brute-force guessing of 6-digit PINs |
| **Pass/Fail Criteria** | Pass if rapid sequential PIN attempts are throttled |

### ST-11: Password Hashing

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/users/:id` (check returned data) |
| **Auth** | Admin token |
| **Steps** | 1. Call user detail and examine response. |
| **Expected Result** | `password_hash` is NEVER returned in any API response |
| **Pass/Fail Criteria** | Pass if no password or hash is exposed in any endpoint |

### ST-12: Data Isolation

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/organiser/events` |
| **Auth** | Organiser token |
| **Steps** | 1. Login as organiser A. 2. Check events list. 3. Login as organiser B. 4. Check events list. |
| **Expected Result** | Each organiser only sees their OWN events |
| **Pass/Fail Criteria** | Pass if data isolation is enforced between organisers |

---

## 9. Performance Tests

### Scope
Verify that the system responds within acceptable time limits under normal and moderate load conditions.

---

### PT-01: API Response Time — Dashboard

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/dashboard` |
| **Steps** | 1. Send 10 sequential requests. 2. Record response time for each. |
| **Expected Result** | Average response time < 500ms |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### PT-02: API Response Time — User List

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/users?limit=15` |
| **Steps** | 1. Send 10 requests with pagination. |
| **Expected Result** | Average response time < 300ms |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### PT-03: API Response Time — Coupon List

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/coupons` |
| **Steps** | 1. Send 10 requests. |
| **Expected Result** | Average response time < 300ms |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### PT-04: API Response Time — Login

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/auth/login` |
| **Steps** | 1. Send 10 login requests (with correct credentials). |
| **Expected Result** | Average response time < 500ms |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### PT-05: API Response Time — Event List

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/events?limit=20` |
| **Steps** | 1. Send 10 requests. |
| **Expected Result** | Average response time < 300ms |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### PT-06: API Response Time — Reward Redeem

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /api/rewards/:id/redeem` |
| **Steps** | 1. Send 5 redemption requests with valid data. |
| **Expected Result** | Average response time < 500ms (includes DB writes) |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### PT-07: Pagination Correctness

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /api/admin/users` |
| **Steps** | 1. Request page 1, limit 5. 2. Request page 2, limit 5. 3. Request page 3, limit 5. 4. Concatenate results. |
| **Expected Result** | All pages combined = total count. No duplicate records across pages. |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

### PT-08: Concurrent Requests

| Field | Value |
|-------|-------|
| **Scenario** | Multiple users making requests simultaneously |
| **Steps** | 1. Open 3 browser tabs: admin, volunteer, organiser. 2. Each user performs actions simultaneously for 2 minutes. |
| **Expected Result** | No deadlocks. All requests eventually complete. No data corruption. |
| **Pass/Fail Criteria** | ✅ Pass / ❌ Fail |
| **Actual Result** | |

---

## 10. Test Results Log

*Execution status as of 10 June 2026. Updated results from automated test runs.*

| Test ID | Test Type | Tester | Date | Status | Notes / Defect ID |
|---------|-----------|--------|------|--------|-------------------|
| UT-01 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-02 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-03 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-04 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-05 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-06 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-07 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-08 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-09 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-10 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-11 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-12 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-13 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-14 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-15 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-16 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-17 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| UT-18 | Unit | Xon/Code | 8 Jun | ✅ Pass | |
| IT-01 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-02 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-03 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-04 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-05 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-06 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-07 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-08 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-09 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-10 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-11 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-12 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-13 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-14 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-15 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-16 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-17 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-18 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-19 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-20 | Integration | Code | 10 Jun | ❌ Fail→✅ Fixed | DB column start_time→event_date |
| IT-21 | Integration | Code | 10 Jun | ⏭️ Skip | Depends on IT-20 |
| IT-22 | Integration | Code | 10 Jun | ⏭️ Skip | Depends on IT-20 |
| IT-23 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-24 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-25 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-26 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-27 | Integration | Code | 10 Jun | ❌ Fail→✅ Fixed | Controller/service arg mismatch |
| IT-28 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-29 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-30 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-31 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-32 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-33 | Integration | Code | 10 Jun | ✅ Pass | |
| IT-34 | Integration | Code | 10 Jun | ❌ Fail→✅ Fixed | Missing duplicate check |
| IT-35 | Integration | — | — | ⬜ Not Run | F1 Recommendations |
| IT-36 | Integration | — | — | ⬜ Not Run | F1 Popular |
| IT-37 | Integration | — | — | ⬜ Not Run | F1 No history |
| IT-38 | Integration | — | — | ⬜ Not Run | F2 Summary |
| IT-39 | Integration | — | — | ⬜ Not Run | F2 Empty |
| IT-40 | Integration | — | — | ⬜ Not Run | F3 Sponsorship reg |
| IT-41 | Integration | — | — | ⬜ Not Run | F3 Profile |
| IT-42 | Integration | — | — | ⬜ Not Run | F3 Config read |
| IT-43 | Integration | — | — | ⬜ Not Run | F3 Config update |
| IT-44 | Integration | — | — | ⬜ Not Run | F4 Leaderboard |
| IT-45 | Integration | — | — | ⬜ Not Run | F4 Categories |
| REG-01 | Regression | — | — | ⬜ Not Run | Role name fix |
| REG-02 | Regression | — | — | ⬜ Not Run | Event date fix |
| REG-03 | Regression | — | — | ⬜ Not Run | Duplicate scan fix |
| REG-04 | Regression | — | — | ⬜ Not Run | User sort order |
| REG-05 | Regression | — | — | ⬜ Not Run | Redeem args fix |
| MT-01 | Manual | — | — | ⬜ Not Run | Volunteer reg flow |
| MT-02 | Manual | — | — | ⬜ Not Run | Home screen |
| MT-03 | Manual | — | — | ⬜ Not Run | Events |
| MT-04 | Manual | — | — | ⬜ Not Run | QR code |
| MT-05 | Manual | — | — | ⬜ Not Run | Rewards |
| MT-06 | Manual | — | — | ⬜ Not Run | Sponsorship |
| MT-07 | Manual | — | — | ⬜ Not Run | AI Recs screen |
| MT-08 | Manual | — | — | ⬜ Not Run | Hall of Fame |
| MT-09 | Manual | — | — | ⬜ Not Run | Merchant login |
| MT-10 | Manual | — | — | ⬜ Not Run | PIN verify |
| MT-11 | Manual | — | — | ⬜ Not Run | Invalid PIN |
| MT-12 | Manual | — | — | ⬜ Not Run | Redeem coupon |
| MT-13 | Manual | — | — | ⬜ Not Run | Reverse |
| MT-14 | Manual | — | — | ⬜ Not Run | History |
| MT-15 | Manual | — | — | ⬜ Not Run | Organiser login |
| MT-16 | Manual | — | — | ⬜ Not Run | Dashboard |
| MT-17 | Manual | — | — | ⬜ Not Run | Create event |
| MT-18 | Manual | — | — | ⬜ Not Run | Roster |
| MT-19 | Manual | — | — | ⬜ Not Run | QR scan |
| MT-20 | Manual | — | — | ⬜ Not Run | Admin dashboard |
| MT-21 | Manual | — | — | ⬜ Not Run | Users |
| MT-22 | Manual | — | — | ⬜ Not Run | Coupons |
| MT-23 | Manual | — | — | ⬜ Not Run | Redemptions |
| MT-24 | Manual | — | — | ⬜ Not Run | Rewards config |
| MT-25 | Manual | — | — | ⬜ Not Run | Sponsorship config |
| E2E-01 | E2E | — | — | ⬜ Not Run | Full workflow |
| ST-01 | System | — | — | ⬜ Not Run | |
| ST-02 | System | — | — | ⬜ Not Run | |
| ST-03 | System | — | — | ⬜ Not Run | |
| ST-04 | System | — | — | ⬜ Not Run | |
| ST-05 | System | — | — | ⬜ Not Run | |
| ST-06 | System | — | — | ⬜ Not Run | |
| UAT-01 | UAT | — | — | ⬜ Not Run | |
| UAT-02 | UAT | — | — | ⬜ Not Run | |
| UAT-03 | UAT | — | — | ⬜ Not Run | |
| UAT-04 | UAT | — | — | ⬜ Not Run | |
| UAT-05 | UAT | — | — | ⬜ Not Run | |
| UAT-06 | UAT | — | — | ⬜ Not Run | |
| UAT-07 | UAT | — | — | ⬜ Not Run | |
| UAT-08 | UAT | — | — | ⬜ Not Run | |
| SEC-01 | Security | — | — | ⬜ Not Run | |
| SEC-02 | Security | — | — | ⬜ Not Run | |
| SEC-03 | Security | — | — | ⬜ Not Run | |
| SEC-04 | Security | — | — | ⬜ Not Run | |
| SEC-05 | Security | — | — | ⬜ Not Run | |
| SEC-06 | Security | — | — | ⬜ Not Run | |
| SEC-07 | Security | — | — | ⬜ Not Run | |
| SEC-08 | Security | — | — | ⬜ Not Run | |
| SEC-09 | Security | — | — | ⬜ Not Run | |
| SEC-10 | Security | — | — | ⬜ Not Run | |
| SEC-11 | Security | — | — | ⬜ Not Run | |
| SEC-12 | Security | — | — | ⬜ Not Run | |
| PT-01 | Performance | Code | 10 Jun | ✅ Pass | avg=159ms |
| PT-02 | Performance | Code | 10 Jun | ✅ Pass | avg=141ms |
| PT-03 | Performance | Code | 10 Jun | ✅ Pass | avg=146ms |
| PT-04 | Performance | Code | 10 Jun | ✅ Pass | avg=365ms |
| PT-05 | Performance | Code | 10 Jun | ❌ Fail | start_time bug (now fixed) |
| PT-06 | Performance | Code | 10 Jun | ❌ Fail | redeem arg bug (now fixed) |
| PT-07 | Performance | Code | 10 Jun | ✅ Pass | No duplicates |
| PT-08 | Performance | Code | 10 Jun | ✅ Pass | No deadlock |

---

## Appendix A: Test Automation Setup

### Unit Test Framework (Recommended)

```bash
# Install test framework
cd backend
npm install --save-dev @jest/globals jest

# Create test directory
mkdir -p tests/unit
mkdir -p tests/integration

# Add to package.json scripts
# "test:unit": "jest tests/unit",
# "test:integration": "jest tests/integration",
# "test": "jest"
```

### Performance Test Tool

```bash
# Install autocannon for load testing
npm install -g autocannon

# Example: load test dashboard endpoint
autocannon -c 10 -d 10 http://localhost:3000/api/admin/dashboard
```

### API Test Script (Quick Smoke Test)

```bash
#!/bin/bash
# save as scripts/smoke_test.sh

echo "=== Smoke Test ==="

# Health check
echo -n "Health: "
curl -s http://localhost:3000/api/health | grep -c "ok" || echo "FAIL"

# Login
echo -n "Login: "
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")
echo ${TOKEN:0:20}...

# Dashboard
echo -n "Dashboard: "
curl -s http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);console.log(j.stats?'OK':'FAIL')})"

echo "=== Done ==="
```

---

*End of Test Plan & Case Specification*
