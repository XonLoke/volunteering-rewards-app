# Sprint 5 Schedule — Final Testing, Documentation & APK Build

**Version:** 1.0
**Date:** 29 June 2026
**Project:** Volunteering Rewards App (C3000C)
**Sprint:** 29 Jun – 6 Jul 2026
**Status:** Sprint Started ✅

---

## 1. Sprint Overview

Sprint 5 focuses on wrapping up all remaining work:
- ✅ **Deployment is already complete** (done early)
- ⬜ **Team testing tasks** — security, integration, UAT
- ⬜ **Documentation** — report, slides, user manual
- ⬜ **Native APK build** — local Android SDK setup (new)

### Key Milestones

| Date | Milestone | Owner |
|------|-----------|-------|
| **29 Jun (Mon)** | Sprint 5 kickoff — set up Android SDK (KAN-148 → 149) | Xon |
| **30 Jun (Tue)** | Build APK + tag v1.1.0 release | Xon |
| **1 Jul (Wed)** | CI coverage & test DB (KAN-150 → 151); UAT-01/02/03 (KAN-140) | Xon |
| **2 Jul (Thu)** | Security tests (Vivian), Integration tests (Grace), UAT-04/05/06 | Team |
| **3 Jul (Fri)** | UAT-07/08; System tests; Sprint 5 close review | Team |
| **4 Jul (Sat)** | 🎤 **Dry-run presentation** (KAN-144) | All |
| **5 Jul (Sun)** | Project report (KAN-141), slides (KAN-142), user manual (KAN-143) due | Nurain |
| **6 Jul (Mon)** | Final review & handover | All |
| **Aug 2026** | **Final delivery** (presentation + submission) (KAN-145) | All |

---

## 2. Task Assignments & Schedule

### Xon — CI/APK/Technical (6 tasks — KAN-148, 149, 150, 151, 140, 122)

| Day | Task | Jira | Est. Time | Deliverable |
|-----|------|------|-----------|-------------|
| **29 Jun (Mon)** | Install JDK 17+ & Android SDK command-line tools | KAN-148 | 35 min | SDK ready |
| **29 Jun (Mon)** | Accept Android licenses, create local.properties | KAN-148 | 10 min | `local.properties` |
| **29 Jun (Mon)** | Pin AGP version to known-stable in `android/build.gradle` | KAN-148 | 10 min | Gradle config |
| **29 Jun (Mon)** | Run `npx expo run:android` — first local APK build | KAN-149 | 30 min | Debug APK |
| **30 Jun (Tue)** | Fix any local build errors | KAN-149 | 60 min | Working debug APK |
| **30 Jun (Tue)** | Generate signed APK via `eas build --platform android --local` | KAN-149 | 15 min | Signed APK |
| **30 Jun (Tue)** | Tag v1.1.0 release on GitHub with APK asset | KAN-149 | 10 min | GitHub release |
| **1 Jul (Wed)** | **Tech-1:** CI coverage reporting in `.github/workflows/ci.yml` | KAN-150 | 30 min | Coverage in CI |
| **1 Jul (Wed)** | **Tech-2:** PostgreSQL service container for CI tests | KAN-151 | 30 min | CI integration DB |
| **1 Jul (Wed)** | **UAT-01:** Admin Onboards Organiser | KAN-140 | 15 min | UAT result |
| **1 Jul (Wed)** | **UAT-02:** Admin Manages Coupons | KAN-140 | 15 min | UAT result |
| **1 Jul (Wed)** | **UAT-03:** Admin Configures Rewards | KAN-140 | 10 min | UAT result |

### Vivian — Security Tests (KAN-152) & UAT

| Day | Task | Jira | Est. Time | Deliverable |
|-----|------|------|-----------|-------------|
| **2 Jul (Thu)** | Security tests: 12 cases (JWT expiry, SQL injection, XSS, rate limiting, role guards) | KAN-152 | 3 hr | Security test report |
| **2 Jul (Thu)** | **UAT-04:** Volunteer Browses & Joins Events | KAN-140 | 20 min | UAT result |
| **3 Jul (Fri)** | **UAT-07:** Organiser Manages Events (with Nurain) | KAN-140 | 20 min | UAT result |
| **3 Jul (Fri)** | Retest any bugs found | — | 30 min | Bug fixes verified |

### Grace — Integration Tests (KAN-138 ✅) & UAT

| Day | Task | Jira | Est. Time | Deliverable |
|-----|------|------|-----------|-------------|
| **✅ Done** | Integration tests: 34 cases — already completed | KAN-138 | — | ✅ Done in Jira |
| **2 Jul (Thu)** | **UAT-05:** Volunteer Redeems Rewards | KAN-140 | 15 min | UAT result |
| **2 Jul (Thu)** | **UAT-06:** Merchant Verifies PIN | KAN-140 | 15 min | UAT result |

### Nurain — Documentation & UAT (KAN-141, 142, 143 + UAT)

| Day | Task | Jira | Est. Time | Deliverable |
|-----|------|------|-----------|-------------|
| **1 Jul (Wed)** | Start project report from C300 Report Template | KAN-141 | 3 hr | Draft report |
| **2 Jul (Thu)** | Continue report + work on presentation slides | KAN-141/142 | 3 hr | Report draft v2 + slide deck |
| **3 Jul (Fri)** | **UAT-07:** Organiser Manages Events (with Vivian) | KAN-140 | 20 min | UAT result |
| **3 Jul (Fri)** | **UAT-08:** Role-Based Access Control | KAN-140 | 10 min | UAT result |
| **4 Jul (Sat)** | Finalize slides for dry-run | KAN-142 | 2 hr | Slides v1 |
| **5 Jul (Sun)** | Complete user manual | KAN-143 | 2 hr | User manual v1 |

### Whole Team — System Tests (KAN-139 ✅) & Dry-Run

| Day | Task | Owner | Est. Time |
|-----|------|-------|-----------|
| **✅ Done** | System tests: 6 E2E workflows — already completed | Xon Loke | ✅ Done in Jira |
| **3 Jul (Fri)** | Retest any E2E issues if needed | All | 1 hr |
| **4 Jul (Sat)** | 🎤 **Dry-run presentation** | All | 2 hr |
| **6 Jul (Mon)** | Sprint close — incorporate dry-run feedback | All | 1 hr |

---

## 3. UAT Assignment Summary

| ID | Scenario | Owner | Portal | Est. Time |
|----|----------|-------|--------|-----------|
| UAT-01 | Admin Onboards Organiser | Xon | Admin | 15 min |
| UAT-02 | Admin Manages Coupons | Xon | Admin | 15 min |
| UAT-03 | Admin Configures Rewards | Xon | Admin | 10 min |
| UAT-04 | Volunteer Browses & Joins Events | Vivian | Volunteer PWA | 20 min |
| UAT-05 | Volunteer Redeems Rewards | Grace | Volunteer PWA | 15 min |
| UAT-06 | Merchant Verifies PIN | Grace | Merchant | 15 min |
| UAT-07 | Organiser Manages Events | Vivian / Nurain | Organiser | 20 min |
| UAT-08 | Role-Based Access Control | Nurain | All portals | 10 min |

---

## 4. New: Native APK Build Timeline

| Step | Description | Est. Time | Day |
|------|-------------|-----------|-----|
| 1 | Install JDK 17+ | 15 min | 29 Jun |
| 2 | Install Android SDK cmdline-tools | 20 min | 29 Jun |
| 3 | Accept licenses, create `local.properties` | 10 min | 29 Jun |
| 4 | Pin AGP to known-stable version in Gradle | 10 min | 29 Jun |
| 5 | `npx expo run:android` — attempt local build | 30 min | 29 Jun |
| 6 | Fix any build errors | 60 min | 30 Jun |
| 7 | Generate signed APK via `eas build --local` | 15 min | 30 Jun |
| 8 | Distribute APK to team; tag GitHub release v1.1.0 | 10 min | 30 Jun |

**Timebox:** Half a day (29–30 Jun). If local build fails after 4 hours of troubleshooting, triage and push to backlog — the PWA is the primary delivery.

---

## 5. Risk Table

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Local Android SDK setup fails (missing deps, Windows path issues) | Medium | High — delays APK | Timebox to 4 hours; PWA is primary fallback |
| AGP version pin doesn't resolve the Expo build bug | Medium | High — can't build APK | Try older Expo SDK or `expo prebuild` + manual Gradle |
| Team members don't complete UAT on time | Medium | Medium — missing test coverage | Xon covers any unassigned UAT as backup |
| Dry-run reveals major presentation gaps | Low | Medium — rework slides | Schedule 2 hr buffer on 5 Jul for fixes |

---

## 6. Current Progress Snapshot

| Area | Completion | Owner |
|------|-----------|-------|
| ✅ Backend API | 100% | Xon |
| ✅ All Portals Deployed | 100% | Xon |
| ✅ PWA Live | 100% | Xon |
| ✅ Xon's Tasks | 100% (24/24) | Xon |
| ⬜ Native APK Build | 0% (0/8 steps) | **Xon — new** |
| ⬜ CI Coverage & Test DB | 0% (0/2) | **Xon — new** |
| ⬜ Security Tests | 0% (0/12 cases) | Vivian |
| ✅ Integration Tests | **100% (34/34)** — already done | **Grace** |
| ✅ System Tests (E2E) | **100% (6/6)** — already done | **Xon** |
| ⬜ UAT Scenarios | 0% (0/8) | Team |
| ⬜ Project Report | 0% | Nurain |
| ⬜ Presentation Slides | 0% | Nurain |
| ⬜ User Manual | 0% | Nurain |
| ⬜ Dry-Run | 0% | All |
| 🏁 Final Delivery | 0% | All |

---

## 7. Jira Issue Reference — Sprint 5 (Epic: KAN-124)

| Key | Task | Owner | Status | Linked to Epic |
|-----|------|-------|--------|:-------------:|
| KAN-148 | APK-BUILD-v1: Install JDK 17+ & Android SDK | Xon Loke | To Do | ✅ |
| KAN-149 | APK-BUILD-v2: Build native APK locally | Xon Loke | To Do | ✅ |
| KAN-150 | CI-COVERAGE-v1: Test coverage reporting (Tech-1) | Xon Loke | To Do | ✅ |
| KAN-151 | CI-TESTDB-v1: PostgreSQL test database in CI (Tech-2) | Xon Loke | To Do | ✅ |
| KAN-122 | MOBILE-EAS-BLOCKED: Expo EAS build failure | Xon Loke | To Do | ✅ |
| KAN-140 | User Acceptance Tests (8 scenarios) | Xon Loke | To Do | ✅ |
| KAN-141 | Project report from C300 Report Template | Nur Ain | To Do | ✅ |
| KAN-142 | Presentation slides | Nur Ain | To Do | ✅ |
| KAN-143 | User manual — step-by-step for all roles | Nur Ain | To Do | ✅ |
| KAN-144 | Dry-run presentation + team feedback | Xon Loke | To Do | ✅ |
| KAN-145 | Final delivery | Xon Loke | To Do | ✅ |
| KAN-152 | SEC-TESTS-v1: Security tests (12 cases — JWT expiry, SQL injection, XSS, rate limiting, role guards) | Vivian Koh | To Do | ✅ |

**Board:** `https://fengshui0011.atlassian.net/jira/software/projects/KAN/boards/2`

---

*End of Sprint 5 Schedule v1.0*
