# AI Development Guide — Volunteering Rewards App

> **Document Version:** 1.0
> **Last Updated:** 2 July 2026
> **Purpose:** Explain the AI features of the system, the logic behind them, and the methodology used to build them.

---

## Table of Contents

1. [Overview of AI Features](#1-overview-of-ai-features)
2. [AI Feature 1: Smart Event Recommendations](#2-ai-feature-1-smart-event-recommendations)
3. [AI Feature 2: "For You" AI Assistant](#3-ai-feature-2-for-you-ai-assistant)
4. [Development Methodology](#4-development-methodology)
5. [Code Reference Map](#5-code-reference-map)
6. [Comparison: AI-Powered vs Traditional Approach](#6-comparison-ai-powered-vs-traditional-approach)

---

## 1. Overview of AI Features

The system contains **two AI-powered features** designed to enhance the volunteer experience:

| Feature | What it does | Where | Type |
|---------|-------------|-------|------|
| **Smart Event Recommendations** | Suggests relevant events based on a volunteer's past participation history | Backend (`events.service.js`) | Content-based filtering engine |
| **"For You" AI Assistant** | Answers quick questions about recommended events (best match, most points, available slots) | Mobile App (`ai-recommendations.tsx`) | Client-side scoring engine |

Both features work together: the backend finds relevant events, and the frontend helps volunteers decide which one to join.

---

## 2. AI Feature 1: Smart Event Recommendations

### 2.1 Purpose

Recommend upcoming volunteering events that match a volunteer's interests, based on the categories of events they have attended in the past.

### 2.2 Algorithm: Content-Based Filtering

The recommendation engine uses **content-based filtering** — a classic information retrieval technique. It does **not** use machine learning models, external AI APIs, or collaborative filtering.

```
                    RECOMMENDATION PIPELINE

  INPUT:  Volunteer's user ID
  OUTPUT: Top 5 upcoming events ranked by relevance_score

  ┌─────────────────────────────────────────────────────────────┐
  │                         STEP 1                              │
  │              BUILD PREFERENCE PROFILE                       │
  │                                                             │
  │  For each category the volunteer has attended:              │
  │    → Count how many events attended in that category        │
  │    → This count becomes the category "weight"               │
  │                                                             │
  │  Example Profile:                                           │
  │    Environment:  5 events attended  ← highest interest      │
  │    Elderly:      3 events attended                          │
  │    Community:    1 event attended                           │
  │    Health:       0 events attended  ← no interest           │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │                         STEP 2                              │
  │              SCORE UPCOMING EVENTS                          │
  │                                                             │
  │  For each upcoming event:                                   │
  │    relevance_score = SUM of weights for matching categories │
  │                                                             │
  │  Example Scoring:                                           │
  │    "Beach Cleanup"  (Environment)  → score = 5              │
  │    "Elderly Walk"   (Elderly)      → score = 3              │
  │    "Food Drive"     (Community)    → score = 1              │
  │    "Health Clinic"  (Health)       → score = 0              │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │                         STEP 3                              │
  │              FILTER & SORT                                  │
  │                                                             │
  │  - Exclude events the volunteer already registered for      │
  │  - Only include future events with status 'upcoming'        │
  │  - Sort by relevance_score DESC, then event_date ASC        │
  │  - Return top N (default 5)                                 │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │                    FALLBACK (Cold Start)                    │
  │                                                             │
  │  If volunteer has NO attendance history (new user):         │
  │    → Return most popular upcoming events                    │
  │    → Popularity = number of registered volunteers           │
  │    → This solves the "cold start" problem                   │
  └─────────────────────────────────────────────────────────────┘
```

### 2.3 SQL Implementation

The entire recommendation engine is implemented as a **single parameterised SQL query** — no external libraries, no in-memory processing:

```sql
-- Step 1: Build preference profile
SELECT e.category, COUNT(*) AS weight
FROM event_registrations er
JOIN events e ON er.event_id = e.id
WHERE er.user_id = $1                    -- target volunteer
  AND e.event_date < NOW()               -- past events only
  AND e.category IS NOT NULL
GROUP BY e.category
ORDER BY weight DESC;

-- Step 2: If no history → return popular events
-- (separate query, sorted by registration count DESC)

-- Step 3: Score upcoming events using a dynamic CASE statement
-- (constructed in JavaScript from the preference profile)
SELECT
  e.id, e.title, e.description, e.points_value, e.category,
  COALESCE(reg.count, 0)::int AS registrations,
  CASE                                                    -- dynamic scoring
    WHEN e.category = 'Environment' THEN 5                -- weight from profile
    WHEN e.category = 'Elderly'     THEN 3
    WHEN e.category = 'Community'   THEN 1
    ELSE 0
  END::int AS relevance_score
FROM events e
LEFT JOIN event_registrations reg ON reg.event_id = e.id AND reg.status = 'registered'
WHERE e.event_date > NOW()
  AND e.status IN ('active', 'upcoming')
  AND e.id NOT IN (                                       -- exclude already registered
    SELECT er2.event_id FROM event_registrations er2
    WHERE er2.user_id = $1 AND er2.status = 'registered'
  )
ORDER BY relevance_score DESC, e.event_date ASC
LIMIT 5;
```

### 2.4 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **SQL-only scoring** | No ML libraries, no API calls to OpenAI/LLMs. Zero latency, works offline, easy to debug. |
| **Category-based matching** | Simple, interpretable, and directly tied to data the system already captures. |
| **Cold-start fallback** | New volunteers with no history see popular events instead of an empty screen. |
| **Excludes registered events** | Prevents recommending events the volunteer has already joined. |

---

## 3. AI Feature 2: "For You" AI Assistant

### 3.1 Purpose

Help volunteers quickly decide which recommended event to join by answering contextual questions about their personalised event list.

### 3.2 How It Works

The AI Assistant is a **client-side decision engine** that runs entirely in the mobile app — no API calls, no server processing, no external AI.

```
  ┌────────────────────────────────────────────────────────────┐
  │                 "Ask about your picks"                     │
  │                                                           │
  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
  │  │ Highest      │  │ Best         │  │ Most         │   │
  │  │ match?       │  │ overall?     │  │ points?      │   │
  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
  │  ┌──────────────┐                                  │   │
  │  │ Has slots?   │                                  │   │
  │  └──────────────┘                                  │   │
  │         │                                          │   │
  │         ▼                                          │   │
  │  ┌─────────────────────────────────────────────┐   │   │
  │  │       Assistant Answer Panel                │   │   │
  │  │  "Best overall pick"                        │   │   │
  │  │  "Beach Cleanup · 87% match"                │   │   │
  │  │  "This event has the best balance of ..."   │   │   │
  │  └─────────────────────────────────────────────┘   │   │
  └────────────────────────────────────────────────────────┘
```

### 3.3 The Four Questions and Their Logic

#### Question 1: "Highest match?"
Finds the event with the best **match score** based on the volunteer's category preferences.

```
matchScore = 65          (base score)
           + 20          (if category matches volunteer's history)
           + 7           (if recommendation_reason exists)
           + 5           (if slots are available)
           - (index × 3) (position penalty — earlier events score higher)
           → clamped to [60, 96]
```

#### Question 2: "Best overall?"
Finds the event with the **best combined score** of match percentage, points value, and slot availability.

```
overallScore = matchScore
             + (points_value / 10)
             + (8 if slots available)
```

#### Question 3: "Most points?"
Simply sorts events by `points_value` descending — finds the highest-paying event.

#### Question 4: "Has slots?"
Filters events where `registrations < capacity`, then returns the highest-match event with available space.

### 3.4 Visual Design

The AI Assistant is presented as a chat-like interface:

- **Question chips** — Tappable buttons for each question (horizontal scroll)
- **Answer panel** — Appears below the questions with:
  - Category-coloured icon
  - Title (e.g., "Highest match")
  - Event name + match score
  - Explanation message
  - Auto-scrolls to the recommended event in the list

---

## 4. Development Methodology

### 4.1 Overall Approach: Vertical Slices with AI-Assisted Generation

The AI features were built using a structured methodology combining **vertical slice architecture** and **AI-assisted code generation**.

#### Phase 1: System Analysis (Documentation-First)

Before any code was written, the system was fully designed in documents:

| Document | Role in AI Development |
|----------|----------------------|
| `docs/SYSTEM_ANALYSIS.md` | 9-phase blueprint identifying stakeholders, workflows, and system requirements |
| `docs/Workflow Analysis v4.md` | Mapped volunteer journey → identified need for personalised event discovery |
| `docs/API_CONTRACTS_v2.md` | Frozen API shapes — recommendation endpoint contract defined upfront |
| `docs/Vertical Slice Technical Guide v4.md` | Assigned ownership: Vivian owns Events + Recommendations slice |

#### Phase 2: Vertical Slice Assignment

Each AI feature was built as part of a **vertical slice** — one person owned the complete feature:

```
                    Vivian's Slice (Events + AI Recommendations)
┌──────────────────────────────────────────────────────────────┐
│  Database       Backend Controller    Backend Service        │
│  ┌─────────┐   ┌────────────────┐   ┌────────────────────┐  │
│  │ events  │ ← │ events.control  │ ← │ events.service.js  │  │
│  │  table  │   │ ler.js (today)  │   │ getRecommendations │  │
│  └─────────┘   └────────────────┘   └────────────────────┘  │
│                                                             │
│  Mobile Frontend                        │
│  ┌──────────────────────────────────────────────────┐       │
│  │ app/ai-recommendations.tsx                       │       │
│  │ → "For You" screen                               │       │
│  │ → AI Assistant (4 questions)                     │       │
│  │ → Match score visualisation                      │       │
│  └──────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

**Why vertical slices?**
- Every team member has a demoable feature at every sprint
- No blocking dependencies between team members
- Each slice is independently testable

#### Phase 3: AI-Assisted Code Generation

The team used **structured AI prompts** to generate the code. Each prompt contained:

```
┌──────────────────────────────────────────────────────────┐
│  PROMPT STRUCTURE (from AI_GENERATION_PROMPTS_v2.md)     │
├──────────────────────────────────────────────────────────┤
│  1. CONTEXT                                              │
│     "I am building the Event slice of a Volunteering     │
│      Rewards App. Tech: Node.js, PostgreSQL, Expo RN."   │
│                                                          │
│  2. WHAT ALREADY EXISTS                                  │
│     "Express server with auth middleware, database pool,  │
│      migration files, event_registrations table exists."  │
│                                                          │
│  3. EXACT CODE PATTERNS TO FOLLOW                        │
│     "Router() pattern, async controller, pool.query(),   │
│      res.json({data: ...}), next(createError(...))"       │
│                                                          │
│  4. THE TASK                                             │
│     "Generate getRecommendations() that scores events    │
│      by category match from past attendance history."     │
│                                                          │
│  5. CONSTRAINT                                            │
│     "Response must match API_CONTRACTS.md exactly."      │
└──────────────────────────────────────────────────────────┘
```

The team followed this process for every feature:
```
Write prompt → AI generates code → Self-review against contracts → 
Test locally → Submit PR with screenshots → Peer review → Merge
```

### 4.2 Why Content-Based Filtering (Not ML)?

| Approach | Considered? | Why Not Used |
|----------|------------|--------------|
| **Collaborative Filtering** ("users like you also liked...") | ❌ | Requires large userbase to find meaningful similarities. Cold-start problem for new users. |
| **LLM-based (OpenAI/GPT)** | ❌ | Adds latency, cost, and external dependency. Overkill for category-based matching. |
| **Matrix Factorisation (SVD, etc.)** | ❌ | Requires training, model serving infrastructure, periodic retraining. |
| **Content-Based Filtering** | ✅ **Chosen** | Simple, transparent, no external dependencies, real-time, works with sparse data. |

### 4.3 Integration Rules

All AI features obeyed these project-wide rules:

1. **Frozen API contracts** — Response shapes were defined before implementation, never changed
2. **Route files are exclusive** — No two team members edit the same route file
3. **PR gates** — Domain peer review + integration check + smoke test required before merge
4. **Weekly sync** — Working code merged to `main` every Friday
5. **Incremental delivery** — Each sprint produced testable, demoable features

---

## 5. Code Reference Map

| Component | File | Lines | Description |
|-----------|------|-------|-------------|
| **Recommendation Engine** | `backend/src/services/events.service.js` | 158–257 | Content-based filtering: `getRecommendations()` and `getPopularEvents()` |
| **Recommended API Route** | `backend/src/routes/events.routes.js` | 32 | `GET /api/events/recommended` — authenticated, volunteer role |
| **Popular API Route** | `backend/src/routes/events.routes.js` | 35 | `GET /api/events/popular` — authenticated, volunteer role |
| **Recommendation Controller** | `backend/src/controllers/events.controller.js` | 175–187 | Wraps service calls for recommended/popular endpoints |
| **"For You" Screen** | `app/ai-recommendations.tsx` | 1–1479 | Full AI Assistant UI — questions, answers, match scores, event cards |
| **AI Generation Prompts** | `docs/AI_GENERATION_PROMPTS_v2.md` | 1–842 | Complete prompt library used by all 4 team members |
| **Vertical Slice Guide** | `docs/Vertical Slice Technical Guide v4.md` | 1–100+ | Architecture patterns and owner assignments |
| **Workflow Analysis** | `docs/Workflow Analysis v4.md` | 1–80+ | User journey maps that informed feature requirements |

---

## 6. Comparison: AI-Powered vs Traditional Approach

### Without AI (Traditional Browse)

```
Volunteer opens Events tab
  → Sees all upcoming events (maybe 20+)
  → Manually scrolls through each one
  → Reads descriptions to find relevant ones
  → No personalisation — same list for everyone
  → Decision fatigue → lower participation
```

### With AI (Personalised Recommendations)

```
Volunteer opens "For You" tab
  → Sees top 5 events ranked by personal relevance
  → Each event shows: match score, category, reason
  → Can ask: "Best overall?", "Most points?"
  → Gets contextual answer with explanation
  → Informed decision → higher engagement
```

### Key Metrics

| Aspect | Traditional Browse | AI-Powered |
|--------|------------------|------------|
| **Personalisation** | None — same for all users | Per-user based on history |
| **Discovery effort** | High — scroll and read | Low — top 5 recommendations |
| **Decision support** | None | 4 contextual questions |
| **Cold start** | Works immediately | Falls back to popular events |
| **Technical complexity** | Simple SQL query | Dynamic scoring + CASE statement |
| **External dependencies** | None | None |

---

*End of AI Development Guide v1.0*
