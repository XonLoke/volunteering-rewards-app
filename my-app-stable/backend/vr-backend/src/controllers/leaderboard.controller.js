//-----------------------------------------------------------------------
// SECTION: Leaderboard Controller (F4)
//-----------------------------------------------------------------------
const leaderboardService = require("../services/leaderboard.service");

// GET /api/leaderboard
async function getAll(req, res, next) {
  try {
    const result = await leaderboardService.getFullLeaderboard();
    res.json({ data: result });
  } catch (err) { next(err); }
}

// GET /api/leaderboard/points
async function getPoints(req, res, next) {
  try {
    const result = await leaderboardService.topByPoints(3);
    res.json({ data: result });
  } catch (err) { next(err); }
}

// GET /api/leaderboard/events
async function getEvents(req, res, next) {
  try {
    const result = await leaderboardService.topByEvents(3);
    res.json({ data: result });
  } catch (err) { next(err); }
}

// GET /api/leaderboard/checkins
async function getCheckins(req, res, next) {
  try {
    const result = await leaderboardService.topByCheckins(3);
    res.json({ data: result });
  } catch (err) { next(err); }
}

// GET /api/leaderboard/redeemed
async function getRedeemed(req, res, next) {
  try {
    const result = await leaderboardService.topByRedeemed(3);
    res.json({ data: result });
  } catch (err) { next(err); }
}

module.exports = { getAll, getPoints, getEvents, getCheckins, getRedeemed };
