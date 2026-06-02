const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

router.get("/", async (req, res, next) => {
  try {
    const userId = req.query.user_id;
    
    // Total events attended
    const eventsCount = await pool.query(
      `SELECT COUNT(*) FROM attendance_logs WHERE user_id = $1`,
      [userId]
    );
    
    // Total rewards (coupons redeemed)
    const rewardsCount = await pool.query(
      `SELECT COUNT(*) FROM user_coupons WHERE user_id = $1`,
      [userId]
    );
    
    // Total hours (assume 2 hours per event for now)
    const hours = parseInt(eventsCount.rows[0].count) * 2;
    
    res.json({
      hours,
      events: parseInt(eventsCount.rows[0].count),
      rewards: parseInt(rewardsCount.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;