# iOS Build — Consideration for Volunteer Mobile App

> **Author:** Xon (Project Coordinator)
> **Date:** 3 July 2026
> **Audience:** Vivian, Nurain (iPhone users, currently without an Android device to test the APK)
> **Purpose:** Explore whether we can build an iOS version of our volunteer mobile app so Vivian and Nurain can test on their iPhones, and what it would cost.

---

## 1. Background

Our volunteer mobile app at `frontend/mobile_app/` is built with **Expo SDK 52 / React Native**. The APK for Android has been built and deployed successfully (83 MB). However, both Vivian and Nurain use iPhones, which means they cannot install the APK or test the app natively on their devices.

This document explores what it would take to also build an iOS version using the **same codebase**, so everyone on the team can test the mobile app on their own phone.

---

## 2. Critical Finding: EAS Cloud Build Previously Failed for Android

**We have already tried Expo's cloud build service (EAS Build) before — it failed 5 times for Android.**

The errors were caused by AGP 8.11 Gradle conflicts on Expo's build servers. Full details are documented in:
- `docs/apk-build-solution-report-v3.md` — Root cause analysis and solution
- `docs/Expo to PWA Switch v1.0.md` — Initial failed attempts

This is relevant to the iOS discussion because **Options 3 and 4 below rely on EAS Build** (the same cloud service). If EAS Build was unreliable for Android, it would likely be unreliable for iOS — just with different errors (Xcode version mismatches, CocoaPods issues, code signing certificate problems).

**The only iOS option we can confidently say works would require a physical Mac** to build locally with Xcode (Option 2).

---

## 3. Key Finding: Same Codebase, No Rewrite

Because our app is built with React Native via Expo, the **same code already works on iOS**. The UI components, navigation, API calls, and even the QR scanner (`expo-camera`) are all cross-platform by default. We do not need to rewrite anything.

The only barriers are Apple's build tooling requirements:

| Aspect | Android (Already Done) | iOS (Needed) |
|--------|----------------------|--------------|
| Build tool | `./gradlew assembleRelease` | `npx expo run:ios` or EAS Build |
| Build machine | Windows PC (ours) | Mac required for local build |
| Developer fee | Google Play $25 (one-time) | Apple Developer $99/year |
| Distribution | APK file (sideload) | TestFlight / App Store / sideload |

---

## 4. Do We Actually Need an iOS App? — Comparing Against Our Existing APK

Before deciding to build for iOS, we should ask: **does the existing Android APK + PWA already cover everyone's needs?**

| Need | Android APK (Already Have) | PWA on iPhone (Already Have) | Native iOS App (Would Build) |
|------|:--------------------------:|:----------------------------:|:----------------------------:|
| **Runs on device** | ✅ Android phones | ✅ iPhone Safari | ✅ iPhone native |
| **App drawer icon** | ✅ Yes | ⚠️ "Add to Home Screen" | ✅ Yes |
| **QR scanning** | ✅ expo-camera | ✅ Via Scanner Portal (`/scan`) | ✅ expo-camera |
| **Offline support** | ✅ Full (local storage) | ⚠️ Basic (service worker) | ✅ Full |
| **Push notifications** | ❌ Not built yet | ❌ Not built yet | ❌ Not built yet |
| **Same GUI** | ✅ Tab-based (Vivian's) | ✅ Tab-based (since KAN-157) | ✅ Tab-based |
| **Test accounts** | ✅ alice@test.com | ✅ alice@test.com | ✅ alice@test.com |
| **Build time** | ✅ Already done | ✅ Already deployed | ❌ Unknown (could be hours) |
| **Cost to build** | ✅ $0 (local SDK) | ✅ $0 | ❌ $0 or $99/yr |
| **Risk of failure** | ✅ None (done) | ✅ None (done) | ❌ High (EAS failed before) |

### The Verdict

The **Android APK** covers team members with Android phones. The **PWA** covers iPhone users with the same GUI and nearly all features. The only gap is that QR scanning on iPhone requires opening the separate Scanner Portal (`/scan`) instead of using the mobile app's built-in scanner — but this is a minor workflow difference.

**Building a native iOS app would duplicate what the PWA already provides for iPhone users**, with significant risk of build failures based on our EAS experience.

---

## 4.1 QR Scanning: What Works Where

QR scanning involves two distinct actions — **displaying** a QR code (volunteer) and **scanning** a QR code (organiser). Each platform handles them differently:

| Action | Android APK | iPhone PWA | iPhone Scanner Portal |
|--------|:-----------:|:-----------:|:--------------------:|
| **Volunteer: Display QR code** | ✅ `expo-camera` displays QR | ✅ PWA shows QR on screen | N/A |
| **Organiser: Scan volunteer's QR** | ✅ `expo-camera` scans | ❌ Not supported in PWA | ✅ `html5-qrcode` works |
| **Technology** | React Native camera API | Canvas/SVG rendering | JavaScript QR library |

### What This Means for Testing

- **Alice (volunteer, iPhone):** Opens PWA, logs in, her QR code is displayed on screen. Bob (organiser) scans it. ✅
- **Bob (organiser, iPhone):** Opens Scanner Portal at `webportals-lovat.vercel.app/scan` on Safari, selects today's event, scans Alice's QR code using the JavaScript QR reader. ✅ Works identically to the native scanner.
- **Bob (organiser, Android):** Can use either the APK's built-in `expo-camera` scanner OR the Scanner Portal. Both work. ✅

**The `/scan` portal is already live and handles QR scanning on any device with a browser and camera — no native app needed.**

---

## 5. Available Options for iOS

### Option 1: Expo Go (Free, Limited Features) — $0

Vivian and Nurain install **Expo Go** from the App Store on their iPhones. I run `npx expo start` and they scan the QR code.

| ✅ Pros | ❌ Cons |
|---------|---------|
| Free, no build needed | QR camera scanner (`expo-camera`) does NOT work in Expo Go |
| No Mac needed | Some native features are limited |
| Instant preview | Not a standalone app — relies on my computer running |

**Verdict:** Good for quick UI testing, but the QR scanner feature won't work, which defeats the purpose of testing the full volunteer flow.

---

### Option 2: Xcode Simulator (Free, Mac Required) — $0

If someone on the team has a Mac, they can run the app in Xcode's simulator:

```bash
npx expo run:ios
```

| ✅ Pros | ❌ Cons |
|---------|---------|
| Free, no developer fee needed | Requires a Mac computer |
| Full features including camera | Runs in simulator, not on a real iPhone |
| Same code as APK | Vivian and Nurain cannot test on their actual devices |

**Verdict:** Not useful for our team since nobody has confirmed access to a Mac, and it doesn't solve the problem of testing on physical iPhones.

---

### Option 3: EAS Build Cloud + Free Apple ID (Recommended) — $0

Expo's **EAS Build** compiles the iOS app on their cloud servers — no Mac needed on our end. We only need a **free Apple ID** (no payment required) to generate a signing certificate.

```bash
npx eas build --platform ios --profile development
```

This produces an `.ipa` file that Vivian and Nurain can install on their iPhones.

| ✅ Pros | ❌ Cons |
|---------|---------|
| Free — no Mac, no $99 fee | App expires after **7 days** and must be re-installed |
| Full features including QR scanner | Requires a free Apple ID |
| Builds on cloud servers | Slightly slower than local build |
| Same source code as APK | Need to re-run build every 7 days |

**Verdict:** Best option for our team. Free, works on real iPhones, supports all features. The 7-day expiry is manageable for testing — just rebuild once a week.

---

### Option 4: EAS Build + Paid Apple Developer Account — $99/year

Same as Option 3, but with a paid Apple Developer account ($99/year).

| ✅ Pros | ❌ Cons |
|---------|---------|
| App **does not expire** | Costs $99/year |
| Can distribute via TestFlight | Requires credit card sign-up |
| Full features including QR scanner | |
| Required if we ever want the App Store | |

**Verdict:** Overkill for our current project deadline (Jul 6). Only consider this if we plan to continue the project long-term.

---

## 6. Comparison Table

| Criterion | Expo Go (Free) | Simulator (Free) | EAS + Free Apple ID ($0) | EAS + Paid ($99/yr) |
|-----------|:-------------:|:----------------:|:------------------------:|:-------------------:|
| **Mac required?** | ❌ No | ✅ Yes | ❌ No | ❌ No |
| **Runs on iPhone?** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **QR scanner works?** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Cost** | $0 | $0 | **$0** | $99/yr |
| **App expiry** | — | — | 7 days | Never |
| **Setup time** | 5 min | 30 min | 30 min | 1 hour |
| **Full native features** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 7. My Recommendation

**Given that EAS Build failed 5 times for Android, I cannot recommend it for iOS with confidence.** The same cloud service would likely have its own issues (Xcode versions, CocoaPods, code signing).

The realistic options are:

### Option A: Practical Path — Use the PWA on iPhone (Recommended Now)

The **Volunteer PWA** at https://volunteering-rewards-app.vercel.app already works on iPhone Safari. Since KAN-157 unified the PWA and APK to share the same codebase, the PWA now shows Vivian's tab-based GUI — the same interface the native app would have.

Vivian and Nurain can:
1. Open Safari → go to the PWA URL
2. Tap the Share button → "Add to Home Screen"
3. The app appears on their home screen like a native app
4. Test all features: events, rewards, profile, etc.

✅ Works today, $0, no build needed
⚠️ QR camera scanning only works via the separate Scanner Portal at `/scan`

### Option B: If a Mac Becomes Available — Local Xcode Build ($0)

If someone on the team has a Mac, we can build locally with `npx expo run:ios` — no cloud service needed, no EAS failures, no $99 fee (for simulator testing).

### Option C: EAS Build (Experimental — Low Confidence)

We can try EAS Build for iOS, but based on our Android experience (5 failed attempts due to Expo's build servers), there's a high risk of failure and the debugging could take hours we don't have before the Jul 6 deadline.

---

## 8. What's the Plan for Vivian and Nurain

**For now, use the Volunteer PWA on iPhone Safari:**

| For this | Open this URL | Login |
|----------|--------------|-------|
| **Volunteer flows** (events, rewards, profile) | https://volunteering-rewards-app.vercel.app | alice@test.com |
| **QR scanning (as organiser)** | https://webportals-lovat.vercel.app/scan | bob@test.com |
| **Organiser dashboard** | https://webportals-lovat.vercel.app/organiser | bob@test.com |

**Steps for Vivian and Nurain:**
1. Open Safari, go to the Volunteer PWA URL
2. Log in with alice@test.com / password123 to test volunteer flows
3. Tap Share → "Add to Home Screen" for app-launcher convenience
4. For QR scanning tests, open the Scanner Portal separately with bob@test.com
5. The Scanner Portal uses your iPhone camera via the browser — no app install needed

If anyone has access to a Mac and wants to attempt a local iOS build, let me know and I will help set up the environment.

---

## 9. If We Don't Build for iOS

If we decide not to build for iOS, Vivian and Nurain can still test the volunteer app through:

- **Volunteer PWA** → https://volunteering-rewards-app.vercel.app  
  (Works on iPhone Safari — same code, same features, just in the browser)
- **Web Portals** → Admin, Organiser, Merchant portals are all browser-based

The PWA already shows the same tab-based GUI as the APK (since KAN-157 unified them), so most testing can be done through Safari without needing a native iOS app.
