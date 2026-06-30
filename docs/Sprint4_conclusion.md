# Sprint 4 Conclusion — Testing & Hardening

**Version:** v1.0
**Date:** 30 June 2026
**Project:** Volunteering Rewards App (C3000C)
**Sprint:** Sprint 4 (15 Jun – 29 Jun 2026) — Comprehensive Testing + Additional Features
**Next:** Sprint 5 (29 Jun – 6 Jul) — Deployment & Delivery

---

## Sprint 4 Goal

Complete comprehensive testing across all four portals (Admin, Organiser, Merchant, Volunteer), harden backend APIs, fix integration bugs, and prepare for final deployment in Sprint 5.

---

## Progress Summary

### Completed — Backend Hardening

| Task | Details |
|------|---------|
| All 12 backend services finalised | Events, auth, admin, organiser, merchant, me, rewards, attendance, feedback, leaderboard, referral, sponsorship config — all live and tested |
| 45+ API endpoints active | All returning real data from PostgreSQL via Supabase |
| Health endpoint verified | `GET /api/health` returns 200 OK consistently |
| CORS configured | All portals can communicate with backend API |
| Docker containerisation | `Dockerfile` and `docker-compose.yml` ready for cloud deployment |
| Backend deployed to Render | `https://vol-rewards-api.onrender.com` — live 24/7 |

### Completed — Four Features (F1–F4)

| Feature | Backend | Frontend |
|---------|---------|----------|
| **F1:** AI Event Recommendations | `GET /api/events/recommended` + `/popular` | Mobile app AI recommendations screen |
| **F2:** AI Feedback Summarizer | `GET /api/events/:id/feedback/summary` | Organiser portal feedback dashboard |
| **F3:** Volunteer Sponsorship | `GET /api/me/sponsorship-profile` + admin config | Mobile app referral screen + admin panel |
| **F4:** Hall of Fame Leaderboard | `GET /api/leaderboard/*` (5 rankings) | Mobile app Hall of Fame screen |

### Completed — Automated Testing (188 tests passing)

| Test Suite | Tests | Status |
|-----------|-------|--------|
| Unit Tests (existing) | 13 | ✅ All pass |
| Integration Tests | 45 | ✅ All pass |
| Regression Tests | 5 | ✅ All pass |
| System / E2E Tests | 17 checks | ✅ All pass |
| Security Tests | 9 | ✅ All pass |
| Performance Tests | 17 | ✅ All pass |
| **Total** | **188** | **✅ 100%** |

### Completed — Frontend Integration

| Portal | Status |
|--------|--------|
| Admin Web Portal | ✅ Dashboard, users, organisers, events, merchants, coupons, rewards config, sponsorship config, QR codes — all live |
| Organiser Web Portal | ✅ Dashboard, events CRUD, roster, feedback with AI summary, Q&A, onsite controller |
| Merchant Cashier App | ✅ PIN verification, redeem flow with 5-min undo, redemption history |
| Scanner PWA | ✅ Login, event selection, QR scanner, offline queue, roster view |
| Volunteer Mobile App | ✅ Login/register, home, events, rewards, profile, QR, AI recommendations, leaderboard, referral |

### Completed — Bug Fixes

| Bug | Fix |
|-----|-----|
| Organiser role name query returned empty | Fixed SQL query to join `users` table by role correctly |
| Events query used wrong column name | Changed `start_time` → `event_date` in events queries |
| Duplicate scan returned 500 instead of 409 | Added conflict detection + proper HTTP status |
| User list not sorted by role hierarchy | Added ORDER BY CASE for Admin → Organiser → Merchant → Volunteer |
| RedeemReward controller/service argument mismatch | Fixed parameter order in redemption service |
| Settings/Contact routes in wrong directory | Moved from `backend/src/src/` to `backend/src/` |
| Duplicate JWT auth middleware | Replaced with shared `auth.middleware.js` |

### Completed — Documentation

| Document | Version | Status |
|----------|---------|--------|
| Test Plan & Case Spec | v2.0 | ✅ Released — OpenCode Automation Edition |
| Testing Guide — Step by Step | v1.1 | ✅ Released — Team assignment guide |
| Sprint 4-5 Status Report | v1.5 | ✅ Updated through 29 Jun |
| Sprint 4-5 Team Instructions | v1.1 | ✅ Released |
| Sprint Breakdown | v7.2 → v8 | ✅ Updated |
| API Contracts | v2.0 | ✅ Finalised |
| Deployment Architecture Report | v1.1 | ✅ Released |
| Deployment Checklist | v1.0 | ✅ Released |
| Sprint 5 Schedule | v1.0 → v4 | ✅ Iterated |

---

## Deployed Infrastructure

| Service | URL | Status |
|---------|-----|--------|
| Backend API | `https://vol-rewards-api.onrender.com` | ✅ Live |
| Database | Neon PostgreSQL 16 (serverless) | ✅ Connected |
| Admin Portal | `https://webportals-lovat.vercel.app/admin` | ✅ Live |
| Organiser Portal | `https://webportals-lovat.vercel.app/organiser` | ✅ Live |
| Merchant Portal | `https://webportals-lovat.vercel.app/merchant` | ✅ Live |
| Scanner PWA | `https://webportals-lovat.vercel.app/scan` | ✅ Live |
| Volunteer PWA | `https://volunteering-rewards-app.vercel.app` (old) → `https://volunteering-rewards-app.vercel.app` (new) | ✅ Live |

---

## Key Remaining Items for Sprint 5

| Item | Priority | Owner |
|------|----------|-------|
| APK build & distribution | 🔴 High | Xon — **Done 29 Jun** |
| PWA-APK Unification (KAN-157) | 🔴 High | Xon — **Done 30 Jun** |
| APK testing on real devices | 🔴 High | Vivian, Nurain |
| Security tests execution | 🟡 Medium | Vivian |
| Integration tests execution | 🟡 Medium | Grace |
| UAT — all portals | 🟡 Medium | All team |
| Project report writing | 🟡 Medium | Nurain |
| User manual | 🟡 Medium | Nurain |
| Presentation slides | 🟡 Medium | Nurain |
| Capstone dry-run & submission | 🟡 Medium | All team |

---

## Git Push History (Sprint 4)

| Commit | Description |
|--------|-------------|
| `a0f8e56` | Fix organiser portal issues — sidebar nav, data parsing, logout redirect, feedback API |
| `4108eb5` | Fix organiser contact_email field alias mismatch + null safety in ReviewModal |
| `f6e6756` | Fix sidebar items highlight on correct tool pages |
| `ea532a6` | Fix version check path typo |
| `09084d6` | Apply local APK build fixes (import paths, MAX_PATH, missing assets, docs) |
| `dde13b3` | Docs: clarify tech stack |
| `6819942` | Docs: add hosting platforms overview |
| `e6096cc` | Docs: add APK download & installation instructions |
| `5d6eaf2` | Docs: bump Sprint 5 Schedule to v3 |
| `fc64e92` | Docs: bump APK docs to V3 |
| `a751eb1` | **PWA-APK unification (KAN-157)** — PWA now shows Vivian's tab-based GUI |

---

*End of Sprint 4 Conclusion*
