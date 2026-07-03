# AI Development Guide V2 — Volunteering Rewards App

> **Document Version:** 2.0
> **Last Updated:** 3 July 2026
> **Purpose:** Explain the AI features of the system — both the existing rule-based AI and the new LLM-powered AI — including the rationale for each approach and the architecture for integrating FreeLLMAPI.

---

## Table of Contents

1. [Overview: Two Generations of AI](#1-overview-two-generations-of-ai)
2. [Generation 1: Rule-Based AI (Existing)](#2-generation-1-rule-based-ai-existing)
3. [Generation 2: LLM-Powered AI (New)](#3-generation-2-llm-powered-ai-new)
4. [Why the First Generation Did Not Use an LLM API](#4-why-the-first-generation-did-not-use-an-llm-api)
5. [Why They Are Still Considered AI](#5-why-they-are-still-considered-ai)
6. [FreeLLMAPI Architecture](#6-freellmapi-architecture)
7. [System Construction: How the New AI Features Are Built](#7-system-construction-how-the-new-ai-features-are-built)
8. [AI Feature 1: Smart Event Recommendations (V2)](#8-ai-feature-1-smart-event-recommendations-v2)
9. [AI Feature 2: Feedback AI Summary (V2)](#9-ai-feature-2-feedback-ai-summary-v2)
10. [Graceful Degradation & Failover](#10-graceful-degradation--failover)
11. [Code Reference Map](#11-code-reference-map)
12. [Comparison Summary](#12-comparison-summary)

---

## 1. Overview: Two Generations of AI

The system has evolved through two generations of AI implementation:

| Generation | Approach | Features | Status |
|-----------|----------|----------|--------|
| **Gen 1** (Sprint 3–4) | Rule-based algorithms (content-based filtering, lexicon sentiment analysis) | Event Recommendations, "For You" Assistant | ✅ Built, still active as fallback |
| **Gen 2** (Sprint 5) | Large Language Model via FreeLLMAPI | AI Event Recommendations, Feedback AI Summary | 🔄 Being built (Jul 3–5) |

The key insight: **both generations coexist**. Gen 2 is the primary path; Gen 1 acts as a graceful fallback when the LLM is unavailable.

---

## 2. Generation 1: Rule-Based AI (Existing)

### 2.1 Smart Event Recommendations

**Algorithm:** Content-based filtering using weighted category scoring.

```
Input:  Volunteer's attendance history (user ID)
Process:
  1. Query past events → group by category → count as "weight"
  2. Score upcoming events: relevance_score = SUM(category weights that match)
  3. Exclude already-registered events
  4. Sort by relevance_score DESC, event_date ASC
  5. Return top 5
Fallback: Popular events (sorted by registration count) for new users
Output: 5 recommended events with relevance scores
```

**File:** `backend/src/services/events.service.js` — `getRecommendations()`, `getPopularEvents()`

### 2.2 "For You" AI Assistant

**Algorithm:** Client-side scoring engine with 4 fixed question types.

```
Questions:
  - "Highest match?" → sort by matchScore
  - "Best overall?" → matchScore + points_value + slot bonus
  - "Most points?" → sort by points_value
  - "Has slots?" → filter by available capacity
```

**File:** `app/ai-recommendations.tsx`

---

## 3. Generation 2: LLM-Powered AI (New)

### 3.1 AI Event Recommendations (Enhanced)

Now powered by an actual LLM that understands **semantic meaning**, not just category labels.

**Before (Gen 1):** "Events in 'Environment' category because you attended 2 environment events."

**After (Gen 2):** "You enjoyed the Beach Cleanup and Park Planting — both are hands-on outdoor activities. The **Community Garden Project** this weekend has a similar hands-on outdoor feel. Also, since you volunteered at the Elderly Home Visit, the **Youth Mentoring Session** might interest you as both involve direct community interaction."

### 3.2 Feedback AI Summary (New)

Before this feature did not exist — feedback was only displayed as raw comments.

Now an LLM reads all volunteer feedback for an event and produces a structured, human-readable summary:

```json
{
  "overall_sentiment": "positive",
  "average_rating": 4.2,
  "key_themes": ["great organisation", "meaningful impact", "venue too warm"],
  "praise_points": ["friendly staff", "well-planned activities"],
  "improvements": ["more water stations", "start earlier to avoid heat"]
}
```

---

## 4. Why the First Generation Did Not Use an LLM API

During Sprint 3–4, the decision was made to implement the AI features **without** calling any external LLM API (OpenAI, Claude, etc.). The reasons were:

| Reason | Explanation |
|--------|-------------|
| **Zero external dependency** | The app needed to work fully offline for development and testing. No API keys, no internet required. |
| **Zero latency** | SQL queries complete in 5–15ms. LLM API calls take 1–5 seconds. For an MVP, speed mattered more than eloquence. |
| **Zero cost** | The project runs on a $0/month budget. LLM APIs cost money per token. Rule-based AI is free. |
| **Simpler debugging** | SQL scoring is deterministic and reproducible. LLM responses vary — harder to debug during rapid iteration. |
| **Minimal viable product** | At Sprint 3, the priority was getting all features working end-to-end. Category-based matching was "good enough" for an MVP. |
| **No GPU/hardware requirement** | Rule-based AI runs on any machine. No need for local GPU or cloud inference. |

The trade-off was accepted: **accuracy and richness were sacrificed for speed, reliability, and zero cost** during the early sprints.

---

## 5. Why They Are Still Considered AI

A common misconception is that "AI" only refers to machine learning or large language models. In reality, **AI is a broad field** that encompasses many techniques:

```
                    ARTIFICIAL INTELLIGENCE
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   Machine Learning     Symbolic AI        Expert Systems
   (learns from data)  (rule-based)        (if-then rules)
        │                   │                   │
   ┌────┴────┐         Content-Based        Decision Trees
   │        │         Filtering (F1)              
   Deep     Classical                           
  Learning   ML                                 
     │                                      
  LLMs (Gen 2)                              
```

### How Gen 1 Falls Under AI

| Criterion | Does Gen 1 qualify? | Why |
|-----------|-------------------|-----|
| **Intelligent behaviour** | ✅ Yes | Makes personalised content recommendations based on user history |
| **Automated decision-making** | ✅ Yes | Ranks and selects events without human intervention |
| **Knowledge representation** | ✅ Yes | Encodes user preferences as category weight vectors |
| **Adapts to input** | ✅ Yes | Different volunteers get different recommendations based on their data |
| **Solves a non-trivial task** | ✅ Yes | Manual browsing of 20+ events is replaced by ranked top-5 personalisation |

**Rule-based AI (also called symbolic AI or classical AI) is a well-established subfield of artificial intelligence** — it predates machine learning by decades. Recommendation systems based on content-based filtering are widely used in industry (e.g., news article recommendations, job matching) and are legitimately classified as AI systems.

The "For You" AI Assistant's four questions (highest match, best overall, most points, has slots) are a form of **expert system** — a fixed set of decision rules that provide intelligent answers.

---

## 6. FreeLLMAPI Architecture

### 6.1 What Is FreeLLMAPI?

FreeLLMAPI is a local proxy server that aggregates free tiers from **16+ LLM providers** behind one OpenAI-compatible API endpoint. It provides:

- **~1.7 billion free tokens/month** across providers
- **Auto-failover** — if one provider hits rate limits, it switches to the next
- **OpenAI-compatible API** — standard `/v1/chat/completions` endpoint
- **Model routing** — the `auto` model picks the best available provider per request

**Repo:** https://github.com/tashfeenahmed/freellmapi

### 6.2 Architecture Diagram

```
                    ┌────────────────────────────────────────┐
                    │        FreeLLMAPI Server               │
                    │        localhost:3001                   │
                    │                                         │
                    │  ┌──────────┐  ┌────────────────────┐  │
                    │  │ Key Store │  │  Auto Router        │  │
                    │  │ ─────────│  │                     │  │
                    │  │ Google   │  │  1. Check quota     │  │
                    │  │ Groq     │  │  2. Rank by quality │  │
                    │  │ Cerebras │  │  3. Route request   │  │
                    │  │ Mistral  │  │  4. Failover on 429 │  │
                    │  └──────────┘  └──────────┬──────────┘  │
                    │                            │             │
                    │                    ┌───────▼────────┐   │
                    │                    │  Response Cache │   │
                    │                    └────────────────┘   │
                    └────────────────────────┬────────────────┘
                                             │ HTTP
                                             ▼
┌──────────────────────────────────────────────────────────────┐
│              Backend API (Node.js / Express)                  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              ai.service.js                              │  │
│  │                                                         │  │
│  │  callLlm(prompt) ──► fetch(FRELLMAPI_URL/v1/chat/...) │  │
│  │       │                                                 │  │
│  │       ├── Success ──► return LLM response               │  │
│  │       └── Error ──► log warning → return null           │  │
│  │                                                         │  │
│  │  getAiRecommendations(userId) ──► callLlm(recPrompt)   │  │
│  │       │                                                 │  │
│  │       ├── Success ──► parse → return recommended events │  │
│  │       └── Fallback ──► events.service.getRecommendations│  │
│  │                         (Gen 1 SQL algorithm)           │  │
│  │                                                         │  │
│  │  getAiFeedbackSummary(eventId) ──► callLlm(sumPrompt)  │  │
│  │       │                                                 │  │
│  │       ├── Success ──► parse → return structured summary │  │
│  │       └── Fallback ──► feedback.service.getFeedbackSumm │  │
│  │                         (Gen 1 sentiment analysis)      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Provider Selection

The following free providers are configured (minimum viable set):

| Provider | API Key Required | Best Model | Free Tier Limit |
|----------|-----------------|------------|-----------------|
| **Google AI Studio** | ✅ | Gemini 2.5 Flash | 1,500 RPM |
| **Groq** | ✅ | Llama 4 | 30 RPM / 14,400 RPD |
| **Cerebras** | ✅ | Qwen3 235B | 30 RPM |
| **Mistral** | ✅ | Mistral Large | 1 RPM / 1,000 RPD |
| **OpenRouter** | ✅ | 21 free models | Varies by model |

> **No-cost providers** (no key needed): `kilo`, `pollinations`, `llm7` — these offer anonymous free access with smaller models. They serve as a last-resort fallback.

### 6.4 Auto-Failover Behaviour

When the `auto` model is selected, FreeLLMAPI:

1. Checks which configured providers have valid keys with remaining quota
2. Ranks available providers by model intelligence
3. Routes the request to the best available provider
4. If that provider returns HTTP 429 (rate limit) or 5xx (server error):
   - Automatically retries with the next-ranked provider
   - Maintains a 30-minute sticky session for consistency
5. If all providers exhausted → returns error

This means our backend only needs to handle the "all providers exhausted" case (which is our Gen 1 fallback).

---

## 7. System Construction: How the New AI Features Are Built

### 7.1 New Files

| File | Purpose |
|------|---------|
| `backend/src/services/ai.service.js` | Core LLM service — `callLlm()`, `getAiRecommendations()`, `getAiFeedbackSummary()` |
| `backend/src/controllers/ai.controller.js` | HTTP handlers wrapping the AI service |
| `backend/src/routes/ai.routes.js` | Route definitions for AI endpoints |

### 7.2 Modified Files

| File | Changes |
|------|---------|
| `backend/index.js` | Mount AI routes: `app.use("/api/ai", aiRoutes)` |
| `backend/src/services/events.service.js` | `getRecommendations()` now tries AI first, falls back to SQL |
| `backend/src/services/feedback.service.js` | `getFeedbackSummary()` now tries AI first, falls back to lexicon analyzer |
| `backend/.env` | Added `FRELLMAPI_URL`, `FRELLMAPI_KEY` |

### 7.3 The `callLlm()` Function (Core)

```javascript
// ai.service.js — Shared LLM caller

const FRELLMAPI_URL = process.env.FRELLMAPI_URL || 'http://localhost:3001';
const FRELLMAPI_KEY = process.env.FRELLMAPI_KEY;

async function callLlm(prompt) {
  const response = await fetch(`${FRELLMAPI_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FRELLMAPI_KEY}`
    },
    body: JSON.stringify({
      model: 'auto',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for a volunteer rewards platform.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1024,
      temperature: 0.3  // Low temperature for consistent, factual output
    })
  });

  if (!response.ok) {
    throw new Error(`FreeLLMAPI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### 7.4 Prompt Engineering

**Recommendation Prompt:**
```
You are a volunteer event recommendation system.
A volunteer has attended these past events (category → count):
{JSON}

Upcoming events available:
{JSON}

Recommend exactly {limit} events from the upcoming list that best match
this volunteer's interests. Return ONLY the event IDs as a JSON array.
Consider category preferences, variety, and event timing.
```

**Feedback Summary Prompt:**
```
You are a feedback analysis system. Summarize the following volunteer
feedback for an event. Return a JSON object with:
- overall_sentiment: "positive"|"neutral"|"mixed"
- average_rating: number
- key_themes: string[]
- praise_points: string[]
- improvements: string[]

Feedback:
{JSON}
```

---

## 8. AI Feature 1: Smart Event Recommendations (V2)

### 8.1 Endpoint

```
GET /api/ai/recommendations
Authorization: Bearer <JWT>
Role: volunteer
```

Response:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Community Garden Project",
      "category": "Environment",
      "match_score": 92,
      "reasoning": "You enjoyed Beach Cleanup and Park Planting — both hands-on outdoor activities. This event has a similar feel.",
      "points_value": 50,
      "registrations": 12,
      "capacity": 30
    }
  ],
  "ai_generated": true,
  "provider": "gemini-2.5-flash"
}
```

### 8.2 Flow

```
Volunteer opens "For You" tab
  → Mobile app calls GET /api/ai/recommendations
  → ai.controller.recommendations()
    → ai.service.getAiRecommendations(userId)
      → Fetch user history + upcoming events (existing queries)
      → Build prompt → callLlm()
      → SUCCESS: Parse response → return AI recommendations
      → FAIL: events.service.getRecommendations(userId)  ← Gen 1 fallback
  → Return recommendations to mobile app
```

---

## 9. AI Feature 2: Feedback AI Summary (V2)

### 9.1 Endpoint

```
GET /api/ai/feedback-summary/:eventId
Authorization: Bearer <JWT>
Role: organiser
```

Response:
```json
{
  "data": {
    "overall_sentiment": "positive",
    "average_rating": 4.2,
    "total_feedback": 15,
    "key_themes": ["great organisation", "meaningful impact", "venue too warm"],
    "praise_points": ["friendly staff", "well-planned activities", "good location"],
    "improvements": ["more water stations", "start earlier to avoid heat", "add name tags"],
    "ai_generated": true
  }
}
```

### 9.2 Flow

```
Organiser opens event feedback page
  → Web portal calls GET /api/ai/feedback-summary/:eventId
  → ai.controller.feedbackSummary()
    → ai.service.getAiFeedbackSummary(eventId)
      → Fetch all feedback comments (existing query)
      → Build prompt → callLlm()
      → SUCCESS: Parse JSON response → return structured summary
      → FAIL: feedback.service.getFeedbackSummary(eventId)  ← Gen 1 fallback
  → Display summary in organiser portal
```

---

## 10. Graceful Degradation & Failover

The system is designed to handle LLM failure at every level:

| Failure Scenario | What Happens | User Sees |
|-----------------|--------------|-----------|
| FreeLLMAPI server not running | `callLlm()` throws → fallback to Gen 1 | Recommendations still work (SQL-based) |
| FreeLLMAPI auto-routes to provider A → 429 | FreeLLMAPI auto-retries provider B | No visible impact |
| All providers rate-limited | `callLlm()` throws → fallback to Gen 1 | Recommendations still work (SQL-based) |
| LLM returns malformed JSON | `try/catch` in parser → fallback to Gen 1 | Recommendations still work (SQL-based) |
| LLM response too slow (>10s) | `fetch()` timeout → fallback to Gen 1 | Slightly faster response using SQL |
| Network disconnected | `fetch()` fails → fallback to Gen 1 | Recommendations still work (SQL-based) |

The key principle: **the app never breaks because of the LLM**. The LLM enhances the experience when available; the existing algorithms provide the baseline when it is not.

---

## 11. Code Reference Map

| Component | File | Lines | Description |
|-----------|------|-------|-------------|
| **LLM Caller** | `backend/src/services/ai.service.js` | NEW | `callLlm()`, `getAiRecommendations()`, `getAiFeedbackSummary()` |
| **AI Controller** | `backend/src/controllers/ai.controller.js` | NEW | HTTP handlers for AI endpoints |
| **AI Routes** | `backend/src/routes/ai.routes.js` | NEW | `GET /api/ai/recommendations`, `GET /api/ai/feedback-summary/:eventId` |
| **Route Mounting** | `backend/index.js` | MODIFIED | `app.use("/api/ai", aiRoutes)` |
| **Rec Engine (Gen 1)** | `backend/src/services/events.service.js` | 158–257 | `getRecommendations()` — fallback when LLM unavailable |
| **Sentiment Analysis (Gen 1)** | `backend/src/services/feedback.service.js` | Full file | `analyseSentiment()`, `getFeedbackSummary()` — fallback when LLM unavailable |
| **FreeLLMAPI Server** | External (localhost:3001) | — | LLM proxy with auto-failover across 16+ free providers |
| **"For You" Screen** | `app/ai-recommendations.tsx` | Full file | Mobile UI for recommendations (unchanged) |
| **Feedback Organiser Page** | `frontend/web_portals/src/pages/organiser/Feedback.jsx` | Unchanged | Displays AI-generated feedback summary |
| **AI Dev Guide V1** | `docs/AI_DEVELOPMENT_GUIDE.md` | Full file | Original documentation of Gen 1 rules-based AI |

---

## 12. Comparison Summary

| Aspect | Gen 1: Rule-Based (Sprint 3–4) | Gen 2: LLM-Powered (Sprint 5) |
|--------|------------------------------|-------------------------------|
| **Approach** | Content-based filtering + lexicon sentiment | Large Language Model via FreeLLMAPI |
| **AI Category** | Symbolic AI / Expert System | Generative AI / LLM |
| **External API** | None | FreeLLMAPI (free tier proxy) |
| **Providers** | N/A | Google, Groq, Cerebras, Mistral, OpenRouter |
| **Latency** | 5–15ms (SQL query) | 1–5 seconds (LLM inference) |
| **Cost** | $0 | $0 (all free tiers) |
| **Response quality** | Category-based, formulaic | Natural language, contextual |
| **Cross-category reasoning** | ❌ No | ✅ Yes |
| **Dependencies** | None | FreeLLMAPI server on localhost:3001 |
| **Offline capability** | ✅ Full | ❌ Needs LLM server (falls back to Gen 1) |
| **Debug difficulty** | Easy (deterministic SQL) | Medium (LLM output varies) |
| **Role in system** | Primary (Sprint 3–4) → Fallback (Sprint 5+) | Primary (Sprint 5+) |

---

## Appendix: FreeLLMAPI Setup

### Installation

```bash
# Clone and install
cd D:\c3000c
git clone https://github.com/tashfeenahmed/freellmapi.git
cd freellmapi
npm install

# Configure
cp .env.example .env
# Edit .env — set ENCRYPTION_KEY, PORT=3001

# Start server
npx tsx server/src/index.ts
```

### Adding Provider Keys

```bash
# Login to get admin token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@your.email","password":"password123"}'
# → Get TOKEN

# Add Google AI Studio key
curl -X POST http://localhost:3001/api/keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"platform":"google","key":"YOUR_GOOGLE_API_KEY","label":"Gemini Free"}'

# Add Groq key
curl -X POST http://localhost:3001/api/keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"platform":"groq","key":"YOUR_GROQ_API_KEY","label":"Groq Llama"}'

# Get unified API key for our backend
curl http://localhost:3001/api/settings/api-key \
  -H "Authorization: Bearer $TOKEN"
# → Get FRELLMAPI_KEY
```

### Backend Configuration

```env
# .env additions
FRELLMAPI_URL=http://localhost:3001
FRELLMAPI_KEY=freellmapi-xxxxxxxx...
```

---

> **Document Version 2.0 — 3 July 2026**
> **Changes from v1.0:** Added Gen 2 LLM-powered AI architecture, FreeLLMAPI integration, explanation of Gen 1 vs Gen 2 design decisions, graceful degradation strategy, and setup instructions.
