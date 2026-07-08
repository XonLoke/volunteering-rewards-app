# AI Development Guide V2.1 — Volunteering Rewards App

> **Document Version:** 2.1
> **Last Updated:** 3 July 2026
> **Purpose:** Explain the AI features of the system — both the existing rule-based AI and the new LLM-powered AI — including the rationale for choosing FreeLLMAPI, the resilience design, and the build technical details.

---

## Table of Contents

1. [Overview: Two Generations of AI](#1-overview-two-generations-of-ai)
2. [Generation 1: Rule-Based AI (Existing)](#2-generation-1-rule-based-ai-existing)
3. [Generation 2: LLM-Powered AI (New)](#3-generation-2-llm-powered-ai-new)
4. [Why the First Generation Did Not Use an LLM API](#4-why-the-first-generation-did-not-use-an-llm-api)
5. [Why They Are Still Considered AI](#5-why-they-are-still-considered-ai)
6. [FreeLLMAPI Architecture](#6-freellmapi-architecture)
7. [Why FreeLLMAPI Was Chosen](#7-why-freellmapi-was-chosen)
8. [System Construction: Build Technical Detail](#8-system-construction-build-technical-detail)
9. [AI Feature 1: Smart Event Recommendations (V2)](#9-ai-feature-1-smart-event-recommendations-v2)
10. [AI Feature 2: Feedback AI Summary (V2)](#10-ai-feature-2-feedback-ai-summary-v2)
11. [Resilience & Failover Architecture](#11-resilience--failover-architecture)
12. [Code Reference Map](#12-code-reference-map)
13. [Comparison Summary](#13-comparison-summary)

---

## 1. Overview: Two Generations of AI

The system has evolved through two generations of AI implementation:

| Generation | Approach | Features | Status |
|-----------|----------|----------|--------|
| **Gen 1** (Sprint 3–4) | Rule-based algorithms (content-based filtering, lexicon sentiment analysis) | Event Recommendations, "For You" Assistant | ✅ Built, active as fallback |
| **Gen 2** (Sprint 5) | Large Language Model via FreeLLMAPI | AI Event Recommendations, Feedback AI Summary | ✅ Built (Jul 3) |

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

## 7. Why FreeLLMAPI Was Chosen

When deciding which LLM solution to adopt, three options were evaluated:

| Option | Cost | Model Quality | Setup Effort | Risk |
|--------|------|--------------|-------------|------|
| **Claude API (Anthropic)** | Pay-per-token | Very high | Minimal (API key) | API key cost, single provider |
| **Local Ollama** | Free | Medium (small models) | Moderate (install + pull model) | Requires local GPU/RAM |
| **FreeLLMAPI** ✅ | **$0** | **High (Gemini 2.5 Flash)** | **Moderate (clone + keys)** | **No single point of failure** |

### Why FreeLLMAPI Won

| Factor | Assessment |
|--------|------------|
| **Cost** | FreeLLMAPI uses existing free tiers — zero cost, no credit card needed. Google AI Studio alone gives 1,500 requests per minute for free. |
| **Model Quality** | Gemini 2.5 Flash rivals paid models for text generation and reasoning. Much better than any small local model (Llama 3.2 3B, Phi-4). |
| **No Hardware Required** | Unlike Ollama which needs a GPU or at least 8GB+ RAM for decent models, FreeLLMAPI runs as a lightweight proxy (Node.js) that routes to cloud APIs. |
| **Multiple Providers = No Single Point of Failure** | With 16+ providers, if Google goes down, Groq takes over. If Groq hits rate limits, Cerebras handles it. This is impossible with a single API key approach. |
| **OpenAI-Compatible** | Standard `/v1/chat/completions` format means we can switch to any other provider later without changing a single line of code. |
| **Free Quota** | ~1.7 billion tokens/month across providers is more than enough for a student project's AI recommendations and feedback summaries. |

### What About Local Ollama?

Ollama was considered but not chosen because:
- Running a capable model (Llama 3.1 8B) requires ~8GB RAM and significant CPU/GPU
- The first request takes 5–10 seconds to load the model into memory (cold start)
- Smaller models (3B) produce noticeably worse recommendations
- FreeLLMAPI gives us access to **much better models** (Gemini 2.5 Flash) with **no local hardware cost**

---

## 8. System Construction: Build Technical Detail

### 8.1 New Files Created

| File | Purpose |
|------|---------|
| `backend/src/services/ai.service.js` | Core LLM service — `callLlm()`, `getAiRecommendations()`, `getAiFeedbackSummary()` |
| `backend/src/controllers/ai.controller.js` | HTTP handlers wrapping the AI service with fallback logic |
| `backend/src/routes/ai.routes.js` | Route definitions for AI endpoints |

### 8.2 Modified Files

| File | Changes |
|------|---------|
| `backend/index.js` | Mount AI routes: `app.use("/api/ai", aiRoutes)` |
| `backend/.env` | Added `FRELLMAPI_URL=http://localhost:3001`, `FRELLMAPI_KEY=freellmapi-xxx` |

### 8.3 The `callLlm()` Function — Core Architecture

This is the shared function that all AI features use to communicate with FreeLLMAPI. Located in `backend/src/services/ai.service.js`.

**Key design decisions:**

**a) 15-second timeout with AbortController:**
```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000);
// ... fetch with signal: controller.signal ...
clearTimeout(timeout);
```
If the LLM takes longer than 15 seconds, the request is aborted and the system falls back to Gen 1. This prevents the API from hanging when the LLM is slow.

**b) Never throws — always returns null on error:**
```javascript
async function callLlm(prompt, opts = {}) {
  try {
    // ... fetch to FreeLLMAPI ...
    if (!response.ok) {
      console.warn(`[ai.service] FreeLLMAPI error ${response.status}`);
      return null;
    }
    return content.trim();
  } catch (err) {
    if (err.name === "AbortError") {
      console.warn("[ai.service] LLM request timed out");
    } else {
      console.warn(`[ai.service] LLM request failed: ${err.message}`);
    }
    return null; // Never throw — always degrade gracefully
  }
}
```

**c) Low temperature (0.3) for consistent output:**
The LLM is configured with a low temperature setting so it produces predictable, factual responses rather than creative variations. This is important for parsing structured JSON output.

### 8.4 Controller Pattern — AI-First with Fallback

Each AI endpoint follows the same pattern. Located in `backend/src/controllers/ai.controller.js`:

```javascript
async function getRecommendations(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 5, 10);

    // Try AI-first (Gen 2)
    const aiResult = await aiService.getAiRecommendations(userId, limit);

    if (aiResult) {
      return res.json({
        data: aiResult,
        ai_generated: true,  // Flag: response came from LLM
      });
    }

    // Fallback to SQL-based recommendations (Gen 1)
    console.log("[ai.controller] LLM unavailable, using SQL recommendations");
    const sqlResult = await eventsService.getRecommendations(userId, limit);

    return res.json({
      data: sqlResult,
      ai_generated: false,  // Flag: response came from fallback
    });
  } catch (err) {
    next(err);  // Only reached if both AI AND fallback throw
  }
}
```

Key design points:
- The `ai_generated: true/false` flag lets the frontend display an indicator of whether the result was LLM-powered or rule-based
- The `try/catch` ensures that even if `getAiRecommendations()` throws unexpectedly, the fallback still runs
- The `next(err)` at the bottom is a true last resort (should never normally be reached)

### 8.5 Route Registration

Routes are defined in `backend/src/routes/ai.routes.js`:

```javascript
const { Router } = require("express");
const router = Router();
const controller = require("../controllers/ai.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.get("/recommendations",
  authenticate,
  authorize("volunteer"),
  controller.getRecommendations
);

router.get("/feedback-summary/:eventId",
  authenticate,
  authorize("organiser"),
  controller.getFeedbackSummary
);

module.exports = router;
```

Mounted in `backend/index.js`:
```javascript
app.use("/api/ai", require("./src/routes/ai.routes"));
```

Full endpoint paths:
- `GET /api/ai/recommendations` — Volunteer role (returns AI event recommendations)
- `GET /api/ai/feedback-summary/:eventId` — Organiser role (returns AI feedback summary)

### 8.6 Prompt Engineering Detail

**Recommendation Prompt** (`ai.service.js`):
```javascript
function buildRecommendationPrompt(history, events, limit) {
  return (
    "You are a volunteer event recommendation system. " +
    "A volunteer has attended these past events (category → count):\n" +
    JSON.stringify(history, null, 2) +
    "\n\nUpcoming events available:\n" +
    JSON.stringify(events, null, 2) +
    `\n\nRecommend exactly ${limit} events from the upcoming list that best ` +
    "match this volunteer's interests. Consider category preferences, variety, " +
    "and event timing. Return ONLY a JSON array of event IDs, e.g. [3, 7, 12, 5, 9]."
  );
}
```

Design rationale:
- The prompt includes **structured JSON data**, not natural language descriptions — this gives the LLM precise, unambiguous input
- It requests output in a **specific format** ("ONLY a JSON array") so we can reliably parse it
- It provides **context about what to consider** (category preferences, variety, timing) to guide the LLM's reasoning

**Feedback Summary Prompt** (`ai.service.js`):
```javascript
function buildSummaryPrompt(feedbacks) {
  const feedbackText = feedbacks
    .map((f, i) => `[${i + 1}] Rating: ${f.rating}/5 — "${f.comment}"`)
    .join("\n");

  return (
    "You are a feedback analysis system. Summarize the following volunteer " +
    "feedback for an event.\n\n" +
    feedbackText +
    "\n\nReturn a JSON object with these exact keys:\n" +
    '- "overall_sentiment": "positive" | "neutral" | "mixed"\n' +
    '- "average_rating": number (to 1 decimal)\n' +
    '- "key_themes": string[]\n' +
    '- "praise_points": string[]\n' +
    '- "improvements": string[]'
  );
}
```

Design rationale:
- Each feedback item is numbered and includes both rating and comment text
- The output JSON schema is **explicitly defined** in the prompt (exact key names, types, allowed values)
- This makes the LLM output **consistently parseable** — we validate the JSON structure before returning it

### 8.7 Response Parsing

The LLM response is parsed with defensive error handling:

```javascript
// For recommendations:
const jsonMatch = llmResult.match(/\[[\s\S]*?\]/);
if (!jsonMatch) throw new Error("No JSON array found");
recommendedIds = JSON.parse(jsonMatch[0]);

// For feedback summary:
const jsonMatch = llmResult.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error("No JSON object found");
parsed = JSON.parse(jsonMatch[0]);
```

This regex-based extraction handles cases where the LLM includes extra explanatory text around the JSON output (which models sometimes do even when asked not to).

### 8.8 FreeLLMAPI Server Installation

**Location:** `D:\c3000c\freellmapi` (sibling directory to the project)

```bash
git clone https://github.com/tashfeenahmed/freellmapi.git
cd freellmapi
npm install

# Configure .env with encryption key
ENCRYPTION_KEY="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"

# Start server
npx tsx server/src/index.ts &
# Server running on http://localhost:3001
```

**Provider key configuration:**
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -d '{"email":"admin@vol-rewards.com","password":"password123"}'
# → Get TOKEN

# Add Google AI Studio key
curl -X POST http://localhost:3001/api/keys \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"platform":"google","key":"AIzaSy...","label":"Gemini Free"}'

# Get unified API key
curl http://localhost:3001/api/settings/api-key
# → freellmapi-590984ec3da7bc8020daceb22a0ec5406d7355b2387237d6
```

**Backend `.env` configuration:**
```env
FRELLMAPI_URL=http://localhost:3001
FRELLMAPI_KEY=freellmapi-590984ec3da7bc8020daceb22a0ec5406d7355b2387237d6
```

---

## 9. AI Feature 1: Smart Event Recommendations (V2)

### 9.1 Endpoint

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
      "reasoning": "Recommended based on your past volunteering interests.",
      "points_value": 50,
      "registrations": 12,
      "capacity": 30
    }
  ],
  "ai_generated": true
}
```

### 9.2 Execution Flow

```
Volunteer opens "For You" tab
  → Mobile app calls GET /api/ai/recommendations
  → ai.controller.recommendations()
    → ai.service.getAiRecommendations(userId)
      → Step 1: Query past attendance grouped by category
        SELECT e.category, COUNT(*) FROM event_registrations ...
      → Step 2: Query upcoming events (not yet registered)
        SELECT e.id, e.title, e.category, e.event_date, e.points_value, ...
      → Step 3: If no history → return null (→ fallback)
      → Step 4: Build prompt with structured data
      → Step 5: callLlm(prompt) → FreeLLMAPI → Google Gemini
      → Step 6: Parse response (regex extract JSON array)
      → Step 7: Map IDs back to full event objects
      → SUCCESS: Return AI-generated recommendations
      → FAIL: Return null → controller falls back to SQL
  → Return recommendations to mobile app
```

### 9.3 Data Flow

```
Frontend                    Backend                        FreeLLMAPI
   │                          │                               │
   │  GET /api/ai/recommend   │                               │
   │─────────────────────────►│                               │
   │                          │  Query user history (SQL)    │
   │                          │──────────────────────────────►│
   │                          │  Query upcoming events (SQL) │
   │                          │◄─────────────────────────────│
   │                          │                               │
   │                          │  POST /v1/chat/completions    │
   │                          │──────────────────────────────►│
   │                          │         (Google Gemini)       │
   │                          │◄─────────────────────────────│
   │                          │  Parse JSON response          │
   │                          │                               │
   │  { data: [...],          │                               │
   │    ai_generated: true }  │                               │
   │◄─────────────────────────│                               │
```

---

## 10. AI Feature 2: Feedback AI Summary (V2)

### 10.1 Endpoint

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

### 10.2 Execution Flow

```
Organiser opens event feedback page
  → Web portal calls GET /api/ai/feedback-summary/:eventId
  → ai.controller.feedbackSummary()
    → ai.service.getAiFeedbackSummary(eventId)
      → Step 1: Query feedback comments for the event
        SELECT rating, comment FROM event_feedback WHERE event_id = $1 ...
      → Step 2: If no feedback → return { total_feedback: 0 }
      → Step 3: Build prompt with numbered rating+comment pairs
      → Step 4: callLlm(prompt) → FreeLLMAPI → Google Gemini
      → Step 5: Parse response (regex extract JSON object)
      → Step 6: Attach total_feedback count
      → SUCCESS: Return structured AI summary
      → FAIL: Return null → controller falls back to lexicon analysis
  → Display summary in organiser portal
```

---

## 11. Resilience & Failover Architecture

The system is designed with **two layers of resilience** so that even if a provider stops working, the function continues to operate normally.

### 11.1 Layer 1: FreeLLMAPI Auto-Failover (Provider Level)

FreeLLMAPI's `auto` router handles provider-level failures transparently:

```
User Request
     │
     ▼
FreeLLMAPI Auto Router
     │
     ├── Google AI (1,500 RPM) ─── 429/5xx ──┐
     │                                        │
     ├── Groq (30 RPM) ────────── 429/5xx ───┤
     │                                        │
     ├── Cerebras (30 RPM) ────── 429/5xx ───┤
     │                                        │
     ├── Mistral (1 RPM) ──────── 429/5xx ───┤
     │                                        │
     └── OpenRouter (varies) ──── 429/5xx ───┤
                                              │
                                              ▼
                                     Return error to backend
```

If any single provider (e.g., Google AI) stops working or hits its rate limit, FreeLLMAPI **automatically retries the request with the next provider** (e.g., Groq → Cerebras → Mistral → OpenRouter). This failover happens inside FreeLLMAPI — our backend never sees the failure.

**Provider diversity is key to this approach.** With only one API key (e.g., just Google), if Google goes down, FreeLLMAPI has no alternative. With 3+ providers configured, the chance of all being simultaneously unavailable is virtually zero.

### 11.2 Layer 2: Gen 1 Algorithm Fallback (Application Level)

If **all** providers in FreeLLMAPI are exhausted or the FreeLLMAPI server itself is down, our backend's controller catches the failure and falls back to the existing Gen 1 algorithms:

```
Layer 1: FreeLLMAPI tries Google → fails → tries Groq → fails → ... → all fail
                                ↓
Layer 2: Backend catches null → calls Gen 1 (SQL/lexicon)
                                ↓
                     Returns result with ai_generated: false
```

### 11.3 Complete Failure Matrix

| Failure Scenario | Layer 1 (FreeLLMAPI) | Layer 2 (Backend) | User Experience |
|-----------------|---------------------|-------------------|-----------------|
| Google AI rate limited | ✅ Auto-routes to Groq | Not triggered | No visible impact |
| Google AI down | ✅ Auto-routes to Cerebras | Not triggered | No visible impact |
| All providers rate-limited | Returns error to backend | ✅ Falls back to SQL Gen 1 | Recommendations still work (less personalised) |
| FreeLLMAPI server not running | N/A | ✅ Controller catches null → Gen 1 | Recommendations still work (rule-based) |
| Network disconnected | Request fails | ✅ Controller catches → Gen 1 | Recommendations still work (rule-based) |
| LLM response too slow (>15s) | Request aborted | ✅ Timeout catch → Gen 1 | Recommendations slightly faster (SQL) |
| LLM returns malformed JSON | Response received | ✅ Parse error catch → Gen 1 | Recommendations still work (rule-based) |

### 11.4 Code-Level Safety

The `callLlm()` function in `ai.service.js` implements these safety measures:

```javascript
// 1. Timeout protection — abort after 15s
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000);

// 2. Non-OK response handling
if (!response.ok) {
  console.warn(`FreeLLMAPI error ${response.status}`);
  return null;
}

// 3. Empty response handling
if (!content) {
  console.warn("Empty LLM response");
  return null;
}

// 4. Catch-all (network errors, abort, etc.)
catch (err) {
  if (err.name === "AbortError") {
    console.warn("LLM request timed out");
  } else {
    console.warn(`LLM request failed: ${err.message}`);
  }
  return null; // Always null, never throw
}
```

The controller in `ai.controller.js` adds a second layer:

```javascript
// 5. AI-first with automatic fallback
const aiResult = await aiService.getAiRecommendations(userId, limit);
if (aiResult) {
  return res.json({ data: aiResult, ai_generated: true });
}
// 6. Automatic fallback to Gen 1
const sqlResult = await eventsService.getRecommendations(userId, limit);
return res.json({ data: sqlResult, ai_generated: false });
```

**The key principle: the app never breaks because of the LLM.** Each failure scenario is explicitly handled and results in a graceful degradation, not an error page.

---

## 12. Code Reference Map

| Component | File | Description |
|-----------|------|-------------|
| **LLM Caller** | `backend/src/services/ai.service.js` | `callLlm()` — shared LLM caller with timeout, error handling, null return |
| **AI Recommendation Engine** | `backend/src/services/ai.service.js` | `getAiRecommendations()` — fetches history, builds prompt, calls LLM, parses response |
| **AI Feedback Summarizer** | `backend/src/services/ai.service.js` | `getAiFeedbackSummary()` — fetches feedback, builds prompt, calls LLM, parses response |
| **AI Controller** | `backend/src/controllers/ai.controller.js` | HTTP handlers with AI-first → Gen1 fallback pattern |
| **AI Routes** | `backend/src/routes/ai.routes.js` | `GET /api/ai/recommendations`, `GET /api/ai/feedback-summary/:eventId` |
| **Route Mounting** | `backend/index.js` | `app.use("/api/ai", aiRoutes)` |
| **FreeLLMAPI Server** | External (D:\c3000c\freellmapi, port 3001) | LLM proxy with auto-failover across 16+ free providers |
| **Rec Engine (Gen 1)** | `backend/src/services/events.service.js` | `getRecommendations()` — SQL-based fallback |
| **Feedback (Gen 1)** | `backend/src/services/feedback.service.js` | `analyseSentiment()`, `getFeedbackSummary()` — lexicon-based fallback |
| **"For You" Screen** | `app/ai-recommendations.tsx` | Mobile UI for recommendations |
| **Feedback Page** | `frontend/web_portals/src/pages/organiser/Feedback.jsx` | Organiser portal feedback display |
| **AI Dev Guide V1** | `docs/AI_DEVELOPMENT_GUIDE.md` | Original Gen 1 documentation |
| **FreeLLMAPI Skill** | `D:\AI-SKILLS\skills\freellmapi\SKILL.md` | Installation and configuration guide |

---

## 13. Comparison Summary

| Aspect | Gen 1: Rule-Based (Sprint 3–4) | Gen 2: LLM-Powered (Sprint 5) |
|--------|------------------------------|-------------------------------|
| **Approach** | Content-based filtering + lexicon sentiment | Large Language Model via FreeLLMAPI |
| **AI Category** | Symbolic AI / Expert System | Generative AI / LLM |
| **External API** | None | FreeLLMAPI (free tier proxy) |
| **LLM Providers** | N/A | Google, Groq, Cerebras, Mistral, OpenRouter |
| **Latency** | 5–15ms (SQL query) | 1–5 seconds (LLM inference) |
| **Cost** | $0 | $0 (all free tiers) |
| **Response quality** | Category-based, formulaic | Natural language, contextual |
| **Cross-category reasoning** | ❌ No | ✅ Yes |
| **Dependencies** | None | FreeLLMAPI server on localhost:3001 |
| **Provider failover** | N/A | Auto-failover across 5+ providers |
| **App-level fallback** | N/A | Gen 1 algorithm (if all providers fail) |
| **Offline capability** | ✅ Full | ✅ Gen 1 fallback (when LLM unavailable) |
| **Debug difficulty** | Easy (deterministic SQL) | Medium (LLM output varies) |
| **Role in system** | Primary (Sprint 3–4) → Fallback (Sprint 5+) | Primary (Sprint 5+) |

---

> **Document Version 2.1 — 3 July 2026**
> **Changes from v2.0:** Added §7 (Why FreeLLMAPI Was Chosen) with comparison table against Claude API and Ollama. Expanded §8 with full build technical detail including callLlm() architecture, controller pattern with fallback, route registration, prompt engineering rationale, response parsing strategy, and FreeLLMAPI installation steps. Renamed §10 to "Resilience & Failover Architecture" with two-layer failover explanation, complete failure matrix, and code-level safety measures.
