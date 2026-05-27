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
    const result = await merchantService.getRedemptionHistory(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { verify, redeem, reverse, history };