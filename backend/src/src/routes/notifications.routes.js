const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

router.get("/", async (req, res, next) => {
  try {
    const userId = req.query.user_id;
    const { rows } = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ notifications: rows });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.patch("/read-all", async (req, res, next) => {
  try {
    const userId = req.query.user_id;
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [userId]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;