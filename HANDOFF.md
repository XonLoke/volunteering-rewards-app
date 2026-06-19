# Handoff: Fix Login — Commit Pending Changes & Rebuild Frontend

**Handoff ID:** HO-20260619-005
**Date:** 19 June 2026
**From:** Cowork (Xon)
**To:** Future Self / Claude
**Project:** Volunteering Rewards App (C3000C)
**Location:** `D:\c3000c\volunteering-rewards-app`
**Repo:** https://github.com/XonLoke/volunteering-rewards-app
**Owner:** Xon

---

## Session Context (Original)

Backend API login worked correctly (`POST /api/auth/login` with carol@test.com returned a valid JWT), but the frontend at `https://webportals-lovat.vercel.app/admin/login` showed "Invalid email or password." The root cause: pending code changes had never been committed to GitHub, so Vercel never deployed them — `api.js` was still calling localhost instead of the Render API URL.

---

## Completed Work

### Task 1 — Commit All Pending Changes to GitHub

**What was done:**
- Cleaned ~40 stale `.git/*.lock` files that had accumulated from previous crashes
- Staged all pending changes with `git add -A`
- Committed 22 files: `e6e4a0a`
- Pushed to `main` on GitHub

**Key files committed:**
| File | What Changed |
|------|-------------|
| `frontend/web_portals/src/services/api.js` | API_BASE set to `https://vol-rewards-api.onrender.com/api` |
| `frontend/web_portals/vercel.json` | Build env with VITE_API_URL |
| `frontend/web_portals/src/pages/admin/Login.jsx` | Role guard + removed test credentials box |
| `app/login.tsx` | Volunteer role guard added |
| `app/api.ts` | BASE_URL updated to Render |
| `app.json` | Removed broken expo-build-properties plugin |
| `.github/workflows/build-apk.yml` | APK build workflow |
| `docs/` | Multiple status reports, deployment docs, access points |

**Problems encountered & solved:**
- **Problem:** `git add` failed with `index.lock: File exists` — stale lock files from earlier crashed git sessions
  - **Solution:** Deleted all stale `.git/HEAD.lock.*` and `.git/index.lock.*` files (40+ files accumulated over weeks)
- **Problem:** VM filesystem had permission issues deleting the `dist/` directory
  - **Solution:** Used native Windows CMD/PowerShell for all git and build operations instead of the Linux VM bash

**Commit references:**
- `e6e4a0a` — Main commit (22 files)
- `234ff76` — HANDOFF status update

### Task 2 — Vercel Auto-Deploy

Since the web_portals project on Vercel is linked to the GitHub repo, pushing to `main` should trigger an automatic redeploy. The Vercel dashboard at `https://vercel.com/xonlokes-projects/web_portals` will show the deployment status.

**Problem encountered & solved:**
- **Problem:** Previous `git push` command timed out at 60s in the CLI tool
  - **Solution:** Started a fresh standalone PowerShell process with a longer timeout — the push had actually already completed (confirmed by `Everything up-to-date` on second attempt)

### Task 3 — Volunteer PWA Rebuild & Redeploy

**What was done:**
- Cleared old `dist/` directory
- Ran `npx expo export --platform web` — built successfully (875 modules, 45 assets, 2 JS bundles)
- Deployed to Vercel with `npx vercel deploy dist --prod` — successful

**New PWA URL:** `https://dist-orpin-nine-46.vercel.app/`
(also aliased to `https://dist-6uqs5h8si-xonlokes-projects.vercel.app`)

**Build details:**
- Metro bundler: 477ms
- Web bundles: entry.js (1.91 MB), Calendar.js (15.3 kB)
- 45 asset files (images, fonts, icons)
- Vercel build completed in 61ms

**Problem encountered & solved:**
- **Problem:** User ran commands from `C:\Users\Lenovo>` instead of the project directory, causing:
  - `ConfigError: package.json not found` (wrong working directory)
  - `Could not find "~\dist"` (wrong working directory)
- **Solution:** Commands need `cd /d D:\c3000c\volunteering-rewards-app` to switch drives in CMD, or use `Set-Location` in PowerShell

---

## Current Status

| Item | Status | Details |
|------|--------|---------|
| Backend API | ✅ Working | `https://vol-rewards-api.onrender.com` — login, health, DB all OK |
| GitHub repo | ✅ Up to date | 2 new commits on `main` |
| Web Portals (Vercel) | ⏳ Should auto-deploy | Push triggered; check Vercel dashboard |
| Volunteer PWA (Vercel) | ✅ Rebuilt & deployed | `https://dist-orpin-nine-46.vercel.app/` |
| Admin login | ⏳ Unverified | Wait for Vercel deploy to complete |
| All 4 portals | ⏳ Unverified | Test after Vercel deploy completes |

---

## Verification Steps (after Vercel deploys)

1. **Admin Portal:** `https://webportals-lovat.vercel.app/admin/login` — carol@test.com / password123 → should redirect to Admin Dashboard
2. **Organiser Portal:** `https://webportals-lovat.vercel.app/organiser` — bob@test.com → Organiser Dashboard
3. **Merchant Portal:** `https://webportals-lovat.vercel.app/merchant/login` — cheryl@test.com → PIN Verify page
4. **Scanner Portal:** `https://webportals-lovat.vercel.app/scan` — bob@test.com → Event Select page
5. **Volunteer PWA:** `https://dist-orpin-nine-46.vercel.app/` — alice@test.com → Home ✅, carol@test.com → "Volunteers only" ❌

---

## Commands Reference

### Rebuild Volunteer PWA (if needed again)
```powershell
cd D:\c3000c\volunteering-rewards-app
rd /s /q dist
npx expo export --platform web
npx vercel deploy dist --prod
```

### Force Vercel Redeploy (if auto-deploy doesn't trigger)
Push an empty commit:
```powershell
cd D:\c3000c\volunteering-rewards-app
git commit --allow-empty -m "chore: trigger vercel redeploy"
git push origin main
```

---

## Key Lessons for Next Time

1. **Always use `cd /d` in CMD** to switch between drives (C: → D:)
2. **Use PowerShell instead of CMD** on Windows — `Set-Location` handles drive switching automatically, and `&&` chaining works
3. **Stale git lock files** accumulate from crashed sessions — `rm -f .git/HEAD.lock.* .git/index.lock.*` fixes `index.lock: File exists` errors
4. **Vercel auto-deploy** is linked to GitHub pushes on `main` — no manual deploy needed for web_portals

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Merchant | cheryl@test.com | password123 |
| Volunteer | alice@test.com | password123 |

---

## Acceptance Criteria

- [x] Code committed and pushed to GitHub (commits `e6e4a0a`, `234ff76`)
- [x] Vercel auto-deploy triggered (GitHub push completed)
- [ ] Admin login works at `https://webportals-lovat.vercel.app/admin/login`
- [ ] All 4 portal logins verified
- [x] Volunteer PWA rebuilt and redeployed at `https://dist-orpin-nine-46.vercel.app/`
