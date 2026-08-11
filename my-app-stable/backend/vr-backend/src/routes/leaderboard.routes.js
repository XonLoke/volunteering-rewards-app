//-----------------------------------------------------------------------
// SECTION: Leaderboard Routes (F4)
//-----------------------------------------------------------------------
const { Router } = require("express");
const router = Router();
const controller = require("../controllers/leaderboard.controller");
const { authenticate } = require("../middleware/auth.middleware");

// GET /api/leaderboard — All categories
router.get("/", authenticate, controller.getAll);

// GET /api/leaderboard/points — Top 3 by points
router.get("/points", authenticate, controller.getPoints);

// GET /api/leaderboard/events — Top 3 by events attended
router.get("/events", authenticate, controller.getEvents);

// GET /api/leaderboard/checkins — Top 3 by check-ins
router.get("/checkins", authenticate, controller.getCheckins);

// GET /api/leaderboard/redeemed — Top 3 by points redeemed
router.get("/redeemed", authenticate, controller.getRedeemed);

module.exports = router;
