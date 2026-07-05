# Test Access Points v2.0

**Version:** 2.0  
**Date:** 2 July 2026  
**Project:** Volunteering Rewards App (C3000C)  

---

## Portal Access URLs

| Portal | URL | Login |
|--------|-----|-------|
| **Admin** | `https://webportals-lovat.vercel.app/admin` | carol@test.com |
| **Organiser** | `https://webportals-lovat.vercel.app/organiser` | bob@test.com |
| **Merchant / Cashier** | `https://webportals-lovat.vercel.app/merchant` | cheryl@test.com, diana@test.com |
| **Scanner PWA** | `https://webportals-lovat.vercel.app/scan` | bob@test.com |
| **Volunteer App (PWA)** | `https://volunteering-rewards-app.vercel.app/home` | alice@test.com, eve@test.com |
| **Volunteer App (APK)** | `frontend/mobile_app/android/app/build/outputs/apk/release/app-release.apk` | alice@test.com, eve@test.com |

---

## Where Everything Runs

| Component | Hosted On |
|-----------|-----------|
| Volunteer PWA (`volunteering-rewards-app.vercel.app`) | **Vercel** (cloud) |
| Admin / Organiser / Merchant / Scanner Portals (`webportals-lovat.vercel.app`) | **Vercel** (cloud) |
| Backend API (`vol-rewards-api.onrender.com`) | **Render** (cloud) |
| Database (`neon.tech`) | **Neon** (cloud) |
| APK Build | **EAS / Local build machine** |

All services are hosted on cloud servers that run 24/7. Your computer can be completely shut down and everything still works.

Anyone with the URL can open the Volunteer PWA on their phone, login with `alice@test.com` / `password123`, and use the app — browse events, check rewards, view leaderboard, etc. For the APK version, download the `.apk` file from the build output folder and install it directly on an Android device.

---

## Additional URLs

| What | URL / Path |
|------|------------|
| Admin Login | `https://webportals-lovat.vercel.app/admin/login` |
| Organiser Portal | `https://webportals-lovat.vercel.app/organiser` |
| Merchant Portal | `https://webportals-lovat.vercel.app/merchant` |
| Scanner PWA | `https://webportals-lovat.vercel.app/scan` |
| API Health Check | `https://vol-rewards-api.onrender.com/api/health` |
| APK Download (Android) | `D:\c3000c\volunteering-rewards-app\frontend\mobile_app\android\app\build\outputs\apk\release\app-release.apk` |
| EAS Build Status | `https://expo.dev/accounts/xonloke/projects/vol-app/builds` |

---

## Testing Instructions by Role

### Carol (Admin)
- Uses `https://webportals-lovat.vercel.app/admin/login`
- Desktop use only — not mobile-optimised
- Test: Dashboard, Users, Coupons, Redemptions, Rewards Config, Merchants

### Bob (Organiser)
- Uses `https://webportals-lovat.vercel.app/organiser` for event management
- Uses `https://webportals-lovat.vercel.app/scan` for QR attendance scanning
- Scanner can be installed as PWA on phone via browser
- Test: Dashboard, Events, Roster, Feedback (AI Summary), QR Scanner

### Cheryl / Diana (Merchant Cashier)
- Uses `https://webportals-lovat.vercel.app/merchant` for PIN verification
- Installable as PWA on phone via browser
- Test: PIN verification, Coupon redemption, 5-minute reversal, History

### Alice & Eve (Volunteers)
Two access methods:

- **PWA:** Open `https://volunteering-rewards-app.vercel.app` on a phone browser. Mobile-optimised, installable on home screen. Test: Login, Home, Browse Events, Register for Event, Rewards, Leaderboard, Profile, Referral.
- **APK:** Install the Android APK directly on an Android device. All features are the same as the PWA. The APK provides a native app experience with offline support and push notification capability.

---

## About Cold Starts

Render's free tier backend spins down after **15 minutes of inactivity**. The first request after idle takes approximately **30–60 seconds** to wake up (cold start). After that, it runs normally. So if you haven't visited the site in a while, the first page load may be slow — just wait a minute and refresh.

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

| Persona | Admin Portal | Organiser Portal | Merchant Portal | Scanner PWA | Volunteer PWA | Volunteer APK |
|---------|:-----------:|:---------------:|:--------------:|:----------:|:------------:|:------------:|
| Admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Organiser | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Merchant | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Volunteer | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## APK Installation Guide

The Android APK provides a native app experience for volunteers. It includes all features of the PWA plus offline support and push notification capability.

### Installation Steps
1. Locate the APK file at: `frontend/mobile_app/android/app/build/outputs/apk/release/app-release.apk`
2. Transfer the APK to an Android device (via USB, email, or cloud storage).
3. On the Android device, open the file and allow installation from unknown sources if prompted.
4. Launch the app and login with volunteer credentials (`alice@test.com` / `password123`).

### APK Features
- Native Android app built with Expo / React Native
- Same features as the PWA: Browse events, Register, Rewards, Leaderboard, Profile, Referral
- Camera access for QR code scanning at events
- Push notification support (when configured)

---

## Cloud Dashboards (for Admin Use)

| Service | URL |
|---------|-----|
| **Render** | `https://dashboard.render.com` |
| **Neon** | `https://console.neon.tech` |
| **Vercel** | `https://vercel.com/xonlokes-projects` |
