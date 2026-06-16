# Vertical Slice Technical Guide v4

> **Purpose:** Give every team member the exact patterns, file paths, and AI prompts needed to generate code that snaps into our existing framework — so all four slices integrate cleanly.
>
> **Project:** Volunteering Rewards App
> **Updated:** Sprint 2 — 21 May 2026

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1 | 16 May 2026 | Xon | Initial guide — architecture overview, patterns, slice assignments, prompts, guardrails |
| v2 | 16 May 2026 | Xon | Added Section 4 explaining why shared prompts are necessary |
| v3 | 17 May 2026 | Xon | Redistributed web portal workload. Updated Section 1, 3, and 5. |
| v4 | 21 May 2026 | Xon | **Sprint 2 updates:** Events & rewards routes wired. Admin login page built. CI/CD active. Docker multi-stage. Auth-08 (registerOrganiser) implemented. 13 migrations. Admin portal is now React + Vite (not HTML). |

---

## 1. Architecture Overview (Everyone Must Know)

```
volunteering-rewards-app/
├── backend/                          # Express.js API server (port 3000)
│   ├── index.js                      # Entry point — mounts all 9 route groups
│   ├── .env                          # DB_HOST, JWT secrets, etc.
│   ├── .env.example                  # Template with all config keys
│   ├── package.json                  # Scripts: start, dev, migrate, seed, test
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # PostgreSQL pool (shared)
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # authenticate() — JWT verification
│   │   │   ├── role.middleware.js    # roleGuard(), authorize() — role checks
│   │   │   ├── errorHandler.middleware.js  # Global error handler
│   │   │   └── rateLimiter.middleware.js   # Rate limiting (3 tiers)
│   │   ├── routes/                   # Your slice's routes go here
│   │   ├── controllers/              # Your slice's controllers go here
│   │   ├── services/                 # Your slice's business logic goes here
│   │   │   └── auth.service.js       # ✅ Fully implemented (register, login, refresh, registerOrganiser)
│   │   ├── utils/
│   │   │   ├── jwt.js                # JWT sign/verify utilities
│   │   │   ├── migrationRunner.js    # Runs all 13 migration files
│   │   │   └── seed.js               # Seeds test data (3 users, 3 events, 3 coupons)
│   │   └── migrations/               # Database schema (13 files — 001 to 013)
│   └── package-lock.json
├── frontend/
│   ├── mobile_app/                   # Expo (React Native) — Vivian
│   │   ├── app/
│   │   │   ├── (auth)/               # Login, Register, Onboarding
│   │   │   ├── (tabs)/               # Home, Events, Rewards, Profile
│   │   │   └── index.tsx
│   │   └── src/
│   │       ├── components/           # Shared UI components
│   │       ├── services/
│   │       │   └── api.ts            # api.get / api.post / etc.
│   │       └── theme.ts
│   └── web_portals/                  # React + Vite — all members (port 5173)
│       └── src/
│           ├── App.jsx               # Router for all 4 portals (admin, organiser, merchant, scan)
│           ├── pages/
│           │   ├── admin/            # 12 pages: Login, Dashboard, Users, Organisers, Events, Coupons, ...
│           │   ├── organiser/        # 8 pages: Dashboard, Events, EventCreate, EventEdit, ...
│           │   ├── merchant/         # 3 pages: Login, PinVerify, History
│           │   └── scan/             # 4 pages: Login, EventSelect, Scanner, Roster
│           ├── layouts/              # AdminLayout, OrganiserLayout, MerchantLayout, ScanLayout
│           ├── components/           # Sidebar, Topbar, DataTable, Modal, StatusBadge, Toast
│           └── services/
│               └── api.js            # apiGet / apiPost / apiPut / apiDel / apiLogin
├── .github/workflows/
│   └── ci.yml                        # CI/CD: Lint → Test (migrate+seed) → Deploy
├── Dockerfile                        # Multi-stage build, non-root user, healthcheck
└── docker-compose.yml                # App + PostgreSQL 16 stack
```

### How API Calls Flow

```
[Mobile/Web App]
    ↓  fetch() or api.get('/events')
[Express Router]  →  routes/*.routes.js
    ↓  (authenticate, authorize)
[Controller]  →  controllers/*.controller.js
    ↓  (parses request, calls service)
[Service / DB]  →  services/*.service.js  or  pg.query()
    ↓
[JSON Response]  →  res.json({ data: [...] })
```

### Mounted Routes (from `backend/index.js`)

| Path | File | Owner | Status |
|------|------|-------|--------|
| `/api/auth` | `auth.routes.js` | Xon | ✅ Implemented (incl. registerOrganiser) |
| `/api/events` | `events.routes.js` | Vivian | ✅ Wired (12 endpoints with per-route role guards) |
| `/api/attendance` | `attendance.routes.js` | Vivian | ⏳ Service pending |
| `/api/me` | `me.routes.js` | Nurain | ⏳ Service pending |
| `/api/favorites` | `favorites.routes.js` | Vivian | ⏳ Service pending |
| `/api/rewards` | `rewards.routes.js` | Grace | ✅ Wired (3 endpoints) |
| `/api/organiser` | `organiser.routes.js` | Nurain | ⏳ Service pending |
| `/api/admin` | `admin.routes.js` | Nurain | ⏳ Service pending |
| `/api` (merchant/coupons) | `merchant.routes.js` | Grace | ⏳ Service pending |

---

## 2. Backend Pattern Reference (Copy These Exactly)

### Pattern A: Route File

Every route file must follow this exact structure:

```js
// File: backend/src/routes/your-slice.routes.js

const { Router } = require("express");
const router = Router();
const controller = require("../controllers/your-slice.controller");

// Auth middleware — import what you need
const { authenticate } = require("../middleware/auth.middleware");
const { roleGuard, authorize } = require("../middleware/role.middleware");

// Named role guards (single role)
const { requireVolunteer } = roleGuard(["volunteer"]);
const { requireOrganiser } = roleGuard(["organiser"]);
const { requireAdmin } = roleGuard(["admin"]);
const { requireMerchant } = roleGuard(["merchant"]);

// Multi-role guard (use authorize directly)
const requireMerchantOrAdmin = authorize("merchant", "admin");

// ─── Routes ──────────────────────────────────────────
router.get("/",              authenticate, requireVolunteer, controller.browse);
router.get("/:id",           authenticate, requireVolunteer, controller.detail);
router.post("/",             authenticate, requireOrganiser, controller.create);
router.post("/:id/action",   authenticate, requireVolunteer, controller.action);

module.exports = router;
```

**Critical rules:**
- Always put parameterised routes (`/:id`) AFTER literal routes (`/today`, `/categories`)
- Use `authenticate` before role guards (order matters)
- Export only `router` — nothing else
- For routes serving multiple roles (e.g., events serving both volunteer + organiser), use per-route `authorize()` instead of blanket `router.use()`

### Pattern B: Controller File

```js
// File: backend/src/controllers/your-slice.controller.js

const yourService = require("../services/your-slice.service");

// ─── GET /api/your-slice ─────────────────────────────
async function browse(req, res, next) {
  try {
    const result = await yourService.findAll(req.query);
    res.json({
      data: result.rows,
      total: result.total,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      total_pages: Math.ceil(result.total / (parseInt(req.query.limit) || 20)),
    });
  } catch (err) { next(err); }
}

// ─── GET /api/your-slice/:id ─────────────────────────
async function detail(req, res, next) {
  try {
    const item = await yourService.findById(req.params.id);
    if (!item) return next(createError(404, "not_found", "Resource not found"));
    res.json({ data: item });
  } catch (err) { next(err); }
}

// ─── POST /api/your-slice ────────────────────────────
async function create(req, res, next) {
  try {
    const item = await yourService.create(req.body, req.user.id);
    res.status(201).json({ data: item, message: "Created successfully." });
  } catch (err) { next(err); }
}

module.exports = { browse, detail, create };
```

### Pattern C: Service File

Business logic goes in a service layer, not in controllers:

```js
// File: backend/src/services/your-slice.service.js

const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

// ─── Find all with pagination ─────────────────────────
async function findAll(query = {}) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    "SELECT * FROM your_table ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  const countResult = await pool.query("SELECT COUNT(*) FROM your_table");

  return {
    rows: result.rows,
    total: parseInt(countResult.rows[0].count),
    page, limit,
    total_pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
}

module.exports = { findAll, findById, create };
```

**Important:** The database config is at `../config/database` (not `../config/db`). Use `const { pool } = require("../config/database")`.

### Pattern D: Using the Error Helper

```js
const { createError } = require("../middleware/errorHandler.middleware");
throw createError(400, "validation_error", "Human-readable message", details);
throw createError(404, "not_found", "Event not found.");
throw createError(409, "already_registered", "You are already registered for this event.");
```

### Pattern E: Error Response Format

```json
// Success
{ "data": { ... } }
{ "data": [ ... ], "total": 10, "page": 1, "limit": 20, "total_pages": 1 }

// Error
{ "error": { "code": "not_found", "message": "Event not found" } }
```

### Pattern F: Required Error Codes

All services should use these consistent error codes:

| Code | HTTP Status | When to use |
|------|------------|-------------|
| `not_found` | 404 | Resource not found |
| `already_registered` | 409 | User already joined event |
| `event_full` | 409 | Event at capacity |
| `insufficient_points` | 403 | Not enough points |
| `out_of_stock` | 409 | Coupon fully claimed |
| `invalid_pin` | 400 | Wrong 6-digit PIN |
| `already_redeemed` | 409 | Coupon already used |
| `too_late` | 400 | Outside 5-min reversal window |
| `validation_error` | 400 | Invalid input |

---

## 3. Slice Assignments — Sprint 2 Status

### Xon — Auth Slice + Shared Infrastructure

| Component | Files | Status |
|-----------|-------|--------|
| Auth routes | `backend/src/routes/auth.routes.js` | ✅ Implemented (incl. registerOrganiser) |
| Auth controller | `backend/src/controllers/auth.controller.js` | ✅ Implemented |
| Auth service | `backend/src/services/auth.service.js` | ✅ Implemented (register, login, refresh, registerOrganiser, profile) |
| Auth middleware | `backend/src/middleware/auth.middleware.js` | ✅ Built |
| Role middleware | `backend/src/middleware/role.middleware.js` | ✅ Built |
| Error handler | `backend/src/middleware/errorHandler.middleware.js` | ✅ Built |
| Rate limiter | `backend/src/middleware/rateLimiter.middleware.js` | ✅ Built (3 tiers: 100/15min, 10/1min, 5/1min) |
| Mobile auth screens | `frontend/mobile_app/app/(auth)/*` | ✅ Built by Vivian |
| Admin login (React) | `web_portals/src/pages/admin/Login.jsx` | ✅ Built (role gated) |
| Admin dashboard | `web_portals/src/pages/admin/Dashboard.jsx` | ✅ Wired to API |
| Admin users page | `web_portals/src/pages/admin/Users.jsx` | ✅ Wired to API |
| Admin organisers | `web_portals/src/pages/admin/Organisers.jsx` | ✅ Wired to API |
| CI/CD pipeline | `.github/workflows/ci.yml` | ✅ Active (Lint → Test → Deploy) |
| Docker config | `Dockerfile`, `docker-compose.yml` | ✅ Multi-stage, non-root user, healthcheck |
| .env.example | `backend/.env.example` | ✅ CORS origins, file uploads, usage guide |

### Vivian — Event Slice + QR Attendance Slice

**Routes status:**

| File | Endpoints | Role guard | Status |
|------|-----------|------------|--------|
| `events.routes.js` | Browse, categories, detail, register, leave, feedback, Q&A, today, roster, stats | volunteer, organiser | ✅ Wired with per-route guards |
| `attendance.routes.js` | Mark scan, batch sync | organiser | ⏳ Service pending |
| `favorites.routes.js` | Toggle, list | volunteer | ⏳ Service pending |

**Controllers status:**

| Controller | Endpoint functions | Status |
|------------|-------------------|--------|
| `events.controller.js` | browse, categories, detail, join, leave, feedback, viewQna, askQuestion, roster, stats, today | ✅ Wired (returns contract-shaped stubs) |
| `attendance.controller.js` | scan, batchSync | ⏳ Stub |
| `favorites.controller.js` | toggle, list | ⏳ Stub |

**Services to create:**
- `backend/src/services/events.service.js` — real DB queries (replace stubs)
- `backend/src/services/attendance.service.js` — QR scan, batch sync, point awarding
- `backend/src/services/favorites.service.js` — toggle favorite, list

**Frontend screens to connect (mobile):**
- `app/(tabs)/events.tsx` → Browse events list
- `app/(tabs)/events/[id].tsx` → Event detail
- `app/(tabs)/events/my.tsx` → My events

**Frontend pages (web):**
- `web_portals/src/pages/organiser/Roster.jsx` → Event roster
- `web_portals/src/pages/organiser/Feedback.jsx` → Feedback view
- `web_portals/src/pages/organiser/OnsiteController.jsx` → QR scanning
- `web_portals/src/pages/scan/Scanner.jsx` → Camera QR scanner

### Grace — Rewards Slice + Merchant Slice

**Routes status:**

| File | Endpoints | Role guard | Status |
|------|-----------|------------|--------|
| `rewards.routes.js` | Browse, detail, redeem | volunteer | ✅ Wired |
| `merchant.routes.js` | Coupon verify, redeem, reverse, history | merchant, admin | ⏳ Service pending |

**Controllers status:**

| Controller | Endpoint functions | Status |
|------------|-------------------|--------|
| `rewards.controller.js` | browse, detail, redeem | ✅ Wired (returns contract-shaped stubs) |
| `merchant.controller.js` | verify, redeem, reverse, history | ⏳ Stub |

**Services to create:**
- `backend/src/services/rewards.service.js` — browse, detail, redeem with PIN generation
- `backend/src/services/merchant.service.js` — verify PIN, redeem, reverse (5-min), history

**Frontend screens to connect (mobile):**
- `app/(tabs)/rewards.tsx` → Rewards catalog
- `app/(tabs)/rewards/[id].tsx` → Reward detail / redeem

**Frontend pages (web):**
- `web_portals/src/pages/merchant/PinVerify.jsx` → PIN entry + verify
- `web_portals/src/pages/merchant/History.jsx` → Redemption history
- `web_portals/src/pages/admin/Coupons.jsx` → Admin coupon management
- `web_portals/src/pages/admin/Redemptions.jsx` → Admin redemptions log
- `web_portals/src/pages/admin/RewardsConfig.jsx` → Points configuration

### Nurain — Admin/Organiser Slice

**Routes status:**

| File | Endpoints | Role guard | Status |
|------|-----------|------------|--------|
| `admin.routes.js` | Dashboard, user mgmt, organiser approval, events, participation | admin | ⏳ Service pending |
| `organiser.routes.js` | Dashboard, event CRUD, feedback, Q&A, roster | organiser | ⏳ Service pending |
| `me.routes.js` | My events, points, coupons, QR code, favorites | volunteer | ⏳ Service pending |

**Controllers status:**

| Controller | Endpoint functions | Status |
|------------|-------------------|--------|
| `admin.controller.js` | dashboard, users list/detail, organisers approve/reject, events, participation | ⏳ Stub |
| `organiser.controller.js` | dashboard, event CRUD, roster, feedback, Q&A | ⏳ Stub |
| `me.controller.js` | events, points, coupons, qrCode, favorites | ⏳ Stub |

**Services to create:**
- `backend/src/services/admin.service.js` — dashboard stats, user queries, organiser approval
- `backend/src/services/organiser.service.js` — event management, roster, feedback, Q&A
- `backend/src/services/me.service.js` — volunteer's own data queries

**Frontend pages (React, all wired to router):**
- `web_portals/src/pages/admin/Dashboard.jsx` → Admin dashboard
- `web_portals/src/pages/admin/Users.jsx` → User management
- `web_portals/src/pages/admin/Organisers.jsx` → Organiser approval
- `web_portals/src/pages/admin/Events.jsx` → Events overview
- `web_portals/src/pages/admin/QRCodes.jsx` → QR generation
- `web_portals/src/pages/organiser/Dashboard.jsx` → Organiser dashboard
- `web_portals/src/pages/organiser/Events.jsx` → My events list
- `web_portals/src/pages/organiser/EventCreate.jsx` → Create event
- `web_portals/src/pages/organiser/EventEdit.jsx` → Edit event
- `web_portals/src/pages/organiser/Qna.jsx` → Q&A management

---

## 4. Why These Prompts Are Necessary

You might wonder why you can't just write your own prompt. Here's why these are pre-built for you.

**Problem: AI tools don't know our project.**

If you tell your AI "write me an events API," it will generate something completely different from what I told mine. Even small differences accumulate into big integration problems:

| If your AI does this | And another's does that | Result at merge time |
|----------------------|------------------------|---------------------|
| `res.json({ events: [...] })` | `res.json({ data: [...] })` | Frontend renders undefined |
| `router.get("/events", ...)` | `router.get("/api/events", ...)` | Route not found (404) |
| Throws errors directly | Calls `next(err)` | Server crashes, no error response |
| `db.query("SELECT * FROM events")` | `pool.query("SELECT * FROM events")` | ReferenceError on startup |
| Uses `requireAdmin` | Uses `authorize("admin")` | Middleware mismatch |

Each difference looks harmless in isolation. Twelve of them across four codebases produce a system that never compiles, never starts, and nobody can debug because everyone used different conventions.

**These prompts solve that by embedding the project's patterns into the AI's instructions.**

> Think of the prompt as a shared DNA strand. Every person's AI reads the same strand and produces code that looks like it was written by one developer — even though four people wrote it independently.

**What each prompt enforces:**

| What | Why it matters |
|------|---------------|
| Correct import paths (`../middleware/auth.middleware`) | Server starts without crashing |
| Correct response format (`{ data: [...] }`) | Frontend renders data correctly |
| Correct error handling (`next(err)`) | Errors return proper JSON, not HTML stack traces |
| Correct route guard syntax (`requireVolunteer`) | Auth works consistently across all slices |
| Correct response status codes (`res.status(201)`) | Frontend error handling triggers correctly |
| Reference to the right database tables | Queries don't fail on missing columns |
| Reference to frozen API contracts | Endpoints return what the frontend expects |
| Use of `../config/database` not `../config/db` | Import path must match actual file name |

**One more thing — these prompts keep working when you switch AIs.** Whether you use Claude, ChatGPT, or Gemini, the prompt anchors the output to our project's patterns instead of the AI's generic defaults.

---

## 5. AI Prompts Per Person

Copy your slice's prompt, replace the specific feature details, and paste into your AI tool.

### Vivian's Prompt (Event + QR Attendance)

> I am building an Express.js backend for an event management + QR attendance feature in a Volunteering Rewards App. The backend uses PostgreSQL.
>
> **Existing patterns I must follow (EXACTLY):**
>
> Route file pattern:
> ```js
> const { Router } = require("express");
> const router = Router();
> const controller = require("../controllers/events.controller");
> const { authenticate } = require("../middleware/auth.middleware");
> const { roleGuard } = require("../middleware/role.middleware");
> const { requireVolunteer } = roleGuard(["volunteer"]);
> const { requireOrganiser } = roleGuard(["organiser"]);
> router.get("/", authenticate, requireVolunteer, controller.browse);
> ```
>
> Controller pattern:
> ```js
> async function browse(req, res, next) {
>   try {
>     res.json({ data: [] });
>   } catch (err) { next(err); }
> }
> ```
>
> Service pattern:
> ```js
> const { pool } = require("../config/database");
> const { createError } = require("../middleware/errorHandler.middleware");
> async function findAll(query) {
>   const result = await pool.query("SELECT * FROM events LIMIT $1", [limit]);
>   return result.rows;
> }
> ```
>
> **Relevant database tables:**
> - `events` (id, organization_id, organizer_id, title, description, location, event_date, capacity, points_value, category, status, created_at)
> - `event_registrations` (id, event_id, user_id, status, registered_at)
> - `attendance_logs` (id, event_id, user_id, scanned_by, scanned_at, points_awarded)
> - `event_feedback` (id, event_id, user_id, rating, comment, created_at)
> - `event_qna` (id, event_id, user_id, question, answer, created_at)
> - `favorites` (id, user_id, event_id, created_at)
>
> **Generate the following files:**
>
> **Feature: Event CRUD + Browse**
> - `backend/src/services/events.service.js` — browseEvents with search/filter/pagination, getCategories, getEventDetail (with registration status), joinEvent, leaveEvent
> - `backend/src/controllers/events.controller.js` — browse (searchable, filterable, paginated), detail (with is_registered, is_favorited), categories (distinct list)
> - Update `backend/src/routes/events.routes.js` — routes are already wired, just needs real controller functions
>
> Response format for browse: `{ data: [...], total, page, limit, total_pages }`
> Response format for detail: `{ data: { id, title, description, category, location, event_date, capacity, points_value, image_url, is_registered, is_favorited, organizer_name, registered_count, created_at } }`
> Error format: `throw createError(404, "not_found", "Event not found")`
>
> **Static routes before parameterized:**
> ```js
> router.get("/", ...);           // browse — before /:id
> router.get("/categories", ...); // categories — before /:id
> router.get("/today", ...);      // today's events
> router.get("/:id", ...);        // detail — after literals
> ```
>
> **Important:** Use `await pool.query(...)` not `await db.query(...)`. Import from `"../config/database"`.

### Grace's Prompt (Rewards + Merchant)

> I am building an Express.js backend for a rewards/redemption + merchant verification feature in a Volunteering Rewards App. The backend uses PostgreSQL.
>
> **Existing patterns I must follow (EXACTLY):** [same pattern section as Vivian's above — use the same route/controller/service patterns]
>
> **Relevant database tables:**
> - `coupons` (id, title, description, points_required, quantity, value_cents, merchant_name, expiry_date, status, created_by, created_at)
> - `user_coupons` (id, user_id, coupon_id, pin_code, status[active/redeemed/reversed/expired], redeemed_at, reversed_at, valid_until, created_at)
> - `redemption_logs` (id, user_coupon_id, coupon_id, user_id, merchant_id, pin_code, status, redeemed_at)
> - `users` (id, points, ... — read-only for points balance)
> - `rewards_configuration` (id, points_per_event, min_redeem_points, etc.)
>
> **Generate the following files:**
>
> **Feature: Rewards Catalog + Redemption**
> - `backend/src/services/rewards.service.js` — browseRewards (with quantity > 0 filter), getRewardDetail (with remaining count), redeemCoupon (deduct points, generate 6-digit PIN, create user_coupon record, return PIN)
> - `backend/src/controllers/rewards.controller.js` — browse, detail, redeem
>
> **Feature: Merchant Coupon Verification**
> - `backend/src/services/merchant.service.js` — verifyPin (check valid + not expired + not redeemed), redeemCoupon (mark as redeemed), reverseCoupon (within 5-min window), getHistory
> - `backend/src/controllers/merchant.controller.js` — verify, redeem, reverse, history
>
> PIN generation: 6-digit numeric string, unique. Use random with uniqueness check.
> Points deduction: `UPDATE users SET points = points - $1 WHERE id = $2 AND points >= $1` (atomic check)
> Response for redeem: `{ data: { coupon_id, pin_code, reward_title, points_cost, valid_until, points_remaining } }`

### Nurain's Prompt (Admin + Organiser + Me)

> I am building an Express.js backend for an admin + organiser web portal in a Volunteering Rewards App. The backend uses PostgreSQL.
>
> **Existing patterns I must follow (EXACTLY):** [same pattern section as Vivian's above]
>
> **Relevant database tables:** All 13 tables. Key ones:
> - `users` (id, name, email, role_id, points, status, created_at)
> - `organizations` (id, org_name, org_type, status, created_at)
> - `events`, `event_registrations`, `attendance_logs`, `event_feedback`, `event_qna`
> - `coupons`, `user_coupons`, `redemption_logs`
>
> **Generate the following files:**
>
> **Feature: Admin Portal Backend**
> - `backend/src/services/admin.service.js` — getDashboardStats (total users, organisers, events, coupons issued today, redemptions today, recent activity), listUsers (search + pagination + role/status filters), getUserDetail (with event + points stats), updateUserStatus, listOrganisers (status filter), approveOrganiser, listEvents, getEventParticipation
> - `backend/src/controllers/admin.controller.js`
> - Routes already wired in `admin.routes.js` — just implement the controller functions
>
> **Feature: Organiser Portal Backend**
> - `backend/src/services/organiser.service.js` — getDashboardStats (my events stats, upcoming), listMyEvents, createEvent, updateEvent, deleteEvent, getRoster, getFeedback, getQna, answerQuestion
> - `backend/src/controllers/organiser.controller.js`
>
> **Feature: My Profile / Volunteer Data**
> - `backend/src/services/me.service.js` — getMyEvents (upcoming + past), getMyPoints (balance + history), getMyCoupons (active with PINs), getMyQrCode, getMyFavorites
> - `backend/src/controllers/me.controller.js`
>
> Response for dashboard: `{ stats: { total_users, total_organisers, pending_approvals, total_coupons_issued_today, total_redemptions_today, users_growth_pct, coupons_growth_pct }, recent_activity: [...], current_date, last_updated }`
> All list endpoints: paginated with `{ data: [...], total, page, limit, total_pages }`

---

## 6. Integration Guardrails

> **"My only worry is all working on codes that's unable to jell together" — Xon**

These rules prevent merge conflicts and contract drift:

### Rule 1: One Schema to Rule Them All
The database migrations in `backend/src/migrations/` are the single source of truth. Do not create or alter tables outside these files. If you need a column that doesn't exist, tell Xon — he adds it to the migration and tells everyone.

### Rule 2: Route Files Don't Overlap
Each person owns specific route files (see Section 3). Never edit a route file you don't own. If your feature depends on data from another slice, call their API endpoint — don't query the database directly for their tables.

### Rule 3: Your Service, Your Tables
- Vivian queries: `events`, `event_registrations`, `attendance_logs`, `event_feedback`, `event_qna`, `favorites`
- Grace queries: `coupons`, `user_coupons`, `redemption_logs`, `users` (read-only for points)
- Nurain queries: `users`, `organizations`, all tables (read-only for stats)
- No two people should write to the same table from their service layer

### Rule 4: API Contracts Are Frozen
Response shapes are defined in `API_CONTRACTS_v2.md` (on OneDrive). If your AI generates a response that doesn't match the contract, fix the code — not the contract. If the contract is wrong, discuss with Xon first.

### Rule 5: Frontend Connects to API, Not Direct DB
Mobile and web apps go through `api.ts` / `api.js`. Never import `pg` or `pool` in frontend code.

### Rule 6: PR Approval Gates
Every PR needs:
1. **Domain peer review** — someone from another slice reads your code for correctness
2. **Integration check** — verify no route/middleware conflicts with `backend/index.js`
3. **Smoke test** — the server starts without errors and your new endpoint returns 200

### Rule 7: Weekly Sync on `main`
Every Friday, merge your working code to `main` (via PR). If it doesn't compile or the server crashes, fix it before end of day. No one merges broken code.

### Rule 8: Documents on OneDrive
Project documents (.md reports, guides, prompts, SVGs) are stored on **OneDrive**, not GitHub. The GitHub repo only contains production code (`backend/`, `frontend/`, `.github/`, `Dockerfile`, `docker-compose.yml`).

---

## 7. First-Time Setup

### Local Development

```bash
# Terminal 1: Start backend
cd backend
cp .env.example .env        # Fill in your DB credentials
npm install
npm run migrate             # Creates all 13 tables
npm run seed                # Inserts test data
npm run dev                 # Backend on port 3000

# Terminal 2: Start web portals
cd frontend/web_portals
npm install
npm run dev                 # Portals on port 5173

# Terminal 3: Start mobile app (optional)
cd frontend/mobile_app
npm install
npx expo start              # Mobile on Expo Go
```

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Volunteer | alice@test.com | password123 |

### Portal URLs

| Portal | URL |
|--------|-----|
| Admin login | http://localhost:5173/admin/login |
| Admin dashboard | http://localhost:5173/admin |
| Organiser portal | http://localhost:5173/organiser |
| Merchant app | http://localhost:5173/merchant |
| Scanning app | http://localhost:5173/scan |
