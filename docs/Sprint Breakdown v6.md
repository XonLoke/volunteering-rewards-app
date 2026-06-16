# Sprint Breakdown v6 — Supervisor Feedback Incorporated

> **Approach:** Each team member owns end-to-end vertical slices
> (backend + frontend for their feature area).
>
> **Timeline:** May 7 – July 6, 2026 (9 weeks)
> **Team:** Xon, Vivian, Grace, Nurain
> **Key changes from v5:** Added supervisor's workflow requirements — organiser approval flow, merchant registration, password reset, stats charts, PIN on coupon creation, missing functions from functional list review. Sprint 3-5 tasks updated.

---

## Initial Planning *(Completed)*

| Milestone | Date | Status |
|-----------|------|--------|
| Project briefing | 23 Apr | Done |
| Coding plan & database plan | 24 Apr – 6 May | Done |
| First team meet | 7 May | Done |
| Second team meet (confirm DB + task allocation) | 11 May | Done |
| Supervisor meeting (workflow clarification) | 21 May | Done |

---

## Sprint 1 *(7–18 May) — Foundation + Auth Backend* **COMPLETED**

### Xon (Infrastructure & Backend)
- Backend scaffolding, DB connection, 13 migrations, seed data, git setup
- Error handler, JWT auth, role guard, rate limiter middleware
- Auth APIs: register, login, profile, refresh
- All branches updated on GitHub

---

## Sprint 2 *(18 May – 1 Jun) — Backend Implementation*

> **Now updated with supervisor's workflow changes.**

### Xon (Auth Slice + Shared Infrastructure)

| ID | Task | Status |
|----|------|--------|
| INF-07 | CI/CD pipeline (GitHub Actions) | ✅ Done |
| INF-08 | Dockerfile + docker-compose.yml | ✅ Done |
| INF-09 | Environment config templates (.env.example) | ✅ Done |
| AUTH-07 | Admin user management API | ✅ Done |
| AUTH-08 | Organization registration API | ✅ Done |
| AUTH-09 | Organization approval API | ✅ Done |
| AUTH-10 | Admin **reset user password** API | ✅ Done |
| ADM-NOSHOW | Admin dashboard **no-show alarm** (registered but didn't attend) | 🔧 **New** |
| ADM-MSOURCE | Admin **sourcing list** of desirable merchants | 🔧 **New** |
| ADM-MLOGIN | Admin **create merchant/cashier login account** (for merchant portal access) | 🔧 **New** |
| AUTH-HARDEN | Joi validation, error codes, rate limiter | ✅ Done |
| ADM-MERCHANT | Admin **register merchants + products** API + page | ✅ Done |
| WEB-ADM-01 | Admin login page | ✅ Done |
| WEB-ADM-02 | Admin dashboard page | ✅ Done |
| WEB-ADM-03 | Admin users management page | ✅ Done |
| WEB-ADM-04 | Admin organisers page | ✅ Done |
| WEB-ADM-10 | Admin **reset password UI** button on users page | 🔧 **New** |
| WEB-ADM-11 | Admin **merchant/product management** page | ✅ Done |

### Vivian (Event Slice + QR Attendance Slice — **Unchanged**)

| ID | Task | Status |
|----|------|--------|
| EVT-01 through EVT-10 | Event CRUD, search, registration, QR scan, attendance, feedback, Q&A, favorites | ⏳ Service pending |
| ORG-ONSITE | **On-site controller** (mobile): person-in-charge takes attendance, scans volunteer QR after event | 🔧 **Clarified** |
| ORG-CHARTS | **Statistics charts** showing campaign data for organiser dashboard | 🔧 **New** |
| MOB-NAV | Mobile app navigation structure | ✅ Done |
| MOB-COMPS | Shared UI components | ✅ Done |
| MOB-EVT screens | All event screens (browse, detail, my events) | ✅ Done |

### Grace (Rewards Slice + Merchant Slice)

| ID | Task | Status |
|----|------|--------|
| REW-01 through REW-10 | Coupon CRUD, browse, redeem, PIN gen, verify, audit log, reverse, quantity mgmt, history, config | ⏳ Service pending |
| MER-SPONSOR | **Merchant sponsorship model** — merchants sponsor goods/services as rewards. Admin registers merchant + products. | 🔧 **New — redesign** |
| REW-PIN | **6-digit PIN printed on coupon** — PIN generated at coupon creation (not at redemption) | 🔧 **Changed** |
| MER-M01 | Merchant PIN entry screen + verification | Pending |
| MER-M02 | Merchant redemption history | Pending |

### Nurain (Admin + Organiser Slice)

| ID | Task | Status |
|----|------|--------|
| ADM-01 through ADM-06 | Admin dashboard, users, organisers | ✅ Done (by Xon) |
| ORG-REG-DOCS | Organiser **registers with uploaded official documents** (statutory boards) | 🔧 **Enhanced** |
| ORG-REG-WAIT | Organiser sees **"pending approval"** status page after registering | 🔧 **New** |
| ORG-01 through ORG-03 | Organiser dashboard, event management | ⏳ Service pending |
| ORG-EVALUATE | Organiser **review volunteers feedback + evaluate event + person-in-charge assessment** | 🔧 **Enhanced** |
| ME-01 through ME-05 | Volunteer my-events, points, coupons, QR, favorites | ⏳ Service pending |
| WEB-ADM-05 | Admin events participation page | Pending |
| WEB-ORG-01 through WEB-ORG-08 | Organiser portal pages | Pending |

---

## Sprint 3 *(1 Jun – 15 Jun) — Frontend Completion + Integration*

### Updated Focus

| Member | Focus |
|--------|-------|
| **Xon** | No-show alarm on dashboard. Merchant sourcing list. Merchant login account creation. Help blocked members. |
| **Vivian** | Wire event screens to live backend. Build QR scanning mobile app. **Add statistics charts** to organiser dashboard. Build on-site controller (mobile attendance + QR scan). |
| **Grace** | **Redesign rewards model for merchant sponsorship** (merchants sponsor goods/services). Build merchant app (PIN entry, verify, history). Wire rewards catalog. |
| **Nurain** | Wire organiser portal to live backend. Add **document upload to registration**. Add **pending approval status page**. Add **event evaluation + assessment**. Complete me.routes integration. |

### End-to-End Workflow Verification

| Flow | Steps |
|------|-------|
| **Organiser** | Register with docs → Wait for approval → Approve → Login → Create event → View roster → Scan QR → View feedback → Evaluate event |
| **Volunteer** | Register → Browse events → Join event → Display QR → Get scanned → View points → Browse rewards → Redeem → View PIN |
| **Admin** | Login → Dashboard → Approve organiser → Verify docs → Register merchant → Add products → Set points → Reset user password → View reports |
| **Merchant** | Login → Enter PIN → Verify → Confirm redemption → View history |

---

## Sprint 4 *(15 Jun – 29 Jun) — Hardening*

| Member | Focus |
|--------|-------|
| **Xon** | Query performance, DB indexes, API response times, full-system integration smoke test |
| **Vivian** | Security audit — every endpoint has correct role guard, input validation, SQL injection check, rate limiting |
| **Grace** | Unit tests for business logic (points, coupon expiry, PIN validation), API integration tests, >70% coverage |
| **Nurain** | Cross-app visual consistency, edge case screens, accessibility, user manual draft |

---



---

## Missing Functions from Software Functional List (To Be Added)

These functions were identified during the functional list review and need to be scheduled into upcoming sprints.

### Volunteer Mobile App — Missing
| Function | Owner | Planned Sprint |
|----------|-------|---------------|
| View past events history with points breakdown | Vivian | Sprint 3 |
| Edit own profile / change password | Vivian (UI) + Xon (API) | Sprint 3 |
| Push notifications for event reminders | Vivian | Phase 2 |

### Organizer Web App — Missing
| Function | Owner | Planned Sprint |
|----------|-------|---------------|
| Dashboard with event statistics (total volunteers, completion rate) | Vivian (charts) / Nurain (data) | Sprint 3 |
| View volunteer attendance reports | Nurain | Sprint 3 |
| Manage event cancellation / reschedule workflow | Vivian / Nurain | Sprint 3 |

### General System — Missing
| Function | Owner | Planned Sprint |
|----------|-------|---------------|
| Email notifications (approval, reminders, password reset) | Xon | Phase 2 |
| Data export / reports (CSV/PDF) | Xon | Phase 2 |

## Sprint 5 *(29 Jun – 6 Jul) — Delivery*

| Member | Focus |
|--------|-------|
| **Xon** | Backend deployment (Render/Railway), staging + production, README, final API docs |
| **Vivian** | Pre-deployment security scan, secrets audit, deployment security verification |
| **Grace** | Frontend deployment (static hosting/Vercel), final E2E test pass, spill-over buffer |
| **Nurain** | Presentation slides, demo script + walkthrough, user manual finalised, project report |

---

## Summary — 5 Sprints (7 May – 6 Jul 2026)

| Sprint | Dates | Focus | Duration |
|--------|-------|-------|----------|
| **Sprint 1** | 7–18 May | Foundation + Auth Backend | 12 days |
| **Sprint 2** | 18 May – 1 Jun | Backend Implementation (per slice) | 14 days |
| **Sprint 3** | 1 Jun – 15 Jun | Frontend Completion + Integration | 14 days |
| **Sprint 4** | 15 Jun – 29 Jun | Hardening (testing, security, bug fixes) | 14 days |
| **Sprint 5** | 29 Jun – 6 Jul | Delivery (polish, presentation, deployment) | 7 days |

---

## Supervisor's Workflow Diagram (from 21 May meeting)

```
Volunteering Programme Organisation
└── Solicits merchant sponsorship of goods/services as volunteer rewards

Organiser (Web):
  1. Register with uploaded official documents
  2. ⏳ Wait for admin approval
  3. ✅ Approved → manage events (create, edit, delete)
  4. Review volunteer feedback
  5. Evaluate event + person-in-charge assessment
  6. View statistics charts for campaigns

Organiser (Mobile - On-Site Controller):
  1. Person-in-charge takes attendance
  2. After event completes → scan volunteer's QR code

Admin (System Operator):
  1. ✅ Approve or reject organiser (verify official documents)
  2. Register merchants and their products
  3. Set points values for products
  4. Manage reward system (points <-> rewards, products list)
  5. Issue 6-digit PIN codes on coupon creation
  6. Manage database: users, merchants, rewards, QR codes, campaigns
  7. View users + points balance
  8. Reset user password
  9. Deactivate/remove accounts
  10. View redemption history
  11. View event participation records
```
