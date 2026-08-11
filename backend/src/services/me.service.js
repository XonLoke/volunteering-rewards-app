/**
 * Me Service — Volunteer's own data queries
 * Adapted from Nurain's implementation
 */
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

async function getMyEvents(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM event_registrations WHERE user_id = $1", [userId]
  );
  const total = parseInt(countResult.rows[0].count);

  const { rows } = await pool.query(
    `SELECT e.id, e.title, e.description, e.location, e.event_date, e.points_value, e.status,
            er.status AS registration_status, er.created_at AS registered_at,
            (SELECT COUNT(*) FROM attendance_logs al WHERE al.event_id = e.id AND al.user_id = $1) AS attended
     FROM event_registrations er
     JOIN events e ON e.id = er.event_id
     WHERE er.user_id = $1
     ORDER BY e.event_date DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return { data: rows, total, page, limit, total_pages: Math.ceil(total / limit) };
}

async function getMyPoints(userId) {
  const { rows: userRows } = await pool.query(
    "SELECT points FROM users WHERE id = $1", [userId]
  );
  const { rows: history } = await pool.query(
    `SELECT al.id, al.points_awarded AS points, e.title AS description, e.location, al.scanned_at AS created_at
     FROM attendance_logs al
     JOIN events e ON e.id = al.event_id
     WHERE al.user_id = $1
     ORDER BY al.scanned_at DESC
     LIMIT 50`,
    [userId]
  );
  return { points_balance: userRows[0]?.points || 0, history };
}

async function getMyCoupons(userId) {
  const { rows } = await pool.query(
    `SELECT uc.id, uc.pin_code, uc.status, uc.created_at, uc.expiry_date,
            c.title, c.description, c.points_required AS points_cost
     FROM user_coupons uc
     JOIN coupons c ON c.id = uc.coupon_id
     WHERE uc.user_id = $1
     ORDER BY uc.created_at DESC`,
    [userId]
  );
  return { data: rows };
}

async function getMyQrCode(userId) {
  const { rows } = await pool.query(
    "SELECT volunteer_qr_code FROM users WHERE id = $1", [userId]
  );
  if (rows.length === 0) throw createError(404, "not_found", "User not found.");
  return { qr_code: rows[0].volunteer_qr_code };
}

async function getMyFavorites(userId) {
  const { rows } = await pool.query(
    `SELECT f.id, f.item_type, f.item_id, f.created_at,
            e.title, e.event_date
     FROM favorites f
     LEFT JOIN events e ON e.id = f.item_id AND f.item_type = 'event'
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return { data: rows };
}

module.exports = { getMyEvents, getMyPoints, getMyCoupons, getMyQrCode, getMyFavorites };
