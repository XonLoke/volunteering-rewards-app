const express = require("express");
const router = express.Router();

const database = require("../config/database");
const attendanceService = require("../services/attendance.service");

const pool = database.pool || database;

router.post("/scan", async (req, res, next) => {
  try {
    const eventId = Number(req.body.eventId);
    const volunteerId = Number(req.body.volunteerId);

    if (
      !Number.isInteger(eventId) ||
      eventId <= 0 ||
      !Number.isInteger(volunteerId) ||
      volunteerId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid eventId and volunteerId are required.",
      });
    }

    const result = await attendanceService.scanQR(eventId, volunteerId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/volunteer/:volunteerId/latest", async (req, res, next) => {
  try {
    const volunteerId = Number(req.params.volunteerId);
    const after = req.query.after;

    if (!Number.isInteger(volunteerId) || volunteerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid volunteer ID is required.",
      });
    }

    if (typeof after !== "string" || after.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "The after timestamp is required.",
      });
    }

    const afterDate = new Date(after);

    if (Number.isNaN(afterDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "The after timestamp is invalid.",
      });
    }

    if (!pool || typeof pool.query !== "function") {
      throw new Error(
        "PostgreSQL pool is not exported correctly from config/database.js"
      );
    }

    const result = await pool.query(
      `
      SELECT
        al.id,
        al.event_id,
        al.user_id,
        al.points_awarded AS points_earned,
        al.scanned_at,
        e.title AS event_name,
        e.location,
        u.points AS total_points
      FROM attendance_logs al
      INNER JOIN events e
        ON e.id = al.event_id
      INNER JOIN users u
        ON u.id = al.user_id
      WHERE al.user_id = $1
        AND al.scanned_at > $2::timestamp
      ORDER BY al.scanned_at DESC
      LIMIT 1
      `,
      [volunteerId, afterDate.toISOString()]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        found: false,
        attendance: null,
      });
    }

    const attendance = result.rows[0];

    return res.status(200).json({
      success: true,
      found: true,
      attendance: {
        id: attendance.id,
        eventId: attendance.event_id,
        eventName: attendance.event_name || "Volunteer Event",
        location: attendance.location || "Attendance confirmed",
        pointsEarned: Number(attendance.points_earned || 0),
        totalPoints: Number(attendance.total_points || 0),
        scannedAt: attendance.scanned_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
