# AI Generation Prompts v2 — Vertical Slices

> **Purpose:** Each team member uses these prompts with their AI tool to generate code for their assigned vertical slice.
> **Constraint:** All code must conform to the shapes in `API_CONTRACTS.md`. Do not deviate.
> **Process:** Generate → Self-review against contracts → Test locally → Submit PR with screenshots
> **Approach:** Incremental across sprints (not concentrated generation). Each sprint produces runnable, testable deliverables.
> **Reference:** See `Vertical Slice Technical Guide v2.md` for exact code patterns to follow.

---

## Overview: How Vertical Slices Work

Each person owns a **complete vertical slice** — backend (routes + controller + service) AND frontend screens for their features.

```
   Xon                    Vivian                 Grace                 Nurain
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Auth         │    │ Events       │    │ Rewards      │    │ Admin Events │
│ Login/R/Pro  │    │ Browse       │    │ Catalog      │    │ Rewards Conf │
│              │    │ Detail       │    │ Redeem       │    │              │
│ Web Admin*:  │    │ MyEvents     │    │ My Coupons   │    │ Organiser:   │
│  Dashboard   │    │ QR Scan      │    │              │    │  Dashboard   │
│  Users       │    │ Favorites    │    │ Web Merchant │    │  Events      │
│  Organisers  │    │              │    │  PIN Verify  │    │  Event-Edit  │
│  Login       │    │ Web Organiser│    │  History     │    │  Q&A         │
│              │    │  Roster      │    │              │    │              │
│ Shared Infra │    │  Feedback    │    │ Web Admin*:  │    │              │
│  Docker/CI   │    │  Scanning    │    │  Coupons     │    │              │
│  Middleware  │    │              │    │  Redemptions │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │                   │
       └───────────────────┴───────────────────┴───────────────────┘
                                      │
                             [ Shared Database ]
                             (PostgreSQL via Supabase)

  * = Pages redistributed from Nurain to balance workload across the team
```

**Integration rules (everyone must follow):**
1. **Your service, your tables** — query only the tables assigned to your slice
2. **Route files don't overlap** — no two people edit the same route file
3. **API contracts are frozen** — response shapes in `API_CONTRACTS.md` are the spec
4. **PR gates** — domain peer review + integration check + smoke test
5. **Weekly sync** — merge working code to `main` every Friday

---

## Xon — Auth Slice + Shared Infrastructure

### What's Already Done (Sprint 1)

| Component | Files | Status |
|-----------|-------|--------|
| Auth routes | `backend/src/routes/auth.routes.js` (32 lines) | ✅ Complete |
| Auth controller | `backend/src/controllers/auth.controller.js` (70 lines) | ✅ Complete |
| Auth service | `backend/src/services/auth.service.js` (273 lines) | ✅ Complete |
| JWT utils | `backend/src/utils/jwt.js` | ✅ Complete |
| Auth middleware | `backend/src/middleware/auth.middleware.js` | ✅ Complete |
| Role middleware | `backend/src/middleware/role.middleware.js` | ✅ Complete |
| Error handler | `backend/src/middleware/errorHandler.middleware.js` | ✅ Complete |
| Rate limiter | `backend/src/middleware/rateLimiter.middleware.js` | ✅ Complete |
| DB config | `backend/src/config/database.js` | ✅ Complete |
| DB migrations | `backend/migrations/` (12 files) | ✅ Complete |
| Seed script | `backend/src/utils/seed.js` | ✅ Complete |
| Login screen | `frontend/mobile_app/app/(auth)/login.tsx` (340 lines) | ✅ Complete |
| Register screen | `frontend/mobile_app/app/(auth)/register.tsx` (413 lines) | ✅ Complete |
| Profile screen | `frontend/mobile_app/app/(auth)/profile.tsx` (791 lines) | ✅ Complete |
| api.ts (mobile) | `frontend/mobile_app/src/services/api.ts` (77 lines) | ✅ Complete |
| Token storage | `frontend/mobile_app/src/services/storage.ts` (70 lines) | ✅ Complete |
| Docker config | `Dockerfile`, `docker-compose.yml` | ✅ Complete |
| CI/CD | `.github/workflows/ci.yml` | ✅ Complete |

### Context (feed to AI before prompting)

```
I am working on the Volunteering Rewards App capstone project. My slice is the auth system + shared infrastructure.

Tech stack: Node.js (Express), PostgreSQL via Supabase, JWT auth, bcrypt.

What already exists and is working:
- Express server in backend/index.js with full middleware stack (CORS, helmet, rate limiter, error handler, 404 handler)
- 12 database migrations in backend/migrations/ (roles, users, organisations, events, event_registrations, attendance_logs, event_feedback, event_qna, favorites, coupons, user_coupons, redemption_logs)
- auth.routes.js — POST /register, POST /login, POST /refresh, GET /profile, POST /logout
- auth.controller.js — register, login, refresh, getProfile, logout functions
- auth.service.js — full auth business logic with Joi validation, bcrypt hashing, JWT generation, refresh token rotation
- jwt.js — generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken
- auth.middleware.js — authenticate() verifies JWT, sets req.user
- role.middleware.js — roleGuard() and authorize() factories for role-based access
- errorHandler.middleware.js — global error handler + createError() helper
- rateLimiter.middleware.js — global + authStrict rate limiters
- database.js — PostgreSQL connection pool with health check
- migrationRunner.js — executes .sql files in order
- seed.js — seeds 3 roles, 3 test users, 1 organisation, 3 events, 3 coupons
- Dockerfile + docker-compose.yml (Node 20 + PostgreSQL 16)
- CI/CD workflow (.github/workflows/ci.yml)
- Mobile screens: Login, Register, Onboarding — all calling the auth API
- Mobile services: api.ts with get/post/put/del + auto token refresh, storage.ts with SecureStore
- Admin API endpoints exist but belong to Nurain (admin.routes, admin.controller)

I also need to build the Admin Web Portal (dashboard, users, organisers login).
These pages call Nurain's admin API endpoints. I do NOT build the admin API itself.

Code patterns I must follow (EXACTLY):
- Route files: const { Router } = require("express"); module.exports = router;
- Controllers: async function name(req, res, next) { try { ... } catch(err) { next(err) } }
- Services: const pool = require("../config/database"); await pool.query(...)
- Success response: { data: {...} } or { data: [...], total, page, limit, total_pages }
- Error response: next(createError(status, code, message))
```

### What's Still To Do

**Sprint 2 — Backend hardening + Admin portal start:**
- Add request body validation to all auth endpoints (most is already in auth.service.js)
- Verify all error edge cases return correct contract-compliant error shapes
- Add rate limit test: confirm authStrict (10 req/15min) is applied to login route
- **Build Admin Web Portal start pages: login, dashboard**

**Sprint 3 — Admin portal completion + testing:**
- **Build Admin Web Portal pages: users, organisers**
- Verify mobile auth screens properly connected to live API

**Sprint 4 — Testing + Security:**
- Unit + integration tests for auth flow
- Security audit (JWT secret strength, bcrypt cost factor)

### Prompts

**Prompt 1 — Auth API Body Validation & Error Handling**
```
Review and enhance the auth endpoints for edge case handling. Working with Express + Joi validation.

In backend/src/controllers/auth.controller.js and backend/src/services/auth.service.js:

1. Verify register validates: name (required, 2-100 chars), email (valid email format), password (min 8 chars, must contain uppercase + number), phone (optional, valid SG format)
2. Verify login errors for: wrong password, disabled account, nonexistent email
3. Verify refresh handles: expired token, tampered token, reuse detection (already consumed refresh token)
4. Add proper error codes matching API_CONTRACTS.md shapes

Error format: { error: { code: "validation_error", message: "..." } }
All errors go through next(createError(...)) pattern.
```

**Prompt 2 — Mobile Auth Screen API Integration Check**
```
Review these mobile app screens and ensure they properly connect to the backend API:

1. frontend/mobile_app/app/(auth)/login.tsx — Should POST /api/auth/login, store token via storage.ts
2. frontend/mobile_app/app/(auth)/register.tsx — Should POST /api/auth/register, auto-login on success
3. frontend/mobile_app/app/(auth)/profile.tsx — Should GET /api/auth/profile, display user data

The api.ts service handles token management:
- api.post<T>(path, body) — unauthenticated POST
- api.get<T>(path) — authenticated GET (attaches Bearer token)
- api.post<T>(path, body, true) — authenticated POST
- Auto-refreshes token on 401 response

Verify: loading states, error handling (network failure, validation errors shown inline), token expiry redirect to login.
```

**Prompt 3 — Admin Web Portal (Login + Dashboard)**
```
Build the Admin Web Portal login and dashboard pages for the Volunteering Rewards App.

Tech: HTML/CSS/JS (or React components) served by Express. Mobile-friendly responsive design.

Page 1 — frontend/web_portal/admin/login.html:
- Email + password form
- POST /api/auth/login on submit
- Store JWT in localStorage
- On success → redirect to dashboard.html
- Show inline validation errors
- "Remember me" checkbox

Page 2 — frontend/web_portal/admin/dashboard.html:
- Metric cards: total users, total organisers, pending approvals, total coupons issued today, total redemptions today
- Fetch from GET /api/admin/dashboard (this is Nurain's endpoint — just call it)
- Quick action buttons: "Manage Users", "Approve Organisers", "View Events"
- Sidebar navigation: Dashboard | Users | Organisers | Events | Coupons | Redemptions
- Top bar: page title, admin name, logout button
- Design: clean admin dashboard, cards with icons, responsive

API helper (include in every page):
  const apiGet = async (path) => {
    const token = localStorage.getItem("token");
    if (!token) { window.location = "/admin/login.html"; return; }
    const res = await fetch(path, { headers: { "Authorization": `Bearer ${token}` } });
    if (res.status === 401) { localStorage.removeItem("token"); window.location = "/admin/login.html"; }
    return res.json();
  };
  const apiPost = async (path, body) => { ... similar with POST method ... };
```

**Prompt 4 — Admin Web Portal (Users + Organisers)**
```
Build the Admin Users and Organisers management pages.

Page 3 — frontend/web_portal/admin/users.html:
- Search bar (searches by name/email) + role filter dropdown + status filter
- Table: name, email, role, status (active/disabled), points, actions
- Fetch from GET /api/admin/users?search=&role=&status=&page=1&limit=20
- Click row → expand inline detail (fetch GET /api/admin/users/:id)
- Detail shows: total events attended, total points earned/redeemed
- "Deactivate" button → DELETE /api/admin/users/:id
- Pagination controls at bottom

Page 4 — frontend/web_portal/admin/organisers.html:
- Table of organiser applications: org name, contact person, UEN, status, documents link
- Status badges: Pending (yellow), Approved (green), Rejected (red)
- Approve button → PUT /api/admin/organisers/:id/approve { status: "approved" }
- Reject button → modal with rejection reason field
- Refresh list after action
- Fetch from GET /api/admin/organisers?status=pending|approved|rejected

Design: Consistent sidebar + top bar from dashboard.html. Tables with striped rows.
```

---

## Vivian — Event Slice + QR Attendance Slice

### What Already Exists

| Component | Files | Status |
|-----------|-------|--------|
| Events routes | `backend/src/routes/events.routes.js` (40 lines) | ✅ Routes defined, needs service |
| Events controller | `backend/src/controllers/events.controller.js` (105 lines) | ✅ Partial implementation |
| Attendance routes | `backend/src/routes/attendance.routes.js` (21 lines) | ⚠️ Stub, needs full impl |
| Attendance controller | `backend/src/controllers/attendance.controller.js` (29 lines) | ⚠️ Stub, needs full impl |
| Favorites routes | `backend/src/routes/favorites.routes.js` (19 lines) | ⚠️ Stub, needs full impl |
| Events service | `backend/src/services/` | 🔲 Does not exist — create |
| Attendance service | `backend/src/services/` | 🔲 Does not exist — create |
| Favorites service | `backend/src/services/` | 🔲 Does not exist — create |
| Browse Events screen | `frontend/mobile_app/app/(tabs)/events.tsx` (581 lines) | ✅ Built, needs API connection |
| Event Detail screen | `frontend/mobile_app/app/(tabs)/events/[id].tsx` (613 lines) | ✅ Built, needs API connection |
| My Events screen | `frontend/mobile_app/app/(tabs)/events/my.tsx` (524 lines) | ✅ Built, needs API connection |
| Home screen | `frontend/mobile_app/app/(tabs)/home.tsx` (571 lines) | ✅ Built, needs API connection |
| QR Scanner (mobile) | 🔲 | Does not exist — build |
| **Organiser web: scanning** | 🔲 | Does not exist — build |
| **Organiser web: roster** | 🔲 | Does not exist — build |
| **Organiser web: feedback** | 🔲 | Does not exist — build |

### Context (feed to AI before prompting)

```
I am building the Event Management + QR Attendance slice of a Volunteering Rewards App.

Tech stack: Node.js (Express), PostgreSQL via Supabase, Expo (React Native) for mobile, React web portal.

What already exists (shared infrastructure set up by Xon):
- Express server with full middleware stack (CORS, helmet, rate limiter, auth, role guard, error handler)
- database.js — PostgreSQL connection pool, imported as: const pool = require("../config/database");
- 12 database migrations already applied (events, event_registrations, attendance_logs, event_feedback, event_qna, favorites, points_history tables exist)
- auth.middleware.js — authenticate() verifies JWT, sets req.user with { id, role }
- role.middleware.js — roleGuard(["volunteer"]), roleGuard(["organiser"])
- Rate limiter: 100 req/15min global
- Mobile api.ts — api.get<T>(path), api.post<T>(path, body), auto token refresh on 401
- Web api.js — apiGet(path, params), apiPost(path, body) with localStorage token

My route files (each person owns specific files — these are mine):
- backend/src/routes/events.routes.js
- backend/src/routes/attendance.routes.js
- backend/src/routes/favorites.routes.js

My controller files:
- backend/src/controllers/events.controller.js (partial — needs services wired in)
- backend/src/controllers/attendance.controller.js (stub)
- backend/src/controllers/favorites.controller.js (create if needed, or add to events)

I also need to build Organiser Web Portal pages (roster, feedback, scanning) — these are web UIs that call my own backend attendance/favorites endpoints.

Code patterns I must follow (EXACTLY):
- Route file: const { Router } = require("express"); const router = Router();
  const controller = require("../controllers/events.controller");
  const { authenticate } = require("../middleware/auth.middleware");
  const { roleGuard } = require("../middleware/role.middleware");
  const { requireVolunteer } = roleGuard(["volunteer"]);
  const { requireOrganiser } = roleGuard(["organiser"]);
  router.get("/", authenticate, requireVolunteer, controller.browse);
  module.exports = router;

- Controller: async function browse(req, res, next) { try { ... } catch(err) { next(err) } }

- Service: const pool = require("../config/database");
  async function findAll(query) {
    const result = await pool.query("SELECT * FROM events LIMIT $1", [limit]);
    return result.rows;
  }

- Success response (list): { data: [...], total: number, page: number, limit: number, total_pages: number }
- Success response (single): { data: { ... } }
- Error: next(createError(status, code, message))

- Route ordering: literal routes (like /today, /categories) before parameterised routes (/:id)

Relevant database tables (these are the ones MY service layer queries):
- events (id UUID, title, description, category, location, date_time, max_participants, points_awarded, status, image_url, organisation_id, created_at)
- event_registrations (id UUID, event_id UUID, user_id UUID, status, registered_at)
- attendance_logs (id UUID, event_id UUID, user_id UUID, scanned_by UUID, scanned_at, points_awarded)
- event_feedback (id UUID, event_id UUID, user_id UUID, rating INT, comment TEXT, created_at)
- event_qna (id UUID, event_id UUID, user_id UUID, question TEXT, answer TEXT, created_at)
- favorites (id UUID, user_id UUID, event_id UUID, created_at)
- event_categories (id, name)
- points_history (id, user_id, source, points, description, created_at)

The auth.service.js in backend/src/services/ shows the exact pattern for service files.
```

### Prompts

**Prompt 1 — Events Backend (Service + Controller Completion)**
```
Generate the event management backend service and wire it into the existing controller.

Create: backend/src/services/event.service.js
Functions needed:
  1. findAll(query) — Browse events with: ?search (title LIKE), ?category (filter), ?page, ?limit. Return { rows, total }. For volunteers, only show events where date >= today. Include spots_remaining (max_participants - COUNT registrations).
  2. findById(id, userId) — Full event detail. Include: organisation_name (JOIN organisations), is_registered (check event_registrations for this userId), is_favorited (check favorites for this userId), registered_count, checked_in_count.
  3. getCategories() — Return distinct categories from events table (or event_categories if it exists).
  4. registerForEvent(eventId, userId) — Validate: not already registered, event not full, event not past. Use transaction with SELECT ... FOR UPDATE. Insert into event_registrations.
  5. leaveEvent(eventId, userId) — Delete from event_registrations. Validate: is registered, event not past.
  6. submitFeedback(eventId, userId, rating, comment) — Insert into event_feedback. Validate: user is checked in, not already submitted.

Update: backend/src/controllers/events.controller.js
  - Wire each function to the matching endpoint
  - Browse: GET /api/events (authenticate, requireVolunteer)
  - Categories: GET /api/events/categories (authenticate)
  - Detail: GET /api/events/:id (authenticate)
  - Register: POST /api/events/:id/register (authenticate, requireVolunteer)
  - Leave: DELETE /api/events/:id/register (authenticate, requireVolunteer)
  - Feedback: POST /api/events/:id/feedback (authenticate, requireVolunteer)
  - Q&A list: GET /api/events/:id/qna (authenticate)
  - Post question: POST /api/events/:id/qna (authenticate, requireVolunteer)

Verify routes file has all routes in correct order (literal before parameterised).
```

**Prompt 2 — Attendance + Favorites Backend**
```
Generate the attendance and favorites backend services.

Create: backend/src/services/attendance.service.js
Functions:
  1. markAttendance(eventId, volunteerId, scannedBy) — Insert into attendance_logs. Validate: volunteer registered, not already checked in, event is today. Award points: UPDATE users SET points_balance = points_balance + $1. Use transaction.
  2. batchMarkAttendance(scans[]) — Array of {event_id, volunteer_id, scanned_at}. Process each, skip duplicates.
  3. getRoster(eventId) — Join event_registrations with users. Include is_checked_in status.

Update: backend/src/controllers/attendance.controller.js
  - POST /api/attendance/scan (authenticate, requireOrganiser)
  - POST /api/attendance/batch (authenticate, requireOrganiser)

Create: backend/src/services/favorites.service.js or add to events controller:
Functions:
  1. toggleFavorite(eventId, userId) — If exists, delete. Else insert. Return { event_id, is_favorited }.
  2. listFavorites(userId) — Return events user has favorited (JOIN events).
```

**Prompt 3 — QR Scanner Screen (Mobile App)**
```
Build a QR code scanner screen for the Expo mobile app. Already have:
- expo-camera installed (see app.json for permissions)
- api.ts service for API calls

Create: frontend/mobile_app/app/(tabs)/scanner.tsx
Features:
  - Camera view with QR scanning overlay (expo-camera CameraView with barcodeScannerSettings)
  - When QR detected, parse volunteer ID from format: "volunteer:{userId}"
  - POST /api/attendance/scan with { volunteer_id, event_id, scanned_at }
  - Show results: success (volunteer name + points) or error (reason)
  - Manual entry fallback: text input for volunteer ID
  - Event selector at top (dropdown of today's events)
  - Recent scans list at bottom
```

**Prompt 4 — Mobile Events API Connection**
```
Connect the existing mobile event screens to the live backend API.

Update files:
1. frontend/mobile_app/app/(tabs)/events.tsx — Fetch GET /api/events with search/category params. Fetch categories from GET /api/events/categories. Favorite toggle calls POST /api/favorites/:id.

2. frontend/mobile_app/app/(tabs)/events/[id].tsx — Fetch GET /api/events/:id. Join/Leave buttons call POST/DELETE /api/events/:id/register. Q&A: GET list + POST question.

3. frontend/mobile_app/app/(tabs)/events/my.tsx — Fetch my events with upcoming/past toggle. "Show QR" button navigates to QR display.

4. frontend/mobile_app/app/(tabs)/home.tsx — Fetch upcoming events for quick access. Show points summary.

Use api.ts pattern: api.get<T>(path), api.post<T>(path, body)
```

**Prompt 5 — Organiser Web Portal (Roster + Feedback)**
```
Build the Organiser Roster and Feedback pages for the web portal.

Tech: HTML/CSS/JS (or React components). These pages call the attendance and organiser backend endpoints.

Page 1 — frontend/web_portal/organiser/roster.html:
- Event selector dropdown (fetch GET /api/organiser/events)
- Table: volunteer name, email, phone, registration time, check-in status (checked in / not checked in)
- Status badges: green dot for checked in, gray dot for not checked in
- Fetch from GET /api/organiser/events/:id/roster
- Refresh button

Page 2 — frontend/web_portal/organiser/feedback.html:
- Event selector dropdown
- Average rating display (star rating visual, e.g., "4.2 / 5.0")
- Feedback list: volunteer name, rating stars, comment text, date
- Fetch from GET /api/organiser/events/:id/feedback
- Empty state: "No feedback yet" message

Both pages include a sidebar: Dashboard | Events | Roster | Scanning | Feedback | Q&A
Top bar with org name, logout button.
Mobile-responsive layout for on-site use.

API helper (include in each page):
  const apiGet = async (path) => {
    const token = localStorage.getItem("token");
    if (!token) { window.location = "/organiser/login.html"; return; }
    const res = await fetch(path, { headers: { "Authorization": `Bearer ${token}` } });
    if (res.status === 401) { localStorage.removeItem("token"); window.location = "/organiser/login.html"; }
    return res.json();
  };
```

---

## Grace — Rewards Slice + Merchant Slice

### What Already Exists

| Component | Files | Status |
|-----------|-------|--------|
| Rewards routes | `backend/src/routes/rewards.routes.js` (25 lines) | ⚠️ Stub, needs full impl |
| Rewards controller | `backend/src/controllers/rewards.controller.js` (37 lines) | ⚠️ Stub, needs full impl |
| Merchant routes | `backend/src/routes/merchant.routes.js` (27 lines) | ⚠️ Stub, needs full impl |
| Merchant controller | `backend/src/controllers/merchant.controller.js` (52 lines) | ⚠️ Stub, needs full impl |
| Rewards service | `backend/src/services/` | 🔲 Does not exist — create |
| Merchant service | `backend/src/services/` | 🔲 Does not exist — create |
| Rewards Catalog screen | `frontend/mobile_app/app/(tabs)/rewards.tsx` (1243 lines) | ✅ Built, needs API connection |
| Reward Detail screen | `frontend/mobile_app/app/(tabs)/rewards/[id].tsx` (819 lines) | ✅ Built, needs API connection |
| Merchant web portal | 🔲 | Does not exist — build |
| **Admin web: coupons page** | 🔲 | Does not exist — build |
| **Admin web: redemptions page** | 🔲 | Does not exist — build |
| My Coupons in profile | Already part of profile.tsx (791 lines) | ✅ Built |

### Context (feed to AI before prompting)

```
I am building the Rewards + Merchant slice of a Volunteering Rewards App.

Tech stack: Node.js (Express), PostgreSQL via Supabase, Expo (React Native) for mobile, React for web portal.

What already exists (shared infrastructure):
- Express server with full middleware stack
- database.js — PostgreSQL pool, imported as: const pool = require("../config/database");
- 12 database migrations already applied (coupons, user_coupons, redemption_logs, users tables exist)
- auth.middleware.js — authenticate() sets req.user
- role.middleware.js — roleGuard(), authorize()
- Mobile api.ts — api.get<T>(path), api.post<T>(path, body), auto token refresh
- Web api.js — apiGet(path, params), apiPost(path, body) with localStorage token

My route files (these are mine — no one else edits them):
- backend/src/routes/rewards.routes.js (volunteer-facing: browse, detail, redeem)
- backend/src/routes/merchant.routes.js (merchant-facing: verify, redeem, reverse, history)

My controller files (stubs exist, need completion):
- backend/src/controllers/rewards.controller.js
- backend/src/controllers/merchant.controller.js

I also need to build Admin Web Portal pages for coupon management and redemptions.
These call the admin API endpoints (admin.controller.js) which Nurain is building.
I do NOT build the admin API endpoints — only the frontend pages.

Code patterns I must follow (EXACTLY):
- Same as patterns in Vertical Slice Technical Guide v2.md Section 2
- Route guard order: authenticate, then role guard (requireVolunteer, requireMerchant, or authorize("merchant", "admin"))
- PIN endpoints mounted at /api/coupons in merchant.routes.js

Relevant database tables (MY service layer queries these):
- rewards (id UUID, title, description, image_url, type VARCHAR(20), points_cost INT, value_cents INT, quantity_total INT, quantity_remaining INT, valid_from TIMESTAMP, valid_until TIMESTAMP, is_active BOOLEAN, created_by UUID, created_at)
- user_coupons (id UUID, user_id UUID, reward_id UUID, pin_code VARCHAR(6), is_redeemed BOOLEAN, redeemed_at TIMESTAMP, redeemed_by UUID, valid_until TIMESTAMP, created_at)
- redemption_logs (id UUID, user_coupon_id UUID, merchant_id UUID, volunteer_id UUID, reversed_at TIMESTAMP, created_at)
- merchants (id UUID, user_id UUID, outlet_name, outlet_address, contact_number)
- users (id UUID, name, points_balance INT — READ + WRITE points_balance -= cost)

Key business logic:
- PIN generation: 6-digit numeric string, unique per reward
- Points deduction: UPDATE users SET points_balance = points_balance - $1 WHERE id = $2 AND points_balance >= $1 (atomic check)
- Coupon verify: Check PIN exists, not expired, not already redeemed
- Coupon reverse: Within 5-minute window only
```

### Prompts

**Prompt 1 — Rewards Backend (Service + Controller)**
```
Generate the rewards backend service and complete the controller.

Create: backend/src/services/reward.service.js
Functions:
  1. browseRewards(query) — Return active rewards (quantity_remaining > 0, not expired). Filter by ?type=online|in_store. Paginate.
  2. getRewardById(id) — Full reward detail + redemption count (COUNT user_coupons).
  3. redeemReward(rewardId, userId) — Transaction: check points, lock reward row, check quantity, generate 6-digit PIN, INSERT user_coupon, decrement quantity_remaining, deduct points. Return coupon with PIN.

Update: backend/src/controllers/rewards.controller.js
  - GET /api/rewards (authenticate, requireVolunteer)
  - GET /api/rewards/:id (authenticate, requireVolunteer)
  - POST /api/rewards/:id/redeem (authenticate, requireVolunteer)

Response format for redeem:
  { data: { coupon_id, pin_code, reward_title, points_cost, valid_until, points_remaining } }
```

**Prompt 2 — Merchant Backend (Service + Controller)**
```
Generate the merchant backend service and complete the controller.

Create: backend/src/services/merchant.service.js
Functions:
  1. verifyCoupon(pin, merchantId) — Join user_coupons with rewards. Check: PIN exists, not expired, not redeemed, quantity > 0.
  2. redeemCoupon(pin, merchantId) — Mark redeemed, INSERT redemption_log. Transaction.
  3. reverseCoupon(userCouponId, merchantId) — Check < 5 min window, undo redemption.
  4. getRedemptionHistory(merchantId) — Last 50 redemptions with can_reverse flag.

Update: backend/src/controllers/merchant.controller.js
  - POST /api/coupons/verify (authenticate, authorize("merchant", "admin"))
  - POST /api/coupons/redeem (authenticate, authorize("merchant", "admin"))
  - POST /api/coupons/reverse (authenticate, authorize("merchant", "admin"))
  - GET /api/merchant/history (authenticate, authorize("merchant", "admin"))

Error codes: 404 pin_not_found, 400 coupon_expired, 400 already_redeemed, 400 no_quantity
```

**Prompt 3 — Mobile Rewards Screen API Connection**
```
Connect the existing mobile rewards screens to the live backend API.

1. frontend/mobile_app/app/(tabs)/rewards.tsx (Rewards catalog, 1243 lines)
   Connect to: GET /api/rewards, GET /api/rewards?type=online|in_store, GET /api/me/points for balance

2. frontend/mobile_app/app/(tabs)/rewards/[id].tsx (Redeem screen, 819 lines)
   Connect to: GET /api/rewards/:id, POST /api/rewards/:id/redeem, display PIN code prominently

Use api.ts pattern: api.get<T>(path), api.post<T>(path, body)
```

**Prompt 4 — Merchant Web Portal**
```
Build the Merchant Redemption web portal.

Pages in frontend/web_portal/merchant/:

1. login.html — Merchant login. POST /api/auth/login. Store token.

2. pin-entry.html — 6-digit PIN input with auto-advance. POST /api/coupons/verify. Show result.

3. confirm-redeem.html — Green confirmation after verify. POST /api/coupons/redeem. "Process Next" button.

4. history.html — Last 50 redemptions table. Reverse button if within 5-min window. POST /api/coupons/reverse.

Design: Mobile-friendly. Brand color: #2a9d8f.
```

**Prompt 5 — Admin Web Portal (Coupons + Redemptions)**
```
Build the Admin Coupons and Redemptions pages for the admin web portal.
These call Nurain's admin API endpoints (GET/POST /api/admin/coupons, GET /api/admin/redemptions).

These pages share the same sidebar and topbar from the admin dashboard (built by Xon).

Page 1 — frontend/web_portal/admin/coupons.html:
- Table of coupon batches: type, points_cost, value_cents, quantity_total, quantity_used, valid_from, valid_until, status
- "Create Batch" button → modal form: coupon_type, points_cost, value_cents, quantity, valid_from, valid_until
- Fetch from GET /api/admin/coupons
- Create via POST /api/admin/coupons
- Status badges: active (green), expired (red)
- Delete button (only if no redemptions) → DELETE /api/admin/coupons/:id

Page 2 — frontend/web_portal/admin/redemptions.html:
- Redemption log table: coupon type, volunteer name, PIN (masked), date/time, status, merchant
- Date range filter (from/to)
- Fetch from GET /api/admin/redemptions?page=1&limit=20&from=&to=
- Status badges: redeemed (green), reversed (yellow)

API helper pattern (same as admin dashboard):
  const apiGet = async (path) => { ... with token from localStorage ... };
```

---

## Nurain — Admin / Organiser Slice

### What Already Exists

| Component | Files | Status |
|-----------|-------|--------|
| Admin routes | `backend/src/routes/admin.routes.js` (66 lines) | ⚠️ Needs service wiring |
| Admin controller | `backend/src/controllers/admin.controller.js` (134 lines) | ⚠️ Partial, needs service |
| Organiser routes | `backend/src/routes/organiser.routes.js` (39 lines) | ⚠️ Needs service wiring |
| Organiser controller | `backend/src/controllers/organiser.controller.js` (94 lines) | ⚠️ Partial, needs service |
| Me routes | `backend/src/routes/me.routes.js` (29 lines) | ⚠️ Needs service wiring |
| Me controller | `backend/src/controllers/me.controller.js` (58 lines) | ⚠️ Partial, needs service |
| Admin service | `backend/src/services/` | 🔲 Does not exist — create |
| Organiser service | `backend/src/services/` | 🔲 Does not exist — create |
| **Admin web: events page** | 🔲 | Does not exist — build |
| **Admin web: rewards config** | 🔲 | Does not exist — build |
| **Organiser web: dashboard** | 🔲 | Does not exist — build |
| **Organiser web: events** | 🔲 | Does not exist — build |
| **Organiser web: event-edit** | 🔲 | Does not exist — build |
| **Organiser web: Q&A** | 🔲 | Does not exist — build |
| **Organiser web: login** | 🔲 | Does not exist — build |

> Note: Several pages previously assigned to Nurain have been **redistributed** to balance workload:
> - Admin dashboard, users, organisers → **Xon** (builds frontend pages)
> - Admin coupons, redemptions → **Grace** (builds frontend pages, matches her rewards/merchant domain)
> - Organiser roster, feedback, scanning → **Vivian** (builds frontend pages, matches her attendance domain)

### Context (feed to AI before prompting)

```
I am building the Admin + Organiser slice of a Volunteering Rewards App.

Tech stack: Node.js (Express), PostgreSQL via Supabase, React web portal for admin/organiser interfaces.

What already exists (shared infrastructure):
- Express server with full middleware stack
- database.js — PostgreSQL pool, imported as: const pool = require("../config/database");
- 12 database migrations already applied (ALL tables exist)
- auth.middleware.js — authenticate() sets req.user
- role.middleware.js — requireAdmin, requireOrganiser, authorize()
- Mobile api.ts and web api.js exist for frontend API calls

My route files (these are mine — no one else edits them):
- backend/src/routes/admin.routes.js (admin-only: dashboard, users CRUD, organiser approval, coupon management, redemptions, rewards config)
- backend/src/routes/organiser.routes.js (organiser-only: dashboard, event CRUD, roster, feedback, Q&A)
- backend/src/routes/me.routes.js (volunteer-facing: my events, my QR, my points, my coupons, my favorites)

My controller files (stubs exist, need completion):
- backend/src/controllers/admin.controller.js (134 lines — partial)
- backend/src/controllers/organiser.controller.js (94 lines — partial)
- backend/src/controllers/me.controller.js (58 lines — partial)

I need to build TWO backend services, plus my web portal pages:
- Backend: admin.service.js + organiser.service.js + complete me.controller.js
- Web portal (organiser): dashboard, events list, event-edit, Q&A — 4 pages
- Web portal (admin): events participation, rewards config — 2 pages

Other team members are building the remaining web portal pages:
- Xon is building admin dashboard, users, organisers frontend pages
- Grace is building admin coupons, redemptions frontend pages
- Vivian is building organiser roster, feedback, scanning pages

Code patterns I must follow (EXACTLY):
- Same as patterns in Vertical Slice Technical Guide v2.md Section 2
- Admin routes: authenticate, then requireAdmin
- Organiser routes: authenticate, then requireOrganiser
- Me routes: authenticate only (no role guard — user sees their own data)

Relevant database tables (MY service layer queries these):
- users (id UUID, name, email, password_hash, role, points_balance, is_active, organisation_id)
- organisations (id UUID, name, description, uen, approval_status, created_by)
- events (READ: id, title, date_time, status, organisation_id)
- event_registrations (READ: id, event_id, user_id, status)
- attendance_logs (READ: id, event_id, user_id, scanned_at, points_awarded)
- event_feedback (READ: id, event_id, rating, comment)
- event_qna (READ: id, event_id, question, answer)
- coupons / user_coupons / redemption_logs / rewards (READ only)
```

### Prompts

**Prompt 1 — Admin Backend (Service + Controller Completion)**
```
Generate the admin backend service and wire into the existing controller.

Create: backend/src/services/admin.service.js
Functions:
  1. getDashboardStats() — Return: total_users, total_organisations, pending_approvals, total_coupons_issued_today, total_redemptions_today, users_growth_pct, coupons_growth_pct
  2. listUsers(query) — ?search, ?role, ?status, ?page, ?limit. Return { rows, total }
  3. getUserDetail(id) — Profile + total events attended + total points earned/redeemed
  4. updateUser(id, data) — Update name, role, is_active. Optional fields.
  5. deactivateUser(id) — Set is_active = false
  6. listOrganisers(query) — ?status=pending|approved|rejected filter with org info
  7. approveOrganiser(id, status, note) — Update approval_status
  8. listAllEvents(query) — ?status=upcoming|past, ?page, ?limit. Include organiser name.
  9. getEventParticipation(eventId) — Event detail + registered_count + checked_in_count + avg rating
  10. listCoupons(query) — ?status=active|expired, ?page, ?limit
  11. createCouponBatch(data) — Generate batch with quantity, points_cost, etc.
  12. listRedemptions(query) — ?page, ?limit, ?from, ?to

Update: backend/src/controllers/admin.controller.js
  Wire all endpoints:
  - GET /api/admin/dashboard, GET /api/admin/users, GET /api/admin/users/:id
  - PUT /api/admin/users/:id, DELETE /api/admin/users/:id
  - GET /api/admin/organisers, PUT /api/admin/organisers/:id/approve
  - GET /api/admin/events, GET /api/admin/events/:id/participation
  - GET/POST/PUT/DELETE /api/admin/coupons
  - GET /api/admin/redemptions
  - GET/PUT /api/admin/rewards/configuration
```

**Prompt 2 — Organiser Backend (Service + Controller Completion)**
```
Generate the organiser backend service and wire into the existing controller.

Create: backend/src/services/organiser.service.js
Functions:
  1. getDashboardStats(orgId) — Org info, total events, upcoming events, total checked-in, avg rating
  2. listMyEvents(orgId, query) — ?status, ?page, ?limit with registered/checked-in counts
  3. createEvent(data) — Insert into events with organisation_id
  4. getEventDetail(eventId, orgId) — Full event with stats. Verify ownership.
  5. updateEvent(eventId, orgId, data) — Verify ownership.
  6. deleteEvent(eventId, orgId) — Error if has registrations. Verify ownership.
  7. getRoster(eventId) — Volunteers with check-in status
  8. getFeedback(eventId) — Feedback with names and avg rating
  9. getQnA(eventId) — Q&A, unanswered first
  10. answerQuestion(qnaId, answer) — Update with answer

Update: backend/src/controllers/organiser.controller.js
  - Dashboard: GET /api/organiser/dashboard
  - Events CRUD: GET/POST /api/organiser/events, GET/PUT/DELETE /api/organiser/events/:id
  - Roster: GET /api/organiser/events/:id/roster
  - Feedback: GET /api/organiser/events/:id/feedback
  - Q&A: GET /api/organiser/events/:id/qna, POST /api/organiser/events/:id/qna/:qid/answer
```

**Prompt 3 — Me Backend (Controller Completion)**
```
Complete the "Me" endpoints for the authenticated user.

Update: backend/src/controllers/me.controller.js
Functions:
  1. getMyEvents(userId, query) — ?status=upcoming|past. Future events registered / past events checked in.
  2. getMyQRCode(userId) — Return { qr_data: "volunteer:" + userId, volunteer_id, volunteer_name, expires_at }
  3. getMyPoints(userId) — Balance = SUM earned - SUM redeemed. Return balance, total_earned, total_redeemed, history (paginated).
  4. getMyCoupons(userId, query) — ?status=active|used|expired. Join user_coupons with rewards.
  5. getMyFavorites(userId) — Return favorited events (JOIN events).
```

**Prompt 4 — Organiser Web Portal (Login + Dashboard + Events + Q&A)**
```
Build the Organiser Web Portal pages.

Tech: HTML/CSS/JS (or React). All pages share a sidebar: Dashboard | Events | Roster | Scanning | Feedback | Q&A.

Page 1 — frontend/web_portal/organiser/login.html:
- Email + password form. POST /api/auth/login. Store token. Redirect to dashboard.

Page 2 — frontend/web_portal/organiser/dashboard.html:
- Welcome with org name. Stats cards: total events, upcoming events, checked-in count, avg rating
- "New Event" quick action button
- Fetch GET /api/organiser/dashboard

Page 3 — frontend/web_portal/organiser/events.html:
- Table: title, date, status, registered/checked-in counts, actions
- "Create Event" button → event-edit page
- Click row → edit event
- Fetch GET /api/organiser/events

Page 4 — frontend/web_portal/organiser/event-edit.html:
- Create/edit form: title, description, date, time, location, points, capacity, what-to-bring, category
- POST /api/organiser/events (create) or PUT /api/organiser/events/:id (edit)

Page 5 — frontend/web_portal/organiser/qna.html:
- Event selector dropdown
- Unanswered questions at top (highlighted)
- Answered questions below
- "Answer" button → modal with textarea
- Fetch GET /api/organiser/events/:id/qna, answer via POST /api/organiser/events/:id/qna/:qid/answer

API helper pattern:
  const apiGet = async (path) => {
    const token = localStorage.getItem("token");
    if (!token) { window.location = "/organiser/login.html"; return; }
    const res = await fetch(path, { headers: { "Authorization": `Bearer ${token}` } });
    if (res.status === 401) { localStorage.removeItem("token"); window.location = "/organiser/login.html"; }
    return res.json();
  };

Design: Clean, functional. Mobile-responsive for on-site use at events.
```

**Prompt 5 — Admin Web Portal (Events + Rewards Config)**
```
Build the Admin Events Participation and Rewards Configuration pages.
These share the same sidebar from the admin dashboard (login, dashboard, users, organisers built by Xon; coupons, redemptions built by Grace).

Page 1 — frontend/web_portal/admin/events.html:
- Table: event title, organiser name, date, status
- Click row → expand participation detail modal
- Modal shows: registered_count, checked_in_count, average rating from feedback
- Fetch GET /api/admin/events, GET /api/admin/events/:id/participation

Page 2 — frontend/web_portal/admin/rewards-config.html:
- Configuration form: points per dollar, minimum redeem points, max daily redeem limit
- Fetch current config via GET /api/admin/rewards/configuration
- Save via PUT /api/admin/rewards/configuration
- Success toast notification

Sidebar: Dashboard | Users | Organisers | Events | Coupons | Redemptions | Rewards Config
```

---

## Quick Reference: Endpoints + Pages by Person

| Person | Backend API Endpoints | Frontend Pages |
|--------|----------------------|----------------|
| **Xon** | auth.routes (register, login, refresh, profile, logout) | Mobile: Login, Register, Profile. **Web Admin: login, dashboard, users, organisers** |
| **Vivian** | events.routes, attendance.routes, favorites.routes | Mobile: Browse Events, Event Detail, My Events, QR Scanner, Home. **Web Organiser: roster, feedback, scanning** |
| **Grace** | rewards.routes, merchant.routes | Mobile: Rewards Catalog, Reward Detail. Web Merchant: PIN verify, history. **Web Admin: coupons, redemptions** |
| **Nurain** | admin.routes, organiser.routes, me.routes | Web Admin: events participation, rewards config. Web Organiser: login, dashboard, events, event-edit, Q&A |

## Quick Reference: Database Table Ownership

| Table | Data Owner | Readable By |
|-------|-----------|-------------|
| roles, users, refresh_tokens | **Xon** | Everyone |
| events, event_registrations, attendance_logs, event_feedback, event_qna, favorites, event_categories | **Vivian** | Nurain (read), Grace (read users.points_balance) |
| coupons, user_coupons, redemption_logs, rewards, merchants | **Grace** | Nurain (read) |
| organisations | **Nurain** | Vivian (read for org_name on events) |

## Sprint 2 Focus (18 May – 1 Jun)

| Person | Sprint 2 Deliverables |
|--------|----------------------|
| **Xon** | Auth hardening (validation, rate limiting). Web Admin: login + dashboard pages. |
| **Vivian** | event.service.js + attendance.service.js + favorites.service.js. Connect mobile event screens to API. |
| **Grace** | reward.service.js + merchant.service.js. Connect mobile rewards screens to API. Start merchant web portal. |
| **Nurain** | admin.service.js + organiser.service.js. Complete admin + organiser controllers + me endpoints. Start organiser web portal. |

**Mid-sprint checkpoint (25 May):** Each person demos at least 2 working API endpoints with Postman screenshots.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 15 May 2026 | Original — WATD hybrid model with Member B/C/D roles and concentrated generation plan |
| v2 | 17 May 2026 | Complete rewrite — vertical slice allocation per Andy's mandate. Named owners, removed concentrated generation. |
| v3 | 17 May 2026 | Redistributed web portal workload: Xon gets admin dashboard/users/organisers, Vivian gets organiser roster/feedback, Grace gets admin coupons/redemptions. Nurain reduced from 19 to 7 pages. |
