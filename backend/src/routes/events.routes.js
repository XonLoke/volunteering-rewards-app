/**
 * Events Routes — Workflow B
 * Event CRUD, registration, QR scanning, feedback, Q&A.
 * Implemented in Sprint 2–3.
 */
const { Router } = require("express");
const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Events routes ready — controllers pending" });
});

module.exports = router;
