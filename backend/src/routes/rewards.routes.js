/**
 * Rewards Routes — Workflow C
 * Coupon listing, redemption, PIN verification, history.
 * Implemented in Sprint 3–4.
 */
const { Router } = require("express");
const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Rewards routes ready — controllers pending" });
});

module.exports = router;
