# Sprint 5 Schedule

**Final Testing, Documentation & APK Build (V5)**

| | |
|---|---|
| **Project** | Volunteering Rewards App (C3000C) |
| **Sprint** | 29 Jun – 6 Jul 2026 |
| **Version** | 5.0 |
| **Status** | 🟢 PWA-APK Unification ✅ — All Xon tasks complete. Team testing phase. |

---

## 1. Sprint Overview

Sprint 5 focuses on wrapping up all remaining work:

- ✅ Deployment already complete (done early)
- ✅ APK Build complete (app-release.apk generated, 83 MB)
- ✅ PWA-APK Unification executed (PWA now matches APK)
- ✅ Responsive design fixes (Merchant, Scanner, Volunteer PWA)
- ✅ Old PWA URL replaced across 18 docs
- ✅ Jira updated (KAN-157/148/149/150/153 → Done)
- ✅ Sprint4_conclusion.md, Test Plan v2.1, Testing Guide v1.2 created
- ⬜ APK Testing on real device
- ⬜ Team testing tasks — security, integration, UAT
- ⬜ Documentation — report, slides, user manual

### Key Milestones

| Date | Milestone | Owner |
|---|---|---|
| 29 Jun (Mon) | Sprint 5 kickoff | All |
| 29 Jun | ✅ APK Build Complete | Xon |
| 29 Jun | ✅ CI Build Passing on GitHub Actions | Xon |
| 29 Jun | PWA-APK Unification Plan drafted | Xon |
| 30 Jun (Tue) | ✅ PWA-APK Unification Executed (PWA matches APK) | Xon |
| 30 Jun | ✅ Responsive design fixes (Merchant/Scanner/PWA) | Xon |
| 30 Jun | ✅ URL updated across 18 docs | Xon |
| 1 Jul (Wed) | APK testing starts on real devices | Vivian, Nurain |
| 3 Jul (Fri) | Security, integration, UAT tests complete | All |
| 5 Jul (Sun) | Documentation complete | Nurain |
| 6 Jul (Mon) | Sprint 5 dry-run & handover | All |

---

## 2. Task Assignments & Schedule

### Xon — PWA-APK Unification + Responsive Fixes (ALL DONE)

| Date | Task | Jira | Est. Time | Status |
|---|---|---|---|---|
| 29 Jun | Install JDK 17+ & Android SDK | KAN-148 | 35 min | ✅ Done |
| 29 Jun | Configure Android SDK environment | KAN-148 | 20 min | ✅ Done |
| 29 Jun | Fix MAX_PATH / newArchEnabled=false | KAN-148 | 15 min | ✅ Done |
| 29 Jun | Install missing Expo packages | KAN-148 | 10 min | ✅ Done |
| 29 Jun | Fix @/ path alias → relative imports (23 files) | KAN-149 | 45 min | ✅ Done |
| 29 Jun | Fix template literal breakage in events.tsx | KAN-149 | 10 min | ✅ Done |
| 29 Jun | Local build: ./gradlew assembleRelease | KAN-150 | 35 min | ✅ Done |
| 29 Jun | SDK 52→54 upgrade + CI workflow fix | KAN-153 | 60 min | ✅ Done |
| 30 Jun | **KAN-157 Phase 1: Add web deps + test web export** | KAN-157 | 20 min | ✅ Done |
| 30 Jun | **KAN-157 Phase 2: Set EXPO_PUBLIC_API_URL on Vercel** | KAN-157 | 15 min | ✅ Done |
| 30 Jun | **KAN-157 Phase 3: Reconfigure Vercel root dir + deploy** | KAN-157 | 15 min | ✅ Done |
| 30 Jun | **KAN-157 Verification: Smoke test PWA + APK** | KAN-157 | 30 min | ✅ Done |
| 30 Jun | **Bug fixes: import paths, syntax errors in 23 .tsx files** | KAN-157 | 45 min | ✅ Done |
| 30 Jun | **Responsive: Merchant login + PinVerify — position:fixed, fluid card** | — | 30 min | ✅ Done |
| 30 Jun | **Responsive: Scanner login + scanner layout** | — | 20 min | ✅ Done |
| 30 Jun | **Responsive: Volunteer PWA landing — RF scaling, native scroll** | — | 30 min | ✅ Done |
| 30 Jun | **Docs: Sprint4_conclusion, Test Plan v2.1, Testing Guide v1.2** | — | 45 min | ✅ Done |
| 30 Jun | **Jira update: KAN-157/150/153 → Done** | — | 10 min | ✅ Done |
| 30 Jun | **Old URL replaced across 18 documents** | — | 10 min | ✅ Done |
| 30 Jun | **Sprint Schedule v4 → v5** | — | 10 min | ✅ Done |
| 30 Jun | UAT participation — logging into all portals to verify | KAN-155 | 60 min | 🔄 In Progress |

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

### Grace — Integration Tests & UAT

| Date | Task | Jira | Est. Time | Status |
|---|---|---|---|---|
| 30 Jun–1 Jul | Integration test: API endpoints (events, auth, rewards) | KAN-162 | 45 min | ⬜ Pending |
| 1 Jul | Integration test: QR scanning flow | KAN-163 | 45 min | ⬜ Pending |
| 2 Jul | UAT: End-to-end volunteer journey | KAN-164 | 60 min | ⬜ Pending |
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

## 3. PWA-APK Unification — DONE ✅

> ✅ All 3 phases completed on 30 Jun. The Vercel PWA now shows Vivian's tab-based GUI.

**Plan reference:** `docs/PWA-APK-Unification-Plan-v1.md`

### Phase 1: Prepare for Web Build (Xon) ✅

| # | Task | Est. Time | Done? |
|---|---|---|---|
| PWA-01 | Install react-dom, react-native-web, @expo/metro-runtime in frontend/mobile_app/ | 5 min | ✅ |
| PWA-02 | Test web export: `npx expo export --platform web` | 15 min | ✅ |

### Phase 2: Fix API Base URL (Xon) ✅

| # | Task | Est. Time | Done? |
|---|---|---|---|
| PWA-03 | Set `EXPO_PUBLIC_API_URL=https://vol-rewards-api.onrender.com/api` in Vercel env vars | 5 min | ✅ |
| PWA-04 | Verify API works (login, events load) against production backend | 10 min | ✅ |

### Phase 3: Reconfigure Vercel (Xon) ✅

| # | Task | Est. Time | Done? |
|---|---|---|---|
| PWA-05 | Change Vercel Root Directory → frontend/mobile_app | 5 min | ✅ |
| PWA-06 | Set Build Command → `npx expo export --platform web` | 2 min | ✅ |
| PWA-07 | Set Output Directory → `dist` | 2 min | ✅ |
| PWA-08 | Deploy and verify PWA shows tab-based GUI | 6 min | ✅ |

### Verification (Xon) ✅

| # | Check | Pass Criteria | Result |
|---|---|---|---|
| V-01 | PWA loads with tabs | Home, Events, Rewards, Profile bottom tabs visible | ✅ |
| V-02 | Auth flow works | Login with alice@test.com succeeds | ✅ |
| V-03 | API calls succeed | Events load, rewards load, no network errors | ✅ |
| V-04 | Deep links work | Direct URL /events, /profile resolve correctly | ✅ |
| V-05 | APK still works | Existing APK unaffected (no mobile_app source changes) | ✅ |

---

## 4. UAT & APK Testing Assignment Summary

| Assignee | Tasks | Platform | Deadline |
|---|---|---|---|
| Xon | ✅ All PWA-APK tasks done. UAT participation in progress | PWA + APK | 30 Jun |
| Vivian | APK-TEST-01 (install + auth), APK-TEST-02 (events) | APK | 1 Jul |
| Vivian | UAT: volunteer mobile + organiser flows | Web | 3 Jul |
| Nurain | APK-TEST-03 (rewards + QR), APK-TEST-04 (profile) | APK | 1 Jul |
| Nurain | Documentation: report, manual, slides | All | 5 Jul |
| Grace | Integration tests (API, QR) | Backend | 30 Jun–1 Jul |
| All | System walkthrough + dry-run | All | 5 Jul |

---

## 5. Risk Table

| Risk | Impact | Mitigation |
|---|---|---|
| APK testing finds critical bugs | Delays handover | Xon fixes ASAP; testers retest |
| Team member unavailable | Task slips | Reassign within team |
| Documentation incomplete | Poor submission quality | Daily check-ins on progress |

---

## 6. Current Progress Snapshot

| Area | Status | Notes |
|---|---|---|
| Backend API | ✅ Live | https://vol-rewards-api.onrender.com/api — health OK |
| Volunteer PWA | ✅ Live (updated) | https://volunteering-rewards-app.vercel.app — tab GUI ✅ |
| Native APK | ✅ Built (83 MB) | app-release.apk ready for testing |
| Web Portals (Admin) | ✅ Deployed | https://webportals-lovat.vercel.app |
| Web Portals (Organiser) | ✅ Deployed | https://webportals-lovat.vercel.app/organiser |
| CI Build | ✅ Passing | GitHub Actions build-apk.yml |
| Database | ✅ Connected | Supabase PostgreSQL 16 |
| Unit Tests | ✅ Passing | 40+ tests |
| Integration Tests | ⬜ Pending | Assigned to Grace |
| Security Tests | ⬜ Pending | Assigned to Vivian |
| APK Testing | ⬜ Pending | Vivian + Nurain (starts 1 Jul) |
| UAT | ⬜ Pending | All team members |
| Project Report | ⬜ In progress | Assigned to Nurain |
| User Manual | ⬜ Pending | Assigned to Nurain |
| Presentation Slides | ⬜ Pending | Assigned to Nurain |
| Sprint Handover | ⬜ Pending | Due 6 Jul |
| PWA-APK Unification | ✅ Done | KAN-157 complete 30 Jun |
| Responsive Design | ✅ Done | Merchant, Scanner, PWA landing |
| Sprint4 Conclusion | ✅ Created | docs/Sprint4_conclusion.md |
| Test Plan v2.1 | ✅ Created | docs/Test Plan & Case Spec v2.1.md |
| Testing Guide v1.2 | ✅ Created | docs/Testing Guide — Step by Step v1.2.md |

---

## 7. Jira Issue Reference — Sprint 5

| Issue | Description | Assignee | Status |
|---|---|---|---|
| KAN-148 | Set up Android build environment | Xon | ✅ Done |
| KAN-149 | Fix code issues for APK build | Xon | ✅ Done |
| KAN-150 | Local APK build | Xon | ✅ Done |
| KAN-153 | SDK upgrade + CI workflow | Xon | ✅ Done |
| **KAN-157** | **PWA-APK Unification** | **Xon** | **✅ Done** |
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

---

**Board:** https://fengshui0011.atlassian.net/jira/software/projects/KAN/boards/2

---

*— End of Sprint 5 Schedule v5.0 —*
