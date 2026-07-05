# APK Testing Guide

**Volunteer Rewards App — Native Android APK**

| | |
|---|---|
| **Version** | 5.0 |
| **Date** | 2 July 2026 |
| **CI Build** | ✅ Available |
| **GitHub Release** | ✅ APK uploaded to v1.0.0 |
| **PWA-APK Match** | ✅ PWA shows same GUI as APK (KAN-157) |
| **Non-Android Testers** | ✅ Alternative methods documented |

**Purpose:** Step-by-step instructions to install and test the native Android APK on a real device. After the PWA-APK Unification (KAN-157), the PWA and APK now share the same tab-based GUI — testing results apply to both platforms.

If you **do not own an Android phone**, see [Section 3.3 — Testing Without an Android Phone](#33-testing-without-an-android-phone) for alternatives.

---

## Table of Contents

- [1. Prerequisites](#1-prerequisites)
- [2. Obtain the APK](#2-obtain-the-apk)
- [3. Installation Methods](#3-installation-methods)
  - [3.1 Install via ADB (USB Cable) — Recommended](#31-install-via-adb-usb-cable--recommended)
  - [3.2 Copy to Phone Directly](#32-copy-to-phone-directly-if-adb-is-not-available)
  - [3.3 Testing Without an Android Phone](#33-testing-without-an-android-phone)
- [4. Testing Checklist](#4-testing-checklist)
- [5. Reporting Issues](#5-reporting-issues)
- [6. Uninstalling the App](#6-uninstalling-the-app)
- [7. Troubleshooting Common Issues](#7-troubleshooting-common-issues)
- [8. Known Issues (Build v1.1.0)](#8-known-issues)
- [9. Post-Testing: Medium Priority Fixes](#9-post-testing-medium-priority-fixes)
- [10. Summary Checklist](#10-summary-checklist)

---

## 1. Prerequisites

### 1.1 What You Need

- An Android phone (Android 8.0+ recommended)
- A USB cable to connect the phone to your PC
- ADB installed on your PC (see below)
- The APK file — downloaded from GitHub Releases or built locally

### 1.2 Install ADB (if not already installed)

ADB (Android Debug Bridge) is the tool that installs APKs from a computer to a phone.

**Option A: Via Android Studio (recommended)**

ADB is included with Android Studio at: `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`. Add it to your PATH so you can run `adb` from any terminal.

**Option B: Standalone install**

Download the Android SDK Platform Tools from [developer.android.com/studio/releases/platform-tools](https://developer.android.com/studio/releases/platform-tools). Extract to a folder (e.g. `C:\platform-tools`) and add that folder to your PATH environment variable.

Verify it works:
```bash
adb --version
```

You should see version info, not "command not found".

---

## 2. Obtain the APK

### 2.1 Download from GitHub Releases (Recommended for Testers)

The APK has been uploaded to GitHub Releases. Team members can download it directly:

1. Go to: **[https://github.com/XonLoke/volunteering-rewards-app/releases](https://github.com/XonLoke/volunteering-rewards-app/releases)**
2. Click on **v1.0.0** (latest release)
3. Download the attached **`app-release.apk`** file (86 MB)

### 2.2 Local Build Path (For Developers)

If you built the APK locally, it is at:

```
frontend/mobile_app/android/app/build/outputs/apk/release/app-release.apk
```

### 2.3 Download from CI Build Artifacts

CI build is also automated on GitHub Actions. After each successful run:

1. Go to **GitHub → Actions** tab → Select **"Build Android APK"** workflow → Click the latest green (successful) run
2. Scroll to **Artifacts** section → Download **`app-debug.apk`** (59 MB)
3. Rename to `app-release.apk` and install via ADB

---

## 3. Installation Methods

### 3.1 Install via ADB (USB Cable) — Recommended

**Step 1: Enable Developer Options on your phone**

Go to **Settings > About Phone > Tap 'Build number' 7 times**. Then go back to **Settings > System > Developer Options**.

**Step 2: Enable USB Debugging**

In Developer Options, toggle on **USB Debugging**.

**Step 3: Connect your phone via USB cable**

A prompt may appear on your phone asking to allow USB debugging. Check "Always allow from this computer" and tap OK.

**Step 4: Verify the connection**

```bash
adb devices
```

Your phone should appear in the list. If it says "unauthorized", check your phone screen and accept the RSA key prompt. If no device appears, try a different cable or USB port.

**Step 5: Install the APK**

```bash
adb install path\to\app-release.apk
```

You should see: "Performing Streamed Install" then "Success".

**Step 6: Launch the app**

```bash
adb shell am start -n com.yourcompany.volunteeringrewardsapp/.MainActivity
```

Or find "Volunteer Rewards" in your app drawer and tap it.

### 3.2 Copy to Phone Directly (If ADB is not available)

1. Copy the APK file to your phone via:
   - **Google Drive / cloud storage**: Upload on PC, download on phone
   - **USB file transfer**: Connect phone, enable File Transfer mode, drag and drop
   - **Email**: Email it to yourself
2. On your phone, open the APK file (tap it in the file manager or Downloads folder)
3. If prompted, allow installation from "Unknown sources" or "Install from file manager"
4. Follow the on-screen prompts to install

---

### 3.3 Testing Without an Android Phone

If you do not own an Android phone, you have several alternatives. The APK and PWA are built from the **same Expo/React Native codebase** — all features work identically across both.

#### Option 1: Use the PWA (Recommended — No Setup)

The **Progressive Web App** at `https://volunteering-rewards-app.vercel.app` shares the same source code as the APK. Every testing scenario can be verified via the PWA:

| Test Scenario | PWA | APK |
|--------------|:---:|:---:|
| Browse events | ✅ | ✅ |
| Register / join events | ✅ | ✅ |
| View points & rewards | ✅ | ✅ |
| Redeem coupons | ✅ | ✅ |
| QR code display | ✅ | ✅ |
| Profile & settings | ✅ | ✅ |
| Referral program | ✅ | ✅ |
| Leaderboard | ✅ | ✅ |
| AI Recommendations | ✅ | ✅ |
| Add to Home Screen | ✅ Browser prompt | ✅ Native |
| Offline support | Limited | ✅ Full |

**How to test:**
1. Open `https://volunteering-rewards-app.vercel.app` on any device (phone, tablet, desktop)
2. Tap "Add to Home Screen" for PWA install
3. Login with `alice@test.com` / `password123`
4. Run through the testing checklist in Section 4

> **Organiser scanner & merchant cashier features** can also be tested on desktop:
> - Scanner: `https://webportals-lovat.vercel.app/scan` (manual ID entry works without camera)
> - Merchant: `https://webportals-lovat.vercel.app/merchant`

---

#### Option 2: Android Emulator (Android Studio — Free, 15-min Setup)

Anyone can run the APK on their computer using Android Studio's built-in virtual device.

**Requirements:** Windows, macOS, or Linux with 8GB+ RAM

**Step 1 — Install Android Studio:**
```
Download from: https://developer.android.com/studio
Run the installer — ensure "Android Virtual Device" component is selected
```

**Step 2 — Create a Virtual Device:**
```
Open Android Studio → More Actions → Virtual Device Manager
Click "Create Device"
  → Category: Phone
  → Device: Pixel 6 or Pixel 7 (recommended)
  → Next
Download system image:
  → Choose "UpsideDownCake" (Android 14, API 34)
  → Click "Download" next to the latest stable image
  → Next
Verify configuration:
  → Name: Pixel 6 API 34
  → Orientation: Portrait
  → Graphics: Automatic
  → Finish
```

**Step 3 — Install the APK:**
```
In Virtual Device Manager, click the play icon (▶) on your device
Wait for boot (first boot: 2–5 minutes)
Once booted, drag the APK file onto the emulator screen

Or via command line:
  adb install D:\c3000c\volunteering-rewards-app\frontend\mobile_app\android\app\build\outputs\apk\release\app-release.apk
```

**Step 4 — Test:**
```
Login with alice@test.com / password123
Run through the testing checklist (Section 4)
```

> The emulator supports camera simulation for QR testing:
> Click the camera icon in the emulator toolbar → Upload a QR code image to simulate scanning

---

#### Option 3: Windows Subsystem for Android (Windows 11 Only)

```
1. Open Microsoft Store → Search "Windows Subsystem for Android" → Install
2. Open WSA Settings → Turn on "Developer Mode"
3. Open PowerShell / CMD and run:
   adb install D:\c3000c\volunteering-rewards-app\frontend\mobile_app\android\app\build\outputs\apk\release\app-release.apk
4. The app appears in your Windows Start Menu — launch and test
```

---

#### Option 4: Expo Go (iOS / Quick Feature Testing)

For testing specific features without installing the APK:

```
1. Install "Expo Go" from the App Store (iOS) or Google Play (Android)
2. The project coordinator starts the Expo dev server locally
3. Scan the QR code with Expo Go → app loads on your device
```

> **Note:** For standalone iOS testing, an Apple Developer account ($99/year) and EAS Build are required.

---

#### Configuring API URL for Testing

When testing on a virtual device or physical phone, ensure the app points to the **production backend** (not localhost):

**Via environment variable (recommended):**
```bash
EXPO_PUBLIC_API_URL=https://vol-rewards-api.onrender.com/api
```

**Via API config file:**
```javascript
// In frontend/mobile_app/src/services/api.ts
// Change this:
// const BASE_URL = "http://localhost:3000/api";
// To this:
const BASE_URL = "https://vol-rewards-api.onrender.com/api";
```

**Verify the connection:**
```bash
curl https://vol-rewards-api.onrender.com/api/health
# Should return: {"status":"ok","db_connected":true,...}
```

---

## 4. Testing Checklist

Go through each feature and mark pass or fail in the tables below.

### 4.1 App Launch

| Test | Pass/Fail | Notes |
|---|---|---|
| App icon appears in app drawer | ☐ | |
| Splash screen displays briefly | ☐ | |
| App loads to main screen without crash | ☐ | |
| No ANR (App Not Responding) on launch | ☐ | |

### 4.2 Authentication

| Test | Pass/Fail | Notes |
|---|---|---|
| Login screen displays correctly | ☐ | |
| Login with valid credentials succeeds | ☐ | Use alice@test.com / password123 |
| Login with invalid credentials shows error | ☐ | |
| Register new account flow works | ☐ | |
| Forgot password flow works | ☐ | |

### 4.3 Home Screen

| Test | Pass/Fail | Notes |
|---|---|---|
| Home screen loads with content | ☐ | |
| Upcoming events section visible | ☐ | |
| Points/rewards summary visible | ☐ | |
| Pull-to-refresh works | ☐ | |
| Bottom tab bar visible with 4 tabs | ☐ | Home, Events, Rewards, Profile |

### 4.4 Navigation

| Test | Pass/Fail | Notes |
|---|---|---|
| Bottom tab navigation works | ☐ | |
| Tapping Events tab shows event list | ☐ | |
| Tapping Rewards tab shows rewards | ☐ | |
| Tapping Profile tab shows profile | ☐ | |

### 4.5 Events

| Test | Pass/Fail | Notes |
|---|---|---|
| Event list loads | ☐ | |
| Tapping event shows detail | ☐ | |
| Register for event works | ☐ | |
| View registered events | ☐ | |

### 4.6 Profile / Settings

| Test | Pass/Fail | Notes |
|---|---|---|
| Profile screen loads | ☐ | |
| Edit profile works | ☐ | |
| Settings accessible | ☐ | |

### 4.7 Performance & Stability

| Test | Pass/Fail | Notes |
|---|---|---|
| No crashes during normal use | ☐ | |
| Scrolling is smooth | ☐ | |
| App handles orientation changes | ☐ | |
| App recovers from background | ☐ | |
| Battery drain is reasonable | ☐ | |

---

## 5. Reporting Issues

For each issue found, record the following information:

### Bug Report Template

- **Screen/Feature:** [e.g. Login screen]
- **Steps to reproduce:**
  1. Open app
  2. Tap 'Login'
  3. Enter valid email and password
  4. Tap 'Submit'
- **Expected:** Dashboard loads
- **Actual:** App crashes with white screen
- **Device:** [e.g. Samsung Galaxy S23, Android 14]
- **Screen recording/photo:** [attach if possible]
- **Logcat output:** [capture as per below]

### 5.1 Capturing Logcat Output

If you encounter a crash, capture the device logs:

**Step 1:** Clear old logs first
```bash
adb logcat -c
```

**Step 2:** Reproduce the crash on your phone

**Step 3:** Capture logs
```bash
adb logcat -d > crash-log.txt
```

Send the `crash-log.txt` file along with the bug report to Xon.

---

## 6. Uninstalling the App

**Via ADB:**
```bash
adb uninstall com.yourcompany.volunteeringrewardsapp
```

**Via phone:**
Long-press app icon > Uninstall, or **Settings > Apps > Volunteer Rewards > Uninstall**.

---

## 7. Troubleshooting Common Issues

| Problem | Likely Cause | Fix |
|---|---|---|
| `adb: command not found` | ADB not installed or not in PATH | Install Platform Tools and add to PATH |
| `error: no devices/emulators found` | Phone not connected or USB debugging off | Check cable, enable USB debugging, try `adb kill-server && adb start-server` |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Older version already installed | Uninstall existing version first: `adb uninstall com.yourcompany.volunteeringrewardsapp` |
| `INSTALL_FAILED_INSUFFICIENT_STORAGE` | Not enough free space | Free up space on your phone |
| App crashes on launch | Missing dependency or config | Capture logcat and report to Xon |
| "App not installed" error | APK corrupted or incompatible | Re-download APK or try CI-built version |
| White screen on navigation | API error or network issue | Check internet connection, verify API is live |
| Login fails | API URL mismatch | PWA should use production API; if testing APK, ensure EXPO_PUBLIC_API_URL is set |

---

## 8. Known Issues (Build v1.1.0)

The CI build is now passing on GitHub Actions. These known issues apply to both the local and CI-built APK:

- **Missing image assets** — 9 images referenced in `app/home.tsx` do not exist. `getEventImage()` returns a fallback icon.
- **newArchEnabled=false** — React Native new architecture is disabled to work around Windows MAX_PATH limitation.
- **Signed with debug keystore** — not a release-signed APK (fine for testing, won't install on Play Store).
- **PWA-APK now unified** — As of Sprint 5 v4, the PWA and APK display the same tab-based GUI. Any UI issues found in APK testing should also be checked on the PWA.

---

## 9. Post-Testing: Medium Priority Fixes

After testing is complete, consider addressing these known issues to improve the app.

### 9.1 Create Real Image Assets

9 images referenced in `app/home.tsx` via `@/assets/images/*` don't exist. Currently `getEventImage()` returns a fallback icon (`assets/icon.png`), so event images won't display.

Files to create in `frontend/mobile_app/assets/images/`:

| Filename | Suggested Content |
|---|---|
| `event-default.png` | Generic event placeholder (calendar icon on gradient) |
| `beach-cleanup.png` | Beach/environment cleanup photo |
| `food-drive.png` | Food donation / pantry image |
| `tutoring.png` | Classroom / tutoring image |
| `elderly-care.png` | Senior care / community image |
| (4 more) | Match the event categories used in the app |

Implementation: Create actual PNG images in the assets folder, run `npx expo prebuild` to register them, then rebuild the APK.

### 9.2 Restore newArchEnabled=true

`newArchEnabled=false` was set in `android/gradle.properties` to work around Windows MAX_PATH (260-char limit). C++ autolinked codegen in `safeareacontext` generates file paths ~380 characters long, which breaks Ninja on Windows.

| Approach | Description | Feasibility |
|---|---|---|
| A) Enable extended paths | Set `extendedLongPaths=true` in `gradle.properties` | Try first |
| B) Symlink shorter paths | Move project closer to drive root (e.g. `C:\vra\`) | Alternative |
| C) Build on Linux/macOS | No MAX_PATH limit on Unix systems | Best for CI |
| D) Keep disabled | Accept New Architecture is off | Fallback |

Impact of keeping it disabled: React Native New Architecture (Fabric / TurboModules) is turned off. Minor performance improvements unavailable. App works fine otherwise.

---

## 10. Summary Checklist

### For Android Phone Testers

| Step | Done? |
|---|---|
| APK downloaded from GitHub Releases | ☐ |
| USB Debugging enabled on phone | ☐ |
| ADB connection verified (`adb devices`) | ☐ |
| APK installed (`adb install app-release.apk`) | ☐ |
| App Launch tests passed (Section 4.1) | ☐ |
| Authentication tests passed (Section 4.2) | ☐ |
| Home Screen tests passed (Section 4.3) | ☐ |
| Navigation tests passed (Section 4.4) | ☐ |
| Events tests passed (Section 4.5) | ☐ |
| Profile/Settings tests passed (Section 4.6) | ☐ |
| Performance/Stability tests passed (Section 4.7) | ☐ |

### For Non-Android Testers

| Step | Done? |
|---|---|
| Chosen alternative method: PWA / Emulator / WSA / Expo Go | ☐ |
| API URL configured to production backend (if needed) | ☐ |
| PWA: Opened `https://volunteering-rewards-app.vercel.app` | ☐ |
| PWA: Added to Home Screen (optional) | ☐ |
| Emulator: Android Studio installed & virtual device created | ☐ |
| Emulator: APK installed via drag-and-drop | ☐ |
| App Launch tests passed (Section 4.1) | ☐ |
| Authentication tests passed (Section 4.2) | ☐ |
| Home Screen tests passed (Section 4.3) | ☐ |
| Navigation tests passed (Section 4.4) | ☐ |
| Events tests passed (Section 4.5) | ☐ |
| Profile/Settings tests passed (Section 4.6) | ☐ |
| Performance/Stability tests passed (Section 4.7) | ☐ |

---

*— End of APK Testing Guide v5.0 —*
