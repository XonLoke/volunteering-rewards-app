/**
 * Merchant Redemption Controller — Coupon PIN verification and redemption
 *
 * Response shapes defined in API_CONTRACTS.md (Merchant Redemption App section).
 */

const merchantService = require("../services/merchant.service");

// POST /api/coupons/verify
async function verify(req, res, next) {
  try {
    const result = await merchantService.verifyPin(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/coupons/redeem
async function redeem(req, res, next) {
  try {
    const result = await merchantService.redeemCoupon(req.body, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/coupons/reverse
async function reverse(req, res, next) {
  try {
    const result = await merchantService.reverseRedemption(req.body, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/merchant/history
async function history(req, res, next) {
  try {
    // 🔒 SECURITY (5 Aug audit #8): pass the caller so the service can scope
    // history to the merchant (admins still see everything).
    const result = await merchantService.getRedemptionHistory(req.query, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Merchant Dashboard
// ---------------------------------------------------------------------------

async function dashboard(req, res, next) {
  try {
    const result = await merchantService.getDashboardStats(req.user.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Merchant Products CRUD
// ---------------------------------------------------------------------------

async function listProducts(req, res, next) {
  try {
    const result = await merchantService.listProducts(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const result = await merchantService.createProduct(req.user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const result = await merchantService.updateProduct(req.user.id, req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const result = await merchantService.deleteProduct(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Detailed Redemption Records (Merchant-specific)
// ---------------------------------------------------------------------------

async function listRedemptions(req, res, next) {
  try {
    const result = await merchantService.listRedemptions(req.user.id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  verify, redeem, reverse, history,
  dashboard,
  listProducts, createProduct, updateProduct, deleteProduct,
  listRedemptions,
};