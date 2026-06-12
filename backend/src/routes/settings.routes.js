/**
 * Settings Routes — User notification & preference settings
 *
 * Endpoints:
 *   GET  /api/settings     — Read current user settings (auto-creates defaults if missing)
 *   PUT  /api/settings     — Update user settings (partial update with COALESCE)
 *
 * Mounted at: /api/settings (see index.js)
 * Auth: JWT Bearer token (uses shared auth.middleware)
 *
 * Original by Vivian, adapted by Xon to use shared middleware + DB migration 022.
 */

const { Router } = require("express");
const router = Router();
const { pool } = require("../config/database");
const { authenticate } = require("../middleware/auth.middleware");

// All settings routes require authentication
router.use(authenticate);

//-----------------------------------------------------------------------
// SECTION: GET /api/settings
// Purpose: Fetch the authenticated user's settings.
//          If no settings row exists, auto-creates one with defaults.
//-----------------------------------------------------------------------
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Attempt to read existing settings
    let result = await pool.query(
      `SELECT push_notifications, email_notifications, location_access, expo_push_token
       FROM user_settings WHERE user_id = $1`,
      [userId]
    );

    // Auto-create default settings row if missing
    if (result.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO user_settings (user_id)
         VALUES ($1)
         RETURNING push_notifications, email_notifications, location_access, expo_push_token`,
        [userId]
      );
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

//-----------------------------------------------------------------------
// SECTION: PUT /api/settings
// Purpose: Update the authenticated user's settings.
//          Uses COALESCE for partial updates — only provided fields change.
//-----------------------------------------------------------------------
router.put("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { push_notifications, email_notifications, location_access, expo_push_token } = req.body;

    // Ensure settings row exists first (upsert)
    await pool.query(
      `INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    // Partial update — only overwrite provided fields
    const result = await pool.query(
      `UPDATE user_settings
       SET push_notifications      = COALESCE($1, push_notifications),
           email_notifications     = COALESCE($2, email_notifications),
           location_access         = COALESCE($3, location_access),
           expo_push_token         = COALESCE($4, expo_push_token),
           updated_at              = NOW()
       WHERE user_id = $5
       RETURNING push_notifications, email_notifications, location_access, expo_push_token`,
      [push_notifications, email_notifications, location_access, expo_push_token, userId]
    );

    res.json({ data: result.rows[0], message: "Settings updated." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
