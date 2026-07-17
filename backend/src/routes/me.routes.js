/**
 * Me Routes — Volunteer-specific data
 *
 * Endpoints:
 *   GET   /api/me/events             — My upcoming/past events
 *   GET   /api/me/qr-code            — My QR code data
 *   GET   /api/me/points             — Points balance + history
 *   GET   /api/me/coupons            — My redeemed coupons + PINs
 *   GET   /api/me/favorites          — My favorite events
 *   GET   /api/me/notifications      — My notifications list
 *   PATCH /api/me/notifications/read          — Mark all notifications as read
 *   PATCH /api/me/notifications/:id/read      — Mark one notification as read
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

// GET /api/me/notifications — List notifications for current user
router.get("/notifications", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, description, icon, color, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json({ notifications: rows });
  } catch (err) { next(err); }
});

// PATCH /api/me/notifications/read — Mark all as read
router.patch("/notifications/read", async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
      [req.user.id]
    );
    res.json({ message: "All notifications marked as read." });
  } catch (err) { next(err); }
});

// PATCH /api/me/notifications/:id/read — Mark one as read
router.patch("/notifications/:id/read", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 AND is_read = FALSE",
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: { code: "not_found", message: "Notification not found or already read." } });
    res.json({ message: "Notification marked as read." });
  } catch (err) { next(err); }
});

module.exports = router;
