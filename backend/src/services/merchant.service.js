const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");
const { hashPin } = require("./rewards.service");
const { createNotification } = require("./notification.service");

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
            COALESCE(uc.expiry_date, c.expiry_date) AS expiry_date,
            uc.created_at, uc.redeemed_at, uc.verified_by,
            c.title, c.description, c.points_required,
            c.value_cents, c.merchant_name, c.quantity AS quantity_remaining,
            u.name AS volunteer_name, u.email AS volunteer_email
       FROM user_coupons uc
       JOIN coupons c ON c.id = uc.coupon_id
       LEFT JOIN users u ON u.id = uc.user_id
      WHERE uc.pin_hash = $1`,
    [pinHash]
  );

  if (result.rows.length === 0) throw createError(404, "invalid_pin", "Wrong 6-digit PIN.");
  const coupon = result.rows[0];
  if (coupon.status === "used") throw createError(409, "already_redeemed", "Coupon already used.");
  if (coupon.status === "expired" || new Date(coupon.expiry_date) <= new Date()) {
    throw createError(400, "expired", "Coupon has expired.");
  }

  // NOTE: expiry_date is COALESCEd in the SELECT above (uc.expiry_date falls
  // back to c.expiry_date), so new Date(null) → 1970 can never falsely
  // "expire" a coupon whose user_coupons.expiry_date is NULL.

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
      query = `SELECT uc.id AS user_coupon_id, uc.user_id AS volunteer_user_id, uc.status, COALESCE(uc.expiry_date, c.expiry_date) AS expiry_date, c.title, c.points_required, c.value_cents, u.name AS volunteer_name
                 FROM user_coupons uc
                 JOIN coupons c ON c.id = uc.coupon_id
                 JOIN users u ON u.id = uc.user_id
                WHERE uc.id = $1
                FOR UPDATE`;
      params = [userCouponId];
    } else {
      query = `SELECT uc.id AS user_coupon_id, uc.user_id AS volunteer_user_id, uc.status, COALESCE(uc.expiry_date, c.expiry_date) AS expiry_date, c.title, c.points_required, c.value_cents, u.name AS volunteer_name
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

    // Notify the volunteer that their coupon was used — non-blocking
    createNotification({
      userId: coupon.volunteer_user_id,
      title: "Coupon Used!",
      description: `Your "${coupon.title}" has been redeemed at the merchant.`,
      icon: "checkmark-circle-outline",
      color: "#10b981",
    }).catch(() => {});

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
       VALUES ($1, $2, 'reversed', $3, $4, NOW(), $5)`,
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
       LEFT JOIN users u ON u.id = uc.user_id
       ${whereSql}`,
    values
  );

  values.push(safeLimit, offset);
  const result = await pool.query(
    `SELECT rl.id, rl.user_coupon_id, rl.action, rl.action_by, rl.ip_address,
            rl.created_at, rl.notes, rl.points_spent,
            COALESCE(rl.value_cents, c.value_cents, 0) AS value_cents,
            uc.status AS coupon_status, uc.status AS status, uc.redeemed_at, uc.pin_code,
            CASE WHEN rl.action = 'reversed' THEN rl.created_at END AS reversed_at,
            c.id AS coupon_id, c.title AS coupon_title,
            u.id AS volunteer_id, u.name AS volunteer_name, u.email AS volunteer_email,
            verifier.name AS verified_by_name
       FROM redemption_logs rl
       JOIN user_coupons uc ON uc.id = rl.user_coupon_id
       JOIN coupons c ON c.id = uc.coupon_id
       LEFT JOIN users u ON u.id = uc.user_id
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

// ---------------------------------------------------------------------------
// Merchant Dashboard
// ---------------------------------------------------------------------------

/**
 * Find merchant business record by user's email.
 */
async function findMerchantByUserEmail(userEmail) {
  const result = await pool.query(
    `SELECT id, name FROM merchants WHERE contact_email = $1 AND status = 'active' LIMIT 1`,
    [userEmail]
  );
  return result.rows[0] || null;
}

/**
 * Find merchant business record by user ID.
 * Looks up user email first, then finds merchant by contact_email.
 */
async function findMerchantByUserId(userId) {
  const userResult = await pool.query(
    `SELECT email FROM users WHERE id = $1`,
    [userId]
  );
  if (userResult.rows.length === 0) return null;
  return findMerchantByUserEmail(userResult.rows[0].email);
}

/**
 * GET /api/merchant/dashboard
 *
 * Returns aggregated stats for the merchant's dashboard.
 */
async function getDashboardStats(userId) {
  const merchant = await findMerchantByUserId(userId);
  if (!merchant) {
    return {
      merchant_name: "Your Store",
      today_redemptions: 0,
      today_value: 0,
      active_products: 0,
      total_redemptions: 0,
      popular_items: [],
      recent_activity: [],
    };
  }

  const merchantId = merchant.id;

  // Today's date range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayStats, productCount, popularItems, recentActivity] =
    await Promise.all([
      // Today's redemption stats
      pool.query(
        `SELECT COUNT(*)::int AS count, COALESCE(SUM(rl.value_cents), 0)::int AS total_value
           FROM redemption_logs rl
           JOIN user_coupons uc ON uc.id = rl.user_coupon_id
           JOIN coupons c ON c.id = uc.coupon_id
          WHERE rl.created_at >= $1
            AND rl.action = 'used'
            AND (c.merchant_name = $2 OR c.merchant_name ILIKE $3)`,
        [todayStart, merchant.name, `%${merchant.name}%`]
      ),
      // Active product count
      pool.query(
        `SELECT COUNT(*)::int AS count
           FROM merchant_products
          WHERE merchant_id = $1 AND is_active = TRUE`,
        [merchantId]
      ),
      // Popular items (top 5 most redeemed)
      pool.query(
        `SELECT c.title, COUNT(*)::int AS redemption_count
           FROM redemption_logs rl
           JOIN user_coupons uc ON uc.id = rl.user_coupon_id
           JOIN coupons c ON c.id = uc.coupon_id
          WHERE rl.action = 'used'
            AND (c.merchant_name = $1 OR c.merchant_name ILIKE $2)
          GROUP BY c.title
          ORDER BY redemption_count DESC
          LIMIT 5`,
        [merchant.name, `%${merchant.name}%`]
      ),
      // Recent activity (last 10 redemptions)
      pool.query(
        `SELECT rl.id, rl.created_at, rl.value_cents,
                c.title AS coupon_title,
                u.name AS volunteer_name
           FROM redemption_logs rl
           JOIN user_coupons uc ON uc.id = rl.user_coupon_id
           JOIN coupons c ON c.id = uc.coupon_id
           JOIN users u ON u.id = uc.user_id
          WHERE rl.action = 'used'
            AND (c.merchant_name = $1 OR c.merchant_name ILIKE $2)
          ORDER BY rl.created_at DESC
          LIMIT 10`,
        [merchant.name, `%${merchant.name}%`]
      ),
    ]);

  const totalResult = await pool.query(
    `SELECT COUNT(*)::int AS count
       FROM redemption_logs rl
       JOIN user_coupons uc ON uc.id = rl.user_coupon_id
       JOIN coupons c ON c.id = uc.coupon_id
      WHERE rl.action = 'used'
        AND (c.merchant_name = $1 OR c.merchant_name ILIKE $2)`,
    [merchant.name, `%${merchant.name}%`]
  );

  return {
    merchant_name: merchant.name,
    today_redemptions: todayStats.rows[0]?.count || 0,
    today_value_cents: todayStats.rows[0]?.total_value || 0,
    active_products: productCount.rows[0]?.count || 0,
    total_redemptions: totalResult.rows[0]?.count || 0,
    popular_items: (popularItems.rows || []).map((r) => ({
      title: r.title,
      redemption_count: r.redemption_count,
    })),
    recent_activity: (recentActivity.rows || []).map((r) => ({
      id: r.id,
      coupon_title: r.coupon_title,
      volunteer_name: r.volunteer_name,
      value_cents: r.value_cents,
      redeemed_at: r.created_at,
    })),
  };
}

// ---------------------------------------------------------------------------
// Merchant Products CRUD
// ---------------------------------------------------------------------------

/**
 * GET /api/merchant/products
 */
async function listProducts(userId) {
  const merchant = await findMerchantByUserId(userId);
  if (!merchant) return { data: [] };

  const result = await pool.query(
    `SELECT id, name, description, points_cost, is_active, created_at, updated_at
       FROM merchant_products
      WHERE merchant_id = $1
      ORDER BY is_active DESC, created_at DESC`,
    [merchant.id]
  );

  return { data: result.rows };
}

/**
 * POST /api/merchant/products
 */
async function createProduct(userId, { name, description, points_cost }) {
  if (!name || !name.trim()) {
    throw createError(400, "missing_name", "Product name is required.");
  }

  const merchant = await findMerchantByUserId(userId);
  if (!merchant) {
    throw createError(404, "merchant_not_found", "Merchant record not found.");
  }

  const cost = parseInt(points_cost) || 0;

  const result = await pool.query(
    `INSERT INTO merchant_products (merchant_id, name, description, points_cost, is_active)
     VALUES ($1, $2, $3, $4, TRUE)
     RETURNING id, name, description, points_cost, is_active, created_at`,
    [merchant.id, name.trim(), description || null, cost]
  );

  return { data: result.rows[0] };
}

/**
 * PUT /api/merchant/products/:id
 */
async function updateProduct(userId, productId, { name, description, points_cost, is_active }) {
  const merchant = await findMerchantByUserId(userId);
  if (!merchant) {
    throw createError(404, "merchant_not_found", "Merchant record not found.");
  }

  // Verify product belongs to this merchant
  const existing = await pool.query(
    `SELECT id FROM merchant_products WHERE id = $1 AND merchant_id = $2`,
    [productId, merchant.id]
  );
  if (existing.rows.length === 0) {
    throw createError(404, "not_found", "Product not found or does not belong to you.");
  }

  const updates = [];
  const values = [];
  let idx = 0;

  if (name !== undefined) { idx++; updates.push(`name = $${idx}`); values.push(name.trim()); }
  if (description !== undefined) { idx++; updates.push(`description = $${idx}`); values.push(description); }
  if (points_cost !== undefined) { idx++; updates.push(`points_cost = $${idx}`); values.push(parseInt(points_cost) || 0); }
  if (is_active !== undefined) { idx++; updates.push(`is_active = $${idx}`); values.push(is_active); }

  if (updates.length === 0) {
    throw createError(400, "no_updates", "No fields to update.");
  }

  updates.push(`updated_at = NOW()`);
  values.push(productId);

  const result = await pool.query(
    `UPDATE merchant_products SET ${updates.join(", ")} WHERE id = $${values.length}
     RETURNING id, name, description, points_cost, is_active, created_at, updated_at`,
    values
  );

  return { data: result.rows[0] };
}

/**
 * DELETE /api/merchant/products/:id  (soft delete)
 */
async function deleteProduct(userId, productId) {
  const merchant = await findMerchantByUserId(userId);
  if (!merchant) {
    throw createError(404, "merchant_not_found", "Merchant record not found.");
  }

  const result = await pool.query(
    `UPDATE merchant_products
        SET is_active = FALSE, updated_at = NOW()
      WHERE id = $1 AND merchant_id = $2
      RETURNING id, name, is_active`,
    [productId, merchant.id]
  );

  if (result.rows.length === 0) {
    throw createError(404, "not_found", "Product not found or does not belong to you.");
  }

  return { data: result.rows[0], message: "Product deactivated." };
}

/**
 * GET /api/merchant/redemptions
 *
 * Detailed redemption records for this merchant with filtering.
 */
async function listRedemptions(userId, { page = 1, limit = 20, date_from, date_to, search } = {}) {
  const merchant = await findMerchantByUserId(userId);
  if (!merchant) return { data: [], total: 0, page, limit, total_pages: 0 };

  const safePage = toPositiveInt(page, 1);
  const safeLimit = Math.min(toPositiveInt(limit, 20), 100);
  const offset = (safePage - 1) * safeLimit;

  const where = [
    `rl.action = 'used'`,
    `(c.merchant_name = $1 OR c.merchant_name ILIKE $2)`,
  ];
  const values = [merchant.name, `%${merchant.name}%`];
  let idx = 2;

  if (date_from) {
    idx++;
    where.push(`rl.created_at >= $${idx}`);
    values.push(date_from);
  }
  if (date_to) {
    idx++;
    where.push(`rl.created_at <= $${idx}`);
    values.push(date_to);
  }
  if (search) {
    idx++;
    where.push(`(c.title ILIKE $${idx} OR u.name ILIKE $${idx} OR u.email ILIKE $${idx})`);
    values.push(`%${search}%`);
  }

  const whereSql = where.join(" AND ");

  const count = await pool.query(
    `SELECT COUNT(*)::int AS total
       FROM redemption_logs rl
       JOIN user_coupons uc ON uc.id = rl.user_coupon_id
       JOIN coupons c ON c.id = uc.coupon_id
       LEFT JOIN users u ON u.id = uc.user_id
      WHERE ${whereSql}`,
    values
  );

  idx++;
  values.push(safeLimit, offset);
  const result = await pool.query(
    `SELECT rl.id, rl.user_coupon_id, rl.points_spent, rl.value_cents,
            rl.created_at AS redeemed_at, rl.notes,
            c.id AS coupon_id, c.title AS coupon_title,
            u.id AS volunteer_id, u.name AS volunteer_name, u.email AS volunteer_email
       FROM redemption_logs rl
       JOIN user_coupons uc ON uc.id = rl.user_coupon_id
       JOIN coupons c ON c.id = uc.coupon_id
       LEFT JOIN users u ON u.id = uc.user_id
      WHERE ${whereSql}
      ORDER BY rl.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}`,
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
  getDashboardStats,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listRedemptions,
};
