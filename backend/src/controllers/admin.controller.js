/**
 * Admin Controller — Admin Web Portal
 */
const adminService = require("../services/admin.service");
const sponsorshipConfigService = require("../services/sponsorshipConfig.service");

async function dashboard(req, res, next) {
  try { const [stats, recentActivity] = await Promise.all([adminService.getDashboardStats(), adminService.getRecentActivity()]);
    res.json({ stats, recent_activity: recentActivity, current_date: new Date().toISOString().split('T')[0], last_updated: new Date().toISOString() });
  } catch (err) { next(err); }
}
async function listUsers(req, res, next) { try { res.json(await adminService.listUsers(req.query)); } catch (err) { next(err); } }
async function getUser(req, res, next) { try { res.json(await adminService.getUserDetail(req.params.id)); } catch (err) { next(err); } }
async function updateUser(req, res, next) { try { res.json(await adminService.updateUserStatus(req.params.id, req.body)); } catch (err) { next(err); } }
async function deactivateUser(req, res, next) { try { res.json(await adminService.updateUserStatus(req.params.id, { status: "disabled" })); } catch (err) { next(err); } }
async function listOrganisers(req, res, next) { try { res.json(await adminService.listOrganisers(req.query)); } catch (err) { next(err); } }
async function approveOrganiser(req, res, next) { try { res.json(await adminService.approveOrganiser(req.params.id, { status: req.body.status, approvedBy: req.user.id })); } catch (err) { next(err); } }
async function listEvents(req, res, next) { try { res.json(await adminService.listEvents(req.query)); } catch (err) { next(err); } }
async function deleteEvent(req, res, next) { try { const r = await adminService.deleteEvent(req.params.id); res.json({ message: "Event deleted" }); } catch (err) { next(err); } }
async function eventParticipation(req, res, next) { try { res.json(await adminService.getEventParticipation(req.params.id)); } catch (err) { next(err); } }
async function listCoupons(req, res, next) { try { res.json(await adminService.listCoupons(req.query)); } catch (err) { next(err); } }
async function createCoupon(req, res, next) { try { const r = await adminService.createCoupon(req.body, req.user.id); res.status(201).json(r); } catch (err) { next(err); } }
async function updateCoupon(req, res, next) { try { res.json(await adminService.updateCoupon(req.params.id, req.body)); } catch (err) { next(err); } }
async function deleteCoupon(req, res, next) { try { res.json(await adminService.deleteCoupon(req.params.id)); } catch (err) { next(err); } }
async function getRewardsConfig(req, res, next) { try { res.json(await adminService.getRewardsConfig()); } catch (err) { next(err); } }
async function updateRewardsConfig(req, res, next) { try { res.json(await adminService.updateRewardsConfig(req.body, req.user.id)); } catch (err) { next(err); } }
async function listRedemptions(req, res, next) { try { res.json(await adminService.listRedemptions(req.query)); } catch (err) { next(err); } }
async function cleanupRedemptions(req, res, next) { try { res.json(await adminService.cleanupOldRedemptions()); } catch (err) { next(err); } }
async function getSponsorshipConfig(req, res, next) { try { res.json(await sponsorshipConfigService.getSponsorshipConfig()); } catch (err) { next(err); } }
async function updateSponsorshipConfig(req, res, next) { try { res.json(await sponsorshipConfigService.updateSponsorshipConfig(req.body, req.user.id)); } catch (err) { next(err); } }
async function resetPassword(req, res, next) { try { res.json(await adminService.resetUserPassword(req.params.id, req.body)); } catch (err) { next(err); } }
async function updateMerchant(req, res, next) { try { res.json(await adminService.updateMerchant(req.params.id, req.body)); } catch (err) { next(err); } }
async function listMerchants(req, res, next) { try { res.json(await adminService.listMerchants(req.query)); } catch (err) { next(err); } }
async function createMerchant(req, res, next) { try { const r = await adminService.createMerchant(req.body, req.user.id); res.status(201).json(r); } catch (err) { next(err); } }
async function listMerchantProducts(req, res, next) { try { res.json(await adminService.listMerchantProducts(req.params.id)); } catch (err) { next(err); } }
async function createMerchantProduct(req, res, next) { try { const r = await adminService.createMerchantProduct(req.params.id, req.body); res.status(201).json(r); } catch (err) { next(err); } }
async function getCouponPins(req, res, next) { try { res.json(await adminService.getCouponPins(req.params.id)); } catch (err) { next(err); } }
async function updateUserRole(req, res, next) { try { res.json(await adminService.updateUserRole(req.params.id, req.body)); } catch (err) { next(err); } }
async function listProspects(req, res, next) { try { res.json(await adminService.listProspects(req.query)); } catch (err) { next(err); } }
async function createProspect(req, res, next) { try { const r = await adminService.createProspect(req.body, req.user.id); res.status(201).json(r); } catch (err) { next(err); } }
async function updateProspectStatus(req, res, next) { try { res.json(await adminService.updateProspectStatus(req.params.id, req.body)); } catch (err) { next(err); } }
async function createOrganiserAccount(req, res, next) { try { const r = await adminService.createOrganiserAccount(req.body, req.user.id); res.status(201).json(r); } catch (err) { next(err); } }
async function createMerchantAccount(req, res, next) { try { const r = await adminService.createMerchantAccount(req.body, req.user.id); res.status(201).json(r); } catch (err) { next(err); } }
async function createUserAccount(req, res, next) { try { const r = await adminService.createUserAccount(req.body, req.user.id); res.status(201).json(r); } catch (err) { next(err); } }

module.exports = {
  dashboard, listUsers, getUser, updateUser, deactivateUser,
  listOrganisers, approveOrganiser,
  listEvents, deleteEvent, eventParticipation,
  listCoupons, createCoupon, updateCoupon, deleteCoupon,
  getRewardsConfig, updateRewardsConfig,
  listMerchants, updateMerchant, createMerchant,
  listMerchantProducts, createMerchantProduct,
  getCouponPins, updateUserRole, listRedemptions, cleanupRedemptions,
  getSponsorshipConfig, updateSponsorshipConfig,
  listProspects, createProspect, updateProspectStatus,
  createMerchantAccount,
  createOrganiserAccount, resetPassword,
  createUserAccount,
};
