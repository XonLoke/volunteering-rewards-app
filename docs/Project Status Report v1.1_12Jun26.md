# Project Status Report — All Changes Summary

**Version:** 1.1  
**Date:** 12 June 2026 (Updated from v1.0 10 Jun)  
**Project:** Volunteering Rewards App (C3000C)  
**Author:** Xon  
**Status:** Updated — Sprint 3 complete  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Sprint 3 Completed Development](#2-sprint-3-completed-development)
3. [Additional Features F1–F4](#3-additional-features-f1f4)
4. [Bug Fixes & Cleanup](#4-bug-fixes--cleanup)
5. [Testing Completed](#5-testing-completed)
6. [Documents Created](#6-documents-created)
7. [Pending for Sprint 5](#7-pending-for-sprint-5)
8. [Appendix: Full File Manifest](#8-appendix-full-file-manifest)

---

## 1. Executive Summary

From **4 Jun – 12 Jun 2026**, the following was completed for the Volunteering Rewards App:

- **Admin Portal amendments** — Coupons, redemption history, rewards config, UI fixes
- **4 Additional Features (F1–F4)** — AI Event Recommendations, AI Feedback Summarizer, Volunteer Referral Program, Hall of Fame Leaderboard
- **Full test suite** — 11 unit tests, 34 integration tests, 8 performance tests, 133 documented test cases
- **Bug fixes** — 3 critical bugs fixed, data cleanup, role name mismatch resolved
- **Team branch merge** — Vivian's mobile app updates merged into main
- **6 backend stubs replaced** — events/today, roster, stats, feedback, Q&A, categories now live SQL
- **Vivian's settings & contact routes integrated** — Migration 022, nodemailer, shared auth

All backends (F1–F4) are complete and operational. Frontend UIs for F1, F3, and F4 are built. F2 frontend (Feedback Summary card) built on the organiser web portal.

---

## 2. Sprint 3 Completed Development

### 2.1 Admin Portal

| Feature | Description | Status |
|---------|-------------|--------|
| **Coupon Real-Time Calculation** | Fixed formula `Math.round(value_cents × ppd ÷ 100)`. Removed `Math.max` override so values always reflect current Rewards Config. | ✅ Done |
| **Coupon PIN View Modal** | Added modal to display full PIN list when clicking "PINs" button on a coupon row. | ✅ Done |
| **Coupon Filter by Status** | Active / Depleted / All filter chips working correctly in backend `listCoupons()` | ✅ Done |
| **Redemption History** | Sortable columns, date range filter, clickable user names linking to user detail, 7 per page. | ✅ Done |
| **Value Snapshot at Redemption** | `value_cents` frozen in `redemption_logs` at time of redemption. Not affected by Rewards Config changes. | ✅ Done |
| **Rewards Config Save Button** | Made always visible blue (not conditionally gray). | ✅ Done |
| **Organiser Contact Email Fix** | Fixed field alias mismatch (`org_contact_email` → `contact_email`). | ✅ Done |
| **User List Sort Order** | Users now sorted by role: Admin → Organiser → Merchant → Volunteer, then by created date. | ✅ Done |
| **Old Campaigns Removed** | Campaigns removed from admin sidebar. | ✅ Done |

### 2.2 Infrastucture

| Item | Description | Status |
|------|-------------|--------|
| Vivan's Branch Merge | Merged `origin/vivian` into `main` (notifications, event enhancements, mobile screens). | ✅ Done |
| Sprint Schedule v7.2 | Updated sprint breakdown with testing + additional feature focus. | ✅ Done |
| **6 Backend Stubs Replaced** | `events/today`, `events/categories`, `events/:id/roster`, `events/:id/stats`, `events/:id/qna`, `events/:id/feedback` — now use live SQL queries | ✅ Done (12 Jun) |
| **Vivian's Settings/Contact Integrated** | Migration 022 (user_settings), settings.routes.js, contact.routes.js, email.service.js — adapted to shared auth middleware | ✅ Done (12 Jun) |

---

## 3. Additional Features F1–F4

### 3.1 F1: AI Event Recommendations

**Type:** Content-Based Filtering Algorithm  
**No LLM or external API needed** — pure Node.js + PostgreSQL

#### Backend (`backend/src/services/events.service.js`)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/events/recommended` | Returns top 5 recommended events based on volunteer's past category preferences |
| `GET /api/events/popular` | Fallback — returns most popular upcoming events for new volunteers |

**Algorithm:**
1. Query volunteer's past registered events
2. Count frequency per category → create weighted preference profile
3. Score upcoming (unregistered) events by matching categories
4. Return top 5 with `relevance_score`

**Frontend:** Built by Vivian — `app/ai-recommendations.tsx` (1,477 lines)

---

### 3.2 F2: AI Feedback Summarizer

**Type:** Lexicon-Based Sentiment Analysis  
**No LLM or external API needed** — pure keyword matching

#### Backend (`backend/src/services/feedback.service.js`)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/events/:id/feedback/summary` | Returns structured sentiment summary for an event's feedback |

**Algorithm:**
1. Tokenise feedback text → lowercase word tokens
2. Match against built-in positive keyword lexicon (35 words)
3. Match against built-in negative keyword lexicon (25 words)
4. Detect suggestion patterns via regex
5. Calculate sentiment polarity score
6. Return structured summary with: overall sentiment, breakdown, top keywords, suggestion count

#### Frontend (`frontend/web_portals/src/pages/organiser/Feedback.jsx`)

- Added "AI Feedback Summary" card above the feedback list
- Displays: sentiment badge (😊/😐/☹️), breakdown bar, top positive/negative keywords as coloured pills, suggestion count

---

### 3.3 F3: Volunteer Referral Program (Sponsorship)

**Type:** Email-Based Multi-Level Sponsorship with Configurable Points

#### Database Changes

| Migration | Changes |
|-----------|---------|
| `021_add_sponsorship_config.sql` | New `sponsorship_configuration` table + `upline_1_email`, `upline_2_email` on `users` table |

#### Backend

| Endpoint | Purpose |
|----------|---------|
| `GET /api/admin/sponsorship/configuration` | Get sponsorship points config |
| `PUT /api/admin/sponsorship/configuration` | Update sponsorship points config |
| `GET /api/me/sponsorship-profile` | Get user's sponsorship profile with downline |

#### Points Model

| Scenario | Points | Recipient |
|----------|--------|-----------|
| Direct recruitment (no help) | 10 pts | Yourself |
| Recruitment with upline help | 4 pts | You (the recruiter) |
| Helping your downline recruit | 6 pts | You (the upline) |

#### Frontend

- **Admin:** `SponsorshipConfig.jsx` — config page for sponsorship points (like Rewards Config)
- **Mobile:** `app/referral.tsx` — shows upline emails, downline counts, sponsorship points earned

#### Registration Hook

New users can enter `upline_1_email` (parent sponsor) and `upline_2_email` (direct sponsor) during registration. Points are awarded automatically when the new user registers.

---

### 3.4 F4: Hall of Fame Leaderboard

**Type:** Gamification / SQL Ranking Queries

#### Backend (`backend/src/services/leaderboard.service.js`)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/leaderboard` | All 4 categories in one call |
| `GET /api/leaderboard/points` | Top 3 by points balance |
| `GET /api/leaderboard/events` | Top 3 by events attended |
| `GET /api/leaderboard/checkins` | Top 3 by check-in count |
| `GET /api/leaderboard/redeemed` | Top 3 by points redeemed |

**No schema changes needed** — all queries use existing tables with `ORDER BY ... DESC LIMIT 3`.

**Frontend:** Built by Vivian — `app/hall-of-fame.tsx` (934 lines)

---

## 4. Bug Fixes & Cleanup

| Bug | Cause | Fix | Status |
|-----|-------|-----|--------|
| **IT-20:** Events query fails | `e.start_time` column does not exist — column is `event_date` | Changed query to use `e.event_date` | ✅ Fixed |
| **IT-27:** Reward redeem fails | Controller passes object `{userId, rewardId}` but service expects `(rewardId, userId)` args | Fixed argument order | ✅ Fixed |
| **IT-34:** Duplicate scan not rejected | `attendance.service.js` doesn't check for existing check-in | Added duplicate check before insert | ✅ Fixed |
| **Organiser list empty** | DB role is `'organiser'` (with 's') but query used `'organizer'` (with 'z') | Changed all queries to `'organiser'` | ✅ Fixed |
| **User list not sorted by role** | Default sort was by `created_at DESC` only | Added `CASE` statement ordering by role hierarchy | ✅ Fixed |
| **Bob role changed** | Integration tests changed Bob's role_id to volunteer | Restored to organiser role | ✅ Fixed |
| **Test data contamination** | Integration tests created test users, events, orgs | Cleaned up all test records | ✅ Fixed |
| **`max_depth` field useless** | Added to config but never used in code | Removed from migration, service, and frontend | ✅ Fixed |

---

## 5. Testing Completed

| Test Type | Tests | Result | Documentation |
|-----------|-------|--------|---------------|
| **Unit Tests** | 11 | ✅ 11/11 pass | `backend/tests/unit/` |
| **Integration Tests** | 34 | ✅ 29 pass, 3 fixes applied, 2 skip | `docs/Test Results — Integration Tests.md` |
| **Performance Tests** | 8 | ✅ 6 pass, 2 fail (caused by now-fixed bugs) | `docs/Test Results — Performance Tests.md` |
| **Test Plan** | 92 cases | — | `Test Plan & Case Spec v1.1.md` (in `docs/`) |
| **Smoke Test Script** | 1 | — | `backend/tests/integration/smoke_test.sh` |

### Unit Test Breakdown

| File | Tests | What's Covered |
|------|-------|----------------|
| `auth.service.test.js` | 6 | Register success/duplicate, login success/wrong pw, token refresh valid/invalid |
| `admin.service.test.js` | 3 | Points calculation at ppd=100/50, PIN hash determinism |
| `merchant.service.test.js` | 2 | PIN verify valid/invalid |

---

## 6. Documents Created

| Document | Version | Location |
|----------|---------|----------|
| Sprint Breakdown | **v7.2** | `Sprint Breakdown v7.2.md` |
| Test Plan & Case Spec | **v1.1** | `docs/Test Plan & Case Spec v1.1.md` |
| Additional Features Proposal | **v1.2** | `Additional Features Proposal v1.2.md` |
| Test Report — Unit Tests | **v1.0** | `docs/Test Report — Unit Tests (Sprint 3) v1.0.md` |
| Test Results — Integration | **v1.0** | `docs/Test Results — Integration Tests.md` |
| Test Results — Performance | **v1.0** | `docs/Test Results — Performance Tests.md` |
| Testing Guide | **v1.1** | `docs/Testing Guide — Step by Step v1.1.md` |
| Sprint 3 Status Report | **v1.1** | `Sprint 3 Status Report v1.1.md` |
| Jira Amendment List | **v1.2** | `Jira Amendment List v1.2.md` |
| Jira Update v4 | **v4.0** | `Jira Update v4 — 8 Jun 2026.md` |
| This Status Report | **v1.0** | `Project Status Report v1.0.md` |

---

## 7. Pending for Sprint 5

| Task | Owner | Target Date |
|------|-------|-------------|
| F2 Frontend — AI Summary on mobile event detail | Xon | Sprint 5 |
| Backend Deployment (Render/Railway) | Xon | 29 Jun – 6 Jul |
| Frontend Deployment (Vercel) | Grace | 29 Jun – 6 Jul |
| Final E2E Test Pass | Grace | 29 Jun – 6 Jul |
| Project Report (with test results + features) | Nurain | 29 Jun – 6 Jul |
| Presentation Slides + Demo Script | Nurain | 29 Jun – 6 Jul |
| User Manual | Nurain | 29 Jun – 6 Jul |
| Pre-Deployment Security Audit | Vivian | 29 Jun – 6 Jul |

---

## 8. Appendix: Full File Manifest

### New Backend Files

| File | Feature |
|------|---------|
| `backend/migrations/021_add_sponsorship_config.sql` | F3 Sponsorship config |
| `backend/src/services/feedback.service.js` | F2 AI Feedback Summarizer |
| `backend/src/services/leaderboard.service.js` | F4 Hall of Fame Leaderboard |
| `backend/src/services/referral.service.js` | F3 Rewritten for email-based sponsorship |
| `backend/src/services/sponsorshipConfig.service.js` | F3 Sponsorship config CRUD |
| `backend/src/controllers/feedback.controller.js` | F2 Controller |
| `backend/src/controllers/leaderboard.controller.js` | F4 Controller |
| `backend/src/routes/feedback.routes.js` | F2 Routes |
| `backend/src/routes/leaderboard.routes.js` | F4 Routes |
| `backend/tests/unit/auth.service.test.js` | Unit tests |
| `backend/tests/unit/admin.service.test.js` | Unit tests |
| `backend/tests/unit/merchant.service.test.js` | Unit tests |
| `backend/tests/integration/smoke_test.sh` | Smoke test |

### New Frontend Files

| File | Feature |
|------|---------|
| `frontend/web_portals/src/pages/admin/SponsorshipConfig.jsx` | F3 Admin config page |
| `app/referral.tsx` | F3 Mobile sponsorship screen |

### Modified Files

| File | Changes |
|------|---------|
| `backend/src/services/events.service.js` | Added `getRecommendations()`, `getPopularEvents()`. Fixed `start_time` → `event_date`. Fixed status filter. |
| `backend/src/services/auth.service.js` | Replaced `referral_code` with `upline_1_email`, `upline_2_email` |
| `backend/src/services/attendance.service.js` | Removed attendance-based referral hook |
| `backend/src/services/admin.service.js` | Fixed `organizer` → `organiser`. Added role sort order. |
| `backend/src/controllers/events.controller.js` | Added `recommended()`, `popular()` handlers |
| `backend/src/controllers/admin.controller.js` | Added sponsorship config handlers |
| `backend/src/routes/events.routes.js` | Added `/recommended`, `/popular`, `/feedback/summary` routes |
| `backend/src/routes/admin.routes.js` | Added sponsorship config routes |
| `backend/index.js` | Mounted leaderboard, feedback, referral routes |
| `frontend/web_portals/src/App.jsx` | Added SponsorshipConfig route |
| `frontend/web_portals/src/layouts/AdminLayout.jsx` | Added "Sponsorship Config" sidebar link |
| `frontend/web_portals/src/pages/organiser/Feedback.jsx` | Added AI Feedback Summary card |
| `app/home.tsx` | Updated by Vivian with recommendations + leaderboard sections |
| `app/ai-recommendations.tsx` | Created by Vivian (1,477 lines) |
| `app/hall-of-fame.tsx` | Created by Vivian (934 lines) |
| `app/profile.tsx` | Updated menu label |
| `backend/package.json` | Updated test script |

---

*End of Report*
