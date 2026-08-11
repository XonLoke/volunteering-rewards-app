# Sprint 5 Schedule — Final Wrap-Up

**Final Testing, Documentation, AI Features & Merchant Dashboard (V7 — 100% COMPLETE)**

| | |
|---|---|
| **Project** | Volunteering Rewards App (C3000C) |
| **Sprint** | 29 Jun – 6 Jul 2026 (extended: 7 Jul – 13 Aug post-delivery wrap-up) |
| **Version** | 7.0 |
| **Status** | 🟢 **100% COMPLETE** — all tasks delivered before 13 Aug 2026 |

---

## 0. Final Wrap-Up Statement (V7)

**The project reached 100% completion before the final review on 13 August 2026.**

- Every task scheduled in this plan — development, deployment, testing, security, documentation, and delivery — has been **completed and delivered**.
- The remaining items marked ⬜ in V6 were executed and delivered through **direct coordination with the supervisor (Mr Andy Tao)** during the extended post-delivery period (7 Jul – 13 Aug).
- Execution of these final items was **coordinated and communicated with the supervisor but was not formally documented task-by-task in the schedule or Jira board** — completion was confirmed via supervisor meetings and the orchestration **integration testing** executed on **23 Jul 2026** (see `Records of Team Meetings with Supervisor.md` — 10 meetings documented).
- Evidence of completion is recorded in: the final report (`_Claude_v3.5.md`), test reports (91/91 unit tests, 18/18 API endpoints, 54/54 orchestration integration tests), the integration test record, the C300 Final Evaluation Slides (26 slides), and the GitHub Release **v1.0.0-demo** (APK, 118 MB).

---

## 1. Sprint Overview

Sprint 5 focuses on wrapping up all remaining work:

- ✅ Deployment complete (done early)
- ✅ APK Build complete (app-release.apk generated, published as GitHub Release v1.0.0-demo)
- ✅ PWA-APK Unification executed (PWA now matches APK)
- ✅ Responsive design fixes (Merchant, Scanner, Volunteer PWA)
- ✅ AI/LLM Features (Gen 2) — FreeLLMAPI + ai.service.js deployed
- ✅ Merchant Dashboard Expansion — Built, reviewed and committed
- ✅ Architecture Report v3.1 + AI Development Guide V2.1 created
- ✅ APK Testing on real device (install, launch, auth verified — Release v1.0.0-demo)
- ✅ Team testing — unit (91/91), API (18/18), orchestration integration (54/54), UAT (23 Jul, with supervisor)
- ✅ Documentation — report v3.5, user manual v1.0.1, C300 Final Evaluation Slides (26 slides), project poster
- ✅ Merchant Dashboard — reviewed, amended and committed to GitHub

### Key Milestones

| Date | Milestone | Owner | Status |
|---|---|---|---|
| 29 Jun (Mon) | Sprint 5 kickoff | All | ✅ Done |
| 29 Jun | APK Build Complete | Xon | ✅ Done |
| 30 Jun (Tue) | PWA-APK Unification Executed (PWA matches APK) | Xon | ✅ Done |
| 30 Jun | Responsive design fixes (Merchant/Scanner/PWA) | Xon | ✅ Done |
| 3 Jul (Fri) | AI/LLM Features (Gen 2) deployed | Xon | ✅ Done |
| 3 Jul | Merchant Dashboard built (backend + frontend) | Xon | ✅ Done |
| 3 Jul | Merchant Dashboard review & commit | Grace | ✅ Done |
| 4 Jul (Sat) | Bug fix window + dry-run presentation rehearsal | All | ✅ Done |
| 5 Jul | Admin Account Creation feature built (Invite User modal) | Xon | ✅ Done |
| 5 Jul (Sun) | Documentation complete | Nurain | ✅ Done |
| 6 Jul (Mon) | Sprint 5 dry-run & handover | All | ✅ Done |
| **23 Jul** | **Orchestration integration testing — 54/54 cross-portal tests (Sections A–I)** | **All** | **✅ Done** |
| **24 Jul** | **C300 Final Evaluation Slides enriched (26 slides)** | **Xon** | **✅ Done** |
| **13 Aug** | **Final review — project 100% complete** | **All** | **🟢 CONFIRMED** |

---

## 2. Task Assignments & Schedule

### Xon — All Technical Tasks (23/23 ✅)

| Date | Task | Jira | Status |
|---|---|---|---|
| 29 Jun | Install JDK 17+ & Android SDK | KAN-148 | ✅ Done |
| 29 Jun | Configure Android SDK environment | KAN-148 | ✅ Done |
| 29 Jun | Fix MAX_PATH / newArchEnabled=false | KAN-148 | ✅ Done |
| 29 Jun | Install missing Expo packages | KAN-148 | ✅ Done |
| 29 Jun | Fix @/ path alias → relative imports (23 files) | KAN-149 | ✅ Done |
| 29 Jun | Fix template literal breakage in events.tsx | KAN-149 | ✅ Done |
| 29 Jun | Local build: ./gradlew assembleRelease | KAN-150 | ✅ Done |
| 29 Jun | SDK 52→54 upgrade + CI workflow fix | KAN-153 | ✅ Done |
| 30 Jun | KAN-157 PWA-APK Unification (all 3 phases) | KAN-157 | ✅ Done |
| 30 Jun | Responsive fixes (Merchant, Scanner, PWA) | — | ✅ Done |
| 30 Jun | Old PWA URL replaced across 18 documents | — | ✅ Done |
| 30 Jun | Sprint4_conclusion + Test Plan v2.1 + Testing Guide v1.2 | — | ✅ Done |
| 30 Jun | Jira update: KAN-157/150/153 → Done | — | ✅ Done |
| 30 Jun | UAT participation | KAN-155 | ✅ Done |
| 3 Jul | FreeLLMAPI installed + Google AI key configured | — | ✅ Done |
| 3 Jul | ai.service.js — callLlm(), getAiRecommendations(), getAiFeedbackSummary() | — | ✅ Done |
| 3 Jul | ai.controller.js — AI-first with Gen 1 fallback | — | ✅ Done |
| 3 Jul | ai.routes.js — GET /api/ai/recommendations, /api/ai/feedback-summary | — | ✅ Done |
| 3 Jul | AI_DEVELOPMENT_GUIDE_V2.1.md | — | ✅ Done |
| 3 Jul | System Architecture & Development Report v3.1 | — | ✅ Done |
| 3 Jul | Merchant Dashboard: Backend (stats, product CRUD, redemptions) | — | ✅ Done |
| 3 Jul | Merchant Dashboard: Frontend (Dashboard, Products, sidebar layout) | — | ✅ Done |
| 3 Jul | Merchant Dashboard: PinVerify + History refactored for sidebar | — | ✅ Done |
| 3 Jul | Merchant Dashboard: Instruction doc for Grace | — | ✅ Done |
| 3 Jul | Sprint 5 Schedule v6 | — | ✅ Done |
| 5 Jul | Admin Account Creation — Remove one-click role toggle from detail view | — | ✅ Done |
| 5 Jul | Admin Account Creation — Backend: createUserAccount service + controller + route | — | ✅ Done |
| 5 Jul | Admin Account Creation — Frontend: InviteUserModal + "+ Invite User" button | — | ✅ Done |
| 5 Jul | Admin Account Creation — E2E API testing (10/10 tests passed) | — | ✅ Done |
| 5 Jul | Admin Account Creation — Implementation Report v1.0 | — | ✅ Done |
| 6 Jul | System Verification — 91/91 tests, 18 endpoints, 5 portals | KAN-173 | ✅ Done |
| 6 Jul | Security Audit — 6 issues found and fixed | KAN-174 | ✅ Done |
| 6 Jul | APK Build — production API + GitHub Release v1.0.0-demo | KAN-167/180 | ✅ Done |
| 17 Jul | Post-sprint: Email verification (AUTH-09), Forgot/Reset password (AUTH-10/11), Mailgun, notifications, documentation | KAN-181–186 | ✅ Done |

### Vivian — Security Tests, UAT & APK Testing

| Date | Task | Jira | Est. Time | Status |
|---|---|---|---|---|
| 1 Jul | APK-TEST-01: Install APK + app launch + auth flow | KAN-158 | 45 min | ✅ Done |
| 1 Jul | APK-TEST-02: Events browsing + registration flow | KAN-159 | 45 min | ✅ Done |
| 2 Jul | UAT: Volunteer mobile flows | KAN-160 | 60 min | ✅ Done |
| 3 Jul | Security test: Auth & session management | KAN-156 | 30 min | ✅ Done |
| 3 Jul | Security test: Input validation | — | 30 min | ✅ Done |
| 3 Jul | UAT: Organiser flows | KAN-161 | 60 min | ✅ Done |
| 4 Jul | Bug reporting & retest | — | 30 min | ✅ Done |
| 5 Jul | Final verification | — | 30 min | ✅ Done |
| 23 Jul | Orchestration integration testing — volunteer PWA/APK parity (Section A) | — | — | ✅ Done |

### Grace — Integration Tests, UAT & Merchant Dashboard

| Date | Task | Jira | Est. Time | Status |
|---|---|---|---|---|
| 30 Jun–1 Jul | Integration test: API endpoints (events, auth, rewards) | KAN-162 | 45 min | ✅ Done |
| 1 Jul | Integration test: QR scanning flow | KAN-163 | 45 min | ✅ Done |
| 2 Jul | UAT: End-to-end volunteer journey | KAN-164 | 60 min | ✅ Done |
| 3 Jul | Review merchant dashboard code & commit to GitHub | — | 60 min | ✅ Done |
| 5 Jul | Bug reporting & retest | — | 30 min | ✅ Done |
| 23 Jul | Orchestration integration testing — merchant PIN verification (Section E) | — | — | ✅ Done |

### Nurain — Documentation, UAT & APK Testing

| Date | Task | Jira | Est. Time | Status |
|---|---|---|---|---|
| 30 Jun | Documentation: Project report draft | KAN-165 | 90 min | ✅ Done |
| 30 Jun–1 Jul | Documentation: User manual | KAN-166 | 90 min | ✅ Done |
| 1 Jul | APK-TEST-03: Rewards + points + QR scanning | KAN-167 | 45 min | ✅ Done |
| 1 Jul | APK-TEST-04: Profile + settings + notifications | KAN-168 | 45 min | ✅ Done |
| 2 Jul | UAT: Merchant + redemption flows | KAN-169 | 60 min | ✅ Done |
| 3 Jul | Documentation: Sprint report | KAN-170 | 60 min | ✅ Done |
| 4 Jul | Presentation slides preparation | KAN-171 | 60 min | ✅ Done |
| 5 Jul | Final review & formatting | — | 45 min | ✅ Done |
| 23 Jul | Orchestration integration testing — organiser + scanner (Sections B/D) | — | — | ✅ Done |

### Whole Team — System Tests & Dry-Run

| Date | Task | Participants | Status |
|---|---|---|---|
| 3 Jul | System test: Full walkthrough all platforms | All | ✅ Done |
| 5 Jul | Dry-run: Capstone presentation rehearsal | All | ✅ Done |
| 6 Jul | Final fixes & submission | All | ✅ Done |
| 6 Jul | Handover documentation | Xon, Nurain | ✅ Done |
| 23 Jul | Orchestration integration testing (Sections A–I, 9 integration sections) | All | ✅ Done |

---

## 3. AI/LLM Features — Gen 2 (Built ✅ 3 Jul)

> **New:** FreeLLMAPI-powered real LLM features replacing rule-based Gen 1. Graceful fallback preserved.

### Installation

| # | Task | Done? |
|---|---|---|
| AI-01 | Clone FreeLLMAPI repo + npm install | ✅ |
| AI-02 | Configure .env with encryption key | ✅ |
| AI-03 | Start FreeLLMAPI server on port 3001 | ✅ |
| AI-04 | Add Google AI Studio API key (Gemini 2.5 Flash) | ✅ |
| AI-05 | Verify `auto` model routes correctly | ✅ |

### Backend Implementation

| # | File | Purpose | Done? |
|---|---|---|---|
| AI-06 | `backend/src/services/ai.service.js` | `callLlm()`, `getAiRecommendations()`, `getAiFeedbackSummary()` | ✅ |
| AI-07 | `backend/src/controllers/ai.controller.js` | HTTP handlers with AI-first → Gen1 fallback | ✅ |
| AI-08 | `backend/src/routes/ai.routes.js` | `GET /api/ai/recommendations`, `GET /api/ai/feedback-summary/:eventId` | ✅ |
| AI-09 | `backend/index.js` | Mount `/api/ai` routes | ✅ |
| AI-10 | `backend/.env` | Add `FRELLMAPI_URL`, `FRELLMAPI_KEY` | ✅ |

### Documentation

| # | Doc | Done? |
|---|---|---|
| AI-11 | `docs/AI_DEVELOPMENT_GUIDE_V2.md` | ✅ |
| AI-12 | `docs/AI_DEVELOPMENT_GUIDE_V2.1.md` (+ FreeLLMAPI rationale, failover, build details) | ✅ |

---

## 4. Merchant Dashboard — Complete ✅

> **Status:** ✅ Built by Xon, reviewed and committed to GitHub (KAN-165 Done, 17 Jul).

### Backend

| # | Endpoint | Purpose | Status |
|---|---|---|---|
| M-01 | `GET /api/merchant/dashboard` | Dashboard stats (today's redemptions, value, products, popular items, activity) | ✅ |
| M-02 | `GET /api/merchant/products` | List merchant's products | ✅ |
| M-03 | `POST /api/merchant/products` | Create product | ✅ |
| M-04 | `PUT /api/merchant/products/:id` | Update product | ✅ |
| M-05 | `DELETE /api/merchant/products/:id` | Soft delete product | ✅ |
| M-06 | `GET /api/merchant/redemptions` | Filtered redemption records | ✅ |

### Frontend

| # | Page | Purpose | Status |
|---|---|---|---|
| M-07 | `MerchantLayout.jsx` | Sidebar layout (Dashboard, Verify, History, Products) | ✅ |
| M-08 | `Dashboard.jsx` | Stats cards, popular items, recent activity | ✅ |
| M-09 | `Products.jsx` | CRUD with DataTable + Modal | ✅ |
| M-10 | `App.jsx` | Updated routing (login outside layout) | ✅ |
| M-11 | `Login.jsx` | Redirect to `/merchant/dashboard` | ✅ |
| M-12 | `PinVerify.jsx` | Refactored for sidebar layout | ✅ |
| M-13 | `History.jsx` | Refactored for sidebar layout | ✅ |

### Reference Doc

| # | Doc | Purpose | Status |
|---|---|---|---|
| M-14 | `docs/Merchant Dashboard — Grace Instructions.md` | Step-by-step implementation guide | ✅ |

---

## 5. Current Progress Snapshot — FINAL (13 Aug 2026)

| Area | Status | Notes |
|---|---|---|
| Backend API | ✅ Live | https://vol-rewards-api.onrender.com/api — health OK |
| Volunteer PWA | ✅ Live (updated) | https://volunteering-rewards-app.vercel.app — tab GUI ✅ |
| Native APK | ✅ Released | GitHub Release **v1.0.0-demo** (118 MB) |
| Web Portals | ✅ Deployed | Admin, Organiser, Merchant, Scanner all live |
| CI Build | ✅ Passing | GitHub Actions build-apk.yml |
| Database | ✅ Connected | Neon PostgreSQL 16 |
| Unit Tests | ✅ Passing | **91/91 tests** |
| API Endpoints | ✅ Verified | **18/18 verified on production** |
| Orchestration Integration | ✅ Passing | **54/54 cross-portal tests (9 Jul)** |
| Security Audit | ✅ Complete | 6 issues fixed, 9 areas verified secure |
| Integration Testing | ✅ Complete | 54/54 orchestration integration tests (9 Jul) + 3 UAT scenarios (with supervisor) |
| AI Event Recommendations | ✅ Deployed | `GET /api/ai/recommendations` — LLM-first (Gen 2) |
| AI Feedback Summary | ✅ Deployed | `GET /api/ai/feedback-summary/:eventId` — LLM-first (Gen 2) |
| Merchant Dashboard | ✅ Complete | Reviewed & committed (KAN-165) |
| Email Auth (AUTH-09/10/11) | ✅ Complete | Email verification, forgot/reset password, Mailgun — all portals + mobile |
| Project Report | ✅ Complete | `_Claude_v3.5.md` + docs |
| User Manual | ✅ Complete | Manual Operations Guide v1.0.1 |
| Presentation Slides | ✅ Complete | C300 Final Evaluation Slides (26 slides, enriched 24 Jul) |
| Project Poster | ✅ Complete | Project_Poster.pptx |
| AI Development Guide V2.1 | ✅ Created | docs/AI_DEVELOPMENT_GUIDE_V2.1.md |
| Architecture Report | ✅ Updated | docs/System Architecture & Development Report v3.4 |
| Admin Account Creation | ✅ Done | Invite User modal + API endpoint — supervisor-approved |
| **Overall** | **🟢 100% COMPLETE** | **Before final review 13 Aug 2026** |

---

## 6. Risk Table — All Resolved ✅

| Risk | Impact | Mitigation | Outcome |
|---|---|---|---|
| APK testing finds critical bugs | Delays handover | Xon fixes ASAP; testers retest | ✅ Resolved — APK released |
| Team member unavailable | Task slips | Reassign within team | ✅ Resolved — tasks reassigned |
| Documentation incomplete | Poor submission quality | Daily check-ins on progress | ✅ Resolved — all docs complete |
| Grace cannot complete merchant dashboard | Feature missing | Xon's pre-built code ready to commit as replacement | ✅ Resolved — committed (KAN-165) |

---

## 7. Jira Issue Reference — Sprint 5 (Final)

| Issue | Description | Assignee | Status |
|---|---|---|---|
| KAN-148 | Set up Android build environment | Xon | ✅ Done |
| KAN-149 | Fix code issues for APK build | Xon | ✅ Done |
| KAN-150 | Local APK build | Xon | ✅ Done |
| KAN-153 | SDK upgrade + CI workflow | Xon | ✅ Done |
| KAN-157 | PWA-APK Unification | Xon | ✅ Done |
| KAN-155 | UAT participation | Xon | ✅ Done |
| KAN-156 | Security test: Auth & session | Vivian | ✅ Done |
| KAN-158 | APK-TEST-01: Install + auth | Vivian | ✅ Done |
| KAN-159 | APK-TEST-02: Events | Vivian | ✅ Done |
| KAN-160 | UAT: Volunteer mobile | Vivian | ✅ Done |
| KAN-161 | UAT: Organiser flows | Vivian | ✅ Done |
| KAN-162 | Integration test: API endpoints | Grace | ✅ Done |
| KAN-163 | Integration test: QR scanning | Grace | ✅ Done |
| KAN-164 | UAT: E2E volunteer journey | Grace | ✅ Done |
| KAN-165 | Documentation: Project report | Nurain | ✅ Done |
| KAN-166 | Documentation: User manual | Nurain | ✅ Done |
| KAN-167 | APK-TEST-03: Rewards + QR | Nurain | ✅ Done |
| KAN-168 | APK-TEST-04: Profile + settings | Nurain | ✅ Done |
| KAN-169 | UAT: Merchant flows | Nurain | ✅ Done |
| KAN-170 | Documentation: Sprint report | Nurain | ✅ Done |
| KAN-171 | Presentation slides | Nurain | ✅ Done |
| KAN-173 | System Verification: 91/91 tests, 18 endpoints, 5 portals | Xon | ✅ Done |
| KAN-174 | Security Audit: 6 issues found and fixed | Xon | ✅ Done |
| KAN-175 | Merchant Dashboard review (Grace) | Grace | ✅ Done |
| KAN-176 | Orchestration Integration Testing — Cross-Portal Data Flow | Xon | ✅ Done |
| KAN-177 | Orchestration Test Suite — 54 cross-portal tests (100% pass) | Xon | ✅ Done |
| KAN-178–180 | Coupon PIN bugs fixed + APK rebuilt with production API | Xon | ✅ Done |
| KAN-181–186 | Post-sprint: AUTH-09/10/11, Mailgun, notifications, docs | Xon | ✅ Done |
| — | AI/LLM Gen 2 (FreeLLMAPI + ai.service) | Xon | ✅ Done |
| — | Merchant Dashboard (backend + frontend) | Grace | ✅ Done |

> **Note:** KAN-176/177/175 and the post-sprint items (KAN-181–186) were executed and completed through coordination with the supervisor but were not marked in the Jira board at execution time — see the Final Wrap-Up Statement (§0).

---

## 8. Out-of-Scope / Stretch Items (Not Scheduled)

The following stretch ideas were evaluated and **explicitly excluded from scope** (not required by the project brief):

| Item | Reason Excluded |
|---|---|
| AI Fraud Detection (KAN-79) | Stretch feature — not in scope |
| AI Chatbot (KAN-86) | Stretch feature — not in scope |

---

**Board:** https://fengshui0011.atlassian.net/jira/software/projects/KAN/boards/2

---

*— End of Sprint 5 Schedule v7.0 (Final Wrap-Up) — 100% COMPLETE before 13 Aug 2026 —*
