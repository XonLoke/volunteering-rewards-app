/**
 * AI Service — LLM-Powered Features via FreeLLMAPI
 *
 * Provides:
 *   getAiRecommendations(userId, limit)  — Smart event recommendations
 *   getAiFeedbackSummary(eventId)         — Feedback summarisation
 *
 * Architecture:
 *   Service → callLlm(prompt) → FreeLLMAPI (localhost:3001)
 *                              → Google AI / Groq / Cerebras / etc.
 *                              → auto-failover on 429/5xx
 *
 * Graceful degradation:
 *   If LLM is unavailable, returns null so callers can fall back to
 *   existing SQL-based / lexicon-based algorithms.
 */

const { pool } = require("../config/database");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const FRELLMAPI_URL = process.env.FRELLMAPI_URL || "http://localhost:3001";
const FRELLMAPI_KEY = process.env.FRELLMAPI_KEY || "";

// ---------------------------------------------------------------------------
// Shared LLM Caller
// ---------------------------------------------------------------------------

/**
 * Send a prompt to FreeLLMAPI and return the assistant's reply text.
 * Returns null on any error (network, timeout, API error) — never throws.
 *
 * @param {string} prompt  - The user/content prompt
 * @param {object} [opts]  - Optional overrides
 * @param {number} [opts.maxTokens=1024]
 * @param {number} [opts.temperature=0.3]
 * @returns {Promise<string|null>}
 */
async function callLlm(prompt, opts = {}) {
  const maxTokens = opts.maxTokens ?? 1024;
  const temperature = opts.temperature ?? 0.3;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(`${FRELLMAPI_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FRELLMAPI_KEY}`,
      },
      body: JSON.stringify({
        model: "auto", // FreeLLMAPI router picks best available
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for a volunteer rewards platform. " +
              "Respond with concise, well-structured JSON only.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.warn(
        `[ai.service] FreeLLMAPI error ${response.status}: ${text.slice(0, 200)}`
      );
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.warn("[ai.service] Empty LLM response");
      return null;
    }
    return content.trim();
  } catch (err) {
    if (err.name === "AbortError") {
      console.warn("[ai.service] LLM request timed out");
    } else {
      console.warn(`[ai.service] LLM request failed: ${err.message}`);
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// AI Feature 1: Smart Event Recommendations
// ---------------------------------------------------------------------------

/**
 * Build a prompt that asks the LLM to recommend events based on the
 * volunteer's past attendance history.
 *
 * @param {{ category: string, weight: number }[]}  history
 * @param {{ id: number, title: string, category: string, event_date: string,
 *           points_value: number, registrations: number, capacity: number }[]}  events
 * @param {number} limit
 * @returns {string}
 */
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

/**
 * Get AI-powered event recommendations for a volunteer.
 *
 * Falls back gracefully: returns null if the LLM is unavailable, letting
 * callers use the existing SQL-based getRecommendations().
 *
 * @param {number} userId
 * @param {number} [limit=5]
 * @returns {Promise<{ id: number, title: string, category: string,
 *                     match_score: number, reasoning: string,
 *                     points_value: number }[]|null>}
 */
async function getAiRecommendations(userId, limit = 5) {
  try {
    // 1. Get the volunteer's past attendance (grouped by category)
    const historyResult = await pool.query(
      `SELECT e.category, COUNT(*)::int AS weight
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE er.user_id = $1
         AND e.event_date < NOW()
         AND e.status IN ('completed', 'active')
         AND e.category IS NOT NULL
       GROUP BY e.category
       ORDER BY weight DESC`,
      [userId]
    );
    const history = historyResult.rows;

    // If no history, LLM can't personalise — return null to fall back
    if (history.length === 0) return null;

    // 2. Get upcoming events the volunteer hasn't registered for
    const eventsResult = await pool.query(
      `SELECT e.id, e.title, e.category,
              to_char(e.event_date, 'YYYY-MM-DD') AS event_date,
              e.points_value,
              (SELECT COUNT(*)::int FROM event_registrations er2
               WHERE er2.event_id = e.id AND er2.status = 'registered') AS registrations,
              e.capacity
       FROM events e
       WHERE e.event_date > NOW()
         AND e.status IN ('active', 'upcoming')
         AND e.id NOT IN (
           SELECT er3.event_id FROM event_registrations er3
           WHERE er3.user_id = $1 AND er3.status = 'registered'
         )
       ORDER BY e.event_date ASC
       LIMIT 30`,
      [userId]
    );
    const events = eventsResult.rows;

    if (events.length === 0) return [];

    // 3. Build prompt and call LLM
    const prompt = buildRecommendationPrompt(history, events, limit);
    const llmResult = await callLlm(prompt);

    if (!llmResult) return null; // LLM failed → fall back

    // 4. Parse the JSON array of event IDs
    let recommendedIds;
    try {
      // Find JSON array in the response (handles extra text around it)
      const jsonMatch = llmResult.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) throw new Error("No JSON array found in LLM response");
      recommendedIds = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.warn("[ai.service] Failed to parse LLM recommendation response:", parseErr.message);
      return null;
    }

    if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
      return null;
    }

    // 5. Map IDs back to event objects
    const idSet = new Set(recommendedIds.slice(0, limit));
    return events
      .filter((e) => idSet.has(e.id))
      .map((e, idx) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        match_score: Math.round(100 - idx * 5), // synthetic score based on rank
        reasoning: "Recommended based on your past volunteering interests.",
        points_value: e.points_value,
      }));
  } catch (err) {
    console.warn(`[ai.service] getAiRecommendations error: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// AI Feature 2: Feedback AI Summary
// ---------------------------------------------------------------------------

/**
 * Build a prompt that asks the LLM to summarise event feedback.
 *
 * @param {{ rating: number, comment: string }[]}  feedbacks
 * @returns {string}
 */
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

/**
 * Get AI-powered feedback summary for an event.
 *
 * Falls back gracefully: returns null if the LLM is unavailable.
 *
 * @param {number} eventId
 * @returns {Promise<object|null>}
 */
async function getAiFeedbackSummary(eventId) {
  try {
    // 1. Fetch feedback for this event
    const result = await pool.query(
      `SELECT ef.rating, ef.comment
       FROM event_feedback ef
       WHERE ef.event_id = $1
         AND ef.comment IS NOT NULL
         AND ef.comment != ''
       ORDER BY ef.created_at DESC`,
      [eventId]
    );
    const feedbacks = result.rows;

    if (feedbacks.length === 0) {
      return { total_feedback: 0 };
    }

    // 2. Build prompt and call LLM
    const prompt = buildSummaryPrompt(feedbacks);
    const llmResult = await callLlm(prompt, { maxTokens: 2048 });

    if (!llmResult) return null; // LLM failed → fall back

    // 3. Parse the JSON response
    try {
      const jsonMatch = llmResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found");
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        total_feedback: feedbacks.length,
        ai_generated: true,
      };
    } catch (parseErr) {
      console.warn("[ai.service] Failed to parse LLM summary response:", parseErr.message);
      return null;
    }
  } catch (err) {
    console.warn(`[ai.service] getAiFeedbackSummary error: ${err.message}`);
    return null;
  }
}

module.exports = {
  callLlm,
  getAiRecommendations,
  getAiFeedbackSummary,
};
