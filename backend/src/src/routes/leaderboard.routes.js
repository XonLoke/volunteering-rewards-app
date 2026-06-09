const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// GET /api/leaderboard?user_id=1
// Hall of Fame / Top volunteers
router.get("/", async (req, res, next) => {
  try {
    const userId = req.query.user_id ? Number(req.query.user_id) : null;

    const topResult = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        points,
        ROW_NUMBER() OVER (ORDER BY points DESC, id ASC)::int AS rank
      FROM users
      WHERE status = 'active'
      ORDER BY points DESC, id ASC
      LIMIT 10
      `
    );

    let myRank = null;

    if (userId) {
      const myRankResult = await pool.query(
        `
        SELECT *
        FROM (
          SELECT
            id,
            name,
            email,
            points,
            ROW_NUMBER() OVER (ORDER BY points DESC, id ASC)::int AS rank
          FROM users
          WHERE status = 'active'
        ) ranked_users
        WHERE id = $1
        `,
        [userId]
      );

      myRank = myRankResult.rows[0] || null;
    }

    res.json({
      success: true,
      leaderboard: topResult.rows,
      my_rank: myRank,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;