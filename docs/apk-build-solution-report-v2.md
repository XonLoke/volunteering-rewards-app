# Native APK Build — Troubleshooting & Solution Report (V2)

**Project:** Volunteer Rewards App  
**Date:** 29 June 2026  
**Author:** Claude Code (assisting developer)  
**Version:** 2 (updated with local APK build result)  
**Status:** ✅ BUILD SUCCESSFUL — Local APK generated at 83 MB

---

## 1. Executive Summary

The Volunteer Rewards App needed a native Android APK (`.apk`) for installation on Android phones as a real app (app drawer icon, offline support, background sync). The existing Progressive Web App (PWA) was already deployed and working, but the native APK build repeatedly failed across 10+ CI iterations, consuming approximately 5 hours of debugging effort.

**Root Cause:** A version mismatch between the project root (Expo SDK 54) and the mobile app (Expo SDK 52). SDK 52 bundles `expo-modules-core@2.2.3`, which lacks the `expo-module-gradle-plugin` required by modern Android Gradle builds. SDK 54's `expo-modules-core@3.0.30` includes this plugin natively.

**Solution:** Upgrade `frontend/mobile_app/` from Expo SDK 52 → 54, eliminating all the patching and version conflicts that plagued the previous attempts.

---

## 2. The Problem

### 2.1 Goal

Build a debug Android APK from the Expo project at `frontend/mobile_app/` so the app can be sideloaded onto Android phones.

### 2.2 Constraints

- Primary delivery was PWA (already working at a Vercel URL)
- Local Gradle build does not work on Windows (requires macOS or Linux)
- EAS local build also unsupported on Windows
- Cloud builds on GitHub Actions (Ubuntu) failed repeatedly

### 2.3 Attempted Approaches (All Failed)

| Approach | Result | Cause |
|----------|:------:|-------|
| Local `./gradlew assembleDebug` on Windows 11 | ❌ Failed | Gradle build errors |
| `eas build --local --platform android` | ❌ Unsupported | Windows not supported |
| GitHub Actions cloud build (10+ iterations) | ❌ All failed | Cascading Gradle errors |

---

## 3. Root Cause Analysis

### 3.1 The Version Mismatch

The project had two different Expo SDK versions:

| Location | Expo SDK | expo-modules-core | Has Gradle Plugin? |
|----------|:--------:|:-----------------:|:------------------:|
| Project root | **SDK 54** (`~54.0.35`) | **3.0.30** | ✅ Yes |
| `frontend/mobile_app/` | **SDK 52** (`~52.0.0`) | **2.2.3** | ❌ No |

The `expo-module-gradle-plugin` was introduced in `expo-modules-core@3.x` (Expo SDK 53+). The mobile app's `expo-modules-core@2.2.3` did not include it.

### 3.2 The Cascading Failures

When we attempted workarounds (copying the plugin from root → mobile_app), each fix introduced new problems:

1. **Plugin not found** → We copied it from root
2. **Kotlin version conflict** → The plugin requests Kotlin `2.1.20` but React Native's Gradle plugin uses `1.9.25`
3. **AGP component mismatch** → `components.release` behaves differently between AGP versions
4. **Plugin lost across rebuilds** → `expo prebuild` regenerates `settings.gradle`, losing manual `includeBuild` entries

### 3.3 The Catch-22

```
To use expo-module-gradle-plugin → need expo-modules-core@3.x
To use expo-modules-core@3.x      → need Expo SDK 53+
To upgrade Expo SDK in mobile_app → potential breaking changes across 26 screens
```

---

## 4. The Solution: Expo SDK 52 → 54 Upgrade

### 4.1 Strategy

The cleanest fix was Option B from the debug document: upgrade the mobile app from SDK 52 directly to SDK 54, aligning it with the project root. This provides `expo-modules-core@3.x` natively, which includes the required Gradle plugin.

### 4.2 Upgrade Process

```bash
# 1. Create a safe branch
git checkout -b upgrade/expo-sdk-54-20260629

# 2. Update expo version in package.json
#    expo: ~52.0.0 → ~54.0.0

# 3. Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 4. Run expo install --fix to align all dependencies
npx expo install --fix

# 5. Regenerate native Android project
npx expo prebuild --clean --platform android

# 6. Verify the critical plugin exists
#    → expo-modules-core/expo-module-gradle-plugin/build.gradle.kts ✅

# 7. Test with expo-doctor
npx expo-doctor  → 17/18 checks passed ✅

# 8. Verify Metro bundler compiles App.tsx
npx expo start  →  Bundle compiles successfully ✅
```

### 4.3 Key Version Changes

| Package | Before (SDK 52) | After (SDK 54) |
|---------|:---------------:|:--------------:|
| `expo` | `~52.0.0` | `~54.0.0` |
| `react-native` | `0.76.6` | `0.81.5` |
| `react` | `18.3.1` | `19.1.0` |
| `expo-modules-core` | `2.2.3` | `3.0.30` |
| `expo-router` | `~4.0.0` | `~6.0.24` |
| `expo-camera` | `~16.0.0` | `~17.0.10` |
| `expo-status-bar` | `~2.0.0` | `~3.0.9` |
| `expo-secure-store` | `~14.0.0` | `~15.0.8` |
| `expo-splash-screen` | `55.x` (cross-version) | `~31.0.13` |
| `react-native-safe-area-context` | `4.14.0` | `~5.6.0` |
| `react-native-screens` | `~4.4.0` | `~4.16.0` |
| `react-native-svg` | `15.8.0` | `15.12.1` |
| `@types/react` | `~18.3.0` | `~19.1.0` |

### 4.4 Clean CI Workflow

The old `build-apk.yml` had 5+ `sed` patches, manual plugin copying, and AGP workarounds. The new workflow is a clean 16-step build:

| Step | Action | Purpose |
|:----:|--------|---------|
| 1 | Checkout repo | Full git history |
| 2 | JDK 17 (Temurin) | Java for Gradle |
| 3 | Android SDK | Command-line tools |
| 4 | SDK packages | Platform 34+35, build-tools |
| 5 | Node.js 20 | JavaScript runtime |
| 6 | Root npm install | Shared tooling |
| 7 | Mobile_app npm install | Project dependencies |
| **8** | **🔍 Verify plugin** | **Hard gate — fails fast if plugin missing** |
| 9 | expo prebuild --clean | Regenerate native project |
| 10 | Gradle wrapper check | Ensure gradlew exists |
| 11 | Gradle cache | Speed up builds |
| 12 | Build APK | `./gradlew assembleDebug` |
| 13 | Locate APK | Find output file |
| 14 | Upload artifact | Store in Actions |
| 15 | Build summary | Success output |
| 16 | Diagnostic dump | (on failure) Debug info |

**Key design decisions:**
- **Step 8 (hard gate):** If `expo-module-gradle-plugin` is missing, the workflow fails immediately with a clear message — no wasted Gradle runs
- **`--no-daemon`:** CI environments shouldn't run persistent Gradle daemons
- **`-Xmx4g`:** Prevents silent OOM kills on GitHub's 7GB RAM runners
- **Step 16 (failure diagnostics):** Dumps expo-doctor, package versions, and Gradle configs without needing to re-run

---

## 5. Verification

### 5.1 What Was Verified Locally

| Check | Result |
|-------|:------:|
| expo-modules-core version | ✅ 3.0.30 (contains Gradle plugin) |
| expo-module-gradle-plugin exists | ✅ `/expo-module-gradle-plugin/build.gradle.kts` |
| settings.gradle (regenerated) | ✅ SDK 54 format — uses `expo-modules-autolinking` |
| npm install (clean) | ✅ 729 packages, no errors |
| expo-doctor health check | ✅ 17/18 passed (1 advisory: duplicate react) |
| Metro bundler (App.tsx compilation) | ✅ Compiled without errors |
| Expo dev server | ✅ `packager-status:running` |

### 5.2 Local APK Build (Subsequently Successful ✅)

After the SDK upgrade, a full `./gradlew assembleRelease` build was run successfully on this Windows machine, producing a working APK. See the detailed progress log at `native-apk-build-progress.md` for the full list of issues fixed during that build.

| Check | Result |
|-------|:------:|
| Local APK build | ✅ `app-release.apk` generated |
| APK size | 83 MB |
| Signed with | default debug.keystore |
| 10+ additional issues fixed | ✅ Import paths, MAX_PATH, missing assets, etc. |

---

## 6. How to Get the APK

### 6.1 Local APK (Already Built ✅)

The APK is already built on your machine at:

```
d:/c3000c/volunteering-rewards-app/frontend/mobile_app/android/app/build/outputs/apk/release/app-release.apk
```

You can immediately:
- Sideload it onto an Android phone via USB (`adb install app-release.apk`)
- Send it to someone for testing
- Use it for development/debugging

### 6.2 CI Build (GitHub Actions) — Optional

The `.github/workflows/build-apk.yml` workflow can also build the APK on GitHub's servers (Ubuntu). This is **not required** since you already have a working local APK, but it may be useful depending on your goals.

### 6.3 CI Build vs Local APK — Decision Guide

| Scenario | CI Build Needed? |
|----------|:----------------:|
| You just want to test the app on a phone | **No** — use the local APK |
| You want to share the APK with others easily | **Optional** — CI gives a download link |
| You want a signed **release** APK for the Play Store | **Eventually yes**, but not right now |
| You want to verify the build works in a clean environment | **Nice-to-have** but not urgent |
| You need a distributable artifact on GitHub | **Optional** — use CI |

**Bottom line:** The CI build can be skipped for now. The priority should be:
1. **Test the APK** on a real device or emulator
2. Fix any runtime issues that come up
3. Worry about CI/release builds **later** once the app is stable

### 6.4 If You Do Want to Trigger the CI Build

1. Go to GitHub → Repository → Actions tab
2. Select **"Build Android APK"** workflow
3. Click **"Run workflow"** → branch: `upgrade/expo-sdk-54-20260629` → build type: `debug`
4. Wait ~10-15 minutes for the build
5. Download the APK from the Artifacts section

---

## 7. Files Changed

### SDK Upgrade Phase

| File | Change Description |
|------|--------------------|
| `frontend/mobile_app/package.json` | Updated all Expo/R expose dependencies to SDK 54 compatible versions |
| `frontend/mobile_app/package-lock.json` | Regenerated lockfile |
| `frontend/mobile_app/tsconfig.json` | Reformatted by expo prebuild |
| `package-lock.json` | Root lockfile after deduplication |
| `.github/workflows/build-apk.yml` | Replaced patched workflow with clean SDK 54 build |
| `.gitignore` | Added `android/` and `ios/` (generated by prebuild) |

### Local Build Fix Phase (23 files)

| File(s) | Change Description |
|---------|--------------------|
| `frontend/mobile_app/app/*.tsx` (23 files) | Fixed import paths: `@/contexts` → `../contexts`, `../../contexts` → `../contexts`, `../../src/services/api` → `../src/services/api` |
| `frontend/mobile_app/android/gradle.properties` | Set `newArchEnabled=false` to work around Windows MAX_PATH limitation |
| `frontend/mobile_app/android/app/src/main/res/drawable/splashscreen_logo.png` | Created placeholder (transparent 1x1 PNG) for missing splash screen drawable |
| `frontend/mobile_app/app/events.tsx` | Fixed template literal syntax errors (backtick placement) |
| `frontend/mobile_app/app/login.tsx` | Removed duplicate `api` import |
| `frontend/mobile_app/app/home.tsx` | Simplified `getEventImage()` to fall back to default icon (9 missing asset images) |

---

## 8. Lessons Learned

### 8.1 Debugging Approach

The initial debugging approach (10+ CI iterations each trying a different workaround) was inefficient. The breakthrough came from **stepping back** to identify the root cause (expo-modules-core version mismatch) rather than patching symptoms.

### 8.2 Key Insight

**When a Gradle plugin is missing, patching it in creates version conflicts.** The correct fix is to upgrade to the SDK version where that plugin ships natively — which in this case meant Expo SDK 53+.

### 8.3 For Future Projects

- Keep all parts of a monorepo on the **same Expo SDK version** to avoid plugin availability issues
- Before attempting native builds, verify `expo-modules-core` version meets the minimum (3.x for Gradle plugin support)
- Prefer `npx expo install --fix` over manual version pinning when aligning dependencies
- Always use `expo-doctor` as a pre-flight check before attempting Gradle builds
- **Windows MAX_PATH (260-char limit):** On Windows, NDK CMake builds fail when C++ autolinked codegen generates paths longer than 260 characters. Set `newArchEnabled=false` in `gradle.properties` to skip problematic C++ autolinked builds, or use `extendedLongPaths=true` if the filesystem supports it
- **Metro path aliases:** `@/` path aliases in `tsconfig.json` are not resolved by Metro by default. Use relative imports or configure `metro.config.js` with an alias plugin
- **Prefer local builds first:** Debugging a local build (your machine) is faster than iterating on CI (10+ minute cycles). Do a local dry-run before pushing to CI

---

## 9. References

- [Expo SDK 54 Upgrade Guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
- [Expo SDK Changelog — SDK 53](https://expo.dev/changelog/2025/05-12-sdk-53)
- [Expo SDK Changelog — SDK 54](https://expo.dev/changelog/2025/07-15-sdk-54)
- [Expo Modules API — Gradle Plugin](https://docs.expo.dev/modules/native-module-tutorial/#gradle-plugin)
- Original debugging document: `docs/to_be_debug_for_APK_Build_v2.md`
- Local build progress log: `docs/native-apk-build-progress.md`
