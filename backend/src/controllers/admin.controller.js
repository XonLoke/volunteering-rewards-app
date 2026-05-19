/**
 * Admin Controller — Admin Web Portal
 *
 * Response shapes defined in API_CONTRACTS.md (Admin Web Portal section).
 */

// ─── GET /api/admin/dashboard ────────────────────────────────
async function dashboard(req, res, next) {
  try {
    res.json({ stats: {}, recent_activity: [], current_date: "", last_updated: "" });
  } catch (err) { next(err); }
}

// ─── GET /api/admin/users ────────────────────────────────────
async function listUsers(req, res, next) {
  try {
    res.json({ data: [], total: 0, page: 1, limit: 20 });
  } catch (err) { next(err); }
}

// ─── GET /api/admin/users/:id ────────────────────────────────
async function getUser(req, res, next) {
  try {
    res.json({ id: req.params.id });
  } catch (err) { next(err); }
}

// ─── PUT /api/admin/users/:id ────────────────────────────────
async function updateUser(req, res, next) {
  try {
    res.json({ id: req.params.id, updated_at: "" });
  } catch (err) { next(err); }
}

// ─── DELETE /api/admin/users/:id ─────────────────────────────
async function deactivateUser(req, res, next) {
  try {
    res.json({ message: "User deactivated" });
  } catch (err) { next(err); }
}

// ─── GET /api/admin/organisers ───────────────────────────────
async function listOrganisers(req, res, next) {
  try {
    res.json({ data: [], total: 0, page: 1, limit: 20 });
  } catch (err) { next(err); }
}

// ─── PUT /api/admin/organisers/:id/approve ───────────────────
async function approveOrganiser(req, res, next) {
  try {
    res.json({ organisation: { id: req.params.id, status: "approved" } });
  } catch (err) { next(err); }
}

// ─── GET /api/admin/events ───────────────────────────────────
async function listEvents(req, res, next) {
  try {
    res.json({ data: [], total: 0, page: 1, limit: 20 });
  } catch (err) { next(err); }
}

// ─── DELETE /api/admin/events/:id ────────────────────────────
async function deleteEvent(req, res, next) {
  try {
    res.json({ message: "Event deleted" });
  } catch (err) { next(err); }
}

// ─── GET /api/admin/events/:id/participation ─────────────────
async function eventParticipation(req, res, next) {
  try {
    res.json({ event: {}, participation: {} });
  } catch (err) { next(err); }
}

// ─── GET /api/admin/coupons ──────────────────────────────────
async function listCoupons(req, res, next) {
  try {
    res.json({ data: [], total: 0, page: 1, limit: 20 });
  } catch (err) { next(err); }
}

// ─── POST /api/admin/coupons ─────────────────────────────────
async function createCoupon(req, res, next) {
  try {
    res.status(201).json({ coupon: {}, pins_generated: 0 });
  } catch (err) { next(err); }
}

// ─── PUT /api/admin/coupons/:id ──────────────────────────────
async function updateCoupon(req, res, next) {
  try {
    res.json({ coupon: { id: req.params.id } });
  } catch (err) { next(err); }
}

// ─── DELETE /api/admin/coupons/:id ───────────────────────────
async function deleteCoupon(req, res, next) {
  try {
    res.json({ message: "Coupon deleted" });
  } catch (err) { next(err); }
}

// ─── GET /api/admin/rewards/configuration ────────────────────
async function getRewardsConfig(req, res, next) {
  try {
    res.json({ points_per_dollar: 100, min_redeem_points: 50, max_redeem_per_day: 5, default_event_points: 50 });
  } catch (err) { next(err); }
}

// ─── PUT /api/admin/rewards/configuration ────────────────────
async function updateRewardsConfig(req, res, next) {
  try {
    res.json({ message: "Configuration updated", updated_at: "" });
  } catch (err) { next(err); }
}

// ─── GET /api/admin/redemptions ──────────────────────────────
async function listRedemptions(req, res, next) {
  try {
    res.json({ data: [], total: 0, page: 1, limit: 20 });
  } catch (err) { next(err); }
}

module.exports = {
  dashboard,
  listUsers, getUser, updateUser, deactivateUser,
  listOrganisers, approveOrganiser,
  listEvents, deleteEvent, eventParticipation,
  listCoupons, createCoupon, updateCoupon, deleteCoupon,
  getRewardsConfig, updateRewardsConfig,
  listRedemptions,
};
