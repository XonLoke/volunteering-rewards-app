# Test Access Points v3

**Version:** 3.0
**Date:** 9 July 2026
**Project:** Volunteering Rewards App (C3000C)

---

## Portal Access URLs

| Portal | URL | Login |
|--------|-----|-------|
| **Admin** | `https://webportals-lovat.vercel.app/admin` | carol@test.com |
| **Organiser (Web)** | `https://webportals-lovat.vercel.app/organiser` | bob@test.com |
| **Merchant / Cashier** | `https://webportals-lovat.vercel.app/merchant` | cheryl@test.com, diana@test.com |
| **Scanner PWA** | `https://webportals-lovat.vercel.app/scan` | bob@test.com |
| **Volunteer App (PWA)** | `https://volunteering-rewards-app.vercel.app/home` | alice@test.com, eve@test.com |
| **Volunteer App (APK)** | `frontend/mobile_app/android/app/build/outputs/apk/release/app-release.apk` | alice@test.com, eve@test.com |
| **Organiser Mobile App** | `frontend/organiser_mobile_app/` (Expo dev server) | bob@test.com |
| **API** | `https://vol-rewards-api.onrender.com/api` | — |
| **API Health** | `https://vol-rewards-api.onrender.com/api/health` | — |

---

## Where Everything Runs

| Component | Hosted On |
|-----------|-----------|
| Volunteer PWA (`volunteering-rewards-app.vercel.app`) | **Vercel** (cloud) |
| Admin / Organiser / Merchant / Scanner Portals (`webportals-lovat.vercel.app`) | **Vercel** (cloud) |
| Backend API (`vol-rewards-api.onrender.com`) | **Render** (cloud) |
| Database (`neon.tech`) | **Neon** (cloud) |
| APK Build | **Local Android SDK build** |
| Organiser Mobile App | **Expo dev server** (local) |

All cloud services run 24/7. Your computer can be completely shut down and everything still works.

---

## Additional URLs

| What | URL / Path |
|------|------------|
| Admin Login | `https://webportals-lovat.vercel.app/admin/login` |
| Organiser Portal | `https://webportals-lovat.vercel.app/organiser` |
| Merchant Portal | `https://webportals-lovat.vercel.app/merchant` |
| Scanner PWA | `https://webportals-lovat.vercel.app/scan` |
| Create User Account (Admin API) | `POST https://vol-rewards-api.onrender.com/api/admin/users/create-account` |
| APK Download (Android) | `D:\c3000c\volunteering-rewards-app\frontend\mobile_app\android\app\build\outputs\apk\release\app-release.apk` |
| GitHub Release (APK) | `https://github.com/XonLoke/volunteering-rewards-app/releases/tag/v1.0.0-demo` |
| EAS Build Status | `https://expo.dev/accounts/xonloke/projects/vol-app/builds` |
| Render Dashboard | `https://dashboard.render.com` |
| Neon Console | `https://console.neon.tech` |
| Vercel Dashboard | `https://vercel.com/xonlokes-projects` |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Merchant | cheryl@test.com / diana@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Volunteer 2 | eve@test.com | password123 |

---

## Portal Access Matrix

| Persona | Admin Portal | Organiser Web | Merchant Portal | Scanner PWA | Volunteer PWA | Volunteer APK | Organiser Mobile |
|---------|:-----------:|:------------:|:--------------:|:----------:|:------------:|:------------:|:----------------:|
| Admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Organiser | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Merchant | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Volunteer | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## Testing Instructions by Role

### Carol (Admin)
- Uses `https://webportals-lovat.vercel.app/admin/login`
- Desktop use only — not mobile-optimised
- Test: Dashboard, Users, Coupons, Redemptions, Rewards Config, Merchants
- Use the **"+ Invite User"** button on the Users page to create accounts of any role

### Bob (Organiser)
**Two access methods:**

**1. Web Portal:** `https://webportals-lovat.vercel.app/organiser`
- Test: Dashboard, Events, Roster, Feedback (AI Summary)

**2. Mobile App:** `frontend/organiser_mobile_app/` (Expo dev server)
- Nurain built a standalone Expo/React Native organiser mobile app
- Integrated to use the shared production backend
- Contains: Dashboard, Events (CRUD), QR Scanner (attendance), Feedback viewer, Profile
- Run with: `cd frontend/organiser_mobile_app && npm install --legacy-peer-deps && npx expo start`
- Test flow: Login → Dashboard → Events → QR Scanner → Feedback → Profile

**3. Scanner PWA:** `https://webportals-lovat.vercel.app/scan`
- Installable as PWA on phone via browser
- Manual ID entry works without camera on desktop

### Cheryl / Diana (Merchant Cashier)
- Uses `https://webportals-lovat.vercel.app/merchant`
- Installable as PWA on phone via browser
- Test: PIN verification, Coupon redemption, 5-minute reversal, History

### Alice & Eve (Volunteers)
**Three access methods:**

**1. PWA:** `https://volunteering-rewards-app.vercel.app` — Mobile-optimised, installable on home screen
- Test: Login, Home, Browse Events, Register, Rewards, Leaderboard, Profile, Referral

**2. APK:** Install the Android APK directly on an Android device
- Download from GitHub Release v1.0.0-demo or local build output
- All PWA features plus native experience, offline support, push notification capability
- 118 MB, production API URL configured

**3. Expo Go:** For iOS testing via Expo Go app (requires dev server QR code)

---

## Testing Without an Android Phone

If you do not own an Android phone, use the **PWA** instead. It is built from the same source code as the APK. Every feature works identically:

| Feature | PWA | APK |
|---------|-----|-----|
| Browse events | ✅ | ✅ |
| Register / join events | ✅ | ✅ |
| View points & rewards | ✅ | ✅ |
| Redeem coupons | ✅ | ✅ |
| QR code display | ✅ | ✅ |
| Profile & settings | ✅ | ✅ |
| Referral program | ✅ | ✅ |
| Leaderboard | ✅ | ✅ |
| AI Recommendations | ✅ | ✅ |
| Offline support | Limited | ✅ Full |
| Push notifications | ⬜ Future | ⬜ Future |
| Home screen install | ✅ "Add to Home Screen" | ✅ Native install |

**How to test:** Open `https://volunteering-rewards-app.vercel.app` in any mobile browser → tap "Add to Home Screen" → use like a native app.

**Android Emulator alternative:** Use Android Studio's Virtual Device Manager (free) to run the APK on a virtual Pixel device. See full instructions below.

---

## Organiser Mobile App — Testing Guide

### Prerequisites
- Node.js 20+
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- Android emulator, iOS simulator, or physical device with Expo Go app
- Backend must be running (production is live at `https://vol-rewards-api.onrender.com`)

### Running the App
```
cd frontend/organiser_mobile_app
npm install --legacy-peer-deps
npx expo start
```
Then press `a` (Android emulator), `i` (iOS simulator), or scan QR code with Expo Go.

### Test Flow
1. **Login** — Enter `bob@test.com` / `password123` → Should navigate to Dashboard
2. **Dashboard** — Total events, volunteers, upcoming events list
3. **Events** — List events → View details → Create new event
4. **QR Scanner** — Select event → Scan volunteer QR code → "Check-in Successful"
5. **Feedback** — Select event → View volunteer ratings and comments
6. **Profile** — View organiser name, email, and stats

---

## Orchestration Integration Test

After making changes, verify the entire system still works:

```
node backend/tests/integration/orchestration.test.js
```

**Expected:** 54/54 PASS

The test verifies cross-portal data flows:
- Admin ↔ Organiser (11 tests)
- Admin ↔ Volunteer (8 tests)
- Admin ↔ Merchant (6 tests)
- Event Lifecycle Organiser ↔ Volunteer (10 tests)
- Rewards Workflow Merchant ↔ Volunteer (7 tests)
- APK Build Verification (7 tests)

---

## APK Installation Guide

### GitHub Release (Recommended)
Download from: `https://github.com/XonLoke/volunteering-rewards-app/releases/tag/v1.0.0-demo`

### Local Build
APK file at: `frontend/mobile_app/android/app/build/outputs/apk/release/app-release.apk`

### Installation Steps
1. Transfer the APK to an Android device (USB, email, or cloud storage)
2. Open the file and allow installation from unknown sources if prompted
3. Launch the app and login with `alice@test.com` / `password123`

### APK Features
- Native Android app built with Expo / React Native
- Same features as the PWA: Browse events, Register, Rewards, Leaderboard, Profile, Referral
- Camera access for QR code scanning
- Push notification support (when configured)

---

## Android Emulator Setup

### Requirements
Windows, macOS, or Linux with 8GB+ RAM

### Steps
1. Download Android Studio from `https://developer.android.com/studio`
2. Create a Virtual Device: Pixel 6 or 7, Android 14 (API 34)
3. Start the emulator and install the APK:
   ```
   adb install D:\c3000c\volunteering-rewards-app\frontend\mobile_app\android\app\build\outputs\apk\release\app-release.apk
   ```
4. Login with `alice@test.com` / `password123` and test all features

---

## Configuring API URL for Mobile Testing

The production API URL is: `https://vol-rewards-api.onrender.com/api`

### For Mobile App
Set in `frontend/mobile_app/.env`:
```
EXPO_PUBLIC_API_URL=https://vol-rewards-api.onrender.com/api
```

### For Web Portals
Set in `frontend/web_portals/.env`:
```
VITE_API_URL=https://vol-rewards-api.onrender.com/api
```

### Verify connection
```
https://vol-rewards-api.onrender.com/api/health
```
Should return `{ "status": "ok", "db_connected": true }`

---

## About Cold Starts

Render's free tier backend spins down after **15 minutes of inactivity**. The first request after idle takes approximately **30–60 seconds** to wake up (cold start). If a page is slow, wait a minute and refresh.

---

## Cross-Portal Data Consistency Verification

After completing per-role tests, verify data flows across portals:

| Test | Action | Verify In |
|------|--------|-----------|
| Admin creates event category | Admin → Coupons / Config | Organiser sees updated config |
| Organiser creates event | Organiser Web → Events | Admin sees new event in list |
| Volunteer registers | Volunteer App → Events | Organiser sees new registration |
| Organiser scans QR | Scanner PWA → Scan | Attendance recorded in Organiser roster |
| Merchant verifies PIN | Merchant Portal → Verify | Coupon status changes to redeemed |
| Volunteer earns points | Volunteer App → Profile | Points balance updated |

---

*— End of Test Access Points v3 —*
