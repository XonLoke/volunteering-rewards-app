/**
 * Me Controller — Volunteer-specific data endpoints
 * Wired to me.service.js
 */
const meService = require("../services/me.service");

async function myEvents(req, res, next) {
  try {
    const result = await meService.getMyEvents(req.user.id, req.query);
    res.json(result);
  } catch (err) { next(err); }
}

async function myQrCode(req, res, next) {
  try {
    const result = await meService.getMyQrCode(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function myPoints(req, res, next) {
  try {
    const result = await meService.getMyPoints(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function myCoupons(req, res, next) {
  try {
    const result = await meService.getMyCoupons(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function myFavorites(req, res, next) {
  try {
    const result = await meService.getMyFavorites(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function toggleFavorite(req, res, next) {
  try {
    res.json({ event_id: req.params.id, is_favorited: true });
  } catch (err) { next(err); }
}

module.exports = { myEvents, myQrCode, myPoints, myCoupons, myFavorites, toggleFavorite };
