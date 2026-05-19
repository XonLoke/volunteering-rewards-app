# Draft Reply to Andy — Vertical Slice Restructure

---

Hi Andy, thanks for the detailed feedback. I've discussed it with the team and we agree with your points. Here's our revised approach.

## Changes Based on Your Feedback

1. **WATD** — We'll keep it as an internal coordination framework only, not presented as an established methodology in any submission.

2. **Everyone codes** — We've restructured from a horizontal split (1 backend / 2 frontend / 1 testing) into vertical slices where each member owns complete features end-to-end (backend + frontend + testing for their slice).

3. **No 1-week concentrated generation** — We'll develop incrementally across sprints with runnable, testable deliverables each iteration.

4. **Individual contribution evidence** — Each member will have commits, test results, and a working demo of their own slices to present at the final assessment.

## Proposed Slice Allocation

| Person | Slices | Backend files they own | Frontend they own |
|--------|--------|----------------------|-------------------|
| **Xon** | Auth slice + shared infrastructure | auth.routes, auth.controller, auth service, all middleware files, DB config, migrations | Login/register (mobile). Admin web: login, dashboard, users, organisers |
| **Vivian** | Event slice + QR attendance slice | events.routes, attendance.routes, favorites.routes + controllers + services | Mobile: event screens (browse, detail, my events), QR scanning app. Organiser web: roster, feedback, scanning |
| **Grace** | Rewards slice + merchant slice | rewards.routes, merchant.routes + controllers + services | Rewards catalog (mobile). Merchant web: PIN/history. Admin web: coupons, redemptions |
| **Nurain** | Admin/organiser slice | admin.routes, organiser.routes, me.routes + controllers + services | Admin web: events participation, rewards config. Organiser web: dashboard, events, event-edit, Q&A |

> **Workload balance:** We redistributed some frontend pages from Nurain (originally 19) across the team based on backend table ownership — each person now has 4-7 web pages. This keeps every slice manageable while giving everyone meaningful web development experience.

**Shared infrastructure maintained by Xon (for everyone):**
- Database connection pool, migration runner, seed scripts
- JWT authentication middleware, role guard middleware
- Error handler, rate limiter
- Docker setup, CI/CD pipeline

Everything else is distributed. Each person implements their own route handlers, controllers, service layer, and connects their own frontend screens.

## Revised Sprint Plan

**Sprint 2 (18 May – 1 Jun) — Backend Implementation**
Each person implements their slice's backend (routes + controllers + services) and connects existing frontend screens to live API.
- Evidence per person: Backend commits, tested API endpoints (Postman screenshots), connected frontend screen
- Mid-sprint checkpoint (25 May): Each person demos at least 2 working endpoints

**Sprint 3 (1 Jun – 15 Jun) — Frontend Completion + Integration**
Finish remaining screens, end-to-end testing across slices, cross-slice workflow verification.
- Evidence per person: Working demo of their full slice, API contract compliance verified
- Verify these flows end-to-end:
  - Volunteer: Register → Browse events → Join event → Display QR → Get scanned → View points → Browse rewards → Redeem → View PIN
  - Organiser: Login → Create event → View roster → Scan QR → Confirm attendance
  - Admin: Login → Dashboard → Manage users → Approve organiser → View events participation → Manage coupons/redemptions → View rewards config
  - Merchant: Login → Enter PIN → Verify → Confirm redemption → View history

**Sprint 4 (15 Jun – 29 Jun) — Hardening**
Test coverage, security review, edge cases, bug fixes.
- Target: >70% test coverage on critical paths
- Security: Auth middleware audit, input validation, rate limiting verification

**Sprint 5 (29 Jun – 6 Jul) — Delivery**
Deployment, presentation prep, user manual, final demo.

## Descope Plan (if timeline slips)

| If | Then |
|----|------|
| Sprint 2 slips | Defer advanced features (event Q&A, favorites toggle, analytics) to Sprint 3 |
| Sprint 3 slips | Defer cross-slice integration testing to Sprint 4; verify critical flows only (auth → event → QR → reward) |
| Sprint 4 slips | Reduce test coverage target from 70% to 50%, focus on auth + rewards + attendance critical paths |
| Sprint 5 slips | Deploy to single free-tier instance instead of containerized; simplify presentation deck |

## Integration Risk Mitigation

Your concern about multiple people touching backend code is valid. Here's how we prevent fragmentation:

1. **Shared database schema** — Xon gates all migration changes. Schema is the single source of truth everyone references.
2. **Frozen API contracts** — Response shapes are documented in API_CONTRACTS.md. Everyone generates code against this spec, not against personal interpretation.
3. **Route file ownership** — Each person owns specific route files. No two people edit the same file.
4. **Pattern templates** — We've documented exact code patterns (route structure, controller format, error handling) that everyone follows, so all four slices use identical conventions.
5. **Weekly main merges** — Every Friday, working code merges via PR. Blockers surface same-week, not end-of-semester.

We're confident this structure gives each member meaningful technical contribution across the full stack while keeping the system integratable. Happy to discuss further or adjust the allocation if you see issues.

Thanks,
Xon
