# Handoff: Sprint 3 Completion — Pull Branches from GitHub & Integrate

**Handoff ID:** HO-20260612-004  
**Date:** 12 June 2026  
**From:** Cowork (Xon)  
**To:** Claude Desktop Code / Cowork Project  
**Project:** Volunteering Rewards App (C3000C)  
**Location:** `D:\c3000c\volunteering-rewards-app`  
**Repo:** https://github.com/XonLoke/volunteering-rewards-app  
**Owner:** Xon  

---

## Session Context

This handoff is for **pulling team member branches from GitHub, merging them into main, and completing Sprint 3**. Sprint 3 ends **15 Jun 2026** — 3 days away.

The project has 4 team branches (`grace`, `vivian`, `nurain`, `xon`) plus `main`. Some branch work is already on main (partially integrated); the rest needs to be merged and conflicts resolved.

---

## ✅ What's Already on Main

| Item | Status |
|------|--------|
| All backend services (events, auth, rewards, attendance, leaderboard, sponsorship) | ✅ Merged |
| All 4 AI features (recs, feedback summary, referral, leaderboard) | ✅ Merged |
| Admin web portal (all pages) | ✅ Merged |
| Organiser web portal (dashboard, event mgmt, feedback) | ✅ Partially — Nurain's files need check |
| Merchant web portal (PinVerify, History, Login) | ✅ Files exist on main |
| Volunteer mobile app (`app/` directory — all screens) | ✅ Merged from Vivian's Expo work |
| Settings & Contact routes (Vivian) | ✅ Integrated, old `backend/src/src/` deleted |
| 6 backend stubs fixed | ✅ Merged |
| Migration 022 (user_settings) | ✅ Merged |
| Nodemailer installed | ✅ Merged |

---

## 🎯 Tasks for Project/Code

### Task 1: Git — Pull main, fetch all branches 🔴 HIGH

```
git checkout main
git pull origin main
git fetch origin
```

---

### Task 2: Merge Grace's Branch 🔴 HIGH

**Files to merge** (`git merge origin/grace`):
```
backend/src/controllers/merchant.controller.js     <- Verify against main
backend/src/services/merchant.service.js            <- Verify against main
backend/src/controllers/rewards.controller.js       <- Verify against main
backend/src/services/rewards.service.js             <- Verify against main
frontend/web_portals/src/pages/merchant/History.jsx  <- Verify against main
frontend/web_portals/src/pages/merchant/PinVerify.jsx <- Verify against main
```

**What to check:** These files already exist on main — Grace's branch may have older versions. If `git merge` shows conflicts, resolve by keeping the `main` version (it has more recent fixes including the coupon calc fix, admin service integration).

**Acceptance:** Grace's branch merged. All merchant pages route correctly.

---

### Task 3: Merge Nurain's Branch — Organiser Backend 🟡 MEDIUM

**Nurain's branch has these backend files that may NOT be on main:**

```
# Backend services & controllers — check against main
backend/src/controllers/organiser.controller.js     -- May have additional endpoints
backend/src/services/organiser.service.js            -- May have additional features
backend/src/controllers/me.controller.js             -- May have additions
backend/src/services/me.service.js                   -- May have additions
```

**Actions:**
1. List files unique to nurain: `git diff origin/main...origin/nurain --name-only`
2. For each backend file, check if it exists on main already:
   - **If exists**: Check `git diff origin/main -- <file>` — if main has newer version, skip (keep main)
   - **If not exists**: Cherry-pick or copy the file from nurain branch
3. For app/portal files like `controller.tsx`, `dashboard.tsx`, `events.tsx`, `feedback.tsx` — these are under `my-app-stable/` directory on Nurain's branch. They are likely outdated Expo files. **Skip these** — main already has the correct files in `app/` directory.

**Key files to focus on from Nurain:**
```
backend/src/controllers/organiser.controller.js
backend/src/services/organiser.service.js
backend/src/controllers/me.controller.js
backend/src/services/me.service.js
```

**Acceptance:** Nurain's backend additions merged without breaking existing endpoints.

---

### Task 4: Add PWA Config — Organiser Scanner & Cashier App 🔴 HIGH

Both apps need PWA installability (requirement from supervisor Andy).

#### 4a: Install vite-plugin-pwa

```bash
cd D:\c3000c\volunteering-rewards-app\frontend\web_portals
npm install vite-plugin-pwa
```

#### 4b: Update Vite config for PWA

Edit `D:\c3000c\volunteering-rewards-app\frontend\web_portals\vite.config.js`:
- Import `vite-plugin-pwa`
- Add PWA configuration with:
  - `registerType: 'autoUpdate'`
  - Manifest for both apps (name, short_name, icons, display: 'standalone', start_url)
  - Workbox glob patterns for caching

#### 4c: Add PWA manifest icons

Create `frontend/web_portals/public/pwa-icons/` with placeholder icons:
- `icon-192x192.png` (192x192)
- `icon-512x512.png` (512x512)

(Generate simple colored PNGs or use a placeholder approach)

#### 4d: Create PWA entry pages

**Cashier App entry** — Update or create route so merchant pages work as standalone PWA:
- Ensure `/merchant/login` can be a start_url
- Check that navigation between Login → PinVerify → History works without admin portal chrome

**Scanner App entry** — Update or create route so scan pages work as standalone PWA:
- Ensure `/scan/event-select` can be a start_url
- Wire Scanner.jsx to use `navigator.mediaDevices.getUserMedia` for camera QR input

#### 4e: QR Camera Scanner

Update `frontend/web_portals/src/pages/scan/Scanner.jsx`:
- Import `html5-qrcode` or use raw `getUserMedia` API
- On page load: request camera permission and start video stream
- On QR scan detect: parse volunteer QR data, call `POST /api/attendance/scan`
- Show success/failure feedback
- Fallback: manual input field for volunteer ID if camera not available

**Backend endpoints the Scanner connects to:**
- `POST /api/attendance/scan` — Submit scan result
- `GET /api/events/today` — Get today's events for event selection
- `GET /api/organiser/events/:id/roster` — View attendance roster

**Acceptance:** Both PWAs installable on phone home screen. Scanner reads QR codes and marks attendance. Cashier app verifies PINs and redeems coupons.

---

### Task 5: Verify & Fix Wire-Up — Merchant Pages 🟡 MEDIUM

Check `frontend/web_portals/src/pages/merchant/PinVerify.jsx`:
- Does it call real API endpoints or use mock data?
- Endpoints to verify:
  - `POST /api/coupons/verify` — 6-digit PIN verification
  - `POST /api/coupons/redeem` — Mark coupon redeemed
  - `POST /api/coupons/reverse` — 5-min reversal window
- If mock data used, replace with real API calls matching merchant.service.js

**Acceptance:** Merchant PIN verify, redeem, and reverse all work against live backend.

---

### Task 6: Commit & Push 🔴 HIGH

```bash
git add -A
git commit -m "Sprint 3 completion: merge branch work, PWA config, QR scanner, merchant verify"
git push origin main
```

**Acceptance:** All changes pushed to `origin/main`.

---

### Task 7: Smoke Test After Push 🟢 LOW

1. Restart backend: `cd D:\c3000c\volunteering-rewards-app\backend && npm run dev`
2. Quick smoke tests:
   - `POST /api/auth/login` with alice@test.com / password123
   - `GET /api/events` — should return events list
   - `GET /api/leaderboard` — should return leaderboard
   - `POST /api/attendance/scan` — should accept scan
   - `POST /api/coupons/verify` — should verify PIN
3. Run: `cd backend && npm test`

**Acceptance:** Backend starts, login works, tests pass.

---

## Technical Context

### Auth Pattern
```javascript
// Login stores token
const res = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
// data.token — use this for all subsequent calls

// All subsequent calls
const response = await fetch('http://localhost:3000/api/events', {
  headers: {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  },
});
```

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Merchant | cheryl@test.com | password123 |

### Database
| Field | Value |
|-------|-------|
| Host | localhost:5432 |
| Database | `volunteering_rewards` |
| User | `postgres` |
| Password | `9663` |

### Important Notes
- `backend/src/src/` has been **deleted** — do not restore it
- Grace's branch may have older code — main has priority for conflicts
- Nurain's `my-app-stable/` directory is outdated Expo project — skip it
- PWA needs placeholder icons (any simple colored PNGs work)
- The admin portal uses `api.js` service for authenticated requests — check if merchant/scan pages have similar or need their own

---

## Status Tracking

| Task | Status | Notes |
|------|--------|-------|
| T1: Git pull & fetch | ⬜ Pending | |
| T2: Merge Grace's branch | ⬜ Pending | Check conflicts against main |
| T3: Merge Nurain's backend | ⬜ Pending | Focus on organiser/me controllers & services |
| T4a: Install vite-plugin-pwa | ⬜ Pending | |
| T4b: Vite PWA config | ⬜ Pending | Manifest + service worker config |
| T4c: PWA icons | ⬜ Pending | Placeholder PNGs |
| T4d: PWA entry routes | ⬜ Pending | Scanner + Cashier as standalone PWAs |
| T4e: QR camera scanner | ⬜ Pending | getUserMedia + html5-qrcode |
| T5: Merchant wire-up check | ⬜ Pending | Verify real API calls |
| T6: Commit & push | ⬜ Pending | |
| T7: Smoke test | ⬜ Pending | Login, events, tests |

---

## How to Use

1. Read this file in full
2. Work through tasks in order (T1 → T7)
3. Update Status Tracking as you go (⬜ → ✅ or ⛔ Blocked)
4. When all done, push to GitHub and say "Sprint 3 handoff complete"
