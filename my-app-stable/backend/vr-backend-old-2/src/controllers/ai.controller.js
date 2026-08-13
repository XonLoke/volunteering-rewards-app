/**
 * AI Controller — HTTP handlers for AI-powered features
 */

const aiService = require("../services/ai.service");
const eventsService = require("../services/events.service");
const feedbackService = require("../services/feedback.service");

/**
 * GET /api/ai/recommendations
 *
 * Returns AI-powered event recommendations for the logged-in volunteer.
 * Falls back to SQL-based recommendations if LLM is unavailable.
 *
 * Query params:
 *   limit (number, default 5) — number of recommendations
 */
async function getRecommendations(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 5, 10);

    // Try AI-first (Gen 2)
    const aiResult = await aiService.getAiRecommendations(userId, limit);

    if (aiResult) {
      return res.json({
        data: aiResult,
        ai_generated: true,
      });
    }

    // Fallback to SQL-based recommendations (Gen 1)
    console.log("[ai.controller] LLM unavailable, using SQL recommendations");
    const sqlResult = await eventsService.getRecommendations(userId, limit);

    return res.json({
      data: sqlResult,
      ai_generated: false,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/feedback-summary/:eventId
 *
 * Returns AI-powered feedback summary for an event.
 * Falls back to lexicon-based summary if LLM is unavailable.
 */
async function getFeedbackSummary(req, res, next) {
  try {
    const eventId = parseInt(req.params.eventId);
    if (!eventId) {
      return res.status(400).json({ error: { code: "invalid_id", message: "Invalid event ID" } });
    }

    // Try AI-first (Gen 2)
    const aiResult = await aiService.getAiFeedbackSummary(eventId);

    if (aiResult) {
      return res.json({
        data: aiResult,
        ai_generated: true,
      });
    }

    // Fallback to lexicon-based sentiment analysis (Gen 1)
    console.log("[ai.controller] LLM unavailable, using sentiment analysis");
    const sqlResult = await feedbackService.getFeedbackSummary(eventId);

    return res.json({
      data: sqlResult,
      ai_generated: false,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRecommendations,
  getFeedbackSummary,
};
