/**
 * AI Routes — LLM-Powered Feature Endpoints
 *
 * GET /api/ai/recommendations        — AI event recommendations (volunteer)
 * GET /api/ai/feedback-summary/:id   — AI feedback summary (organiser)
 *
 * Both fall back to existing algorithms when LLM is unavailable.
 */

const { Router } = require("express");
const router = Router();
const controller = require("../controllers/ai.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// AI Event Recommendations — volunteers only
router.get(
  "/recommendations",
  authenticate,
  authorize("volunteer"),
  controller.getRecommendations
);

// AI Feedback Summary — organisers only
router.get(
  "/feedback-summary/:eventId",
  authenticate,
  authorize("organiser"),
  controller.getFeedbackSummary
);

module.exports = router;
