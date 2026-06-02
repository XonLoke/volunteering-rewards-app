const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

router.get("/", async (req, res, next) => {
  try {
    const userId = req.query.user_id;
    const { rows } = await pool.query(`
      SELECT a.*, e.title as event_title, e.location, e.points_value
      FROM attendance_logs a
      JOIN events e ON a.event_id = e.id
      WHERE a.user_id = $1
      ORDER BY a.scanned_at DESC
    `, [userId]);
    res.json({ scans: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;