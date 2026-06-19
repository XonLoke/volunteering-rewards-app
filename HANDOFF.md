# Handoff: Add Organiser Login Page & Verify Data Sharing

**Handoff ID:** HO-20260619-007
**Date:** 19 June 2026
**From:** Cowork (Xon)
**To:** Claude Desktop Code / Project
**Project:** Volunteering Rewards App (C3000C)
**Location:** `D:\c3000c\volunteering-rewards-app`
**Repo:** https://github.com/XonLoke/volunteering-rewards-app
**Owner:** Xon

---

## Session Context

The Organiser portal exists with all pages (Dashboard, Events, Roster, Feedback, Q&A, OnsiteController) but has **no login page**. Users visiting `/organiser` go straight to the Dashboard. There's no way to authenticate as an organiser.

Additionally, we need to verify and fix the data relationship between the Admin portal and Organiser portal — they should be working from the **same shared data** (same events, same users, same roster).

---

## ✅ What's Already Done

- Admin login at `/admin/login` — works, role-gated to admin only
- Merchant login at `/merchant` — works, role-gated to merchant only
- Scanner login at `/scan` — works, role-gated to organiser
- Organiser portal pages all exist (Dashboard, Events, EventCreate, EventEdit, Roster, Feedback, Q&A, OnsiteController)
- `frontend/web_portals/src/pages/admin/Login.jsx` — working example to replicate
- Organiser backend endpoints exist (organiser.routes.js, organiser.service.js)
- Events are stored in shared `events` table — same data source for Admin and Organiser

---

## 🎯 Task 1: Create Organiser Login Page

### What to build
Create a new login page at `frontend/web_portals/src/pages/organiser/Login.jsx` that authenticates organisers and redirects to `/organiser`.

### How to build
Copy the pattern from `AdminLogin.jsx` but change:

1. **File:** Create `frontend/web_portals/src/pages/organiser/Login.jsx`
2. **Role check:** Change `res.user?.role !== 'admin'` to `res.user?.role !== 'organiser'`
3. **Redirect:** Change `navigate('/admin')` to `navigate('/organiser')`
4. **Title:** Change "Admin Portal" to "Organiser Portal"
5. **Error message:** Update "admin users only" to "organiser users only"

### Wire it into the router
Edit `frontend/web_portals/src/App.jsx` to add the login route BEFORE the `/organiser` layout:

```javascript
// Add this import
import OrganiserLogin from './pages/organiser/Login';

// Add this route BEFORE the /organiser layout
{
  path: '/organiser/login',
  element: <OrganiserLogin />,
},
```

This way:
- `/organiser/login` → shows the login page
- `/organiser` → shows the Dashboard (after login)
- The `*` catch-all won't interfere because `/organiser/login` is an exact path

### Verify
- Visit `https://webportals-lovat.vercel.app/organiser/login` → should show login form
- Login with bob@test.com / password123 → should redirect to Organiser Dashboard
- Login with carol@test.com → should show "organiser users only" error

---

## 🎯 Task 2: Verify Organiser Data Sharing with Admin

The Admin and Organiser portals should read from the **same database tables**. Verify the following:

### Events
- Admin: `GET /api/admin/events` → lists all events
- Organiser: `GET /api/events` (via events.routes.js) → lists events
- Both query the `events` table — **are they seeing the same data?**
- If bob@test.com creates an event via `/organiser/event-create`, does carol@test.com see it in Admin?

### Users/Roster
- Admin: `GET /api/admin/users` → lists all users
- Organiser: `GET /api/organiser/events/:id/roster` → lists volunteers for an event
- Both query `users` + `event_registrations` tables — **same data source**

### Backend Verification
Check in the backend:

```bash
# Login as admin
curl -X POST https://vol-rewards-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}'
# Get token and call:
curl -H "Authorization: Bearer TOKEN" \
  https://vol-rewards-api.onrender.com/api/admin/events

# Login as organiser
curl -X POST https://vol-rewards-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@test.com","password":"password123"}'
# Get token and call:
curl -H "Authorization: Bearer TOKEN" \
  https://vol-rewards-api.onrender.com/api/events
```

Both should return the same events data.

### Fix if needed
If the Organiser events endpoint returns different/fewer results than Admin:
- Check if `events.routes.js` has a filter limiting to `organizer_id` (events owned by the logged-in user)
- Compare the SQL queries between `admin.service.js` listEvents and `events.service.js` browseEvents
- The organiser should see ALL events they can manage, not just their own

---

## Acceptance Criteria

- [ ] `/organiser/login` shows a login form
- [ ] bob@test.com can log in and access Organiser Dashboard
- [ ] carol@test.com is blocked from Organiser login ("organiser users only")
- [ ] Admin and Organiser see the same event data from the shared database
- [ ] Changes committed and pushed to GitHub
- [ ] Vercel auto-deploys the update

---

## Technical Context

### Admin Login (reference for Task 1)
```javascript
// frontend/web_portals/src/pages/admin/Login.jsx
const res = await apiLogin(email, password);
if (res.user?.role !== 'admin') {
  setError(`Access denied. This portal is for admin users only...`);
  return;
}
navigate('/admin');
```

### App.jsx Router (add organiser login route)
```javascript
// Current routes: /admin/login, /admin, /organiser, /scan, /merchant
// Need to add: /organiser/login before /organiser
```

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Merchant | cheryl@test.com | password123 |

### Commit Instructions
```bash
cd D:\c3000c\volunteering-rewards-app
git add frontend/web_portals/src/pages/organiser/Login.jsx
git add frontend/web_portals/src/App.jsx
git commit -m "feat: add organiser login page"
git push origin main
```

---

## Status Tracking

| Task | Status | Notes |
|------|--------|-------|
| Create OrganiserLogin.jsx | ✅ Done | Green-themed login, role check for 'organiser', redirects to /organiser |
| Add route to App.jsx | ✅ Done | `/organiser/login` route added before `/organiser` layout |
| Verify data sharing | ✅ Done | Both Admin and Organiser see same 6 events from shared events table |
| Commit and push | ✅ Done | `53baf3b` — pushed to GitHub, Vercel auto-deploys |
| Update HANDOFF.md | ✅ Done | Current state |
