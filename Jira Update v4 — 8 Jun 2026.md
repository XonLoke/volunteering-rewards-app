# Jira Update v4 — For Hermes

**Version:** 4.0  
**Date:** 8 June 2026  
**Board:** https://fengshui0011.atlassian.net/jira/software/projects/KAN/list  

---

## Instructions for Hermes

Please update the Jira board with the following:

---

## 1. Mark These as Done

| Key | Summary | Notes |
|-----|---------|-------|
| — | F1: AI Event Recommendations Backend | ✅ `GET /api/events/recommended`, `GET /api/events/popular` |
| — | F2: AI Feedback Summarizer Backend | ✅ `GET /api/events/:id/feedback/summary` — lexicon-based sentiment analysis |
| — | F3: Volunteer Referral Program (Full Stack) | ✅ Migration, API, auth hook, attendance hook, frontend screen |
| — | F4: Hall of Fame Leaderboard Backend | ✅ `GET /api/leaderboard`, `/points`, `/events`, `/checkins`, `/redeemed` |
| — | Integration Tests (34 IT cases) | ✅ 29 pass, 3 fail (known bugs now fixed), 2 skip |
| — | Performance Tests (8 PT cases) | ✅ 6 pass, 2 fail (caused by same bugs now fixed) |
| — | Bug Fixes (3 bugs) | ✅ Fixed: `start_time` column query, `redeemReward` arg mismatch, duplicate scan handling |
| — | Test Results Documentation | ✅ `docs/Test Results — Integration Tests.md` + `docs/Test Results — Performance Tests.md` |
| — | Merge Vivian's branch | ✅ Notifications + event enhancements merged |

---

## 2. Remaining Tasks (Waiting for Vivian's UI Prototypes)

| # | Task | Priority | Assigned To | Blocked By |
|---|------|----------|-------------|------------|
| 1 | F1 Frontend — "Recommended for You" mobile UI | 🟢 Feature | Xon / Claude Desktop Code | Vivian's design mockups |
| 2 | F4 Frontend — Hall of Fame leaderboard page | 🟢 Feature | Xon / Claude Desktop Code | Vivian's design mockups |
| 3 | F2 Frontend — AI Feedback Summary card | 🟢 Feature | Xon / Claude Desktop Code | Vivian's design mockups |

---

## 3. Current Project Status Overview

| Category | Status |
|----------|--------|
| **Admin Portal** | ✅ Complete — all pages wired to live API |
| **F1-F4 Backends** | ✅ Complete — all endpoints operational |
| **F3 Frontend** | ✅ Complete — referral screen built |
| **F1, F2, F4 Frontends** | ⏳ Pending — waiting for Vivian's UI designs |
| **Integration Tests** | ✅ Complete — 29/34 pass, bugs fixed |
| **Performance Tests** | ✅ Complete — 6/8 pass |
| **Unit Tests** | ✅ Complete — 11/11 pass |
| **Sprint Schedule** | ✅ v7.2 finalised |
| **Test Plan Document** | ✅ v1.1 — 92 test cases, report-ready |

---

## 4. Team Status

| Person | Recent Activity |
|--------|----------------|
| **Xon** | All 4 backends done. Tests done. Bug fixes done. Waiting on Vivian for frontend UI. |
| **Vivian** | Notifications merged. Pending: UI prototypes for F1/F2/F4, On-site controller PWA. |
| **Grace** | No new commits since 27 May. |
| **Nurain** | No new commits since 2 Jun. |

---

## 5. Upcoming Sprint 5 (29 Jun – 6 Jul)

| Task | Owner |
|------|-------|
| F1/F2/F4 Frontend UIs | Xon (after Vivian's designs) |
| Backend Deployment (Render/Railway) | Xon |
| Frontend Deployment (Vercel) | Grace |
| Final E2E Test Pass | Grace |
| Project Report + Test Results Appendix | Nurain |
| Presentation Slides + Demo Script | Nurain |
| User Manual | Nurain |
| Pre-Deployment Security Audit | Vivian |
