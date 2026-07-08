# Task Block Reference — Volunteering Rewards App

**How to use:** Each task = one Claude conversation. Copy the template below, fill in the four sections, and paste it as your first message. This is your prompt brief — be specific about what you want produced.

---

## Template

```
Context:
Volunteering Rewards App · Express.js + PostgreSQL + React Native (Expo) + React (Vite)
[Who you are / which workflow you own]

Task:
[Task ID] — [Task title]
[Task description from allocation sheet]
[API endpoints if applicable]

Already done:
[Files or features already built that this task depends on]
[Reference existing schemas, routes, or components]

Produce:
[What you want Claude to create — be specific: file names, what each should contain]
```

---

## Real Examples — Sprint 1 (7–27 May)

### Example 1: INF-01 — Backend Project Scaffolding

**Who sends this:** Xon
**Dependencies:** None (first task)

```
Context:
Volunteering Rewards App · Express.js + PostgreSQL + React Native (Expo) + React (Vite)
I am setting up the entire project infrastructure. This is the first task.

Task:
INF-01 — Backend project scaffolding
Set up Express.js project structure with the following folders:
  routes/        — route definitions
  controllers/   — request handlers
  services/      — business logic
  middleware/    - auth, error handling
  config/        — database, env
Install these dependencies:
  express, pg, bcrypt, jsonwebtoken, joi, cors, dotenv, nodemon

Already done:
Nothing yet — this is the very first task of the project.

Produce:
- Complete folder structure with all directories
- package.json with all dependencies listed
- src/index.js as the entry point (Express app, middleware wiring, route mounting placeholders)
- .env.example with all required environment variables
- A GET /api/health endpoint that returns { status: "ok", timestamp }
```

---

### Example 2: INF-02 — Database Connection

**Who sends this:** Xon
**Dependencies:** INF-01

```
Context:
Volunteering Rewards App · Express.js + PostgreSQL + React Native (Expo) + React (Vite)
I have the project scaffold from INF-01. Now I need to connect to PostgreSQL.

Task:
INF-02 — Database connection
Set up PostgreSQL connection pool using the `pg` package.
Create config/database.js that reads from environment variables.
Verify connection on app boot.
Update health endpoint to also return database status.

Already done:
INF-01 is complete — src/index.js, package.json, folder structure, .env.example exist.
The health endpoint is at GET /api/health.

Produce:
- config/database.js — PostgreSQL pool with error handling, connection test
- Updated src/index.js — wire database pool, verify on boot
- Updated GET /api/health — returns { status: "ok", db: "connected", timestamp }
```

---

### Example 3: AUTH-01 — Registration API

**Who sends this:** Xon (code gen), Nurain (will test)
**Dependencies:** INF-01, INF-02, INF-03 (migrations with users table)

```
Context:
Volunteering Rewards App · Express.js + PostgreSQL + React Native (Expo) + React (Vite)
I am building the auth workflow — registration API for volunteers and organizers.

Task:
AUTH-01 — Registration API
POST /api/auth/register
Accepts: { name, email, password, phone, role ("volunteer"|"organizer") }
Logic:
- Validate email uniqueness (return 409 if exists)
- Hash password with bcrypt (10 rounds)
- Generate JWT access token + refresh token
- Return { user: { id, name, email, role }, tokens: { accessToken, refreshToken } }
- Use Joi for input validation (name 2-50 chars, email valid format, password min 8 chars)

Already done:
INF-01 — Express scaffold exists (routes/, controllers/, services/, middleware/, config/)
INF-02 — Database pool in config/database.js
INF-03 — Migrations complete: users table has columns: id, name, email, password_hash, role, phone, points, is_active, created_at, updated_at

Produce:
- routes/auth.js — POST /api/auth/register
- controllers/authController.js — validate input → call service → format response
- services/authService.js — check duplicate, hash password, create user, generate tokens
- services/tokenService.js — JWT sign + verify helpers (access token 15min, refresh token 7d)
- middleware/validate.js — Joi schema validation middleware (reusable)
```

---

### Example 4: AUTH-M01 — Registration Screen (Mobile)

**Who sends this:** Xon (code gen), Nurain (will test on Expo Go)
**Dependencies:** MOB-01, MOB-02 (mobile navigation), AUTH-01 (registration API)

```
Context:
Volunteering Rewards App · Express.js + PostgreSQL + React Native (Expo) + React (Vite)
I am building the mobile registration screen for volunteers.
Stack: Expo (React Native), file-based routing, axios for API calls.

Task:
AUTH-M01 — Registration screen (mobile)
Create a registration form with these fields:
- Full Name (text input, required)
- Email (text input, required, email format)
- Password (secure input, required, min 8 chars, show/hide toggle)
- Phone (text input, optional)
- Role selector (toggle: Volunteer / Organizer)
- Register button (primary, full width)
- "Already have an account? Log in" link at bottom

Validation:
- All required fields validated inline before submit
- Show field-level error messages below each field
- Show API error (e.g. "Email already registered") as a toast

On success:
- Store JWT tokens in secure storage (expo-secure-store)
- Navigate to Home dashboard
- Show success toast

States:
- Loading spinner on the Register button during API call
- Network error state with retry button
- Success → navigate away

Already done:
MOB-01 — Expo project initialized, file-based routing configured
MOB-02 — Navigation structure (auth stack vs main tabs)
MOB-03 — Shared UI components exist (Button, Input, Card, Toast, LoadingSpinner)
AUTH-01 — POST /api/auth/register endpoint is live and tested

Produce:
- app/auth/register.tsx — full registration screen with all states
- services/api/auth.ts — API call function for register
- Include imports from shared UI kit (Button, Input, Toast)
```

---

### Example 5: EVT-M01 — Event Browse Screen

**Who sends this:** Xon (code gen), Vivian (will test on Expo Go)
**Dependencies:** MOB-01, MOB-02, MOB-03, EVT-02 (event search API)

```
Context:
Volunteering Rewards App · Express.js + PostgreSQL + React Native (Expo) + React (Vite)
I am building the volunteer-facing event browse screen.
Stack: Expo (React Native), file-based routing, axios for API calls.

Task:
EVT-M01 — Event browse screen
Create a scrollable list of upcoming events with:
- Search bar at top (text input, triggers search as user types with 300ms debounce)
- Category filter chips row (horizontal scrollable: All, Environment, Elderly, Animals, Community)
- Event cards list (vertical scroll with pull-to-refresh)
- Each card shows: title, date, location, category badge, points value, capacity (e.g. "12/30")

API: GET /api/events?search=&category=&page=
Response: { data: [...], pagination: { page, totalPages, total } }

States:
- Loading: Skeleton placeholders (3 cards)
- Empty: Illustration + "No events found" message + clear filters button
- Error: Error illustration + message + retry button
- Success: Scrollable card list

Already done:
MOB-01 — Expo project setup complete
MOB-02 — Navigation structure with tabs (Home, Events, Rewards, Profile)
MOB-03 — Shared UI components: Card, Badge, LoadingSpinner, EmptyState, ErrorState, Input
EVT-02 — GET /api/events with search, filter, pagination is live

Produce:
- app/events/index.tsx — event browse screen with all states
- components/EventCard.tsx — reusable event card component
- services/api/events.ts — API call function
```

---

### Example 6: REW-01 — Coupon CRUD

**Who sends this:** Xon (code gen), Grace (will test)
**Dependencies:** INF-01 → INF-03 (backend scaffold + migrations with coupons table)

```
Context:
Volunteering Rewards App · Express.js + PostgreSQL + React Native (Expo) + React (Vite)
I am building the rewards workflow — admin coupon management.

Task:
REW-01 — Coupon CRUD (Admin)
Endpoints:
- GET /api/coupons — list all coupons (admin: all, volunteer: active only with qty > 0 and not expired)
- POST /api/coupons — create coupon (admin only)
- GET /api/coupons/:id — get single coupon detail
- PUT /api/coupons/:id — update coupon (admin only)
- Soft delete: PATCH /api/coupons/:id/status — set status to inactive

Coupon fields: id, title, description, points_required, quantity, expiry_date, image_url, status (active|inactive|depleted), created_by, created_at, updated_at

Business rules:
- Only admins can create/update coupons
- Status auto-set to "depleted" when quantity reaches 0
- Expired coupons not returned in volunteer browse
- Quantity cannot be decremented below 0 (CHECK constraint or service-level)

Already done:
INF-01 — Express scaffold
INF-02 — Database pool
INF-03 — Migrations with coupons table (all columns + constraints)

Produce:
- routes/coupons.js — all 5 endpoints with role guards
- controllers/couponController.js — request handling, validation, response formatting
- services/couponService.js — business logic (CRUD, quantity enforcement, filtering)
- Joi validation schemas for create and update
```

---

### Example 7: Gap / Bug Fix

**Who sends this:** Any team member
**Dependencies:** Varies based on the bug

```
Context:
Volunteering Rewards App · Express.js + PostgreSQL + React Native (Expo) + React (Vite)
I am testing the app and found an issue.

Task:
[GAP-ID or BUG] — [Short description]
What happened:
- Steps to reproduce:
  1. Go to [screen]
  2. Tap [button]
  3. See [wrong behavior]
- Expected: [what should happen instead]
- Device: [Expo Go on iPhone 15 / Android emulator / Chrome browser]

Already done:
[Reference the specific files involved]

Produce:
- Fix the bug in [file name]
- Explain what caused it (1-2 sentences)
```

---

## Quick Reference: How to start any conversation

| If you are... | Paste this as your first message |
|---|---|
| **Xon building infra** | INF-01 template with "Nothing yet — first task" |
| **Xon building auth** | INF context + AUTH task details + "already done" references |
| **Nurain reporting auth bug** | Bug template with steps to reproduce + device info |
| **Vivian testing events** | "I'm testing [feature]. If it works, confirm. If not, paste the bug template" |
| **Grace building rewards** | INF context + REW task details + coupon table schema reference |
| **Anyone in Sprint 5** | "We need E2E test: [describe full journey]. Generate test data and walk me through it." |

---

*Reference: v2 — May 10, 2026 · Sprint 1 tasks INF-01→06 + AUTH-01→06 fall in week of 7–27 May*
