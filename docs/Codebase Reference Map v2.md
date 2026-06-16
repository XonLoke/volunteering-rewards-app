# Codebase Reference Map v2

> **Purpose:** Complete inventory of every file in the Volunteering Rewards App project — what it does, who owns it, and what to say when Andy or an examiner asks about it.
>
> **Project:** Volunteering Rewards App  
> **Last updated:** 21 May 2026  
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
11. [Infrastructure & DevOps](#11-infrastructure--devops)

---

## 1. Project Root

### Root Config Files (on GitHub)

| File | Purpose | Owner | Technical details |
|------|---------|-------|-------------------|
| `Dockerfile` | Multi-stage Docker build. Stage 1 (builder): installs all npm deps. Stage 2 (production): copies only production deps, adds non-root user, healthcheck, exposes port 3000. | Xon | `FROM node:20-alpine AS builder` → `npm ci` → `FROM node:20-alpine` → `adduser appuser` → `COPY --from=builder` → `HEALTHCHECK` → `CMD ["node", "index.js"]` |
| `docker-compose.yml` | Defines two services: `app` (builds from Dockerfile, env vars from `.env`, depends on healthy db) and `db` (postgres:16-alpine, health check via pg_isready, named volume pgdata). | Xon | `DB_PASSWORD` required via `${DB_PASSWORD:?}` syntax. Restart policy `unless-stopped` for both services. |
| `.gitignore` | Excludes: `node_modules/`, `.env`, `*.bak`, `.DS_Store`, `Thumbs.db`, `*.log`, all root .md documents, fix_workspace.ps1, SVGs, prototype directories. | Xon | Documents go to OneDrive. Git should only contain code. |

### Root Documents (on OneDrive, not GitHub)

These documents are stored on OneDrive, not in the GitHub repo. GitHub only contains production code.

| File | Purpose |
|------|---------|
| `DAILY_WORKFLOW_v2.md` / `v3.md` | Day-by-day workflow guide for the team — vertical slice approach, git workflow, CI/CD info, admin portal access, document policy. |
| `Virtual Team Output Report v1–v4.md` | Sprint completion reports. v4 covers Sprint 2 vertical slice task assignments for v-Vivian, v-Grace, v-Nurain. |
| `Sprint Breakdown v4.md` / `v5.md` | Full 5-sprint plan with per-person task lists (80+ tasks). v5 adopts vertical slice ownership. |
| `API_CONTRACTS.md` / `v2.md` | Frozen contract for all API endpoints. v2 adds POST /api/auth/refresh, GET /api/events/:id/stats, and corrects any discrepancies found during audit. |
| `AI_GENERATION_PROMPTS_v1.md` / `v2.md` | Record of all AI prompts used to generate code. |
| Other documents | TEAM_WORKFLOW.md, PROPOSAL_WATD_METHOD.md, MIGRATION_GUIDE.md, Pre-Implementation Report v1.md, Vertical Slice Technical Guide v2–v3.md, Code Companion Guide v1.md, Draft Reply to Andy re Vertical Slices.md, Sprint1_conclusion.md |

---

## 2. Backend — Root Files

### `backend/`

| File | Purpose | Owner | Lines | Technical details |
|------|---------|-------|-------|-------------------|
| `backend/index.js` | **Express server entry point.** Configures middleware stack (helmet → cors → json parser → rate limiter → static files → health check → 9 route groups → 404 handler → errorHandler). Starts on port 3000. CORS reads allowed origins from `CORS_ORIGINS` env var. | Xon | ~80 | Route groups: `/api/auth`, `/api/events`, `/api/attendance`, `/api/me`, `/api/favorites`, `/api/rewards`, `/api/organiser`, `/api/admin`, `/api` (merchant). |
| `backend/package.json` | Node.js manifest — scripts: `start`, `dev` (node --watch), `migrate`, `seed`, `test` (placeholder). 10 production deps. | Xon | — | `npm test` now exists as a placeholder. Full test suite coming in Sprint 4. |
| `backend/.env` | **Environment variables** — DB connection, JWT secrets + expiry, rate limit config, CORS origins, file upload limits. | Xon | — | **Contains actual credentials.** Never commit to git. |
| `backend/.env.example` | Template .env with placeholder values and usage instructions. Documents all env vars including CORS and file uploads. | Xon | 33 lines | New devs copy to `.env` and fill in values. |

---

## 3. Backend — Config

### `backend/src/config/`

| File | Purpose | Owner | Lines | Technical details |
|------|---------|-------|-------|-------------------|
| `database.js` | **PostgreSQL connection pool.** Creates Pool with config from env vars. Max 20 connections, 30s idle timeout, 5s connection timeout. Exports `pool` and `checkConnection()`. | Xon | 44 | `const pool = new Pool({ ... })`. `checkConnection()` runs `SELECT 1`. |

---

## 4. Backend — Middleware

### `backend/src/middleware/`

| File | Purpose | Owner | Lines | Technical details |
|------|---------|-------|-------|-------------------|
| `auth.middleware.js` | JWT auth (AUTH-03). Extracts Bearer token, verifies, attaches `req.user = { id, role }`. Returns 401 on missing/malformed/expired token. | Xon | 39 | Must be used on any route needing auth. |
| `role.middleware.js` | Role guard (AUTH-04). Factories: `authorize(...roles)` and `roleGuard(roles)`. Must be used AFTER `authenticate`. | Xon | 50 | `authorize("admin", "merchant")` — multi-role support. |
| `errorHandler.middleware.js` | Global error handler (INF-06). Consistent JSON error responses. Exports `createError(status, code, message, details)`. | Xon | 49 | 4-parameter Express error handler. Hides stack traces in production. |
| `rateLimiter.middleware.js` | Rate limiter (AUTH-10). Three configs: `global` (100/15min), `authStrict` (10/1min for login), `authRegister` (5/1min for register). | Xon | 38 | Uses `express-rate-limit`. Contract-compliant error shape. |

---

## 5. Backend — Auth Service

### `backend/src/services/`

| File | Purpose | Owner | Lines | Technical details |
|------|---------|-------|-------|-------------------|
| `auth.service.js` | **Auth business logic (AUTH-01 through AUTH-08).** Functions: `register` (Joi validation, bcrypt hash, insert user, generate tokens), `registerOrganiser` (Joi with org fields, create organisation with 'pending' status, create user with FK, generate tokens), `login` (find user, compare password), `refreshTokens` (verify, rotate, security check), `getProfile`, `updateProfile`. | Xon | ~390 | `registerOrganiserSchema` validates: name (2-100), email, password (min8+uppercase+number), SG phone (+65), confirm match, organisation_name (min2), organisation_type (enum), organisation_docs (optional URIs). |

---

## 6. Backend — Controllers

All controllers follow: `async function handler(req, res, next)` → try/catch → `next(err)`.

| File | Purpose | Owner | Status | When asked |
|------|---------|-------|--------|------------|
| `auth.controller.js` | HTTP handlers: register, registerOrganiser, login, refresh, getProfile, updateProfile. Delegates to auth.service.js. | Xon | ✅ Implemented | "Thin HTTP layer — delegates to auth service. registerOrganiser returns user with embedded organisation object." |
| `events.controller.js` | 12 handlers: browse (search/filter/paginate), categories, detail, join, leave, feedback, viewQna, askQuestion, roster, stats, today. | Vivian | ⏳ Stub | "Response shapes match API_CONTRACTS_v2.md. Stats function returns event_id, total_registered, total_checked_in, percentage, recent_scans." |
| `attendance.controller.js` | Handlers for QR scan, batch sync, point awarding. | Vivian | ⏳ Stub | — |
| `favorites.controller.js` | Handlers for toggle favorite, list favorites. | Vivian | ⏳ Stub | — |
| `me.controller.js` | Handlers for volunteer's own events, points, coupons, QR code, favorites. | Nurain | ⏳ Stub | — |
| `rewards.controller.js` | Handlers: browse rewards, reward detail, redeem + PIN generate. | Grace | ⏳ Stub | — |
| `merchant.controller.js` | Handlers: verify PIN, redeem coupon, reverse (5-min window), merchant history. | Grace | ⏳ Stub | — |
| `admin.controller.js` | Handlers: dashboard metrics, users CRUD, organiser approve/reject, events overview, participation data. | Nurain | ⏳ Stub | — |
| `organiser.controller.js` | Handlers: dashboard, event CRUD, roster, feedback, Q&A answer. | Nurain | ⏳ Stub | — |

---

## 7. Backend — Routes

All route files: `Router()` → import controller → import middleware → define routes → export.

| File | Endpoints | Owner | Status | Notes |
|------|-----------|-------|--------|-------|
| `auth.routes.js` | POST /register, POST /register/organiser, POST /login (rate-limited), POST /refresh, GET /me, PUT /me | Xon | ✅ Implemented | Auth-08 (organiser registration) fully implemented. |
| `events.routes.js` | GET /, GET /categories, GET /today, GET /:id, POST /:id/register, DELETE /:id/register, POST /:id/feedback, GET /:id/qna, POST /:id/qna, GET /:id/roster, GET /:id/stats | Vivian | ✅ Wired | Per-route role guarding. Static routes before `/:id`. Volunteer vs organiser routes separated. |
| `attendance.routes.js` | POST /scan, POST /batch | Vivian | ⏳ Stub | — |
| `favorites.routes.js` | POST /:id/toggle, GET / | Vivian | ⏳ Stub | — |
| `me.routes.js` | GET /events, GET /points, GET /coupons, GET /qr-code, GET /favorites | Nurain | ⏳ Stub | — |
| `rewards.routes.js` | GET /, GET /:id, POST /:id/redeem | Grace | ✅ Wired | All three endpoints wired to controller. |
| `merchant.routes.js` | POST /coupons/verify, POST /coupons/redeem, POST /coupons/reverse, GET /merchant/history | Grace | ⏳ Stub | — |
| `admin.routes.js` | Full admin CRUD routes | Nurain | ⏳ Stub | — |
| `organiser.routes.js` | Full organiser CRUD routes | Nurain | ⏳ Stub | — |

---

## 8. Backend — Utilities

### `backend/src/utils/`

| File | Purpose | Owner | Lines | Technical details |
|------|---------|-------|-------|-------------------|
| `jwt.js` | JWT token utility — generate/verify access + refresh tokens. | Xon | 77 | Access: `{ id, role }` payload, 15min expiry. Refresh: `{ id }` payload, 7 days. |
| `migrationRunner.js` | Migration runner (INF-03). Reads .sql files from `migrations/`, executes in numeric order. | Xon | ~70 | `npm run migrate`. Safe to re-run (uses IF NOT EXISTS). |
| `seed.js` | Test data seeder (INF-04). Seeds 3 roles, 3 test users (password123), 1 org, 3 events, 3 coupons. | Xon | ~180 | `npm run seed`. Uses transactions. Alice gets 500 starting points. |

### Database Migrations

13 migration files in `backend/migrations/`:

| File | Purpose |
|------|---------|
| `001`–`012` | Creates all 12 tables: roles, users, organizations, events, event_registrations, attendance_logs, event_feedback, event_qna, favorites, coupons, user_coupons, redemption_logs |
| `013_add_coupon_value_and_merchant.sql` | NEW — Adds `value_cents` (INTEGER NOT NULL DEFAULT 0) and `merchant_name` (VARCHAR(255)) columns to coupons table per API contract requirements |

---

## 9. Frontend — Mobile App (Expo / React Native)

### `frontend/mobile_app/`

*(Unchanged from v1 — see Codebase Reference Map v1 sections 9 for full details)*

**Key files:** `App.tsx`, `app/_layout.tsx`, `app/(tabs)/home.tsx`, `app/(tabs)/events.tsx`, `app/(tabs)/rewards.tsx`, `app/(tabs)/profile.tsx`, `src/components/*.tsx`, `src/services/api.ts`, `src/services/storage.ts`

**Owner:** Vivian

**Status:** All mobile screens built. Needs API wiring to live backend endpoints.

---

## 10. Frontend — Web Portals (React + Vite)

### `frontend/web_portals/`

All portals share the same Vite + React build. Routing is defined in `src/App.jsx`.

#### Root Config Files

| File | Purpose | Owner |
|------|---------|-------|
| `index.html` | Vite entry HTML file. Mounts the React app. | Grace / Nurain |
| `package.json` | Dependencies: react, react-dom, react-router-dom, vite. | Grace / Nurain |
| `vite.config.js` | Vite config with React plugin. | Grace / Nurain |
| `src/main.jsx` | React entry — renders `<App />`, wraps with ToastProvider. | Grace / Nurain |
| `src/App.jsx` | **Root router** — all 4 portals defined via react-router-dom. All pages now wired with real components (no placeholders). | Grace / Nurain |

#### Route Structure

| Portal | Path | Layout | Pages |
|--------|------|--------|-------|
| Admin | `/admin/login` | Standalone | Login page with role gating (admin-only) |
| Admin | `/admin` | AdminLayout | Dashboard, Users, Organisers, Events, Coupons, RewardsConfig, Redemptions, QrCodes, PinVerify, Merchants, Campaigns |
| Organiser | `/organiser` | OrganiserLayout | Dashboard, Events, EventCreate, EventEdit/:id, Roster/:id, Feedback/:id, Qna/:id, OnsiteController/:id |
| Scan | `/scan` | ScanLayout | Login, Events, Scanner/:eventId, Roster/:eventId |
| Merchant | `/merchant` | MerchantLayout | Login, Verify, History |

#### Web Shared Components

| File | Purpose | Owner |
|------|---------|-------|
| `Sidebar.jsx` | Collapsible nav sidebar used in admin + organiser layouts. | Grace / Nurain |
| `Topbar.jsx` | Top bar with menu toggle, title, user avatar, logout. | Grace / Nurain |
| `DataTable.jsx` | Reusable sortable/paginated table component. | Grace / Nurain |
| `Modal.jsx` | Reusable modal/dialog. | Grace / Nurain |
| `StatusBadge.jsx` | Color-coded status badges. | Grace / Nurain |
| `Toast.jsx` | Notification popup with ToastProvider context. | Grace / Nurain |

#### Web Pages — Admin Portal

| File | Purpose | Owner | Status |
|------|---------|-------|--------|
| `Login.jsx` | **NEW** — Admin login with role gating. Only admin users can access. Shows test credentials on the form. | Xon | ✅ Connected |
| `Dashboard.jsx` | Metrics cards (users, organisers, coupons, redemptions), activity feed, loading/error/empty states. | Nurain | ✅ Wired to API |
| `Users.jsx` | Searchable user table, role/status filters, pagination, user detail modal, suspend/reactivate. | Nurain | ✅ Wired to API |
| `Organisers.jsx` | Organiser requests, approve/reject, org detail with documents. | Nurain | ✅ Wired to API |
| `Events.jsx` | Events overview with participation panel, bulk filters, delete event. | Nurain | ✅ Wired to API |
| `Coupons.jsx` | Coupon batch CRUD, quantity tracking. | Nurain | ✅ Wired to API |
| `Redemptions.jsx` | Redemption history log. | Nurain | ✅ Wired to API |
| `RewardsConfig.jsx` | Points config management. | Nurain | ✅ Wired to API |
| `Merchants.jsx` | Merchant outlet management. | Nurain | ✅ Wired to API |
| `PinVerify.jsx` | Manual PIN verification (backup for merchant app). | Nurain | ✅ Wired to API |
| `QRCodes.jsx` | QR code generation. | Nurain | ✅ Wired to API |
| `Campaigns.jsx` | Campaign management. | Nurain | ✅ Wired to API |

#### Web Pages — Organiser Portal

| File | Purpose | Owner | Status |
|------|---------|-------|--------|
| `Dashboard.jsx` | Organiser dashboard — event summaries, activity. | Nurain | ✅ Wired to API |
| `Events.jsx` | My events list with status filters. | Nurain | ✅ Wired to API |
| `EventCreate.jsx` | Event creation form. | Nurain | ✅ Wired to API |
| `EventEdit.jsx` | Event edit form (pre-populated). | Nurain | ✅ Wired to API |
| `Feedback.jsx` | Volunteer feedback viewer. | Nurain | ✅ Wired to API |
| `Qna.jsx` | Q&A management — view unanswered, post answers. | Nurain | ✅ Wired to API |
| `Roster.jsx` | Volunteer roster for an event. | Nurain | ✅ Wired to API |
| `OnsiteController.jsx` | Real-time check-in view. | Nurain | ✅ Wired to API |

#### Web Pages — Merchant Portal

| File | Purpose | Owner |
|------|---------|-------|
| `Login.jsx` | Merchant login — email + password. | Grace |
| `PinVerify.jsx` | 6-digit PIN entry, verify, confirm redemption, 5-min reversal. | Grace |
| `History.jsx` | Redemption history for this merchant. | Grace |

#### Web Pages — Scanning App

| File | Purpose | Owner |
|------|---------|-------|
| `Login.jsx` | Organiser login. | Vivian |
| `EventSelect.jsx` | Choose event to scan for. | Vivian |
| `Scanner.jsx` | Camera QR scanner with check-in result. | Vivian |
| `Roster.jsx` | Live attendance roster. | Vivian |

#### Web API Service

| File | Purpose | Owner | Details |
|------|---------|-------|---------|
| `src/services/api.js` | API client — `apiGet`, `apiPost`, `apiPut`, `apiDel`, `apiLogin`, `apiLogout`. Token in localStorage. | Grace / Nurain | Base URL from `VITE_API_URL` env var. Error shape: `{ code, message, status }`. |

#### Web Styles

| File | Purpose | Owner |
|------|---------|-------|
| `src/styles/global.css` | Global styles — reset, typography, color vars, layout utilities. | Grace / Nurain |
| `src/styles/admin.css` | Admin/organiser portal styles — sidebar, data table, dashboard cards, responsive breakpoints. | Nurain |

---

## 11. Infrastructure & DevOps

| File | Purpose | Owner | When asked |
|------|---------|-------|------------|
| `.github/workflows/ci.yml` | **CI/CD pipeline.** Triggered on push to `main`, `feature/**`, `vivian`, `grace`, `nurain` branches. Three jobs: (1) **Lint** — checks all backend modules resolve via `require()`. (2) **Test** — spins up PostgreSQL 16 service container, runs migrations, seeds data, runs `npm test`. (3) **Deploy** — placeholder for cloud deployment (only on main merges). Environment variables fixed to use `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`. | Xon | "Our CI runs lint → test → deploy on every push. Lint checks require() resolution before tests run. The deploy step is configured but needs a cloud target (Render/Railway) to be active." |
| `Dockerfile` | Multi-stage production Docker image. Stage 1 installs all deps. Stage 2 copies only production deps, creates non-root `appuser`, adds HEALTHCHECK, exposes port 3000. | Xon | "Multi-stage build for minimal image size. Non-root user for security. Healthcheck hits `/api/health` endpoint." |
| `docker-compose.yml` | Development Docker setup. `app` service builds locally, depends on healthy `db` (postgres:16-alpine). Env vars from `.env` file. Named volume `pgdata` for data persistence. Both services restart unless stopped. | Xon | "One command (`docker compose up`) starts the full backend stack. The app waits for the database healthcheck to pass before starting." |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1 | 16 May 2026 | Xon | Initial comprehensive codebase reference |
| v2 | 21 May 2026 | Xon | **Sprint 2 updates**: Removed sections for deleted prototype dirs and documents (now on OneDrive). Added migration 013, admin Login page. Updated infrastructure (multi-stage Docker, fixed CI/CD, env vars). Updated route statuses (events, rewards now wired). Updated web portals section (all pages connected to router, no placeholders). Added document policy section. |
