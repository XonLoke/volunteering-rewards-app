/**
 * Volunteering Rewards App — Backend Entry Point
 * Express server with middleware stack and route registration.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimiter = require("./src/middleware/rateLimiter.middleware");
const errorHandler = require("./src/middleware/errorHandler.middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware Stack ────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(rateLimiter.global);

// ─── Health Check ────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Routes (registered per-workflow) ────────────────────
// Workflow A — Auth & User Management (Sprint 1–2)
app.use("/api/auth", require("./src/routes/auth.routes"));

// Workflow B — Events & QR Attendance (Sprint 2–3)
app.use("/api/events", require("./src/routes/events.routes"));

// Workflow C — Rewards & Redemption (Sprint 3–4)
app.use("/api/rewards", require("./src/routes/rewards.routes"));

// ─── 404 Handler ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

module.exports = app; // Export for testing
