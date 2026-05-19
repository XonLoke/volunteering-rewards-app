/**
 * Merchant Redemption Controller — Coupon PIN verification and redemption
 *
 * Response shapes defined in API_CONTRACTS.md (Merchant Redemption App section).
 */

// ─── POST /api/coupons/verify ────────────────────────────────
async function verify(req, res, next) {
  try {
    // TODO: REW-05 — Check PIN exists, not expired, not already redeemed, stock available
    // Body: { pin: "483291", merchant_id }
    // Errors: invalid_pin, expired, already_redeemed, out_of_stock
    res.json({
      valid: true,
      coupon: { id: "", coupon_type: "", value_cents: 0, points_cost: 0, valid_until: "", is_redeemed: false, quantity_remaining: 0 },
    });
  } catch (err) { next(err); }
}

// ─── POST /api/coupons/redeem ────────────────────────────────
async function redeem(req, res, next) {
  try {
    // TODO: REW-03 — Mark coupon as redeemed, decrement stock
    // Body: { pin, merchant_id }
    // Errors: invalid_pin, expired, already_redeemed, out_of_stock
    res.json({
      success: true,
      redemption: { id: "", pin: "", coupon_type: "", value_cents: 0, redeemed_at: "", merchant_name: "" },
    });
  } catch (err) { next(err); }
}

// ─── POST /api/coupons/reverse ───────────────────────────────
async function reverse(req, res, next) {
  try {
    // TODO: REW-07 — Undo redemption within 5 minutes
    // Body: { redemption_id, merchant_id }
    // Errors: not_found, not_owned_by_merchant, too_late
    res.json({ success: true, message: "Redemption reversed", reversed_at: "" });
  } catch (err) { next(err); }
}

// ─── GET /api/merchant/history ───────────────────────────────
async function history(req, res, next) {
  try {
    // TODO: REW-09 — Last 20 redemptions for this merchant
    // Query: ?page=1&limit=20
    res.json({ data: [], total: 0, page: 1, limit: 20 });
  } catch (err) { next(err); }
}

module.exports = { verify, redeem, reverse, history };
