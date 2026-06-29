# UAT & Remaining Tasks — Step-by-Step Guide

**Version:** 1.0  
**Date:** 25 June 2026  
**Project:** Volunteering Rewards App (C3000C)  
**Scope:** User Acceptance Testing (8 scenarios) + Technical tasks (2 items)  

---

## Table of Contents

1. [How to Use This Guide](#1-how-to-use-this-guide)
2. [Test Accounts & URLs](#2-test-accounts--urls)
3. [UAT-01: Admin Onboards a New Organiser](#3-uat-01-admin-onboards-a-new-organiser)
4. [UAT-02: Admin Manages Coupons](#4-uat-02-admin-manages-coupons)
5. [UAT-03: Admin Configures Rewards](#5-uat-03-admin-configures-rewards)
6. [UAT-04: Volunteer Browses and Joins Events](#6-uat-04-volunteer-browses-and-joins-events)
7. [UAT-05: Volunteer Redeems Rewards](#7-uat-05-volunteer-redeems-rewards)
8. [UAT-06: Merchant Verifies PIN](#8-uat-06-merchant-verifies-pin)
9. [UAT-07: Organiser Manages Events](#9-uat-07-organiser-manages-events)
10. [UAT-08: Role-Based Access Control](#10-uat-08-role-based-access-control)
11. [Technical Task 1: CI Coverage Reporting](#11-technical-task-1-ci-coverage-reporting)
12. [Technical Task 2: Test Database in CI](#12-technical-task-2-test-database-in-ci)
13. [Bug Reporting Template](#13-bug-reporting-template)
14. [Quick Reference](#14-quick-reference)

---

## 1. How to Use This Guide

### Who should do what

| Person | Tests |
|--------|-------|
| **Xon** | UAT-01, UAT-02, UAT-03, Technical tasks |
| **Vivian** | UAT-04, UAT-07 |
| **Grace** | UAT-05, UAT-06 |
| **Nurain** | UAT-07, UAT-08 |

### Before starting

1. Open the portal URLs in a browser (Chrome/Edge recommended)
2. Have the test accounts ready (see Section 2)
3. For the Volunteer PWA, open on a mobile phone or use Chrome DevTools mobile view (F12 → toggle device toolbar)
4. Report bugs immediately using the template in Section 13

### Status tracking

| Mark | Meaning |
|------|---------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Pass |
| ❌ | Fail (bug found) |
| ⏭️ | Blocked / N/A |

---

## 2. Test Accounts & URLs

### Portal Access

| Portal | URL | Best Viewed On |
|--------|-----|----------------|
| **Volunteer PWA** | `https://dist-orpin-nine-46.vercel.app` | Phone / Mobile Chrome |
| **Admin Portal** | `https://webportals-lovat.vercel.app/admin/login` | Desktop |
| **Organiser Portal** | `https://webportals-lovat.vercel.app/organiser/login` | Desktop |
| **Merchant Portal** | `https://webportals-lovat.vercel.app/merchant` | Phone / Desktop |
| **Scanner PWA** | `https://webportals-lovat.vercel.app/scan` | Phone (for QR scanning) |

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Volunteer 2 | eve@test.com | password123 |
| Merchant | cheryl@test.com | password123 |

### Cold Start Warning

The backend on Render spins down after 15 minutes of inactivity. If a page loads slowly or shows an error, wait **30–60 seconds** and refresh. This is normal for the free hosting tier.

---

## 3. UAT-01: Admin Onboards a New Organiser

**Tester:** Xon  
**Portal:** Admin → `https://webportals-lovat.vercel.app/admin/login`  
**Duration:** ~15 minutes

### User Story
As an admin, I want to approve new organisers so that only legitimate organisations can create events.

### Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Login as admin (carol@test.com / password123) | Redirected to dashboard with stats | ⬜ |
| 2 | Click "Organisers" in the sidebar | See list of pending organisers | ⬜ |
| 3 | Click "View" on a pending organiser | See their details (name, email, org name) | ⬜ |
| 4 | Click "Approve" and add an approval note | Organiser status changes to "approved" | ⬜ |
| 5 | Navigate to "Users" tab | See the approved organiser in the list | ⬜ |
| 6 | Click "View" on the approved organiser | User status shows "active" | ⬜ |

**Pass/Fail:** ✅ Pass / ❌ Fail  
**Notes/Issues Found:** ________________

---

## 4. UAT-02: Admin Manages Coupons

**Tester:** Xon  
**Portal:** Admin  
**Duration:** ~15 minutes

### User Story
As an admin, I want to create coupon batches with PINs so that volunteers can redeem rewards.

### Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Login as admin, navigate to "Coupons" page | Coupon list loads (may be empty) | ⬜ |
| 2 | Click "+ Create Coupon" | Create coupon form opens | ⬜ |
| 3 | Fill in: Title = "Test Voucher $10", Value = $10.00, Quantity = 5 | Fields accept input | ⬜ |
| 4 | Set expiry date to 31 Dec 2026 | Date picker works | ⬜ |
| 5 | Click "Create Coupon" | Success message: "Created 5 PINs" | ⬜ |
| 6 | Find the new coupon in the list and click "PINs" | 5 unique 6-digit PINs displayed | ⬜ |
| 7 | Test filter chips: click "Active", "Depleted", "All" | Each filter shows correct coupons | ⬜ |

**Pass/Fail:** ✅ Pass / ❌ Fail  
**Notes/Issues Found:** ________________

---

## 5. UAT-03: Admin Configures Rewards

**Tester:** Xon  
**Portal:** Admin  
**Duration:** ~10 minutes

### User Story
As an admin, I want to configure the points-per-dollar rate so that coupon point costs update dynamically.

### Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Login as admin, navigate to "Rewards Configuration" | Current config values displayed | ⬜ |
| 2 | Note current "Points Per Dollar" value | Value displayed (default: 100) | ⬜ |
| 3 | Navigate to "Coupons" page and note a coupon's points cost | Points cost visible | ⬜ |
| 4 | Return to Rewards Config, change Points Per Dollar to 50, click Save | Config persists | ⬜ |
| 5 | Go back to "Coupons" page | All coupon points costs have decreased proportionally | ⬜ |
| 6 | Return to Config, change back to 100, Save | Config restored | ⬜ |
| 7 | Check coupons returned to original values | Points costs back to original | ⬜ |

**Pass/Fail:** ✅ Pass / ❌ Fail  
**Notes/Issues Found:** ________________

---

## 6. UAT-04: Volunteer Browses and Joins Events

**Tester:** Vivian  
**Portal:** Volunteer PWA → `https://dist-orpin-nine-46.vercel.app`  
**Duration:** ~20 minutes  
**Device:** Phone (or Chrome mobile view)

### User Story
As a volunteer, I want to browse and join volunteering events so that I can participate and earn points.

### Pre-requisites
- An active event exists (an organiser should create one first if none exists)
- The volunteer is logged out initially

### Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Open `https://dist-orpin-nine-46.vercel.app` on phone | Splash screen loads with brand and "Get Started" | ⬜ |
| 2 | Tap "Get Started" | Redirected to login page | ⬜ |
| 3 | Tap "Create an account" | Registration form displays | ⬜ |
| 4 | Fill in: name, email (unique), password with uppercase+number | Fields accept input | ⬜ |
| 5 | Tap "Create Account" | Account created, redirected to home | ⬜ |
| 6 | On home screen, verify sections load: | | ⬜ |
| 6a | Points wallet displayed | Balance shows 0 or starting points | ⬜ |
| 6b | Featured events load | Event cards visible (horizontal scroll) | ⬜ |
| 6c | "Your Bookings" shows (may be empty) | Empty state or bookings list | ⬜ |
| 7 | Tap "Events" tab at bottom | Browse events page loads | ⬜ |
| 8 | Tap an event card to see details | Event detail screen with description, date, location | ⬜ |
| 9 | Tap "Join Event" button | Join confirmed, event added to "Your Bookings" | ⬜ |
| 10 | Return to home and tap "My QR" in wallet | QR code displays (scannable) | ⬜ |

**Pass/Fail:** ✅ Pass / ❌ Fail  
**Notes/Issues Found:** ________________

---

## 7. UAT-05: Volunteer Redeems Rewards

**Tester:** Grace  
**Portal:** Volunteer PWA  
**Duration:** ~15 minutes

### User Story
As a volunteer, I want to redeem my earned points for reward coupons.

### Pre-requisites
- Volunteer must have enough points (at least 50–100)
- Admin should have created some coupons (UAT-02)

### Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Login as alice@test.com / password123 | Home screen loads with points balance | ⬜ |
| 2 | Tap "Redeem" button on the wallet card | Redirected to Rewards catalogue | ⬜ |
| 3 | Browse available rewards | List of rewards with point costs displayed | ⬜ |
| 4 | Tap a reward to view details | Detail screen with reward info and "Redeem" button | ⬜ |
| 5 | Tap "Redeem" | Confirmation prompt appears | ⬜ |
| 6 | Confirm redemption | Success screen shows 6-digit PIN code | ⬜ |
| 7 | Note the PIN code | PIN is 6 digits (e.g., "179149") | ⬜ |
| 8 | Navigate to "My Coupons" (from home or profile) | List shows the newly redeemed coupon with its PIN | ⬜ |

**Pass/Fail:** ✅ Pass / ❌ Fail  
**Notes/Issues Found:** ________________

---

## 8. UAT-06: Merchant Verifies PIN

**Tester:** Grace  
**Portal:** Merchant PWA → `https://webportals-lovat.vercel.app/merchant`  
**Duration:** ~15 minutes

### User Story
As a merchant cashier, I want to verify a volunteer's 6-digit PIN so that they can claim their reward in-store.

### Pre-requisites
- A volunteer has redeemed a reward and has a valid PIN (use Alice from UAT-05)

### Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Open `https://webportals-lovat.vercel.app/merchant` on phone | Login page loads | ⬜ |
| 2 | Login as cheryl@test.com / password123 | Redirected to PIN entry screen | ⬜ |
| 3 | Enter the volunteer's 6-digit PIN | PIN entry field accepts 6 digits | ⬜ |
| 4 | Tap "Verify" | Coupon details displayed (title, volunteer name, expiry) | ⬜ |
| 5 | Tap "Confirm Redemption" | Redemption confirmed, PIN marked as used | ⬜ |
| 6 | Navigate to "History" | Transaction appears in redemption history | ⬜ |
| 7 | Try to verify the same PIN again | Error: "Coupon already used" | ⬜ |
| 8 | Enter an invalid PIN (e.g., "000000") | Error: "Wrong 6-digit PIN" | ⬜ |

**Pass/Fail:** ✅ Pass / ❌ Fail  
**Notes/Issues Found:** ________________

---

## 9. UAT-07: Organiser Manages Events

**Tester:** Vivian / Nurain  
**Portal:** Organiser → `https://webportals-lovat.vercel.app/organiser/login`  
**Duration:** ~20 minutes

### User Story
As an organiser, I want to create and manage events so that volunteers can sign up for my activities.

### Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Open organiser portal URL | Redirected to organiser login | ⬜ |
| 2 | Login as bob@test.com / password123 | Dashboard loads with event statistics | ⬜ |
| 3 | Check dashboard numbers (total events, volunteers, upcoming) | Stats display correctly | ⬜ |
| 4 | Click "Create Event" | Event creation form opens | ⬜ |
| 5 | Fill in: title, description, location, date, capacity (50), points (20), category | All fields work | ⬜ |
| 6 | Submit the form | Event created, appears in events list | ⬜ |
| 7 | Find the new event and click "Roster" | Roster page loads (may be empty) | ⬜ |
| 8 | If volunteers have registered, verify their names appear | Registered volunteers listed with status | ⬜ |
| 9 | Click "Feedback" on a completed event | Feedback entries visible (or empty state) | ⬜ |

**Pass/Fail:** ✅ Pass / ❌ Fail  
**Notes/Issues Found:** ________________

---

## 10. UAT-08: Role-Based Access Control

**Tester:** Nurain  
**Portal:** All portals  
**Duration:** ~10 minutes

### User Story
As a user, I should only be able to access portals and features that match my role.

### Steps

| # | Action | Expected Result | Status |
|---|--------|----------------|--------|
| 1 | Login as alice@test.com (volunteer) on the Admin portal URL | Access denied or redirect to correct portal | ⬜ |
| 2 | Login as alice@test.com on the Organiser portal URL | Access denied or redirect | ⬜ |
| 3 | Login as alice@test.com on the Merchant portal URL | Access denied or redirect | ⬜ |
| 4 | Login as cheryl@test.com (merchant) on Admin portal | Access denied | ⬜ |
| 5 | Login as cheryl@test.com on Organiser portal | Access denied | ⬜ |
| 6 | Login as bob@test.com (organiser) on Admin portal | Access denied (should redirect to organiser) | ⬜ |
| 7 | Login as carol@test.com (admin) on Volunteer PWA | Access denied (app is for volunteers only) | ⬜ |

**Pass/Fail:** ✅ Pass / ❌ Fail  
**Notes/Issues Found:** ________________

---

## 11. Technical Task 1: CI Coverage Reporting

**Owner:** Xon  
**Location:** `.github/workflows/ci.yml`  
**Est. time:** ~30 minutes

### Goal
Add test coverage reporting to the GitHub Actions CI pipeline so the team can see code coverage metrics on each push.

### Steps

```yaml
# Add this to the "Run tests" step in .github/workflows/ci.yml

- name: Run tests with coverage
  run: |
    cd backend
    node --test --experimental-test-coverage tests/unit/*.test.js

- name: Upload coverage to Codecov (optional)
  uses: codecov/codecov-action@v5
  with:
    directory: backend/coverage
    fail_ci_if_error: false
```

### Detailed Steps

| # | Action | Status |
|---|--------|--------|
| 1 | Open `.github/workflows/ci.yml` in the project root | ⬜ |
| 2 | Find the existing `Run tests` step | ⬜ |
| 3 | Add `--experimental-test-coverage` flag to the `node --test` command | ⬜ |
| 4 | Add a step to upload coverage as a CI artifact: | ⬜ |
| | `actions/upload-artifact` with path `backend/coverage/` | ⬜ |
| 5 | (Optional) Create a Codecov account and add the Codecov action | ⬜ |
| 6 | Commit and push to verify CI passes with coverage | ⬜ |

### Verification

```bash
# Run locally to verify coverage output
cd D:\c3000c\volunteering-rewards-app\backend
node --test --experimental-test-coverage tests/unit/*.test.js
# Expected: Coverage summary printed after test results
```

---

## 12. Technical Task 2: Test Database in CI

**Owner:** Xon  
**Location:** `.github/workflows/ci.yml`  
**Est. time:** ~30 minutes

### Goal
Add a PostgreSQL service container to the CI workflow so integration tests can run against a real database.

### Steps

| # | Action | Status |
|---|--------|--------|
| 1 | Open `.github/workflows/ci.yml` | ⬜ |
| 2 | Add a `services:` section for PostgreSQL: | ⬜ |

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: volunteering_rewards_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
```

| # | Action | Status |
|---|--------|--------|
| 3 | Add a `Run migrations` step before tests: | ⬜ |

```yaml
      - name: Run migrations
        run: |
          cd backend
          node src/utils/migrationRunner.js
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: volunteering_rewards_test
          DB_USER: postgres
          DB_PASSWORD: postgres
```

| # | Action | Status |
|---|--------|--------|
| 4 | Add environment variables to the test step | ⬜ |
| 5 | Add a smoke test step to verify DB connection: | ⬜ |

```yaml
      - name: Smoke test
        run: |
          curl -s http://localhost:3000/api/health | grep -q '"status":"ok"'
```

| # | Action | Status |
|---|--------|--------|
| 6 | Push and verify CI pipeline passes | ⬜ |

---

## 13. Bug Reporting Template

When you find a bug during UAT, report it using this format:

```
### Bug Report
**UAT Test:** UAT-XX (step #)
**Severity:** 🟥 Critical / 🟡 Major / 🟢 Minor
**URL:** https://...
**Browser/Device:** Chrome 125 / iPhone 15 / etc.

**Steps to reproduce:**
1. Login as ...
2. Click ...
3. See error

**Expected:** ...
**Actual:** ...

**Screenshot:** [attach if applicable]

**Reported by:** [Your name]
```

### Bug priority guidelines

| Severity | Meaning | Action |
|----------|---------|--------|
| 🟥 Critical | Cannot complete the workflow | Stop testing, notify team immediately |
| 🟡 Major | Feature works but with issues | Report and continue testing |
| 🟢 Minor | Cosmetic or non-blocking | Report at end of session |

---

## 14. Quick Reference

### Login credentials (all passwords: `password123`)

| Role | Email |
|------|-------|
| Admin | carol@test.com |
| Organiser | bob@test.com |
| Volunteer | alice@test.com |
| Merchant | cheryl@test.com |

### Portal URLs

| Portal | URL |
|--------|-----|
| Volunteer PWA | `https://dist-orpin-nine-46.vercel.app` |
| Admin | `https://webportals-lovat.vercel.app/admin/login` |
| Organiser | `https://webportals-lovat.vercel.app/organiser/login` |
| Merchant | `https://webportals-lovat.vercel.app/merchant` |
| Scanner | `https://webportals-lovat.vercel.app/scan` |
| Health Check | `https://vol-rewards-api.onrender.com/api/health` |

### UAT Assignments Summary

| Test | Tester | Est. Time | Portal |
|------|--------|-----------|--------|
| UAT-01 | Xon | 15 min | Admin |
| UAT-02 | Xon | 15 min | Admin |
| UAT-03 | Xon | 10 min | Admin |
| UAT-04 | Vivian | 20 min | Volunteer PWA |
| UAT-05 | Grace | 15 min | Volunteer PWA |
| UAT-06 | Grace | 15 min | Merchant |
| UAT-07 | Vivian / Nurain | 20 min | Organiser |
| UAT-08 | Nurain | 10 min | All portals |
| Tech-1 | Xon | 30 min | CI config |
| Tech-2 | Xon | 30 min | CI config |

### Commands Reference

```bash
# Run unit tests locally
cd D:\c3000c\volunteering-rewards-app\backend
npm test

# Run with coverage
node --test --experimental-test-coverage tests/unit/*.test.js

# Run migrations
node src/utils/migrationRunner.js
```

---

*End of UAT & Remaining Tasks Guide v1.0*
