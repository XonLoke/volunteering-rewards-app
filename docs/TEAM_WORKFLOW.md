# Team Workflow — Concentrated Generation Model

> **Purpose:** Clear role definitions, task distribution, and quality gates for the Volunteering Rewards App capstone project.
> **Target:** Complete by **July 2026** using a concentrated code generation approach.
> **Rationale:** Avoids the integration problems of a pure 2-frontend / 2-backend split while keeping every member accountable with measurable deliverables each sprint.

---

## Introducing the WATD Method

This project follows the **WATD Method** — a software development model designed for AI-assisted capstone teams:

1. **W**orkflow & Architecture lead
2. **A**udit & Security lead
3. **T**esting & Integration lead
4. **D**eployment & Presentation lead

In order to respond to our supervisor's concern and his suggestion for 2-frontend / 2-backend, we adopt a **lighter version of WATD** that keeps its key insight (shared code exposure + clear ownership) without the full cross-assistance matrix:

| Person | Primary | Also Owns |
|--------|---------|-----------|
| **Xon** | Architecture & API Contracts | Deployment pipeline |
| **Member B** | Backend modules | Security review of all PRs |
| **Member C** | Frontend modules | Testing framework + integration tests |
| **Member D** | Frontend modules | Presentation + docs |

**The critical rule:** Every PR requires two approvals — one from a domain peer (code quality) and one from Member C (integration doesn't break). This forces every member to read code outside their lane without the overhead of WATD's full assist matrix.

This way:
- Backend is owned by one person (no integration chaos from two independent backends)
- Frontend has two people but with one clear architecture (you define the API contracts)
- Testing is a dedicated role, not an afterthought
- Security reviews are mandatory before merge
- Everyone still reads each other's code through PR review

---

## Team Roles

| Person | Primary Role | Also Owns | Key Deliverables |
|--------|-------------|-----------|------------------|
| **Xon** | Architecture & API Contracts | Deployment pipeline | API contracts, architecture docs, CI/CD, repo structure |
| **Member B** | Backend Modules | Security Review (all PRs) | Database models, API endpoints, auth logic, security audit |
| **Member C** | Frontend Modules | Testing & Integration | Test suite, integration validation, PR quality gate |
| **Member D** | Frontend Modules | Presentation & Docs | UI screens, demo scripts, user manual, sprint presentations |

---

## Why Not Two Backend Developers?

The supervisor's suggestion of 2 frontend / 2 backend is a reasonable instinct, but for an AI-assisted capstone it creates a specific problem:

| Risk | With 2 Backend Developers | With This Hybrid |
|------|--------------------------|------------------|
| Inconsistent API patterns | Person A's AI generates REST, Person B's generates GraphQL — or different endpoint conventions | Single backend owner = consistent API style |
| Incompatible DB schemas | Two people independently define tables that may not relate correctly | One person owns all DB changes |
| Can't debug each other's code | Neither wrote the other's AI-generated code, and AI output is unfamiliar | Only one backend owner = full ownership and understanding |
| Merge conflicts on server code | Two people editing same routes, same models | No conflicts on backend files |
| No integration owner | Both assume "it's the other person's job" | Member C explicitly owns integration |

**Bottom line:** Backend is a single logical layer. Splitting it between two people with AI tools multiplies inconsistency faster than two human developers would because neither person has a mental model of the other's generated code. One backend owner + one integration validator is safer and faster.

---

## Project Timeline (May 18 – Jul 6)

Instead of building incrementally feature by feature across 5 sprints, we use a **concentrated generation** approach: generate all code in one push against frozen contracts, then spend the remaining sprints on integration, testing, and hardening.

**Total: 7 weeks to completion.**

```
SPRINT STRUCTURE
                  
May 18 ──── Sprint 2: Code Generation ──── May 25
  (One concentrated push — all code generated in parallel)
                  
May 25 ──── Sprint 3: Integration ──── Jun 8
  (Connect frontend ↔ backend, fix contract drift, first working build)
                  
Jun 8 ──── Sprint 4: Hardening ──── Jun 22
  (Testing, security audit, edge cases, bug fixes)
                  
Jun 22 ──── Sprint 5: Delivery ──── Jul 6
  (Polish, presentation, user manual, final demo)
```

---

## How Tasks Flow Per Sprint

### Sprint 2: Code Generation (May 18–25)

This is the most intensive week. All code is generated in parallel against the frozen API contracts (`API_CONTRACTS.md`).

```
Day 1 ──── Xon sets up repo structure, DB migrations, CI/CD
            Everyone else reviews API contracts one final time
      │
Day 2–4 ── Parallel code generation:
      │     ├── Xon: Backend scaffold + auth + deployment config
      │     ├── B: All backend endpoints (events, attendance, rewards, coupons, admin, merchant)
      │     ├── C: Volunteer mobile app (all 10 screens) 
      │     └── D: Organiser portal + admin portal + scanning apps
      │
Day 5 ──── First round of PR submissions + reviews
            Smoke test: can the frontend screens load?
      │
Day 6–7 ── Buffer for fixing generation issues
```

### Sprint 3: Integration (May 25 – Jun 8)

Connect everything. Fix all the places where AI-generated code doesn't match the contracts.

```
Week 1 ─── Connect each frontend screen to its backend endpoint
            Fix field name mismatches, data type issues, missing endpoints
            Each fix goes through PR review + integration gate + security gate
      │
Week 2 ─── Full end-to-end flow tests
            Volunteer: Register → Browse → Join → Scan → Points → Redeem
            Organiser: Login → Create event → View roster → Scan QR
            Admin: Login → Dashboard → Manage users → Issue coupons
            Merchant: Login → Verify PIN → Redeem → Reverse
```

### Sprint 4: Hardening (Jun 8–22)

```
Week 1 ─── Write comprehensive test suite
            Unit tests for critical business logic
            API integration tests (every endpoint at least one happy path + one error)
            Edge case testing (expired coupons, full events, invalid PINs)
      │
Week 2 ─── Security audit (Member B leads)
            Auth checks on every endpoint
            Input validation review
            Dependency vulnerability scan
            Rate limiting verification
            Bug fixes from test results
```

### Sprint 5: Delivery (Jun 22 – Jul 6)

```
Week 1 ─── UI polish and consistency pass
            Final integration smoke test
            Deployment to staging environment
            User manual draft
      │
Week 2 ─── Presentation slides and demo script
            Rehearse demo
            Final submission packaging
```

---

## PR Quality Gates

Every pull request must pass **all three** checks before merging:

### 1. Domain Review (by a domain peer)
- Code logic is correct
- Follows project conventions
- No obvious bugs or edge cases missed

### 2. Integration Gate (by Member C)
- Does not break existing tests
- API contract matches frontend expectations
- New module integrates cleanly with existing modules
- No duplicate functionality introduced

### 3. Security Gate (by Member B)
- No hardcoded secrets or credentials
- Input validation is present
- Auth checks are applied where needed
- Dependencies are safe (no known vulnerable packages)

---

## Sprint Deliverables Checklist

### Every Sprint, Each Member Produces:

| Member | Deliverable | Format |
|--------|------------|--------|
| **Xon** | Architecture decision log (what changed, why) | Markdown in repo |
| **B** | Security audit notes for merged PRs | Brief report |
| **C** | Test pass report + integration status | Brief report |
| **D** | Demo script + working demo environment | Slides + staging |

### Cross-Cutting Rule

Each member must review at least **one PR per sprint** that touches code outside their primary domain. This ensures shared codebase knowledge and prevents any single point of failure.

---

## Detailed Per-Sprint Tasks

### Sprint 2: Code Generation (May 18–25)

| Member | What to Generate |
|--------|-----------------|
| **Xon** | Repo scaffold, DB connection + migrations, JWT auth middleware, CI/CD (GitHub Actions), error handler middleware, deployment config (Dockerfile, env templates) |
| **B** | All API endpoints: Auth (register, login, profile), Events (CRUD + list + detail + categories), Attendance (scan, batch, roster, stats), Rewards (list, redeem, my coupons), Coupons (verify, redeem, reverse), Admin (dashboard, users, organisers, events, coupons, rewards config, redemptions) |
| **C** | Volunteer mobile app: Onboarding, Register, Login, Event Store, Event Detail, My Events, Check-in (QR display), QR & Points, Rewards (redeem online + PIN display), My Coupons. Test scaffolding (Jest + Supertest setup) |
| **D** | Organiser portal: Login, Dashboard, Events list, Event edit/create, Onsite controller, Feedback. Admin portal: Dashboard, Users, Organisers, Coupons, Rewards config, QR Codes, Redemptions, Events participation. Organiser scanning app: Event selector, QR scanner, Scan result, Attendance list. Merchant redemption app: PIN entry, Verification result, Redemption history |

### Sprint 3: Integration (May 25 – Jun 8)

| Member | What to Integrate |
|--------|------------------|
| **Xon** | Resolve contract drift; assist any member blocked on architecture questions |
| **B** | Fix backend bugs found during frontend connection; ensure all endpoints return the exact shapes in API_CONTRACTS.md |
| **C** | Connect volunteer mobile screens to live backend; fix field/response mismatches |
| **D** | Connect organiser + admin + scanning + merchant screens to live backend |

### Sprint 4: Hardening (Jun 8–22)

| Member | What to Harden |
|--------|---------------|
| **Xon** | Performance review; optimise slow queries |
| **B** | Security audit on every endpoint; auth bypass testing; dependency audit |
| **C** | Write full test suite; achieve >70% test coverage; test all error paths |
| **D** | Security audit on frontend (no exposed secrets); test all error screens |

### Sprint 5: Delivery (Jun 22 – Jul 6)

| Member | What to Deliver |
|--------|----------------|
| **Xon** | Final integration sign-off; deployment to staging; README |
| **B** | Final security audit report |
| **C** | Final test coverage report; end-to-end test pass |
| **D** | Presentation slides; demo walkthrough; user manual |

---

## Tools & Conventions

| Concern | Standard |
|---------|----------|
| API contracts | Frozen in `API_CONTRACTS.md` — do not modify without team agreement |
| Branch naming | `feature/<member>/<description>` (e.g. `feature/xon/db-migrations`) |
| PR approvals | Minimum 2 (domain peer + integration gate) |
| Test framework | Jest + Supertest (Node.js) |
| CI/CD | GitHub Actions (test runner on push, deploy on merge to main) |
| Security scanning | GitHub Dependabot + manual review by Member B |
| Database | PostgreSQL (migrations in `server/db/migrations/`) |

---

## Comparison: Current vs 2+2 vs WATD vs This Hybrid

| Factor | Current Split | 2 Frontend / 2 Backend | Full WATD | This Hybrid |
|--------|--------------|----------------------|-----------|-------------|
| Integration risk | Moderate | **High** (two backends) | Low | **Low** |
| Clear accountability | Moderate | High | High | **High** |
| Learning curve | None | Low | **High** | **Low** |
| Process overhead | Low | Low | **High** | **Moderate** |
| Supervisor visibility | Low | High | High | **High** |
| AI code governance | None | None | Built-in | **Built-in** |
| Shared code exposure | Low | Low | High | Moderate (via PR reviews) |
| Completion date | August 10 | August 10 | — | **July 6** |

---

## Presenting This to Your Supervisor

If your supervisor pushes back on "why not 2 frontend / 2 backend," the key argument is:

> *"Two people generating backend code with AI tools will produce two incompatible codebases that neither can debug. One backend owner + one dedicated integration tester produces higher-quality integration faster than two backend developers working independently. The frontend has two people as requested, and the architecture owner (me) ensures the API contracts are clear before anyone starts coding."*

Every member still codes every sprint — the difference is how work is **governed**, not how much work is done.
