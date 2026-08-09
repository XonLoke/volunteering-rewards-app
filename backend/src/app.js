const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const eventsRoutes = require("./routes/events.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const meRoutes = require("./routes/me.routes");
const rewardsRoutes = require("./routes/rewards.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const aiRoutes = require("./routes/ai.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const settingsRoutes = require("./routes/settings.routes");
const contactRoutes = require("./routes/contact.routes");
const referralRoutes = require("./routes/referral.routes");
const merchantRoutes = require("./routes/merchant.routes");
const organiserRoutes = require("./routes/organiser.routes");
const adminRoutes = require("./routes/admin.routes");
const favoritesRoutes = require("./routes/favorites.routes");

const errorHandler = require("./middleware/errorHandler.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.json({ success: true, message: "Volunteering Rewards API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/events", feedbackRoutes);
app.use("/api/me", meRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/merchant", merchantRoutes);
app.use("/api/organiser", organiserRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/favorites", favoritesRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;