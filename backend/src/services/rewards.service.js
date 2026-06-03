const crypto = require("crypto");
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

const PIN_SECRET = process.env.PIN_SECRET || process.env.JWT_SECRET || "dev-pin-secret-change-me";

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function hashPin(pin) {
  return crypto.createHmac("sha256", PIN_SECRET).update(String(pin)).digest("hex");
}

async function generateUniquePinHash(client) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const pin = String(crypto.randomInt(100000, 1000000));
    const pinHash = hashPin(pin);
    const existing = await client.query("SELECT id FROM user_coupons WHERE pin_hash = $1 LIMIT 1", [pinHash]);
    if (existing.rows.length === 0) return { pin, pinHash };
  }
  throw createError(500, "pin_generation_failed", "Could not generate a unique PIN. Please try again.");
}

async function browseRewards({ page = 1, limit = 20, search, status = "active" } = {}) {
  const safePage = toPositiveInt(page, 1);
  const safeLimit = Math.min(toPositiveInt(limit, 20), 100);
  const offset = (safePage - 1) * safeLimit;

  const where = [];
  const values = [];

  if (status) {
    values.push(status);
    where.push(`c.status = $${values.length}`);
  }

  where.push("c.quantity > 0");
  where.push("(c.expiry_date IS NULL OR c.expiry_date > NOW())");

  if (search) {
    values.push(`%${search}%`);
    where.push(`(c.title ILIKE $${values.length} OR c.description ILIKE $${values.length})`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM coupons c ${whereSql}`, values);
  const total = countResult.rows[0]?.total || 0;

  values.push(safeLimit, offset);
  const result = await pool.query(
    `SELECT c.id, c.title, c.description, c.image_url, c.points_required,
            c.quantity, c.expiry_date, c.status, c.created_at, c.updated_at
       FROM coupons c
       ${whereSql}
      ORDER BY c.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return {
    data: result.rows,
    total,
    page: safePage,
    limit: safeLimit,
    total_pages: Math.ceil(total / safeLimit),
  };
}

async function getRewardById(rewardId, userId) {
  const result = await pool.query(
    `SELECT c.id, c.title, c.description, c.image_url, c.points_required,
            c.quantity, c.expiry_date, c.status, c.created_at, c.updated_at,
            CASE WHEN f.id IS NULL THEN false ELSE true END AS is_favorite
       FROM coupons c
       LEFT JOIN favorites f
         ON f.item_type = 'coupon'
        AND f.item_id = c.id
        AND f.user_id = $2
      WHERE c.id = $1`,
    [rewardId, userId || null]
  );

  if (result.rows.length === 0) throw createError(404, "not_found", "Reward not found.");
  return { data: result.rows[0] };
}

async function redeemReward(rewardId, userId, meta = {}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const couponResult = await client.query(
      `SELECT id, title, points_required, quantity, value_cents, expiry_date, status
         FROM coupons
        WHERE id = $1
        FOR UPDATE`,
      [rewardId]
    );

    if (couponResult.rows.length === 0) throw createError(404, "not_found", "Reward not found.");

    const coupon = couponResult.rows[0];
    if (coupon.status !== "active") throw createError(400, "not_available", "Reward is not active.");
    if (coupon.quantity <= 0) throw createError(409, "out_of_stock", "Coupon fully claimed.");
    if (coupon.expiry_date && new Date(coupon.expiry_date) <= new Date()) {
      throw createError(400, "expired", "Reward has expired.");
    }

    const pointsResult = await client.query(
      "UPDATE users SET points = points - $1 WHERE id = $2 AND points >= $1 RETURNING points",
      [coupon.points_required, userId]
    );
    if (pointsResult.rows.length === 0) throw createError(403, "insufficient_points", "Not enough points.");

    const stockResult = await client.query(
      `UPDATE coupons
          SET quantity = quantity - 1,
              status = CASE WHEN quantity - 1 = 0 THEN 'depleted' ELSE status END,
              updated_at = NOW()
        WHERE id = $1 AND quantity > 0
        RETURNING quantity, status`,
      [rewardId]
    );
    if (stockResult.rows.length === 0) throw createError(409, "out_of_stock", "Coupon fully claimed.");

    const { pin, pinHash } = await generateUniquePinHash(client);
    const expiryDate = coupon.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const userCouponResult = await client.query(
      `INSERT INTO user_coupons (user_id, coupon_id, pin_hash, status, expiry_date, created_at)
       VALUES ($1, $2, $3, 'unused', $4, NOW())
       RETURNING id, user_id, coupon_id, status, expiry_date, created_at`,
      [userId, rewardId, pinHash, expiryDate]
    );
    const userCoupon = userCouponResult.rows[0];

    await client.query(
      `INSERT INTO redemption_logs (user_id, coupon_id, user_coupon_id, points_spent, value_cents, action, action_by, ip_address, created_at, notes)
       VALUES ($1, $2, $3, $4, $5, 'redeemed', $6, $7, NOW(), $8)`,
      [userId, rewardId, userCoupon.id, coupon.points_required, coupon.value_cents || 0, userId, meta.ipAddress || null, "Volunteer redeemed coupon with points"]
    );

    await client.query(
      `INSERT INTO points_ledger (user_id, amount, balance_after, reason_code, reference_id, reference_type, created_at)
       VALUES ($1, $2, $3, 'coupon_redemption', $4, 'redemption', NOW())`,
      [userId, -coupon.points_required, pointsResult.rows[0].points, userCoupon.id]
    );

    await client.query("COMMIT");

    return {
      data: {
        ...userCoupon,
        coupon_title: coupon.title,
        pin,
        points_balance: pointsResult.rows[0].points,
        remaining_quantity: stockResult.rows[0].quantity,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  browseRewards,
  getRewardById,
  redeemReward,
  hashPin,
};
