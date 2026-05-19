# Code Companion Guide — Volunteering Rewards App

> A study guide for the team to understand the codebase before
> supervisor and examiner Q&A sessions.
>
> Version 1 — 18 May 2026

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Backend Patterns](#2-backend-patterns)
3. [Auth System Deep Dive](#3-auth-system-deep-dive)
4. [Database Schema](#4-database-schema)
5. [Admin Web Portal](#5-admin-web-portal)
6. [Mobile App Architecture](#6-mobile-app-architecture)
7. [Web UI Prototypes](#7-web-ui-prototypes)
8. [Key Design Decisions](#8-key-design-decisions)
9. [Anticipated Q&A](#9-anticipated-qa)

---

## 1. Project Architecture Overview

### The Big Picture

```
                   Mobile App (Expo/React Native)
                            |
                       (HTTP/JSON)
                            |
                    ┌───────┴───────┐
                    │  Express API  │
                    │ (backend/)    │
                    └───────┬───────┘
                            |
                       (SQL queries)
                            |
                    ┌───────┴───────┐
                    │  PostgreSQL   │
                    └───────────────┘

         Admin Web Portal (HTML/JS)    Organiser Web (HTML/JS)
                  |                             |
             (served as static files       (served as static
              by Express)                   files by Express)
```

The backend at `backend/index.js` does double duty:
1. Serves the REST API at `/api/...`
2. Serves the frontend HTML pages as **static files** from the `frontend/` folder

```js
// From index.js — serves static frontend files
app.use(express.static(path.join(__dirname, "..", "frontend")));
```

This means if you visit `http://localhost:3000/web_portal/admin/login.html`, Express serves the file at `frontend/web_portal/admin/login.html` directly — no separate server needed.

### Vertical Slice Architecture

We use a **vertical slice** pattern. Each team member owns complete features from database to frontend:

| Person | Backend files (own) | Frontend (own) |
|--------|-------------------|----------------|
| **Xon** | auth routes, controller, service. All middleware. DB config, migrations. | Admin portal: login, dashboard, users, organisers. Mobile: auth screens. |
| **Vivian** | events, attendance, favorites routes + controllers + services. | Mobile: event screens, QR scanning. Organiser web: roster, feedback, scanning. |
| **Grace** | rewards, merchant routes + controllers + services. | Mobile: rewards catalog. Merchant web: PIN verification, history. Admin: coupons, redemptions. |
| **Nurain** | admin, organiser, me routes + controllers + services. | Admin web: events, participation, rewards config. Organiser web: dashboard, events, event-edit, Q&A. |

**Why vertical slices?** Each person has something to show at every checkpoint — they can demo their feature working end-to-end, from the database up to the user interface.

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
   g. **Return** `{ user: { id, name, email, role, points_balance, avatar_url }, token, expires_at }`

5. **auth.controller.js** — sends `res.status(200).json({ user, token, expires_at })`

6. **errorHandler.middleware.js** — if anything threw an error, this catches it and sends `{ error: { code, message } }` with the right HTTP status.

### Route File Structure

Each route file follows the same pattern:

```js
const { Router } = require("express");
const router = Router();
const controller = require("../controllers/something.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { roleGuard } = require("../middleware/role.middleware");

// Apply middleware to ALL routes in this file
router.use(authenticate, someRoleGuard);

// Define endpoints
router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
```

### Controller Pattern

Controllers are intentionally **thin** — they just connect HTTP to the service layer:

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

Services contain the **business logic** — validation, database queries, calculations:

```js
async function list(filters) {
  // Validate inputs
  // Build query
  // Execute query
  // Transform results
  // Return or throw
}
```

### Database Access Pattern

We use parameterized queries (no ORM) via the `pg` library:

```js
const { pool } = require("../config/database");

const { rows } = await pool.query(
  "SELECT * FROM users WHERE email = $1 AND status = $2",
  [email, "active"]
);
```

The `$1`, `$2` are **parameterized placeholders** — this prevents SQL injection attacks. The `pg` library handles escaping automatically.

---

## 3. Auth System Deep Dive

### What is JWT?

**JWT** (JSON Web Token) is a string that proves a user is who they say they are. It has three parts separated by dots:

```
header.payload.signature
```

When a user logs in, the server creates a JWT and sends it back. The client stores it and sends it with every subsequent request. The server verifies the signature to trust the user's identity.

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

**bcrypt** is a password hashing library. It never stores the actual password — only a cryptographic hash:

```js
// Registration — hash password before storing
const passwordHash = await bcrypt.hash(password, 12); // 12 salt rounds

// Login — compare entered password against stored hash
const passwordValid = await bcrypt.compare(password, user.password_hash);
```

**Why not just store the password?** If the database is ever breached, the hashed passwords cannot be reversed into plaintext. The `12` salt rounds makes brute-forcing computationally expensive.

### What is Joi? (from our last conversation)

**Joi** is a validation library that defines a "schema" — a set of rules describing what data should look like. Think of it like a checklist for your data:

```js
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().trim().lowercase().required(),
  phone: Joi.string().pattern(/^\+65[689]\d{7}$/).optional().allow(""),
  password: Joi.string()
    .min(8)
    .pattern(/(?=.*[A-Z])(?=.*\d)/)  // At least 1 uppercase + 1 digit
    .required(),
  password_confirm: Joi.string().valid(Joi.ref("password")).required(),
});
```

| Rule | Meaning |
|------|---------|
| `.min(2)` | At least 2 characters |
| `.max(100)` | At most 100 characters |
| `.trim()` | Remove whitespace from ends |
| `.required()` | Must be provided |
| `.email()` | Must be valid email format |
| `.lowercase()` | Convert to lowercase automatically |
| `.pattern(...)` | Must match this regular expression |
| `.valid(Joi.ref("password"))` | Must match the `password` field |
| `.optional().allow("")` | Can be omitted or empty string |

**What happens when validation fails?** Joi returns a `details` array with one entry per validation failure. The service transforms this into a detailed error:

```js
// Response to the client:
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed. Please check your inputs.",
    "details": {
      "password": "Password must contain at least one uppercase letter and one number.",
      "name": "Name must be at least 2 characters."
    }
  }
}
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
  "error": {
    "code": "rate_limited",
    "message": "Too many requests. Please try again later."
  }
}
```

### Error Format Contract

**Every** error response follows this shape:

```json
{
  "error": {
    "code": "string_error_code",
    "message": "Human-readable explanation"
  }
}
```

Some errors include an optional `details` object with field-level errors (from Joi validation).

**Standard error codes:**

| Code | HTTP Status | Meaning |
|------|------------|---------|
| `validation_error` | 400 | Invalid input data |
| `email_taken` | 409 | Email already registered |
| `phone_taken` | 409 | Phone already registered |
| `invalid_credentials` | 401 | Wrong email or password |
| `account_disabled` | 403 | Account deactivated by admin |
| `no_token` | 401 | No authorization header |
| `invalid_format` | 401 | Wrong auth header format |
| `token_expired` | 401 | Token expired or invalid |
| `unauthenticated` | 401 | Not logged in |
| `forbidden` | 403 | Wrong role for this action |
| `rate_limited` | 429 | Too many requests |
| `not_found` | 404 | User/record not found |

### Auth Middleware Chain

Protected routes pass through up to three middleware layers:

```js
// auth.routes.js — register (no auth needed, just rate limit)
router.post("/register", authRegister, controller.register);

// auth.routes.js — profile (must be logged in)
router.get("/me", authenticate, controller.getProfile);

// admin.routes.js — must be admin
router.use(authenticate, requireAdmin);
```

1. **`authenticate`** (`auth.middleware.js`) — checks the `Authorization: Bearer <token>` header, decodes the JWT, attaches `req.user = { id, role }`
2. **`authorize("admin")`** or **`requireAdmin`** (`role.middleware.js`) — checks that `req.user.role` is in the allowed list
3. **Individual route middleware** — optional per-route rate limiting (e.g., `authStrict` for login)

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
| `id` | SERIAL (auto-increment) | Primary key |
| `email` | VARCHAR(255) UNIQUE | Login identifier |
| `password_hash` | TEXT | bcrypt hash, never plaintext |
| `name` | VARCHAR(255) | Display name |
| `phone` | VARCHAR(20) | Optional SG number |
| `role_id` | INTEGER FK → roles | Volunteer, Organiser, Admin, Merchant |
| `points` | INTEGER DEFAULT 0 | Reward points balance |
| `volunteer_qr_code` | VARCHAR(36) UNIQUE | UUID for QR attendance |
| `status` | VARCHAR(20) DEFAULT 'active' | active / disabled |
| `refresh_token` | TEXT | Stored for token rotation |

### Migration System

Database changes are versioned as SQL files in `backend/migrations/`:

```
001_create_roles.sql
002_create_users.sql
003_create_organizations.sql
...
012_create_redemption_logs.sql
```

The migration runner (`backend/src/utils/migrationRunner.js`) reads these files in order and executes them against the database. Each migration tracks its execution status to avoid running twice.

---

## 5. Admin Web Portal

### Pages Built

| Page | File | Purpose |
|------|------|---------|
| Login | `login.html` | Admin authentication via POST /api/auth/login |
| Dashboard | `dashboard.html` | 5 metric cards + quick actions + recent activity |
| Users | `users.html` | Searchable user table with inline details + deactivate/reactivate |
| Organisers | `organisers.html` | Organiser applications with approve/reject workflow |

### Shared Infrastructure

**`shared/api.js`** — A reusable HTTP client used by all admin pages:

```js
// All functions auto-attach the auth token from localStorage
// On 401, auto-redirect to login page

const data = await apiGet('/admin/dashboard');
const user = await apiGet('/admin/users', { page: 1, search: 'john' });
await apiPut('/admin/organisers/5/approve', { status: 'approved' });
```

**`shared/admin.css`** — Complete stylesheet covering sidebar layout, dashboard cards, tables, badges, modals, pagination, and responsive design.

### Key Pattern: Click-to-Expand Details

The users page demonstrates how we fetch additional data on-demand. Clicking a user row opens an inline detail section that calls `GET /api/admin/users/:id` for that specific user:

```js
async function toggleUserDetail(userId) {
  // Close all other open details
  // Open this user's detail row
  // Fetch data from API
  const data = await apiGet('/admin/users/' + userId);
  // Populate detail fields: events attended, points earned/redeemed, join date
}
```

This pattern keeps the initial page load fast while still providing detailed information when needed.

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

### Auth Flow in Mobile

1. **Registration** → `POST /api/auth/register` → stores token in `expo-secure-store`
2. **Login** → `POST /api/auth/login` → stores token + calculates expiry
3. **API calls** → reads token from `expo-secure-store`, attaches as `Authorization: Bearer <token>`
4. **Logout** → clears in-memory token (note: needs to also clear SecureStore — see known issues below)

### Components Library

All UI components live in `mobile_app/src/components/`:

- **Button** — 3 variants (primary/secondary/tertiary), loading state
- **Input** — Label, error text, focus states, validation feedback
- **Card** — Tappable card with platform-aware shadows
- **Toast** — Animated notifications (success/error/info)
- **Badge** — Status badges (approved/pending/rejected)
- **EmptyState** — Screen with icon, message, action button
- **ErrorState** — Error screen with retry button
- **LoadingSpinner** — Loading indicator with optional message

---

## 7. Web UI Prototypes

The `frontend/web_UI/` folder contains visual mockups from Nurain:

**Admin Prototype** — Dashboard, users, events, coupons, rewards config, redemptions, merchants, QR codes, campaigns.

**Organiser Prototype** — Login, registration, dashboard, events, event editor, feedback viewer, event assessment, onsite attendance controller.

> **Note:** These are visual mockups only. They contain no API calls or backend integration — all data is hardcoded HTML. The existing admin portal at `web_portal/admin/` is the functional version with real API wiring.

---

## 8. Key Design Decisions

### Why no ORM? (Why raw SQL?)

We use raw SQL queries with the `pg` library instead of an ORM like Sequelize or TypeORM.

**Reasons:**
- Full control over SQL — we can write optimized queries for our specific schema
- Easier to debug — you can copy the query and run it directly in PostgreSQL
- Lighter learning curve — team members already know SQL from the database module

**Trade-off:** We write more code for simple CRUD operations, but we have complete visibility into what the database receives.

### Why parameterized queries?

```js
// GOOD (parameterized)
pool.query("SELECT * FROM users WHERE email = $1", [userInput]);

// BAD (string interpolation - SQL injection risk!)
pool.query("SELECT * FROM users WHERE email = '" + userInput + "'");
```

Parameterized queries (`$1`, `$2`) prevent **SQL injection** — a type of attack where malicious input is interpreted as SQL code instead of data.

### Why Joi for validation?

**Server-side validation** (Joi in the backend) is the **last line of defense** against bad data. Even if the frontend validates perfectly, an attacker can send raw HTTP requests to bypass it.

Joi gives us:
- Declarative schemas that are easy to read and maintain
- Detailed error messages per field
- Automatic type coercion and sanitization (e.g., `lowercase()` for emails)
- No need to write manual `if/else` checks for every field

### Why token rotation for refresh tokens?

When a user requests a new access token, we:
1. Check their refresh token against what's stored in the database
2. Generate a **new** refresh token and store it (the old one becomes invalid)
3. If someone tries to use an already-rotated token, we revoke ALL tokens for that user

This prevents **token theft attacks** — if someone steals a refresh token, it will only work once before the legitimate user's next request invalidates it.

### Why vertical slices instead of layers?

Traditional web projects split by layer (frontend team, backend team, database team). A capstone project needs **every member** to demonstrate full-stack work individually.

Vertical slices guarantee that at every sprint checkpoint, each person has:
- Backend commits with route/controller/service code
- Frontend screens connected to their APIs
- A working demo of their feature end-to-end
- Individual contribution evidence for assessment

---

## 9. Anticipated Q&A

Below are questions examiners are likely to ask, with concise answers the team should practice.

### Architecture & Design

**Q: Why did you choose Express.js for the backend?**

A: We chose Express because it's lightweight, unopinionated, and widely used. The team was already familiar with JavaScript from the web development module, so we didn't need to learn a new language. Express's middleware pattern lets us compose features cleanly — auth, rate limiting, error handling are all just stacked middleware functions.

**Q: Why are you using raw SQL instead of an ORM?**

A: Raw SQL gives us full control over query performance and makes debugging easier — we can copy any query from the code and run it directly in PostgreSQL. For a project with 12 tables and specific query patterns (aggregations for dashboard metrics, joins for user profiles), ORMs often generate inefficient queries.

**Q: Explain the vertical slice architecture and why you chose it.**

A: Each team member owns complete features end-to-end — from the database query to the user interface. This ensures everyone has full-stack contribution evidence for assessment, prevents bottlenecks (no single backend person blocking everyone), and makes integration easier because each slice is self-contained.

### Authentication & Security

**Q: How do you handle authentication?**

A: We use JWT (JSON Web Tokens) with a two-token system. When a user logs in, the server issues an access token (valid 15 minutes) and a refresh token (valid 7 days). The access token is sent with every API call in the Authorization header. When it expires, the client uses the refresh token to get a new one without asking the user to log in again.

**Q: How do you protect user passwords?**

A: Passwords are never stored in plaintext. We hash them with bcrypt using 12 salt rounds (2^12 iterations). If the database were ever breached, the hashes cannot be reversed into original passwords. Bcrypt also handles the salting automatically — each password gets a unique salt, so two users with the same password will have different hashes.

**Q: What prevents brute-force login attacks?**

A: We have three layers of rate limiting:
1. Global: 100 requests per 15 minutes on all routes
2. Login: 10 attempts per minute
3. Register: 5 attempts per minute
These are enforced server-side using the `express-rate-limit` package, which tracks request counts by IP address.

**Q: What is Joi and why do you use it?**

A: Joi is a validation library that defines schemas for data validation. We use it to validate all user inputs server-side before processing. For example, the registration schema checks that names are 2-100 characters, emails are valid format, passwords have at least one uppercase letter and one number, and the confirmation field matches. Server-side validation is essential because frontend validation can be bypassed.

**Q: What is the error format and why did you standardize it?**

A: All errors follow `{ error: { code, message } }`. The `code` is a machine-readable string like `invalid_credentials` that the frontend can use for conditional logic. The `message` is human-readable for display to users. This contract is documented in `API_CONTRACTS.md` and enforced across all middleware and services.

### Database

**Q: How do you manage database schema changes?**

A: We use numbered SQL migration files in `backend/migrations/` executed by a migration runner. Each file creates or alters tables. New migrations are additive — we never modify existing ones. This gives us a version history of the schema that any team member can replay.

**Q: Explain the points system in the database.**

A: The `users` table has a `points` column (integer, default 0). Volunteers earn points through attendance at events. When they redeem points for coupons, the redemption is recorded in `redemption_logs`, and the user's points are deducted. The current balance is always `users.points` — we don't calculate it from logs for performance reasons.

### Frontend

**Q: How does the admin portal connect to the backend?**

A: The admin HTML pages use a shared JavaScript module (`api.js`) that wraps `fetch()` with automatic authentication. It reads the JWT token from `localStorage`, attaches it as a Bearer token in the Authorization header, and handles 401 errors by redirecting to the login page. The Express server serves these HTML files as static assets.

**Q: How does the mobile app handle authentication state?**

A: The Expo Router layout (`_layout.tsx`) checks for a stored token on app launch. If a token exists, the user sees the main tabs (home, events, rewards, profile). If not, they see the auth flow (onboarding, login, register). The token persists in Expo SecureStore, which uses the device's secure storage (Keychain on iOS, EncryptedSharedPreferences on Android).

### Known Issues (things the team should be aware of)

**Mobile app API path bug** — The API base URL is set to `http://localhost:3000/api` but most screens prepend `/api/` to their endpoint paths, resulting in double `/api/api/` URLs and 404 errors. Fix: either remove `/api` from `API_BASE` or from the screen paths.

**Mobile logout doesn't clear SecureStore** — `profile.tsx` clears the in-memory token but not the stored one. The stale token persists and will be re-read on next launch. Fix: add `await clearAuth()` before navigation.

**Web UI prototypes are visual only** — Nurain's admin and organiser prototypes have no API calls. They use hardcoded data. These need backend wiring before they can function.

---

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `backend/index.js` | Express server entry point. Middleware stack + route registration |
| `backend/src/routes/*.js` | Route definitions (URL → controller mapping) |
| `backend/src/controllers/*.js` | Thin HTTP layer (parse request, call service, send response) |
| `backend/src/services/auth.service.js` | Auth business logic (register, login, refresh, profile) |
| `backend/src/middleware/auth.middleware.js` | JWT token verification |
| `backend/src/middleware/role.middleware.js` | Role-based access control |
| `backend/src/middleware/rateLimiter.middleware.js` | Rate limiting config |
| `backend/src/middleware/errorHandler.middleware.js` | Global error handler + `createError` factory |
| `backend/src/utils/jwt.js` | JWT sign/verify utilities |
| `backend/src/config/database.js` | PostgreSQL connection pool |
| `backend/src/utils/migrationRunner.js` | Runs migration files |
| `backend/src/utils/seed.js` | Seeds test data |
| `backend/migrations/*.sql` | Database schema versioning |
| `frontend/web_portal/shared/api.js` | Admin portal HTTP client |
| `frontend/web_portal/admin/*.html` | Admin portal pages |
| `frontend/mobile_app/app/` | Expo Router screens |
| `frontend/mobile_app/src/services/api.ts` | Mobile app API client |
| `frontend/mobile_app/src/components/*.tsx` | Shared React Native components |

---

> Tip: Each team member should focus on their own slice in detail,
> but also understand the auth system and error contract since every
> feature depends on them.
