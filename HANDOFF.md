# Handoff: Add Auth Redirect to Organiser Portal

**Handoff ID:** HO-20260619-008
**Date:** 19 June 2026
**From:** Cowork (Xon)
**To:** Claude Desktop Code / Project
**Project:** Volunteering Rewards App (C3000C)
**Location:** `D:\c3000c\volunteering-rewards-app`
**Repo:** https://github.com/XonLoke/volunteering-rewards-app
**Owner:** Xon

---

## Session Context

The Organiser login page was created at `/organiser/login`, but visiting `/organiser` directly still shows the Dashboard without requiring authentication. The OrganiserLayout has no auth guard.

**The fix:** Add a simple auth check to the `/organiser` route in `App.jsx` that redirects to `/organiser/login` if no token is found in `localStorage`.

---

## ✅ What's Already Done

- Organiser login page exists at `/organiser/login` — green-themed, role-gated to 'organiser'
- Route added to App.jsx before the `/organiser` layout

---

## 🎯 Task: Add Auth Redirect to `/organiser` Route

### Fix 1: Create a ProtectedRoute wrapper

Create `frontend/web_portals/src/components/ProtectedRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/organiser/login" replace />;
  }
  return children;
}
```

### Fix 2: Wrap the Organiser layout with it

In `frontend/web_portals/src/App.jsx`, wrap the `/organiser` route children:

```javascript
import ProtectedRoute from './components/ProtectedRoute';

// In the router config:
{
  path: '/organiser',
  element: (
    <ProtectedRoute>
      <OrganiserLayout />
    </ProtectedRoute>
  ),
  children: [ ... ],
},
```

Now visiting `/organiser` without being logged in will redirect to `/organiser/login`.

### Verify
- Open `https://webportals-lovat.vercel.app/organiser` in an incognito window (no token) → should redirect to `/organiser/login`
- Login as bob@test.com / password123 → should redirect to `/organiser`
- Login as carol@test.com → should show "organiser users only" error

---

## Acceptance Criteria

- [ ] `/organiser` redirects to `/organiser/login` when not authenticated
- [ ] bob@test.com can log in and access `/organiser`
- [ ] Changes committed and pushed

---

## Commit Instructions
```bash
cd D:\c3000c\volunteering-rewards-app
git add frontend/web_portals/src/components/ProtectedRoute.jsx
git add frontend/web_portals/src/App.jsx
git commit -m "fix: add auth redirect to organiser portal"
git push origin main
```
