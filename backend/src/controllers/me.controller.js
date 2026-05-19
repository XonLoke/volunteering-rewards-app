/**
 * Me Controller — Volunteer-specific data endpoints
 *
 * Response shapes defined in API_CONTRACTS.md (Volunteer Mobile App section).
 */

// ─── GET /api/me/events ──────────────────────────────────────
async function myEvents(req, res, next) {
  try {
    // TODO: Return upcoming + past events for current user
    // Query: ?status=upcoming|past
    res.json({ upcoming: [], past: [] });
  } catch (err) { next(err); }
}

// ─── GET /api/me/qr-code ─────────────────────────────────────
async function myQrCode(req, res, next) {
  try {
    // TODO: Return QR code data encoding volunteer's UUID
    res.json({ qr_data: "volunteer:uuid", volunteer_id: req.user.id, volunteer_name: "", expires_at: "" });
  } catch (err) { next(err); }
}

// ─── GET /api/me/points ──────────────────────────────────────
async function myPoints(req, res, next) {
  try {
    // TODO: Return points balance + earning/redemption history
    // Query: ?page=1&limit=20
    res.json({ balance: 0, total_earned: 0, total_redeemed: 0, history: [], total: 0, page: 1, limit: 20 });
  } catch (err) { next(err); }
}

// ─── GET /api/me/coupons ─────────────────────────────────────
async function myCoupons(req, res, next) {
  try {
    // TODO: Return redeemed coupons with PINs
    // Query: ?status=active|used|expired
    res.json({ data: [] });
  } catch (err) { next(err); }
}

// ─── GET /api/me/favorites ───────────────────────────────────
async function myFavorites(req, res, next) {
  try {
    // TODO: Return favorited events
    res.json({ data: [] });
  } catch (err) { next(err); }
}

// ─── POST /api/favorites/:id ─────────────────────────────────
async function toggleFavorite(req, res, next) {
  try {
    // TODO: If already favorited → unfavorite. Else → favorite.
    res.json({ event_id: req.params.id, is_favorited: true });
  } catch (err) { next(err); }
}

module.exports = { myEvents, myQrCode, myPoints, myCoupons, myFavorites, toggleFavorite };
