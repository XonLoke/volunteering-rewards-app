/**
 * Volunteering Rewards App — Backend Entry Point
 * Express server with middleware stack and route registration.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const rateLimiter = require("./src/middleware/rateLimiter.middleware");
const errorHandler = require("./src/middleware/errorHandler.middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware Stack ────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for dev — enable in prod
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(rateLimiter.global);

// ─── Serve Frontend Prototypes (static files) ───────────
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ─── Health Check ────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API Routes ─────────────────────────────────────────
// Workflow A — Auth & User Management
app.use("/api/auth", require("./src/routes/auth.routes"));

// Workflow B — Events & QR Attendance
app.use("/api/events", require("./src/routes/events.routes"));
app.use("/api/attendance", require("./src/routes/attendance.routes"));

// Volunteer-specific data
app.use("/api/me", require("./src/routes/me.routes"));

// Favorites toggle
app.use("/api/favorites", require("./src/routes/favorites.routes"));

// Workflow C — Rewards & Redemption
app.use("/api/rewards", require("./src/routes/rewards.routes"));

// Organiser Web Portal
app.use("/api/organiser", require("./src/routes/organiser.routes"));

// Admin Web Portal
app.use("/api/admin", require("./src/routes/admin.routes"));

// Merchant Redemption App
app.use("/api", require("./src/routes/merchant.routes"));

// ─── 404 Handler ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: "not_found", message: "Route not found" } });
});

// ─── Global Error Handler ────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

module.exports = app;
