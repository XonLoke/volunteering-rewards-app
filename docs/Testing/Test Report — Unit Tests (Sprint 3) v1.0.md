# Test Report — Unit Tests (Sprint 3)

**Version:** 1.0  
**Date:** 5 June 2026  
**Project:** Volunteering Rewards App (C3000C)  
**Test Runner:** Node.js `--test`  
**Test Location:** `backend/tests/unit/`  
**Executed by:** Xon  

---

## Overall Result

| Total Tests | Passed | Failed | Skipped | Duration |
|-------------|--------|--------|---------|----------|
| 11 | **11** | 0 | 0 | 475 ms |

**All 11 unit tests pass.** The automated test suite is ready for team-wide use in Sprint 4.

---

## Detailed Results

### 1. Auth Service (`auth.service.test.js`) — 6 tests

| ID | Test | Status | Notes |
|----|------|--------|-------|
| UT-01 | Register — Success | ✅ Pass | New user created with valid token |
| UT-02 | Register — Duplicate Email | ✅ Pass | 409 error thrown for existing email |
| UT-03 | Login — Success | ✅ Pass | User + tokens returned for valid credentials |
| UT-04 | Login — Wrong Password | ✅ Pass | 401 error for invalid password |
| UT-05 | Token Refresh — Success | ✅ Pass | New tokens issued for valid refresh token |
| UT-06 | Token Refresh — Invalid Token | ✅ Pass | 401 error for expired/invalid token |

### 2. Admin Service (`admin.service.test.js`) — 3 tests

| ID | Test | Status | Notes |
|----|------|--------|-------|
| UT-07 | Points Calculation (ppd=100) | ✅ Pass | $5 Coffee = 500 pts `Math.round(500 × 100 ÷ 100)` |
| UT-08 | Points Recalculate (ppd=50) | ✅ Pass | $5 Coffee = 250 pts `Math.round(500 × 50 ÷ 100)` |
| UT-09 | PIN Hash Determinism | ✅ Pass | Same PIN → same 64-char HMAC-SHA256 hash |

### 3. Merchant Service (`merchant.service.test.js`) — 2 tests

| ID | Test | Status | Notes |
|----|------|--------|-------|
| UT-12 | Verify Valid PIN | ✅ Pass | Valid PIN returns coupon details (title, status, volunteer) |
| UT-13 | Verify Invalid PIN | ✅ Pass | Non-existent PIN returns 404 |

---

## How to Run

```bash
cd D:\c3000c\volunteering-rewards-app\backend

# Run all unit tests
npm test

# Run individual test files
node --test tests/unit/auth.service.test.js
node --test tests/unit/admin.service.test.js
node --test tests/unit/merchant.service.test.js
```

---

## Coverage Areas

All 3 core service layers are tested:

| Service Layer | Coverage | Key Logic Verified |
|---------------|----------|--------------------|
| **Auth** | Register (success + duplicate), Login (success + wrong pw), Token refresh (valid + invalid) | Email uniqueness, bcrypt comparison, JWT rotation |
| **Admin/Coupon** | Points calculation, config change propagation, PIN hash | `Math.round(value_cents × ppd ÷ 100)`, HMAC |
| **Merchant** | PIN verify (valid + invalid), hash lookup | PIN normalisation, database lookup by hash |

---

## Next Steps (Sprint 4)

| Task | Owner | Target |
|------|-------|--------|
| Add integration tests (API endpoints) | Grace + Xon | Week 1 |
| Add system tests (end-to-end workflows) | Whole team | Week 1 |
| Add UAT scenarios | Whole team | Week 2 |
| Add security tests | Vivian + Xon | Week 2 |
| Add performance tests | Xon | Week 2 |
| Log all results in Test Plan Section 10 | Fill during Sprint 4 | End of Sprint 4 |

---

*End of Test Report*
