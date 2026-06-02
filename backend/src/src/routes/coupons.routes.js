const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM coupons
      WHERE status = 'active' AND quantity > 0
      ORDER BY points_required ASC
    `);
    res.json({ coupons: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;