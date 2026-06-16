# Pre-Implementation Report — Code Generation Preparation

> **Version:** v1 — May 15, 2026
> **Purpose:** Document all scaffolding, infrastructure, and reference materials prepared ahead of Sprint 2's concentrated code generation push.

---

## 1. Executive Summary

Before the team can execute the concentrated code generation approach (Sprint 2), the following groundwork was essential:

| Gap | Why It Matters | Resolution |
|-----|---------------|------------|
| No frozen API contracts | Frontend/backend teams would build mismatched interfaces | Created `API_CONTRACTS.md` — 45+ endpoints with exact JSON shapes |
| No route scaffolding | Team members would waste time wiring routes instead of writing business logic | Created route + controller stubs for all 6 endpoint groups |
| Missing middleware (merchant role) | Merchant endpoints had no auth guard | Extended `role.middleware.js` with `roleGuard` factory |
| No static file serving | Frontend apps wouldn't load from Express | Added `express.static()` to `index.js` |
| No CI/CD pipeline | No automated testing or deployment path | Created Dockerfile, docker-compose.yml, GitHub Actions CI |
| No AI generation playbook | Team would lack consistent generation instructions | Created `AI_GENERATION_PROMPTS.md` with per-member prompts |

Total project files: **57+ source files** (12 migrations, 26 backend JS, 15+ planning/docs, Docker + CI)

---

## 2. Document Foundation

### 2.1 API_CONTRACTS.md — The Single Source of Truth

**Location:** `D:\c3000c\volunteering-rewards-app\API_CONTRACTS.md`

**Why this was created first:** Without frozen API contracts, the concentrated code generation approach fails — different team members would build against different assumptions about request/response shapes.

**What it covers (6 sections, 45+ endpoints):**

| Section | Endpoints | Consumer |
|---------|-----------|----------|
| Auth | 5 (register, login, refresh, profile, register/organiser) | All apps |
| Volunteer Mobile | 16 (events, attendance, me, rewards, coupons) | Member C |
| Organiser Web | 10 (dashboard, events CRUD, roster, feedback, Q&A) | Member D |
| Scanning App | 5 (today's events, scan, roster, stats) | Member D |
| Admin Web | 17 (dashboard, users, organisers, coupons, config, redemptions) | Xon |
| Merchant App | 4 (verify, redeem, reverse, history) | Member D |

**Each endpoint includes:**
- HTTP method + path
- Auth requirements + rate limits
- Request body shape (with JSON examples)
- Success response shape
- All possible error codes with HTTP status

**Status:** Frozen — do not modify without updating this document.

---

### 2.2 AI_GENERATION_PROMPTS.md — The Team's Generation Playbook

**Location:** `D:\c3000c\volunteering-rewards-app\AI_GENERATION_PROMPTS.md`

**Format:** Each member has a reusable **context block** (project overview, patterns, constraints) followed by **specific prompts** for their assigned modules.

#### Member Breakdown

| Member | Prompts | What They Generate |
|--------|---------|-------------------|
| **Xon** | 3 prompts | Admin APIs (users, organisers, events, coupons, config, redemptions) + CI/CD + Docker |
| **Member B** | 4 prompts | All backend services: Events (8 endpoints), Attendance + Me (8 endpoints), Rewards + Merchant (6 endpoints), Organiser (10 endpoints) |
| **Member C** | 4 prompts | Volunteer mobile app (onboarding, auth, events store, event detail, my events, QR code, points, rewards catalog, PIN display, my coupons) + test scaffolding |
| **Member D** | 4 prompts | Organiser web portal (8 pages), Admin web portal (9 pages), Scanning app (4 screens), Merchant redemption app (3 screens) |

#### Generation Schedule (5 Days)

| Day | Activity |
|-----|----------|
| Day 1 | All backend services + controllers (Member B + Xon) |
| Day 2 | Volunteer mobile app screens (C) + Organiser/Admin portals (D) |
| Day 3 | Scanning app + merchant app + test scaffolding (C + D) |
| Day 4 | PR review pass — fix issues, ensure contracts match |
| Day 5 | Buffer — address remaining gaps |

---

## 3. Backend Scaffolding

### 3.1 Pre-existing Backend (Already Working)

Before preparation, the backend had a functional Express server with:

- **Middleware stack:** CORS, helmet, rate limiter, error handler
- **Auth system:** Working register, login, refresh token, profile (controller + service + JWT utils)
- **Database:** 12 migration files covering all tables
- **Database tables:** roles, users, organizations, events, event_registrations, attendance_logs, event_feedback, event_qna, favorites, coupons, user_coupons, redemption_logs

### 3.2 New Route Files (Created)

Each route file maps exactly to the API endpoints in `API_CONTRACTS.md`:

| Route File | Endpoints | Auth Required |
|-----------|-----------|---------------|
| `routes/events.routes.js` | browse, categories, detail, join, leave, feedback, qna (view + ask) | All except browse/categories |
| `routes/attendance.routes.js` | scan, batch | Organiser |
| `routes/rewards.routes.js` | browse, redeem | Volunteer |
| `routes/merchant.routes.js` | verify, redeem, reverse, history | Merchant |
| `routes/organiser.routes.js` | dashboard, events (CRUD), roster, feedback, qna | Organiser |
| `routes/admin.routes.js` | dashboard, users (list/get/update/delete), organisers (list/approve), events, coupons (CRUD), config, redemptions | Admin |
| `routes/me.routes.js` | events, qr-code, points, coupons, favorites | Volunteer |
| `routes/favorites.routes.js` | toggle | Volunteer |

### 3.3 New Controller Stubs (Created)

Each controller has stub functions that return the correct `API_CONTRACTS.md` response shapes as placeholder data. All stubs follow the pattern:

```javascript
async function endpoint(req, res, next) {
  try {
    // TODO: Implement service call
    res.json({ ... });
  } catch (err) {
    next(err);
  }
}
```

**Controllers created:** events, attendance, rewards, merchant, organiser, admin, me (7 files, ~50+ stub functions total)

### 3.4 Middleware Extension

`role.middleware.js` — Added `roleGuard` factory function that returns named guards:

```javascript
const { requireVolunteer, requireOrganiser, requireAdmin, requireMerchant } 
  = roleGuard(["volunteer", "organiser", "admin", "merchant"]);
// or use the existing authorize() pattern:
router.delete("/:id", authenticate, authorize("admin"), controller.deleteItem);
```

### 3.5 Server Entry Point Updated

`backend/index.js` — All route groups registered, frontend static files served:

```javascript
app.use(express.static(path.join(__dirname, "..", "frontend")));
// 9 route groups registered under /api/*
```

---

## 4. Infrastructure Setup

### 4.1 Dockerfile

**Location:** `D:\c3000c\volunteering-rewards-app\Dockerfile`

- **Base:** `node:20-alpine`
- **Install:** `npm ci --only=production` for minimal image size
- **Copies:** backend source + frontend static files
- **Exposes:** port 3000
- **Command:** `node index.js`

### 4.2 Docker Compose

**Location:** `D:\c3000c\volunteering-rewards-app\docker-compose.yml`

- **App service:** Builds from Dockerfile, loads environment from `backend/.env`
- **PostgreSQL 16:** Alpine image with health check (`pg_isready`)
- **Persistent volume:** `pgdata` for database storage across restarts
- **Dependency:** App waits for `db` service to be healthy before starting

### 4.3 GitHub Actions CI

**Location:** `D:\c3000c\volunteering-rewards-app\.github\workflows\ci.yml`

- **Triggers:** Push to `main` and `feature/**` branches, PRs to `main`
- **Node 20:** With npm cache for faster installs
- **PostgreSQL 16:** Runs as a service container with health check
- **Steps:**
  1. Checkout code
  2. Setup Node 20 with cache
  3. `npm ci` in backend/
  4. Run migrations against test database
  5. `npm test`

---

## 5. Team Workflow & Planning Documents

### Document Inventory

| Document | Version | Purpose |
|----------|---------|---------|
| `TEAM_WORKFLOW.md` | v2 | Team structure, WATD hybrid roles, concentrated generation model, 3-gate PR approval |
| `PROPOSAL_WATD_METHOD.md` | v2 | Supervisor-facing proposal: WATD rationale, team structure, sprint plan, risk mitigation |
| `Sprint Breakdown v3.md` | v3 | Per-sprint task breakdown with member assignments, sprint calendar (May 7 – Jul 6) |
| `API_CONTRACTS.md` | v1 | Frozen API contracts (45+ endpoints) |
| `AI_GENERATION_PROMPTS.md` | v1 | Member-by-member generation prompts with context blocks |

### Sprint Timeline (Updated)

| Sprint | Dates | Focus |
|--------|-------|-------|
| Sprint 1 | May 7 – May 17 | Prototypes + foundation (COMPLETE) |
| Sprint 2 | May 18 – May 24 | Concentrated code generation |
| Sprint 3 | May 25 – Jun 14 | Integration + testing |
| Sprint 4 | Jun 15 – Jun 28 | Hardening + security + fixes |
| Sprint 5 | Jun 29 – Jul 6 | Deployment + presentation prep |

---

## 6. What Remains for Sprint 2

When the team gets the green light, the code generation execution is:

### Day 1 — Backend (Member B + Xon)
- Member B: Implement events, attendance, me controllers + services
- Member B: Implement rewards, merchant, organiser controllers + services
- Xon: Implement admin controller (users, organisers, events)
- Xon: Implement admin controller (coupons, config, redemptions)

### Day 2 — Frontends (Member C + D)
- Member C: Volunteer mobile app screens (onboarding, auth, events)
- Member D: Organiser web portal (8 pages), Admin web portal (9 pages)

### Day 3 — Remaining Frontends + Tests (Member C + D)
- Member C: QR/points/rewards screens + test scaffolding
- Member D: Scanning app (4 screens), Merchant app (3 screens)

### Day 4 — Integration Review
- All members: PR review pass, contract compliance check
- Fix issues found during review

### Day 5 — Buffer
- Address any remaining gaps or edge cases

**Prerequisites for Day 1:**
- Each member receives: `API_CONTRACTS.md`, `AI_GENERATION_PROMPTS.md` (their section only), route + controller stubs
- Each member has Node 20 + PostgreSQL running locally
- Each member clones fresh and can run `npm ci` + migrations

---

## 7. File Manifest (All Preparation Files)

### New Files Created During Preparation

```
volunteering-rewards-app/
├── API_CONTRACTS.md                          # Frozen API contracts (45+ endpoints)
├── AI_GENERATION_PROMPTS.md                  # Member generation prompts
├── Dockerfile                                # Production container
├── docker-compose.yml                        # App + PostgreSQL
├── .github/workflows/ci.yml                  # GitHub Actions CI
├── Pre-Implementation Report v1.md           # THIS DOCUMENT
│
├── backend/src/routes/
│   ├── events.routes.js                      # 8 event endpoints (rewritten from stub)
│   ├── attendance.routes.js                  # 2 attendance endpoints
│   ├── rewards.routes.js                     # 2 reward endpoints (rewritten from stub)
│   ├── merchant.routes.js                    # 4 merchant endpoints
│   ├── organiser.routes.js                   # 10 organiser endpoints
│   ├── admin.routes.js                       # 17 admin endpoints
│   ├── me.routes.js                          # 5 volunteer endpoints
│   └── favorites.routes.js                   # 1 toggle endpoint
│
├── backend/src/controllers/
│   ├── events.controller.js                  # 8 stub functions
│   ├── attendance.controller.js              # 2 stub functions
│   ├── rewards.controller.js                 # 2 stub functions
│   ├── merchant.controller.js                # 4 stub functions
│   ├── organiser.controller.js               # 10 stub functions
│   ├── admin.controller.js                   # 17 stub functions
│   └── me.controller.js                      # 6 stub functions
│
└── backend/src/middleware/
    └── role.middleware.js                    # Extended with roleGuard factory
```

### Modified Files

```
backend/index.js                              # All routes registered + static file serving
```

### Pre-existing Backend Files Used by Scaffolding

```
backend/src/config/database.js               # PostgreSQL pool
backend/src/middleware/auth.middleware.js      # JWT authentication
backend/src/middleware/errorHandler.middleware.js  # Error formatting
backend/src/middleware/rateLimiter.middleware.js   # Rate limiting
backend/src/utils/jwt.js                      # Token generation
backend/src/utils/migrationRunner.js           # Migration execution
backend/migrations/001 through 012             # 12 database tables
```

---

## 8. Risk Checklist

| Risk | Mitigation |
|------|-----------|
| Team disagrees with WATD split | Proposal document ready for supervisor review |
| API contracts need changes mid-gen | Process: update contract doc → notify all members → regenerate affected code |
| Backend stubs don't match contracts | Verified each stub response shape against API_CONTRACTS.md |
| CI pipeline fails on first run | Docker + CI ready for testing the same day code is generated |
| Member unfamiliar with codebase | Context block in each AI prompt provides full project picture |
| Scope creep after generation starts | Contracts are frozen — any new feature is a new PR after Sprint 2 |
