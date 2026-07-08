# Test Access Points v2.2

**Version:** 2.2  
**Date:** 5 July 2026  
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
| APK Build | **Local Android SDK build** |

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
| **Create User Account (Admin API)** | **`POST https://vol-rewards-api.onrender.com/api/admin/users/create-account`** |
| APK Download (Android) | `D:\c3000c\volunteering-rewards-app\frontend\mobile_app\android\app\build\outputs\apk\release\app-release.apk` |
| EAS Build Status | `https://expo.dev/accounts/xonloke/projects/vol-app/builds` |

---

## Testing Instructions by Role

### Carol (Admin)
- Uses `https://webportals-lovat.vercel.app/admin/login`
- Desktop use only — not mobile-optimised
- Test: Dashboard, Users, Coupons, Redemptions, Rewards Config, Merchants
- **NEW:** Use the **"+ Invite User"** button on the Users page to create accounts of any role (admin, volunteer, organiser, merchant) — no seed script needed

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

## Testing Without an Android Phone

If you do not own an Android phone, you have several alternatives to test the app:

### Option 1: Use the PWA Instead (Recommended — No Setup Required)

The PWA at `https://volunteering-rewards-app.vercel.app` is built from the **same source code** as the APK. Every feature works identically:

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

**Even organiser scanner and merchant cashier features can be tested on desktop** via the web portals:
- Scanner: `https://webportals-lovat.vercel.app/scan` (manual ID entry works without camera)
- Merchant: `https://webportals-lovat.vercel.app/merchant`

---

### Option 2: Android Emulator (Android Studio — Free)

Anyone can run the APK on their computer using Android Studio's built-in virtual device:

**Requirements:** Windows, macOS, or Linux with 8GB+ RAM

```
Step 1: Download Android Studio
  → https://developer.android.com/studio
  → Install (free, official Google tool)

Step 2: Create a Virtual Device
  → Open Android Studio
  → Click "More Actions" → "Virtual Device Manager"
  → Click "Create Device"
  → Select a phone model (e.g., Pixel 6, Pixel 7)
  → Download a system image (e.g., Android 14.0)
  → Finish creation

Step 3: Install the APK
  → Start the emulator (green play button)
  → Wait for the virtual phone to boot
  → Drag and drop the APK file onto the emulator window
  → The app installs automatically

Step 4: Test the App
  → Open the app from the emulator's app drawer
  → Login with alice@test.com / password123
  → All features work exactly like a real Android phone
```

**Tip:** The emulator has a built-in camera simulator — useful for testing QR scanning features.

---

### Option 3: Windows Subsystem for Android (Windows 11 Only)

Windows 11 has native Android support built in:

```
Step 1: Install Windows Subsystem for Android
  → Open Microsoft Store
  → Search "Windows Subsystem for Android" → Install

Step 2: Enable Developer Mode
  → Open WSA Settings
  → Turn on "Developer Mode"

Step 3: Install the APK
  → Open PowerShell or Command Prompt
  → Navigate to the APK folder: cd D:\c3000c\volunteering-rewards-app\frontend\mobile_app\android\app\build\outputs\apk\release
  → Run: adb install app-release.apk
  → The app appears in your Windows Start Menu
```

---

### Option 4: Expo Go (iOS Testing)

For iOS team members who need to test the mobile app:

```
Step 1: Install "Expo Go" from the App Store on your iPhone

Step 2: The Expo dev server needs to be started locally by the project
  coordinator to generate a QR code for Expo Go to load the app

Step 3: Scan the QR code with Expo Go → app loads on your iPhone
```

**Note:** This is for testing individual features. For full standalone app testing, iOS deployment requires an Apple Developer account ($99/year) and EAS Build.

---

## Configuring Your Environment for Testing

### Setting Up a Virtual Android Phone (Android Studio)

If you prefer a virtual phone over the PWA, follow these detailed steps:

**1. Install Android Studio**
```
Download from: https://developer.android.com/studio
Run the installer — ensure "Android Virtual Device" component is selected
```

**2. Configure the Virtual Device**
```
Open Android Studio → Projects → More Actions → Virtual Device Manager
Click "Create Device"
  - Category: Phone
  - Device: Pixel 6 or Pixel 7 (recommended — good balance of performance and screen size)
  - Next
Download system image:
  - Choose "UpsideDownCake" (Android 14, API 34)
  - Click "Download" next to the latest stable image
  - Next
Verify configuration:
  - Name: Pixel 6 API 34
  - Orientation: Portrait
  - Graphics: Automatic (recommended)
  - Finish
```

**3. Start the Emulator and Install the APK**
```
In Virtual Device Manager, click the play icon (▶) on your device
Wait for boot (first boot takes 2–5 minutes)
Once booted, drag the APK file onto the emulator screen
Or use command line:
  adb install D:\c3000c\volunteering-rewards-app\frontend\mobile_app\android\app\build\outputs\apk\release\app-release.apk
```

**4. Test Features**
```
Login: alice@test.com / password123
Browse events, check rewards, view profile
The emulator also supports camera simulation for QR testing:
  → Click the camera icon in the emulator toolbar
  → Upload a QR code image to simulate scanning
```

---

### Testing on a Physical Phone — Changing API URL from Localhost to Production Backend

When testing the mobile app on a real phone (either via Expo Go or a development build), the app needs to point to the live backend API instead of localhost.

**Problem:** Development builds often default to `http://localhost:3000/api` which doesn't work on a physical phone.

**Solution:** Change the API URL configuration to point to the production Render backend.

**Method A: Via Environment Variable (Recommended)**
```
In frontend/mobile_app/:
  Create or edit .env file:
    EXPO_PUBLIC_API_URL=https://vol-rewards-api.onrender.com/api

  Or set at build time:
    npx expo export --platform web --env EXPO_PUBLIC_API_URL=https://vol-rewards-api.onrender.com/api
```

**Method B: Via API Config File**
```
In frontend/mobile_app/src/services/api.ts (or equivalent config file):
  
  // Change this line:
  // const BASE_URL = "http://localhost:3000/api";
  
  // To this:
  const BASE_URL = "https://vol-rewards-api.onrender.com/api";
```

**Method C: For Web Portals (Vite)**
```
In frontend/web_portals/:
  Create or edit .env file:
    VITE_API_URL=https://vol-rewards-api.onrender.com/api

  Or check vercel.json already sets this for production:
    {
      "build": {
        "env": {
          "VITE_API_URL": "https://vol-rewards-api.onrender.com/api"
        }
      }
    }
```

**Verify the connection:**
```
After changing the URL:
  1. Rebuild / restart the app
  2. Open the app and try to login
  3. If login works → API URL is correctly set
  4. If not → check the browser/console for network errors
     and verify the URL is reachable at:
     https://vol-rewards-api.onrender.com/api/health
```

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
