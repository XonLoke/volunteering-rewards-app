# APK Testing Guide — Volunteer Rewards App

**Version:** 1.0  
**Date:** 29 June 2026  
**Purpose:** Step-by-step instructions to install and test the native Android APK

---

## 1. Prerequisites

### 1.1 What You Need
- An **Android phone** (Android 8.0+ recommended)
- A **USB cable** to connect the phone to your PC
- (Optional) **ADB** installed on your PC — see §1.2
- The **APK file** from the local build — see §2

### 1.2 Install ADB (if not already installed)

ADB (Android Debug Bridge) is the tool that installs APKs from a computer to a phone.

**Option A: Via Android Studio** (recommended if you have Android Studio)
- ADB is included with Android Studio at:
  `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`
- Add it to your PATH so you can run `adb` from any terminal

**Option B: Standalone install**
- Download the [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools)
- Extract to a folder, e.g. `C:\platform-tools`
- Add that folder to your PATH environment variable

**Verify it works:**
```bash
adb --version
# Should print version info, not "command not found"
```

---

## 2. Locate the APK

The APK is on your local machine at:

```
d:\c3000c\volunteering-rewards-app\frontend\mobile_app\android\app\build\outputs\apk\release\app-release.apk
```

**Alternative (if you rebuild it):** After running `./gradlew assembleRelease`, the output is always at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 3. Installation Methods

Choose **one** of the following methods.

### Method A: Install via ADB (USB cable) — Recommended

1. **Enable Developer Options on your phone:**
   - Go to Settings → About Phone → Tap "Build number" 7 times
   - Go back to Settings → System → Developer Options

2. **Enable USB Debugging:**
   - In Developer Options, toggle on **USB Debugging**

3. **Connect your phone via USB cable**

4. **Verify the connection:**
   ```bash
   adb devices
   ```
   - Your phone should appear in the list
   - If it says "unauthorized", check your phone screen and accept the RSA key prompt
   - If no device appears, try a different cable or USB port

5. **Install the APK:**
   ```bash
   adb install "d:\c3000c\volunteering-rewards-app\frontend\mobile_app\android\app\build\outputs\apk\release\app-release.apk"
   ```
   - You should see: `Performing Streamed Install` → `Success`

6. **Launch the app:**
   ```bash
   adb shell am start -n com.yourcompany.volunteeringrewardsapp/.MainActivity
   ```
   Or find "Volunteer Rewards" in your app drawer and tap it.

### Method B: Copy to Phone Directly

If ADB is not available:

1. Copy the APK file to your phone via:
   - **Google Drive / cloud storage** — upload then download on phone
   - **USB file transfer** — connect phone, enable File Transfer mode, drag & drop
   - **Email it to yourself** — download attachment on phone

2. On your phone, open the APK file (tap it in the file manager or Downloads folder)

3. If prompted, allow installation from "Unknown sources" or "Install from file manager"

4. Follow the on-screen prompts to install

---

## 4. Testing Checklist

Go through each feature and mark ✅ or ❌.

### 4.1 App Launch
| Test | Pass/Fail | Notes |
|------|:---------:|-------|
| App icon appears in app drawer | | |
| App launches without crash | | |
| Splash screen shows correctly | | |
| App loads within 10 seconds | | |

### 4.2 Authentication
| Test | Pass/Fail | Notes |
|------|:---------:|-------|
| Login screen displays correctly | | |
| Login with valid credentials works | | |
| Login with invalid credentials shows error | | |
| Registration flow works (if applicable) | | |
| Logout works | | |

### 4.3 Home Screen
| Test | Pass/Fail | Notes |
|------|:---------:|-------|
| Home screen loads with content | | |
| Events list displays correctly | | |
| Images load (or show fallback) | | |
| Pull-to-refresh works | | |
| Scroll is smooth | | |

### 4.4 Navigation
| Test | Pass/Fail | Notes |
|------|:---------:|-------|
| Bottom tab navigation works | | |
| All screens accessible via tabs | | |
| Back button works correctly | | |
| No blank screens | | |

### 4.5 Events
| Test | Pass/Fail | Notes |
|------|:---------:|-------|
| Event list loads | | |
| Event detail screen opens | | |
| Event registration works | | |
| Event search/filter works (if available) | | |

### 4.6 Profile / Settings
| Test | Pass/Fail | Notes |
|------|:---------:|-------|
| Profile screen loads | | |
| User info displays correctly | | |
| Settings changes persist | | |

### 4.7 Performance & Stability
| Test | Pass/Fail | Notes |
|------|:---------:|-------|
| No crashes during normal use | | |
| No ANR (App Not Responding) dialogs | | |
| Switching between apps and back works | | |
| Orientation change (rotate) works | | |
| App handles low battery gracefully | | |

---

## 5. Reporting Issues

For each issue found, record:

```
## Bug Report

**Screen/Feature:** [e.g. Login screen]
**Steps to reproduce:**
1. Open app
2. Tap "Login"
3. Enter valid email and password
4. Tap "Submit"

**Expected:** Dashboard loads
**Actual:** App crashes with white screen

**Device:** [e.g. Samsung Galaxy S23, Android 14]
**Screen recording/photo:** [attach if possible]
**Logcat output (if available):** [see §5.1]
```

### 5.1 Capturing Logcat Output

If you encounter a crash, capture the device logs:

```bash
# Clear old logs first
adb logcat -c

# Reproduce the crash, then:
adb logcat -d > crash-log.txt
```

Send the `crash-log.txt` file along with the bug report.

---

## 6. Uninstalling the App

To remove the app after testing:

**Via ADB:**
```bash
adb uninstall com.yourcompany.volunteeringrewardsapp
```

**Via phone:**
- Long-press app icon → Uninstall
- Or Settings → Apps → Volunteer Rewards → Uninstall

---

## 7. Troubleshooting Common Issues

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `adb: command not found` | ADB not installed or not in PATH | Install Platform Tools and add to PATH |
| `error: device unauthorized` | USB Debugging not accepted on phone | Check phone screen and accept RSA key |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Older version already installed | Run `adb uninstall com.yourcompany...` first |
| `Failure [INSTALL_FAILED_NO_MATCHING_ABIS]` | APK built for wrong architecture | Ensure APK targets armeabi-v7a or arm64-v8a |
| App crashes on launch | Missing dependency or runtime error | Capture logcat output (see §5.1) |
| Blank white screen | JavaScript bundle failed to load | Check Metro bundler or try clearing app data |
| Images not showing | Missing image assets (known issue) | See known issues below |

---

## 8. Known Issues (This Build)

These are **already documented** in the build progress log:
1. **Missing image assets** — 9 images referenced in `app/home.tsx` do not exist; `getEventImage()` returns a fallback icon
2. **`newArchEnabled=false`** — React Native new architecture is disabled to work around Windows MAX_PATH limitation
3. **Signed with debug keystore** — not a release-signed APK (fine for testing, won't install on Play Store)

---

## 9. Post-Testing: Medium Priority Fixes

After testing is complete, consider addressing these known issues to improve the app.

### 9.1 Create Real Image Assets

**What's wrong:** 9 images referenced in `app/home.tsx` via `@/assets/images/*` don't exist. Currently `getEventImage()` returns a fallback icon (`assets/icon.png`), so event images won't display.

**Files to create** in `frontend/mobile_app/assets/images/`:

| Filename | Suggested Content |
|----------|-----------------|
| `event-default.png` | Generic event placeholder (e.g. calendar icon on gradient background) |
| `volunteer-badge.png` | Badge/medal icon for volunteer achievements |
| `welcome-banner.png` | Welcome screen hero image |
| `logo.png` | App logo (if different from `icon.png`) |

**Implementation steps:**
1. Create actual PNG images (or SVG → convert to PNG) in `frontend/mobile_app/assets/images/`
2. Run `npx expo prebuild` to register them in the native asset bundle
3. Rebuild the APK to verify images appear

**Alternatively:** If placeholder images are acceptable, use a tool like [placeholder.com](https://placeholder.com) or generate simple colored rectangles.

### 9.2 Restore `newArchEnabled=true`

**What's wrong:** `newArchEnabled=false` was set in `android/gradle.properties` to work around Windows MAX_PATH (260-char limit). C++ autolinked codegen in `safeareacontext` generates file paths ~380 characters long, which breaks Ninja on Windows.

**Impact of keeping it disabled:**
- React Native New Architecture (Fabric / TurboModules) is turned off
- Minor performance improvements from New Arch are unavailable
- App works fine otherwise — this is not a functional regression

**Steps to fix (requires further investigation):**

| Approach | Description | Feasibility |
|----------|-------------|:-----------:|
| **A) Enable extended paths on Windows** | Set `extendedLongPaths=true` in `gradle.properties` and ensure the drive supports long paths (NTFS does) | ✅ Try first |
| **B) Build on macOS/Linux** | MAX_PATH is not an issue on Unix systems. Cross-compile from WSL or a Mac | ✅ Reliable |
| **C) Update NDK/CMake** | Newer NDK versions may handle long paths better | ⚠️ Experimental |
| **D) Leave as-is** | Accept `newArchEnabled=false` — app works fine without New Architecture | ✅ Safe default |

**Recommended approach:** Try **Approach A** first (`extendedLongPaths=true`), then rebuild locally. If it fails, use **Approach B** (build via WSL). If neither works, leave as `newArchEnabled=false` — it's safe and the app will function correctly.

---

## 10. Summary Checklist

- [ ] APK located at the specified path
- [ ] USB Debugging enabled on phone
- [ ] ADB connection verified (`adb devices`)
- [ ] APK installed successfully
- [ ] App launches without crash
- [ ] Core features tested (auth, home, navigation, events)
- [ ] Issues documented with reproduction steps
- [ ] Logcat captured for any crashes
- [ ] (Optional) Image assets created and verified
- [ ] (Optional) `newArchEnabled=true` restored and verified
