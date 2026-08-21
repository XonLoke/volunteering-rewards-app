/**
 * Admin Service — Real DB queries for admin portal
 *
 * All queries use parameterized placeholders ($1, $2, etc.) to prevent SQL injection.
 * Response shapes match API_CONTRACTS_v2.md exactly.
 */

const crypto = require("crypto");
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

// ─── PIN Hashing (compatible with Grace's merchant service) ──
// 🔒 SECURITY (5 Aug audit #1): production must never hash PINs with a public
// default; align dev fallback with rewards.service.js so hashes always match.
function hashPin(pin) {
  if (!process.env.PIN_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("FATAL: PIN_SECRET is not set — refusing to hash PINs with a fallback secret");
  }
  const secret = process.env.PIN_SECRET || process.env.JWT_ACCESS_SECRET || "dev-pin-secret-not-for-production";
  return crypto.createHmac("sha256", secret).update(String(pin)).digest("hex");
}


// ─── Get Rewards Config helper for coupon calculations ──
async function getPointsPerDollar() {
  try {
    const { rows } = await pool.query("SELECT points_per_dollar FROM rewards_configuration ORDER BY id DESC LIMIT 1");
    if (rows.length > 0 && rows[0].points_per_dollar > 0) return rows[0].points_per_dollar;
  } catch {}
  return 100; // default fallback
}

// ─── Dashboard Stats ─────────────────────────────────────
async function getDashboardStats() {
  const queries = {
    total_users: pool.query("SELECT COUNT(*) FROM users"),
    total_organisers: pool.query("SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE role_name = 'organiser')"),
    pending_approvals: pool.query("SELECT COUNT(*) FROM organizations WHERE approval_status = 'pending'"),
    total_events: pool.query("SELECT COUNT(*) FROM events"),
    total_merchants: pool.query("SELECT COUNT(*) FROM merchants"),
    no_show_count: pool.query(`SELECT COUNT(*) FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE e.event_date < NOW() AND er.status = 'registered'
        AND NOT EXISTS (
          SELECT 1 FROM attendance_logs al
          WHERE al.event_id = er.event_id AND al.user_id = er.user_id AND al.scan_type = 'check_in'
        )`),
    coupon_today: pool.query("SELECT COUNT(*) FROM user_coupons WHERE created_at::date = CURRENT_DATE"),
    redemption_today: pool.query("SELECT COUNT(*) FROM redemption_logs WHERE created_at::date = CURRENT_DATE"),
    users_30d: pool.query("SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'"),
    coupons_30d: pool.query("SELECT COUNT(*) FROM user_coupons WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'"),
    total_coupons: pool.query("SELECT COUNT(*) FROM user_coupons"),
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
    users_growth_pct: results.total_users > 0 ? Math.round((results.users_30d / results.total_users) * 100) : 0,
    // 30-day coupons as a share of all coupons — guard against division by zero
    // (the previous formula divided 30-day count by today's count → Infinity → JSON null)
    coupons_growth_pct: results.total_coupons > 0 ? Math.round((results.coupons_30d / results.total_coupons) * 100) : 0,
    total_events: results.total_events,
    total_merchants: results.total_merchants,
    no_show_count: results.no_show_count || 0,
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
     ORDER BY
       CASE r.role_name
         WHEN 'admin' THEN 1
         WHEN 'organiser' THEN 2
         WHEN 'merchant' THEN 3
         WHEN 'volunteer' THEN 4
         ELSE 5
       END,
       u.created_at DESC
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

// ─── Get User Detail (includes linked merchant info) ──
async function getUserDetail(userId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, r.role_name AS role, u.points AS points_balance,
            u.status, u.created_at,
            (SELECT COUNT(DISTINCT al.event_id) FROM attendance_logs al WHERE al.user_id = u.id) AS total_events_attended,
            (SELECT COALESCE(SUM(points_awarded), 0) FROM attendance_logs WHERE user_id = u.id) AS total_points_earned,
            (SELECT COALESCE(SUM(rl.points_spent), 0) FROM redemption_logs rl WHERE rl.user_id = u.id) AS total_points_redeemed
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [userId]
  );

  if (rows.length === 0) throw createError(404, "not_found", "User not found.");
  const user = rows[0];

  // If merchant role, also fetch linked merchant business info
  if (user.role === 'merchant' && user.email) {
    const { rows: merchantRows } = await pool.query(
      `SELECT id, name, contact_person, contact_email, contact_phone, address
       FROM merchants WHERE contact_email = $1 LIMIT 1`,
      [user.email]
    );
    if (merchantRows.length > 0) {
      user.merchant_business = merchantRows[0];
    }
  }

  return user;
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

  let where = "WHERE r.role_name = 'organiser'";
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
            o.contact_email AS contact_email
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

  if (status === 'past') {
    // 'past' is a computed state — no event status is ever written with it
    where = 'WHERE e.event_date < NOW()';
  } else if (status) {
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

  // Fetch registered participants with check-in status
  const { rows: participants } = await pool.query(
    `SELECT u.id, u.name, u.email,
            er.status AS registration_status,
            al.scanned_at AS checked_in_at
     FROM event_registrations er
     JOIN users u ON u.id = er.user_id
     LEFT JOIN attendance_logs al ON al.event_id = er.event_id AND al.user_id = u.id AND al.scan_type = 'check_in'
     WHERE er.event_id = $1
     ORDER BY u.name`,
    [eventId]
  );

  return {
    event: eventRows[0],
    participation: partRows[0] || { total_registered: 0, total_checked_in: 0, average_rating: 0, feedback_count: 0 },
    participants,
  };
}

// ─── List Coupons ─────────────────────────────────────────
async function listCoupons({ page = 1, limit = 15, status } = {}) {
  const offset = (page - 1) * limit;
  const ppd = await getPointsPerDollar();
  const params = [];
  let whereClause = '';
  const statusFilter = status; // capture for closure
  if (statusFilter) { params.push(statusFilter); whereClause = "WHERE c.status = $1"; }
  const countResult = await pool.query("SELECT COUNT(*) FROM coupons c " + whereClause, params);
  const total = parseInt(countResult.rows[0].count);

  const allParams = [...params, limit, offset];
  const limIdx = params.length + 1;
  const offIdx = params.length + 2;
  const { rows } = await pool.query(
    `SELECT c.id, c.title, c.description, c.points_required AS points_cost, c.quantity,
            c.value_cents, c.merchant_name, c.expiry_date, c.valid_from, c.expiry_date AS valid_until, c.status, c.created_at,
            u.name AS created_by_name,
            (SELECT COUNT(*) FROM user_coupons uc WHERE uc.coupon_id = c.id) AS quantity_used,
            (SELECT COUNT(*) FROM user_coupons uc WHERE uc.coupon_id = c.id) AS redeemed_count
     FROM coupons c
     LEFT JOIN users u ON c.created_by = u.id
     ${whereClause}
     ORDER BY c.created_at DESC
     LIMIT $${limIdx} OFFSET $${offIdx}`,
    allParams
  );

  // Calculate real-time points cost from value_cents and rewards config
  // Formula: value (in dollars) × points_per_dollar = (value_cents × points_per_dollar) / 100
  // NOTE: Always override with calculated value — the whole point of "real-time" is that
  //       changing rewards_config instantly reflects in all coupon point costs.
  const data = rows.map(r => ({
    ...r,
    points_cost: r.value_cents ? Math.round(r.value_cents * ppd / 100) : r.points_cost,
    calculated_points: r.value_cents ? Math.round(r.value_cents * ppd / 100) : r.points_cost,
  }));

  return { data, total, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(total / limit) };
}

// ─── Create Coupon (with batch PIN generation) ────────────
async function createCoupon(data, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    //-----------------------------------------------------------------------
    // SECTION: Field Name Mapping
    // Purpose: Map frontend field names (coupon_type → title, points_cost →
    //          points_required, valid_until → expiry_date) before processing.
    //-----------------------------------------------------------------------
    if (data.coupon_type && !data.title) data.title = data.coupon_type;
    if (data.points_cost != null && data.points_required == null) data.points_required = data.points_cost;
    if (data.valid_until && !data.expiry_date) data.expiry_date = data.valid_until;
    // NOTE: valid_from is intentionally NOT mapped to expiry_date — doing so made a
    // coupon "expire" on its start date if the admin filled only "Valid From".
    if (!data.description) data.description = '';

    // Auto-calculate points_required from value_cents using rewards config
    let pointsRequired = data.points_required;
    if (!pointsRequired && data.value_cents) {
      const ppd = await getPointsPerDollar();
      pointsRequired = Math.round(data.value_cents * ppd / 100);
    }
    if (!pointsRequired) pointsRequired = 100;

    // coupons.expiry_date is NOT NULL — default to 30 days out when omitted so an
    // "optional-looking" blank date field can't cause a 500.
    const expiryDate = data.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create the coupon batch
    const { rows } = await client.query(
      `INSERT INTO coupons (title, description, points_required, quantity, value_cents, merchant_name, expiry_date, valid_from, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9)
       RETURNING id, title, points_required, quantity, value_cents, merchant_name, expiry_date, valid_from`,
      [data.title, data.description, pointsRequired, data.quantity, data.value_cents || 0, data.merchant_name || null, expiryDate, data.valid_from || null, userId]
    );
    const coupon = rows[0];
    const quantity = parseInt(data.quantity) || 0;

    // Generate unique 6-digit PINs for each coupon
    const pins = [];
    const usedPins = new Set();
    while (pins.length < quantity) {
      const pin = String(Math.floor(100000 + Math.random() * 900000));
      if (!usedPins.has(pin)) {
        usedPins.add(pin);
        pins.push(pin);
      }
    }

    // Insert PINs into user_coupons table (unused, no owner yet)
    for (const pin of pins) {
      const pinHash = hashPin(pin);
      await client.query(
        `INSERT INTO user_coupons (coupon_id, pin_code, pin_hash, status, expiry_date)
         VALUES ($1, $2, $3, 'unused', $4)`,
        [coupon.id, pin, pinHash, expiryDate]
      );
    }

    await client.query("COMMIT");
    return { coupon, pins_generated: pins.length };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ─── Update Coupon ────────────────────────────────────────
async function updateCoupon(couponId, data) {
  // Map frontend field names to backend field names (mirrors createCoupon)
  if (data.coupon_type && !data.title) data.title = data.coupon_type;
  if (data.points_cost != null && data.points_required == null) data.points_required = data.points_cost;
  if (data.valid_until && !data.expiry_date) data.expiry_date = data.valid_until;

  const { rows } = await pool.query(
    `UPDATE coupons SET title = COALESCE($1, title), description = COALESCE($2, description),
            points_required = COALESCE($3, points_required), quantity = COALESCE($4, quantity),
            value_cents = COALESCE($5, value_cents), merchant_name = COALESCE($6, merchant_name),
            expiry_date = COALESCE($7, expiry_date), valid_from = COALESCE($8, valid_from),
            updated_at = NOW()
     WHERE id = $9 RETURNING id, title, updated_at`,
    [data.title, data.description, data.points_required, data.quantity, data.value_cents, data.merchant_name, data.expiry_date, data.valid_from, couponId]
  );
  if (rows.length === 0) throw createError(404, "not_found", "Coupon not found.");
  return { coupon: rows[0] };
}

// ─── Delete Coupon ────────────────────────────────────────
async function deleteCoupon(couponId) {
  // Delete redemption_logs first: they reference user_coupons (user_coupon_id FK)
  await pool.query("DELETE FROM redemption_logs WHERE coupon_id = $1", [couponId]);
  await pool.query("DELETE FROM user_coupons WHERE coupon_id = $1", [couponId]);
  const { rows } = await pool.query("DELETE FROM coupons WHERE id = $1 RETURNING id", [couponId]);
  if (rows.length === 0) throw createError(404, "not_found", "Coupon not found.");
  return { message: "Coupon deleted" };
}

// ─── List Redemptions (with sorting, date filtering, value_cents) ──
async function listRedemptions({ page = 1, limit = 15, sort, order, from, to } = {}) {
  const offset = (page - 1) * limit;

  // Build WHERE clause from date filters
  const params = [];
  const conditions = [];
  if (from) { params.push(from); conditions.push(`rl.created_at >= $${params.length}::date`); }
  if (to) { params.push(to); conditions.push(`rl.created_at <= $${params.length}::date + interval '1 day'`); }
  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  // Whitelist sort columns to prevent SQL injection
  const SORT_WHITELIST = { user_name: 'u.name', redeemed_at: 'rl.created_at', coupon_title: 'c.title', points_spent: 'rl.points_spent', value_cents: 'c.value_cents' };
  const sortCol = SORT_WHITELIST[sort] || 'rl.created_at';
  const sortDir = order === 'asc' ? 'ASC' : 'DESC';

  const countResult = await pool.query(`SELECT COUNT(*) FROM redemption_logs rl ${where}`, params);
  const total = parseInt(countResult.rows[0].count);

  const allParams = [...params, limit, offset];
  const limIdx = params.length + 1;
  const offIdx = params.length + 2;
  const { rows } = await pool.query(
    `SELECT rl.id, rl.points_spent, rl.action, rl.created_at AS redeemed_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email,
            c.id AS coupon_id, c.title AS coupon_title, c.description AS coupon_description,
            COALESCE(rl.value_cents, c.value_cents, 0) AS value_cents
     FROM redemption_logs rl
     LEFT JOIN users u ON rl.user_id = u.id
     LEFT JOIN coupons c ON rl.coupon_id = c.id
     ${where}
     ORDER BY ${sortCol} ${sortDir}
     LIMIT $${limIdx} OFFSET $${offIdx}`,
    allParams
  );

  return { data: rows, total, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(total / limit) };
}

// ─── Cleanup Old Redemptions (older than 1 year) ──────────
async function cleanupOldRedemptions() {
  const { rows } = await pool.query(
    `DELETE FROM redemption_logs WHERE created_at < NOW() - INTERVAL '1 year' RETURNING id`
  );
  return { deleted_count: rows.length };
}

// ─── Rewards Configuration ────────────────────────────────
async function getRewardsConfig() {
  const { rows } = await pool.query("SELECT points_per_dollar, min_redeem_points, max_redeem_per_day, default_event_points, updated_at FROM rewards_configuration ORDER BY id DESC LIMIT 1");
  if (rows.length === 0) return { points_per_dollar: 100, min_redeem_points: 50, max_redeem_per_day: 5, default_event_points: 50 };
  return rows[0];
}

async function updateRewardsConfig(data, userId) {
  const { rows } = await pool.query("INSERT INTO rewards_configuration (points_per_dollar, min_redeem_points, max_redeem_per_day, default_event_points, updated_by, updated_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *", [data.points_per_dollar, data.min_redeem_points, data.max_redeem_per_day, data.default_event_points, userId]);
  return { message: "Configuration updated", updated_at: rows[0].updated_at };
}


// ─── List Merchants ──────────────────────────────────────
async function listMerchants({ page = 1, limit = 15 } = {}) {
  const offset = (page - 1) * limit;
  const countResult = await pool.query("SELECT COUNT(*) FROM merchants");
  const total = parseInt(countResult.rows[0].count);
  const { rows } = await pool.query(
    `SELECT m.*,
            (SELECT COUNT(*) FROM merchant_products mp WHERE mp.merchant_id = m.id AND mp.is_active = TRUE) AS product_count
     FROM merchants m
     ORDER BY m.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return { data: rows, total, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(total / limit) };
}

// ─── Create Merchant (also creates cashier login account) ─
async function createMerchant(data, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create the merchant record
    const { rows } = await client.query(
      `INSERT INTO merchants (name, contact_person, contact_email, contact_phone, address, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.name, data.contact_person, data.contact_email, data.contact_phone, data.address, userId]
    );
    const merchant = rows[0];

    // 2. Auto-create a user account for the contact person if email is provided
    if (data.contact_email) {
      const bcrypt = require("bcrypt");
      const { v4: uuidv4 } = require("uuid");
      const defaultPassword = "password123";

      // Check if user already exists
      const { rows: existing } = await client.query("SELECT id, role_id FROM users WHERE email = $1", [data.contact_email]);
      if (existing.length === 0) {
        const roleId = (await client.query("SELECT id FROM roles WHERE role_name = 'merchant'")).rows[0].id;
        const hash = await bcrypt.hash(defaultPassword, 12);
        const qr = uuidv4();
        await client.query(
          `INSERT INTO users (email, password_hash, name, phone, role_id, points, volunteer_qr_code, status)
           VALUES ($1, $2, $3, $4, $5, 0, $6, 'active')`,
          [data.contact_email, hash, data.contact_person || data.name, data.contact_phone || null, roleId, qr]
        );
      } else {
        // Existing user — update name, phone, and set role to merchant
        const merchantRoleId = (await client.query("SELECT id FROM roles WHERE role_name = 'merchant'")).rows[0].id;
        await client.query(
          "UPDATE users SET name = $1, phone = $2, role_id = $3 WHERE email = $4",
          [data.contact_person || data.name, data.contact_phone || null, merchantRoleId, data.contact_email]
        );
      }
    }

    await client.query("COMMIT");
    // 🔒 SECURITY (5 Aug audit #3): never echo credentials in API responses —
    // log them server-side only (retrievable by the admin from server logs).
    if (data.contact_email) {
      console.log(`[admin] Merchant account created: ${data.contact_email} / default password (change after first login)`);
    }
    return { merchant, message: data.contact_email ? "Merchant registered. Default credentials were logged server-side." : "Merchant registered." };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ─── List Merchant Products ──────────────────────────────
async function listMerchantProducts(merchantId) {
  const { rows } = await pool.query(
    "SELECT * FROM merchant_products WHERE merchant_id = $1 ORDER BY created_at DESC", [merchantId]
  );
  return { data: rows };
}

// ─── Create Merchant Product ─────────────────────────────
async function createMerchantProduct(merchantId, data) {
  const { rows } = await pool.query(
    `INSERT INTO merchant_products (merchant_id, name, description, points_cost)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [merchantId, data.name, data.description, data.points_cost]
  );
  return { product: rows[0] };
}

// ─── Update createCoupon to generate PINs in batch ─────────

// ─── Update Merchant ────────────────────────────────────
async function updateMerchant(merchantId, data) {
  const { rows } = await pool.query(
    `UPDATE merchants SET name = COALESCE($1, name), contact_person = COALESCE($2, contact_person),
            contact_email = COALESCE($3, contact_email), contact_phone = COALESCE($4, contact_phone),
            address = COALESCE($5, address), updated_at = NOW()
     WHERE id = $6 RETURNING *`,
    [data.name, data.contact_person, data.contact_email, data.contact_phone, data.address, merchantId]
  );
  if (rows.length === 0) throw createError(404, "not_found", "Merchant not found.");
  return { merchant: rows[0] };
}

// ─── Get PINs for Coupon ─────────────────────────────────
async function getCouponPins(couponId) {
  const { rows } = await pool.query(
    "SELECT id, pin_code, status, created_at FROM user_coupons WHERE coupon_id = $1 ORDER BY created_at ASC",
    [couponId]
  );
  return { data: rows };
}

// ─── Update User Role ────────────────────────────────────
async function updateUserRole(userId, { role_name }) {
  const { rows } = await pool.query(
    "SELECT id FROM roles WHERE role_name = $1",
    [role_name]
  );
  if (rows.length === 0) throw createError(400, "validation_error", "Role not found.");
  const result = await pool.query(
    "UPDATE users SET role_id = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email",
    [rows[0].id, userId]
  );
  if (result.rows.length === 0) throw createError(404, "not_found", "User not found.");
  return { message: "User role updated.", user: result.rows[0] };
}

// ─── Merchant Sourcing / Prospects ──────────────────────
async function listProspects({ page = 1, limit = 15, status } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = '';
  if (status) { params.push(status); where = `WHERE status = $${params.length}`; }
  const countResult = await pool.query(`SELECT COUNT(*) FROM merchant_prospects ${where}`, params);
  const total = parseInt(countResult.rows[0].count);
  const { rows } = await pool.query(
    `SELECT * FROM merchant_prospects ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return { data: rows, total, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(total / limit) };
}

async function createProspect(data, userId) {
  const { rows } = await pool.query(
    `INSERT INTO merchant_prospects (name, contact_person, contact_email, contact_phone, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.name, data.contact_person, data.contact_email, data.contact_phone, data.notes, userId]
  );
  return { prospect: rows[0] };
}

async function updateProspectStatus(prospectId, { status }) {
  const r = await pool.query("UPDATE merchant_prospects SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status, prospectId]);
  if (r.rows.length === 0) throw createError(404, "not_found", "Prospect not found.");
  return { prospect: r.rows[0] };
}

// ─── Create Merchant Login Account ──────────────────────
async function createMerchantAccount(data, adminId) {
  const bcrypt = require("bcrypt");
  const { v4: uuidv4 } = require("uuid");
  
  // Check email
  const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [data.email]);
  if (existing.length > 0) throw createError(409, "email_taken", "Email already in use.");
  
  const roleId = (await pool.query("SELECT id FROM roles WHERE role_name = 'merchant'")).rows[0].id;
  const hash = await bcrypt.hash(data.password, 12);
  const qr = uuidv4();
  
  const { rows: userRows } = await pool.query(
    `INSERT INTO users (email, password_hash, name, phone, role_id, points, volunteer_qr_code, status)
     VALUES ($1, $2, $3, $4, $5, 0, $6, 'active') RETURNING id, email, name`,
    [data.email, hash, data.name, data.phone || null, roleId, qr]
  );
  
  // Link to merchant if merchant_id provided
  if (data.merchant_id) {
    await pool.query("UPDATE merchants SET contact_email = $1 WHERE id = $2", [data.email, data.merchant_id]);
  }
  
  return { user: userRows[0], message: "Merchant account created. Login credentials sent." };
}


// ─── Create Any User Account (admin, volunteer, etc.) ─────
async function createUserAccount(data, adminId) {
  const bcrypt = require("bcrypt");
  const { v4: uuidv4 } = require("uuid");

  if (!data.email || !data.password || !data.name || !data.role_name) {
    throw createError(400, "validation_error", "Name, email, password, and role are required.");
  }
  if (data.password.length < 8) {
    throw createError(400, "validation_error", "Password must be at least 8 characters.");
  }

  const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [data.email]);
  if (existing.length > 0) throw createError(409, "email_taken", "Email already in use.");

  const roleResult = await pool.query("SELECT id FROM roles WHERE role_name = $1", [data.role_name]);
  if (roleResult.rows.length === 0) throw createError(400, "invalid_role", "Invalid role. Valid: volunteer, organizer, admin, merchant.");
  const roleId = roleResult.rows[0].id;

  const hash = await bcrypt.hash(data.password, 12);
  const qr = uuidv4();

  const { rows: userRows } = await pool.query(
    `INSERT INTO users (email, password_hash, name, role_id, points, volunteer_qr_code, status)
     VALUES ($1, $2, $3, $4, 0, $5, 'active') RETURNING id, email, name`,
    [data.email, hash, data.name, roleId, qr]
  );

  return { user: { ...userRows[0], role: data.role_name }, message: `Account created with role: ${data.role_name}` };
}


// ─── Create Organiser Account (with linked organisation) ─
async function createOrganiserAccount(data, adminId) {
  const bcrypt = require("bcrypt");
  const { v4: uuidv4 } = require("uuid");

  const name = (data.name || "").trim();
  const email = (data.email || "").trim();
  if (!name || !email) {
    throw createError(400, "validation_error", "Name and email are required.");
  }

  // Check email
  const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.length > 0) throw createError(409, "email_taken", "Email already in use.");

  const roleResult = await pool.query("SELECT id FROM roles WHERE role_name = 'organiser'");
  if (roleResult.rows.length === 0) throw createError(500, "role_missing", "organiser role not found.");
  const roleId = roleResult.rows[0].id;

  const hash = await bcrypt.hash("password123", 12);
  const qr = uuidv4();

  const { rows: userRows } = await pool.query(
    `INSERT INTO users (email, password_hash, name, role_id, points, volunteer_qr_code, status)
     VALUES ($1, $2, $3, $4, 0, $5, 'active') RETURNING id, email, name`,
    [email, hash, name, roleId, qr]
  );

  // Link an organisation record (skip if one already exists for this email)
  const { rows: orgExists } = await pool.query(
    "SELECT id FROM organizations WHERE contact_email = $1 LIMIT 1", [email]
  );
  if (orgExists.length === 0) {
    await pool.query(
      `INSERT INTO organizations (org_name, org_type, contact_person, contact_email, approval_status, status)
       VALUES ($1, $2, $3, $4, 'approved', 'active')`,
      [data.org_name || `${name}'s Organisation`, data.org_type || "community_group", name, email]
    );
  }

  return {
    user: userRows[0],
    message: `Organiser account created for ${name}. Login: ${email} / password123`,
  };
}

// ─── Reset User Password ──────────────────────────────────
async function resetUserPassword(userId, { newPassword }) {
  if (!newPassword || newPassword.length < 8) {
    throw createError(400, "validation_error", "Password must be at least 8 characters.");
  }
  const bcrypt = require("bcrypt");
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const { rows } = await pool.query(
    "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email",
    [passwordHash, userId]
  );
  if (rows.length === 0) throw createError(404, "not_found", "User not found.");
  return { message: "Password reset successfully.", user: rows[0] };
}

module.exports = {
  getDashboardStats, getRecentActivity,
  listUsers, getUserDetail, updateUserStatus,
  listOrganisers, approveOrganiser,
  listEvents, deleteEvent, getEventParticipation,
  listCoupons, createCoupon, updateCoupon, deleteCoupon,
  getRewardsConfig, updateRewardsConfig,
  listRedemptions, cleanupOldRedemptions,
  listMerchants,
  createMerchant,
  listMerchantProducts,
  createMerchantProduct,
  getCouponPins,
  updateUserRole,
  updateMerchant,
  listProspects,
  createProspect,
  updateProspectStatus,
  createMerchantAccount,
  createOrganiserAccount,
  createUserAccount,
  resetUserPassword,
};
