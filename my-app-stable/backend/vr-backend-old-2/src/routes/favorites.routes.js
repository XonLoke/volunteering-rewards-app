/**
 * Favorites Routes
 *
 * Endpoints:
 *   POST  /api/favorites/:id — Toggle favorite/unfavorite for an event
 *
 * Mounted at: /api/favorites (see index.js)
 */

const { Router } = require("express");
const router = Router();
const controller = require("../controllers/me.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { roleGuard } = require("../middleware/role.middleware");
const { requireVolunteer } = roleGuard(["volunteer"]);

router.post("/:id", authenticate, requireVolunteer, controller.toggleFavorite);

module.exports = router;
