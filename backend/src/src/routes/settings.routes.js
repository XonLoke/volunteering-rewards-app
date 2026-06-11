const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { pool } = require("../config/database");

// Auth middleware for this route
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handles different possible token formats
    req.user = {
      id: decoded.id || decoded.userId || decoded.user_id,
    };

    if (!req.user.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

// GET /api/settings
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    let result = await pool.query(
      `
      SELECT
        push_notifications,
        email_notifications,
        location_access,
        expo_push_token
      FROM user_settings
      WHERE user_id = $1
      `,
      [userId]
    );

    // If settings row does not exist yet, create it
    if (result.rows.length === 0) {
      result = await pool.query(
        `
        INSERT INTO user_settings (user_id)
        VALUES ($1)
        RETURNING
          push_notifications,
          email_notifications,
          location_access,
          expo_push_token
        `,
        [userId]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings
router.put("/", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      push_notifications,
      email_notifications,
      location_access,
      expo_push_token,
    } = req.body;

    // Make sure row exists first
    await pool.query(
      `
      INSERT INTO user_settings (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
      `,
      [userId]
    );

    const result = await pool.query(
      `
      UPDATE user_settings
      SET
        push_notifications = COALESCE($1, push_notifications),
        email_notifications = COALESCE($2, email_notifications),
        location_access = COALESCE($3, location_access),
        expo_push_token = COALESCE($4, expo_push_token),
        updated_at = NOW()
      WHERE user_id = $5
      RETURNING
        push_notifications,
        email_notifications,
        location_access,
        expo_push_token
      `,
      [
        push_notifications,
        email_notifications,
        location_access,
        expo_push_token,
        userId,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;