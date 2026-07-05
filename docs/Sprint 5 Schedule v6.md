# Sprint 5 Schedule

**Final Testing, Documentation, AI Features & Merchant Dashboard (V6)**

| | |
|---|---|
| **Project** | Volunteering Rewards App (C3000C) |
| **Sprint** | 29 Jun – 6 Jul 2026 |
| **Version** | 6.0 |
| **Status** | 🟢 AI/LLM Gen 2 deployed. Merchant dashboard built (awaiting Grace). Team testing phase. |

---

## 1. Sprint Overview

Sprint 5 focuses on wrapping up all remaining work:

- ✅ Deployment complete (done early)
- ✅ APK Build complete (app-release.apk generated, 83 MB)
- ✅ PWA-APK Unification executed (PWA now matches APK)
- ✅ Responsive design fixes (Merchant, Scanner, Volunteer PWA)
- ✅ AI/LLM Features (Gen 2) — FreeLLMAPI + ai.service.js deployed
- ✅ Merchant Dashboard Expansion — Built (backend + frontend), awaiting Grace's review
- ✅ Architecture Report v3.1 + AI Development Guide V2.1 created
- ⬜ APK Testing on real device
- ⬜ Team testing tasks — security, integration, UAT
- ⬜ Documentation — report, slides, user manual
- ⬜ Merchant Dashboard — Grace to review, amend, and commit

### Key Milestones

| Date | Milestone | Owner |
|---|---|---|
| 29 Jun (Mon) | Sprint 5 kickoff | All |
| 29 Jun | ✅ APK Build Complete | Xon |
| 30 Jun (Tue) | ✅ PWA-APK Unification Executed (PWA matches APK) | Xon |
| 30 Jun | ✅ Responsive design fixes (Merchant/Scanner/PWA) | Xon |
| 3 Jul (Fri) | ✅ AI/LLM Features (Gen 2) deployed | Xon |
| 3 Jul | ✅ Merchant Dashboard built (backend + frontend) | Xon |
| 3 Jul | Merchant Dashboard review & commit | Grace |
| 4 Jul (Sat) | Bug fix window + dry-run presentation rehearsal | All |
| **5 Jul** | **✅ Admin Account Creation feature built (Invite User modal)** | **Xon** |
| 5 Jul (Sun) | Documentation complete | Nurain |
| 6 Jul (Mon) | Sprint 5 dry-run & handover | All |

---

## 2. Task Assignments & Schedule

### Xon — All Technical Tasks (23/23 ✅ + Merchant awaiting Grace)

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
| 30 Jun | UAT participation | KAN-155 | 🔄 In Progress |
| **3 Jul** | **FreeLLMAPI installed + Google AI key configured** | — | **✅ Done** |
| **3 Jul** | **ai.service.js — callLlm(), getAiRecommendations(), getAiFeedbackSummary()** | — | **✅ Done** |
| **3 Jul** | **ai.controller.js — AI-first with Gen 1 fallback** | — | **✅ Done** |
| **3 Jul** | **ai.routes.js — GET /api/ai/recommendations, /api/ai/feedback-summary** | — | **✅ Done** |
| **3 Jul** | **AI_DEVELOPMENT_GUIDE_V2.1.md** | — | **✅ Done** |
| **3 Jul** | **System Architecture & Development Report v3.1** | — | **✅ Done** |
| **3 Jul** | **Merchant Dashboard: Backend (stats, product CRUD, redemptions)** | — | **✅ Built** |
| **3 Jul** | **Merchant Dashboard: Frontend (Dashboard, Products, sidebar layout)** | — | **✅ Built** |
| **3 Jul** | **Merchant Dashboard: PinVerify + History refactored for sidebar** | — | **✅ Built** |
| **3 Jul** | **Merchant Dashboard: Instruction doc for Grace** | — | **✅ Created** |
| 3 Jul | Sprint 5 Schedule v6 | — | ✅ Done |
| **5 Jul** | **Admin Account Creation — Remove one-click role toggle from detail view** | **—** | **✅ Done** |
| **5 Jul** | **Admin Account Creation — Backend: createUserAccount service + controller + route** | **—** | **✅ Done** |
| **5 Jul** | **Admin Account Creation — Frontend: InviteUserModal + "+ Invite User" button** | **—** | **✅ Done** |
| **5 Jul** | **Admin Account Creation — E2E API testing (10/10 tests passed)** | **—** | **✅ Done** |
| **5 Jul** | **Admin Account Creation — Implementation Report v1.0** | **—** | **✅ Done** |

### Vivian — Security Tests, UAT & APK Testing

| Date | Task | Jira | Est. Time | Status |
|---|---|---|---|---|
| 1 Jul | APK-TEST-01: Install APK + app launch + auth flow | KAN-158 | 45 min | ⬜ Pending |
| 1 Jul | APK-TEST-02: Events browsing + registration flow | KAN-159 | 45 min | ⬜ Pending |
| 2 Jul | UAT: Volunteer mobile flows | KAN-160 | 60 min | ⬜ Pending |
| 3 Jul | Security test: Auth & session management | KAN-156 | 30 min | ⬜ Pending |
| 3 Jul | Security test: Input validation | — | 30 min | ⬜ Pending |
| 3 Jul | UAT: Organiser flows | KAN-161 | 60 min | ⬜ Pending |
| 4 Jul | Bug reporting & retest | — | 30 min | ⬜ Pending |
| 5 Jul | Final verification | — | 30 min | ⬜ Pending |

### Grace — Integration Tests, UAT & Merchant Dashboard

| Date | Task | Jira | Est. Time | Status |
|---|---|---|---|---|
| 30 Jun–1 Jul | Integration test: API endpoints (events, auth, rewards) | KAN-162 | 45 min | ⬜ Pending |
| 1 Jul | Integration test: QR scanning flow | KAN-163 | 45 min | ⬜ Pending |
| 2 Jul | UAT: End-to-end volunteer journey | KAN-164 | 60 min | ⬜ Pending |
| **3 Jul** | **Review merchant dashboard code & commit to GitHub** | — | **60 min** | **⬜ Pending** |
| 5 Jul | Bug reporting & retest | — | 30 min | ⬜ Pending |

### Nurain — Documentation, UAT & APK Testing

| Date | Task | Jira | Est. Time | Status |
|---|---|---|---|---|
| 30 Jun | Documentation: Project report draft | KAN-165 | 90 min | ⬜ Pending |
| 30 Jun–1 Jul | Documentation: User manual | KAN-166 | 90 min | ⬜ Pending |
| 1 Jul | APK-TEST-03: Rewards + points + QR scanning | KAN-167 | 45 min | ⬜ Pending |
| 1 Jul | APK-TEST-04: Profile + settings + notifications | KAN-168 | 45 min | ⬜ Pending |
| 2 Jul | UAT: Merchant + redemption flows | KAN-169 | 60 min | ⬜ Pending |
| 3 Jul | Documentation: Sprint report | KAN-170 | 60 min | ⬜ Pending |
| 4 Jul | Presentation slides preparation | KAN-171 | 60 min | ⬜ Pending |
| 5 Jul | Final review & formatting | — | 45 min | ⬜ Pending |

### Whole Team — System Tests & Dry-Run

| Date | Task | Participants | Status |
|---|---|---|---|
| 3 Jul | System test: Full walkthrough all platforms | All | ⬜ Pending |
| 5 Jul | Dry-run: Capstone presentation rehearsal | All | ⬜ Pending |
| 6 Jul | Final fixes & submission | All | ⬜ Pending |
| 6 Jul | Handover documentation | Xon, Nurain | ⬜ Pending |

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

## 4. Merchant Dashboard — Awaiting Grace

> **Status:** ✅ Code built. Awaiting Grace to review, amend, commit to GitHub.

### Backend

| # | Endpoint | Purpose | Status |
|---|---|---|---|
| M-01 | `GET /api/merchant/dashboard` | Dashboard stats (today's redemptions, value, products, popular items, activity) | ✅ Built |
| M-02 | `GET /api/merchant/products` | List merchant's products | ✅ Built |
| M-03 | `POST /api/merchant/products` | Create product | ✅ Built |
| M-04 | `PUT /api/merchant/products/:id` | Update product | ✅ Built |
| M-05 | `DELETE /api/merchant/products/:id` | Soft delete product | ✅ Built |
| M-06 | `GET /api/merchant/redemptions` | Filtered redemption records | ✅ Built |

### Frontend

| # | Page | Purpose | Status |
|---|---|---|---|
| M-07 | `MerchantLayout.jsx` | Sidebar layout (Dashboard, Verify, History, Products) | ✅ Built |
| M-08 | `Dashboard.jsx` | Stats cards, popular items, recent activity | ✅ Built |
| M-09 | `Products.jsx` | CRUD with DataTable + Modal | ✅ Built |
| M-10 | `App.jsx` | Updated routing (login outside layout) | ✅ Built |
| M-11 | `Login.jsx` | Redirect to `/merchant/dashboard` | ✅ Built |
| M-12 | `PinVerify.jsx` | Refactored for sidebar layout | ✅ Built |
| M-13 | `History.jsx` | Refactored for sidebar layout | ✅ Built |

### Reference Doc

| # | Doc | Purpose | Status |
|---|---|---|---|
| M-14 | `docs/Merchant Dashboard — Grace Instructions.md` | Step-by-step implementation guide | ✅ Created |

---

## 5. Current Progress Snapshot

| Area | Status | Notes |
|---|---|---|
| Backend API | ✅ Live | https://vol-rewards-api.onrender.com/api — health OK |
| Volunteer PWA | ✅ Live (updated) | https://volunteering-rewards-app.vercel.app — tab GUI ✅ |
| Native APK | ✅ Built (83 MB) | app-release.apk ready for testing |
| Web Portals | ✅ Deployed | Admin, Organiser, Merchant, Scanner all live |
| CI Build | ✅ Passing | GitHub Actions build-apk.yml |
| Database | ✅ Connected | Neon PostgreSQL 16 |
| Unit Tests | ✅ Passing | 180+ tests |
| FreeLLMAPI Server | ✅ Running | localhost:3001 (Google Gemini 2.5 Flash) |
| **AI Event Recommendations** | **✅ Deployed** | **`GET /api/ai/recommendations` — LLM-first** |
| **AI Feedback Summary** | **✅ Deployed** | **`GET /api/ai/feedback-summary/:eventId` — LLM-first** |
| **Merchant Dashboard** | **✅ Built (uncommitted)** | **Awaiting Grace review & commit** |
| Integration Tests | ⬜ Pending | Assigned to Grace |
| Security Tests | ⬜ Pending | Assigned to Vivian |
| APK Testing | ⬜ Pending | Vivian + Nurain |
| UAT | ⬜ Pending | All team members |
| Project Report | ⬜ In progress | Assigned to Nurain |
| User Manual | ⬜ Pending | Assigned to Nurain |
| Presentation Slides | ⬜ Pending | Assigned to Nurain |
| AI Development Guide V2.1 | ✅ Created | docs/AI_DEVELOPMENT_GUIDE_V2.1.md |
| Architecture Report v3.1 | ✅ Updated | docs/System Architecture & Development Report v3.1.md |
| Grace Instructions | ✅ Created | docs/Merchant Dashboard — Grace Instructions.md |
| **Admin Account Creation** | **✅ Done** | **Invite User modal + API endpoint — supervisor-approved** |

---

## 6. Risk Table

| Risk | Impact | Mitigation |
|---|---|---|
| APK testing finds critical bugs | Delays handover | Xon fixes ASAP; testers retest |
| Team member unavailable | Task slips | Reassign within team |
| Documentation incomplete | Poor submission quality | Daily check-ins on progress |
| Grace cannot complete merchant dashboard | Feature missing | Xon's pre-built code ready to commit as replacement |

---

## 7. Jira Issue Reference — Sprint 5

| Issue | Description | Assignee | Status |
|---|---|---|---|
| KAN-148 | Set up Android build environment | Xon | ✅ Done |
| KAN-149 | Fix code issues for APK build | Xon | ✅ Done |
| KAN-150 | Local APK build | Xon | ✅ Done |
| KAN-153 | SDK upgrade + CI workflow | Xon | ✅ Done |
| KAN-157 | PWA-APK Unification | Xon | ✅ Done |
| KAN-155 | UAT participation | Xon | 🔄 In Progress |
| KAN-156 | Security test: Auth & session | Vivian | ⬜ Pending |
| KAN-158 | APK-TEST-01: Install + auth | Vivian | ⬜ Pending |
| KAN-159 | APK-TEST-02: Events | Vivian | ⬜ Pending |
| KAN-160 | UAT: Volunteer mobile | Vivian | ⬜ Pending |
| KAN-161 | UAT: Organiser flows | Vivian | ⬜ Pending |
| KAN-162 | Integration test: API endpoints | Grace | ⬜ Pending |
| KAN-163 | Integration test: QR scanning | Grace | ⬜ Pending |
| KAN-164 | UAT: E2E volunteer journey | Grace | ⬜ Pending |
| KAN-165 | Documentation: Project report | Nurain | ⬜ Pending |
| KAN-166 | Documentation: User manual | Nurain | ⬜ Pending |
| KAN-167 | APK-TEST-03: Rewards + QR | Nurain | ⬜ Pending |
| KAN-168 | APK-TEST-04: Profile + settings | Nurain | ⬜ Pending |
| KAN-169 | UAT: Merchant flows | Nurain | ⬜ Pending |
| KAN-170 | Documentation: Sprint report | Nurain | ⬜ Pending |
| KAN-171 | Presentation slides | Nurain | ⬜ Pending |
| — | AI/LLM Gen 2 (FreeLLMAPI + ai.service) | Xon | ✅ Done |
| — | Merchant Dashboard (backend + frontend) | Grace | 🔄 Awaiting commit |

---

**Board:** https://fengshui0011.atlassian.net/jira/software/projects/KAN/boards/2

---

*— End of Sprint 5 Schedule v6.0 —*
