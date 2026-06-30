# PWA-APK Unification Plan

> Restoring Vivian's GUI on the Vercel PWA to Match the Native APK

| | |
|---|---|
| **Project** | Volunteering Rewards App (C3000C) |
| **Date** | 29 June 2026 |
| **Status** | Draft — Pending Review |
| **Version** | 1.0 |

---

## Table of Contents

- [1. Background & Current State](#1-background--current-state)
- [2. The Three Problems](#2-the-three-problems)
- [3. Phase 1: Prepare for Web Build](#3-phase-1-prepare-frontendmobile_app-for-web-build)
- [4. Phase 2: Fix API Base URL](#4-phase-2-fix-api-base-url)
- [5. Phase 3: Reconfigure Vercel](#5-phase-3-reconfigure-vercel)
- [6. Verification Checklist](#6-verification-checklist)
- [7. Risk & Rollback Plan](#7-risk--rollback-plan)
- [8. Decision & Approval](#8-decision--approval)

---

## 1. Background & Current State

The Volunteering Rewards App currently has two deployment targets that display **different user interfaces**:

| Platform | Source Directory | UI Version | Status |
|---|---|---|---|
| **Native APK** | `frontend/mobile_app/` | Vivian's tab-based GUI ✓ | ✅ Built (83 MB) |
| **Vercel PWA** (current) | root `app/` | Flat screen-by-screen ✗ | ❌ Deployed but wrong UI |
| **Vercel PWA** (target) | `frontend/mobile_app/` | Vivian's tab-based GUI ✓ | ⬜ Planned |

**Key insight:** Both should share the same source code (`frontend/mobile_app/`). The APK already does. The PWA just needs its Vercel config changed.

---

## 2. The Three Problems

### Problem 1: PWA shows wrong UI

Vercel deploys from the root `app/` directory which has a flat screen-by-screen structure with no tab navigation. The APK was built from `frontend/mobile_app/app/` which has Vivian's properly organised GUI with:

- Bottom tabs: **Home / Events / Rewards / Profile**
- Auth flow: **Onboarding → Login → Register**
- Organiser screens: **Dashboard, Events, Feedback, Roster, Controller**

### Problem 2: API base URL points to localhost

In `frontend/mobile_app/src/services/api.ts`, line 1:

```ts
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
```

The fallback to `localhost:3000` means all API calls fail in the deployed PWA because the browser cannot reach a local server on the user's machine.

### Problem 3: Vercel root directory is misconfigured

The Vercel project (`volunteering-rewards-app`) builds from the **project root**, using the old `app/` directory. It must be reconfigured to build from `frontend/mobile_app/` instead.

---

## 3. Phase 1: Prepare `frontend/mobile_app/` for Web Build

### 3.1 Add Missing Web Dependencies

`frontend/mobile_app/package.json` is missing `react-dom` and `react-native-web`, which are required for Expo web export. These exist in the root `package.json` but were never added to `mobile_app`.

**Action:**
```bash
cd frontend/mobile_app
npx expo install react-dom react-native-web @expo/metro-runtime
```

### 3.2 Test Web Export Locally

Before deploying to Vercel, verify the web export works:

```bash
cd frontend/mobile_app
npx expo export --platform web
```

This generates a static build in the `dist/` directory. Fix any web-specific rendering issues before deployment.

---

## 4. Phase 2: Fix API Base URL

### 4.1 The Problem

The fallback `http://localhost:3000/api` means the deployed PWA tries to talk to a server on the user's device, which fails.

### 4.2 Solution: Set Vercel Environment Variable

Production API URL: **`https://vol-rewards-api.onrender.com/api`**

In the Vercel dashboard, add:

| Key | Value | Scope |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `https://vol-rewards-api.onrender.com/api` | Production |

### 4.3 Verify API Compatibility

| Check | Action |
|---|---|
| API endpoint paths match | Vivian's screens use `/api/v1/events`, `/api/auth/login` etc. Verify against `API_CONTRACTS_v2.md` |
| Auth flow works | Test login with `alice@test.com` / `password123` on production API |
| All 26 screens functional | Quick smoke test of each screen after deployment |
| CORS not blocking | Production API must allow requests from `dist-orpin-nine-46.vercel.app` origin |

---

## 5. Phase 3: Reconfigure Vercel

### 5.1 Vercel Project Settings

Project: `volunteering-rewards-app` (ID: `prj_DxLKNjMtf9pC9dzxOiMWWZ8NLu7c`)

| Setting | Current Value | New Value |
|---|---|---|
| **Root Directory** | (project root) | `frontend/mobile_app` |
| **Build Command** | (default) | `npx expo export --platform web` |
| **Output Directory** | (default) | `dist` |
| **Environment Variable** | (not set) | `EXPO_PUBLIC_API_URL=https://vol-rewards-api.onrender.com/api` |
| **Node Version** | (default) | `20.x` (matches local dev) |

### 5.2 Optional: Add `vercel.json` to `frontend/mobile_app/`

If Vercel dashboard settings are inconvenient, create `frontend/mobile_app/vercel.json`:

```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "framework": null
}
```

---

## 6. Verification Checklist

| # | Check | Pass Criteria |
|---|---|---|
| 1 | Web export builds | `npx expo export --platform web` exits 0 |
| 2 | PWA loads with tabs | Home, Events, Rewards, Profile bottom tabs visible |
| 3 | Auth flow works | Login with `alice@test.com` succeeds |
| 4 | API calls succeed | Events load, rewards load, no network errors |
| 5 | Deep links work | Direct URL `/events`, `/profile` resolve correctly |
| 6 | APK still works | Existing APK not affected (no source changes) |

---

## 7. Risk & Rollback Plan

| Risk | Impact | Mitigation |
|---|---|---|
| Web export breaks some screens | Screens render incorrectly in browser | Test locally first; fix web-specific issues before deploying |
| API incompatibility | Login or data loading fails | Smoke test all major flows after deploy; rollback by reverting Vercel root directory |
| PWA loses service worker / manifest | Install prompt disappears | Verify `manifest.json` and service worker exist in the `dist/` output |
| Deploy breaks existing PWA | Users see broken UI | Vercel instant rollback: **Deployment → Overflow menu → Rollback to previous** |

---

## 8. Decision & Approval

### 8.1 Estimated Effort

| Phase | Task | Est. Time |
|---|---|---|
| Phase 1 | Add web deps + test web export | ~20 min |
| Phase 2 | Set Vercel env var + verify API | ~15 min |
| Phase 3 | Reconfigure Vercel + deploy | ~15 min |
| Verification | Smoke test PWA + APK | ~30 min |
| **Total** | | **~1.5 hours** |

### 8.2 After This Plan

| Platform | Source | UI Shown | API Points To |
|---|---|---|---|
| **APK** 📱 | `frontend/mobile_app/app/` | Vivian's tabs ✅ | ✅ Production API |
| **PWA** 🌐 | `frontend/mobile_app/app/` | Vivian's tabs ✅ | ✅ Production API |

Both platforms now share the **same source code**. Vivian/Nurain can proceed with APK testing (APK-TEST-01 through 04) per Sprint 5 schedule.

### 8.3 Approval

**Approved by:** ____________________ **Date:** ________

**Comments:**

---

*— End of Plan —*
