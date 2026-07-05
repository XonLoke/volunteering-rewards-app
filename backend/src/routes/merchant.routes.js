/**
 * Merchant Redemption Routes — Merchant App
 *
 * Endpoints:
 *   POST  /api/coupons/verify   — Verify 6-digit PIN
 *   POST  /api/coupons/redeem   — Mark coupon as used
 *   POST  /api/coupons/reverse  — Undo last redemption (5-min window)
 *   GET   /api/merchant/history — Recent redemptions
 *
 * Mounted at: /api (see index.js)
 */

const { Router } = require("express");
const router = Router();
const controller = require("../controllers/merchant.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// Allow both merchant (POS) and admin (web portal) to verify/redeem coupons
const requireMerchantOrAdmin = authorize("merchant", "admin");

router.post("/coupons/verify",  authenticate, requireMerchantOrAdmin, controller.verify);   // REW-05
router.post("/coupons/redeem",  authenticate, requireMerchantOrAdmin, controller.redeem);   // REW-03
router.post("/coupons/reverse", authenticate, requireMerchantOrAdmin, controller.reverse);  // REW-07
router.get("/merchant/history", authenticate, requireMerchantOrAdmin, controller.history);  // REW-09

// ─── Merchant Dashboard ────────────────────────────────────
router.get("/merchant/dashboard", authenticate, requireMerchantOrAdmin, controller.dashboard);

// ─── Merchant Products CRUD ────────────────────────────────
router.get("/merchant/products", authenticate, requireMerchantOrAdmin, controller.listProducts);
router.post("/merchant/products", authenticate, requireMerchantOrAdmin, controller.createProduct);
router.put("/merchant/products/:id", authenticate, requireMerchantOrAdmin, controller.updateProduct);
router.delete("/merchant/products/:id", authenticate, requireMerchantOrAdmin, controller.deleteProduct);

// ─── Merchant Redemption Records ──────────────────────────
router.get("/merchant/redemptions", authenticate, requireMerchantOrAdmin, controller.listRedemptions);

module.exports = router;
