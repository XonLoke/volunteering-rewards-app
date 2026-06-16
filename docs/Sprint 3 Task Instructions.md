# Sprint 3 Task Instructions — Frontend Completion + Integration

> **Period:** 1 Jun – 15 Jun 2026
> **Sprint Goal:** Wire remaining frontend screens to live backend. Complete end-to-end workflows. Fix bugs found during integration.

---

## 🔄 Sprint 3 Overview

Sprint 2 completed **all backend services** (8 service files, 45+ endpoints, 17 migrations). Sprint 3 is about **connecting everything** — making sure every button, screen, and flow works with real data from the database.

### Key Rules
1. **Do NOT modify API response shapes** without telling Xon first. The contracts in `API_CONTRACTS_v2.md` are frozen.
2. **Pull `main` before starting** each day to get the latest code from everyone.
3. **If you're stuck >1 hour**, ask for help — don't burn time.

---

## 👤 Xon — Admin Portal Hardening

### What's Already Done (Sprint 2 + early Sprint 3)
- ✅ Admin dashboard, users (sort/role/suspend/reset pw), organisers (list/approve/register)
- ✅ Merchants (register/edit/products/sourcing/create account)
- ✅ Coupons (create/batch PIN/view PINs)
- ✅ Events (list/expand/filter/clickable organiser)
- ✅ Redemptions (sortable/filterable/clickable user)
- ✅ QR Codes (participants count)
- ✅ Rewards Config (persistent save)
- ✅ PIN Verify removed from sidebar
- ✅ Organiser registration API (auto-creates user + org)
- ✅ Merchant register syncs name/phone/role to existing user
- ✅ Volunteer reg blocked for merchant emails
- ✅ Auto token refresh
- ✅ Reward config saves to DB (migration 017)

### Sprint 3 Tasks

| Task | Priority | Description |
|------|----------|-------------|
| Help blocked team members | High | Assist Vivian/Grace/Nurain with integration issues |
| Resolve cross-slice contract drift | Medium | Fix any API mismatches found during frontend wiring |
| Run data cleanup script | Low | `node scripts/reset_data.js` — cleans up test data for demo |
| Mobile app API verification | Low | Test that mobile app screens connect to backend correctly |

---

## 👤 Vivian — Mobile App & Events

### What's Already Done (Sprint 2)
- ✅ All 22 mobile app screens integrated
- ✅ `events.service.js` (browse, detail, register, unregister)
- ✅ `attendance.service.js` (scan, batch)
- ✅ `events.controller.js` wired to events service
- ✅ ThemeContext, shared components, API client

### Sprint 3 Tasks

| # | Task | Files to Modify | Description |
|---|------|----------------|-------------|
| 1 | **Wire mobile screens to live API** | `app/events.tsx`, `app/home.tsx`, `app/profile.tsx` | Replace hardcoded data with API calls. Use the existing `src/services/api.ts` client |
| 2 | **Wire rewards screens** | `app/rewards.tsx`, `app/coupon-detail.tsx`, `app/my-coupons.tsx` | Connect to `GET /api/rewards`, `POST /api/rewards/:id/redeem` |
| 3 | **Wire QR scan screen** | `app/scan.tsx`, `app/scan-success.tsx` | Connect camera scan to `POST /api/attendance/scan` |
| 4 | **Wire profile & points** | `app/profile.tsx`, `app/points-history.tsx` | Connect to `GET /api/me/points`, `GET /api/me/qr-code` |
| 5 | **Add statistics charts** | Organiser dashboard | Charts showing campaign data (total volunteers, events, completion rate) |
| 6 | **Test on both iOS & Android** | — | Run `npx expo start` and test on Expo Go on both platforms |

### API Endpoints to Use

| Screen | API Endpoint |
|--------|-------------|
| Home | `GET /api/events?page=1&limit=3` (upcoming preview) |
| Events list | `GET /api/events` with search, category, page params |
| Event detail | `GET /api/events/:id` |
| Join event | `POST /api/events/:id/register` |
| Leave event | `DELETE /api/events/:id/register` |
| Rewards list | `GET /api/rewards` |
| Reward detail | `GET /api/rewards/:id` |
| Redeem | `POST /api/rewards/:id/redeem` |
| My coupons | `GET /api/me/coupons` |
| My points | `GET /api/me/points` |
| My QR code | `GET /api/me/qr-code` |
| My events | `GET /api/me/events` |

### AI Prompt for Vivian

Copy and paste this into your AI tool:

```
I am wiring an Expo (React Native) mobile app to a live Express.js backend for a Volunteering Rewards App.

Backend API: http://localhost:3000/api

Auth: POST /api/auth/login returns { token, refresh_token }. Store token via storage.ts.

Use the existing API client (src/services/api.ts):
- api.get(path, params) for GET
- api.post(path, body) for POST  
- api.put(path, body) for PUT
- api.del(path) for DELETE

Screens to wire:
1. events.tsx → api.get('/events', { page, limit, search, category }) → { data: [...] }
2. events/[id].tsx → api.get('/events/'+id) → { data: {...} }
   Join: api.post('/events/'+id+'/register')
   Leave: api.del('/events/'+id+'/register')
3. rewards.tsx → api.get('/rewards') → { data: [...] }
4. rewards/[id].tsx → api.post('/rewards/'+id+'/redeem') → { data: { pin_code, ... } }
5. my-coupons.tsx → api.get('/me/coupons') → { data: [...] }
6. profile.tsx → api.get('/me/points') → { points_balance, history }
   api.get('/me/qr-code') → { qr_code }
7. scan.tsx → api.post('/attendance/scan', { event_id, qr_code_value })

Pattern: loading → error (with retry) → empty → render data. Use SafeAreaView, FlatList with keyExtractor. All screens have UI already built — only replace mock data.
```

---

## 👤 Grace — Merchant App & Rewards

### What's Already Done (Sprint 2)
- ✅ `merchant.service.js` (verify PIN, redeem, reverse, history)
- ✅ `rewards.service.js` (browse, detail, redeem)
- ✅ `merchant.controller.js` and `rewards.controller.js`
- ✅ `PinVerify.jsx` (833 lines — full PIN verification UI)
- ✅ `History.jsx` (544 lines — redemption history UI)

### Sprint 3 Tasks

| # | Task | Files | Description |
|---|------|-------|-------------|
| 1 | **Wire merchant PIN page to live API** | `pages/merchant/PinVerify.jsx` | Connect to `POST /api/coupons/verify`, `POST /api/coupons/redeem`, `POST /api/coupons/reverse` |
| 2 | **Wire merchant history page** | `pages/merchant/History.jsx` | Connect to `GET /api/merchant/history` |
| 3 | **Wire admin coupons page** | `pages/admin/Coupons.jsx` | Connect to GET/POST/PUT/DELETE `/api/admin/coupons` |
| 4 | **Wire admin redemptions page** | `pages/admin/Redemptions.jsx` | Connect to `GET /api/admin/redemptions` |
| 5 | **Wire rewards config page** | `pages/admin/RewardsConfig.jsx` | Connect to GET/PUT `/api/admin/rewards/configuration` |
| 6 | **Implement online vs in-store claim** | Rewards flow | Allow volunteer to choose online (display PIN) or in-store (QR code) when redeeming |
| 7 | **Merchant sponsorship model** | Rewards logic | Rewards should come from merchant products (linked via merchant_id) |

### API Endpoints to Use

| Page | API Endpoint |
|------|-------------|
| PIN Verify | `POST /api/coupons/verify`, `POST /api/coupons/redeem` |
| Reverse | `POST /api/coupons/reverse` |
| Merchant history | `GET /api/merchant/history` |
| Admin coupons | `GET/POST/PUT/DELETE /api/admin/coupons` |
| Admin redemptions | `GET /api/admin/redemptions` |
| Rewards config | `GET/PUT /api/admin/rewards/configuration` |

### AI Prompt for Grace

```
I am wiring a React (Vite) web app to a live Express.js backend for the Volunteering Rewards App cashier portal.

Backend API: http://localhost:3000/api

Auth: POST /api/auth/login (use apiLogin from src/services/api.js). Only merchant-role users can access the cashier portal.

Admin pages use apiGet, apiPost, apiPut, apiDel from src/services/api.js.

Pages to wire:
1. merchant/PinVerify.jsx:
   - Verify PIN: apiPost('/coupons/verify', { pin }) → { data: { user_coupon_id, title, points_required, volunteer_name, expiry_date } }
   - Redeem: apiPost('/coupons/redeem', { pin, userCouponId }) → { data: { ... } }
   - Reverse (5-min window): apiPost('/coupons/reverse', { pin, userCouponId }) → { message }
   - Already implemented with mock data — replace with real api calls

2. merchant/History.jsx:
   - Fetch: apiGet('/merchant/history') → { data: [...] }
   - Each row: user_name, coupon_title, points_required, redeemed_at, status

3. admin/Coupons.jsx:
   - List: apiGet('/admin/coupons') → { data: [...], total, page, limit }
   - Create: apiPost('/admin/coupons', { title, description, points_required, quantity, value_cents, expiry_date }) → { coupon, pins_generated }
   - Update: apiPut('/admin/coupons/'+id, data)
   - Delete: apiDel('/admin/coupons/'+id)
   - View PINs: apiGet('/admin/coupons/'+id+'/pins') → { data: [{ pin_code, status }] }

4. admin/Redemptions.jsx:
   - Fetch: apiGet('/admin/redemptions', { page, limit, from, to, sort, order }) → { data: [...], total }
   - Sortable columns: user_name, redeemed_at, coupon_title, points_spent, value_cents
   - User name is clickable (link to /admin/users)

5. admin/RewardsConfig.jsx:
   - Fetch: apiGet('/admin/rewards/configuration') → { points_per_dollar, min_redeem_points, max_redeem_per_day, default_event_points }
   - Save: apiPut('/admin/rewards/configuration', data) → { message, updated_at }
   - Already partially wired — ensure save actually persists
```

---

## 👤 Nurain — Organiser Portal & Volunteer Data

### What's Already Done (Sprint 2)
- ✅ `organiser.service.js` (dashboard, event CRUD, roster, feedback, Q&A answering)
- ✅ `me.service.js` (myEvents, myPoints, myCoupons, myQrCode, myFavorites)
- ✅ `organiser.controller.js` wired to service
- ✅ `me.controller.js` wired to service
- ✅ 7 organiser mobile screens integrated

### Sprint 3 Tasks

| # | Task | Files | Description |
|---|------|-------|-------------|
| 1 | **Wire organiser web dashboard** | `pages/organiser/Dashboard.jsx` | Connect to `GET /api/organiser/dashboard` |
| 2 | **Wire organiser events list** | `pages/organiser/Events.jsx` | Connect to `GET /api/organiser/events` |
| 3 | **Wire event create page** | `pages/organiser/EventCreate.jsx` | Connect to `POST /api/organiser/events` |
| 4 | **Wire event edit page** | `pages/organiser/EventEdit.jsx` | Connect to `PUT /api/organiser/events/:id` |
| 5 | **Wire organiser roster** | `pages/organiser/Roster.jsx` | Connect to `GET /api/organiser/events/:id/roster` |
| 6 | **Wire organiser feedback** | `pages/organiser/Feedback.jsx` | Connect to `GET /api/organiser/events/:id/feedback` |
| 7 | **Wire Q&A page** | `pages/organiser/Qna.jsx` | Connect to `GET /api/organiser/events/:id/qna`, `POST .../answer` |
| 8 | **Wire onsite controller** | `pages/organiser/OnsiteController.jsx` | Connect to `GET /api/events/today` + `POST /api/attendance/scan` |
| 9 | **Add document upload to registration** | Organiser register form | Allow organisers to upload official documents during registration |
| 10 | **Add pending approval status page** | New page | Show "Your account is pending approval" for newly registered organisers |
| 11 | **Wire event evaluation + assessment** | Feedback flow | Allow organisers to evaluate events and person-in-charge after completion |

### API Endpoints to Use

| Page | API Endpoint |
|------|-------------|
| Organiser dashboard | `GET /api/organiser/dashboard` |
| My events | `GET /api/organiser/events` |
| Create event | `POST /api/organiser/events` |
| Update event | `PUT /api/organiser/events/:id` |
| Delete event | `DELETE /api/organiser/events/:id` |
| Roster | `GET /api/organiser/events/:id/roster` |
| Feedback | `GET /api/organiser/events/:id/feedback` |
| Q&A | `GET /api/organiser/events/:id/qna` |
| Answer Q&A | `POST /api/organiser/events/:id/qna/:qid/answer` |
| Volunteer my events | `GET /api/me/events` |
| Volunteer my points | `GET /api/me/points` |
| Volunteer my coupons | `GET /api/me/coupons` |
| Volunteer my QR | `GET /api/me/qr-code` |
| Volunteer favorites | `GET /api/me/favorites` |

### AI Prompt for Nurain

```
I am wiring a React (Vite) web app to a live Express.js backend for the Volunteering Rewards App organiser portal.

Backend API: http://localhost:3000/api

Auth: POST /api/auth/login via apiLogin(). Organiser-role users can access the organiser portal.

All pages use: apiGet, apiPost, apiPut, apiDel from src/services/api.js.
Token auto-injected by api.js. On 401, auto-refresh kicks in.

Organiser pages to wire:
1. organiser/Dashboard.jsx:
   - Fetch: apiGet('/organiser/dashboard') → { stats: { total_events, total_volunteers, upcoming_events, average_feedback }, upcoming: [...] }
   - Show 4 stat cards + upcoming events list

2. organiser/Events.jsx:
   - Fetch: apiGet('/organiser/events', { page, limit, status }) → { data: [...], total, page, limit, total_pages }
   - Each row: title, date, volunteers count, status

3. organiser/EventCreate.jsx:
   - Create: apiPost('/organiser/events', { title, description, location, event_date, capacity, points_value, category })
   - On success, redirect to events list

4. organiser/EventEdit.jsx:
   - Fetch: apiGet('/organiser/events/'+id) → { data: {...} }
   - Update: apiPut('/organiser/events/'+id, data) → { data, message }
   - Delete: apiDel('/organiser/events/'+id) → { message }

5. organiser/Roster.jsx:
   - Fetch: apiGet('/organiser/events/'+id+'/roster') → { data: [{ id, name, email, status, check_in_time }] }
   - Show volunteer list with check-in status

6. organiser/Feedback.jsx:
   - Fetch: apiGet('/organiser/events/'+id+'/feedback') → { data: [{ id, rating, comment, volunteer_name, created_at }] }
   - Show ratings and comments

7. organiser/Qna.jsx:
   - Fetch: apiGet('/organiser/events/'+id+'/qna') → { data: [{ id, question, answer, asked_by, created_at }] }
   - Answer: apiPost('/organiser/events/'+id+'/qna/'+qid+'/answer', { answer }) → { data, message }

8. organiser/OnsiteController.jsx:
   - Today's events: apiGet('/events/today') → { data: [...] }
   - Scan: POST /api/attendance/scan via apiPost

Volunteer "Me" pages (for mobile app wiring):
1. my-events: apiGet('/me/events', { page }) → { data: [...] }
2. my-points: apiGet('/me/points') → { points_balance, history: [...] }
3. my-coupons: apiGet('/me/coupons') → { data: [{ id, title, pin_code, status, points_cost }] }
4. my-qr-code: apiGet('/me/qr-code') → { qr_code }
5. my-favorites: apiGet('/me/favorites') → { data: [...] }

Pattern for all pages:
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

useEffect(() => { fetchData(); }, []);

if (loading) return <p>Loading...</p>
if (error) return <div><p>Error: {error}</p><button onClick={fetchData}>Retry</button></div>
if (!data || data.length === 0) return <div><h2>No data</h2><p>...message...</p></div>
// render table/cards with data
```

---

## 🧪 End-to-End Test Plan

Before Sprint 3 ends, each team member must verify their workflows:

### Volunteer Flow (Vivian)
```
Register → Login → Browse Events → Join Event → View Profile (QR) →
Check in (scan QR) → Earn Points → View Points → Browse Rewards → Redeem → View PIN
```

### Organiser Flow (Nurain)
```
Login → Dashboard → Create Event → View Roster → Scan Volunteer QR →
View Feedback → Answer Q&A → Evaluate Event
```

### Admin Flow (Xon)
```
Login → Dashboard → Manage Users → Approve Organisers → Register Merchant →
Add Products → Create Coupons → View Redemptions → View Events
```

### Merchant Flow (Grace)
```
Login → Enter PIN → Verify → Confirm Redemption → View History
```

---

## 🗓️ Sprint 3 Milestones

| Date | Milestone |
|------|-----------|
| **1 Jun** | Sprint 3 kickoff |
| **8 Jun** | Mid-sprint check: each person demos 2 screens working with live API |
| **15 Jun** | Sprint 3 ends — all screens wired, workflows verified |

---

## 🐛 Known Issues to Watch For

| Issue | Affects | Status |
|-------|---------|--------|
| Reset script not working `(SASL password)` | Data cleanup | Need to run via API instead |
| Duplicate test users (Diana/Diana2) | Users list | Can delete from admin panel |
| Mobile app not tested | Vivian | Needs Expo Go on phone |
| Organiser mobile screens UI-only | Nurain | Wire API calls |
| Feedback table name mismatch | Organiser | Uses `event_feedback` not `feedback` |
