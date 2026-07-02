const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");
const { hashPin } = require("./rewards.service");

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalisePin(pin) {
  const value = String(pin || "").trim();
  if (!/^\d{6}$/.test(value)) throw createError(400, "invalid_pin", "PIN must be exactly 6 digits.");
  return value;
}

async function findCouponByPin(pin) {
  const pinHash = hashPin(normalisePin(pin));
  const result = await pool.query(
    `SELECT uc.id AS user_coupon_id, uc.user_id, uc.coupon_id, uc.status,
            uc.expiry_date, uc.created_at, uc.redeemed_at, uc.verified_by,
            c.title, c.description, c.points_required,
            c.value_cents, c.merchant_name,
            u.name AS volunteer_name, u.email AS volunteer_email
       FROM user_coupons uc
       JOIN coupons c ON c.id = uc.coupon_id
       JOIN users u ON u.id = uc.user_id
      WHERE uc.pin_hash = $1`,
    [pinHash]
  );

  if (result.rows.length === 0) throw createError(404, "invalid_pin", "Wrong 6-digit PIN.");
  const coupon = result.rows[0];
  if (coupon.status === "used") throw createError(409, "already_redeemed", "Coupon already used.");
  if (coupon.status === "expired" || new Date(coupon.expiry_date) <= new Date()) {
    throw createError(400, "expired", "Coupon has expired.");
  }

  const { revoked_at, ...rest } = coupon;

  return {
    coupon: {
      ...rest,
      coupon_title: coupon.title,
      coupon_type: coupon.title,
      valid_until: coupon.expiry_date,
      points_cost: coupon.points_required,
    },
  };
}

async function verifyPin({ pin }) {
  return findCouponByPin(pin);
}

async function redeemCoupon({ pin, userCouponId, notes } = {}, cashierId, meta = {}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const normalisedPin = pin ? normalisePin(pin) : null;

    let query;
    let params;
    if (userCouponId) {
      query = `SELECT uc.id AS user_coupon_id, uc.status, uc.expiry_date, c.title, c.points_required, c.value_cents, u.name AS volunteer_name
                 FROM user_coupons uc
                 JOIN coupons c ON c.id = uc.coupon_id
                 JOIN users u ON u.id = uc.user_id
                WHERE uc.id = $1
                FOR UPDATE`;
      params = [userCouponId];
    } else {
      query = `SELECT uc.id AS user_coupon_id, uc.status, uc.expiry_date, c.title, c.points_required, c.value_cents, u.name AS volunteer_name
                 FROM user_coupons uc
                 JOIN coupons c ON c.id = uc.coupon_id
                 JOIN users u ON u.id = uc.user_id
                WHERE uc.pin_hash = $1
                FOR UPDATE`;
      params = [hashPin(normalisedPin)];
    }

    const lookup = await client.query(query, params);
    if (lookup.rows.length === 0) throw createError(404, "invalid_pin", "Wrong 6-digit PIN.");

    const coupon = lookup.rows[0];
    if (coupon.status === "used") throw createError(409, "already_redeemed", "Coupon already used.");
    if (coupon.status === "expired" || new Date(coupon.expiry_date) <= new Date()) {
      throw createError(400, "expired", "Coupon has expired.");
    }

    const updated = await client.query(
      `UPDATE user_coupons
          SET status = 'used', redeemed_at = NOW(), verified_by = $2
        WHERE id = $1 AND status = 'unused'
        RETURNING id, status, redeemed_at, verified_by`,
      [coupon.user_coupon_id, cashierId]
    );
    if (updated.rows.length === 0) throw createError(409, "already_redeemed", "Coupon already used.");

    await client.query(
      `INSERT INTO redemption_logs (user_coupon_id, points_spent, action, action_by, ip_address, created_at, notes)
       VALUES ($1, $2, 'used', $3, $4, NOW(), $5)`,
      [coupon.user_coupon_id, coupon.points_required || 0, cashierId, meta.ipAddress || null, notes || "Cashier marked coupon as used"]
    );

    await client.query("COMMIT");

    return {
      redemption: {
        ...updated.rows[0],
        user_coupon_id: coupon.user_coupon_id,
        coupon_type: coupon.title,
        coupon_title: coupon.title,
        volunteer_name: coupon.volunteer_name,
        value_cents: coupon.value_cents,
        pin: pin || null,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function reverseRedemption({ userCouponId, notes } = {}, cashierId, meta = {}) {
  if (!userCouponId) throw createError(400, "missing_user_coupon", "userCouponId is required.");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const lookup = await client.query(
      `SELECT id, status, redeemed_at
         FROM user_coupons
        WHERE id = $1
        FOR UPDATE`,
      [userCouponId]
    );
    if (lookup.rows.length === 0) throw createError(404, "not_found", "Coupon redemption not found.");

    const coupon = lookup.rows[0];
    if (coupon.status !== "used") throw createError(400, "not_redeemed", "Only used coupons can be reversed.");

    const withinFiveMinutes = new Date(coupon.redeemed_at).getTime() >= Date.now() - 5 * 60 * 1000;
    if (!withinFiveMinutes) {
      throw createError(403, "reverse_window_expired", "Redemption can only be reversed within 5 minutes.");
    }

    const updated = await client.query(
      `UPDATE user_coupons
          SET status = 'unused', redeemed_at = NULL, verified_by = NULL
        WHERE id = $1
        RETURNING id, status, redeemed_at, verified_by`,
      [userCouponId]
    );

    await client.query(
      `INSERT INTO redemption_logs (user_coupon_id, points_spent, action, action_by, ip_address, created_at, notes)
       VALUES ($1, $2, 'redeemed', $3, $4, NOW(), $5)`,
      [userCouponId, coupon.points_required || 0, cashierId, meta.ipAddress || null, notes || "Cashier reversed redemption within 5-minute window"]
    );

    await client.query("COMMIT");
    return { data: updated.rows[0] };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function getRedemptionHistory({ page = 1, limit = 20, action, search } = {}) {
  const safePage = toPositiveInt(page, 1);
  const safeLimit = Math.min(toPositiveInt(limit, 20), 100);
  const offset = (safePage - 1) * safeLimit;

  const where = [];
  const values = [];

  if (action) {
    values.push(action);
    where.push(`rl.action = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    where.push(`(c.title ILIKE $${values.length} OR u.name ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const count = await pool.query(
    `SELECT COUNT(*)::int AS total
       FROM redemption_logs rl
       JOIN user_coupons uc ON uc.id = rl.user_coupon_id
       JOIN coupons c ON c.id = uc.coupon_id
       JOIN users u ON u.id = uc.user_id
       ${whereSql}`,
    values
  );

  values.push(safeLimit, offset);
  const result = await pool.query(
    `SELECT rl.id, rl.user_coupon_id, rl.action, rl.action_by, rl.ip_address,
            rl.created_at, rl.notes,
            uc.status AS coupon_status, uc.redeemed_at,
            c.id AS coupon_id, c.title AS coupon_title,
            u.id AS volunteer_id, u.name AS volunteer_name, u.email AS volunteer_email,
            verifier.name AS verified_by_name
       FROM redemption_logs rl
       JOIN user_coupons uc ON uc.id = rl.user_coupon_id
       JOIN coupons c ON c.id = uc.coupon_id
       JOIN users u ON u.id = uc.user_id
       LEFT JOIN users verifier ON verifier.id = rl.action_by
       ${whereSql}
      ORDER BY rl.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  const total = count.rows[0]?.total || 0;
  return {
    data: result.rows,
    total,
    page: safePage,
    limit: safeLimit,
    total_pages: Math.ceil(total / safeLimit),
  };
}

module.exports = {
  verifyPin,
  redeemCoupon,
  reverseRedemption,
  getRedemptionHistory,
};
