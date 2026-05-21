/**
 * Admin Routes — Admin Web Portal
 *
 * Endpoints:
 *   GET   /api/admin/dashboard                     — Dashboard metrics
 *   GET   /api/admin/users                         — List users
 *   GET   /api/admin/users/:id                     — User detail
 *   PUT   /api/admin/users/:id                     — Update user
 *   DELETE /api/admin/users/:id                    — Deactivate user
 *   GET   /api/admin/organisers                    — List organisers
 *   PUT   /api/admin/organisers/:id/approve        — Approve/reject organiser
 *   GET   /api/admin/events                        — List all events
 *   DELETE /api/admin/events/:id                   — Remove event
 *   GET   /api/admin/events/:id/participation      — Event participation data
 *   GET   /api/admin/coupons                       — List coupon batches
 *   POST  /api/admin/coupons                       — Create coupon batch
 *   PUT   /api/admin/coupons/:id                   — Update coupon
 *   DELETE /api/admin/coupons/:id                  — Delete coupon
 *   GET   /api/admin/rewards/configuration         — Get points config
 *   PUT   /api/admin/rewards/configuration         — Update points config
 *   GET   /api/admin/redemptions                   — Redemption history
 *
 * Mounted at: /api/admin (see index.js)
 */

const { Router } = require("express");
const router = Router();
const controller = require("../controllers/admin.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { roleGuard } = require("../middleware/role.middleware");
const { requireAdmin } = roleGuard(["admin"]);

router.use(authenticate, requireAdmin);

// Dashboard
router.get("/dashboard", controller.dashboard);

// Users
router.get("/users", controller.listUsers);
router.get("/users/:id", controller.getUser);
router.put("/users/:id", controller.updateUser);
router.put("/users/:id/reset-password", controller.resetPassword);
router.delete("/users/:id", controller.deactivateUser);

// Organisers
router.get("/organisers", controller.listOrganisers);
router.put("/organisers/:id/approve", controller.approveOrganiser);

// Events
router.get("/events", controller.listEvents);
router.delete("/events/:id", controller.deleteEvent);
router.get("/events/:id/participation", controller.eventParticipation);

// Coupons
router.get("/coupons", controller.listCoupons);
router.post("/coupons", controller.createCoupon);
router.put("/coupons/:id", controller.updateCoupon);
router.delete("/coupons/:id", controller.deleteCoupon);

// Rewards Config
router.get("/rewards/configuration", controller.getRewardsConfig);
router.put("/rewards/configuration", controller.updateRewardsConfig);

// Merchants
router.get("/merchants", controller.listMerchants);
router.post("/merchants", controller.createMerchant);
router.get("/merchants/:id/products", controller.listMerchantProducts);
router.post("/merchants/:id/products", controller.createMerchantProduct);

// Redemptions
router.get("/redemptions", controller.listRedemptions);

module.exports = router;
