/**
 * Me Routes — Volunteer-specific data
 *
 * Endpoints:
 *   GET   /api/me/events    — My upcoming/past events
 *   GET   /api/me/qr-code   — My QR code data
 *   GET   /api/me/points    — Points balance + history
 *   GET   /api/me/coupons   — My redeemed coupons + PINs
 *   GET   /api/me/favorites — My favorite events
 *
 * Mounted at: /api/me (see index.js)
 */

const { Router } = require("express");
const router = Router();
const controller = require("../controllers/me.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { roleGuard } = require("../middleware/role.middleware");
const { requireVolunteer } = roleGuard(["volunteer"]);

router.use(authenticate, requireVolunteer);

router.get("/events", controller.myEvents);
router.get("/qr-code", controller.myQrCode);
router.get("/points", controller.myPoints);
router.get("/coupons", controller.myCoupons);
router.get("/favorites", controller.myFavorites);

module.exports = router;
