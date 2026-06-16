# Sprint Breakdown v7.2 — Final Version

**Version:** 7.2  
**Date:** 8 June 2026 (Updated — Added Hall of Fame Leaderboard)  
**Project:** Volunteering Rewards App (C3000C)  
**Timeline:** May 7 – July 6, 2026 (9 weeks)  

---

## Rationale for Changes

Following the supervisor meeting on 4 June, two key directives require schedule adjustments:

1. **Comprehensive Test Plan** — Must include test case specs (unit, integration, system, UAT, security, performance) with documented results for the project report appendix.
2. **AI / Unique Features** — Encouraged for higher marks as individual contributions, not team efforts (per supervisor confirmation).

**Resource allocation note:** All other team members (Vivian, Grace, Nurain) have full-time day jobs and cannot take on additional feature development beyond their core Sprint 4-5 testing responsibilities. **Xon (John)** — who is currently between jobs — will take sole responsibility for designing, building, and documenting all additional features alongside his existing testing and deployment duties.

---

## Updated Sprint Overview

| Sprint | Dates | Focus |
|--------|-------|-------|
| **Sprint 3** | 1 Jun – 15 Jun | Frontend Completion + Integration |
| **Sprint 4** | 15 Jun – 29 Jun | **Comprehensive Testing (Team)** + **Additional Features (Xon only)** |
| **Sprint 5** | 29 Jun – 6 Jul | Deployment & Delivery + Feature Frontend Completion |

> **No date changes.** The original final delivery date of 6 Jul remains unchanged.

---

## Sprint 3 *(1 Jun – 15 Jun)* — Unchanged

| Member | Focus |
|--------|-------|
| **Xon** | Test Plan, unit tests, testing guide, Jira update (all ✅ done). Assist blocked members. |
| **Vivian** | Complete organiser QR scanner PWA. Wire mobile screens to live API. |
| **Grace** | Complete cashier PIN PWA. Wire merchant pages. |
| **Nurain** | Complete organiser portal wiring. Document upload. Pending approval page. |

---

## Sprint 4 *(15 Jun – 29 Jun)*

### Primary: Test Plan Execution (Whole Team)

| Test Type | Owner | Deliverable |
|-----------|-------|-------------|
| **Integration Tests** (34 tests) | Grace + Xon | Test each API endpoint with real database queries. Verify correct response shapes & error codes. |
| **System Tests** (6 tests) | Whole team | End-to-end workflow tests for all 4 portals. |
| **User Acceptance Tests** (8 tests) | Whole team | Real-world scenarios, documented with step-by-step pass/fail. |
| **Security Tests** (12 tests) | Vivian + Xon | Role guards, SQL injection, JWT expiry, rate limiting, brute force. |
| **Performance Tests** (8 tests) | Xon | API response times under load, DB query performance, pagination. |

### Sprint 3 Carry-Over Buffer
- If Vivian's QR scanner PWA or Grace's cashier PWA are not complete by 15 Jun, they are finished here using virtual teammates if needed.

---

### Secondary: Additional Features (Xon Only)

*All other team members are not assigned any feature development — they focus solely on testing and their day jobs.*

| # | Feature | Type | Est. Time | Description |
|---|---------|------|-----------|-------------|
| F1 | **AI Event Recommendations** | Content-based filtering algorithm | 3 days | Recommends events to volunteers based on their past participation history using weighted category scoring. No LLM or external API needed — pure Node.js + PostgreSQL algorithm. |
| F2 | **AI Feedback Summarizer** | Lexicon-based sentiment analysis | 3 days | Auto-summarizes volunteer feedback using keyword sentiment analysis. No LLM or external API needed — pure string processing. |
| F3 | **Volunteer Referral Program** | Database + business logic | 5 days | Multi-level referral system: referral codes, upline/downline tracking (2 tiers), bonus points for successful referrals. New DB migration+API+UI. |
| F4 | **Hall of Fame Leaderboard** | Gamification / SQL ranking | 2 days | Top 3 volunteers by points earned, events attended, check-ins, and points redeemed. Podium display with gold/silver/bronze. No schema changes needed. |

**Total estimated effort for Xon:** ~13 days across Sprint 4-5, built in parallel with testing responsibilities.

**Build order:** F1 (Recommendations) → F4 (Hall of Fame) → F3 (Referral) → F2 (Summarizer), time permitting.

---

## Sprint 5 *(29 Jun – 6 Jul)* — Deployment & Delivery

| Member | Focus |
|--------|-------|
| **Xon** | Backend deployment (Render/Railway). Complete any remaining feature frontend work (Referral UI, Summarizer UI). README, final API docs. |
| **Vivian** | Pre-deployment security scan, secrets audit, deployment security verification. |
| **Grace** | Frontend deployment (Vercel). Final E2E test pass. Spill-over buffer for unfinished Sprint 4 testing. |
| **Nurain** | Presentation slides. Demo script + walkthrough. User manual finalised. **Project report (with test results appendix + feature documentation).** |

---

## Additional Features — Technical Summary for Report

### F1: AI Event Recommendations
| Aspect | Detail |
|--------|--------|
| **Type** | Content-based filtering / weighted category scoring |
| **Infrastructure** | Existing Node.js + PostgreSQL — no external services |
| **Algorithm** | Count volunteer's past event categories → score upcoming events by category match → rank by relevance |
| **Report terminology** | Preference vector, weighted scoring, category affinity model |

### F2: AI Feedback Summarizer
| Aspect | Detail |
|--------|--------|
| **Type** | Lexicon-based sentiment analysis / keyword extraction |
| **Infrastructure** | Existing Node.js — no external services |
| **Algorithm** | Tokenize feedback → count positive/negative keyword matches → detect suggestion phrases → generate structured summary |
| **Report terminology** | Tokenisation, polarity scoring, pattern matching, sentiment lexicon |

### F3: Volunteer Referral Program
| Aspect | Detail |
|--------|--------|
| **Type** | Multi-level referral DAG with points incentive |
| **Infrastructure** | Existing PostgreSQL + Node.js — new migration required |
| **Algorithm** | Referral code generation → uplink tracking at registration → points awarded on downline attendance (2-tier) |
| **Report terminology** | Directed acyclic graph, two-tier weighted incentive, viral coefficient |

---

## Key Deadlines

| Date | Milestone |
|------|-----------|
| **8 Jun** | Mid-sprint check: each person demos 2 working screens |
| **15 Jun** | Sprint 3 ends. Test Plan + unit tests complete (✅ done). |
| **22 Jun** | Sprint 4 mid-point: integration tests complete. AI Event Recommendations functional. |
| **29 Jun** | Sprint 4 ends: all test types complete with documented results. Referral program backend done. |
| **4 Jul** | Dry-run presentation for team feedback. All features complete. |
| **6 Jul** | **FINAL DELIVERY** — Presentation, report, demo, deployment |
