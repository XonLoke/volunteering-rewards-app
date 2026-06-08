//-----------------------------------------------------------------------
// SECTION: Feedback Routes (F2)
//-----------------------------------------------------------------------
const { Router } = require("express");
const router = Router();
const controller = require("../controllers/feedback.controller");
const { authenticate } = require("../middleware/auth.middleware");

// GET /api/events/:id/feedback/summary — AI feedback summary
router.get("/:id/feedback/summary", authenticate, controller.getSummary);

module.exports = router;
