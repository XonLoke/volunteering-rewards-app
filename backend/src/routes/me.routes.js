/**
 * Me Routes — Volunteer-specific data
 *
 * Endpoints:
 *   GET   /api/me/events       — My upcoming/past events
 *   GET   /api/me/qr-code      — My QR code data
 *   GET   /api/me/points       — Points balance + history
 *   GET   /api/me/coupons      — My redeemed coupons + PINs
 *   GET   /api/me/favorites    — My favorite events
 *   GET   /api/me/notifications — My notification preferences
 *
 * Mounted at: /api/me (see index.js)
 */

const { Router } = require("express");
const router = Router();
const controller = require("../controllers/me.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { roleGuard } = require("../middleware/role.middleware");
const { requireVolunteer } = roleGuard(["volunteer"]);
const { pool } = require("../config/database");

router.use(authenticate, requireVolunteer);

router.get("/events", controller.myEvents);
router.get("/qr-code", controller.myQrCode);
router.get("/points", controller.myPoints);
router.get("/coupons", controller.myCoupons);
router.get("/favorites", controller.myFavorites);

// GET /api/me/notifications — Get notification preferences
router.get("/notifications", async (req, res, next) => {
  try {
    const userId = req.user.id;
    let result = await pool.query(
      `SELECT push_notifications, email_notifications, expo_push_token
       FROM user_settings WHERE user_id = $1`,
      [userId]
    );

    // Auto-create defaults if missing
    if (result.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO user_settings (user_id)
         VALUES ($1)
         RETURNING push_notifications, email_notifications, expo_push_token`,
        [userId]
      );
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
