/**
 * Events Routes
 *
 * Endpoints:
 *   GET    /api/events                     — Browse events (volunteer)
 *   GET    /api/events/categories          — List categories (volunteer)
 *   GET    /api/events/today               — Today's events (organiser)
 *   GET    /api/events/:id                 — Event detail (volunteer)
 *   POST   /api/events/:id/register        — Join event (volunteer)
 *   DELETE /api/events/:id/register        — Leave event (volunteer)
 *   POST   /api/events/:id/feedback        — Submit feedback (volunteer)
 *   GET    /api/events/:id/qna             — View Q&A (volunteer)
 *   POST   /api/events/:id/qna             — Ask question (volunteer)
 *   GET    /api/events/:id/roster          — Volunteer roster (organiser)
 *   GET    /api/events/:id/stats           — Check-in stats (organiser)
 *
 * Mounted at: /api/events (see index.js)
 *
 * Note: This route file serves BOTH volunteer and organiser endpoints
 * under /api/events. Role guarding is per-route, not global.
 */

const { Router } = require("express");
const router = Router();
const controller = require("../controllers/events.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// ─── Static Routes — AI Recommendations (before /:id) ────

// GET /api/events/recommended — AI-powered event recommendations (volunteer)
router.get("/recommended", authenticate, authorize("volunteer"), controller.recommended);

// GET /api/events/popular — Popular events fallback (volunteer)
router.get("/popular", authenticate, authorize("volunteer"), controller.popular);

// ─── Other Static Routes (must be declared before /:id) ──

// GET /api/events — Browse events (volunteer)
router.get("/", authenticate, authorize("volunteer"), controller.browse);

// GET /api/events/categories — List event categories (volunteer)
router.get("/categories", authenticate, authorize("volunteer"), controller.categories);

// GET /api/events/today — Today's events for scanning app (organiser)
router.get("/today", authenticate, authorize("organiser"), controller.today);

// ─── Parameterised Routes ────────────────────────────────

// GET /api/events/:id — Event detail (volunteer)
router.get("/:id", authenticate, authorize("volunteer"), controller.detail);

// POST /api/events/:id/register — Join event (volunteer)
router.post("/:id/register", authenticate, authorize("volunteer"), controller.join);

// DELETE /api/events/:id/register — Leave event (volunteer)
router.delete("/:id/register", authenticate, authorize("volunteer"), controller.leave);

// POST /api/events/:id/feedback — Submit feedback (volunteer)
router.post("/:id/feedback", authenticate, authorize("volunteer"), controller.submitFeedback);

// GET /api/events/:id/qna — View Q&A (volunteer)
router.get("/:id/qna", authenticate, authorize("volunteer"), controller.viewQna);

// POST /api/events/:id/qna — Ask a question (volunteer)
router.post("/:id/qna", authenticate, authorize("volunteer"), controller.askQuestion);

// GET /api/events/:id/roster — Registered volunteers with check-in status (organiser)
router.get("/:id/roster", authenticate, authorize("organiser"), controller.roster);

// GET /api/events/:id/stats — Check-in stats for scanning app (organiser)
router.get("/:id/stats", authenticate, authorize("organiser"), controller.stats);

module.exports = router;
