# Team Workflow v2 — Vertical Slice Model

> **Purpose:** Clear role definitions, task distribution, and quality gates for the Volunteering Rewards App capstone project.
> **Target:** Complete by **6 July 2026** using a vertical slice approach.
> **Updated:** 21 May 2026 — Replaced WATD/concentrated model with vertical slices per supervisor feedback.

---

## Team Structure

| Person | Role | Backend Ownership | Frontend Ownership |
|--------|------|-------------------|-------------------|
| **Xon** | Architecture & Infrastructure Lead | Auth routes, all middleware, DB config, migrations, CI/CD, Docker | Admin login page, admin dashboard, admin users, admin organisers |
| **Vivian** | Events & QR Attendance Developer | Events routes + controller + service, attendance routes + controller + service, favorites routes + controller + service | Mobile event screens (browse, detail, my events), QR scanning app, organiser rostering/feedback |
| **Grace** | Rewards & Merchant Developer | Rewards routes + controller + service, merchant routes + controller + service | Mobile rewards catalog, merchant PIN app, admin coupons/redemptions/rewards config |
| **Nurain** | Admin & Organiser Developer | Admin routes + controller + service, organiser routes + controller + service, me routes + controller + service | Admin dashboard/users/organisers/events/QR, organiser portal (dashboard, events, Q&A) |

---

## Why Vertical Slices?

After our supervisor's feedback on the original WATD proposal, we restructured to **vertical slices** — each person owns features end-to-end from database to user interface.

**Benefits:**
- Every member has full-stack contribution evidence for assessment
- No single backend bottleneck blocking everyone
- Each slice is independently demoable at sprint checkpoints
- Integration is simpler because each slice self-contained
- Consistent API contracts prevent cross-slice conflicts

---

## Project Timeline (7 May – 6 Jul)

```
Sprint 1 ──── Foundation + Auth Backend ──── 7–18 May (COMPLETED)
  Express backend, PostgreSQL (13 tables), JWT auth, middleware, seed data

Sprint 2 ──── Backend Implementation ──── 18 May – 1 Jun (IN PROGRESS)
  Each person implements their slice's backend + wires frontend to live API

Sprint 3 ──── Frontend Completion + Integration ──── 1 Jun – 15 Jun
  Finish remaining screens. End-to-end testing across all slices.

Sprint 4 ──── Hardening ──── 15 Jun – 29 Jun
  Testing >70% coverage, security audit, bug fixes, edge cases

Sprint 5 ──── Delivery ──── 29 Jun – 6 Jul
  Final polish, presentation, user manual, deployment
```

---

## How Work Flows Per Sprint

### Sprint 2 (Current — 18 May – 1 Jun)

Each person implements their backend (routes + controllers + services) and connects their frontend screens to the live API.

```
Week 1 (18–24 May):
  Each person implements top-priority endpoints with real DB queries
  Xon: CI/CD, Docker, .env.example, auth hardening
  Vivian: GET /api/events, GET /api/events/:id, POST /api/events/:id/register
  Grace: GET /api/rewards, POST /api/rewards/:id/redeem, POST /api/coupons/verify
  Nurain: GET /api/admin/dashboard, GET /api/organiser/dashboard, GET /api/me/events

Mid-Sprint Checkpoint (25 May):
  Each person demos at least 2 working endpoints connected to the database

Week 2 (25 May – 1 Jun):
  Complete remaining endpoints. All controller stubs replaced with real DB queries.
```

### Sprint 3 (1 Jun – 15 Jun)

Keep `API_CONTRACTS_v2.md` open. Every response shape must match exactly.

```
Week 1: Wire remaining frontend screens to live backend
Week 2: Full end-to-end flow tests
  Volunteer: Register → Browse → Join → Display QR → Get scanned → View points → Redeem → View PIN
  Organiser: Login → Create event → View roster → Scan QR → View feedback
  Admin: Login → Dashboard → Manage users → Approve organiser → Manage coupons → View redemptions
  Merchant: Login → Enter PIN → Verify → Confirm redemption → View history
```

### Sprint 4 (15 Jun – 29 Jun)

Testing, security, and bug fixing.

| Person | Focus |
|--------|-------|
| **Xon** | Query performance, database indexes, API response times, system integration smoke test |
| **Vivian** | Security audit — every endpoint has correct role guard, input validation, no hardcoded secrets, SQL injection check, rate limiting verification |
| **Grace** | Unit tests for business logic (points calc, coupon expiry, PIN validation), API integration tests (every endpoint happy + error path), test coverage report >70% |
| **Nurain** | Cross-app visual consistency, edge case screens (loading, empty, error, offline), accessibility review, user manual draft |

### Sprint 5 (29 Jun – 6 Jul)

Final delivery.

| Person | Focus |
|--------|-------|
| **Xon** | Backend deployment (Render/Railway), staging + production setup, live URL test, README, final API docs |
| **Vivian** | Pre-deployment security scan, environment secrets audit, deployment security verification (HTTPS, CORS, rate limits) |
| **Grace** | Frontend deployment (static hosting/Vercel), final end-to-end test pass, buffer for spill-over fixes |
| **Nurain** | Presentation slides, demo script + walkthrough, user manual finalised, project report finalised |

---

## PR Quality Gates

Every pull request must pass all checks before merging to `main`:

### 1. Domain Review (by a peer from another slice)
- Code logic is correct
- Follows project conventions and patterns
- No obvious bugs or edge cases missed

### 2. Integration Check
- Routes don't conflict with other slices
- API response shape matches `API_CONTRACTS_v2.md`
- Server starts without errors
- No duplicate functionality introduced

### 3. Smoke Test
- `npm run migrate` runs cleanly (for DB changes)
- `npm run dev` starts without errors
- New endpoint returns expected status code

---

## Branch Strategy

```
main ──── Always working, always stable
   │
   ├── xon        ← Xon's work branch
   ├── vivian     ← Vivian's work branch
   ├── grace      ← Grace's work branch
   └── nurain     ← Nurain's work branch
```

**Flow:**
1. Pull latest `main` → merge into your branch
2. Work in your branch, commit often
3. Push your branch regularly to save progress
4. When slice is complete, Xon reviews and merges to `main`
5. Everyone pulls `main` to get latest

---

## Integration Guardrails

### Rule 1: API Contracts Are Frozen
`API_CONTRACTS_v2.md` (on OneDrive) is the single source of truth. Never change a response shape without updating the document AND telling the team.

### Rule 2: Route Files Don't Overlap
Each person owns specific route files (see team table above). Never edit a route file you don't own.

### Rule 3: Your Service, Your Tables
- Vivian: `events`, `event_registrations`, `attendance_logs`, `event_feedback`, `event_qna`, `favorites`
- Grace: `coupons`, `user_coupons`, `redemption_logs`, `users` (read-only for points)
- Nurain: `users`, `organizations`, all tables (read-only for stats)

### Rule 4: One Schema Source of Truth
Database migrations in `backend/migrations/` are authoritative. Need a new column? Tell Xon — he adds it to a migration and notifies everyone.

### Rule 5: Documents Go to OneDrive
Project documents (.md reports, guides, SVGs) are uploaded to OneDrive, not pushed to GitHub. GitHub contains only production code (`backend/`, `frontend/`, `.github/workflows/`, `Dockerfile`, `docker-compose.yml`).

---

## Tools & Conventions

| Concern | Standard |
|---------|----------|
| API contracts | Frozen in `API_CONTRACTS_v2.md` (OneDrive) |
| Backend framework | Express.js on port 3000 |
| Database | PostgreSQL (13 migrations in `backend/src/migrations/`) |
| Auth | JWT (access token 15min, refresh token 7 days) |
| Validation | Joi schemas in service layer |
| Admin portal | React + Vite at `frontend/web_portals/`, port 5173 |
| Mobile app | Expo/React Native at `frontend/mobile_app/` |
| Branch naming | `<name>` (xon, vivian, grace, nurain) |
| CI/CD | GitHub Actions (Lint → Test → Deploy placeholder) |
| Containerisation | Docker multi-stage build + docker-compose |
| Documents | OneDrive (not GitHub) |

---

## Quick Reference: Key URLs

| Resource | Location |
|----------|----------|
| Backend API | http://localhost:3000/api |
| Admin portal login | http://localhost:5173/admin/login |
| Admin dashboard | http://localhost:5173/admin |
| Organiser portal | http://localhost:5173/organiser |
| Merchant app | http://localhost:5173/merchant |
| Scanning app | http://localhost:5173/scan |
| GitHub repo | https://github.com/XonLoke/volunteering-rewards-app |
| CI pipeline | https://github.com/XonLoke/volunteering-rewards-app/actions |

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Volunteer | alice@test.com | password123 |

---

## Final Deliverables (Due: 6 Jul 2026)

| Deliverable | Owner |
|-------------|-------|
| Volunteer mobile app (10+ screens) | Team |
| Organiser web portal (8 pages) | Team |
| Admin web portal (9 pages) | Team |
| Organiser scanning app (mobile, 4 screens) | Team |
| Merchant redemption app (mobile, 3 screens) | Team |
| Backend API (45+ endpoints) | Team |
| Full test suite (>70% coverage) | Grace |
| Security audit report | Vivian |
| User manual | Nurain |
| Presentation slides | Nurain |
| Live demo ready | Everyone |
| Deployed on cloud | Xon |
