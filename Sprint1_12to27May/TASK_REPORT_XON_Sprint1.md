# Task Report — Xon (Sprint 1: 7–27 May)

---

## Context

**Volunteering Rewards App** · Express.js + PostgreSQL + React Native (Expo) + React (Vite)

**Role:** Infrastructure & Backend Developer — Workflow A, B, C backend APIs + all code generation

I am responsible for setting up the entire backend infrastructure, generating all code (backend + frontend scaffolding), coordinating deliveries to GitHub, and supporting teammates when they are stuck.

---

## Task: INF-01 — Backend Project Scaffolding

**Description:** Set up the Express.js backend project with all required dependencies, folder structure, environment configuration, and server entry point.

**Files created:**
- `backend/package.json` — 19 dependencies (express, pg, bcrypt, jsonwebtoken, joi, cors, helmet, dotenv, express-rate-limit, uuid)
- `backend/.env.example` — Configuration template for DB, JWT, rate limit
- `backend/index.js` — Express entry point with middleware stack (helmet → cors → JSON → rate-limit → routes → 404 → error handler)
- `backend/migrations/` — Directory for all 12 migration SQL files
- `backend/src/` — Directory structure (config, routes, middleware, controllers, services, utils)

**NPM scripts configured:**
| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server with `--watch` (auto-restart) |
| `npm start` | Start server for production |
| `npm run migrate` | Create/update all 12 database tables |
| `npm run seed` | Load test data into database |

---

## Task: INF-02 — Database Connection

**Description:** PostgreSQL connection pool with health check.

**API endpoint:** `GET /api/health`

**File created:**
- `backend/src/config/database.js` — pg Pool with max 20 connections, 5s timeout, error logging, `checkConnection()` function

---

## Task: INF-03 — Database Migrations (12 Tables)

**Description:** Create all 12 database tables with proper constraints, foreign keys, and indexes.

**Files created — `backend/migrations/`:**

| # | File | Table | Key Features |
|---|------|-------|-------------|
| 001 | `001_create_roles.sql` | roles | volunteer / organizer / admin |
| 002 | `002_create_users.sql` | users | points, volunteer_qr_code (UUID), refresh_token, role FK |
| 003 | `003_create_organizations.sql` | organizations | approval workflow (pending/approved/rejected) |
| 004 | `004_create_events.sql` | events | organizer FK, points_value, capacity, status, category |
| 005 | `005_create_event_registrations.sql` | event_registrations | UNIQUE(user_id, event_id) |
| 006 | `006_create_attendance_logs.sql` | attendance_logs | scan_type CHECK (check_in / points_award), UNIQUE(user, event, type) |
| 007 | `007_create_event_feedback.sql` | event_feedback | rating 1-5, comment |
| 008 | `008_create_event_qna.sql` | event_qna | question/answer by different users |
| 009 | `009_create_favorites.sql` | favorites | UNIQUE(user, item_type, item_id) |
| 010 | `010_create_coupons.sql` | coupons | points_required, quantity, expiry, created_by FK |
| 011 | `011_create_user_coupons.sql` | user_coupons | 6-digit PIN per redemption, UNIQUE, expiry_date |
| 012 | `012_create_redemption_logs.sql` | redemption_logs | Immutable audit trail: points_spent, action, action_by, ip_address |

**Migration runner:** `backend/src/utils/migrationRunner.js` — reads and executes all .sql files in numeric order, safe to run multiple times (IF NOT EXISTS).

**Output:**
```
Found 12 migration(s)
▶ Running: 001_create_roles.sql    → ✓ Completed
▶ Running: 002_create_users.sql    → ✓ Completed
... (all 12 passed)
All migrations completed successfully.
```

---

## Task: INF-04 — Seed Data Script

**Description:** Populate database with initial reference data for testing and demo.

**File created:** `backend/src/utils/seed.js`

**Data loaded:**

| Category | Items | Details |
|----------|-------|---------|
| Roles | 3 | volunteer, organizer, admin |
| Test users | 3 | Alice Volunteer (500pts), Bob Organizer, Carol Admin — all password: `password123` |
| Organization | 1 | Green Earth Society (approved) |
| Events | 3 | Beach Cleanup (20pts), Elderly Walk (15pts), Food Distribution (25pts) |
| Coupons | 3 | $5 FairPrice (100pts), Kopitiam Coffee Set (50pts), $10 GrabFood (200pts) |

Each user also gets a unique UUID-based volunteer QR code for the QR scanning system.

**Output:**
```
▶ Seeding roles...      ✓ Roles seeded
▶ Seeding test users... ✓ Test users seeded (password: password123)
▶ Seeding organization... ✓ Organization seeded
▶ Seeding events...     ✓ Events seeded
▶ Seeding coupons...    ✓ Coupons seeded
Seed complete. Happy coding!
```

---

## Task: INF-05 — Git Branching Setup

**Description:** Establish branch structure for 4-person team workflow.

**Reference file:** `GIT_BRANCHING_GUIDE.md` (existing — reviewed and confirmed)

**Branch structure:**
```
main          ← Clean backend code (source of truth)
xon           ← Xon's working branch + reference docs
nurain        ← Nurain's branch (merged from main)
vivian        ← Vivian's branch (merged from main)
grace         ← Grace's branch (merged from main)
```

**GitHub repositories updated:**
- `main` branch: 28 backend files pushed
- `xon` branch: backend + reference documents pushed
- `nurain`, `vivian`, `grace` branches: backend merged from main

---

## Task: INF-06 — API Error Handler Middleware

**Description:** Global error handler for consistent JSON error responses across all APIs.

**Files created:**
- `backend/src/middleware/errorHandler.middleware.js` — Catches all errors, returns `{ error: true, message }` with appropriate status code, hides internal details in production
- `createError()` factory — `throw createError(400, "message")` for operational errors in services

**Error format (all endpoints):**
```json
{
  "error": true,
  "message": "Human-readable error description"
}
```

**HTTP status codes used:**
| Code | Meaning |
|------|---------|
| 400 | Validation failure |
| 401 | Unauthenticated (no token / invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 429 | Rate limited |
| 500 | Internal server error |

---

## Task: AUTH-01 through AUTH-06 — Auth Module

**Description:** Complete authentication system with registration, login, JWT, role-based access, token refresh, and profile retrieval.

### Files Created

| Layer | File | Purpose |
|-------|------|---------|
| Utility | `src/utils/jwt.js` | Token generation & verification (access 15min, refresh 7d) |
| Middleware | `src/middleware/auth.middleware.js` | JWT verification → attaches `req.user` |
| Middleware | `src/middleware/role.middleware.js` | Role guard: `authorize("admin")` |
| Service | `src/services/auth.service.js` | Business logic: register, login, refresh, getProfile |
| Controller | `src/controllers/auth.controller.js` | HTTP request handling |
| Routes | `src/routes/auth.routes.js` | Route definitions |

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new volunteer account |
| POST | `/api/auth/login` | No (rate-limited: 10/15min) | Login with email + password |
| POST | `/api/auth/refresh` | No | Exchange refresh token for new pair |
| GET | `/api/auth/profile` | Yes (JWT) | Get current user's profile |

### Key Security Features
- Passwords hashed with bcrypt (12 salt rounds)
- JWT access tokens: 15-minute expiry
- JWT refresh tokens: 7-day expiry with rotation (old token invalidated on refresh)
- Refresh token reuse detection (revokes all tokens if mismatch detected)
- Login uses `authStrict` rate limiter (10 attempts per 15 minutes)
- No user enumeration on login (identical error for wrong email or password)
- Registration checks for duplicate email (409 Conflict)

### Test Users

| Email | Password | Role | Points |
|-------|----------|------|--------|
| alice@test.com | password123 | Volunteer | 500 |
| bob@test.com | password123 | Organizer | 0 |
| carol@test.com | password123 | Admin | 0 |

---

## Task: AUTH-10 — Rate Limiter Middleware

**Description:** Global and auth-specific rate limiting to prevent abuse.

**File created:** `backend/src/middleware/rateLimiter.middleware.js`

**Two limiters:**
| Limiter | Scope | Limit | Applied to |
|---------|-------|-------|------------|
| `global` | All API routes | 100 requests per 15 minutes | Entire API |
| `authStrict` | Auth endpoints | 10 requests per 15 minutes | POST /api/auth/login |

---

## Verification: Postman API Testing

**Collection file:** `backend/Volunteering_Rewards_API.postman_collection.json`

**7 test requests created:**

| # | Request | Expected Result |
|---|---------|----------------|
| 1 | `GET /api/health` | `{ "status": "ok" }` |
| 2 | `POST /api/auth/register` | 201 Created + user + tokens |
| 3 | `POST /api/auth/login` (Alice) | 200 + user + tokens |
| 4 | `POST /api/auth/login` (Bob) | 200 + user (organizer role) |
| 5 | `POST /api/auth/login` (Carol) | 200 + user (admin role) |
| 6 | `GET /api/auth/profile` | 200 + user details (uses auto-saved token) |
| 7 | `POST /api/auth/refresh` | 200 + new token pair |

### Quick Test Sequence (1 minute)
```
#1 Health → #3 Login → #6 Profile
```
(Collection auto-saves accessToken from Login for use in Profile request.)

### Postman Test Results

*[Insert Postman screenshots here — one per endpoint tested]*

> **Screenshot 1:** `GET /api/health` — Response 200 OK
> *[Paste screenshot]*

> **Screenshot 2:** `POST /api/auth/register` — Response 201 Created
> *[Paste screenshot]*

> **Screenshot 3:** `POST /api/auth/login` (Alice) — Response 200 with tokens
> *[Paste screenshot]*

> **Screenshot 4:** `GET /api/auth/profile` — Response 200 with user details
> *[Paste screenshot]*

> **Screenshot 5:** `POST /api/auth/refresh` — Response 200 with new tokens
> *[Paste screenshot]*

---

## GitHub Delivery

- `main` branch: All 28 backend files committed and pushed
- `xon` branch: Backend + reference documents
- All team branches (nurain, vivian, grace): Updated with latest `main` via merge
- `DAILY_WORKFLOW.md` added for team reference

---

## Dependencies & Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| PostgreSQL | 15+ |
| npm | 9+ |

**Setup commands:**
```bash
cd backend
npm install
cp .env.example .env   # then edit DB_PASSWORD
npm run migrate
npm run seed
npm run dev             # Server starts on port 3000
```

---

## Summary of Deliverables

| ID | Task | Status |
|----|------|--------|
| INF-01 | Backend project scaffolding | ✅ Done |
| INF-02 | Database connection + health check | ✅ Done |
| INF-03 | All 12 database migrations | ✅ Done |
| INF-04 | Seed data script | ✅ Done |
| INF-05 | Git branching setup | ✅ Done |
| INF-06 | Error handler middleware | ✅ Done |
| AUTH-01 | Registration API | ✅ Done |
| AUTH-02 | Login API | ✅ Done |
| AUTH-03 | JWT authentication middleware | ✅ Done |
| AUTH-04 | Role guard middleware | ✅ Done |
| AUTH-05 | Token refresh API | ✅ Done |
| AUTH-06 | Profile API | ✅ Done |
| AUTH-10 | Rate limiter middleware | ✅ Done |

**Total: 28 backend files, 13 tasks completed, server running on localhost:3000.**
