/**
 * Rewards Controller — Volunteer-facing rewards
 *
 * Response shapes defined in API_CONTRACTS.md (Volunteer Mobile App section).
 */

// ─── GET /api/rewards ────────────────────────────────────────
async function browse(req, res, next) {
  try {
    // TODO: REW-02 — List available rewards with quantity_remaining
    // Query: ?type=online|instore
    res.json({ data: [] });
  } catch (err) { next(err); }
}

// ─── POST /api/rewards/:id/redeem ────────────────────────────
async function redeem(req, res, next) {
  try {
    // TODO: REW-03 — Deduct points, generate PIN, create user_coupon record
    // Errors: insufficient_points, out_of_stock
    res.status(201).json({
      coupon: { id: "", title: "", pin_code: "", value_cents: 0, points_cost: 0, valid_until: "", redeemed_at: "" },
      points_remaining: 0,
    });
  } catch (err) { next(err); }
}

// ─── GET /api/rewards/:id ─────────────────────────────────────
async function detail(req, res, next) {
  try {
    // TODO: REW-04 — Return single reward with quantity_remaining
    // Errors: not_found
    res.json({ id: req.params.id });
  } catch (err) { next(err); }
}

module.exports = { browse, detail, redeem };
