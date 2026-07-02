# Jira Update v11 — Sprint 5 Bug Fixes (EXECUTED ✅)

**Version:** 11
**Date:** 2 July 2026
**From:** Xon
**Method:** Jira REST API — directly applied
**Sprint:** Sprint 5 (29 Jun – 6 Jul 2026) — Final Testing, Documentation & Delivery

---

## Summary of Changes Applied

| Action | Key | Summary | Status |
|--------|-----|---------|--------|
| ✅ Created | KAN-158 | QR Attendance — Add missing volunteer polling endpoint | Done |
| ✅ Created | KAN-159 | Login response missing volunteer_qr_code field | Done |
| ✅ Created | KAN-160 | Mobile organiser QR scanner button has no functionality | Done |
| ✅ Created | KAN-161 | PIN display shows 000000 instead of real PIN | Done |
| ✅ Created | KAN-162 | Redeem confirmation calls wrong API endpoint with wrong body | Done |
| ✅ Created | KAN-163 | Merchant PIN verify and redeem response shapes don't match frontend | Done |
| ✅ Updated | KAN-155 | Transitioned to In Progress | In Progress |

---

## Issue Details

### KAN-158 — QR Attendance Auto-Detect Broken ✅

| Field | Value |
|---|---|
| **Summary** | QR Attendance — Add missing volunteer polling endpoint |
| **Description** | The volunteer QR display screen polls GET /api/attendance/volunteer/:id/latest to auto-detect when an organizer has scanned them. This endpoint did not exist, so volunteers never saw the success screen. |
| **Priority** | High |
| **Labels** | qr, attendance, backend |

**Fixes:**
- Added `getLatestAttendance()` to `attendance.service.js`
- Added handler to `attendance.controller.js` with camelCase + snake_case keys
- Added `GET /volunteer/:id/latest` route to `attendance.routes.js`

### KAN-159 — Login Missing volunteer_qr_code ✅

| Field | Value |
|---|---|
| **Summary** | Login response missing volunteer_qr_code field |
| **Priority** | High |
| **Labels** | auth, qr, mobile |

**Fixes:**
- Added `u.volunteer_qr_code` to login SQL query
- Added `volunteer_qr_code` to login response object
- Fixed mobile login/register to save user data (incl. `volunteer_qr_code`) to AsyncStorage

### KAN-160 — Mobile Organiser Scanner Is a Stub ✅

| Field | Value |
|---|---|
| **Summary** | Mobile organiser QR scanner button has no functionality |
| **Priority** | Medium |
| **Labels** | qr, scanner, mobile, expo-camera |

**Fixes:**
- Created `organiser/scanner.tsx` with full camera integration:
  - Camera permission flow with nice UI
  - Scanner viewfinder with scan animation
  - Strips `VR_VOLUNTEER:` prefix, calls `POST /api/attendance/scan`
  - Success/error result overlay with "Scan Next" option
  - Torch toggle, 5s debounce
- Wired scan button in `controller.tsx` → navigates to scanner
- Added scanner to organiser tab layout (hidden from bar)

### KAN-161 — PIN Display Shows "000000" ✅

| Field | Value |
|---|---|
| **Summary** | PIN display shows 000000 instead of real PIN |
| **Priority** | Highest |
| **Labels** | coupon, pin, redemption, mobile |

**Fixes:**
- Changed interface `pin_hash: string` → `pin_code: string` in my-coupons.tsx
- Changed param `pin: coupon.pin_hash` → `pin: coupon.pin_code`
- Changed display code to use real PIN

### KAN-162 — Redeem Confirmation Wrong API Call ✅

| Field | Value |
|---|---|
| **Summary** | Redeem confirmation calls wrong API endpoint with wrong body |
| **Priority** | Highest |
| **Labels** | coupon, redeem, api, mobile |

**Fixes:**
- Changed URL from `POST /rewards/redeem` → `POST /rewards/{id}/redeem`
- Removed incorrect fetch-style options from `api.post()`
- Fixed response unwrapping: extracts `pin` and `points_balance` from `response?.data`
- Same fixes applied to root app/ version

### KAN-163 — Merchant Verify/Redeem Response Mismatch ✅

| Field | Value |
|---|---|
| **Summary** | Merchant PIN verify and redeem response shapes don't match frontend |
| **Priority** | High |
| **Labels** | merchant, pin, redemption, web, backend |

**Fixes:**
- `findCouponByPin()` now returns `{ coupon: { ..., coupon_title, valid_until, points_cost, value_cents } }`
- `redeemCoupon()` now returns `{ redemption: { ..., coupon_type, coupon_title, value_cents, pin } }`
- Added `value_cents` and `merchant_name` to verify query
- Fixed `pin_code` not being stored in DB on redeem
- All endpoints verified against production

---

## Sprint 5 Updated Status

| Area | Status | % Complete |
|---|---|---|
| Backend API | ✅ All endpoints verified | 100% |
| APK Build | ✅ Done | 100% |
| CI Build | ✅ Passing | 100% |
| PWA-APK Unification | ✅ Done | 100% |
| QR Attendance (Volunteer) | ✅ Fixed & deployed | 100% |
| QR Scanner (Organiser) | ✅ Coded (needs APK rebuild) | 100% |
| Merchant Redemption | ✅ Fixed & verified | 100% |
| APK Testing | ⬜ Not started | 0% |
| Security Testing | ⬜ Not started | 0% |
| Integration Testing | ⬜ Not started | 0% |
| UAT | 🔄 Starting 3 Jul | 0% |
| Documentation | ⬜ Due 5 Jul | 10% |
| Sprint Handover | ⬜ 6 Jul | 0% |

---

**Board:** https://fengshui0011.atlassian.net/jira/software/projects/KAN/boards/2
**Status Report:** docs/Sprint 5 Status Report v1.0.md
**Sprint Schedule:** docs/Sprint 5 Schedule v5.md

*— End of Jira Update v11 (EXECUTED ✅ via REST API) —*
