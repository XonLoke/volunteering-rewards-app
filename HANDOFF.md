# Handoff: Sprint 4 — Mobile API Integration & Hardening

**Handoff ID:** HO-20260612-002  
**Date:** 12 June 2026  
**From:** Cowork (Sprint 3 completion assessment)  
**To:** Claude Desktop Code  
**Project:** Volunteering Rewards App (C3000C)  
**Location:** `D:\c3000c\volunteering-rewards-app`  
**Repo:** https://github.com/XonLoke/volunteering-rewards-app  
**Owner:** Xon

---

## Sprint 3 Status: ✅ COMPLETE

Sprint 3 (Frontend Completion + Integration) is finished. All backend endpoints are live, all web portal screens are wired, and the scan PWA works. Key deliverable: **6 formerly-stubbed endpoints** (`events/today`, `events/categories`, `events/:id/roster`, `events/:id/stats`, `events/:id/qna`, `events/:id/feedback`) now use real SQL queries.

**Vivian's settings & contact routes integrated:** Migration 022 (user_settings), 3 adapted files moved from `backend/src/src/` to `backend/src/`, shared auth middleware, nodemailer installed. Pushed as `b4e5fe3`.

**Last commit pushed:** `b4e5fe3` — Integrate Vivian's settings & contact routes (on `origin/main`)

---

## Critical Gap: Mobile App API Contract Drift

The mobile app (`app/` directory — Expo/React Native) communicates with the backend using `?user_id=X` query parameters instead of JWT Bearer token authentication. The backend requires JWT auth. This is the **top priority** for Sprint 4.

### Mobile App Calls vs Backend Expectations

| Mobile App (`app/*.tsx`) | Backend Expects | Severity |
|--------------------------|----------------|----------|
| `GET /events?user_id=X` | `GET /api/events` (JWT Bearer) | 🔴 HIGH |
| `GET /events?user_id=X` (register) | `POST /api/events/:id/register` (JWT) | 🔴 HIGH |
| `GET /profile?user_id=X` | `GET /api/me/points` (JWT Bearer) | 🔴 HIGH |
| `GET /my-coupons?user_id=X` | `GET /api/me/coupons` (JWT Bearer) | 🔴 HIGH |
| `GET /coupons` | `GET /api/rewards` (JWT Bearer) | 🔴 HIGH |
| `POST /redeem` | `POST /api/rewards/:id/redeem` (JWT) | 🔴 HIGH |
| `GET /scans?user_id=X` | `GET /api/me/events` (JWT Bearer) | 🔴 HIGH |
| `POST /profile/avatar` | No matching endpoint | 🟡 MEDIUM |

### Screens Affected

| File | What Uses `?user_id=` |
|------|----------------------|
| `app/login.tsx` | ✅ Uses proper `POST /api/auth/login` (correct) |
| `app/register.tsx` | ✅ Uses proper `POST /api/auth/register` (correct) |
| `app/home.tsx` | 🔴 Events, profile, coupons, notifications all use `?user_id=` |
| `app/events.tsx` | 🔴 Browse, join, leave use `?user_id=` |
| `app/profile.tsx` | 🔴 Profile, scans, coupons, avatar all use `?user_id=` |
| `app/rewards.tsx` | 🔴 Uses `GET /coupons` (wrong path + no auth) |
| `app/redeem-confirmation.tsx` | 🔴 Uses `POST /redeem` (wrong path + no auth) |
| `app/scan.tsx` | ✅ Uses stored QR data from login (correct) |
| `app/my-coupons.tsx` | 🔴 Uses `GET /my-coupons?user_id=X` |
| `app/ai-recommendations.tsx` | ❓ Check — may use `?user_id=` |
| `app/hall-of-fame.tsx` | ❓ Check — may use `?user_id=` |

### The Fix (Architecture)

The mobile app stores the user object and token in AsyncStorage after login. The fix is to:

1. **Extract token from AsyncStorage** before every API call
2. **Include `Authorization: Bearer <token>` header** in all fetch requests
3. **Replace `?user_id=X` with the proper API path** matching backend contracts
4. **Use `req.user.id` from JWT** (not query params) — the backend already extracts user ID from the token

**Pattern to use (example for home.tsx events fetch):**

```typescript
// OLD (broken):
const stored = await AsyncStorage.getItem("user");
const userId = JSON.parse(stored).id;
const response = await fetch(`${BASE_URL}/events?user_id=${userId}`);

// NEW (fixed):
const stored = await AsyncStorage.getItem("user");
const user = JSON.parse(stored);
const token = await AsyncStorage.getItem("token");
const response = await fetch(`${BASE_URL}/events`, {
  headers: { 
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
```

### Screens NOT Needing the Fix

These screens don't make fetch calls and only display stored data:
- `app/coupon-detail.tsx` — No fetch
- `app/event-booked.tsx` — No fetch
- `app/redeem-success.tsx` — No fetch
- `app/pin-display.tsx` — No fetch
- `app/scan-success.tsx` — No fetch

---

## Priority Tasks for Claude Desktop Code

### Task 1: Fix Mobile App Auth — All Screens 🔴 HIGH

**Files to edit:** All files in `D:\c3000c\volunteering-rewards-app\app\` that use fetch with `?user_id=`

**Acceptance criteria:**
- No file in `app/` passes `user_id` as a query parameter
- All fetch calls include `Authorization: Bearer <token>` header
- All API paths match the backend contract (`/api/...`)
- `async function authFetch(path, options)` helper is created or reused across files to avoid duplication

**Files:** `home.tsx`, `events.tsx`, `profile.tsx`, `rewards.tsx`, `redeem-confirmation.tsx`, `my-coupons.tsx`, `ai-recommendations.tsx`, `hall-of-fame.tsx`

### Task 2: Commit & Push ALL Changes

1. `git add -A`
2. `git commit -m "Sprint 4: Fix mobile app auth — replace ?user_id= with JWT Bearer tokens"`
3. `git push origin main`

**Acceptance:** All changes pushed to `origin/main`.

### Task 3: Run Tests After Push

1. Restart backend: `cd backend && npm run dev`
2. Run unit tests: `cd backend && npm test`
3. Verify key APIs still work:
   - Admin login
   - Browse events
   - Leaderboard

**Acceptance:** All 11 unit tests pass.

---

## Context for All Tasks

### How to Run

```bash
# Terminal 1: Backend
cd D:\c3000c\volunteering-rewards-app\backend
npm run dev

# Terminal 2: Web portals
cd D:\c3000c\volunteering-rewards-app\frontend\web_portals
npm run dev

# Terminal 3: Mobile app
cd D:\c3000c\volunteering-rewards-app
npx expo start
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

### Auth Pattern (what backend expects)

```javascript
// Login stores token
const res = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
// data.token — store this

// All subsequent calls
const response = await fetch('http://localhost:3000/api/events', {
  headers: {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  },
});
// req.user = { id: decoded.id, role: decoded.role } — available in all controllers
```

### Web Portal Pattern (for reference)

```javascript
import { apiGet, apiPost, apiPut, apiDel } from '../../services/api';
const result = await apiGet('/admin/dashboard');
```

### Admin/Organiser/Merchant Pages (already wired)

All web portal pages in `frontend/web_portals/src/pages/` are already correctly wired to the live API using the `api.js` service which handles token injection and auto-refresh.

---

## Sprint Schedule Reference

| Sprint | Dates | Focus |
|--------|-------|-------|
| **Sprint 1** ✅ | 7–18 May | Foundation + Backend + Prototypes |
| **Sprint 2** ✅ | 18–25 May | Concentrated code generation |
| **Sprint 3** ✅ | 25 May – 15 Jun | Frontend completion + integration |
| **Sprint 4** | 15 Jun – 29 Jun | Testing & hardening (STARTING NOW) |
| **Sprint 5** | 29 Jun – 6 Jul | Deployment & delivery |

---

## Status Tracking

| Task | Status | Notes |
|------|--------|-------|
| T1: Fix mobile auth — home.tsx | ⬜ Pending | Replace `?user_id=` with JWT |
| T2: Fix mobile auth — events.tsx | ⬜ Pending | Replace `?user_id=` with JWT |
| T3: Fix mobile auth — profile.tsx | ⬜ Pending | Replace `?user_id=` with JWT |
| T4: Fix mobile auth — rewards.tsx | ⬜ Pending | Replace path + add auth |
| T5: Fix mobile auth — redeem-confirmation.tsx | ⬜ Pending | Fix path + add auth |
| T6: Fix mobile auth — my-coupons.tsx | ⬜ Pending | Fix path + add auth |
| T7: Fix mobile auth — ai-recommendations.tsx | ⬜ Pending | Check and fix |
| T8: Fix mobile auth — hall-of-fame.tsx | ⬜ Pending | Check and fix |
| T9: Commit & push all changes | ⬜ Pending | |
| T10: Run tests to verify | ⬜ Pending | 11/11 unit tests |

---

## Quick Reference

| Do | Don't |
|----|-------|
| Push changes to `origin/main` | Don't force push |
| Run `npm test` before pushing | Don't push broken code |
| Use `Authorization: Bearer` header | Don't use `?user_id=` query params |
| Call correct backend paths (`/api/me/coupons`, `/api/rewards`, etc.) | Don't use wrong paths like `/my-coupons`, `/profile`, `/coupons` |
| Extract token from AsyncStorage | Don't read user object without getting the token |
