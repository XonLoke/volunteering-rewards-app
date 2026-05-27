/**
 * Rewards Controller — Volunteer-facing rewards
 *
 * Response shapes defined in API_CONTRACTS.md (Volunteer Mobile App section).
 */

const rewardsService = require("../services/rewards.service");

// GET /api/rewards
async function browse(req, res, next) {
  try {
    const result = await rewardsService.browseRewards(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/rewards/:id/redeem
async function redeem(req, res, next) {
  try {
    const userId = req.user.id;
    const rewardId = req.params.id;

    const result = await rewardsService.redeemReward({
      userId,
      rewardId,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/rewards/:id
async function detail(req, res, next) {
  try {
    const result = await rewardsService.getRewardById(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { browse, detail, redeem };