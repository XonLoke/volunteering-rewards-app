import { query } from "../config/db.js";

export async function getProfile(userId) {
  const rows = await query(
    `SELECT id, name, email, phone, points, volunteer_qr_code, profile_image_url, status
     FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0];
}

export async function getMyEvents(userId) {
  return query(
    `SELECT e.id, e.title, e.location, e.start_time, e.end_time, e.status, er.status AS registration_status
     FROM event_registrations er
     JOIN events e ON e.id = er.event_id
     WHERE er.user_id = $1
     ORDER BY e.start_time DESC`,
    [userId]
  );
}

export async function getPoints(userId) {
  const rows = await query(`SELECT points FROM users WHERE id = $1`, [userId]);
  const history = await query(
    `SELECT id, points, description, created_at FROM point_transactions
     WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return { points: rows[0]?.points || 0, history };
}

export async function getCoupons(userId) {
  return query(
    `SELECT c.id, c.title, c.description, c.points_required, uc.redeemed_at, uc.status
     FROM user_coupons uc
     JOIN coupons c ON c.id = uc.coupon_id
     WHERE uc.user_id = $1
     ORDER BY uc.redeemed_at DESC`,
    [userId]
  );
}

export async function getQrCode(userId) {
  const rows = await query(`SELECT volunteer_qr_code FROM users WHERE id = $1`, [userId]);
  return { qrCode: rows[0]?.volunteer_qr_code };
}
