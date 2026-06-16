# Code Companion Guide — Volunteering Rewards App

> A study guide for the team to understand the codebase before
> supervisor and examiner Q&A sessions.
>
> Version 2 — 21 May 2026
> **What's new in v2:** Updated architecture (React admin portal, not HTML/JS), added CI/CD, Docker, admin login page, 13 migrations, OneDrive document policy.

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Backend Patterns](#2-backend-patterns)
3. [Auth System Deep Dive](#3-auth-system-deep-dive)
4. [Database Schema](#4-database-schema)
5. [Admin Web Portal (React + Vite)](#5-admin-web-portal-react--vite)
6. [Mobile App Architecture](#6-mobile-app-architecture)
7. [Infrastructure & CI/CD](#7-infrastructure--cicd)
8. [Key Design Decisions](#8-key-design-decisions)
9. [Anticipated Q&A](#9-anticipated-qa)

---

## 1. Project Architecture Overview

### The Big Picture

```
     Mobile App (Expo/React Native)        Web Portals (React + Vite)
         localhost:8081                       Admin: localhost:5173/admin
               |                              Organiser: localhost:5173/organiser
          (HTTP/JSON)                         Merchant: localhost:5173/merchant
               |                              Scan: localhost:5173/scan
               |                                     |
               └──────────────┬──────────────────────┘
                              |
                       ┌──────┴──────┐
                       │  Express API │
                       │ (backend/)   │
                       │ port 3000    │
                       └──────┬──────┘
                              |
                         (SQL queries)
                              |
                       ┌──────┴──────┐
                       │  PostgreSQL  │
                       └─────────────┘
```

The backend serves **only** the REST API — frontends are separate apps:

- **Mobile app** — Expo/React Native runs on device (Expo Go or build)
- **Admin portal** — React + Vite app at `frontend/web_portals/`, served on port 5173
- **Organiser portal** — Same Vite app, different route (`/organiser`)
- **Merchant app** — Same Vite app, different route (`/merchant`)
- **Scanning app** — Same Vite app, different route (`/scan`)

### Vertical Slice Architecture

Each team member owns complete features from database to frontend:

| Person | Backend files (own) | Frontend (own) |
|--------|-------------------|----------------|
| **Xon** | Auth routes, controller, service. All middleware. DB config, migrations. | Admin login page. CI/CD pipeline. Docker setup. |
| **Vivian** | events, attendance, favorites routes + controllers + services. | Mobile: event screens, QR scanning. Organiser web: roster, feedback, scanning. |
| **Grace** | rewards, merchant routes + controllers + services. | Mobile: rewards catalog. Merchant web: PIN verification, history. Admin: coupons, redemptions. |
| **Nurain** | admin, organiser, me routes + controllers + services. | Admin web: dashboard, users, organisers, events, rewards config, QR codes. Organiser web: dashboard, events, event-edit, Q&A. |

**Why vertical slices?** Each person has something to show at every sprint checkpoint — they can demo their feature working end-to-end, from the database up to the user interface.

---

## 2. Backend Patterns

### The Request-Response Flow

Every API request follows this path:

```
HTTP Request
    |
    v
[Rate Limiter] - limits requests per minute
    |
    v
[Auth Middleware] - validates JWT token (for protected routes)
    |
    v
[Role Guard] - checks user role (for role-restricted routes)
    |
    v
[Route Handler] - matches URL to controller function
    |
    v
[Controller] - extracts params, calls service, sends response
    |
    v
[Service] - business logic, validation, database queries
    |
    v
[Database] - PostgreSQL via `pg` pool
    |
    v
[Error Handler] - catches errors, returns consistent JSON
```

### Example: Login Request Walkthrough

```
POST /api/auth/login  Body: { "email": "...", "password": "..." }
```

1. **index.js** — request arrives at Express. Goes through `helmet` (security headers), `cors` (cross-origin), `json()` (parse body), `rateLimiter.global` (100 req/15min).

2. **auth.routes.js** — matches `POST /api/auth/login`. Also has `rateLimiter.authStrict` (10 req/min specifically for login).

3. **auth.controller.js** — `login()` function extracts `req.body`, calls `authService.login(req.body)`.

4. **auth.service.js** — the `login()` function:

   a. **Joi validation** — checks email format and password presence
   b. **Query database** — `SELECT ... FROM users JOIN roles WHERE email = $1`
   c. **Check status** — if user.status !== "active", throws 403
   d. **Compare password** — `bcrypt.compare(password, user.password_hash)`
   e. **Generate JWT** — `jwtUtil.generateAccessToken({ id, role })` + refresh token
   f. **Store refresh token** — saves to database for rotation
   g. **Return** `{ user: { id, name, email, role, points_balance }, token, expires_at }`

5. **auth.controller.js** — sends `res.status(200).json({ user, token, expires_at })`

6. **errorHandler.middleware.js** — if anything threw an error, this catches it and sends `{ error: { code, message } }` with the right HTTP status.

### Route File Structure

Route files use per-route middleware for role guards. Events routes serve both volunteers and organisers:

```js
// events.routes.js — per-route role guarding
const { Router } = require("express");
const router = Router();
const controller = require("../controllers/events.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// Static routes BEFORE parameterized routes
router.get("/", authenticate, authorize("volunteer"), controller.browse);
router.get("/categories", authenticate, authorize("volunteer"), controller.categories);
router.get("/today", authenticate, authorize("organiser"), controller.today);

// Parameterized routes
router.get("/:id", authenticate, authorize("volunteer"), controller.detail);
router.post("/:id/register", authenticate, authorize("volunteer"), controller.join);
```

**Important:** Static routes (`/today`, `/categories`) must be declared BEFORE `/:id` to prevent Express from matching literal strings as an `:id` parameter.

### Controller Pattern

Controllers are intentionally **thin**:

```js
async function list(req, res, next) {
  try {
    const data = await someService.list(req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err); // Passes to errorHandler
  }
}
```

### Service Pattern

Services contain the **business logic**:

```js
async function browseEvents(filters) {
  const { rows } = await pool.query("SELECT * FROM events WHERE ...", []);
  return { data: rows, total: rows.length, page: 1, limit: 20, total_pages: 0 };
}
```

### Database Access Pattern

We use **parameterized queries** (no ORM) via the `pg` library:

```js
const { pool } = require("../config/database");
const { rows } = await pool.query(
  "SELECT * FROM users WHERE email = $1 AND status = $2",
  [email, "active"]
);
```

The `$1`, `$2` are **parameterized placeholders** — this prevents SQL injection attacks. Never use string interpolation for query values.

---

## 3. Auth System Deep Dive

### What is JWT?

**JWT** (JSON Web Token) is a string that proves a user is who they say they are. It has three parts separated by dots: `header.payload.signature`.

In our code (`backend/src/utils/jwt.js`):

```js
// Signing (creating a token)
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },  // payload
    ACCESS_SECRET,                       // secret key
    { expiresIn: "15m" }                // expiry
  );
}

// Verifying (checking a token)
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    return null;  // Invalid or expired
  }
}
```

**Two-token system:**
- **Access token** — short-lived (15 min). Sent with every API call.
- **Refresh token** — long-lived (7 days). Stored in database. Used to get new access tokens without re-entering password.

### What is bcrypt?

**bcrypt** is a password hashing library:

```js
// Registration — hash password before storing
const passwordHash = await bcrypt.hash(password, 12); // 12 salt rounds

// Login — compare entered password against stored hash
const passwordValid = await bcrypt.compare(password, user.password_hash);
```

Why not just store the password? If the database is ever breached, hashed passwords cannot be reversed. The `12` salt rounds makes brute-forcing computationally expensive.

### What is Joi?

**Joi** is a validation library that defines a "schema":

```js
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().trim().lowercase().required(),
  phone: Joi.string().pattern(/^\+65[689]\d{7}$/).optional().allow(""),
  password: Joi.string().min(8).pattern(/(?=.*[A-Z])(?=.*\d)/).required(),
  password_confirm: Joi.string().valid(Joi.ref("password")).required(),
});
```

**registerOrganiserSchema** adds 3 more fields for organisation registration:
```js
organisation_name: Joi.string().min(2).max(255).trim().required(),
organisation_type: Joi.string().valid("charity", "statutory_board", "community_group", "private", "other").required(),
organisation_docs: Joi.array().items(Joi.string().uri()).optional(),
```

### Rate Limiting

We use `express-rate-limit` to prevent abuse:

| Endpoint | Rate limit | Purpose |
|----------|-----------|---------|
| All routes | 100 requests per 15 minutes | General safety net |
| Login | 10 requests per minute | Prevent brute-force password guessing |
| Register | 5 requests per minute | Prevent account creation spam |

When exceeded, the API returns:
```json
{
  "error": { "code": "rate_limited", "message": "Too many requests. Please try again later." }
}
```

### Error Format Contract

**Every** error response follows this shape:

```json
{ "error": { "code": "string_error_code", "message": "Human-readable explanation" } }
```

**Standard error codes:**

| Code | HTTP Status | Meaning |
|------|------------|---------|
| `validation_error` | 400 | Invalid input data |
| `email_taken` | 409 | Email already registered |
| `phone_taken` | 409 | Phone already registered |
| `invalid_credentials` | 401 | Wrong email or password |
| `account_disabled` | 403 | Account deactivated by admin |
| `no_token` | 401 | No authorization header |
| `token_expired` | 401 | Token expired or invalid |
| `forbidden` | 403 | Wrong role for this action |
| `rate_limited` | 429 | Too many requests |
| `not_found` | 404 | Record not found |
| `already_registered` | 409 | Already joined this event |
| `event_full` | 409 | Event at capacity |
| `insufficient_points` | 403 | Not enough points to redeem |
| `invalid_pin` | 400 | Wrong 6-digit PIN |
| `already_redeemed` | 409 | Coupon already used |

### Auth Middleware Chain

Protected routes pass through up to three middleware layers:

```js
// register (no auth needed)
router.post("/register", authRegister, controller.register);

// register organiser (no auth needed, rate limited)
router.post("/register/organiser", authRegister, controller.registerOrganiser);

// profile (must be logged in)
router.get("/me", authenticate, controller.getProfile);

// admin routes (must be logged in AND admin)
router.use(authenticate, requireAdmin);
```

1. **`authenticate`** — checks `Authorization: Bearer <token>` header, attaches `req.user = { id, role }`
2. **`authorize("admin")`** — checks that `req.user.role` is in the allowed list
3. **Per-route rate limiting** — e.g., `authStrict` for login (10/min)

---

## 4. Database Schema

### Entity Relationship

```
roles ──< users ──> user_coupons ──< coupons
  |          |            |
  |          |       redemption_logs
  |          |
  |     organizations ──> events ──> event_registrations ──> attendance_logs
  |                               |
  |                          event_feedback
  |                          event_qna
  |                          favorites
```

### Key Tables

**users** — The core table. Stores credentials, points balance, and a unique QR code for attendance scanning.

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL | Primary key |
| `email` | VARCHAR(255) UNIQUE | Login identifier |
| `password_hash` | TEXT | bcrypt hash |
| `name` | VARCHAR(255) | Display name |
| `role_id` | INTEGER FK → roles | Volunteer/Organiser/Admin/Merchant |
| `points` | INTEGER DEFAULT 0 | Reward points balance |
| `volunteer_qr_code` | VARCHAR(36) UNIQUE | UUID for QR attendance |
| `status` | VARCHAR(20) DEFAULT 'active' | active / disabled |

### Migration System (13 files)

Database changes are versioned as SQL files in `backend/migrations/`:

```
001_create_roles.sql
002_create_users.sql
003_create_organizations.sql
...
012_create_redemption_logs.sql
013_add_coupon_value_and_merchant.sql   ← Added Sprint 2
```

Migration 013 adds `value_cents` (INTEGER) and `merchant_name` (VARCHAR) columns to the `coupons` table to match the API contract response shape.

---

## 5. Admin Web Portal (React + Vite)

The admin portal is a **React + Vite** app at `frontend/web_portals/`. It runs on port 5173 (not served by Express).

### How to Access

```
1. Start backend:  cd backend && npm run dev          (port 3000)
2. Start frontend: cd frontend/web_portals && npm run dev  (port 5173)
3. Open:           http://localhost:5173/admin/login
4. Login:          carol@test.com / password123
```

### All Portal URLs

| Portal | URL |
|--------|-----|
| Admin login | http://localhost:5173/admin/login |
| Admin dashboard | http://localhost:5173/admin |
| Organiser portal | http://localhost:5173/organiser |
| Merchant app | http://localhost:5173/merchant |
| Scanning app | http://localhost:5173/scan |

### Routes (defined in `App.jsx`)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/login` | Login.jsx | Admin login with role gating |
| `/admin` | Dashboard.jsx | Metrics, activity feed |
| `/admin/users` | Users.jsx | User management, search, suspend |
| `/admin/organisers` | Organisers.jsx | Approve/reject organiser requests |
| `/admin/events` | Events.jsx | All events, participation panel |
| `/admin/coupons` | Coupons.jsx | Coupon batch CRUD |
| `/admin/rewards-config` | RewardsConfig.jsx | Points configuration |
| `/admin/redemptions` | Redemptions.jsx | Redemption history |
| `/admin/qr-codes` | QRCodes.jsx | QR code generation |
| `/admin/pin-verify` | PinVerify.jsx | Manual PIN verification |
| `/admin/merchants` | Merchants.jsx | Merchant outlet management |
| `/admin/campaigns` | Campaigns.jsx | Campaign management |

### Key Pattern: API Calls

All admin pages use `src/services/api.js`:

```js
import { apiGet, apiPost, apiPut, apiDel, apiLogin } from '../../services/api';

// Login stores token in localStorage
await apiLogin('carol@test.com', 'password123');

// Authenticated requests auto-attach the token
const data = await apiGet('/admin/dashboard');
const users = await apiGet('/admin/users', { page: 1, search: 'john' });
await apiPut('/admin/organisers/5/approve', { status: 'approved' });
```

### Layout Structure

```
AdminLayout (provides sidebar)
  └── Page component (provides Topbar + main-content)
```

`AdminLayout` wraps the sidebar around each page. Each page has its own `Topbar` and content area. The sidebar is collapsible on mobile.

---

## 6. Mobile App Architecture

The mobile app is built with **Expo (React Native)** using file-based routing via `expo-router`.

### App Structure

```
mobile_app/app/
  _layout.tsx          Root — checks auth state, shows tabs or auth screens
  index.tsx            Entry — redirects to home or login
  (auth)/
    onboarding.tsx     Welcome screen
    login.tsx          Email/password login
    register.tsx       Registration form
  (tabs)/
    home.tsx           Dashboard with points + upcoming events
    events.tsx         Browse events list
    events/[id].tsx    Event detail
    events/my.tsx      My registrations
    rewards.tsx        Rewards shop
    rewards/[id].tsx   Reward detail + redeem
    profile.tsx        User profile + QR code
```

### Auth Flow

1. **Registration** → `POST /api/auth/register` → stores token in `expo-secure-store`
2. **Login** → `POST /api/auth/login` → stores token
3. **API calls** → reads token from SecureStore, attaches as Bearer token
4. **Logout** → clears token

### Components Library

All UI components live in `mobile_app/src/components/`:
- **Button** — 3 variants, loading state
- **Input** — Label, error text, validation feedback
- **Card** — Tappable card with platform-aware shadows
- **Toast** — Animated notifications
- **Badge** — Status badges
- **EmptyState** — Screen with icon, message, action button
- **ErrorState** — Error screen with retry button
- **LoadingSpinner** — Loading indicator

---

## 7. Infrastructure & CI/CD

### CI Pipeline (GitHub Actions)

Every push to `main` triggers an automated pipeline:

```
├── Lint:   Check all backend modules load (require() resolution)
├── Test:   Spin up PostgreSQL → run migrations → seed data → npm test
└── Deploy: Placeholder (ready for Render / Railway)
```

The pipeline runs on ubuntu-latest with a PostgreSQL 16 service container. Environment variables use `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`.

### Docker Setup

**Dockerfile** — Multi-stage build for production:

```
Stage 1 (builder):   Install all npm deps, copy backend source
Stage 2 (production): Copy production deps + source, add non-root user
                      Enable healthcheck on /api/health
```

**docker-compose.yml** — One-command local stack:

```bash
docker compose up
```

Starts two containers: the Express app (port 3000) and PostgreSQL 16 (port 5432) with a health check.

### Project Documents

Documents (.md guides, reports, prompts, SVGs) are stored on **OneDrive**, not GitHub. The GitHub repo only contains production code:

```
volunteering-rewards-app/
├── .github/workflows/    ← CI/CD pipeline
├── backend/              ← Express API server
├── frontend/
│   ├── mobile_app/       ← Expo React Native mobile app
│   └── web_portals/      ← React + Vite web portals
├── Dockerfile
├── docker-compose.yml
└── .gitignore
```

---

## 8. Key Design Decisions

### Why no ORM? (Why raw SQL?)

We use raw SQL queries with the `pg` library instead of an ORM. Benefits:
- Full control over SQL — we can write optimized queries
- Easier to debug — copy the query and run directly in PostgreSQL
- Lighter learning curve — team members know SQL from the database module

Trade-off: More code for simple CRUD, but complete visibility into database operations.

### Why parameterized queries?

```js
// GOOD (parameterized — prevents SQL injection)
pool.query("SELECT * FROM users WHERE email = $1", [userInput]);

// BAD (string interpolation — SQL injection risk!)
pool.query("SELECT * FROM users WHERE email = '" + userInput + "'");
```

### Why Joi for validation?

Server-side validation is the last line of defense. Even if the frontend validates perfectly, attackers can send raw HTTP requests. Joi gives us:
- Declarative schemas that are easy to read
- Detailed per-field error messages
- Automatic type coercion and sanitization

### Why token rotation for refresh tokens?

When a user requests a new access token:
1. Check their refresh token against the database
2. Generate a **new** refresh token (old one becomes invalid)
3. If a reused (stolen) token is detected, revoke ALL tokens for that user

This prevents **token theft attacks** — a stolen refresh token only works once.

### Why vertical slices instead of layers?

Each team member owns complete features end-to-end. This guarantees:
- Backend commits with route/controller/service code
- Frontend screens connected to their APIs
- A working demo of their feature end-to-end
- Individual contribution evidence for assessment

---

## 9. Anticipated Q&A

### Architecture & Design

**Q: Why did you choose Express.js for the backend?**

A: Express is lightweight, unopinionated, and widely used. The team already knows JavaScript from the web development module. Express's middleware pattern lets us compose features cleanly — auth, rate limiting, error handling are all stacked middleware functions.

**Q: Why are you using raw SQL instead of an ORM?**

A: Raw SQL gives us full control over query performance. For a project with 13 tables and specific aggregation queries (dashboard metrics, user profiles), ORMs often generate inefficient queries. We can copy any query from the code and run it directly in PostgreSQL for debugging.

**Q: Explain the vertical slice architecture.**

A: Each team member owns complete features end-to-end — from database queries to user interface. This ensures everyone has full-stack contribution evidence, prevents bottlenecks, and makes integration easier because each slice is self-contained.

**Q: How is the admin portal different from the old HTML prototypes?**

A: The admin portal was originally built as HTML/JS static files served by Express. In Sprint 2, it was migrated to a React + Vite application that runs on its own dev server (port 5173). All 11 admin pages are fully wired to the live API. The old HTML prototypes are archived on OneDrive.

### Authentication & Security

**Q: How do you handle authentication?**

A: We use JWT with a two-token system. Access tokens (15 min) are sent with every API call. Refresh tokens (7 days) are stored in the database and used to obtain new access tokens without re-login. The `/api/auth/refresh` endpoint rotates refresh tokens for security.

**Q: How do you protect user passwords?**

A: Passwords are hashed with bcrypt using 12 salt rounds (2^12 iterations). Each password gets a unique salt, so two users with the same password have different hashes. If the database is breached, hashes cannot be reversed.

**Q: What prevents brute-force login attacks?**

A: Three layers of rate limiting enforced server-side by `express-rate-limit`:
1. Global: 100 req / 15 min
2. Login: 10 req / minute
3. Register: 5 req / minute

**Q: How does organiser registration work?**

A: It's a separate endpoint (`POST /api/auth/register/organiser`) with additional fields: organisation_name, organisation_type (enum: charity/statutory_board/community_group/private/other), and optional organisation_docs. The system creates the organisation in "pending" status, then creates the user with a foreign key to the organisation.

### Database

**Q: How do you manage database schema changes?**

A: We use 13 numbered SQL migration files executed by a migration runner. Each migration is additive — we never modify existing files. New migrations add columns or tables. The runner executes files in numeric order within a transaction.

**Q: Explain the points system.**

A: The `users` table has a `points` column (integer, default 0). Volunteers earn points through event attendance. When they redeem points for coupons, the transaction is recorded in `redemption_logs` and points are deducted. The current balance is always `users.points` — we don't calculate it from logs for performance.

### Frontend

**Q: How does the admin portal connect to the backend?**

A: The React admin portal uses `src/services/api.js` which wraps `fetch()` with JWT authentication. It stores the token in `localStorage` and auto-attaches it as a Bearer token. On 401 errors, it redirects to `/admin/login`. The frontend runs on port 5173 and the backend on port 3000, with CORS configured to allow cross-origin requests.

**Q: How does the mobile app handle authentication state?**

A: The Expo Router layout checks for a stored token on launch. If a token exists, the user sees the main tabs. If not, they see the auth flow. The token persists in Expo SecureStore (Keychain on iOS, EncryptedSharedPreferences on Android).

**Q: What test credentials are available?**

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Volunteer | alice@test.com | password123 |

### Infrastructure

**Q: What CI/CD pipeline do you use?**

A: GitHub Actions. On every push to main, it runs lint (module resolution check), tests (spins up PostgreSQL, runs migrations, seeds data), and has a deploy placeholder for cloud deployment.

**Q: How do you deploy the app?**

A: Currently running locally. The Dockerfile and docker-compose.yml are ready for containerised deployment to Render or Railway. The CI pipeline has a deploy job placeholder. Deployment is planned for Sprint 5.

### Known Issues

**Mobile app API path bug** — The API base URL is set to `http://localhost:3000/api` but most screens prepend `/api/` to their endpoint paths, resulting in double `/api/api/` URLs. Fix: either remove `/api` from `API_BASE` or from the screen paths.

**Mobile logout doesn't clear SecureStore** — `profile.tsx` clears the in-memory token but not the stored one. The stale token persists and will be re-read on next launch.

---

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `backend/index.js` | Express server entry point |
| `backend/src/routes/*.js` | Route definitions (URL → controller mapping) |
| `backend/src/controllers/*.js` | Thin HTTP layer |
| `backend/src/services/auth.service.js` | Auth business logic |
| `backend/src/middleware/auth.middleware.js` | JWT token verification |
| `backend/src/middleware/role.middleware.js` | Role-based access control |
| `backend/src/middleware/rateLimiter.middleware.js` | Rate limiting |
| `backend/src/middleware/errorHandler.middleware.js` | Global error handler |
| `backend/src/utils/jwt.js` | JWT sign/verify |
| `backend/src/utils/migrationRunner.js` | Runs migration files |
| `backend/src/utils/seed.js` | Seeds test data |
| `backend/migrations/*.sql` | Database schema (13 files) |
| `frontend/web_portals/src/App.jsx` | Portal router (all 4 portals) |
| `frontend/web_portals/src/services/api.js` | Web portal API client |
| `frontend/web_portals/src/pages/admin/` | Admin portal pages (11) |
| `frontend/web_portals/src/pages/organiser/` | Organiser portal pages (8) |
| `frontend/mobile_app/app/` | Expo Router screens |
| `frontend/mobile_app/src/services/api.ts` | Mobile app API client |
| `.github/workflows/ci.yml` | CI/CD pipeline |
| `Dockerfile` | Multi-stage production build |
| `docker-compose.yml` | Local dev stack |
