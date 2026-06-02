const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const crypto = require("crypto");

router.post("/", async (req, res, next) => {
  try {
    const { user_id, coupon_id } = req.body;

    // Check user has enough points
    const userRes = await pool.query(
      `SELECT points FROM users WHERE id = $1`, [user_id]
    );
    const user = userRes.rows[0];

    // Get coupon points required
    const couponRes = await pool.query(
      `SELECT points_required FROM coupons WHERE id = $1`, [coupon_id]
    );
    const coupon = couponRes.rows[0];

    if (user.points < coupon.points_required) {
      return res.status(400).json({ error: "Not enough points" });
    }

    // Generate 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if user already has this coupon unredeemed
    const existing = await pool.query(
      `SELECT * FROM user_coupons WHERE user_id = $1 AND coupon_id = $2 AND status = 'unused'`,
      [user_id, coupon_id]
    );

    let userCoupon;
    if (existing.rows.length > 0) {
      userCoupon = existing.rows[0];
    } else {
      // Deduct points
      await pool.query(
        `UPDATE users SET points = points - $1 WHERE id = $2`,
        [coupon.points_required, user_id]
      );

      // Insert user_coupon with PIN
      const insertRes = await pool.query(
        `INSERT INTO user_coupons (user_id, coupon_id, pin_hash, status, expiry_date)
         VALUES ($1, $2, $3, 'unused', NOW() + INTERVAL '1 year')
         RETURNING *`,
        [user_id, coupon_id, pin]
      );
      userCoupon = insertRes.rows[0];

      // Reduce coupon quantity
      await pool.query(
        `UPDATE coupons SET quantity = quantity - 1 WHERE id = $1`,
        [coupon_id]
      );
    }

    res.json({ success: true, pin: userCoupon.pin_hash });
  } catch (err) {
    next(err);
  }
});

module.exports = router;