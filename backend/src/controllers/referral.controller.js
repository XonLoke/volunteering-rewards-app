//-----------------------------------------------------------------------
// SECTION: Referral Controller (F3)
//-----------------------------------------------------------------------
const referralService = require("../services/referral.service");

// GET /api/me/sponsorship-profile
async function getMyProfile(req, res, next) {
  try {
    const result = await referralService.getMySponsorshipProfile(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = {
  getMyProfile,
};
