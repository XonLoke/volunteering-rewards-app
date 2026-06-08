//-----------------------------------------------------------------------
// SECTION: Referral Routes (F3)
//-----------------------------------------------------------------------
const { Router } = require("express");
const router = Router();
const controller = require("../controllers/referral.controller");
const { authenticate } = require("../middleware/auth.middleware");

// GET /api/me/referral-code — Get own referral code
router.get("/referral-code", authenticate, controller.getMyCode);

// GET /api/me/referral-stats — Get referral stats + downline
router.get("/referral-stats", authenticate, controller.getMyStats);

module.exports = router;
