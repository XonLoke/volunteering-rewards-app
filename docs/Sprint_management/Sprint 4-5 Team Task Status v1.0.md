# Sprint 4 & 5 — Team Task Status

**Date:** 18 June 2026  
**Project:** Volunteering Rewards App (C3000C)  

---

## Overall Progress

Sprint 4 core deliverables achieved ✅ (13 days ahead of 29 Jun deadline).  
Sprint 5 backend and frontend deployment complete ✅.  
Remaining tasks: team member testing and documentation.

---

## Xon (Team Lead)

| Status | Task | Sprint |
|--------|------|--------|
| ✅ | Mobile auth fix — 26 screens migrated to JWT | Sprint 4 |
| ✅ | Performance tests — 17/17, avg 101.7ms | Sprint 4 |
| ✅ | Security audit — all 4 middleware passed | Sprint 4 |
| ✅ | E2E test pass — all 4 portals verified | Sprint 4 |
| ✅ | 4 bugs found and fixed during testing | Sprint 4 |
| ✅ | F1-F4 features built (AI Recs, Summarizer, Referral, Leaderboard) | Sprint 4 |
| ✅ | Backend deployed — Render + Neon | Sprint 5 |
| ✅ | Frontend deployed — Vercel | Sprint 5 |
| ✅ | Docker, CORS, SSL issues resolved | Sprint 5 |
| ✅ | Architecture report, deployment checklist, status reports | Sprint 5 |
| 🔄 | Volunteer PWA (APK blocked by Expo AGP 8.11 bug — using web PWA instead) | Sprint 5 |

---

## Vivian

| Status | Task | Sprint |
|--------|------|--------|
| ⬜ | Security tests (12 cases) — JWT expiry, SQL injection, XSS, rate limiting, role guards | Sprint 4 |
| ⬜ | Test mobile auth migration on actual phone | Sprint 4 |

**Details for Security Tests (12 cases):**

| ID | Test | How To Test |
|----|------|-------------|
| SEC-01 | Expired JWT token → 401 | Use expired token, call any endpoint |
| SEC-02 | Tampered JWT token → 401 | Modify token, call any endpoint |
| SEC-03 | Missing JWT token → 401 | Call endpoint without auth header |
| SEC-04 | Wrong role access → 403 | Volunteer calls admin endpoint |
| SEC-05 | SQL injection → sanitised | Try `' OR 1=1 --` in query params |
| SEC-06 | XSS in feedback → escaped | Submit `<script>alert('xss')</script>` |
| SEC-07 | Rate limit login → 429 after 10 attempts | POST login 12× with wrong password |
| SEC-08 | Rate limit register → 429 after 5 attempts | POST register 7× quickly |
| SEC-09 | Brute force PIN → rate limited | POST verify PIN 12× with wrong PINs |
| SEC-10 | PIN hash not plaintext → 64-char hex | `SELECT pin_code FROM user_coupons LIMIT 5;` |
| SEC-11 | Merchant accessing volunteer endpoints → 403 | cheryl@test.com calls volunteer API |
| SEC-12 | Volunteer using another's coupon → 403/404 | alice@test.com tries bob's coupon PIN |

---

## Grace

| Status | Task | Sprint |
|--------|------|--------|
| ⬜ | Integration tests (30+ endpoints) | Sprint 4 |
| ✅ | Frontend deployed to Vercel (handled by Xon) | Sprint 5 |

**Endpoints to test (34 cases):**

| Category | Endpoints | Expected |
|----------|-----------|----------|
| Auth | register, login, refresh, wrong password | JWT token |
| Events | list, filter, today, recommended, popular, create, update, delete | Events data |
| Attendance | scan, duplicate scan (409), roster | Check-in recorded |
| Rewards | list, redeem (sufficient pts), redeem (insufficient → 400) | Reward data |
| Coupons | verify (valid PIN), verify (invalid → 404), redeem, reverse | Coupon data |
| Merchant | history | Redemption history |
| Leaderboard | points, events, checkins, redeemed | Rankings |
| Referral | register with code, sponsorship profile | Referral data |
| Admin | users, organisers, coupons (CRUD), rewards config, merchants | Admin data |

---

## Nurain

| Status | Task | Sprint |
|--------|------|--------|
| ⬜ | Project report (from C300 Report Template.docx) | Sprint 5 |
| ⬜ | Presentation slides | Sprint 5 |
| ⬜ | User manual — step-by-step for all roles | Sprint 5 |

**Documents available for reference:**

| Document | What To Use It For |
|----------|-------------------|
| `docs/Test Plan & Case Spec v1.2.md` | Test results appendix |
| `docs/E2E Test Results v1.0.md` | Portal-by-portal E2E results |
| `docs/Test Results — Performance v2.0.md` | 17/17 perf tests, 101.7ms avg |
| `docs/Security Audit Report v1.0.md` | All 4 middleware passed |
| `docs/Deployment Architecture Report v1.1.md` | Architecture overview |
| `docs/Automated Testing Report v1.0.md` | All 70 automated tests summary |
| `docs/Sprint Breakdown v7.2.md` | Feature descriptions (F1-F4) |
| `docs/Online Test Access Points v1.0.md` | All portal URLs for demo |
| `docs/Project Structure Diagram v1.svg` | Architecture diagram |
| `docs/C300 Report Template.docx` | Report template to use |

---

## Summary Table

| Person | Sprint 4 Tasks | Sprint 5 Tasks | Done | Pending |
|--------|---------------|---------------|------|---------|
| **Xon** | 7 tasks | 6 tasks | **13** ✅ | **1** 🔄 |
| **Vivian** | 2 tasks | — | **0** | **2** ⬜ |
| **Grace** | 1 task | 1 task | **1** | **1** ⬜ |
| **Nurain** | — | 3 tasks | **0** | **3** ⬜ |

---

## Key Achievements

1. **Sprint 4 delivered 13 days early** — all core work done by 16 Jun (deadline 29 Jun)
2. **All 4 features (F1-F4)** built and integrated — AI Recommendations, Feedback Summarizer, Referral Program, Hall of Fame
3. **Full deployment** — Render API + Neon DB + Vercel frontend — zero cost
4. **10 bugs found and fixed** during automated testing
5. **70 automated tests** — 100% pass rate
6. **Volunteer PWA** replacing blocked APK (Expo AGP 8.11 bug)

---

## Important Deadlines

| Milestone | Date |
|-----------|------|
| Sprint 4 ends | 29 Jun 2026 |
| Sprint 5 ends | 6 Jul 2026 (or as per updated schedule) |
| Final delivery | Aug 2026 |
