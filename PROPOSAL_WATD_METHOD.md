# Proposal: Adopting the WATD Method for Volunteering Rewards App

**To:** Supervisor
**From:** Xon (Team Lead / Architecture)
**Date:** May 15, 2026
**Re:** Team restructure proposal — concentrated code generation with WATD hybrid

---

## Executive Summary

In response to your concern that some team members are under-contributing and your suggestion to restructure into a 2-frontend / 2-backend split, I propose adopting a **WATD-based hybrid model** with a **concentrated code generation approach**. This model preserves your goal of clear accountability while avoiding the significant integration risks that come with splitting backend work between two people using AI-assisted coding. It also accelerates our timeline — targeting **completion by July 2026** instead of August.

---

## What Is the WATD Method?

WATD is a software development collaboration model designed for AI-assisted capstone teams. It stands for:

| Letter | Role | Responsibility |
|--------|------|---------------|
| **W** | Workflow & Architecture | System design, API contracts, technical decisions |
| **A** | Audit & Security | Code review, vulnerability checks, secure coding |
| **T** | Testing & Integration | Test suite, integration validation, quality gates |
| **D** | Deployment & Presentation | CI/CD, demos, documentation, stakeholder comms |

The core philosophy: **every member is a leader of one engineering governance domain while contributing to all others.** This prevents passive participation — a key concern you raised.

---

## The Problem with 2 Frontend / 2 Backend

While splitting into frontend and backend pairs seems logical, for an AI-assisted project it introduces a serious risk:

| Risk | What Happens |
|------|-------------|
| **Two incompatible backends** | Two members independently prompt AI tools to generate backend code. Different AI models produce different folder structures, naming conventions, and API patterns. Neither backend connects to the other. |
| **No one can debug the other's code** | AI-generated code is unfamiliar even to the person who prompted it. Asking one member to debug the other member's AI-generated backend code is nearly impossible. |
| **Integration becomes a crisis** | With no dedicated integration owner, both assume "it's the other person's problem." Integration gets pushed to the final sprint, where it fails. |
| **No code quality gate** | AI code goes straight into the project without review, testing, or security checks. Bugs and vulnerabilities compound across sprints. |

**The fundamental issue:** Backend is a single logical layer. Splitting it between two people using AI multiplies inconsistency faster than two human developers would, because neither person builds a mental model of the other's generated code.

---

## Proposed Solution: Lighter WATD Hybrid + Concentrated Generation

We propose two changes to the original project plan:

### 1. Replace incremental builds with concentrated code generation

Instead of building feature by feature across 5 sprints, we **generate all code in one concentrated push** (1 week) against frozen API contracts. The remaining time is spent on integration, testing, and hardening — where the real effort lies.

**Why this works for AI-assisted development:**
- AI generates code much faster than humans, so the bottleneck is not writing code but *making it work together*
- Generating everything against one set of contracts reduces inconsistency
- A week of intensive parallel generation produces a complete codebase that then gets refined

### 2. Role Assignments

| Person | Primary Role | Also Owns | Why This Works |
|--------|-------------|-----------|----------------|
| **Xon** | Architecture & API Contracts | Deployment pipeline | Frozen contracts prevent drift; you define shapes before anyone prompts AI |
| **B** | Backend Modules | Security Review (all PRs) | Single backend owner = zero integration chaos |
| **C** | Frontend Modules | Testing & Integration | Dedicated integration prevents "it works on my machine" |
| **D** | Frontend Modules | Presentation & Docs | Two people on frontend as requested; owns the sprint demo deliverable |

### Key Differences from 2+2 Split

| Aspect | 2 Frontend / 2 Backend | WATD Hybrid |
|--------|----------------------|-------------|
| Backend owners | 2 people (integration risk) | 1 person (clean ownership) |
| Testing | Each person tests their own | Dedicated tester + integration owner |
| Security reviews | None | Mandatory before every merge |
| Code review | Optional | Two approvals required per PR |
| Shared code knowledge | Low | Everyone reads PRs outside their lane |
| Timeline | August 10 | **July 6** |

### The Critical Rule

**Every PR requires two approvals before merge:**
1. A **domain peer** (code quality and correctness)
2. **Member C** (integration — does this break existing modules?)

This forces every member to read code outside their primary domain, building shared codebase knowledge without the overhead of a full cross-assistance matrix.

---

## How This Ensures Every Member Contributes

A concern was raised that some members are not contributing enough. Under this model, each person produces **concrete, auditable deliverables every sprint**:

| Member | Sprint Deliverables (Examples) |
|--------|-------------------------------|
| **Xon** | API contracts, DB migrations, CI/CD pipeline, repo architecture |
| **B** | All backend endpoints, database tables, security audit reports |
| **C** | All volunteer mobile screens, test suite, integration status reports |
| **D** | Organiser portal, admin portal, scanning/merchant apps, presentation slides |

No one can "hide" — each person's work is visible in the repo as commits, PRs, and test results.

---

## Revised Timeline: July Completion (7 Weeks)

Total project duration is **7 weeks** (from May 18 to July 6), saving approximately 5 weeks from the original August 10 finish.

```
May 18 ──── Sprint 2: Code Generation ──── May 25
  (1 week — all code generated in parallel against frozen contracts)

May 25 ──── Sprint 3: Integration ──── Jun 8
  (2 weeks — connect frontend to backend, fix contract drift)

Jun 8 ──── Sprint 4: Hardening ──── Jun 22
  (2 weeks — full test suite, security audit, edge cases)

Jun 22 ──── Sprint 5: Delivery ──── Jul 6
  (2 weeks — polish, presentation, user manual, final demo)
```

### Sprint 2: Code Generation (May 18–25)

All four members generate code in parallel against the API contracts:

| Member | What They Generate |
|--------|-------------------|
| **Xon** | Repo scaffold, DB migrations, auth middleware, CI/CD, Docker config |
| **B** | All ~45 API endpoints (auth, events, attendance, rewards, coupons, admin, merchant) |
| **C** | All volunteer mobile screens (10 screens covering registration through rewards redemption) |
| **D** | Organiser portal (8 pages), admin portal (11 pages), scanning app, merchant app |

### Sprint 3: Integration (May 25 – Jun 8)

Connect frontend to backend. Fix field name mismatches, data type issues, and any missing endpoints discovered during connection. End-to-end flow verification for all user journeys.

### Sprint 4: Hardening (Jun 8–22)

Comprehensive testing, security audit, edge case handling, bug fixes. Target >70% test coverage.

### Sprint 5: Delivery (Jun 22 – Jul 6)

UI polish, final deployment, user manual, presentation slides, demo rehearsal.

---

## Comparison Summary

| Factor | Current Plan | 2 Frontend / 2 Backend | Full WATD | This Hybrid |
|--------|-------------|----------------------|-----------|-------------|
| Integration risk | Moderate | **High** | Low | **Low** |
| Clear accountability | Moderate | High | High | **High** |
| Learning curve | None | Low | High | **Low** |
| Process overhead | Low | Low | High | **Moderate** |
| Supervisor visibility | Low | High | High | **High** |
| AI code governance | None | None | Built-in | **Built-in** |
| Shared code exposure | Low | Low | High | **Moderate** |
| Completion date | **August 10** | August 10 | — | **July 6** |

---

## Conclusion

This proposal combines two ideas: the **WATD hybrid** for team accountability, and **concentrated code generation** for speed. Every member codes every sprint with clear, auditable deliverables. The integration problems of 2 frontend / 2 backend are avoided by having one backend owner and a dedicated integration gate. And the revised timeline delivers a working system by **July 2026** — approximately 5 weeks faster than the original plan.

I request your approval to adopt this structure starting immediately.
