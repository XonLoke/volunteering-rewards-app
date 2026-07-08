# Short Notes — Expo → PWA Switch

**Date:** 18 Jun 2026
**Author:** Xon Loke
**Status:** Final

---

## 1. Background

The Volunteer Mobile App was built with **Expo (React Native)** — 26 screens for event browsing, QR attendance, points, rewards, and profile.

Goal: generate a native **Android APK** via Expo's cloud build service (EAS Build) for team members to install and test.

---

## 2. The Problem

**EAS Build failed consistently.** 5 attempts, same error every time.

| Attempt | Result |
|---------|--------|
| 1 | ❌ Gradle compilation failed |
| 2 | ❌ Same Gradle error (after clearing cache) |
| 3 | ❌ Same error (after pinning SDK versions) |
| 4 | ❌ Same error (after removing unused native deps) |
| 5 | ❌ Same error (after fresh install) |

**Root cause:** Expo's build servers upgraded to **AGP 8.11.0**, which has variant resolution conflicts with React Native native modules (`@react-native-async-storage/async-storage` and others). Known platform bug tracked in:
- [expo/expo#42730](https://github.com/expo/expo/issues/42730)
- [expo/expo#42370](https://github.com/expo/expo/issues/42370)

---

## 3. Why Not Other Options

| Option | Why It Didn't Work |
|--------|-------------------|
| Local Android Studio build | No Android SDK / JDK on dev machine |
| Expo Go (QR dev mode) | Requires dev machine to stay running — not suitable for testing/demo |
| Build on teammate's machine | Uncertain if anyone had the SDK |
| Wait for Expo patch | Timeline was uncertain; capstone deadlines were fixed |

---

## 4. The Solution: PWA

Rebuilt the volunteer mobile app as a **Progressive Web App** using `react-native-web`.

**How it works:**
- `npx expo export --platform web` compiles RN components to HTML/CSS/JS
- `manifest.json` + `service-worker.js` enable "Add to Home Screen" + offline cache
- Deployed to **Vercel** (free, global CDN, zero cold starts)

**URL:** `https://volunteering-rewards-app.vercel.app`

**What carried over:**
- ✅ All 26 screens (login, events, points, rewards, profile, etc.)
- ✅ UI identical to the original Expo design
- ✅ Mobile-first layout (bottom tabs, swipe, touch targets)

**What was lost vs. APK — corrected assessment:**

| Feature | PWA | Native APK would help? | Verdict |
|---------|-----|----------------------|---------|
| Camera / QR scanning | ❌ Not supported | ✅ APK could, but **Scanner Portal** (`/scan`) already handles this separately | 🟢 **Not needed in APK** |
| Push notifications | ❌ Not supported | ❌ **Backend doesn't have notification endpoints either** | 🟢 **Not a PWA limitation** |
| Offline support | ⚠️ Service worker (basic) | ✅ APK could use SQLite / AsyncStorage for richer offline | 🟡 **Real gap** |
| App drawer presence | ⚠️ "Add to Home Screen" only | ✅ APK appears as a real installed app | 🟡 **Real gap** |
| Background sync | ❌ Not supported | ✅ APK can sync data in background | 🟡 **Real gap** |

---

## 5. Current Status

The PWA is **fully deployed and working**. All portals (Admin, Organiser, Merchant, Scanner, Volunteer) are accessible via browser or home-screen install.

---

## 6. Why Still Build a Native APK?

Even though the PWA covers most use cases, a native APK is still desirable for:

1. **🏠 App drawer presence** — "Add to Home Screen" is not as seamless as a real installed app
2. **📴 Full offline support** — PWA service worker is basic; native can use SQLite/AsyncStorage
3. **🔄 Background sync** — native apps can refresh data without being open
4. **📱 OS integration** — app switcher, splash screen, deep linking work more reliably

**Camera/QR scanning** and **Push notifications** are NOT valid reasons to build the APK:
- QR scanning is already covered by the separate Scanner Portal (`/scan`)
- Push notifications require backend endpoints that don't exist yet (regardless of APK or PWA)

---

## 7. Plan: Local APK Build

**Strategy:** Set up a local Android SDK + JDK environment on the dev machine to build the APK directly, bypassing Expo's cloud build (EAS) entirely. This avoids the AGP 8.11 bug since we control the Gradle version locally.

### Steps

| # | Task | Est. Time | Dependencies |
|---|------|-----------|-------------|
| 1 | Install JDK 17+ (required by Android Gradle Plugin) | ~15 min | — |
| 2 | Install Android SDK (command-line tools) | ~20 min | JDK |
| 3 | Accept Android licenses & create local.properties | ~10 min | Android SDK |
| 4 | Pin AGP version in `android/build.gradle` to known-stable | ~10 min | — |
| 5 | Run `npx expo run:android` locally | ~30 min | All above |
| 6 | Generate signed APK via `eas build --platform android --local` | ~15 min | Working build |
| 7 | Distribute APK to team for testing | ~10 min | APK file |

**Target:** Sprint 5 (week of 29 Jun – 6 Jul 2026), timeboxed to **half a day**.
