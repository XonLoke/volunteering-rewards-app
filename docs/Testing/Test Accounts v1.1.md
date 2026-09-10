# Test Accounts — Live List v1.1 (verified 11 Aug 2026)

**Source:** Production API `GET /api/admin/users` (logged in as carol, live verification 11 Aug 2026).

**Password for all test accounts:** `password123` (documented test convention — README, manuals, seed data).

> ✅ **These passwords are permanent — `password123` is intentionally kept.** After the project concluded, the repo was opened to the public as a working demo, so the shared test password is deliberately retained: visitors can log in as any of the four roles (volunteer, organiser, merchant, admin) and explore the live system. Read-only demonstration — the app runs in public-demo mode, which suppresses all outbound email and self-heals the demo data every hour, so any test you run is safe and reversible.
>
> ℹ️ `backend/scripts/reset_test_accounts.js` still exists and can rotate these passwords, but **it is deliberately not run** — doing so would break public access.

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

Personal logins used by team members for volunteer-app testing. They are outside the `@test.com` scope, so the demo reset leaves them alone — and any password rotation would only ever target `@test.com` accounts.

---

## Notes

- **Roles → portals:** admin → Admin Portal; organiser → Organiser Portal + Scanner PWA; merchant → Merchant Portal (cashier = PIN verification, merchant/admin roles only — `merchant.routes.js` `requireMerchantOrAdmin`); volunteer → Volunteer PWA / APK / Expo Go.
- **Live verification:** every row above was read from the live production API on 11 Aug 2026 (12 users total; 10 `@test.com`, 2 personal).
- **Rotation tooling:** `backend/scripts/reset_test_accounts.js` — admin login (current password via `ADMIN_PASSWORD` env) → resets each active `@test.com` account → verifies by fresh login. Live dry-run: 9 active, 1 skipped (disabled).
- **Seed default:** `backend/src/utils/seed.js` seeds `password123`, and `backend/src/services/demoReset.service.js` restores the 8 canonical demo accounts to it every hour while public-demo mode is on. A visitor who changes an admin password therefore cannot lock out the next visitor.
