# Handoff: Fix Login — Commit Pending Changes & Rebuild Frontend

**Handoff ID:** HO-20260619-005
**Date:** 19 June 2026
**From:** Cowork (Xon)
**To:** Claude Desktop Code / Project
**Project:** Volunteering Rewards App (C3000C)
**Location:** `D:\c3000c\volunteering-rewards-app`
**Repo:** https://github.com/XonLoke/volunteering-rewards-app
**Owner:** Xon

---

## Session Context

The backend API login works correctly (verified: `POST /api/auth/login` with carol@test.com returns a valid JWT token). However, the frontend at `https://webportals-lovat.vercel.app/admin/login` shows "Invalid email or password."

The root cause is that **pending code changes were never committed to GitHub** and therefore **Vercel never deployed them**. The `api.js` file on the live Vercel site still has the old localhost URL instead of the Render API URL.

---

## ✅ What's Working

- **Backend API** — ✅ Live at `https://vol-rewards-api.onrender.com`
- **API Login** — ✅ Returns JWT for carol@test.com (verified via curl)
- **API Health** — ✅ 200 OK, db_connected: true
- **Neon Database** — ✅ Seeded with 8 users
- **Frontend loads** — ✅ Page renders at Vercel

## ❌ What's Not Working

- **Frontend login** — ❌ "Invalid email or password" at `https://webportals-lovat.vercel.app/admin/login`
- **Root cause:** `api.js` changes not deployed to Vercel — frontend still calling localhost instead of Render API

---

## 🎯 Task 1: Commit All Pending Changes

There are uncommitted changes in the working directory. Run:

```bash
cd D:\c3000c\volunteering-rewards-app

# Stage code changes
git add app/login.tsx app/api.ts app.json
git add frontend/web_portals/src/pages/admin/Login.jsx
git add frontend/web_portals/vercel.json
git add .github/workflows/build-apk.yml

# Stage new documentation
git add docs/

# Commit and push
git commit -m "fix: commit pending changes — login fix, api URL, role guard, new docs"
git push origin main
```

**Files to commit:**

| File | What Changed |
|------|-------------|
| `frontend/web_portals/src/services/api.js` | **KEY FIX** — hardcoded `https://vol-rewards-api.onrender.com/api` instead of localhost |
| `frontend/web_portals/vercel.json` | Build env with VITE_API_URL |
| `frontend/web_portals/src/pages/admin/Login.jsx` | Removed test credentials box |
| `app/login.tsx` | Added volunteer role guard |
| `app/api.ts` | BASE_URL updated to Render |
| `app.json` | Removed broken expo-build-properties plugin |
| `.github/workflows/build-apk.yml` | APK build workflow |
| `docs/` (7 new files) | Status reports, deployment docs, access points |

---

## 🎯 Task 2: Verify Vercel Auto-Deploy

After pushing to GitHub:
1. Go to `https://vercel.com/xonlokes-projects/web_portals`
2. Check that a new deployment is triggered
3. Wait for it to complete (~2 minutes)

### Verify the fix
1. Open `https://webportals-lovat.vercel.app/admin/login`
2. Login as `carol@test.com` / `password123`
3. Should redirect to Admin Dashboard

Also verify all other portals:

| Portal | URL | Login | Expected |
|--------|-----|-------|----------|
| Admin | `https://webportals-lovat.vercel.app/admin/login` | carol@test.com | ✅ Admin Dashboard |
| Organiser | `https://webportals-lovat.vercel.app/organiser` | bob@test.com | ✅ Organiser Dashboard |
| Merchant | `https://webportals-lovat.vercel.app/merchant/login` | cheryl@test.com | ✅ PIN Verify page |
| Scanner | `https://webportals-lovat.vercel.app/scan` | bob@test.com | ✅ Event Select page |

---

## 🎯 Task 3: Rebuild & Redeploy Volunteer PWA

If Task 1 and 2 succeed, also rebuild the volunteer PWA:

```bash
cd D:\c3000c\volunteering-rewards-app
rd /s /q dist
npx expo export --platform web
npx vercel deploy dist --prod
```

Then verify:
- `https://dist-orpin-nine-46.vercel.app/` — login with alice@test.com → ✅
- `https://dist-orpin-nine-46.vercel.app/` — login with carol@test.com → ❌ "Volunteers only"

---

## Acceptance Criteria

- [ ] Code committed and pushed to GitHub
- [ ] Vercel auto-deploy triggered
- [ ] Admin login works at `https://webportals-lovat.vercel.app/admin/login`
- [ ] All 4 portal logins verified
- [ ] Volunteer PWA rebuilt (if time permits)

---

## Technical Context

### API Login (verified working)
```bash
curl -X POST https://vol-rewards-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}'
```

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Merchant | cheryl@test.com | password123 |
| Volunteer | alice@test.com | password123 |

### Frontend API Config
```javascript
// frontend/web_portals/src/services/api.js (line 1)
const API_BASE = import.meta.env.VITE_API_URL || 'https://vol-rewards-api.onrender.com/api';
```

---

## Status Tracking

| Task | Status | Notes |
|------|--------|-------|
| Commit code + docs to GitHub | ⬜ Pending | Multiple uncommitted files |
| Verify Vercel auto-deploy | ⬜ Pending | Should trigger on git push |
| Test all portal logins | ⬜ Pending | 4 portals to verify |
| Rebuild volunteer PWA | ⬜ Pending | If time permits |
| Update HANDOFF.md | ⬜ Pending | When done |
