/**
 * Rewards Routes — Volunteer-facing rewards & redemption
 *
 * Endpoints:
 *   GET   /api/rewards           — Browse available rewards (volunteer)
 *   GET   /api/rewards/:id       — Reward detail (volunteer)
 *   POST  /api/rewards/:id/redeem — Redeem reward with points (volunteer)
 *
 * Mounted at: /api/rewards (see index.js)
 */

const { Router } = require("express");
const router = Router();
const controller = require("../controllers/rewards.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// GET /api/rewards — Browse available rewards
router.get("/", authenticate, authorize("volunteer"), controller.browse);

// GET /api/rewards/:id — Reward detail
router.get("/:id", authenticate, authorize("volunteer"), controller.detail);

// POST /api/rewards/:id/redeem — Redeem reward with points (online)
router.post("/:id/redeem", authenticate, authorize("volunteer"), controller.redeem);

module.exports = router;
