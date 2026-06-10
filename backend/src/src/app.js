const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const eventsRoutes = require("./routes/events.routes");
const couponsRoutes = require("./routes/coupons.routes");
const scansRoutes = require("./routes/scans.routes");
const myCouponsRoutes = require("./routes/my-coupons.routes");
const userStatsRoutes = require("./routes/user-stats.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const redeemRoutes = require("./routes/redeem.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const profileRoutes = require("./routes/profile.routes");
const recommendationRoutes = require("./routes/recommendations.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");

const { errorHandler } = require("./middleware/errorHandler.middleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow frontend/mobile app to access uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Volunteering Rewards API is running",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/scans", scansRoutes);
app.use("/api/my-coupons", myCouponsRoutes);
app.use("/api/user-stats", userStatsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/redeem", redeemRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
