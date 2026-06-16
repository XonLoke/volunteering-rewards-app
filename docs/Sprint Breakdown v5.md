# Sprint Breakdown v5 — Vertical Slices

> **Approach:** Each team member owns end-to-end vertical slices
> (backend + frontend for their feature area).
>
> **Timeline:** May 7 – July 6, 2026 (9 weeks)
> **Team:** Xon, Vivian, Grace, Nurain

---

## Initial Planning *(Completed)*

| Milestone | Date | Status |
|-----------|------|--------|
| Project briefing | 23 Apr | Done |
| Coding plan & database plan | 24 Apr – 6 May | Done |
| First team meet | 7 May | Done |
| Second team meet (confirm DB + task allocation) | 11 May | Done |

---

## Sprint 1 *(7–18 May) — Foundation + Auth Backend* **COMPLETED**

### Xon (Infrastructure & Backend)

| ID | Task | Status |
|----|------|--------|
| INF-01 | Backend project scaffolding (Express, package.json, folder structure) | Done |
| INF-02 | Database connection (PostgreSQL pool + health check) | Done |
| INF-03 | 12 database migration files + runner script | Done |
| INF-04 | Seed data script (roles, users, events, coupons) | Done |
| INF-05 | Git branching setup | Done |
| INF-06 | Error handler middleware | Done |
| AUTH-01 | Registration API | Done |
| AUTH-02 | Login API | Done |
| AUTH-03 | JWT authentication middleware | Done |
| AUTH-04 | Role guard middleware | Done |
| AUTH-05 | Token refresh API | Done |
| AUTH-06 | Profile API | Done |
| AUTH-10 | Rate limiter middleware | Done |

### Sprint 1 Deliverables
- Express backend boots on port 3000
- Database has all 12 tables
- Auth APIs working (register, login, profile, refresh)
- Seed data populated (3 users, 1 org, 3 events, 3 coupons)
- All branches updated on GitHub
- API contracts frozen in API_CONTRACTS.md
- Team workflow document (TEAM_WORKFLOW.md)

---

## Sprint 2 *(18 May – 1 Jun) — Backend Implementation*

> **Each person implements their slice's backend (routes + controllers + services)
> and connects their frontend screens to the live API.**
>
> API contracts are frozen in API_CONTRACTS.md — do not deviate.
>
> **Mid-sprint checkpoint (25 May):** Each person demos at least 2 working endpoints.

---

### Xon (Auth Slice + Shared Infrastructure)

| ID | Task | Status |
|----|------|--------|
| INF-07 | CI/CD pipeline (GitHub Actions — test on push, deploy on merge) | Pending |
| INF-08 | Dockerfile + docker-compose.yml | Pending |
| INF-09 | Environment config templates (.env.example) | Pending |
| AUTH-07 | Admin user management API | Done |
| AUTH-08 | Organization registration API | Pending |
| AUTH-09 | Organization approval API | Done |
| AUTH-HARDEN | Joi validation (register + login schemas) | Done |
| AUTH-HARDEN | Contract-compliant error codes across all middleware | Done |
| AUTH-HARDEN | Rate limiter tuning (login 10/min, register 5/min) | Done |
| WEB-ADM-01 | Admin login page (HTML) | Done |
| WEB-ADM-02 | Admin dashboard page (metrics + quick actions) | Done |
| WEB-ADM-03 | Admin users management page (search + deactivate) | Done |
| WEB-ADM-04 | Admin organisers page (approve/reject) | Done |
| WEB-ADM-SHARED | shared/api.js HTTP client with token management | Done |
| WEB-ADM-SHARED | shared/admin.css stylesheet | Done |

**Backend files owned:** auth.routes, auth.controller, auth.service, all middleware files, DB config, migrations.
**Frontend owned:** Mobile auth screens (login/register — shared with Vivian's app). Admin portal: login, dashboard, users, organisers.

---

### Vivian (Event Slice + QR Attendance Slice)

| ID | Task | Status |
|----|------|--------|
| EVT-01 | Event CRUD API | Pending |
| EVT-02 | Event search & filter API | Pending |
| EVT-03 | Event registration (join/leave) API | Pending |
| EVT-04 | QR scan attendance API | Pending |
| EVT-05 | Attendance log API | Pending |
| EVT-06 | Event feedback API | Pending |
| EVT-07 | Event Q&A API | Pending |
| EVT-08 | Favorites API | Pending |
| MOB-NAV | Mobile app navigation structure (Expo Router tabs + auth flow) | Done |
| MOB-COMPS | Shared UI components (Button, Input, Card, Toast, Badge, etc.) | Done |
| MOB-EVT-LIST | Event browse screen with search/filters | Done |
| MOB-EVT-DETAIL | Event detail screen | Done |
| MOB-EVT-MY | My events screen (upcoming + past) | Done |
| MOB-REW-CATALOG | Rewards catalog screen | Done |
| MOB-REW-DETAIL | Reward detail + redeem screen | Done |
| MOB-PROFILE | Profile screen with QR code display | Done |

**Backend files owned:** events.routes, attendance.routes, favorites.routes + controllers + services.
**Frontend owned:** Mobile event screens (browse, detail, my events), organiser web (roster, feedback, scanning), QR scanning app, organiser scanning mobile app.

> **Note:** Vivian's mobile frontend screens are built. The backend API endpoints for events/attendance/favorites still need implementation.

---

### Grace (Rewards Slice + Merchant Slice)

| ID | Task | Status |
|----|------|--------|
| REW-01 | Coupon CRUD API | Pending |
| REW-02 | Coupon browse (available rewards) API | Pending |
| REW-03 | Coupon redemption (online) API | Pending |
| REW-04 | PIN generation API | Pending |
| REW-05 | PIN verification API | Pending |
| REW-06 | Redemption audit log API | Pending |
| REW-07 | Coupon reverse API (5-min window) | Pending |
| REW-08 | Coupon quantity management API | Pending |
| REW-09 | Merchant redemption history API | Pending |
| REW-10 | Rewards configuration API (admin) | Pending |
| MER-M01 | Merchant PIN entry screen (6-digit input) | Pending |
| MER-M02 | Verification result screen (success/error) | Pending |
| MER-M03 | Redemption history screen | Pending |
| WEB-ADM-06 | Admin coupons / PIN codes management page | Pending |
| WEB-ADM-07 | Rewards config page | Pending |

**Backend files owned:** rewards.routes, merchant.routes + controllers + services.
**Frontend owned:** Rewards catalog (mobile — screens done by Vivian, API wiring by Grace). Merchant mobile app (PIN entry, verification, history). Admin web: coupons, redemptions pages.

---

### Nurain (Admin Slice + Organiser Slice)

| ID | Task | Status |
|----|------|--------|
| ADM-01 | Admin dashboard API (metrics) | Done |
| ADM-02 | Admin users listing API (search + filter + pagination) | Done |
| ADM-03 | Admin user detail API (events attended, points) | Done |
| ADM-04 | Admin user deactivate/reactivate API | Done |
| ADM-05 | Admin organiser listing API (status filter) | Done |
| ADM-06 | Admin organiser approve/reject API | Done |
| ORG-01 | Organiser registration API | Pending |
| ORG-02 | Organiser dashboard API | Pending |
| ORG-03 | Organiser event management API | Pending |
| ME-01 | Volunteer my-events API | Pending |
| ME-02 | Volunteer my-points API | Pending |
| ME-03 | Volunteer my-coupons API | Pending |
| ME-04 | Volunteer my-qr-code API | Pending |
| ME-05 | Volunteer my-favorites API | Pending |
| WEB-ADM-05 | Admin events participation page | Pending |
| WEB-ADM-08 | Admin redemption history page | Pending |
| WEB-ADM-09 | Admin QR codes page | Pending |
| WEB-ORG-01 | Organiser login page | Pending |
| WEB-ORG-02 | Organiser dashboard page | Pending |
| WEB-ORG-03 | Organiser event list page | Pending |
| WEB-ORG-04 | Organiser event create/edit page | Pending |
| WEB-ORG-05 | Organiser volunteer roster page | Pending |
| WEB-ORG-06 | Organiser onsite controller page | Pending |
| WEB-ORG-07 | Organiser feedback viewer page | Pending |
| WEB-ORG-08 | Organiser Q&A management page | Pending |

**Backend files owned:** admin.routes, organiser.routes, me.routes + controllers + services.
**Frontend owned:** Admin web: events participation, rewards config, redemption history, QR codes. Organiser web: dashboard, events, event-edit, Q&A.

> **Note:** Nurain's web UI prototypes (visual mockups) are done. They need API calls wired in during this sprint to become functional.

---

### Sprint 2 Deliverables
- All backend API endpoints implemented per person's slice
- At least 2 working endpoints per person by mid-sprint checkpoint (25 May)
- Admin portal fully functional (all pages connected to live API)
- Mobile app connected to live auth API
- Shared API patterns documented and consistent across all slices

---

## Sprint 3 *(1 Jun – 15 Jun) — Frontend Completion + Integration*

> **Finish remaining screens. End-to-end testing across slices.**
>
> **No new backend features — only fixes found during frontend connection.**

### Everyone: Integration + Remaining Screens

| Member | Focus |
|--------|-------|
| **Xon** | Complete remaining admin pages (events, coupons, redemptions, rewards-config). Resolve cross-slice contract drift. Assist blocked members. |
| **Vivian** | Wire event screens to live backend. Build QR scanning app. Complete organiser scanning pages (roster, scanning, feedback). |
| **Grace** | Build merchant mobile app (PIN entry, verification, history). Wire rewards catalog to live backend. Complete admin coupons/rewards-config pages. |
| **Nurain** | Wire organiser portal to live backend. Complete admin events/participation/QR pages. Complete me.routes integration. |

### Workflow Verification

Verify **all end-to-end flows**:

| Flow | Steps |
|------|-------|
| **Volunteer** | Register -> Browse events -> Join event -> Display QR -> Get scanned -> View points -> Browse rewards -> Redeem -> View PIN |
| **Organiser** | Login -> Create event -> View roster -> Scan volunteer QR -> Confirm attendance -> View feedback |
| **Admin** | Login -> Dashboard -> Manage users -> Approve organiser -> View events participation -> Manage coupons/redemptions -> View rewards config |
| **Merchant** | Login -> Enter PIN -> Verify -> Confirm redemption -> View history |

### Sprint 3 Deliverables
- All frontend screens connected to live backend
- All 4 end-to-end workflows verified and working
- Cross-slice integration issues resolved

---

## Sprint 4 *(15 Jun – 29 Jun) — Hardening*

> **Testing, security, edge cases, bug fixes. Target >70% test coverage on critical paths.**

### Xon (Architecture & Performance)

| ID | Task |
|----|------|
| PERF-01 | Database query performance review (add indexes where needed) |
| PERF-02 | API response time optimisation |
| INT-04 | Full-system integration smoke test |
| DOC-ARCH | Architecture decision log updated |

### Vivian (Security Audit)

| ID | Task |
|----|------|
| SEC-01 | Auth middleware audit — every endpoint has correct role guard |
| SEC-02 | Input validation audit — no unvalidated user input |
| SEC-03 | Hardcoded secrets scan |
| SEC-04 | Dependency vulnerability audit |
| SEC-05 | Rate limiting verification on all public endpoints |
| SEC-06 | SQL injection check |
| SEC-07 | Security audit report published |

### Grace (Test Suite)

| ID | Task |
|----|------|
| TST-03 | Unit tests for critical business logic (points calculation, coupon expiry, PIN validation) |
| TST-04 | API integration tests — every endpoint (happy path + error path) |
| TST-05 | Edge case tests (expired coupons, full events, invalid PINs, duplicate registrations) |
| TST-06 | Error screen verification (all frontend error states) |
| TST-07 | Test coverage report — target >70% |
| TST-08 | Bug tracking log maintained |

### Nurain (UI Polish + Documentation)

| ID | Task |
|----|------|
| GUI-POLISH-01 | Cross-app visual consistency check |
| GUI-POLISH-02 | Edge case screen states (loading, empty, error, offline) |
| GUI-POLISH-03 | Accessibility review (touch targets, contrast, labels) |
| DOC-01 | User manual draft (volunteer, organiser, admin, merchant) |

### Sprint 4 Deliverables
- Full test suite with >70% coverage target
- Security audit completed + report published
- All edge case screens handled
- User manual drafted
- All critical bugs fixed

---

## Sprint 5 *(29 Jun – 6 Jul) — Delivery*

> **Final polish, presentation, and deployment.**

### Xon (Final Integration + Deployment)

| ID | Task |
|----|------|
| DEPLOY-01 | Backend deployment (Render / Railway) |
| DEPLOY-02 | Staging environment setup |
| DEPLOY-03 | Production environment setup |
| DEPLOY-04 | Cloud test — full workflow on live URLs |
| DOC-README | README.md with setup instructions |
| DOC-API | API documentation finalised |

### Vivian (Final Security)

| ID | Task |
|----|------|
| SEC-08 | Pre-deployment security scan |
| SEC-09 | Environment secrets audit (no credentials in code) |
| DEPLOY-SEC | Secure deployment verification (HTTPS, CORS, rate limits) |

### Grace (App Polish)

| ID | Task |
|----|------|
| DEPLOY-MOB | Frontend deployment (static hosting / Vercel) |
| TST-E2E | Final end-to-end test pass |
| BUF-01 | Buffer for spill-over fixes |

### Nurain (Presentation + Manual)

| ID | Task |
|----|------|
| PRES-01 | Presentation slides creation |
| PRES-02 | Demo script + walkthrough |
| PRES-03 | Demo rehearsal with entire team |
| DOC-02 | User manual finalised |
| DOC-03 | Project report finalised |

### Final Deliverables *(Due: 6 Jul 2026)*

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

---

## Summary — 5 Sprints (7 May – 6 Jul 2026)

| Sprint | Dates | Focus | Duration |
|--------|-------|-------|----------|
| **Sprint 1** | 7–18 May | Foundation + Auth Backend | 12 days |
| **Sprint 2** | 18 May – 1 Jun | Backend Implementation (per slice) | 14 days |
| **Sprint 3** | 1 Jun – 15 Jun | Frontend Completion + Integration | 14 days |
| **Sprint 4** | 15 Jun – 29 Jun | Hardening (testing, security, bug fixes) | 14 days |
| **Sprint 5** | 29 Jun – 6 Jul | Delivery (polish, presentation, deployment) | 7 days |

**Total: 60 days (7 May – 6 Jul)**

### What Changed from v4

| Item | v4 | v5 |
|------|-----|-----|
| **Approach** | Concentrated generation (1 week sprint) | Incremental vertical slice development |
| **Team names** | Member B, C, D | Vivian, Grace, Nurain |
| **Ownership** | Functional split (backend team, frontend team) | Vertical slices (each person owns features end-to-end) |
| **Sprint 2 dates** | 18–25 May (7 days) | 18 May – 1 Jun (14 days) |
| **Sprint 3 focus** | Integration only | Frontend completion + integration |
| **Xon's Sprint 2** | CI/CD, Docker, remaining APIs | Auth hardening done, admin portal 4 pages done, remaining infrastructure |
| **Integration risk** | Not addressed | Documented mitigation (frozen contracts, route ownership, weekly merges) |
