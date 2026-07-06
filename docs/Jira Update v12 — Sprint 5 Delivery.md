# Jira Update v12 — Sprint 5 Delivery & Security (EXECUTED ✅)

**Version:** 12
**Date:** 6 July 2026
**From:** Xon
**Method:** Jira REST API — directly applied
**Sprint:** Sprint 5 (29 Jun – 6 Jul 2026) — Final Delivery Day

---

## Summary of Changes Applied

| Action | Key | Summary | Status |
|--------|-----|---------|--------|
| ✅ Updated | KAN-7 | Sprint 5 Epic → In Progress | In Progress |
| ✅ Updated | KAN-102 | F2 Frontend: AI Summary card → Done | Done |
| ✅ Created | KAN-167 | APK Build: Install JDK 17+ & Android SDK | Done |
| ✅ Created | KAN-168 | APK Build: Fix @/ path aliases, template literals | Done |
| ✅ Created | KAN-169 | PWA-APK Unification: Phase 1-3 + Verification | Done |
| ✅ Created | KAN-170 | AI/LLM Gen 2: FreeLLMAPI integration + ai.service | Done |
| ✅ Created | KAN-171 | Merchant Dashboard: Backend + Frontend | Done |
| ✅ Created | KAN-172 | Admin Account Creation: Invite User modal + API | Done |
| ✅ Created | KAN-173 | System Verification: 91/91 tests, 18 endpoints, 5 portals | Done |
| ✅ Created | KAN-174 | Security Audit: 6 issues found and fixed | Done |
| ✅ Updated | KAN-171 | Merchant Dashboard — marked as backup build by Xon (Grace assigned but didn't deliver) | Done |
| ✅ Created | KAN-175 | Grace | Review Merchant Dashboard code built by Xon (post-deadline) | To Do |

---

## Issue Details

### KAN-7 — Sprint 5 Epic (Updated 🟡)
| Field | Value |
|-------|-------|
| **Summary** | Sprint 5 — Deployment & Delivery |
| **Old Status** | To Do |
| **New Status** | **In Progress** |

### KAN-102 — F2 Frontend: AI Summary ✅
| Field | Value |
|-------|-------|
| **Summary** | F2 Frontend: AI Summary sentiment card on organiser feedback page |
| **Old Status** | To Do |
| **New Status** | **Done** |
| **Description Updated** | AI Gen 2 deployed with FreeLLMAPI (Gemini 2.5 Flash) |

### KAN-167 — APK Build Setup ✅
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Labels** | sprint5, apk, build |

Install JDK 17+ and Android SDK. Configure ANDROID_HOME, fix MAX_PATH issue, set newArchEnabled=false. Result: APK builds successfully.

### KAN-168 — Fix Code for APK Build ✅
| Field | Value |
|-------|-------|
| **Priority** | High |

Fix 23 files with @/ path alias to relative imports. Fix template literal breakage. Add missing Expo packages. Fix registration crash.

### KAN-169 — PWA-APK Unification ✅
| Field | Value |
|-------|-------|
| **Priority** | High |

Phase 1: Add web deps. Phase 2: Set EXPO_PUBLIC_API_URL. Phase 3: Reconfigure Vercel. Result: PWA now matches APK tab-based GUI.

### KAN-170 — AI/LLM Gen 2 ✅
| Field | Value |
|-------|-------|
| **Priority** | Medium |

FreeLLMAPI + Gemini 2.5 Flash. ai.service.js with callLlm(), getAiRecommendations(), getAiFeedbackSummary(). AI-first with Gen1 fallback.

### KAN-171 — Merchant Dashboard ✅ (Backup Build by Xon)
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Note** | Grace originally assigned but did not deliver. Xon built as backup contingency. |

Backend: dashboard stats, products CRUD, redemptions. Frontend: sidebar layout, Dashboard, Products. Built and committed to main. Post-deadline: Grace to review code and take over maintenance (see KAN-175).

### KAN-172 — Admin Account Creation ✅
| Field | Value |
|-------|-------|
| **Priority** | High |

Removed one-click role toggle. Built POST /api/admin/users/create-account. Frontend InviteUserModal. 10/10 E2E tests passed.

### KAN-173 — System Verification ✅
| Field | Value |
|-------|-------|
| **Priority** | Medium |

91 unit tests passing. 18 API endpoints tested on production. 5 deployed portals verified. APK build (83MB) confirmed.

### KAN-174 — Security Audit ✅
| Field | Value |
|-------|-------|
| **Priority** | High |

6 issues fixed: debug endpoints protected, health endpoint sanitized, .env secrets removed, stack trace leak fixed, startup diagnostics guarded, weak PIN_SECRET replaced. 9 areas verified secure.

### KAN-175 — Grace: Review Merchant Dashboard (New 🆕)
| Field | Value |
|-------|-------|
| **Assignee** | Grace Pang |
| **Priority** | Medium |
| **Status** | To Do |
| **Labels** | merchant, review, post-sprint5 |

Grace was originally assigned to construct the Merchant Dashboard during Sprint 5 but did not deliver by deadline. Xon built a working backup which is deployed. After deadline, Grace needs to:
1. Review the current Merchant Dashboard code on `main`
2. Provide feedback or amendments
3. Take over ownership and future maintenance

---

## Sprint 5 Updated Status

| Area | Status | % Complete |
|------|--------|:----------:|
| APK Build | ✅ Done | 100% |
| APK Build Fixes | ✅ Done | 100% |
| PWA-APK Unification | ✅ Done | 100% |
| AI/LLM Gen 2 Features | ✅ Done | 100% |
| Merchant Dashboard | ✅ Built & Committed | 100% |
| Admin Account Creation | ✅ Done | 100% |
| System Verification | ✅ Done (91 tests, 18 endpoints) | 100% |
| Security Audit | ✅ Done (6 fixed, 9 verified) | 100% |
| All commits pushed to GitHub | ✅ Done | 100% |
| Deployment (Render) | ✅ Security fixes live | 100% |
| APK Testing (Vivian/Nurain) | ⬜ Pending | 0% |
| Team Testing (Grace/Vivian/Nurain) | ⬜ Pending | 0% |
| Documentation / Slides (Nurain) | ⬜ Pending | 0% |

---

## How to Verify

1. **Board:** https://fengshui0011.atlassian.net/jira/software/projects/KAN/boards/2
2. **GitHub:** https://github.com/XonLoke/volunteering-rewards-app (commit `c36af3c`)
3. **Sprint Status:** `docs/Sprint 5 Schedule v6.md`
4. **Security Report:** `docs/System Security Status Report v1.0.md`

---

*— End of Jira Update v12 (EXECUTED ✅ via REST API — 6 Jul 2026) —*
