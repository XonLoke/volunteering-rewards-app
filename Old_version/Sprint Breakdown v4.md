# Sprint Breakdown v4 — Revised (Concentrated Generation)

> **Approach:** All code generated in one concentrated push (Sprint 2) against frozen API contracts.
> **Timeline:** May 7 – July 6, 2026 (saves ~5 weeks from original Aug 14 deadline)
> **Team Structure:** WATD Hybrid — W(Architecture) A(Audit) T(Testing) D(Deployment)

---

## Initial Planning *(Completed)*

| Milestone | Date | Status |
|-----------|------|--------|
| Project briefing | 23 Apr | ✅ Done |
| Coding plan & database plan | 24 Apr – 6 May | ✅ Done |
| First team meet | 7 May | ✅ Done |
| Second team meet (confirm DB + task allocation) | 11 May | ✅ Done |

---

## Sprint 1 *(7–18 May) — Foundation + Auth Backend* ✅ **COMPLETED**

### Xon (Infrastructure & Backend)

| ID | Task | Status |
|----|------|--------|
| INF-01 | Backend project scaffolding (Express, package.json, folder structure) | ✅ Done |
| INF-02 | Database connection (PostgreSQL pool + health check) | ✅ Done |
| INF-03 | 12 database migration files + runner script | ✅ Done |
| INF-04 | Seed data script (roles, users, events, coupons) | ✅ Done |
| INF-05 | Git branching setup | ✅ Done |
| INF-06 | Error handler middleware | ✅ Done |
| AUTH-01 | Registration API | ✅ Done |
| AUTH-02 | Login API | ✅ Done |
| AUTH-03 | JWT authentication middleware | ✅ Done |
| AUTH-04 | Role guard middleware | ✅ Done |
| AUTH-05 | Token refresh API | ✅ Done |
| AUTH-06 | Profile API | ✅ Done |
| AUTH-10 | Rate limiter middleware | ✅ Done |

### Sprint 1 Deliverables
- ✅ Express backend boots on port 3000
- ✅ Database has all 12 tables
- ✅ Auth APIs working (register, login, profile, refresh)
- ✅ Seed data populated (3 users, 1 org, 3 events, 3 coupons)
- ✅ All branches updated on GitHub
- ✅ API contracts frozen in `API_CONTRACTS.md`
- ✅ Team workflow document (`TEAM_WORKFLOW.md`)

---

## Sprint 2 *(18–25 May) — Concentrated Code Generation*

> **One week. All code generated in parallel against frozen API contracts.**
> **No incremental builds — generate everything now, integrate later.**

### The Principle
- API contracts are frozen — do not deviate from `API_CONTRACTS.md`
- Generate first, review second (PRs may lag behind generation)
- Focus on volume and contract compliance, not polish

---

### Xon (Architecture & Backend Scaffold)

| ID | Task | Category |
|----|------|----------|
| INF-07 | CI/CD pipeline (GitHub Actions — test on push, deploy on merge) | Infrastructure |
| INF-08 | Dockerfile + docker-compose.yml | Infrastructure |
| INF-09 | Environment config templates (.env.example for dev/staging/prod) | Infrastructure |
| INF-10 | File upload middleware (for organiser documents) | Infrastructure |
| AUTH-07 | Admin user management API | Auth |
| AUTH-08 | Organization registration API | Auth |
| AUTH-09 | Organization approval API | Auth |
| WEB-05 | Organizer event creation & management API | Web |
| WEB-06 | Admin points & redemption monitoring API | Web |

---

### Member B (Backend — All API Endpoints)

| ID | Task | Category |
|----|------|----------|
| EVT-01 | Event CRUD API | Events |
| EVT-02 | Event search & filter API | Events |
| EVT-03 | Event registration (join/leave) API | Events |
| EVT-04 | QR scan attendance API | Events |
| EVT-05 | Attendance log API | Events |
| EVT-06 | Event feedback API | Events |
| EVT-07 | Event Q&A API | Events |
| EVT-08 | Favorites API | Events |
| EVT-09 | Points award API | Events |
| EVT-10 | Event reporting / stats API | Events |
| REW-01 | Coupon CRUD API | Rewards |
| REW-02 | Coupon browse (available rewards) API | Rewards |
| REW-03 | Coupon redemption (online) API | Rewards |
| REW-04 | PIN generation API | Rewards |
| REW-05 | PIN verification API | Rewards |
| REW-06 | Redemption audit log API | Rewards |
| REW-07 | Coupon reverse API (5-min window) | Rewards |
| REW-08 | Coupon quantity management API | Rewards |
| REW-09 | Merchant redemption history API | Rewards |
| REW-10 | Rewards configuration API (admin) | Rewards |
| INF-11 | Postman collection for all endpoints | Testing |

---

### Member C (Frontend — Volunteer Mobile App + Test Scaffolding)

| ID | Task | Category |
|----|------|----------|
| MOB-01 | Mobile project setup (Express static / routing) | Mobile Infra |
| MOB-02 | Navigation structure (tab + screen routing) | Mobile Infra |
| MOB-03 | Shared UI component library (buttons, inputs, cards, badges) | Mobile Infra |
| AUTH-M01 | Onboarding screen (3-step walkthrough) | Auth UI |
| AUTH-M02 | Registration screen | Auth UI |
| AUTH-M03 | Login screen | Auth UI |
| EVT-M01 | Event store / browse screen (with search + filters) | Events UI |
| EVT-M02 | Event detail screen | Events UI |
| EVT-M03 | My events screen (upcoming + past) | Events UI |
| EVT-M04 | Check-in screen (QR display + pending state + success) | Events UI |
| EVT-M05 | QR code display screen | Events UI |
| EVT-M06 | Feedback form screen | Events UI |
| EVT-M07 | Q&A screen | Events UI |
| REW-M01 | Rewards catalog screen (online + in-store tabs) | Rewards UI |
| REW-M02 | Coupon detail screen | Rewards UI |
| REW-M03 | Redemption confirmation + PIN display screen | Rewards UI |
| REW-M04 | My coupons / redemption history screen | Rewards UI |
| PRO-M01 | Profile screen | Profile UI |
| TST-01 | Test scaffolding (Jest + Supertest setup) | Testing |
| TST-02 | API contract compliance tests (happy paths) | Testing |

---

### Member D (Frontend — Organiser + Admin + Scanning + Merchant)

#### Organiser Web Portal

| ID | Task | Category |
|----|------|----------|
| WEB-ORG-01 | Organiser login screen | Auth UI |
| WEB-ORG-02 | Dashboard screen (stats + recent activity) | Dashboard |
| WEB-ORG-03 | Event list screen | Events UI |
| WEB-ORG-04 | Event create/edit form | Events UI |
| WEB-ORG-05 | Volunteer roster screen | Events UI |
| WEB-ORG-06 | Onsite controller screen | Events UI |
| WEB-ORG-07 | Feedback viewer screen | Events UI |
| WEB-ORG-08 | Q&A management screen | Events UI |

#### Admin Web Portal

| ID | Task | Category |
|----|------|----------|
| WEB-ADM-01 | Admin login screen | Auth UI |
| WEB-ADM-02 | Dashboard screen (metrics + quick actions) | Dashboard |
| WEB-ADM-03 | Users management screen (list + search + deactivate) | Management |
| WEB-ADM-04 | Event organisers screen (list + approve/reject) | Management |
| WEB-ADM-05 | Events participation screen | Management |
| WEB-ADM-06 | Coupons / PIN codes management screen | Rewards |
| WEB-ADM-07 | Reward system configuration screen | Rewards |
| WEB-ADM-08 | Redemption history screen | Management |
| WEB-ADM-09 | QR codes screen | Management |

#### Organiser Scanning App (Mobile)

| ID | Task | Category |
|----|------|----------|
| SCN-01 | Event selector screen | Scanning |
| SCN-02 | QR scanner screen (camera viewfinder) | Scanning |
| SCN-03 | Scan result screen (success / error) | Scanning |
| SCN-04 | Attendance list screen (manual entry fallback) | Scanning |

#### Merchant Redemption App (Mobile)

| ID | Task | Category |
|----|------|----------|
| MER-01 | PIN entry screen (6-digit input) | Redemption |
| MER-02 | Verification result screen (success / error) | Redemption |
| MER-03 | Redemption history screen | Redemption |

### Sprint 2 Deliverables
- ✅ All ~45 API endpoints generated against frozen contracts
- ✅ All 10 volunteer mobile screens generated
- ✅ All 8 organiser portal screens generated
- ✅ All 9 admin portal screens generated
- ✅ All 4 organiser scanning screens generated
- ✅ All 3 merchant redemption screens generated
- ✅ CI/CD pipeline in place
- ✅ Test scaffolding ready

---

## Sprint 3 *(25 May – 8 Jun) — Integration*

> **Connect frontend to backend. Fix contract drift. No new features.**

### Everyone: Integration Tasks

| Member | Focus |
|--------|-------|
| **Xon** | Resolve architecture/contract drift issues; assist any member blocked on backend questions |
| **B** | Fix backend bugs found during frontend connection; ensure all endpoints return exact shapes per `API_CONTRACTS.md` |
| **C** | Connect volunteer mobile screens to live backend; fix field/response mismatches; verify all 10 screens work end-to-end |
| **D** | Connect organiser portal + admin portal + scanning app + merchant app to live backend |

### Workflow Verification

Verify **all end-to-end flows** work:

| Flow | Steps |
|------|-------|
| **Volunteer** | Register → Browse events → Join event → Display QR → Get scanned → View points → Browse rewards → Redeem → View PIN |
| **Organiser** | Login → Create event → View roster → Scan volunteer QR → Confirm attendance → View feedback |
| **Admin** | Login → Dashboard → Manage users → Approve organiser → Create coupon batch → View redemptions |
| **Merchant** | Login → Enter PIN → Verify → Confirm redemption → View history → Reverse (if within 5 min) |

### Sprint 3 Deliverables
- ✅ Volunteer mobile app connected to live backend (all 10 screens)
- ✅ Organiser portal connected to live backend (all 8 pages)
- ✅ Admin portal connected to live backend (all 9 pages)
- ✅ Scanning app connected to live backend
- ✅ Merchant app connected to live backend
- ✅ All 4 end-to-end workflows verified

---

## Sprint 4 *(8–22 Jun) — Hardening*

> **Testing, security, edge cases, bug fixes. Target >70% test coverage.**

### Xon (Architecture & Performance)

| ID | Task |
|----|------|
| PERF-01 | Database query performance review (add indexes where needed) |
| PERF-02 | API response time optimisation |
| INT-04 | Full-system integration smoke test |
| DOC-ARCH | Architecture decision log updated |

### Member B (Security Audit)

| ID | Task |
|----|------|
| SEC-01 | Auth middleware audit — every endpoint has correct role guard |
| SEC-02 | Input validation audit — no unvalidated user input |
| SEC-03 | Hardcoded secrets scan |
| SEC-04 | Dependency vulnerability audit (Dependabot + manual) |
| SEC-05 | Rate limiting verification on all public endpoints |
| SEC-06 | SQL injection / NoSQL injection check |
| SEC-07 | Security audit report published |

### Member C (Test Suite)

| ID | Task |
|----|------|
| TST-03 | Unit tests for critical business logic (points calculation, coupon expiry, PIN validation) |
| TST-04 | API integration tests — every endpoint (happy path + error path) |
| TST-05 | Edge case tests (expired coupons, full events, invalid PINs, duplicate registrations) |
| TST-06 | Error screen verification (all frontend error states) |
| TST-07 | Test coverage report — target >70% |
| TST-08 | Bug tracking log maintained |

### Member D (UI Polish + Documentation)

| ID | Task |
|----|------|
| GUI-POLISH-01 | Cross-app visual consistency check |
| GUI-POLISH-02 | Edge case screen states (loading, empty, error, offline) |
| GUI-POLISH-03 | Accessibility review (touch targets, contrast, labels) |
| DOC-01 | User manual draft (volunteer, organiser, admin, merchant) |

### Sprint 4 Deliverables
- ✅ Full test suite with >70% coverage target
- ✅ Security audit completed + report published
- ✅ All edge case screens handled
- ✅ User manual drafted
- ✅ All critical bugs fixed

---

## Sprint 5 *(22 Jun – 6 Jul) — Delivery*

> **Final polish, presentation, and submission.**

### Xon (Final Integration + Deployment)

| ID | Task |
|----|------|
| DEPLOY-01 | Backend deployment (Render / Railway) |
| DEPLOY-02 | Staging environment setup |
| DEPLOY-03 | Production environment setup |
| DEPLOY-04 | Cloud test — full workflow on live URLs |
| DOC-README | README.md with setup instructions |
| DOC-API | API documentation finalised |

### Member B (Final Security)

| ID | Task |
|----|------|
| SEC-08 | Pre-deployment security scan |
| SEC-09 | Environment secrets audit (no credentials in code) |
| DEPLOY-SEC | Secure deployment verification (HTTPS, CORS, rate limits) |

### Member C (App Polish)

| ID | Task |
|----|------|
| DEPLOY-MOB | Frontend deployment (static hosting / Vercel) |
| TST-E2E | Final end-to-end test pass |
| BUF-01 | Buffer for spill-over fixes |

### Member D (Presentation + Manual)

| ID | Task |
|----|------|
| PRES-01 | Presentation slides creation |
| PRES-02 | Demo script + walkthrough |
| PRES-03 | Demo rehearsal with entire team |
| DOC-02 | User manual finalised |
| DOC-03 | Project report finalised |

### Final Deliverables *(Due: 6 July 2026)*

| Deliverable | Owner |
|-------------|-------|
| ✅ Volunteer mobile app (10 screens) | Team |
| ✅ Organiser web portal (8 pages) | Team |
| ✅ Admin web portal (9 pages) | Team |
| ✅ Organiser scanning app (mobile, 4 screens) | Team |
| ✅ Merchant redemption app (mobile, 3 screens) | Team |
| ✅ Backend API (45+ endpoints) | Team |
| ✅ Full test suite (>70% coverage) | Member C |
| ✅ Security audit report | Member B |
| ✅ User manual | Member D |
| ✅ Presentation slides | Member D |
| ✅ Live demo ready | Everyone |
| ✅ Deployed on cloud | Xon |

---

## Summary — 5 Sprints (May 7 – July 6)

| Sprint | Dates | Focus | Duration |
|--------|-------|-------|----------|
| **Sprint 1** ✅ | 7–18 May | Foundation + Auth Backend | 12 days |
| **Sprint 2** | 18–25 May | **Concentrated Code Generation** — all code in 1 week | 7 days |
| **Sprint 3** | 25 May – 8 Jun | Integration — connect frontend ↔ backend | 14 days |
| **Sprint 4** | 8–22 Jun | Hardening — testing, security, bug fixes | 14 days |
| **Sprint 5** | 22 Jun – 6 Jul | Delivery — polish, presentation, deployment | 14 days |

**Total: 60 days (7 May – 6 Jul)**

### What Changed vs v2/v3 Original

| Item | Old (v3) | New (Concentrated) |
|------|----------|-------------------|
| **Timeline** | May 12 – Aug 14 (14 weeks) | **May 7 – Jul 6 (9 weeks)** |
| **Code generation** | Spread across Sprints 2–4 incrementally | **All in Sprint 2 (1 week)** |
| **Team roles** | Xon=backend, Vivian=mobile, Grace=web, Nurain=testing | **WATD hybrid roles** |
| **API contracts** | Defined as-you-go | **Frozen before generation** |
| **Integration** | Sprint 4–5 | **Dedicated Sprint 3** |
| **Testing** | Nurain only | **Member C owns test suite** |
| **Security audit** | None | **Member B owns every sprint** |
| **Total sprints** | 6 + buffer | **5** |
