/**
 * Admin Controller — Admin Web Portal
 *
 * Thin HTTP layer — all business logic delegated to admin.service.js.
 * Response shapes defined in API_CONTRACTS_v2.md.
 */

const adminService = require("../services/admin.service");

// ─── GET /api/admin/dashboard ────────────────────────────────
async function dashboard(req, res, next) {
  try {
    const [stats, recentActivity] = await Promise.all([
      adminService.getDashboardStats(),
      adminService.getRecentActivity(),
    ]);
    res.json({
      stats,
      recent_activity: recentActivity,
      current_date: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString(),
    });
  } catch (err) { next(err); }
}

// ─── GET /api/admin/users ────────────────────────────────────
async function listUsers(req, res, next) {
  try {
    const result = await adminService.listUsers(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── GET /api/admin/users/:id ────────────────────────────────
async function getUser(req, res, next) {
  try {
    const user = await adminService.getUserDetail(req.params.id);
    res.json(user);
  } catch (err) { next(err); }
}

// ─── PUT /api/admin/users/:id ────────────────────────────────
async function updateUser(req, res, next) {
  try {
    const result = await adminService.updateUserStatus(req.params.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── DELETE /api/admin/users/:id ─────────────────────────────
async function deactivateUser(req, res, next) {
  try {
    const result = await adminService.updateUserStatus(req.params.id, { status: 'disabled' });
    res.json({ message: "User deactivated", user: result });
  } catch (err) { next(err); }
}

// ─── GET /api/admin/organisers ───────────────────────────────
async function listOrganisers(req, res, next) {
  try {
    const result = await adminService.listOrganisers(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── PUT /api/admin/organisers/:id/approve ───────────────────
async function approveOrganiser(req, res, next) {
  try {
    const result = await adminService.approveOrganiser(req.params.id, {
      status: req.body.status,
      approvedBy: req.user.id,
    });
    res.json(result);
  } catch (err) { next(err); }
}

// ─── GET /api/admin/events ───────────────────────────────────
async function listEvents(req, res, next) {
  try {
    const result = await adminService.listEvents(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── DELETE /api/admin/events/:id ────────────────────────────
async function deleteEvent(req, res, next) {
  try {
    const result = await adminService.deleteEvent(req.params.id);
    res.json({ message: `Event "${result.title}" deleted` });
  } catch (err) { next(err); }
}

// ─── GET /api/admin/events/:id/participation ─────────────────
async function eventParticipation(req, res, next) {
  try {
    const result = await adminService.getEventParticipation(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── GET /api/admin/coupons ──────────────────────────────────
async function listCoupons(req, res, next) {
  try {
    const result = await adminService.listCoupons(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── POST /api/admin/coupons ─────────────────────────────────
async function createCoupon(req, res, next) {
  try {
    const result = await adminService.createCoupon(req.body, req.user.id);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

// ─── PUT /api/admin/coupons/:id ──────────────────────────────
async function updateCoupon(req, res, next) {
  try {
    const result = await adminService.updateCoupon(req.params.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── DELETE /api/admin/coupons/:id ───────────────────────────
async function deleteCoupon(req, res, next) {
  try {
    const result = await adminService.deleteCoupon(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── GET /api/admin/rewards/configuration ────────────────────
async function getRewardsConfig(req, res, next) {
  try {
    const config = await adminService.getRewardsConfig();
    res.json(config);
  } catch (err) { next(err); }
}

// ─── PUT /api/admin/rewards/configuration ────────────────────
async function updateRewardsConfig(req, res, next) {
  try {
    const result = await adminService.updateRewardsConfig(req.body);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── GET /api/admin/redemptions ──────────────────────────────
async function listRedemptions(req, res, next) {
  try {
    const result = await adminService.listRedemptions(req.query);
    res.json(result);
  } catch (err) { next(err); }
}


// ─── PUT /api/admin/users/:id/reset-password ────────────────
async function resetPassword(req, res, next) {
  try {
    const result = await adminService.resetUserPassword(req.params.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
}


// ─── GET /api/admin/merchants ───────────────────────────────
async function listMerchants(req, res, next) {
  try {
    const result = await adminService.listMerchants(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── POST /api/admin/merchants ──────────────────────────────
async function createMerchant(req, res, next) {
  try {
    const result = await adminService.createMerchant(req.body, req.user.id);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

// ─── GET /api/admin/merchants/:id/products ──────────────────
async function listMerchantProducts(req, res, next) {
  try {
    const result = await adminService.listMerchantProducts(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── POST /api/admin/merchants/:id/products ─────────────────
async function createMerchantProduct(req, res, next) {
  try {
    const result = await adminService.createMerchantProduct(req.params.id, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}


// ─── GET /api/admin/coupons/:id/pins ────────────────────────
async function getCouponPins(req, res, next) {
  try {
    const result = await adminService.getCouponPins(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}


// ─── PUT /api/admin/users/:id/role ─────────────────────────
async function updateUserRole(req, res, next) {
  try {
    const result = await adminService.updateUserRole(req.params.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = {
  dashboard, listUsers, getUser, updateUser, deactivateUser,
  listOrganisers, approveOrganiser,
  listEvents, deleteEvent, eventParticipation,
  listCoupons, createCoupon, updateCoupon, deleteCoupon,
  getRewardsConfig, updateRewardsConfig,
  listMerchants,
  createMerchant,
  listMerchantProducts,
  createMerchantProduct,
  getCouponPins,
  updateUserRole,
  listRedemptions,
  resetPassword,
};
