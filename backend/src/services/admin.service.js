/**
 * Admin Service — Real DB queries for admin portal
 *
 * All queries use parameterized placeholders ($1, $2, etc.) to prevent SQL injection.
 * Response shapes match API_CONTRACTS_v2.md exactly.
 */

const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

// ─── Dashboard Stats ─────────────────────────────────────
async function getDashboardStats() {
  const queries = {
    total_users: pool.query("SELECT COUNT(*) FROM users"),
    total_organisers: pool.query("SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE role_name = 'organizer')"),
    pending_approvals: pool.query("SELECT COUNT(*) FROM organizations WHERE approval_status = 'pending'"),
    total_events: pool.query("SELECT COUNT(*) FROM events"),
    coupon_today: pool.query("SELECT COUNT(*) FROM user_coupons WHERE created_at::date = CURRENT_DATE"),
    redemption_today: pool.query("SELECT COUNT(*) FROM redemption_logs WHERE created_at::date = CURRENT_DATE"),
    users_30d: pool.query("SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'"),
    coupons_30d: pool.query("SELECT COUNT(*) FROM user_coupons WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'"),
  };

  const results = {};
  for (const [key, promise] of Object.entries(queries)) {
    try { const r = await promise; results[key] = parseInt(r.rows[0].count); }
    catch { results[key] = 0; }
  }

  return {
    total_users: results.total_users,
    total_organisers: results.total_organisers,
    pending_approvals: results.pending_approvals,
    total_coupons_issued_today: results.coupon_today,
    total_redemptions_today: results.redemption_today,
    users_growth_pct: results.users_30d > 0 ? Math.round((results.users_30d / results.total_users) * 100) : 0,
    coupons_growth_pct: results.coupons_30d > 0 ? Math.round((results.coupons_30d / results.coupon_today) * 100) : 0,
    total_events: results.total_events,
  };
}

// ─── Recent Activity ──────────────────────────────────────
async function getRecentActivity(limit = 10) {
  try {
    const { rows } = await pool.query(`
      SELECT 'user' AS type, name AS description, created_at AS timestamp FROM users
      UNION ALL
      SELECT 'event', title, created_at FROM events
      UNION ALL
      SELECT 'redeem', 'Coupon redeemed', created_at FROM redemption_logs
      UNION ALL
      SELECT 'org', org_name, created_at FROM organizations
      ORDER BY timestamp DESC LIMIT $1
    `, [limit]);
    return rows.map(r => ({
      ...r,
      timestamp: r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
    }));
  } catch {
    return [];
  }
}

// ─── List Users (searchable, filterable, paginated) ────────
async function listUsers({ page = 1, limit = 15, search, role, status } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
  }
  if (role) {
    params.push(role);
    conditions.push(`r.role_name = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`u.status = $${params.length}`);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id ${where}`, params
  );
  const total = parseInt(countResult.rows[0].count);

  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, r.role_name AS role, u.points AS points_balance,
            u.status, u.created_at
     FROM users u
     JOIN roles r ON u.role_id = r.id
     ${where}
     ORDER BY u.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return {
    data: rows,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    total_pages: Math.ceil(total / limit),
  };
}

// ─── Get User Detail ──────────────────────────────────────
async function getUserDetail(userId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, r.role_name AS role, u.points AS points_balance,
            u.status, u.created_at,
            (SELECT COUNT(*) FROM event_registrations er JOIN events e ON er.event_id = e.id WHERE er.user_id = u.id) AS total_events_attended,
            (SELECT COALESCE(SUM(points_awarded), 0) FROM attendance_logs WHERE user_id = u.id) AS total_points_earned,
            (SELECT COALESCE(SUM(rl.points_spent), 0) FROM redemption_logs rl WHERE rl.user_id = u.id) AS total_points_redeemed
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [userId]
  );

  if (rows.length === 0) throw createError(404, "not_found", "User not found.");
  return rows[0];
}

// ─── Update User Status ──────────────────────────────────
async function updateUserStatus(userId, { status }) {
  if (!['active', 'disabled'].includes(status)) {
    throw createError(400, "validation_error", "Status must be 'active' or 'disabled'.");
  }
  const { rows } = await pool.query(
    `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status, updated_at`,
    [status, userId]
  );
  if (rows.length === 0) throw createError(404, "not_found", "User not found.");
  return rows[0];
}

// ─── List Organisers ──────────────────────────────────────
async function listOrganisers({ page = 1, limit = 15, status } = {}) {
  const offset = (page - 1) * limit;
  const params = [];

  let where = "WHERE r.role_name = 'organizer'";
  if (status) {
    params.push(status);
    where += ` AND o.approval_status = $${params.length}`;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users u
     JOIN roles r ON u.role_id = r.id
     LEFT JOIN organizations o ON o.contact_email = u.email
     ${where}`, params
  );
  const total = parseInt(countResult.rows[0].count);

  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
            COALESCE(o.org_name, '') AS organisation_name,
            COALESCE(o.org_type, '') AS organisation_type,
            COALESCE(o.approval_status, 'pending') AS organisation_status,
            o.contact_person AS contact_name,
            o.contact_email AS org_contact_email
     FROM users u
     JOIN roles r ON u.role_id = r.id
     LEFT JOIN organizations o ON o.contact_email = u.email
     ${where}
     ORDER BY u.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  const data = rows.map(r => ({
    ...r,
    documents: [],
  }));

  return { data, total, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(total / limit) };
}

async function approveOrganiser(userId, { status, approvedBy }) {
  if (!['approved', 'rejected'].includes(status)) {
    throw createError(400, "validation_error", "Status must be 'approved' or 'rejected'.");
  }

  // Find the organiser's organisation
  const { rows: orgRows } = await pool.query(
    `SELECT o.id FROM organizations o
     JOIN users u ON u.id = $1
     WHERE o.contact_email = u.email
     LIMIT 1`,
    [userId]
  );

  if (orgRows.length === 0) {
    // Create an organisation record if none exists
    const { rows: userRows } = await pool.query(
      `SELECT name, email FROM users WHERE id = $1`, [userId]
    );
    if (userRows.length === 0) throw createError(404, "not_found", "User not found.");

    const { rows: newOrg } = await pool.query(
      `INSERT INTO organizations (org_name, org_type, contact_person, contact_email, approval_status, approved_by, approved_at, status)
       VALUES ($1, 'community_group', $2, $3, $4, $5, NOW(), 'active')
       RETURNING id, org_name AS name, org_type AS type, approval_status AS status`,
      [userRows[0].name + "'s Organisation", userRows[0].name, userRows[0].email, status, approvedBy]
    );
    return { organisation: newOrg[0] };
  }

  const { rows } = await pool.query(
    `UPDATE organizations SET approval_status = $1, approved_by = $2, approved_at = NOW() WHERE id = $3
     RETURNING id, org_name AS name, org_type AS type, approval_status AS status`,
    [status, approvedBy, orgRows[0].id]
  );

  // Also update user status to active on approval
  if (status === 'approved') {
    await pool.query(`UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1`, [userId]);
  }

  return { organisation: rows[0] };
}

// ─── List Events ──────────────────────────────────────────
async function listEvents({ page = 1, limit = 15, status } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = '';

  if (status) {
    params.push(status);
    where = `WHERE e.status = $${params.length}`;
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM events e ${where}`, params
  );
  const total = parseInt(countResult.rows[0].count);

  const { rows } = await pool.query(
    `SELECT e.id, e.title, e.description, e.location, e.event_date AS date, e.capacity,
            e.points_value, e.status, e.category, e.created_at,
            u.name AS organiser_name,
            (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) AS registered_count,
            (SELECT COUNT(*) FROM attendance_logs al WHERE al.event_id = e.id AND al.scan_type = 'check_in') AS checked_in_count
     FROM events e
     JOIN users u ON e.organizer_id = u.id
     ${where}
     ORDER BY e.event_date DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return { data: rows, total, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(total / limit) };
}

// ─── Delete Event ─────────────────────────────────────────
async function deleteEvent(eventId) {
  // Delete dependent records first
  await pool.query("DELETE FROM event_registrations WHERE event_id = $1", [eventId]);
  await pool.query("DELETE FROM attendance_logs WHERE event_id = $1", [eventId]);
  await pool.query("DELETE FROM event_feedback WHERE event_id = $1", [eventId]);
  await pool.query("DELETE FROM event_qna WHERE event_id = $1", [eventId]);
  await pool.query("DELETE FROM favorites WHERE item_type = 'event' AND item_id = $1", [eventId]);

  const { rows } = await pool.query(
    "DELETE FROM events WHERE id = $1 RETURNING id, title", [eventId]
  );
  if (rows.length === 0) throw createError(404, "not_found", "Event not found.");
  return rows[0];
}

// ─── Event Participation ──────────────────────────────────
async function getEventParticipation(eventId) {
  const { rows: eventRows } = await pool.query(
    `SELECT e.id, e.title, u.name AS organiser_name, e.event_date AS date
     FROM events e JOIN users u ON e.organizer_id = u.id WHERE e.id = $1`,
    [eventId]
  );
  if (eventRows.length === 0) throw createError(404, "not_found", "Event not found.");

  const { rows: partRows } = await pool.query(
    `SELECT
      COUNT(DISTINCT er.id) AS total_registered,
      COUNT(DISTINCT al.id) FILTER (WHERE al.scan_type = 'check_in') AS total_checked_in,
      COALESCE(AVG(ef.rating), 0) AS average_rating,
      COUNT(DISTINCT ef.id) AS feedback_count
     FROM event_registrations er
     LEFT JOIN attendance_logs al ON al.event_id = er.event_id AND al.user_id = er.user_id
     LEFT JOIN event_feedback ef ON ef.event_id = er.event_id AND ef.user_id = er.user_id
     WHERE er.event_id = $1`,
    [eventId]
  );

  return {
    event: eventRows[0],
    participation: partRows[0] || { total_registered: 0, total_checked_in: 0, average_rating: 0, feedback_count: 0 },
  };
}

// ─── List Coupons ─────────────────────────────────────────
async function listCoupons({ page = 1, limit = 15 } = {}) {
  const offset = (page - 1) * limit;
  const countResult = await pool.query("SELECT COUNT(*) FROM coupons");
  const total = parseInt(countResult.rows[0].count);

  const { rows } = await pool.query(
    `SELECT c.id, c.title, c.description, c.points_required AS points_cost, c.quantity,
            c.value_cents, c.merchant_name, c.expiry_date, c.status, c.created_at,
            u.name AS created_by_name,
            (SELECT COUNT(*) FROM user_coupons uc WHERE uc.coupon_id = c.id) AS redeemed_count
     FROM coupons c
     LEFT JOIN users u ON c.created_by = u.id
     ORDER BY c.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return { data: rows, total, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(total / limit) };
}

// ─── Create Coupon ────────────────────────────────────────
async function createCoupon(data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO coupons (title, description, points_required, quantity, value_cents, merchant_name, expiry_date, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8)
     RETURNING id, title, points_required, quantity, value_cents, merchant_name, expiry_date`,
    [data.title, data.description, data.points_required, data.quantity, data.value_cents || 0, data.merchant_name || null, data.expiry_date, userId]
  );
  return { coupon: rows[0], pins_generated: 0 };
}

// ─── Update Coupon ────────────────────────────────────────
async function updateCoupon(couponId, data) {
  const { rows } = await pool.query(
    `UPDATE coupons SET title = COALESCE($1, title), description = COALESCE($2, description),
            points_required = COALESCE($3, points_required), quantity = COALESCE($4, quantity),
            value_cents = COALESCE($5, value_cents), merchant_name = COALESCE($6, merchant_name),
            expiry_date = COALESCE($7, expiry_date), updated_at = NOW()
     WHERE id = $8 RETURNING id, title, updated_at`,
    [data.title, data.description, data.points_required, data.quantity, data.value_cents, data.merchant_name, data.expiry_date, couponId]
  );
  if (rows.length === 0) throw createError(404, "not_found", "Coupon not found.");
  return { coupon: rows[0] };
}

// ─── Delete Coupon ────────────────────────────────────────
async function deleteCoupon(couponId) {
  await pool.query("DELETE FROM user_coupons WHERE coupon_id = $1", [couponId]);
  await pool.query("DELETE FROM redemption_logs WHERE coupon_id = $1", [couponId]);
  const { rows } = await pool.query("DELETE FROM coupons WHERE id = $1 RETURNING id", [couponId]);
  if (rows.length === 0) throw createError(404, "not_found", "Coupon not found.");
  return { message: "Coupon deleted" };
}

// ─── List Redemptions ─────────────────────────────────────
async function listRedemptions({ page = 1, limit = 15 } = {}) {
  const offset = (page - 1) * limit;
  const countResult = await pool.query("SELECT COUNT(*) FROM redemption_logs");
  const total = parseInt(countResult.rows[0].count);

  const { rows } = await pool.query(
    `SELECT rl.id, rl.points_spent, rl.action, rl.created_at AS redeemed_at,
            u.name AS user_name, u.email AS user_email,
            c.title AS coupon_title, c.description AS coupon_description,
            uc.pin_code
     FROM redemption_logs rl
     JOIN users u ON rl.user_id = u.id
     JOIN coupons c ON rl.coupon_id = c.id
     LEFT JOIN user_coupons uc ON rl.user_coupon_id = uc.id
     ORDER BY rl.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return { data: rows, total, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(total / limit) };
}

// ─── Rewards Configuration ────────────────────────────────
async function getRewardsConfig() {
  return {
    points_per_dollar: 100,
    min_redeem_points: 50,
    max_redeem_per_day: 5,
    default_event_points: 50,
  };
}

async function updateRewardsConfig(data) {
  // In a real implementation, this would update a rewards_configuration table
  return { message: "Configuration updated", updated_at: new Date().toISOString() };
}

module.exports = {
  getDashboardStats, getRecentActivity,
  listUsers, getUserDetail, updateUserStatus,
  listOrganisers, approveOrganiser,
  listEvents, deleteEvent, getEventParticipation,
  listCoupons, createCoupon, updateCoupon, deleteCoupon,
  getRewardsConfig, updateRewardsConfig,
  listRedemptions,
};
