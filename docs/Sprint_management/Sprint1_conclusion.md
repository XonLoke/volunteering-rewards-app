# Sprint 1 Conclusion — Foundation + Auth Backend

> **Period:** 7–18 May 2026
> **Status:** Completed

---

## Xon — Infrastructure & Auth Backend

| Deliverable | Details | Status |
|-------------|---------|--------|
| Backend scaffolding | Express server, folder structure, package.json | Done |
| Database | PostgreSQL pool, 12 migration files, runner + seed scripts | Done |
| Auth API | Register, login, profile, token refresh — JWT + bcrypt | Done |
| Middleware | Auth (JWT verify), role guard, error handler, rate limiter | Done |
| Auth hardening | Joi validation, contract-compliant error codes, response shapes | Done |
| Admin portal | 4 pages: login, dashboard, users, organisers + shared api.js/css | Done |
| Documents | Architecture SVG, Technical Guide v3, API contracts, workflow guide | Done |

## Vivian — Mobile App (incl. v-Vivian)

| Deliverable | Details | Status |
|-------------|---------|--------|
| Auth screens | Login, Register (SG phone validation), Onboarding (3-step) | Done |
| Event screens | Browse (search + filters), Detail (capacity bar), My events (tabs) | Done |
| Rewards screens | Catalog (online/in-store), Detail + redeem with PIN display | Done |
| Profile screen | Avatar, points summary, QR code, points history, logout | Done |
| Navigation | Expo Router with auth gating + bottom tab bar | Done |
| Components | 8 shared: Button, Input, Card, Badge, Toast, Spinner, Empty, Error | Done |
| Services | API client (auto-JWT), SecureStore, Theme system | Done |
| **Total** | **~30 files, ~4,500 lines TypeScript** | |

## Grace — Web Portals (incl. v-Grace)

| Deliverable | Details | Status |
|-------------|---------|--------|
| Admin portal (React) | 11 pages: Dashboard, Users, Organisers, Coupons, Rewards Config, Redemptions, PIN Verify, Events, QR Codes, Merchants, Campaigns | Done |
| Organiser portal | 8 pages: Dashboard, Events, Create/Edit, Roster, Feedback, Q&A, Onsite Controller | Done |
| Scanning app | 4 pages: Login, Today's Events, Scanner, Roster | Done |
| Merchant app | 3 pages: Login, PIN Entry (verify/redeem/undo), History | Done |
| Shared infra | Components (Sidebar, Topbar, DataTable, Modal, Toast), API client, Layouts | Done |
| **Total** | **~43 files, ~6,500 lines React/Vite** | |

## Nurain — Prototypes & Audit (incl. v-Nurain)

| Deliverable | Details | Status |
|-------------|---------|--------|
| Admin prototype | 11 HTML pages: Dashboard, users, events, coupons, rewards, redemptions, organisers, merchants, QR codes, campaigns | Done (visual) |
| Organiser prototype | 8 HTML pages: Login, register, dashboard, events, event-edit, feedback, assessment, onsite-controller | Done (visual) |
| Auth audit | 13 test checkpoints across mobile + web — all passed, 0 blocking issues | Done |

---

## Sprint Deliverables Summary

| Deliverable | Status |
|-------------|--------|
| Express backend boots on port 3000 | Done |
| Database has all 12 tables | Done |
| Auth APIs (register, login, profile, refresh) | Done |
| Seed data populated | Done |
| All branches updated on GitHub | Done |
| Mobile app (10 screens) | Done |
| Web portals (26 pages across 4 apps) | Done |
| Auth audit (13/13 pass) | Done |
| Sprint plan | Done |

## GitHub Status

**Pushed:** All backend code, mobile app, web portals, admin portal, prototypes.
**Local only (not on GitHub):** API_CONTRACTS.md, TEAM_WORKFLOW.md, Virtual Team Output Reports.

---

*Generated 18 May 2026 — Next: Sprint 2 (Backend Implementation, 18 May – 1 Jun)*
