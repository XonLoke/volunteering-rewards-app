# Sprint 3 Completion Report

**Volunteering Rewards App (C3000C)**

| | |
|---|---|
| **Period** | 25 May – 16 June 2026 |
| **Status** | DELIVERED ✅ |
| **Prepared by** | Xon Loke |
| **Date** | 16 June 2026 |

---

## Sprint Overview

Sprint 3 covers the frontend completion, integration, and PWA delivery phase of the Volunteering Rewards App. All planned work was completed ahead of the 15 June deadline, including backend endpoint integration, web portal wiring, PWA configuration for scanner and cashier apps, branch merges from team members, and comprehensive testing. The sprint was initially delivered on 12 June 2026 with minor follow-up on 16 June for Nurain's late branch push.

---

## Sprint 3 Deliverables

### Backend Services

| # | Item | Description | Person-in-Charge | Date Completed |
|---|---|---|---|---|
| 1 | 6 Backend Stubs Fixed | Fixed events/today, categories, roster, stats, feedback, Q&A — replaced empty stubs with live SQL queries | Xon (via Project) | 12 Jun 2026 |
| 2 | Migration 022: User Settings | Created user_settings table for notification preferences | Xon (via Project) | 12 Jun 2026 |
| 3 | Nodemailer Installed | Email service for contact/support ticket routing | Xon (via Project) | 12 Jun 2026 |
| 4 | Vivian Routes Integrated | Settings + contact routes moved from backend/src/src/ to backend/src/, shared auth middleware adapted | Xon (via Project) | 12 Jun 2026 |

### Web Portals (Admin, Organiser, Merchant)

| # | Item | Description | Person-in-Charge | Date Completed |
|---|---|---|---|---|
| 1 | Admin Portal Dashboard | All admin pages fully wired: Users, Events, Coupons, Redemptions, Rewards Config, Sponsorship Config, QR Codes, Merchants | Xon | 10 Jun 2026 |
| 2 | Coupon PIN View Modal | PIN view modal with Active/Depleted/All filter | Xon | 10 Jun 2026 |
| 3 | Redemption History Overhaul | Sortable columns, date filter, user links, value snapshot | Xon | 10 Jun 2026 |
| 4 | User List Role Sort | Users sorted by role: Admin > Organiser > Merchant > Volunteer | Xon | 10 Jun 2026 |
| 5 | Organiser Portal | Dashboard, Events (filter/paginate), EventCreate, EventEdit, Roster, Feedback (AI Summary), Q&A, OnsiteController | Xon + Nurain | 12 Jun 2026 |
| 6 | Merchant Portal — PinVerify | 833-line UI with PIN verify, redeem, 5-min undo — all using real API calls | Grace | 10 Jun 2026 |
| 7 | Merchant Portal — History | 544-line redemption history page | Grace (verified by Xon) | 10 Jun 2026 |
| 8 | Merchant Portal — Login | Merchant login page | Grace | 10 Jun 2026 |

### PWA Tasks

| # | Item | Description | Person-in-Charge | Date Completed |
|---|---|---|---|---|
| 1 | vite-plugin-pwa Installed | Added PWA support for React/Vite frontend | Xon (via Project) | 12 Jun 2026 |
| 2 | Vite PWA Config | Updated vite.config.js with manifest, service worker, workbox caching | Xon (via Project) | 12 Jun 2026 |
| 3 | PWA Icons | 192x192 and 512x512 icons deployed to public/ for installability | Grace + Xon | 12 Jun 2026 |
| 4 | PWA Entry Routes | App.jsx routes for Scan and Merchant with standalone layouts | Xon (via Project) | 12 Jun 2026 |
| 5 | QR Camera Scanner | Scanner.jsx updated with html5-qrcode, camera toggle via getUserMedia, fallback manual input | Xon (via Project) | 12 Jun 2026 |
| 6 | Merchant API Verification | PinVerify.jsx confirmed using real apiPost calls — no mock data | Xon (via Project) | 12 Jun 2026 |

### Additional Features (F1-F4)

| # | Item | Description | Person-in-Charge | Date Completed |
|---|---|---|---|---|
| 1 | F1: AI Event Recommendations | Backend: GET /api/events/recommended, /popular. Frontend: app/ai-recommendations.tsx (1,477 lines) | Xon + Vivian | 10 Jun 2026 |
| 2 | F2: AI Feedback Summarizer | Lexicon-based sentiment analysis on organiser Feedback.jsx | Xon | 10 Jun 2026 |
| 3 | F3: Volunteer Sponsorship | Multi-level referral with configurable points: Direct=10, Helped=4, Upline=6 | Xon | 10 Jun 2026 |
| 4 | F4: Hall of Fame Leaderboard | Backend + app/hall-of-fame.tsx (934 lines) | Xon + Vivian | 10 Jun 2026 |

### Branch Merges & Cleanup

| # | Item | Description | Person-in-Charge | Date Completed |
|---|---|---|---|---|
| 1 | Grace's Branch Merged | Merchant controllers, services, PinVerify, History merged to main | Xon (via Project) | 12 Jun 2026 |
| 2 | Nurain's Branch Checked | Verified — main already has equivalent organiser/me code with enhancements | Xon (via Project) | 12 Jun 2026 |
| 3 | backend/src/src/ Deleted | Removed duplicate code path to eliminate confusion | Xon | 12 Jun 2026 |
| 4 | Nurain Late Push (16 Jun) | Updated QR check-in in my-app-stable/ — standalone test project, no merge needed | Nurain | 16 Jun 2026 |

### Testing & Quality

| # | Item | Description | Person-in-Charge | Date Completed |
|---|---|---|---|---|
| 1 | Unit Tests | 11/11 unit tests passing | Xon | 12 Jun 2026 |
| 2 | Integration Tests | 34 integration tests, 3 bugs fixed during testing | Xon | 12 Jun 2026 |
| 3 | Performance Tests | 8 performance tests completed | Xon | 12 Jun 2026 |
| 4 | Test Plan v1.2 | 133 test cases across unit, integration, system, UAT, security, performance | Xon | 10 Jun 2026 |
| 5 | Smoke Test (Post-PWA) | Verified login, events, leaderboard after PWA deployment | Xon (via Project) | 12 Jun 2026 |

---

## Sprint Summary

| Metric | Value |
|---|---|
| Sprint Period | 25 May — 16 June 2026 |
| Delivery Date | 12 June 2026 (ahead of 15 June deadline) |
| Team Members | Xon, Vivian, Grace, Nurain |
| Backend Endpoints | 45+ API endpoints live |
| Total Tests | 11 unit + 34 integration + 8 performance = 53 total |
| Test Plan Coverage | 133 test cases across 6 testing types |
| New Features | 4 additional features (F1-F4) completed |
| PWA Apps Delivered | 2 PWAs: Organiser Scanner + Cashier PIN Verification |
| Git Commit | `dc23809` on `origin/main` |
| Branches Merged | vivian, grace, nurain (checked) |
| Status | DELIVERED AHEAD OF DEADLINE ✅ |

---

## Key Achievements

1. Sprint delivered 3 days ahead of 15 June deadline despite team members only contributing via their branches.
2. All 4 additional features (AI Recommendations, Feedback Summarizer, Sponsorship, Leaderboard) completed and integrated.
3. Both PWAs (Organiser Attendance Scanner + Cashier PIN Verification) configured and deployable via browser install.
4. Vivian's settings and contact routes successfully integrated into the main backend architecture.
5. 6 backend stubs fixed from empty placeholder responses to live SQL queries.
6. All team branches checked and merged where applicable — codebase consolidated on main.
7. 133 test cases documented covering all testing types for project report submission.
