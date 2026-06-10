//-----------------------------------------------------------------------
// SECTION: Referral Routes (F3)
//-----------------------------------------------------------------------
const { Router } = require("express");
const router = Router();
const controller = require("../controllers/referral.controller");
const { authenticate } = require("../middleware/auth.middleware");

// GET /api/me/sponsorship-profile — Get sponsorship profile + downline
router.get("/sponsorship-profile", authenticate, controller.getMyProfile);

module.exports = router;
