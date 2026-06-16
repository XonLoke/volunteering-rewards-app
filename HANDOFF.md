# Handoff: Deploy Frontend Web Portal to Vercel

**Handoff ID:** HO-20260616-009
**Date:** 16 June 2026
**From:** Cowork (Xon)
**To:** Claude Desktop Code / Project
**Project:** Volunteering Rewards App (C3000C)
**Location:** `D:\c3000c\volunteering-rewards-app`
**Repo:** https://github.com/XonLoke/volunteering-rewards-app
**Owner:** Xon

---

## Session Context

The backend API is fully deployed and live at `https://vol-rewards-api.onrender.com`. All endpoints work (health, login, events, rewards, leaderboard). Now the frontend web portal needs to be deployed so the admin, organiser, merchant PWA, and scanner PWA can be accessed via a public URL.

The frontend is a React/Vite app at `frontend/web_portals/`. It uses `VITE_API_URL` env var to point to the backend API. Vercel is the recommended platform (free tier, no cold starts, global CDN).

---

## ✅ What's Already Done

- Backend deployed to Render: `https://vol-rewards-api.onrender.com`
- All API endpoints verified working (health, login for all 4 roles, events, rewards, leaderboard)
- `CORS_ORIGINS=*` — any frontend domain is allowed
- Frontend source code ready at `frontend/web_portals/`
- vite.config.js already configured with PWA support (vite-plugin-pwa)
- `api.js` reads `VITE_API_URL` env var (falls back to localhost for dev)

---

## 🎯 Task: Deploy Frontend to Vercel

**Duration:** ~10 minutes

### Step 1 — Go to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with **GitHub** (same account as Render)
3. Click **"Add New" → "Project"**
4. Find and import `XonLoke/volunteering-rewards-app`

### Step 2 — Configure Project

| Field | Value |
|-------|-------|
| **Framework Preset** | `Vite` (auto-detected) |
| **Root Directory** | `frontend/web_portals` (click edit → select from dropdown) |
| **Build Command** | `npm run build` (should auto-detect) |
| **Output Directory** | `dist` (should auto-detect) |

### Step 3 — Add Environment Variable

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://vol-rewards-api.onrender.com/api` |

### Step 4 — Deploy

Click **"Deploy"**. Wait ~1-2 minutes for the build.

Vercel will give you a URL like: `https://volunteering-rewards-app.vercel.app`

### Step 5 — Verify

Visit the Vercel URL in your browser. You should see the web portal login page.

Test:
1. Login as `carol@test.com` / `password123` → should redirect to Admin Dashboard
2. Login as `bob@test.com` / `password123` → should see Organiser Dashboard
3. Login as `cheryl@test.com` / `password123` → should see Merchant PIN page
4. Navigate to `/scan/events` → should show event selection for QR scanner

### Step 6 — Optional: Fix Workbox Cache URL

In `frontend/web_portals/vite.config.js`, line 38-40, the `runtimeCaching` URL pattern is hardcoded to `localhost:3000`. Update it to accept the Render URL:

```javascript
urlPattern: /^https?:\/\/.*\/api\/.*/i,
```

This ensures the PWA's service worker caches API responses properly in production. **But this is optional** — the app works without it, it just won't cache API responses in the PWA.

### Acceptance Criteria
- [ ] Frontend deployed at a public Vercel URL
- [ ] Admin login works against the live Render API
- [ ] Organiser portal accessible
- [ ] Merchant PIN page accessible
- [ ] Scanner event selection page accessible
- [ ] All API calls go to `https://vol-rewards-api.onrender.com/api/...`
- [ ] No CORS errors in browser console

---

## Technical Context

### Frontend API Config
```javascript
// frontend/web_portals/src/services/api.js (line 1)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

### Vite PWA Config
The vite.config.js already includes:
- `vite-plugin-pwa` with `registerType: 'autoUpdate'`
- Manifest for standalone install
- Workbox caching for static assets
- PWA icons at `frontend/web_portals/public/icon-192.png` and `icon-512.png`

### Portals Available
| Portal | Route | Login |
|--------|-------|-------|
| Admin | `/admin/login` → `/admin` | carol@test.com |
| Organiser | `/organiser` | bob@test.com / johnny@test.com |
| Merchant PWA | `/merchant` | cheryl@test.com |
| Scanner PWA | `/scan/events` | (uses organiser JWT) |

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Organiser 2 | johnny@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Merchant | cheryl@test.com | password123 |

### Commands (for local build verification)
```bash
# Build the frontend
cd D:\c3000c\volunteering-rewards-app\frontend\web_portals
npm run build

# Preview the build locally
npm run preview
```

---

## Status Tracking

| Task | Status | Notes |
|------|--------|-------|
| Backend deployed (Render) | ✅ Done | Live at `https://vol-rewards-api.onrender.com` |
| Frontend deploy to Vercel | 🔄 **Pending** | Follow steps above |
| Verify frontend works | ⬜ Pending | |
| Update HANDOFF.md | ⬜ Pending | When done |

---

## How to Use

1. Read this HANDOFF.md in full
2. Go to vercel.com and deploy the frontend
3. Verify all portals work against the live API
4. Update the Status Tracking table
5. Say "Frontend deployment handoff complete" when ready to hand back to Cowork
