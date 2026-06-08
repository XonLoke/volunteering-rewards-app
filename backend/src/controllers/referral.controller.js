//-----------------------------------------------------------------------
// SECTION: Referral Controller (F3)
// Purpose: Thin HTTP layer for referral API endpoints.
//-----------------------------------------------------------------------
const referralService = require("../services/referral.service");

// GET /api/me/referral-code
async function getMyCode(req, res, next) {
  try {
    const result = await referralService.getMyReferralCode(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

// GET /api/me/referral-stats
async function getMyStats(req, res, next) {
  try {
    const result = await referralService.getReferralStats(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = {
  getMyCode,
  getMyStats,
};
