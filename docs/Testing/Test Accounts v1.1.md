# Test Accounts — Live List v1.1 (verified 11 Aug 2026)

**Source:** Production API `GET /api/admin/users` (logged in as carol, live verification 11 Aug 2026).

**Password for all test accounts:** `password123` (documented test convention — README, manuals, seed data).

> ⚠️ **Post-exam rotation (early Sep):** after the exam demo window closes, all active test accounts below are rotated to unique strong passwords via `backend/scripts/reset_test_accounts.js` (dry-run default; `--apply` to execute). Disabled accounts are skipped automatically.

---

## Test Accounts (`@test.com`) — 10 total

| # | User ID | Email | Name | Role | Portal / Access Point | Status |
|---|---------|-------|------|------|----------------------|--------|
| 1 | 3 | carol@test.com | Carol Admin | **System Admin** | Admin Portal — `webportals-lovat.vercel.app/admin` | ✅ active |
| 2 | 2 | bob@test.com | Bob Organizer | **Event Organiser** | Organiser Portal — `/organiser` · Scanner PWA — `/scan` | ✅ active |
| 3 | 4 | cheryl@test.com | Cheryl Merchant | **Merchant / Cashier** | Merchant Portal — `/merchant` (PIN verify) | ✅ active |
| 4 | 40 | johnny@test.com | Johnny Organizer | Event Organiser | Organiser Portal — `/organiser` | ✅ active |
| 5 | 43 | diana@test.com | Diana Merchant | Merchant | Merchant Portal — `/merchant` | ✅ active |
| 6 | 44 | frank@test.com | Frank Merchant | Merchant | Merchant Portal — `/merchant` | ✅ active |
| 7 | 1 | alice@test.com | Alice Volunteer | Volunteer | Volunteer PWA — `volunteering-rewards-app.vercel.app` · APK · Expo Go | ✅ active |
| 8 | 38 | eve@test.com | Eve Volunteer | Volunteer | Volunteer PWA — `volunteering-rewards-app.vercel.app` · APK · Expo Go | ✅ active |
| 9 | 47 | verify-test@test.com | Verify Test | Volunteer | Volunteer PWA — `volunteering-rewards-app.vercel.app` · APK · Expo Go | ✅ active |
| 10 | 46 | test-vivian2@test.com | Test User | Volunteer | Volunteer PWA — `volunteering-rewards-app.vercel.app` · APK · Expo Go | ⛔ **disabled** |

**Primary demo set (README):** carol (admin) · bob (organiser + scanner) · cheryl (merchant/cashier) · alice (volunteer) · eve (volunteer).

## Volunteer Access Points (PWA / APK / Expo Go)

| Access Point | How to Open | Best For |
|--------------|-------------|----------|
| **PWA** | https://volunteering-rewards-app.vercel.app — browser → "Add to Home Screen" (recommended for demo) | Anyone with internet |
| **APK v1.1.2** | [GitHub Release](https://github.com/XonLoke/volunteering-rewards-app/releases/tag/apk-v1.1.2) — download `Volunteering-Rewards-App_11Aug2026.apk` (~82 MB) and side-load (allow unknown sources) | Android phones without browser-PWA preference |
| **Expo Go** | From `frontend/mobile_app`: `npx expo start` → scan QR code in the Expo Go app | Team members with the repo (Vivian's test path) |

All three run the **same code** (current `main`) — the PWA is always the latest deployed bundle; the APK and Expo Go carry the code as of the last build/pull.

**Undocumented finds (11 Aug audit):** johnny@test.com (id 40), verify-test@test.com (47), test-vivian2@test.com (46, disabled) — leftovers from earlier testing sessions, now tracked here.

---

## Personal / Other Accounts (NOT test accounts — excluded from rotation)

| User ID | Email | Name | Role | Status |
|---------|-------|------|------|--------|
| 48 | viviankohhhh@gmail.com | vivian | Volunteer | ✅ active |
| 45 | alicetest@gmail.com | Alice test | Volunteer | ✅ active |

Personal logins used by team members for volunteer-app testing. The September rotation only targets `@test.com` accounts — these are deliberately left untouched.

---

## Notes

- **Roles → portals:** admin → Admin Portal; organiser → Organiser Portal + Scanner PWA; merchant → Merchant Portal (cashier = PIN verification, merchant/admin roles only — `merchant.routes.js` `requireMerchantOrAdmin`); volunteer → Volunteer PWA / APK / Expo Go.
- **Live verification:** every row above was read from the live production API on 11 Aug 2026 (12 users total; 10 `@test.com`, 2 personal).
- **Rotation tooling:** `backend/scripts/reset_test_accounts.js` — admin login (current password via `ADMIN_PASSWORD` env) → resets each active `@test.com` account → verifies by fresh login. Live dry-run: 9 active, 1 skipped (disabled).
- **Seed default:** `backend/src/utils/seed.js` still seeds `password123` — optionally update it as part of the post-exam cleanup so fresh dev seeds start from strong defaults.
