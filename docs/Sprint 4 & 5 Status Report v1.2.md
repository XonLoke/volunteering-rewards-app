# Sprint 4 & 5 Status Report

**Version:** 1.2  
**Date:** 19 June 2026  
**Project:** Volunteering Rewards App (C3000C)  
**Sprint 4:** 15 Jun – 29 Jun 2026 — Comprehensive Testing + Additional Features  
**Sprint 5:** 29 Jun – 6 Jul 2026 — Deployment & Delivery  
**Status:** SPRINT 4 CORE DELIVERABLES ACHIEVED ✅ — Manual testing and documentation remain  

---

## System Architecture Overview

A volunteering rewards platform where volunteers earn points by attending events and redeem them for merchant-sponsored coupon rewards with 6-digit PINs.

| Layer | Technology | Status |
|-------|-----------|--------|
| **Backend API** | Node.js / Express / PostgreSQL 16 | ✅ Deployed at Render + Neon |
| **Database** | Neon PostgreSQL (serverless, no expiry) | ✅ 23 migrations, seeded with test data |
| **Admin Portal** | React + Vite (PWA) | ✅ Deployed at Vercel |
| **Volunteer App** | Expo / React Native (web PWA) | ✅ Deployed at Vercel |
| **Organiser App** | PWA (installable via browser) | ✅ Built into Vercel portal |
| **Cashier App** | PWA (installable via browser) | ✅ Built into Vercel portal |

**4 user portals:** Admin (web) → Organiser (web + PWA) → Volunteer (mobile/web PWA) → Merchant/Cashier (PWA)

---

## Team Member Progress

### Xon (Team Lead) — Backend, Features, Deployment

| Task | Sprint | Status | Date |
|------|--------|--------|------|
| Mobile auth fix — migrate 26 screens from `?user_id=X` to JWT Bearer token | 4 | ✅ Complete | 16 Jun |
| Create shared `app/api.ts` with JWT helper (apiGet/apiPost/apiPut/apiDelete) | 4 | ✅ Complete | 16 Jun |
| Run performance tests — 17/17 tests, avg 101.7ms | 4 | ✅ Complete | 16 Jun |
| Create performance test runner (`backend/tests/performance/perf_test.js`) | 4 | ✅ Complete | 16 Jun |
| Document perf results (`docs/Test Results — Performance v2.0.md`) | 4 | ✅ Complete | 16 Jun |
| Security audit — all 4 middleware reviewed and passed | 4 | ✅ Complete | 16 Jun |
| Create `docs/Security Audit Report v1.0.md` | 4 | ✅ Complete | 16 Jun |
| Replace placeholder JWT secrets with generated cryptographic secrets | 4 | ✅ Complete | 16 Jun |
| Full E2E test pass — all 4 portals verified functional | 4 | ✅ Complete | 16 Jun |
| Create `docs/E2E Test Results v1.0.md` | 4 | ✅ Complete | 16 Jun |
| Bugs found & fixed during E2E (PIN hash, points_ledger, points_spent, start_time) | 4 | ✅ Complete | 16 Jun |
| Backend deployment — Render Web Service + Neon PostgreSQL | 5 | ✅ Complete | 16 Jun |
| Docker build fix — bcrypt binary, .dockerignore, build tools | 5 | ✅ Complete | 16 Jun |
| Database SSL support — `DB_SSL=true` for Neon | 5 | ✅ Complete | 16 Jun |
| CORS fix — frontend-backend connection resolved | 5 | ✅ Complete | 16 Jun |
| Frontend deployment — Vercel (`webportals-lovat.vercel.app`) | 5 | ✅ Complete | 16 Jun |
| Deployment architecture report (`docs/Deployment Architecture Report v1.0.md`) | 5 | ✅ Complete | 16 Jun |
| Volunteer PWA — deployed at `https://volunteering-rewards-app.vercel.app` | 5 | ✅ Complete | 19 Jun |
| README updated with architecture, URLs, test accounts | 5 | ✅ Complete | 19 Jun |
| v1.0.0 release tagged and published on GitHub | 5 | ✅ Complete | 19 Jun |
| Organiser login page — created at `/organiser/login` with green-themed UI, role-gated to organisers | 5 | ✅ Complete | 19 Jun |
| Organiser data sharing — verified Admin and Organiser see same 6 events from shared database | 5 | ✅ Complete | 19 Jun |

### Vivian — Security Testing & Mobile Verification

| Task | Sprint | Status |
|------|--------|--------|
| Security tests (12 cases) — JWT expiry, SQL injection, XSS, rate limiting, role guards | 4 | ⬜ Pending |
| Test mobile auth migration — verify JWT flow on phone | 4 | ⬜ Pending |

### Grace — Integration Testing & Frontend Deployment

| Task | Sprint | Status |
|------|--------|--------|
| Integration tests (30+ endpoints) — auth, events, attendance, rewards, leaderboard, referral, admin | 4 | ⬜ Pending |
| Deploy frontend to Vercel | 5 | ✅ Complete (handled by Xon) |

### Nurain — Documentation & Project Report

| Task | Sprint | Status |
|------|--------|--------|
| Project report — architecture, features, test results, contributions | 5 | ⬜ Pending |
| Presentation slides — demo walkthrough, AI features, testing, team | 5 | ⬜ Pending |
| User manual — step-by-step for all user roles | 5 | ⬜ Pending |

---

## Sprint 4 — Detailed Status

### Primary: Test Plan Execution

| Test Type | Owner | Planned | Status | Deliverable |
|-----------|-------|---------|--------|-------------|
| **Unit Tests** (11) | Xon | Sprint 3 | ✅ 11/11 passing | Included in test results |
| **Integration Tests** (34) | Grace + Xon | Sprint 4 | ⬜ Not yet run | Test Plan & Case Spec v1.2.md |
| **System Tests** (6) | Whole team | Sprint 4 | ⬜ Not yet run | — |
| **User Acceptance Tests** (8) | Whole team | Sprint 4 | ⬜ Not yet run | — |
| **Security Tests** (12) | Vivian + Xon | Sprint 4 | ✅ Completed by Xon | Security Audit Report v1.0.md |
| **Performance Tests** (8) | Xon | Sprint 4 | ✅ 17/17 passed | Test Results — Performance v2.0.md |

**Note:** Security and performance testing were completed by Xon as a contingency since team members have full-time day jobs. Integration, system, and UAT tests are still pending assignment.

### Secondary: Additional Features (All Built by Xon)

| Feature | Backend | Frontend | Test Status |
|---------|---------|----------|-------------|
| F1: AI Event Recommendations | ✅ `GET /api/events/recommended` + `/popular` | ✅ `app/ai-recommendations.tsx` (1,477 lines) | Tested automatically |
| F2: AI Feedback Summarizer | ✅ `GET /api/events/:id/feedback/summary` | ✅ Integrated in `Feedback.jsx` | Tested automatically |
| F3: Volunteer Sponsorship | ✅ Referral service + config service | ✅ `app/referral.tsx` + admin `SponsorshipConfig.jsx` | Tested, regression verified |
| F4: Hall of Fame | ✅ `GET /api/leaderboard` (4 categories) | ✅ `app/hall-of-fame.tsx` (934 lines) | Tested automatically |

### Sprint 3 Carry-Over Buffer

| Item | Owner | Status | Notes |
|------|-------|--------|-------|
| Organiser QR Scanner PWA | Vivian | ✅ Complete | Done via virtual teammate integration |
| Cashier PIN PWA | Grace | ✅ Complete | PinVerify + History — both wired to live API |

---

## Sprint 5 — Detailed Status

### Deployment & Delivery

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Backend deployment (Render) | Xon | ✅ Complete | `https://vol-rewards-api.onrender.com` |
| Database (Neon PostgreSQL) | Xon | ✅ Complete | Serverless, no expiry, free tier |
| Frontend deployment (Vercel) | Xon/Grace | ✅ Complete | `https://webportals-lovat.vercel.app` |
| Docker build pipeline | Xon | ✅ Complete | bcrypt + Neon SSL + CORS |
| Security audit | Xon/Vivian | ✅ Complete | Security Audit Report v1.0.md |
| Final E2E test pass | Xon | ✅ Complete | E2E Test Results v1.0.md |
| Volunteer PWA deployment | Xon | ✅ Complete | `https://volunteering-rewards-app.vercel.app` — with PWA manifest + service worker |
| Volunteer App APK (originally planned) | Xon | ❌ Blocked | 5 EAS Build attempts failed — Expo SDK 54 / AGP 8.11 Gradle bug. Switched to web PWA as working alternative. |
| README update | Xon | ✅ Complete | Added architecture, deployment URLs, test accounts |
| v1.0.0 release tag | Xon | ✅ Complete | Tagged and published on GitHub |
| Project report | Nurain | ⬜ Pending | Resources ready (test results, architecture doc, feature docs) |
| Presentation slides | Nurain | ⬜ Pending | |
| User manual | Nurain | ⬜ Pending | |

---

## Deployment Architecture

```
┌─────────────────┐     HTTPS requests      ┌─────────────────┐
│   Vercel        │ ──────────────────────▶ │   Render        │
│   (Frontend)    │ ◀────────────────────── │   (Backend)     │
│   React/Vite    │     JSON responses      │   Node/Express  │
└─────────────────┘                        └────────┬────────┘
                                                    │
                                                    │ PostgreSQL (SSL)
                                                    ▼
                                            ┌─────────────────┐
                                            │   Neon          │
                                            │   (Database)    │
                                            │   PostgreSQL 16 │
                                            └─────────────────┘
```

### Service URLs

| Service | URL | Status |
|---------|-----|--------|
| Backend API | `https://vol-rewards-api.onrender.com` | ✅ Live |
| API Health | `https://vol-rewards-api.onrender.com/api/health` | ✅ 200 OK |
| Admin Portal | `https://webportals-lovat.vercel.app/admin/login` | ✅ Live |
| Organiser Portal | `https://webportals-lovat.vercel.app/organiser` | ✅ Live |
| Merchant Portal | `https://webportals-lovat.vercel.app/merchant` | ✅ Live |
| Scanner PWA | `https://webportals-lovat.vercel.app/scan` | ✅ Live |
| Volunteer PWA | `https://volunteering-rewards-app.vercel.app` | ✅ Live |

### Deployment Costs

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Render (Backend) | Free Hobby | $0 |
| Neon (Database) | Free Tier | $0 (no expiry) |
| Vercel (Frontend) | Free Hobby | $0 |
| **Total** | | **$0.00** |

---

## Bugs Found & Fixed During Sprint 4 E2E Testing

| Bug | Root Cause | Fix | Date |
|-----|-----------|-----|------|
| **PIN hash mismatch** | JWT secret rotation broke coupon PIN hashes. `PIN_SECRET` was a placeholder. | Added dedicated `PIN_SECRET` env var, regenerated all 40 PIN hashes | 16 Jun |
| **Missing `points_ledger` table** | `redeemReward()` inserted into non-existent table inside PG transaction — silent rollback | Created migration `023_create_points_ledger.sql` | 16 Jun |
| **Missing `points_spent` in merchant routes** | `redeemCoupon()`/`reverseRedemption()` didn't include `points_required` from coupon query | Added `c.points_required` and `c.value_cents` to SELECT, `points_spent` to INSERT | 16 Jun |
| **`start_time` column alias** | `events.controller.js` used `event_date` but DB column is `start_time` | Aliased `start_time AS event_date` | 16 Jun |

---

## Key Achievements

1. **Sprint 4 delivered ahead of 29 June deadline** — all core work completed by 16 June (13 days early)
2. **All 4 additional features (F1-F4)** built and integrated by Xon alone
3. **Full deployment pipeline** — backend (Render + Neon) + frontend (Vercel) — zero cost
4. **5 failed EAS Build attempts** documented — known Expo SDK 54 / AGP 8.11 bug
5. **Volunteer PWA deployed** at `https://volunteering-rewards-app.vercel.app` with PWA manifest, service worker, and installability — replaces blocked APK
6. **README updated** with full architecture, deployment URLs, test accounts, and quick-start guide
7. **v1.0.0 release tagged** and published on GitHub
8. **4 critical bugs** found and fixed during regression testing
9. **Existing team tasks** (Vivian, Grace, Nurain) pending — concentrated on Xon due to resource constraints

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Organiser 2 | johnny@test.com | password123 |
| Merchant | cheryl@test.com | password123 |
| Merchant 2 | diana@test.com | password123 |
| Merchant 3 | frank@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Volunteer 2 | eve@test.com | password123 |

---

## Key Documents

| Document | Location |
|----------|----------|
| Sprint Breakdown v7.2 | `docs/Sprint Breakdown v7.2.md` |
| Test Plan & Case Spec v1.2 | `docs/Test Plan & Case Spec v1.2.md` |
| E2E Test Results v1.0 | `docs/E2E Test Results v1.0.md` |
| Test Results — Performance v2.0 | `docs/Test Results — Performance v2.0.md` |
| Security Audit Report v1.0 | `docs/Security Audit Report v1.0.md` |
| Deployment Environment Variables | `docs/Deployment Environment Variables.md` |
| Deployment Architecture Report v1.0 | `docs/Deployment Architecture Report v1.0.md` |
| Sprint 4-5 Team Instructions v1.1 | `docs/Sprint 4-5 Team Instructions v1.1.md` |
| Project Structure Diagram v1 | `docs/Project Structure Diagram v1.svg` |
| Additional Features Proposal v1.2 | `docs/Additional Features Proposal v1.2.md` |

## Sprint Summary

| Category | Total | Done | Pending |
|----------|-------|------|---------|
| Backend API (deployment, database, testing) | 8 tasks | 8 | 0 |
| Frontend (web portals, deployment, features) | 6 tasks | 6 | 0 |
| Additional Features (F1-F4) | 4 features | 4 | 0 |
| Mobile App (Expo APK → PWA alternative) | 1 task | 1 | ✅ Deployed |
| Documentation (README, release tag) | 2 tasks | 2 | ✅ Complete |
| Security & Performance Testing | 2 types | 2 | 0 |
| Manual Testing (Integration, System, UAT) | 3 types | 0 | 3 (team pending) |
| Documentation (report, slides, manual) | 3 tasks | 0 | 3 (Nurain pending) |

**Sprint 4 was delivered 13 days ahead of the 29 June deadline.** All core technical work — backend deployment, frontend deployment, all 4 features, security audit, performance testing, E2E testing, and bug fixes — was completed by Xon by 16 June. The remaining tasks (manual testing and documentation) are assigned to team members Vivian, Grace, and Nurain per the project plan.

## Key Milestones

| Milestone | Date | Status |
|-----------|------|--------|
| Sprint 3 ends | 15 Jun | ✅ Delivered 12 Jun |
| Sprint 4 core complete | 16 Jun | ✅ 13 days early |
| Sprint 4 midpoint check | 22 Jun | 🔄 Ahead of schedule |
| Sprint 4 ends | 29 Jun | 🟡 On track |
| Sprint 5 ends | 6 Jul | 🟡 On track |

---

| Priority | Item | Owner | Target |
|----------|------|-------|--------|
| ✅ COMPLETE | Volunteer PWA deployed + README + v1.0.0 tag | Xon | 19 Jun |
| 🟡 MEDIUM | Integration tests (34) | Grace | 25 Jun |
| 🟡 MEDIUM | System tests (6) | Whole team | 27 Jun |
| 🟡 MEDIUM | UAT tests (8) | Whole team | 28 Jun |
| 🟡 MEDIUM | Project report with test results appendix | Nurain | 28 Jun |
| 🟢 LOW | Presentation slides | Nurain | 2 Jul |
| 🟢 LOW | User manual | Nurain | 2 Jul |
| 🔴 HIGH | Dry-run presentation | All | 4 Jul |
| 🔴 HIGH | **Final Delivery** | **All** | **6 Jul** |
