# To Be Debug: Native APK Build — v2

**Date:** 29 June 2026  
**Author:** Claude Code (assisting Xon)  
**Status:** 🔧 In Progress — one remaining patch needed  
**Priority:** Medium (PWA is the primary delivery)

---

## 1. Goal

Build a native Android APK (`.apk`) from the Expo SDK 54 project at `frontend/mobile_app/` so the Volunteer Rewards app can be installed as a real app on Android phones (app drawer icon, offline support, background sync).

## 2. Current Delivery

The **Progressive Web App (PWA)** is already deployed and working:
- URL: `https://dist-orpin-nine-46.vercel.app`
- All 26 Expo screens render correctly
- Supports "Add to Home Screen" on mobile browsers
- **This is the primary delivery** — the APK is a nice-to-have enhancement.

---

## 3. SDK Upgrade Completed ✅

The root cause has been resolved by upgrading `frontend/mobile_app/` from **Expo SDK 52 → 54**.

| Package | Before | After |
|---------|:------:|:-----:|
| expo | `~52.0.0` | `~54.0.0` |
| react-native | `0.76.6` | `0.81.5` |
| react | `18.3.1` | `19.1.0` |
| expo-modules-core | `2.2.3` | `3.0.30` (has Gradle plugin) |

**Branch:** `upgrade/expo-sdk-54-20260629` (pushed to GitHub)  
**CI workflow:** `.github/workflows/build-apk.yml` (clean SDK 54 version, zero patches)

---

## 4. Current Error (v2 — 29 June 2026)

### 4.1 The Error

GitHub Actions build run: the Gradle build fails at the `expo-module-gradle-plugin`:

```
FAILURE: Build failed with an exception.

* Where:
Build file '.../expo-modules-core/expo-module-gradle-plugin/build.gradle.kts' line: 4

* What went wrong:
Plugin [id: 'org.jetbrains.kotlin.jvm'] was not found in any of the following sources:

- Gradle Core Plugins (plugin is not in 'org.gradle' namespace)
- Included Builds (None of the included builds contain this plugin)
- Plugin Repositories (plugin dependency must include a version number for this source)
```

### 4.2 Root Cause (v2)

The `expo-modules-core` package ships with `expo-module-gradle-plugin/` inside its directory, but **this plugin directory is missing a `settings.gradle.kts` file**.

When Gradle resolves an included build (which is how Expo's autolinking works), each included build needs its own `settings.gradle` with a `pluginManagement` block declaring where to find plugins like `org.jetbrains.kotlin.jvm`.

The sibling plugin `expo-gradle-plugin` (at `expo-modules-autolinking/android/expo-gradle-plugin/`) **does** have this file and works correctly:

```kotlin
// expo-gradle-plugin/settings.gradle.kts (works)
pluginManagement {
  repositories {
    mavenCentral()
    google()
    gradlePluginPortal()
  }
}
include(...)
rootProject.name = "expo-gradle-plugin"
```

But `expo-module-gradle-plugin` has only `build.gradle.kts` with no settings file.

### 4.3 The Chain of Events

```
expo-modules-core/android/build.gradle:25
  → apply plugin: 'expo-module-gradle-plugin'
    → Gradle resolves plugin from expo-modules-core/expo-module-gradle-plugin/
      → build.gradle.kts:5  →  kotlin("jvm") version "2.1.20"
        → ❌ Can't resolve kotlin JVM plugin (no pluginManagement in this build)
```

### 4.4 The Fix

The fix has been applied to the CI workflow as **Step 11** in `build-apk.yml`. It creates the missing `settings.gradle.kts` in the plugin directory before Gradle runs:

```bash
PLUGIN_DIR="node_modules/expo-modules-core/expo-module-gradle-plugin"
echo 'pluginManagement {' > "$PLUGIN_DIR/settings.gradle.kts"
echo '  repositories {' >> "$PLUGIN_DIR/settings.gradle.kts"
echo '    mavenCentral()' >> "$PLUGIN_DIR/settings.gradle.kts"
echo '    google()' >> "$PLUGIN_DIR/settings.gradle.kts"
echo '    gradlePluginPortal()' >> "$PLUGIN_DIR/settings.gradle.kts"
echo '  }' >> "$PLUGIN_DIR/settings.gradle.kts"
echo '}' >> "$PLUGIN_DIR/settings.gradle.kts"
echo ''
echo 'rootProject.name = "expo-module-gradle-plugin"' >> "$PLUGIN_DIR/settings.gradle.kts"
```

This is a one-line patch (inside CI) that mirrors what the sibling `expo-gradle-plugin` already has. The ideal fix would be for the `expo-modules-core` npm package to ship this file, but until that's fixed upstream, the CI patch is pragmatic.

### 4.5 Why This Differs from SDK 52 Failures

In SDK 52, the error was **"expo-module-gradle-plugin not found at all"** (plugin didn't exist in expo-modules-core@2.x).

In SDK 54, the plugin **exists** but is **incomplete** — it needs a settings file that Gradle requires for included builds. This is a much smaller and more targeted fix than the old workarounds (no Kotlin version conflicts, no AGP component issues).

---

## 5. Full CI Workflow (17 Steps)

| Step | Action | Status |
|:----:|--------|:------:|
| 1 | 📥 Checkout repository | ✅ |
| 2 | ☕ Set up JDK 17 | ✅ |
| 3 | 🤖 Set up Android SDK | ✅ |
| 4 | 📦 Install Android SDK packages | ✅ |
| 5 | 🟢 Set up Node.js 20 | ✅ |
| 6 | 📦 Install root dependencies | ✅ |
| 7 | 📦 Install mobile_app dependencies | ✅ |
| 8 | 🔍 Verify expo-module-gradle-plugin exists | ✅ |
| 9 | 🔧 Run expo prebuild --clean | ✅ |
| 10 | 🔐 Fix Gradle wrapper permissions | ✅ |
| **11** | **🔧 Patch plugin settings (create settings.gradle.kts)** | **🆕 Added for v2** |
| 12 | 💾 Cache Gradle build outputs | ✅ |
| 13 | 🏗️ Build APK | ❌ Previously failed at v1, now re-trying |
| 14 | 📍 Locate built APK | ⏳ Pending |
| 15 | 📤 Upload APK artifact | ⏳ Pending |
| 16 | 📊 Build summary | ⏳ Pending |
| 17 | 🔎 Diagnostic dump on failure | ⏳ If needed |

---

## 6. Next Steps

1. ✅ **DONE — SDK 52 → 54 upgrade** completed and pushed
2. ✅ **DONE — Patch added** for missing settings.gradle.kts in CI workflow
3. ✅ **DONE — Pushed** updated workflow to branch
4. ⏳ **Re-run** the GitHub Actions workflow
5. ⏳ If success → download APK, install on device, test
6. ⏳ If failure → update this document to v3

---

## 7. Time Spent

| Session | Duration | Tasks |
|---------|:--------:|-------|
| Local SDK setup + first Gradle attempts | ~2 hrs | JDK install, Android SDK install, expo prebuild |
| GitHub Actions iterations (10+ runs) | ~3 hrs | Identifying errors, researching fixes, patching workflow |
| SDK 52 → 54 upgrade execution | ~1 hr | Manual package updates, prebuild, verification |
| v2 patch (settings.gradle.kts missing) | ~30 min | Root cause analysis of CI failure, workflow fix |

**Total: ~6.5 hours**
