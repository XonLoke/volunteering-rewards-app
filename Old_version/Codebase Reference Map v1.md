# Codebase Reference Map v1

> **Purpose:** Complete inventory of every file in the Volunteering Rewards App project — what it does, who owns it, and what to say when Andy or an examiner asks about it.
>
> **Project:** Volunteering Rewards App  
> **Last updated:** 16 May 2026  
> **Owner:** All team members (see per-file assignments)

> ⚠️ **Keep this document updated.** Whenever a file is added, removed, or significantly changed, update this reference.

---

## Table of Contents

1. [Project Root](#1-project-root)
2. [Backend — Root Files](#2-backend--root-files)
3. [Backend — Config](#3-backend--config)
4. [Backend — Middleware](#4-backend--middleware)
5. [Backend — Auth Service](#5-backend--auth-service)
6. [Backend — Controllers](#6-backend--controllers)
7. [Backend — Routes](#7-backend--routes)
8. [Backend — Utilities](#8-backend--utilities)
9. [Frontend — Mobile App](#9-frontend--mobile-app-expo--react-native)
10. [Frontend — Web Portals](#10-frontend--web-portals-react--vite)
11. [Frontend — Prototypes & Specs](#11-frontend--prototypes--specs)
12. [Infrastructure & DevOps](#12-infrastructure--devops)
13. [Planning & Management Documents](#13-planning--management-documents)

---

## 1. Project Root

### Root Documentation Files

| File | Purpose | Owner | When asked by Andy/Examiner |
|------|---------|-------|----------------------------|
| `API_CONTRACTS.md` | Frozen specification of every API endpoint — request shapes, response shapes, error codes, and HTTP status codes for all 59 API calls across mobile app, web portals, scanning app, and merchant app. This is the **single source of truth** that all frontend and backend code must conform to. | Xon | "This is our contract-first approach. Every endpoint was specified before any frontend or backend code was written. All team members reference this document when building their slices to ensure frontend and backend align." |
| `AI_GENERATION_PROMPTS.md` | Collection of AI prompts used to generate code for the project. Documents what each prompt was designed to produce and which parts of the codebase it generated. | Xon | "We used AI-assisted development. This document records every prompt we used so we can trace generated code back to its instructions, explain AI-generated decisions, and regenerate if needed." |
| `TEAM_WORKFLOW.md` | Defines team roles, responsibilities, PR approval process, concentrated generation approach, and quality gates. Explains the WATD hybrid model and how the team coordinates. | Xon | "This is our team operating manual. It defines who owns what, how code gets reviewed (two approvals required per PR), and how we prevent integration issues. It was approved by the team and shared with Andy." |
| `DAILY_WORKFLOW.md` | Day-by-day checklist for what each team member should be doing during each sprint. Quick-reference task list. | Xon | "A simplified daily checklist so team members know exactly what to work on without re-reading the full sprint plan every time." |
| `Sprint Breakdown v4.md` | Detailed sprint-by-sprint plan for all 5 sprints (7 May – 6 Jul). Lists every task ID (INF-, AUTH-, EVT-, REW-, MOB-, WEB-, etc.), who owns it, and deliverable checklists per sprint. | Xon | "Our project timeline broken into 5 sprints. Each sprint has specific deliverables per person. The July target is an internal stretch goal — the plan also documents what gets descoped if we slip." |
| `PROPOSAL_WATD_METHOD.md` | Proposal document submitted to Andy explaining the WATD hybrid development model. | Xon | "This was our initial proposal to Andy. After his feedback, we moved to vertical slices (each person owns full-stack features), but this document still records our rationale and discussion history." |
| `MIGRATION_GUIDE.md` | Instructions for setting up the database — how to run migrations, seed data, and connect to Supabase. Onboarding guide for new team members. | Xon | "Quick-start guide for anyone who needs to set up the database locally. Covers migration commands, seed commands, and Supabase connection setup." |
| `Pre-Implementation Report v1.md` | Pre-development architecture report covering database design, API architecture, tech stack decisions, and risk assessment. | Xon | "Our pre-implementation report. It documents why we chose Express + PostgreSQL, our 12-table database design, the API design decisions, and risks we identified before writing code." |
| `Vertical Slice Technical Guide v2.md` | Guide for the vertical slice approach — per-person slice assignments, code patterns all members must follow, AI prompts for each member, integration guardrails, and auth reference. | Xon | "After Andy's feedback, we restructured into vertical slices. This guide gives every team member the exact code patterns and AI prompts to ensure all four slices integrate cleanly. Think of it as the shared DNA — everyone's AI reads the same instructions and produces code that looks like one person wrote it." |
| `Virtual Team Output Report v1.md` | Sprint 1 progress report covering backend completion, auth module, API audit results, TypeScript fixes, and workspace VM resolution. | Xon | "Our Sprint 1 completion report. Documents what was built (28 backend files, auth system, 12 DB tables), what was audited (API contract compliance — 4 gaps found and fixed), and issues resolved." |
| `Virtual Team Output Report v2.md` | Updated report with verification section — TypeScript compilation results, Vite build results, and detailed fix descriptions. | Xon | "Updated report after running TypeScript and Vite verification. Confirms all code compiles without errors." |
| `Virtual Team Output Report v3.md` | Final Sprint 1 report with complete build verification results and workspace fix details. | Xon | "Final Sprint 1 close-out report." |
| `Draft Reply to Andy re Vertical Slices.md` | Draft response to Andy acknowledging his feedback and proposing the vertical slice reallocation with revised sprint plan and descope options. | Xon | "Our draft reply to Andy's feedback. It acknowledges his concerns and proposes the restructured approach. Pending team discussion before sending." |

### Root Config Files

| File | Purpose | Owner | Technical details |
|------|---------|-------|-------------------|
| `Dockerfile` | Multi-stage Docker build configuration for containerised deployment. Uses `node:20-alpine`. Copies backend source code and frontend static files into the container. | Xon | `FROM node:20-alpine` → `WORKDIR /app` → `npm ci --only=production` → `COPY backend/ .` → `EXPOSE 3000` → `CMD ["node", "index.js"]` |
| `docker-compose.yml` | Docker Compose configuration defining two services: `app` (the Express server) and `db` (PostgreSQL 16 Alpine with health check). Database data persists via a named volume `pgdata`. | Xon | Two services: `app` (builds from Dockerfile, port 3000, depends on healthy db) and `db` (postgres:16-alpine, port 5432, health check via pg_isready). Environment variables passed from `.env` file. |
| `fix_workspace.ps1` | PowerShell script that diagnoses and repairs the Claude Desktop Linux workspace VM. Checks CoworkVMService status, Windows virtualization features, VM bundle integrity, and provides step-by-step repair options. | Xon | "Created because the Linux workspace VM kept failing on Windows. The script automates diagnosis and repair — checks service status, Hyper-V features, VM bundle files, and logs." |
| `generate_proposal_docx.py` | Python script that converts markdown proposal documents into professionally formatted .docx files. Uses python-docx library. | Xon | "Converts our markdown reports to Word documents for submission. Saves time vs manually formatting in Word." |
| `npm` | Empty placeholder file. Appears to be a leftover artifact — contains no content. | — | Empty file, can be deleted. |

---

## 2. Backend — Root Files

### `backend/`

| File | Purpose | Owner | Lines | Technical details |
|------|---------|-------|-------|-------------------|
| `backend/index.js` | **Express server entry point.** Configures the middleware stack (helmet, cors, JSON parser, rate limiter), mounts all 9 route groups under `/api/`, adds a health check endpoint (`GET /api/health`), a 404 handler, and the global error handler. Starts the server on port 3000. | Xon | 74 | Middleware order matters: helmet → cors → json → rateLimiter → static files → health check → routes → 404 → errorHandler. Route groups: `/api/auth`, `/api/events`, `/api/attendance`, `/api/me`, `/api/favorites`, `/api/rewards`, `/api/organiser`, `/api/admin`, `/api` (merchant). |
| `backend/package.json` | Node.js manifest — defines project metadata, scripts (`start`, `dev`, `migrate`, `seed`), and dependencies. 10 production dependencies: express, pg, bcrypt, jsonwebtoken, helmet, cors, dotenv, joi, express-rate-limit, uuid. | Xon | — | Scripts: `npm run migrate` → runs migrationRunner.js, `npm run seed` → runs seed.js, `npm run dev` → node --watch index.js (auto-restart on file change), `npm start` → node index.js. |
| `backend/package-lock.json` | Auto-generated lock file from npm. Pins exact versions of every dependency and sub-dependency. Do not edit manually. | — | — | Generated by `npm install`. Commit to git. |
| `backend/.env` | **Environment variables** — database connection (host, port, name, user, password), JWT secrets (access + refresh), JWT expiry durations (15 min access, 7 days refresh), rate limit config, and server port. | Xon | — | **Contains actual credentials.** Do not commit to git. `.env.example` is the template without real credentials. |
| `backend/.env.example` | Template `.env` file with placeholder values. Documented in git as the reference for what environment variables are needed. | Xon | — | All keys documented with comments explaining each variable's purpose. New devs copy this to `.env` and fill in their values. |
| `backend/Volunteering_Rewards_API.postman_collection.json` | Postman collection with 7 pre-configured API requests covering registration, login, token refresh, profile retrieval, and error cases. Includes auto-token test scripts that extract the access token from login/register responses and set it as a collection variable for subsequent authenticated requests. | Xon | — | When asked: "We use Postman for API testing. This collection has 7 requests covering the auth workflow — register, login, refresh, profile, plus error cases. The test scripts automatically capture and reuse tokens so you can test the full flow with one click. It can be imported into Postman or Bruno." |

---

## 3. Backend — Config

### `backend/src/config/`

| File | Purpose | Owner | Lines | Technical details |
|------|---------|-------|-------|-------------------|
| `backend/src/config/database.js` | **PostgreSQL connection pool** using the `pg` library. Creates a `Pool` instance with config from environment variables (host, port, database, user, password). Pool is configured with max 20 connections, 30s idle timeout, 5s connection timeout. Exports `pool` (for queries) and `checkConnection()` (returns boolean for health checks). Pool event listeners log client acquisition and errors. | Xon | 44 | `const pool = new Pool({ host, port, database, user, password, max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 })`. In Supabase mode, `DB_HOST` is set to the Supabase database URL. The `checkConnection()` function runs `SELECT 1` and returns true/false. |

---

## 4. Backend — Middleware

### `backend/src/middleware/`

| File | Purpose | Owner | Lines | Technical details |
|------|---------|-------|-------|-------------------|
| `auth.middleware.js` | **JWT authentication middleware (AUTH-03).** Extracts the Bearer token from the `Authorization` header, verifies it using `verifyAccessToken()` from jwt.js, and attaches `req.user = { id, role }` for downstream use. Returns 401 if token is missing, malformed, or expired. | Xon | 39 | Must be used on any route that requires authentication. Expects `Authorization: Bearer <token>` format. `req.user` is available to all subsequent middleware and controllers. |
| `role.middleware.js` | **Role-based access control middleware (AUTH-04).** Provides two factories: `authorize(...roles)` returns middleware that checks `req.user.role` against allowed roles (returns 403 if not allowed). `roleGuard(roles)` returns an object with named guards (`requireVolunteer`, `requireOrganiser`, `requireAdmin`, `requireMerchant`) for cleaner syntax. Must be used AFTER `authenticate`. | Xon | 50 | `authorize("admin")` — single role. `authorize("merchant", "admin")` — multi-role. `roleGuard(["volunteer", "organiser"])` → destructure for named guards. `roleGuard` only creates guards for roles passed to it; missing roles become pass-through no-ops. |
| `errorHandler.middleware.js` | **Global error handler middleware (INF-06).** Express error-handling middleware (4-parameter signature). Catches all errors passed via `next(err)`. Returns consistent JSON response with status code, error message, and optional validation details. In production, 500-level errors return generic "Internal server error" instead of leaking stack traces. 500+ errors are logged to console. Also exports `createError(statusCode, message, details)` factory for creating operational errors. | Xon | 49 | Registered last in the middleware stack (after all routes). Detectable by 4-parameter `(err, req, res, next)` Express signature. `createError(404, "Event not found")` usage pattern in controllers/services. |
| `rateLimiter.middleware.js` | **Rate limiting middleware (AUTH-10).** Uses `express-rate-limit`. Two configs: `global` rate limiter (100 requests per 15-minute window) on all routes, and `authStrict` rate limiter (10 requests per 15-minute window) on login endpoint only to prevent brute-force attacks. | Xon | 28 | `global` → 100/15min, applies to all routes. `authStrict` → 10/15min, applied only on `POST /api/auth/login`. Uses in-memory store (default) — resets on server restart. For production with multiple instances, would need Redis store. |

---

## 5. Backend — Auth Service

### `backend/src/services/`

| File | Purpose | Owner | Lines | Technical details |
|------|---------|-------|-------|-------------------|
| `auth.service.js` | **Auth business logic layer (AUTH-01, AUTH-02, AUTH-05, AUTH-06).** Contains all auth-related database queries and logic: `register` (validates input with Joi, hashes password with bcrypt, inserts user, generates tokens), `login` (finds user by email, compares password, generates tokens), `refreshTokens` (verifies refresh token, checks reuse detection, rotates tokens), and `getProfile` (fetches user profile by ID). Password hashing uses bcrypt with 12 salt rounds. Token generation uses JWTs with configurable expiry. | Xon | 273 | Key implementation details: `register()` uses Joi schema validation for email/password/name/role. Password hashing: `bcrypt.hash(password, 12)`. Token pair generation uses `generateAccessToken()` and `generateRefreshToken()` from jwt.js. `refreshTokens()` implements token rotation — old refresh token is invalidated, new pair is issued. If a reused (stolen) refresh token is detected, all tokens for that user are invalidated (security feature). |

---

## 6. Backend — Controllers

### `backend/src/controllers/`

All controllers follow the same pattern: `async function handler(req, res, next)` → try/catch → `next(err)` on failure. They are thin HTTP layers — business logic lives in services.

| File | Purpose | Owner | Status | When asked by Andy/Examiner |
|------|---------|-------|--------|----------------------------|
| `auth.controller.js` | Handles HTTP requests for `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, and `GET /api/auth/profile`. Delegates all business logic to `auth.service.js`. Returns standardised JSON responses with user data and tokens. | Xon | ✅ Implemented | "This is the HTTP interface for our auth system. Each function parses the request, calls the auth service, and formats the response. Errors are passed to the global error handler via `next(err)`. It's a thin layer — all business logic, password hashing, and token generation happens in the service layer below." |
| `events.controller.js` | Stub handler for event CRUD, categories, detail, join/leave, feedback, Q&A, today's events, and roster. Each function currently returns placeholder data pending implementation by Vivian. Response shapes documented in API_CONTRACTS.md. | Vivian | ⏳ Stub | "The controller functions are stubs returning placeholder data. They implement the correct response shapes as specified in API_CONTRACTS.md, but the business logic — database queries, search/filter, registration validation — needs to be implemented in the event service layer." |
| `attendance.controller.js` | Stub handler for attendance marking, attendance log retrieval, and points award. | Vivian | ⏳ Stub | "Attendance controller handles QR scan verification (marked by organiser), logs who attended which event, and awards points to volunteers. Currently stubbed." |
| `favorites.controller.js` | Stub handler for toggling and listing favourite events. | Vivian | ⏳ Stub | "Volunteers can favourite events for quick access. This controller handles the toggle (add/remove) and list operations. Currently stubbed." |
| `me.controller.js` | Stub handler for the volunteer's own profile, stats, and activity history. | Nurain | ⏳ Stub | "Returns the authenticated user's own data — profile details, points balance, attendance history, and redemption history. The `authenticate` middleware identifies which user via `req.user.id`." |
| `rewards.controller.js` | Stub handler for browsing rewards (`GET /api/rewards`), reward detail (`GET /api/rewards/:id`), and coupon redemption with PIN generation (`POST /api/rewards/:id/redeem`). | Grace | ⏳ Stub | "Rewards controller handles the volunteer-facing rewards flow. Browse lists available rewards with stock counts. Detail returns single reward info. Redeem generates a 6-digit PIN, deducts points, and creates a user_coupon record." |
| `merchant.controller.js` | Stub handler for merchant coupon verification (`POST /api/coupons/verify`), redemption (`POST /api/coupons/redeem`), reversal (`POST /api/coupons/reverse`, 5-min window), and redemption history (`GET /api/merchant/history`). | Grace | ⏳ Stub | "Merchant controller handles the in-store redemption flow. Cashier enters the 6-digit PIN, the system verifies it's valid and not expired, then marks it as redeemed. Reversal is allowed within 5 minutes. Multiple roles can access this — merchants and admins." |
| `admin.controller.js` | Stub handler for admin operations — user management (list, deactivate), organiser approval, coupon CRUD, redemptions audit, rewards configuration, and QR code generation. | Nurain | ⏳ Stub | "Admin controller handles the system admin portal. All operations require the `admin` role. Covers user management, organiser approval workflow, coupon management, and system monitoring." |
| `organiser.controller.js` | Stub handler for organiser operations — dashboard stats, event CRUD, feedback viewing, Q&A management, and roster viewing. | Nurain | ⏳ Stub | "Organiser controller handles the event organiser portal. Organisers can create/manage events, view volunteer feedback, answer Q&A questions, and see their event rosters." |

---

## 7. Backend — Routes

### `backend/src/routes/`

All route files follow the same pattern: `Router()` → import controller → import middleware → define routes → export `router`.

| File | Endpoints | Owner | Status | Route signatures |
|------|-----------|-------|--------|------------------|
| `auth.routes.js` | `POST /api/auth/register`, `POST /api/auth/login` (rate-limited), `POST /api/auth/refresh`, `GET /api/auth/profile` (authenticated) | Xon | ✅ Implemented | Login uses `authStrict` rate limiter (10/15min). Profile requires `authenticate` middleware. Register and refresh are unauthenticated (public). |
| `events.routes.js` | `GET /`, `GET /categories`, `GET /today` (organiser), `GET /:id`, `POST /:id/register`, `DELETE /:id/register`, `POST /:id/feedback`, `GET /:id/qna`, `POST /:id/qna`, `GET /:id/roster` (organiser) | Vivian | ⏳ Stub | **Critical ordering:** `/today` is registered BEFORE `/:id` to prevent Express from matching "today" as an `:id` parameter. Browse and detail are public (no auth). Volunteer actions (`register`, `feedback`, `qna`) require `authenticate` + `requireVolunteer`. Organiser actions (`today`, `roster`) require `authenticate` + `requireOrganiser`. |
| `attendance.routes.js` | Routes for marking attendance, viewing attendance logs, awarding points | Vivian | ⏳ Stub | All routes require `authenticate` + organiser role. Attendance marking is triggered by QR code scanning. Points are auto-awarded on attendance confirmation. |
| `favorites.routes.js` | Routes for toggling and listing favourite events | Vivian | ⏳ Stub | Requires `authenticate` + volunteer role. Toggle is idempotent — calling it twice will un-favourite. |
| `me.routes.js` | Routes for the volunteer's own profile, stats, and activity history | Nurain | ⏳ Stub | All routes require `authenticate`. Returns data scoped to `req.user.id` — users cannot access each other's data. |
| `rewards.routes.js` | `GET /` (browse), `GET /:id` (detail), `POST /:id/redeem` (redeem with PIN) | Grace | ⏳ Stub | All routes require `authenticate` + volunteer role. Browse lists rewards with `quantity_remaining > 0`. Redeem deduces points and generates 6-digit PIN. **IMPORTANT:** `GET /:id` must be registered AFTER `GET /` but BEFORE `POST /:id/redeem` to avoid route conflicts. |
| `merchant.routes.js` | `POST /coupons/verify`, `POST /coupons/redeem`, `POST /coupons/reverse`, `GET /merchant/history` | Grace | ⏳ Stub | Uses multi-role auth: `authorize("merchant", "admin")`. Mounted at `/api`, so paths are `/api/coupons/verify`, `/api/coupons/redeem`, `/api/coupons/reverse`, `/api/merchant/history`. |
| `admin.routes.js` | Routes for user management, organiser approval, coupon CRUD, redemptions, rewards config, QR codes | Nurain | ⏳ Stub | All routes require `authenticate` + `requireAdmin`. Mounted at `/api/admin`. Full admin CRUD for the system. |
| `organiser.routes.js` | Routes for dashboard, event management, feedback, Q&A, roster | Nurain | ⏳ Stub | All routes require `authenticate` + `requireOrganiser`. Mounted at `/api/organiser`. Routes scope data to the authenticated organiser's own events and organisation. |

---

## 8. Backend — Utilities

### `backend/src/utils/`

| File | Purpose | Owner | Lines | Technical details |
|------|---------|-------|-------|-------------------|
| `jwt.js` | **JWT token utility.** Provides four functions: `generateAccessToken(user)` — signs JWT with user `{ id, role }` using ACCESS_SECRET, expires in 15 min. `generateRefreshToken(user)` — signs with `{ id }` using REFRESH_SECRET, expires in 7 days. `verifyAccessToken(token)` / `verifyRefreshToken(token)` — verify and decode, return null on failure. Secrets read from env vars with dev fallbacks. | Xon | 77 | Token payload: Access token carries `{ id, role }` so middleware can check roles without a DB query. Refresh token only carries `{ id }` — it's only used to obtain new token pairs. Expiry is configurable via env vars. |
| `migrationRunner.js` | **Database migration runner (INF-03).** Reads all `.sql` files from the `migrations/` directory (sorted alphabetically by filename), connects to the database, and executes each file in order. Uses a database transaction per migration. Reports success/failure per file. Uses `IF NOT EXISTS` on all CREATE statements so it's safe to re-run. | Xon | 69 | `npm run migrate` → `node src/utils/migrationRunner.js`. Files executed in numeric/alphabetical order. Uses `pool.connect()` for a dedicated client. On any failure, the migration stops (no partial migration state). |
| `seed.js` | **Test data seeder (INF-04).** Populates the database with reference data: 3 roles (volunteer, organizer, admin), 3 test users (Alice Volunteer 500pts, Bob Organizer, Carol Admin), 1 organisation (Green Earth Society, pre-approved), 3 sample events (Beach Cleanup, Elderly Walk, Food Distribution), and 3 sample coupons (FairPrice $5, Kopitiam set, GrabFood $10). Uses `ON CONFLICT DO NOTHING` so safe to re-run. All test users have password `password123`. | Xon | 182 | `npm run seed` → `node src/utils/seed.js`. Wrapped in a transaction (BEGIN/COMMIT) so partial failures roll back cleanly. Test user passwords hashed with bcrypt (12 rounds). Alice gets 500 starting points for testing rewards. Bob is linked as organiser of Green Earth Society. Events are dated June 2026. |

---

## 9. Frontend — Mobile App (Expo / React Native)

### `frontend/mobile_app/`

#### Root Config Files

| File | Purpose | Owner | Technical details |
|------|---------|-------|-------------------|
| `App.tsx` | Expo Router entry point. Single line: imports and exports `ExpoRouter`. This delegates all routing to the file-system-based expo-router. | Vivian | `export default ExpoRouter` — file-based routing means each `.tsx` file in `app/` becomes a route automatically. |
| `app.json` | Expo configuration — app name ("Volunteering Rewards"), slug, version 1.0.0, portrait orientation, URL scheme "vrewards", iOS + Android bundle identifiers, and plugins (expo-router, expo-secure-store, expo-camera for QR scanning). | Vivian | Plugins: `expo-router` (file-based navigation), `expo-secure-store` (secure token storage), `expo-camera` (QR scanning, with camera permission prompt text). |
| `package.json` | Dependencies: expo, expo-router, expo-camera, expo-secure-store, react, react-native, and related packages. | Vivian | Managed Expo workflow. No native build configuration needed — Expo handles iOS and Android builds. |
| `babel.config.js` | Babel configuration for Expo. Typically wraps `babel-preset-expo`. | Vivian | Standard Expo babel config. May include module-resolver alias for `@/` → `src/`. |
| `tsconfig.json` | TypeScript configuration. Extends `expo/tsconfig.base`. Strict mode enabled. Module resolution set to "bundler" (required for Expo SDK 52+). Path alias `@/*` → `src/*`. | Vivian | Path alias reduces relative import depth: `import { api } from '@/services/api'` instead of `../../src/services/api`. |

#### Mobile App Screens (`mobile_app/app/`)

| File | Purpose | Owner | When asked |
|------|---------|-------|------------|
| `app/_layout.tsx` | Root layout component. Wraps the entire app with providers (auth context, navigation container). Sets up the root layout stack. | Vivian | "The root layout wraps the app with context providers and defines the top-level navigation structure — auth screens vs main tab screens." |
| `app/index.tsx` | App entry screen. Usually checks auth state and redirects to either onboarding/login or the main tabs. | Vivian | "The first screen the app loads. If the user is logged in, they go to the home tab. If not, they see the onboarding flow." |
| `app/(auth)/_layout.tsx` | Auth flow layout — groups the onboarding, login, and register screens together. | Vivian | "Groups the auth flow screens. When the user completes auth, they transition to the main tab group." |
| `app/(auth)/onboarding.tsx` | 3-step onboarding walkthrough shown on first launch. Introduces the app's features (browse events, scan QR, redeem rewards). | Vivian | "A 3-step carousel that new users see on first launch. It explains the app's core loop: find events → attend & scan → earn points → redeem rewards." |
| `app/(auth)/register.tsx` | Registration screen — email, password, name, role selection. Validates input and calls `POST /api/auth/register`. | Vivian | "Registration form with validation. Calls the register endpoint and stores the returned tokens in secure storage." |
| `app/(auth)/login.tsx` | Login screen — email and password fields. Calls `POST /api/auth/login`. Handles error states (invalid credentials, network error). | Vivian | "Login form with email and password. Calls login endpoint, stores tokens. Credential errors show inline messages." |
| `app/(tabs)/_layout.tsx` | Bottom tab navigator layout — defines the 4 main tabs: Home, Events, Rewards, Profile. Custom tab bar styling using the theme. | Vivian | "Bottom tab navigation with 4 tabs. Each tab has a custom icon and label. Uses the app's design system for colors and typography." |
| `app/(tabs)/home.tsx` | Home screen — shows upcoming events, quick stats (points, events attended), and a welcome message with the user's name. | Vivian | "The default tab. Shows a personalised welcome, the user's points balance, upcoming registered events, and quick action buttons." |
| `app/(tabs)/events.tsx` | Events browse screen — searchable, filterable list of available volunteering events. Shows event cards with title, date, location, category badge, and points value. | Vivian | "Browse screen for all available events. Users can search by keyword and filter by category. Each event card shows key info at a glance." |
| `app/(tabs)/events/[id].tsx` | Event detail screen — full event information, join/leave button, feedback form, Q&A section. Shows whether the user is registered. | Vivian | "Full event detail with description, location map (or address), date/time, organiser info, and action button to join/leave. Below the fold: feedback form and Q&A section." |
| `app/(tabs)/events/my.tsx` | My Events screen — lists the user's upcoming registered events and past attended events with points earned per event. | Vivian | "Shows two lists: upcoming events the user has joined, and past events they attended with points earned. Each past event shows feedback status." |
| `app/(tabs)/rewards.tsx` | Rewards catalog screen — tabbed view with "Online" and "In-Store" categories. Shows reward cards with image, title, points cost, and remaining quantity. | Grace | "Browse available rewards. Two tabs filter by reward type. Each card shows the item and its points cost. Tapping navigates to the detail/redeem screen." |
| `app/(tabs)/rewards/[id].tsx` | Reward detail + redemption screen — shows full reward info, quantity remaining, and a "Redeem" button. On redemption, displays the 6-digit PIN code and confirmation. | Grace | "Shows reward details and the redeem button. After successful redemption, displays the 6-digit PIN prominently so the volunteer can show it to the cashier." |
| `app/(tabs)/profile.tsx` | Profile screen — user info, points balance, attendance stats, settings (logout, app info). Uses `setAuthToken(null)` for logout. | Vivian | "Shows the volunteer's profile — name, email, role badge, points balance, total events attended, and total rewards redeemed. Logout button clears the auth token and navigates to login." |

#### Mobile Shared Components (`mobile_app/src/components/`)

| File | Purpose | Owner | Technical details |
|------|---------|-------|-------------------|
| `Button.tsx` | Reusable button component with 3 variants: primary (green background), secondary (green border outline), tertiary (transparent with blue text). Supports `loading` (shows ActivityIndicator) and `disabled` states. | Vivian | Props: `title`, `onPress`, `variant`, `disabled`, `loading`, `style`. Uses theme colors and border radius. Loading spinner color adapts to variant. |
| `Card.tsx` | Card container component with consistent shadow, border radius, and padding. Used as the wrapper for list items across the app. | Vivian | Provides standard card styling consistent with the design system. Accepts custom styles via `style` prop. |
| `Input.tsx` | Text input component with label, error message display, and optional icon. Styled consistently with the theme. | Vivian | Props: `label`, `value`, `onChangeText`, `error`, `placeholder`, `secureTextEntry`, `icon`. Error state shows red border and error message below input. |
| `Badge.tsx` | Small label/tag component used for status indicators (event category, coupon type, role). Configurable color. | Vivian | Used on event cards (category badge), rewards (type badge), and profile (role badge). |
| `LoadingSpinner.tsx` | Full-screen or inline loading indicator. Used while data is being fetched. | Vivian | Renders a centered ActivityIndicator. Used during API calls to show loading state. |
| `ErrorState.tsx` | Error state display with icon, message, and optional retry button. Used when API calls fail. | Vivian | Props: `message`, `onRetry`. Shown when API errors occur. The retry button re-executes the failed request. |
| `EmptyState.tsx` | Empty state display with illustration and message. Used when lists have no data (no events found, no rewards available, etc.). | Vivian | Shown when a list is empty — e.g., no events matching search, no coupons yet. |
| `Toast.tsx` | Temporary notification popup for success/error messages. Auto-dismisses after a few seconds. | Vivian | Used for temporary feedback — "Joined event!", "Redeemed successfully!", error notifications. |

#### Mobile Services (`mobile_app/src/services/`)

| File | Purpose | Owner | Technical details |
|------|---------|-------|-------------------|
| `api.ts` | **API client for the mobile app.** Provides `api.get()`, `api.post()`, `api.put()`, `api.del()` — generic typed HTTP methods. Handles JWT token injection via `Authorization: Bearer` header. Implements automatic token refresh on 401 (calls `onTokenExpired` callback if registered). Parses responses, throws `ApiError` on non-ok status codes. Base URL from `EXPO_PUBLIC_API_URL` env var (defaults to localhost:3000/api). | Vivian | Key features: Auth token stored in memory (not localStorage for security). Auto-refresh on 401: if the server returns 401, it calls the registered `onTokenExpired` handler, retries with the new token. `ApiError` class carries `code` (machine-readable) and `status` (HTTP status). |
| `storage.ts` | Secure storage wrapper using `expo-secure-store`. Used to persist the auth token securely (iOS Keychain / Android EncryptedSharedPreferences). | Vivian | "We use expo-secure-store instead of AsyncStorage for auth tokens because it uses the device's secure storage (iOS Keychain, Android Keystore). Tokens are encrypted at rest." |

#### Mobile Theme (`mobile_app/src/theme/`)

| File | Purpose | Owner | Technical details |
|------|---------|-------|-------------------|
| `index.ts` | **Design system tokens** — colors, spacing, border radius, and typography definitions. Central theme used by all components and screens for visual consistency. Apple-inspired design language (iOS system colors as reference). | Vivian | Colors: structured as `bg` (page, card, input, subtle), `border` (light, focus), `text` (primary, secondary, tertiary, inverse), `accent` (green, blue, orange, red, grey), `status` (approved, pending, rejected). All values are `as const` for TypeScript narrowing. Typography: 10 text styles from `largeTitle` (34pt) to `caption2` (11pt), matching iOS typography scale. |

---

## 10. Frontend — Web Portals (React + Vite)

### `frontend/web_portals/`

#### Root Config Files

| File | Purpose | Owner |
|------|---------|-------|
| `index.html` | Vite entry HTML file. Mounts the React app. | Grace / Nurain |
| `package.json` | Dependencies: react, react-dom, react-router-dom, vite, related dev tools. | Grace / Nurain |
| `vite.config.js` | Vite configuration — React plugin, dev server settings, build output config. | Grace / Nurain |
| `src/main.jsx` | React entry point — renders `<App />` into the DOM, wraps with BrowserRouter. | Grace / Nurain |
| `src/App.jsx` | Root React component — defines route structure for all portals (admin, organiser, merchant, scan) using react-router-dom. Lazy-loads portal layouts and pages. | Grace / Nurain |

#### Web Shared Components (`web_portals/src/components/`)

| File | Purpose | Owner |
|------|---------|-------|
| `Sidebar.jsx` | Navigation sidebar component used in admin and organiser layouts. Shows portal logo, navigation links, user info, and logout button. Collapsible on mobile. | Grace / Nurain |
| `Topbar.jsx` | Top navigation bar — user avatar, notification bell, profile dropdown. Used across all portals. | Grace / Nurain |
| `DataTable.jsx` | Reusable data table component with sorting, searching, and pagination. Used for user lists, event lists, coupon lists, and redemption history. | Grace / Nurain |
| `Modal.jsx` | Reusable modal/dialog component for confirmations, forms, and detail views. | Grace / Nurain |
| `StatusBadge.jsx` | Styled badge component for status values (active/pending/approved/rejected/redeemed). Color-coded for quick visual identification. | Grace / Nurain |
| `Toast.jsx` | Notification popup component for success/error/info messages. | Grace / Nurain |

#### Web Layouts (`web_portals/src/layouts/`)

| File | Purpose | Owner |
|------|---------|-------|
| `AdminLayout.jsx` | Admin portal layout — sidebar with navigation, topbar, content area. All admin pages render inside this layout. | Nurain |
| `OrganiserLayout.jsx` | Organiser portal layout — sidebar with organiser-specific navigation, topbar, content area. | Nurain |
| `MerchantLayout.jsx` | Merchant portal layout — simplified layout without sidebar (focused on PIN entry workflow). | Grace |
| `ScanLayout.jsx` | Scanning app layout — designed for mobile/touch use, minimal navigation. | Vivian |

#### Web Pages — Admin Portal (`web_portals/src/pages/admin/`)

| File | Purpose | Owner |
|------|---------|-------|
| `Dashboard.jsx` | Admin dashboard — metrics cards (total users, events, redemptions), recent activity feed, quick action buttons. | Nurain |
| `Users.jsx` | User management page — searchable table of all users, role filter, deactivate/reactivate toggle. | Nurain |
| `Organisers.jsx` | Organiser management page — list of organiser registration requests, approve/reject buttons, organisation details. | Nurain |
| `Events.jsx` | All events overview page — table of all events across all organisers, status filter. | Nurain |
| `Coupons.jsx` | Coupon management page — CRUD for coupon batches (title, points cost, quantity, expiry). | Nurain |
| `Redemptions.jsx` | Redemption history page — searchable log of all coupon redemptions with volunteer, coupon, PIN, timestamp. | Nurain |
| `RewardsConfig.jsx` | Rewards system configuration — configure points costs, reward categories, validity periods. | Nurain |
| `Merchants.jsx` | Merchant outlet management page — list of registered merchant outlets, approve/disapprove. | Nurain |
| `PinVerify.jsx` | Admin PIN verification page — manual PIN entry and verification (backup for merchant app). | Nurain |
| `QRCodes.jsx` | QR code generation page — generate and download QR codes for events, volunteer check-in. | Nurain |
| `Campaigns.jsx` | Campaign management page — create and manage promotional campaigns. | Nurain |

#### Web Pages — Organiser Portal (`web_portals/src/pages/organiser/`)

| File | Purpose | Owner |
|------|---------|-------|
| `Dashboard.jsx` | Organiser dashboard — my events summary, upcoming events, recent participant activity. | Nurain |
| `Events.jsx` | My events list — table of events created by this organiser, status filter, quick stats. | Nurain |
| `EventCreate.jsx` | Event creation form — title, description, date/time, location, capacity, points value, category, image upload. | Nurain |
| `EventEdit.jsx` | Event edit form — pre-populated from existing event data, same fields as create. | Nurain |
| `Feedback.jsx` | Feedback viewer — list of volunteer feedback for the organiser's events, ratings and comments. | Nurain |
| `Qna.jsx` | Q&A management — view unanswered questions from volunteers, write and publish answers. | Nurain |
| `Roster.jsx` | Volunteer roster — list of registered and attended volunteers for a selected event. | Nurain |
| `OnsiteController.jsx` | Onsite event controller — real-time view of check-ins, manual attendance marking fallback. | Nurain |

#### Web Pages — Merchant Portal (`web_portals/src/pages/merchant/`)

| File | Purpose | Owner |
|------|---------|-------|
| `Login.jsx` | Merchant login screen — email and password. Redirects to PIN entry on success. | Grace |
| `PinVerify.jsx` | PIN entry screen — 6-digit input field. On submit, calls verify endpoint, shows success/error result. Option to confirm redemption. | Grace |
| `History.jsx` | Redemption history for this merchant outlet — list of all verified and redeemed coupons, with timestamps. | Grace |

#### Web Pages — Scanning App (`web_portals/src/pages/scan/`)

| File | Purpose | Owner |
|------|---------|-------|
| `Login.jsx` | Scan app login screen — organiser credentials. | Vivian |
| `EventSelect.jsx` | Event selection screen — choose which event to scan attendees for. | Vivian |
| `Scanner.jsx` | QR code scanner screen — activates device camera, scans volunteer's QR code, displays result. | Vivian |
| `Roster.jsx` | Live attendance roster — shows scanned-in volunteers with check-in times, manual add button. | Vivian |

#### Web API Service

| File | Purpose | Owner | Technical details |
|------|---------|-------|-------------------|
| `src/services/api.js` | **API client for the web portals.** Provides `apiGet()`, `apiPost()`, `apiPut()`, `apiDel()`. Handles JWT token via `Authorization: Bearer` header. Stores token in `localStorage` (unlike mobile which uses secure storage). Also exports `apiLogin()` and `apiLogout()` convenience functions that auto-manage the token. Query parameters for GET requests are passed as an object and serialised into URL search params. | Grace / Nurain | Token stored in localStorage (web platform limitation — no secure storage equivalent for web). Functions: `apiGet(path, params)`, `apiPost(path, body)`, `apiPut(path, body)`, `apiDel(path)`. Errors thrown as `{ code, message, status }` objects. |

#### Web Styles

| File | Purpose | Owner |
|------|---------|-------|
| `src/styles/global.css` | Global styles — reset, typography base, color variables, layout utilities. | Grace / Nurain |
| `src/styles/admin.css` | Admin portal specific styles — sidebar layout, data table styling, dashboard cards. | Nurain |

---

## 11. Frontend — Prototypes & Specs

### `frontend/mobile_UI/`

| File | Purpose | Owner |
|------|---------|-------|
| `UI_draft_by_Vivian/DESIGN_SYSTEM_WhiteBackground.md` | Vivian's design system documentation — color palette, typography, spacing, and component design decisions for the mobile app on a white background. | Vivian |
| `UI_draft_by_Vivian/viv_mobile_01.jpeg` through `viv_mobile_09.jpeg` | Vivian's mobile UI mockup screenshots — visual drafts of the mobile app screens (onboarding, login, events, rewards, profile, etc.). | Vivian |
| `User_Mobile_Prototype-·-5_14_2026/` | Interactive HTML prototype of the volunteer mobile app — 10 clickable screens demonstrating the user flow from onboarding through rewards redemption. Built as a static HTML/CSS prototype. | Vivian |

### `frontend/web_UI/`

| File | Purpose | Owner |
|------|---------|-------|
| `Admin_Prototype-·-5_14_2026/` | Interactive HTML prototype of the admin web portal — 11 pages (dashboard, users, organisers, events, coupons, redemptions, rewards config, merchants, PIN verify, QR codes, campaigns). Shows the layout and workflow before React implementation. | Grace / Nurain |
| `Organiser_Prototype-·-5_14_2026/` | Interactive HTML prototype of the organiser web portal — 9 pages (login, register, dashboard, events, event create/edit, feedback, Q&A, roster, onsite controller). | Grace / Nurain |
| `webpageui_by_Nurain/` | Nurain's web UI design screenshots — 6 images showing admin and organiser portal visual designs. | Nurain |

### `frontend/*.md` Specs

| File | Purpose | Owner |
|------|---------|-------|
| `PROTOTYPE_ASSESSMENT.md` | Assessment of the HTML prototypes — what each prototype covers, what's missing, what needs to be updated when converting to production code. | Xon |
| `ORGANIZER_SCANNING_APP_SPEC.md` | Specification document for the organiser scanning app — screen descriptions, QR scanning flow, offline fallback, manual entry. | Vivian |
| `MERCHANT_REDEMPTION_APP_SPEC.md` | Specification document for the merchant redemption app — PIN entry flow, verification process, 5-minute reversal window, history. | Grace |
| `AUTH_AUDIT_REPORT.md` | Audit report of auth implementation across the mobile app — verifies that login, register, token refresh, and profile screens are correctly implemented and connected to the API. | Vivian |

---

## 12. Infrastructure & DevOps

| File | Purpose | Owner | When asked |
|------|---------|-------|------------|
| `.github/workflows/ci.yml` | **CI/CD pipeline (GitHub Actions).** Triggered on push to `main` or `feature/**` branches, and on PRs to `main`. Spins up a PostgreSQL 16 container as a service, installs backend dependencies, runs migrations against the test database, and runs `npm test`. Uses Node 20, caches npm dependencies. | Xon | "Our CI pipeline runs on every push to main and every PR. It tests against a real PostgreSQL instance in the CI runner. If migrations fail or tests fail, the pipeline breaks — no broken code gets merged. Currently the test step has no tests yet (npm test is not defined), so the pipeline runs migrations only. Tests will be added in Sprint 4." |
| `Dockerfile` | Production Docker image for the Express backend. Uses `node:20-alpine` for minimal image size. Copies only production dependencies. | Xon | "Multi-stage build using Alpine Linux for minimal image size (~150MB). Only production npm dependencies are installed (no dev dependencies). Exposes port 3000." |
| `docker-compose.yml` | Local development Docker setup. Runs the backend app and a PostgreSQL 16 database as linked containers. Database has a health check via `pg_isready`. | Xon | "Developers can run `docker compose up` to get the entire backend stack running locally — database included. The app container waits for the database to be healthy before starting." |

---

## 13. Planning & Management Documents

| File | Purpose | Owner | Summary for Andy/Examiner |
|------|---------|-------|---------------------------|
| `AI_GENERATION_PROMPTS.md` | The complete list of AI prompts used to generate every part of the codebase. | Xon | "Records every prompt used for AI code generation. This ensures traceability — if Andy asks how a specific file was created, we can point to the exact prompt and explain the AI's instructions." |
| `API_CONTRACTS.md` | Frozen contract for all 59 API endpoints — covers mobile app, web admin, web organiser, merchant app, and scanning app. Each endpoint has method, path, request body, response shape, error codes, and role requirements. | Xon | "The foundational document of our contract-first approach. Every endpoint was specified and frozen before any code was written. All team members develop against this spec. If frontend and backend disagree, the contract is the arbiter." |
| `Sprint Breakdown v4.md` | Full 5-sprint breakdown with per-person task lists (80+ tasks total), deliverable checklists, and descope options. | Xon | "Our 5-sprint plan from May 7 to July 6. Sprint 1 (foundation + auth) is complete. Sprints 2-5 cover backend implementation, integration, hardening, and delivery. Every task has an ID, owner, and status tracking." |
| `TEAM_WORKFLOW.md` | Team operating model — WATD hybrid roles, PR process, concentrated generation approach, quality gates. | Xon | "Defines how the team of 4 coordinates — who reviews whose code, how PRs are approved (two approvals required), and how integration is maintained." |
| `DAILY_WORKFLOW.md` | Day-by-day task checklist per sprint. | Xon | "Simple daily checklist so team members know what to work on without re-reading the full sprint plan." |
| `PROPOSAL_WATD_METHOD.md` | Original WATD proposal submitted to Andy. | Xon | "Our initial proposal. After Andy's feedback, we restructured to vertical slices, but this records our discussion history." |
| `MIGRATION_GUIDE.md` | Database setup guide — how to run migrations, seed data, and connect to Supabase. | Xon | "Onboarding guide for database setup. Covers migration commands, seed commands, Supabase connection, and troubleshooting." |
| `Pre-Implementation Report v1.md` | Pre-development architecture report. | Xon | "Pre-development architecture report covering database design, API architecture, tech stack decisions, and risk assessment." |
| `Vertical Slice Technical Guide v2.md` | Vertical slice implementation guide with per-person prompts and patterns. | Xon | "The hands-on guide showing each person exactly what files to create, what patterns to follow, and what AI prompts to use. Ensures all four slices integrate cleanly." |
| `Virtual Team Output Report v1–v3.md` | Sprint 1 completion and verification reports. | Xon | "Sprint 1 close-out reports documenting what was built, what was audited (4 API gaps found and fixed), TypeScript/Vite verification results, and workspace fix." |
| `Draft Reply to Andy re Vertical Slices.md` | Draft response to Andy's feedback on WATD proposal. | Xon | "Pending team discussion. Proposes the vertical slice reallocation with revised sprint plan and descope options." |

---

## How to Update This Document

Whenever a file is added, removed, or significantly changed:

1. Add or update the file's entry in the relevant section
2. Bump the version number in the filename (v1 → v2 → v3)
3. Add a row to a version history table at the top
4. Commit the updated reference alongside the code change

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1 | 16 May 2026 | Xon | Initial comprehensive codebase reference — all backend, frontend, infrastructure, and planning files documented |
