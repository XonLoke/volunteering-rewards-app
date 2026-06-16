# Sprint 3 Status Report

**Version:** 1.2  
**Date:** 12 June 2026 (Updated)  
**Project:** Volunteering Rewards App (C3000C)  
**Sprint:** Sprint 3 (1 Jun – 15 Jun 2026) — Frontend Completion + Integration  
**Next:** Sprint 4 (15 Jun – 29 Jun) — Comprehensive Testing + Additional Features  

---

## System Architecture Overview

A volunteering rewards platform where volunteers earn points by attending events and redeem them for merchant-sponsored coupon rewards with 6-digit PINs.

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Node.js / Express / PostgreSQL (port 3000) | REST API, auth, business logic |
| **Admin Portal** | React + Vite (port 5173) | System operator dashboard |
| **Volunteer App** | Expo / React Native | Mobile app for volunteers |
| **Organiser App** | PWA (installable via browser) | On-site QR attendance scanning |
| **Cashier App** | PWA (installable via browser) | PIN verification & redemption |

**4 user portals:** Admin (web) → Organiser (web + PWA) → Volunteer (mobile) → Merchant/Cashier (PWA)

---

## Team Member Responsibilities & Progress

### Xon — Admin Portal & Infrastructure

| Task | Status |
|------|--------|
| Backend scaffolding, database, authentication, all middleware | ✅ Complete |
| Admin dashboard, users, organisers, events, merchants | ✅ Complete |
| Coupon system (batch PIN generation, real-time value from Rewards Config) | ✅ Complete |
| Redemption history (sortable columns, date filter, user links, value snapshot) | ✅ Complete |
| Rewards configuration (persistent save, real-time impact on coupon display) | ✅ Complete |
| Vivian's mobile branch merged into main | ✅ Complete |
| Admin portal hardening & bug fixes | ✅ Complete |
| **6 backend stubs replaced with live SQL** (events/today, roster, stats, feedback, Q&A, categories) | ✅ Complete (12 Jun) |
| **Vivian's settings & contact routes integrated** (migration 022, nodemailer, shared auth) | ✅ Complete (12 Jun) |

### Vivian — Volunteer Mobile App & Organiser PWA

| Task | Status |
|------|--------|
| 22 mobile app screens integrated | ✅ Complete |
| Events service & attendance service | ✅ Complete |
| Volunteer QR code display screen | ✅ Complete |
| Scan history screen | ✅ Complete |
| Profile avatar & rewards flow | ✅ Complete |
| **Settings & Contact routes** (pushed to origin/vivian, integrated to main by Xon) | ✅ Integrated 12 Jun |
| **Organiser QR attendance scanner (PWA)** | ✅ Complete — wired to live API with offline queue |
| **Statistics charts for organiser dashboard** | ⏳ In progress |

### Grace — Rewards & Merchant Cashier App

| Task | Status |
|------|--------|
| Rewards service (browse, redeem, PIN generation) | ✅ Complete |
| Merchant service (verify PIN, redeem, reverse, history) | ✅ Complete |
| Cashier PIN verification UI (833 lines) | ✅ Complete |
| Merchant redemption history UI (544 lines) | ✅ Complete |
| **Wire merchant app to live API** | ✅ Complete — PinVerify + History wired |
| **PWA manifest for installability** | ⏳ In progress |

### Nurain — Organiser Portal & Volunteer Data

| Task | Status |
|------|--------|
| Organiser service (dashboard, event CRUD, roster, feedback, Q&A) | ✅ Complete |
| Me service (volunteer profile, points, coupons, QR code) | ✅ Complete |
| Organiser web portal screens integrated | ✅ Complete |
| **Document upload for registration** | ⏳ In progress |
| **Pending approval status page** | ⏳ In progress |
| **Event evaluation & assessment workflow** | ⏳ In progress |

---

## Key Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Organiser QR scanner PWA (Vivian) may not complete by 15 Jun | Delayed attendance workflow | Virtual teammate (v-Vivian) on standby |
| Cashier PIN app PWA (Grace) may not complete by 15 Jun | Delayed merchant redemption flow | Virtual teammate (v-Grace) on standby |
| Branches had unrelated histories | Merge complexity | Resolved via `--allow-unrelated-histories` |

**Backup team:** 3 virtual teammates (v-Nurain, v-Vivian, v-Grace) ready to step in after Sprint 3 deadline.

---

## Upcoming Sprints — Key Focus Areas

| Sprint | Dates | Priority |
|--------|-------|----------|
| **Sprint 4** | 15 Jun – 29 Jun | **Testing & Hardening** — Integration tests, security audit, performance tuning, user manual |
| **Sprint 5** | 29 Jun – 6 Jul | **Deployment & Delivery** — Cloud deploy, final E2E, presentation slides, project report |

Everything in Sprint 3 and before builds towards these final milestones.

---

## Summary of Completed vs Pending

| Category | Done | In Progress |
|----------|------|-------------|
| Backend API (all services) | 12 service files, 50+ endpoints | — |
| Database migrations | 22 migrations | — |
| Admin portal | All pages wired to live API | Minor hardening |
| Volunteer mobile app | All 26 screens built, login/auth correct, remaining use `?user_id=` (Sprint 4 fix) | — |
| Organiser web portal | Dashboard, Events, Roster, Feedback, Q&A, Onsite Controller — all wired | — |
| Cashier PWA | PIN verify, redeem, history — all wired to live API | PWA manifest |
| Scan PWA | Today's events, scanner, offline queue, roster — all wired | — |
| Settings & Contact routes | Migrated from Vivian's branch, adapted to shared auth | — |
| Organiser web portal | All organiser screens integrated | — |
