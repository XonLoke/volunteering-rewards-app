const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

const awardPointsForEvent = async (client, eventId, volunteerId) => {
  const eventResult = await client.query(
    `SELECT id, COALESCE(points_reward, points, 0)::int AS points_reward FROM events WHERE id = $1 FOR SHARE`,
    [eventId]
  );

  if (!eventResult.rows.length) {
    throw createError(404, "event_not_found");
  }

  const points = eventResult.rows[0].points_reward;

  const userResult = await client.query(
    `SELECT id FROM users WHERE id = $1 FOR SHARE`,
    [volunteerId]
  );

  if (!userResult.rows.length) {
    throw createError(404, "user_not_found");
  }

  const existing = await client.query(
    `SELECT 1 FROM attendance_logs WHERE event_id = $1 AND volunteer_id = $2`,
    [eventId, volunteerId]
  );

  if (existing.rows.length) {
    throw createError(409, "already_scanned");
  }

  const insertLog = await client.query(
    `
      INSERT INTO attendance_logs (event_id, volunteer_id, scanned_at, points_awarded)
      VALUES ($1, $2, NOW(), $3)
      RETURNING *
    `,
    [eventId, volunteerId, points]
  );

  await client.query(
    `
      UPDATE users
      SET points = COALESCE(points, 0) + $2
      WHERE id = $1
    `,
    [volunteerId, points]
  );

  return {
    attendance: insertLog.rows[0],
    awardedPoints: points,
  };
};

const scanQR = async (eventId, volunteerId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await awardPointsForEvent(client, eventId, volunteerId);
    await client.query("COMMIT");

    // Award referral points (F3) — fire-and-forget, outside transaction
    try {
      const { awardReferralPoints } = require("./referral.service");
      await awardReferralPoints(volunteerId);
    } catch (_) {
      // Silently ignore — referral points are a bonus, not critical
    }

    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const batchSync = async (scans = []) => {
  if (!Array.isArray(scans)) {
    throw createError(400, "invalid_payload");
  }

  const client = await pool.connect();
  const results = {
    success: [],
    skipped: [],
    errors: [],
  };

  try {
    await client.query("BEGIN");

    for (const scan of scans) {
      const { eventId, volunteerId } = scan || {};

      if (!eventId || !volunteerId) {
        results.errors.push({ scan, code: "invalid_scan", message: "eventId and volunteerId are required" });
        continue;
      }

      try {
        const record = await awardPointsForEvent(client, eventId, volunteerId);
        results.success.push({ eventId, volunteerId, awardedPoints: record.awardedPoints, attendanceId: record.attendance.id });
      } catch (error) {
        if (error.status === 409 && error.message === "already_scanned") {
          results.skipped.push({ eventId, volunteerId, reason: "already_scanned" });
          continue;
        }

        results.errors.push({ eventId, volunteerId, code: error.status || 500, message: error.message || "sync_error" });
      }
    }

    await client.query("COMMIT");
    return results;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  scanQR,
  batchSync,
};
