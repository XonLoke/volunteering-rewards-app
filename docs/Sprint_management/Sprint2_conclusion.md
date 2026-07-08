# Sprint 2 Conclusion — Backend Implementation & Team Integration

> **Period:** 18 May – 1 Jun 2026
> **Status:** Completed
> **Approach:** Vertical slice ownership — each team member implemented full-stack features end-to-end

---

## 1. Sprint 2 Objectives

Sprint 2 aimed to implement all backend services across the four vertical slices and wire frontend screens to the live API. By sprint end, every team member's code has been integrated into `main`, all 17 database migrations are in place, and the admin portal is fully functional.

---

## 2. Xon — Auth Slice & Shared Infrastructure

| Deliverable | Details | Status |
|------------|---------|--------|
| Auth APIs | register, login, refresh, profile, registerOrganiser with Joi validation | ✅ Complete |
| Admin Dashboard | Real-time stats from database (users, organisers, events, merchants, no-show alerts) | ✅ Complete |
| Admin Users | Search, filter, pagination, suspend/reactivate, reset password, role dropdown, sorted by role priority | ✅ Complete |
| Admin Organisers | List, approve/reject, register new organiser (auto-creates user + org account) | ✅ Complete |
| Admin Merchants | Register merchant (auto-creates cashier login), add products, view PINs, edit merchant, sourcing/prospect list | ✅ Complete |
| Admin Coupons | Create coupon batch with auto-generated PINs, view generated PINs | ✅ Complete |
| Admin Events | Filter by status, expand for participation data, clickable organiser name | ✅ Complete |
| Admin Redemptions | Date filter, sortable columns, clickable user name, auto-delete records >1 year | ✅ Complete |
| Admin QR Codes | Event list with participants count column | ✅ Complete |
| Admin Rewards Config | Persistent save to `rewards_configuration` table (migration 017) | ✅ Complete |
| Admin PIN Verify | Removed from sidebar (redundant — handled by cashier portal) | ✅ Complete |
| Admin Layout | Updated sidebar — PIN Verify removed, QR Codes moved under Management | ✅ Complete |
| CI/CD Pipeline | GitHub Actions with lint + test + deploy placeholder | ✅ Complete |
| Docker + docker-compose.yml | Multi-stage build, non-root user, healthcheck | ✅ Complete |
| Auto Token Refresh | Admin portal silently refreshes expired tokens | ✅ Complete |
| Volunteer Registration Block | Cannot register with email tied to a merchant | ✅ Complete |
| Merchant-User Sync | Registering a merchant auto-updates existing user's name/phone/role | ✅ Complete |

---

## 3. Vivian — Events & QR Attendance Slice

| Deliverable | Details | Status |
|------------|---------|--------|
| Mobile Screens | 22 screens: home, login, register, events, event-booked, rewards, coupon-detail, my-coupons, scan, scan-success, scan-history, pin-display, redeem-confirmation, redeem-success, profile, edit-profile, settings, points-history, notifications, help, contact | ✅ Integrated |
| events.service.js | Browse/search/filter events, get event detail, register/unregister for events | ✅ Integrated |
| attendance.service.js | QR scan handling, batch sync, point awarding | ✅ Integrated |
| events.controller.js | Updated to use events.service.js with real DB queries | ✅ Integrated |
| contexts/ThemeContext.tsx | Shared theme context for mobile app | ✅ Integrated |

---

## 4. Grace — Rewards & Merchant Slice

| Deliverable | Details | Status |
|------------|---------|--------|
| rewards.service.js | Browse available rewards, get detail, redeem with PIN hash generation | ✅ Integrated |
| merchant.service.js | Verify PIN (HMAC-SHA256), redeem coupon, reverse (5-min window), redemption history | ✅ Integrated |
| rewards.controller.js | HTTP handlers for rewards endpoints | ✅ Integrated |
| merchant.controller.js | HTTP handlers for merchant endpoints | ✅ Integrated |
| PinVerify.jsx (833 lines) | Full PIN entry UI with 6-digit input, success/error states, redemption flow | ✅ Integrated |
| History.jsx (544 lines) | Redemption history UI with merchant view | ✅ Integrated |

---

## 5. Nurain — Admin & Organiser Slice

| Deliverable | Details | Status |
|------------|---------|--------|
| organiser.service.js (140 lines) | Dashboard stats, event CRUD, roster, feedback, Q&A answering — adapted to match our schema | ✅ Integrated |
| me.service.js (47 lines) | Volunteer's myEvents, myPoints, myCoupons, myQrCode, myFavorites — adapted to CommonJS | ✅ Integrated |
| organiser.controller.js | Updated from stubs to use organiser.service.js | ✅ Integrated |
| me.controller.js | Updated from stubs to use me.service.js | ✅ Integrated |
| Organiser Mobile Screens | 7 screens: layout, login, dashboard, events, event form, controller, feedback, profile | ✅ Integrated |

---

## 6. Database Schema (17 Migrations)

| Migration | Purpose |
|-----------|---------|
| `001`–`012` | Core tables: roles, users, organizations, events, event_registrations, attendance_logs, event_feedback, event_qna, favorites, coupons, user_coupons, redemption_logs |
| `013` | Added `value_cents` and `merchant_name` to coupons |
| `014` | Merchants and merchant_products tables |
| `015` | Added `pin_hash` to user_coupons (HMAC-SHA256 secure PINs) |
| `016` | Merchant prospects/sourcing table |
| `017` | Rewards configuration table (persistent config storage) |

---

## 7. API Endpoint Inventory (45+ total)

| Module | Endpoints | Owner |
|--------|-----------|-------|
| Auth | register, login, refresh, profile, registerOrganiser | Xon |
| Admin | dashboard, users CRUD, organisers approve, events, coupons, merchants, prospects, redemptions, config, reset-password, role, createOrganiserAccount, createMerchantAccount | Xon |
| Events | browse, categories, today, detail, register, leave, feedback, Q&A, roster, stats | Vivian |
| Attendance | scan, batch | Vivian |
| Rewards | browse, detail, redeem | Grace |
| Merchant | verify PIN, redeem, reverse, history | Grace |
| Me | myEvents, myPoints, myCoupons, myQrCode, myFavorites | Nurain |
| Organiser | dashboard, events CRUD, roster, feedback, Q&A, answer | Nurain |

---

## 8. Infrastructure

| Component | Details | Status |
|-----------|---------|--------|
| Web Portals (React + Vite) | Admin portal (12 pages), Organiser portal (8 pages), Merchant portal (3 pages), Scan app (4 pages) | ✅ Running |
| Mobile App (Expo) | 29 total screens across volunteer + organiser flows | ✅ Integrated |
| CI/CD (GitHub Actions) | Lint → Test → Deploy on push to main | ✅ Active |
| Docker | Multi-stage build with healthcheck | ✅ Ready |
| Data Reset Script | `backend/scripts/reset_data.js` — prepares clean dataset for Sprint 3 testing | ✅ Written |

---

## 9. Key Metrics

| Metric | Value |
|--------|-------|
| Backend Service Files | 8 service files (auth, admin, events, attendance, rewards, merchant, organiser, me) |
| Database Tables | 17 migration files |
| API Endpoints | 45+ across all modules |
| Frontend Screens (Mobile) | 29 (22 volunteer + 7 organiser) |
| Frontend Pages (Web) | 27 (12 admin + 8 organiser + 3 merchant + 4 scan) |
| Team Members Integrated | 4/4 (Xon, Vivian, Grace, Nurain) |
| Commits This Sprint | 25+ commits to main |

---

## 10. Known Issues / Pending

| Issue | Notes |
|-------|-------|
| Mobile app build not tested | Needs `npx expo start` from `frontend/mobile_app` with Expo Go |
| Data reset not executed | `node scripts/reset_data.js` failed due to standalone DB password parsing — can be run via `psql` or skipped |
| Nurain's mobile screens are UI-only | No API calls wired yet in her organiser mobile screens |
| Seed data still basic | Only 3 seed users — Diana/Diana2 manually created, some test accounts remain |

---

## 11. Ready for Sprint 3 (1 Jun – 15 Jun)

Sprint 3 focuses on:
- Frontend completion and integration testing
- Remaining screen wiring (organiser mobile, merchant mobile)
- End-to-end workflow verification across all 4 user types
- Cross-slice integration testing
