const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

router.get("/", async (req, res, next) => {
  try {
    const userId = req.query.user_id;
    const { rows } = await pool.query(`
      SELECT uc.*, c.title, c.description, c.image_url
      FROM user_coupons uc
      JOIN coupons c ON uc.coupon_id = c.id
      WHERE uc.user_id = $1
      ORDER BY uc.created_at DESC
    `, [userId]);
    res.json({ coupons: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;