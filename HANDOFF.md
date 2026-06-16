# Handoff: Fix Frontend "Failed to Fetch" Login Error

**Handoff ID:** HO-20260616-010
**Date:** 16 June 2026
**From:** Cowork (Xon)
**To:** Claude Desktop Code / Project
**Project:** Volunteering Rewards App (C3000C)
**Location:** `D:\c3000c\volunteering-rewards-app`
**Repo:** https://github.com/XonLoke/volunteering-rewards-app
**Owner:** Xon

---

## Session Context

The backend is fully deployed and working at `https://vol-rewards-api.onrender.com` (verified: health check 200, login returns JWT token).

The frontend is deployed at `https://webportals-lovat.vercel.app` but login shows **"Failed to fetch"** even though:

- The backend API is running and returns valid tokens (tested via curl)
- The latest JS build (`index-CUWb0Dlg.js`) contains the correct Render URL `vol-rewards-api.onrender.com`
- The `api.js` hardcodes the production URL as default

The "Failed to fetch" error in the browser suggests a **CORS issue** or a **network/fetch runtime error** — the API and frontend are on different domains.

---

## ✅ What's Already Done

### Backend (Render)
- API live at `https://vol-rewards-api.onrender.com`
- All 23 migrations run, seed data loaded
- Health check: ✅ 200 OK, `db_connected: true`
- Login via curl: ✅ Returns JWT token for carol@test.com
- `CORS_ORIGINS=*` in Render env vars

### Frontend (Vercel)
- Deployed at `https://webportals-lovat.vercel.app`
- `api.js` defaults to `'https://vol-rewards-api.onrender.com/api'`
- `vercel.json` has SPA rewrites configured
- Vite build passes with correct API URL baked in

---

## 🎯 Task: Diagnose & Fix "Failed to Fetch"

### Step 1 — Open Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Try logging in as carol@test.com / password123
4. Look at the failed network request:
   - What URL is it trying to reach? (should be `https://vol-rewards-api.onrender.com/api/auth/login`)
   - What is the exact error? (CORS? DNS? Timeout?)
   - What does the browser Console tab show?

### Step 2 — If CORS Issue
The backend has `CORS_ORIGINS=*` in Render env vars, but Render might not load it correctly. Check:
- Can you call the API directly from a different browser tab?
  `https://vol-rewards-api.onrender.com/api/health`
- If CORS is the issue, update `backend/src/middleware/errorHandler.middleware.js` or the CORS config in `backend/index.js` to explicitly allow the Vercel domain.

### Step 3 — If Mixed Content / HTTPS Issue
- Vercel is HTTPS, but the API might have mixed content issues
- Check if the API is accessible over HTTPS from the browser
- Test: `curl -v https://vol-rewards-api.onrender.com/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"carol@test.com","password":"password123"}'`

### Step 4 — Build a local test first
```bash
cd D:\c3000c\volunteering-rewards-app\frontend\web_portals
npm run build
npm run preview
```
Then test login at `http://localhost:4173/admin/login`. This isolates whether it's a build issue or a deployment issue.

### Step 5 — If needed, create a minimal test
Create a simple HTML page that calls the Render API directly to isolate the issue:
```html
<!DOCTYPE html>
<html><body>
<script>
fetch('https://vol-rewards-api.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email:'carol@test.com',password:'password123'})
}).then(r => r.text()).then(console.log).catch(console.error);
</script>
</body></html>
```

### Acceptance Criteria
- [ ] Login works at `https://webportals-lovat.vercel.app/admin/login`
- [ ] Redirects to Admin Dashboard after login
- [ ] No errors in browser Console or Network tabs

---

## Technical Context

### Current api.js (lines 1-4)
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'https://vol-rewards-api.onrender.com/api';
```

### Render CORS Config (backend/index.js)
```javascript
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : "*";
app.use(cors({ origin: corsOrigins, credentials: true }));
```

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Merchant | cheryl@test.com | password123 |
| Volunteer | alice@test.com | password123 |

### Vercel URL
`https://webportals-lovat.vercel.app`

### Render API
`https://vol-rewards-api.onrender.com`

---

## Status Tracking

| Task | Status | Notes |
|------|--------|-------|
| Backend API deployed | ✅ Done | Render + Neon, working |
| Frontend deployed | ✅ Done | Vercel, app loads |
| Login shows "Failed to fetch" | ❌ **Bug** | CORS or fetch issue |
| Diagnose exact error | ⬜ Pending | Open browser DevTools, check Network tab |
| Fix and verify | ⬜ Pending | |

---

## How to Use

1. Read this HANDOFF.md in full
2. Open browser DevTools on the Vercel URL to check the actual network error
3. Fix the cause (likely CORS or URL mismatch)
4. Commit and push the fix
5. Verify login works end-to-end
6. Update the Status Tracking table
7. Say "Frontend fetch handoff complete" when done
