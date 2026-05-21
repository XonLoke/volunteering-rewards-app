# Vertical Slice Technical Guide v3

> **Purpose:** Give every team member the exact patterns, file paths, and AI prompts needed to generate code that snaps into our existing framework — so all four slices integrate cleanly without a "spaghetti mess at the end."
>
> **Project:** Volunteering Rewards App

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1 | 16 May 2026 | Xon | Initial guide — architecture overview, patterns, slice assignments, prompts, guardrails |
| v2 | 16 May 2026 | Xon | Added Section 4 explaining why shared prompts are necessary; preserved all existing content |
| v3 | 17 May 2026 | Xon | Redistributed web portal workload: Xon gets admin dashboard/users/organisers, Vivian gets organiser roster/feedback, Grace gets admin coupons/redemptions. Nurain reduced from 19 to 7 pages. Updated Section 1, 3, and 5. |

---

## 1. Architecture Overview (Everyone Must Know)

```
volunteering-rewards-app/
├── backend/                          # Express.js API server
│   ├── index.js                      # Entry point — mounts all routes
│   ├── .env                          # DB_HOST, JWT secrets, etc.
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL pool (shared)
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # authenticate() — JWT verification
│   │   │   ├── role.middleware.js    # roleGuard(), authorize() — role checks
│   │   │   ├── errorHandler.middleware.js  # Global error handler
│   │   │   └── rateLimiter.middleware.js   # Rate limiting
│   │   ├── routes/                   # Your slice's routes go here
│   │   ├── controllers/              # Your slice's controllers go here
│   │   ├── services/                 # Your slice's business logic goes here
│   │   ├── utils/
│   │   │   ├── migrationRunner.js    # Runs all migration files
│   │   │   └── seed.js               # Seeds test data
│   │   └── migrations/               # Database schema (12 files)
│   └── package.json
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
│   └── web_portals/                  # React + Vite — all members
│       └── src/
│           ├── pages/
│           │   ├── admin/            # Xon: dashboard/users/orgs; Grace: coupons/redemptions; Nurain: events/config
│           │   ├── organiser/        # Vivian: roster/feedback/scan; Nurain: dashboard/events/edit/Q&A
│           │   ├── merchant/         # Grace: PIN verify, history
│           │   └── (login)           # Shared login pages
│           └── services/
│               └── api.js            # apiGet / apiPost / apiPut / apiDel
```

### How API Calls Flow

```
[Mobile/Web App]
    ↓  fetch() or api.get('/events')
[Express Router]  →  routes/*.routes.js
    ↓  (authenticate, requireRole)
[Controller]  →  controllers/*.controller.js
    ↓  (business logic)
[Service / DB]  →  services/*.service.js  or  pg.query()
    ↓
[JSON Response]  →  res.json({ data: [...] })
```

### Mounted Routes (from `backend/index.js`)

| Path | File | Owner |
|------|------|-------|
| `/api/auth` | `auth.routes.js` | Xon |
| `/api/events` | `events.routes.js` | Vivian |
| `/api/attendance` | `attendance.routes.js` | Vivian |
| `/api/me` | `me.routes.js` | Nurain |
| `/api/favorites` | `favorites.routes.js` | Vivian |
| `/api/rewards` | `rewards.routes.js` | Grace |
| `/api/organiser` | `organiser.routes.js` | Nurain |
| `/api/admin` | `admin.routes.js` | Nurain |
| `/api/merchant`, `/api/coupons` | `merchant.routes.js` | Grace |

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

### Pattern B: Controller File

```js
// File: backend/src/controllers/your-slice.controller.js

// Import your service layer for business logic
const yourService = require("../services/your-slice.service");

// ─── GET /api/your-slice ─────────────────────────────
async function browse(req, res, next) {
  try {
    // req.user.id — authenticated user's ID (available after authenticate)
    // req.query — query parameters (?page=1&limit=20)
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

const pool = require("../config/db");

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
  };
}

// ─── Find by ID ───────────────────────────────────────
async function findById(id) {
  const result = await pool.query("SELECT * FROM your_table WHERE id = $1", [id]);
  return result.rows[0] || null;
}

// ─── Create ────────────────────────────────────────────
async function create(data, userId) {
  const result = await pool.query(
    `INSERT INTO your_table (name, created_by)
     VALUES ($1, $2) RETURNING *`,
    [data.name, userId]
  );
  return result.rows[0];
}

module.exports = { findAll, findById, create };
```

### Pattern D: Using the Error Helper

```js
// backend/src/utils/errors.js (if it exists) or import directly:
function createError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}
```

Use it in controllers: `next(createError(404, "not_found", "Event not found"))`

### Pattern E: Error Response Format (Backend Always Returns)

```json
// Success
{ "data": { ... } }
{ "data": [ ... ], "total": 10, "page": 1, "limit": 20, "total_pages": 1 }

// Error
{ "error": { "code": "not_found", "message": "Event not found" } }
```

### Pattern F: How New Routes Get Registered

After creating your route file, **add ONE line** to `backend/index.js`:

```js
app.use("/api/your-path", require("./src/routes/your-slice.routes"));
```

Mount middleware stacking goes *before* the 404 handler and *after* the health check.

---

## 3. Slice Assignments

### Xon — Auth Slice + Shared Infrastructure

| Component | Files | Status |
|-----------|-------|--------|
| Auth routes | `backend/src/routes/auth.routes.js` | ✅ Implemented |
| Auth controller | `backend/src/controllers/auth.controller.js` | ✅ Implemented |
| Auth service | `backend/src/services/auth.service.js` | ✅ Implemented |
| Auth middleware | `backend/src/middleware/auth.middleware.js` | ✅ Built |
| Role middleware | `backend/src/middleware/role.middleware.js` | ✅ Built |
| Error handler | `backend/src/middleware/errorHandler.middleware.js` | ✅ Built |
| Rate limiter | `backend/src/middleware/rateLimiter.middleware.js` | ✅ Built |
| Mobile auth screens | `frontend/mobile_app/app/(auth)/*` | ✅ Built |
| Admin web login | `frontend/web_portal/admin/login.html` | ⏳ Sprint 2 |
| Admin dashboard | `frontend/web_portal/admin/dashboard.html` | ⏳ Sprint 2 |
| Admin users page | `frontend/web_portal/admin/users.html` | ⏳ Sprint 3 |
| Admin organisers | `frontend/web_portal/admin/organisers.html` | ⏳ Sprint 3 |
| CI/CD pipeline | `.github/workflows/` | ✅ Done |
| Docker config | `Dockerfile`, `docker-compose.yml` | ✅ Done |

### Vivian — Event Slice + QR Attendance Slice

**Route files to implement:**

| File | Endpoints | Role guard |
|------|-----------|------------|
| `backend/src/routes/events.routes.js` | Browse, categories, detail, register, leave, feedback, Q&A, today, roster | volunteer, organiser |
| `backend/src/routes/attendance.routes.js` | Mark attendance, log, points award | organiser |
| `backend/src/routes/favorites.routes.js` | Toggle favorite, list favorites | volunteer |

**Controller files to implement:**
- `backend/src/controllers/events.controller.js`
- `backend/src/controllers/attendance.controller.js`
- `backend/src/controllers/favorites.controller.js`

**Service files to create:**
- `backend/src/services/event.service.js`
- `backend/src/services/attendance.service.js`
- `backend/src/services/favorites.service.js`

**Frontend screens to connect (mobile):**
- `app/(tabs)/events.tsx` → Browse events list
- `app/(tabs)/events/[id].tsx` → Event detail
- `app/(tabs)/events/my.tsx` → My events
- `app/(tabs)/home.tsx` → Home feed

**Frontend pages to connect (web/scan):**
- `web_portals/src/pages/organiser/roster.html` → Event roster (check-in status)
- `web_portals/src/pages/organiser/feedback.html` → Feedback view + ratings
- `web_portals/src/pages/organiser/scanning.html` → QR scanner (web interface)

*These organiser pages were redistributed from Nurain to balance workload.*

### Grace — Rewards Slice + Merchant Slice

**Route files to implement:**

| File | Endpoints | Role guard |
|------|-----------|------------|
| `backend/src/routes/rewards.routes.js` | Browse, detail, redeem (PIN generation) | volunteer |
| `backend/src/routes/merchant.routes.js` | Coupon verify, redeem, reverse, history | merchant, admin |

**Controller files to implement:**
- `backend/src/controllers/rewards.controller.js`
- `backend/src/controllers/merchant.controller.js`

**Service files to create:**
- `backend/src/services/reward.service.js`
- `backend/src/services/merchant.service.js`

**Frontend screens to connect (mobile):**
- `app/(tabs)/rewards.tsx` → Rewards catalog
- `app/(tabs)/rewards/[id].tsx` → Reward detail / redeem

**Frontend pages to connect (web):**
- `web_portals/src/pages/merchant/*` → Merchant PIN entry, history
- `web_portals/src/pages/admin/coupons.html` → Admin coupon management (redistributed from Nurain)
- `web_portals/src/pages/admin/redemptions.html` → Admin redemptions log (redistributed from Nurain)

### Nurain — Admin/Organiser Slice

**Route files to implement:**

| File | Endpoints | Role guard |
|------|-----------|------------|
| `backend/src/routes/admin.routes.js` | List users, deactivate, approve organisers, coupon CRUD, redemptions, rewards config, QR codes | admin |
| `backend/src/routes/organiser.routes.js` | Dashboard stats, event management, feedback view, Q&A management | organiser |
| `backend/src/routes/me.routes.js` | My profile, my stats, my activity | volunteer |

**Controller files to implement:**
- `backend/src/controllers/admin.controller.js`
- `backend/src/controllers/organiser.controller.js`
- `backend/src/controllers/me.controller.js`

**Service files to create:**
- `backend/src/services/admin.service.js`
- `backend/src/services/organiser.service.js`

**Frontend pages to connect (web) — redistributed scope:**
- `web_portals/src/pages/admin/events.html` → Admin events participation
- `web_portals/src/pages/admin/rewards-config.html` → Rewards configuration
- `web_portals/src/pages/organiser/login.html` → Organiser login
- `web_portals/src/pages/organiser/dashboard.html` → Organiser dashboard
- `web_portals/src/pages/organiser/events.html` → Events list (CRUD)
- `web_portals/src/pages/organiser/event-edit.html` → Create/edit event
- `web_portals/src/pages/organiser/qna.html` → Q&A management

  > Pages **redistributed** to other members:
  > - Admin dashboard + users + organisers → **Xon** (frontend only)
  > - Admin coupons + redemptions → **Grace** (frontend only, matches her domain)
  > - Organiser roster + feedback + scanning → **Vivian** (frontend only, matches her domain)

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

**One more thing — these prompts keep working when you switch AIs.** Whether you use Claude, ChatGPT, or Gemini, the prompt anchors the output to our project's patterns instead of the AI's generic defaults.

## 5. AI Prompts Per Person

Copy your slice's prompt, replace the specific feature details, and paste into your AI tool.

### Vivian's Prompt (Event + QR Attendance)


> I am building a Express.js backend for an event management + QR attendance feature in a Volunteering Rewards App. The backend uses PostgreSQL via Supabase.
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
> Service pattern (using pg pool):
> ```js
> const pool = require("../config/db");
> async function findAll(query) {
>   const result = await pool.query("SELECT * FROM events LIMIT $1", [limit]);
>   return result.rows;
> }
> ```
>
> **Relevant database tables:**
> - `events` (id, title, description, category, location, date_time, max_participants, points_awarded, status, image_url, organisation_id, created_at)
> - `event_registrations` (id, event_id, user_id, status, registered_at)
> - `attendance_logs` (id, event_id, user_id, scanned_by, scanned_at)
> - `event_feedback` (id, event_id, user_id, rating, comment, created_at)
> - `event_qna` (id, event_id, user_id, question, answer, created_at)
> - `favorites` (id, user_id, event_id, created_at)
> - `points_history` (id, user_id, event_id, points, type, description, created_at)
>
> **Generate the following files:** (pick one feature at a time)
>
> **Feature: Event CRUD + Browse**
> - `backend/src/services/event.service.js` — findAll with search/filter/pagination, findById, create, update, delete
> - `backend/src/controllers/events.controller.js` — browse (searchable, filterable, paginated), detail (with is_registered, is_favorited), categories (distinct categories list)
> - `backend/src/routes/events.routes.js` — all event routes matching the mounted endpoints in index.js
>
> Response format for browse: `{ data: [...], total: number, page: number, limit: number, total_pages: number }`
> Response format for detail: `{ data: { id, title, description, category, location, date_time, max_participants, points_awarded, image_url, is_registered: bool, is_favorited: bool, organisation_name, registered_count, created_at } }`
> Error format: `next(createError(404, "not_found", "..."))`
>
> **Important:** After generating, give me the exact line to add to `backend/index.js` to mount my routes.

### Grace's Prompt (Rewards + Merchant)

> I am building a Express.js backend for a rewards/redemption + merchant verification feature in a Volunteering Rewards App. The backend uses PostgreSQL via Supabase.
>
> **Existing patterns I must follow (EXACTLY):** [same pattern section as above]
>
> **Relevant database tables:**
> - `rewards` (id, title, description, image_url, type[online/in_store], points_cost, value_cents, quantity_total, quantity_remaining, valid_from, valid_until, is_active, created_by, created_at)
> - `user_coupons` (id, user_id, reward_id, pin_code, status[active/redeemed/reversed/expired], redeemed_at, reversed_at, valid_until, created_at)
> - `merchant_outlets` (id, name, address, merchant_user_id)
>
> **Generate the following files:**
>
> **Feature: Rewards Catalog + Redemption**
> - `backend/src/services/reward.service.js` — browse (with quantity_remaining > 0 filter, type filter), findById
> - `backend/src/controllers/rewards.controller.js` — browse, detail, redeem (deduct points, generate 6-digit PIN, create user_coupon record, return PIN in response)
> - `backend/src/routes/rewards.routes.js`
>
> **Feature: Merchant Coupon Verification**
> - `backend/src/services/merchant.service.js` — verifyCoupon (check PIN validity + not expired + not already redeemed), redeemCoupon (mark as redeemed), reverseCoupon (within 5-min window), history
> - `backend/src/controllers/merchant.controller.js` — verify, redeem, reverse, history
> - `backend/src/routes/merchant.routes.js` (with multi-role: authorize("merchant", "admin"))
>
> PIN generation: 6-digit numeric string, unique per reward. Use a simple random approach with uniqueness check.
> Points deduction: UPDATE users SET points = points - $1 WHERE id = $2 AND points >= $1 (atomic check)
> Response format for redeem: `{ data: { coupon_id, pin_code, reward_title, points_cost, valid_until, points_remaining } }`
>
> **Important:** The `/api/coupons` routes are mounted from merchant.routes.js in index.js.

### Nurain's Prompt (Admin + Organiser)

> I am building a Express.js backend for an admin + organiser web portal in a Volunteering Rewards App. The backend uses PostgreSQL via Supabase.
>
> **Existing patterns I must follow (EXACTLY):** [same pattern section as above]
>
> **Relevant database tables:**
> - `users` (id, name, email, password_hash, role[volunteer/organiser/admin/merchant], points, avatar_url, is_active, organisation_id, created_at)
> - `organisations` (id, name, description, uen, approval_status[pending/approved/rejected], created_by, created_at)
> - `events` (as described above)
> - `rewards` (as described above)
> - `user_coupons` (as described above)
> - `attendance_logs` (as described above)
>
> **Generate the following files:**
>
> **Feature: Admin Portal Backend**
> - `backend/src/services/admin.service.js` — listUsers (with search + pagination, role filter), deactivateUser, listOrganisers, approveOrganiser, rejectOrganiser, getDashboardStats (total users, total events, total rewards, total redemptions), listRedemptions, listCoupons
> - `backend/src/controllers/admin.controller.js`
> - `backend/src/routes/admin.routes.js` (all routes with requireAdmin guard)
>
> **Feature: Organiser Portal Backend**
> - `backend/src/services/organiser.service.js` — getDashboardStats (my events count, total participants, upcoming events), listMyEvents, createEvent, getFeedback (for my events), getQna (for my events), answerQuestion
> - `backend/src/controllers/organiser.controller.js`
> - `backend/src/routes/organiser.routes.js` (all routes with requireOrganiser guard)
>
> **Feature: My Profile**
> - `backend/src/controllers/me.controller.js`
> - `backend/src/routes/me.routes.js` — profile, myStats, myActivity (attendance + redemption history)
>
> All admin routes: `requireAdmin`
> All organiser routes: `requireOrganiser`  
> ALL routes: `authenticate` first, then role guard
>
> **Frontend note:** The admin and organiser web portal pages are split across the team:
> - Xon builds: admin login, dashboard, users, organisers
> - Grace builds: admin coupons, redemptions
> - Vivian builds: organiser roster, feedback, scanning
> - You build: admin events, rewards config + organiser login, dashboard, events, event-edit, Q&A

---

## 6. Integration Guardrails

> **"My only worry is all working on codes that's unable to jell together" — Xon**

These rules prevent merge conflicts and contract drift:

### Rule 1: One Schema to Rule Them All
The database migrations in `backend/src/migrations/` are the single source of truth. Do not create or alter tables outside these files. If you need a column that doesn't exist, tell Xon — he adds it to the migration and tells everyone.

### Rule 2: Route Files Don't Overlap
Each person owns specific route files (see Section 3). Never edit a route file you don't own. If your feature depends on data from another slice, call their API endpoint — don't query the database directly for their tables.

### Rule 3: Your Service, Your Tables
- Vivian queries: `events`, `event_registrations`, `attendance_logs`, `event_feedback`, `event_qna`, `favorites`, `points_history`
- Grace queries: `rewards`, `user_coupons`, `merchant_outlets`, `users` (read-only for points)
- Nurain queries: `users`, `organisations`, all tables (read-only for stats)
- No two people should write to the same table from their service layer

### Rule 4: API Contracts Are Frozen
Response shapes are defined in `API_CONTRACTS.md`. If your AI generates a response that doesn't match the contract, fix the code — not the contract. If the contract is wrong, discuss with Xon first.

### Rule 5: Frontend Connects to API, Not Direct DB
Mobile and web apps go through `api.ts` / `api.js`. Never import `pg` or `pool` in frontend code.

### Rule 6: PR Approval Gates
Every PR needs:
1. **Domain peer review** — someone from another slice reads your code for correctness
2. **Integration check** — verify no route/middleware conflicts with `backend/index.js`
3. **Smoke test** — the server starts without errors and your new endpoint returns 200

### Rule 7: Weekly Sync on `main`
Every Friday, merge your working code to `main` (via PR). If it doesn't compile or the server crashes, fix it before end of day. No one merges broken code.

---

## 7. First-Time Setup (After Supabase Link is Shared)

When Vivian shares the Supabase project link:

1. **Everyone** updates `backend/.env`:
   ```
   DB_HOST=[supabase-db-url]
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=[supabase-db-password]
   ```

2. **One person** runs `npm run migrate` from the backend folder to create all 12 tables on Supabase.

3. **One person** runs `npm run seed` to insert test data.

4. Each person verifies they can connect by running `node -e "require('./src/config/db').query('SELECT 1').then(r => console.log('OK', r))"`.

> **Vivian already set up the Supabase project** — as soon as she shares the link, steps 1-3 take about 5 minutes.

---

## 8. Quick Reference: Auth Middleware Options

```js
// Import at top of route file
const { authenticate } = require("../middleware/auth.middleware");
const { roleGuard, authorize } = require("../middleware/role.middleware");

// Available guards — copy what you need
const { requireVolunteer }  = roleGuard(["volunteer"]);
const { requireOrganiser }  = roleGuard(["organiser"]);
const { requireAdmin }      = roleGuard(["admin"]);
const { requireMerchant }   = roleGuard(["merchant"]);

// Multi-role (use this directly instead of destructuring)
const requireMerchantOrAdmin = authorize("merchant", "admin");

// Usage on routes:
router.get("/me",    authenticate, requireVolunteer, controller.action);
router.get("/admin", authenticate, requireAdmin, controller.action);
router.get("/both",  authenticate, requireMerchantOrAdmin, controller.action);

// Routes that need auth + req.user.id but no specific role:
router.get("/profile", authenticate, controller.getProfile);
```
