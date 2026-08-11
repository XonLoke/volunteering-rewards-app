/**
 * Notification Service
 *
 * Creates in-app notifications for volunteers.
 * Used as a reusable helper across services (rewards, merchant, events, etc.).
 */

const { pool } = require("../config/database");

/**
 * Create a notification for a user.
 *
 * @param {object} params
 * @param {number} params.userId   — The user to notify
 * @param {string} params.title    — Short headline (e.g. "Coupon Redeemed!")
 * @param {string} [params.description] — Longer detail
 * @param {string} [params.icon]   — Ionicon name (default: 'notifications-outline')
 * @param {string} [params.color]  — Hex colour (default: '#6366f1')
 * @returns {Promise<object>}      — The inserted notification row
 */
async function createNotification({ userId, title, description = "", icon = "notifications-outline", color = "#6366f1" }) {
  if (!userId || !title) return null;

  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, title, description, icon, color, is_read, created_at)
     VALUES ($1, $2, $3, $4, $5, FALSE, NOW())
     RETURNING id, user_id, title, description, icon, color, is_read, created_at`,
    [userId, title, description, icon, color]
  );
  return rows[0] || null;
}

module.exports = { createNotification };
