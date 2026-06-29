# To Be Debug: Native APK Build

**Date:** 29 June 2026  
**Author:** Claude Code (assisting Xon)  
**Status:** ❌ Blocked — needs deeper investigation  
**Priority:** Medium (PWA is the primary delivery)

---

## 1. Goal

Build a native Android APK (`.apk`) from the Expo SDK 52 project at `frontend/mobile_app/` so the Volunteer Rewards app can be installed as a real app on Android phones (app drawer icon, offline support, background sync).

## 2. Current Delivery

The **Progressive Web App (PWA)** is already deployed and working:
- URL: `https://dist-orpin-nine-46.vercel.app`
- All 26 Expo screens render correctly
- Supports "Add to Home Screen" on mobile browsers
- **This is the primary delivery** — the APK is a nice-to-have enhancement.

## 3. What Was Attempted

### 3.1 Local Build (Windows 11)
| Step | Result |
|------|:------:|
| JDK 17+ installed via winget | ✅ |
| Android SDK command-line tools installed | ✅ |
| Android SDK Platform 34 + 35 installed | ✅ |
| Build-tools 34 installed | ✅ |
| Android licenses accepted | ✅ |
| `expo prebuild` — generated `android/` project | ✅ |
| `./gradlew assembleDebug` — Gradle build | ❌ Failed |

### 3.2 EAS Local Build (Windows)
`eas build --platform android --local` — **not supported on Windows** (requires macOS or Linux).

### 3.3 GitHub Actions Cloud Build (Ubuntu)
The workflow at `.github/workflows/build-apk.yml` was iterated 10+ times:

| Attempt | Error | Fix Applied |
|:-------:|-------|-------------|
| 1 | Plugin `expo-module-gradle-plugin` not found | Added `includeBuild` for `expo-modules-core/expo-module-gradle-plugin` |
| 2 | Same — plugin path didn't exist in mobile_app node_modules | Added step to copy plugin from root node_modules |
| 3 | Kotlin JVM plugin version conflict (`2.1.20` vs `1.9.25`) | Added resolution strategy (failed), then removed version from plugin |
| 4 | `SoftwareComponent with name 'release' not found` | Added `disableAutomaticComponentCreation=true` (not in AGP 8.6), then `findByName` guard |
| 5 | `expo-module-gradle-plugin` not found again | Realized we lost the includeBuild when switching to autolinking |
| 6 | Kotlin JVM plugin not found (no version specified) | Current error |

## 4. Root Cause Analysis

### 4.1 Version Mismatch (Primary Cause)

The project has **two different Expo SDK versions**:

| Location | Expo SDK | expo-modules-core | Has `expo-module-gradle-plugin`? |
|----------|:--------:|:-----------------:|:-------------------------------:|
| Project root (`d:/c3000c/.../`) | **SDK 54** (`~54.0.35`) | **3.0.30** | ✅ Yes |
| `frontend/mobile_app/` | **SDK 52** (`~52.0.0`) | **2.2.3** | ❌ No |

The `expo-module-gradle-plugin` is only included in `expo-modules-core@3.x` (SDK 53+). The mobile_app's `expo-modules-core@2.2.3` (SDK 52) doesn't include it.

### 4.2 Cascading Failures

When we copy the plugin from root → mobile_app, we introduce version conflicts:
- The plugin requests `kotlin("jvm") version "2.1.20"` but the RN gradle plugin uses Kotlin `1.9.25`
- The `ExpoModulesCorePlugin.gradle` uses `components.release` which has different behavior between AGP versions
- AGP 8.6 removed `disableAutomaticComponentCreation` (was deprecated in 8.0)

### 4.3 The Catch-22

```
To use expo-module-gradle-plugin → need expo-modules-core@3.x
To use expo-modules-core@3.x      → need Expo SDK 53+ (or handle breaking changes)
To upgrade Expo SDK in mobile_app  → may break 26 existing screens
```

## 5. Recommended Solutions (in priority order)

### Option A: Accept PWA as Final Delivery ✅ (Already Working)
- **Effort:** None
- **Risk:** None  
- **Result:** Users access via browser URL, can "Add to Home Screen"

### Option B: Upgrade mobile_app to Expo SDK 54
- **Effort:** 1–2 hours
- **Risk:** Low-medium (Expo upgrades are usually smooth for managed workflow)
- **Steps:**
  ```bash
  npx expo upgrade 54
  npx expo install --fix
  npx expo prebuild --clean
  cd android && ./gradlew assembleDebug
  ```
- **Why this fixes it:** Expo SDK 54 bundles `expo-modules-core@3.x` which natively includes `expo-module-gradle-plugin`. No need to copy plugins or patch Gradle files.

### Option C: Use GitHub Actions with EAS Cloud Build (Requires Expo Account)
- **Effort:** 30 min setup
- **Risk:** Low
- **Steps:**
  1. Create an Expo account if not exists
  2. Run `eas login` locally
  3. Add `EXPO_TOKEN` to GitHub secrets
  4. Use the original `build-apk.yml` (EAS cloud build)
- **Note:** Previous EAS attempts failed with AGP 8.11. Expo may have fixed this by now.

### Option D: Manual Android Studio Build
- **Effort:** 2–4 hours
- **Risk:** Medium (requires installing Android Studio + SDK on dev machine)
- **Steps:** Install Android Studio → Open `frontend/mobile_app/android/` → Build → Generate APK

## 6. Time Spent

| Session | Duration | Tasks |
|---------|:--------:|-------|
| Local SDK setup + first Gradle attempts | ~2 hrs | JDK install, Android SDK install, expo prebuild |
| GitHub Actions iterations (10+ runs) | ~3 hrs | Identifying errors, researching fixes, patching workflow |

## 7. Recommendation

**Option A (PWA)** is the current delivery — it works and covers all features.

**Option B (SDK upgrade)** is the most likely path to a successful APK build. The upgrade from SDK 52 to 54 in the mobile_app would align it with the root project, natively providing `expo-module-gradle-plugin` and compatible AGP 8.6 support. This would eliminate ALL the patching and version conflicts we encountered.

**Estimated cost:** ~1 hour of development time + ~30 min CI build time = ~1.5 hours total.
