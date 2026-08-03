const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");
const { createNotification } = require("./notification.service");

const awardPointsForEvent = async (client, eventId, volunteerId) => {
  const eventResult = await client.query(
    `SELECT id, title, COALESCE(points_value, 0)::int AS points_reward FROM events WHERE id = $1 FOR SHARE`,
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

  // Verify the volunteer is registered for this event — prevents orphan
  // check-ins (attendance_logs without an event_registration), which made
  // admin/organiser detail views show stale counts while lists were correct.
  const registration = await client.query(
    `SELECT 1 FROM event_registrations WHERE event_id = $1 AND user_id = $2 AND status = 'registered'`,
    [eventId, volunteerId]
  );

  if (!registration.rows.length) {
    throw createError(400, "not_registered", "Volunteer is not registered for this event.");
  }

  const existing = await client.query(
    `SELECT 1 FROM attendance_logs WHERE event_id = $1 AND user_id = $2`,
    [eventId, volunteerId]
  );

  if (existing.rows.length) {
    throw createError(409, "already_scanned");
  }

  const insertLog = await client.query(
    `
      INSERT INTO attendance_logs (event_id, user_id, scanned_by, scan_type, qr_code_value, points_awarded)
      VALUES ($1, $2, $3, 'check_in', $4, $5)
      RETURNING *
    `,
    [eventId, volunteerId, null, null, points]
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
    eventTitle: eventResult.rows[0].title,
  };
};

const scanQR = async (eventId, volunteerId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await awardPointsForEvent(client, eventId, volunteerId);
    await client.query("COMMIT");

    // Non-blocking: notify volunteer of points earned
    createNotification({
      userId: volunteerId,
      title: "Points Earned!",
      description: `You earned ${result.awardedPoints} points for attending ${result.eventTitle}.`,
      icon: "star-outline",
      color: "#f59e0b",
    }).catch(() => {});

    // Note: Sponsorship points (F3) are awarded at registration time
    // via linkSponsorship() in the auth service, not on attendance.

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
      // Accept both camelCase (API contract) and snake_case (scanner PWA's
      // stored offline scans) — additive normalisation, no client breakage.
      const eventId = scan?.eventId ?? scan?.event_id;
      const volunteerId = scan?.volunteerId ?? scan?.volunteer_id;

      if (!eventId || !volunteerId) {
        results.errors.push({ scan, code: "invalid_scan", message: "eventId and volunteerId are required" });
        continue;
      }

      try {
        const record = await awardPointsForEvent(client, eventId, volunteerId);
        results.success.push({ eventId, volunteerId, awardedPoints: record.awardedPoints, attendanceId: record.attendance.id });
      } catch (error) {
        if ((error.statusCode === 409 || error.status === 409) && error.code === "already_scanned") {
          results.skipped.push({ eventId, volunteerId, reason: "already_scanned" });
          continue;
        }

        results.errors.push({ eventId, volunteerId, code: error.code || error.statusCode || error.status || 500, message: error.message || error.code || "sync_error" });
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

/**
 * Get the latest attendance record for a volunteer after a given timestamp.
 * Used by the volunteer's QR display screen to auto-detect when the organizer has scanned them.
 *
 * @param {number} volunteerId — the volunteer's user ID
 * @param {string} after — ISO 8601 timestamp; only records after this time are considered
 * @returns {object|null} — attendance record or null if none found
 */
async function getLatestAttendance(volunteerId, after) {
  const { rows } = await pool.query(
    `SELECT al.id, al.event_id, al.user_id, al.points_awarded, al.scanned_at,
            e.title AS event_name, e.location
     FROM attendance_logs al
     JOIN events e ON e.id = al.event_id
     WHERE al.user_id = $1
       AND al.scanned_at > $2::timestamptz
     ORDER BY al.scanned_at DESC
     LIMIT 1`,
    [volunteerId, after]
  );

  if (rows.length === 0) return null;

  const r = rows[0];
  return {
    id: r.id,
    eventId: r.event_id,
    eventName: r.event_name,
    location: r.location,
    pointsAwarded: r.points_awarded,
    scannedAt: r.scanned_at,
  };
}

module.exports = {
  scanQR,
  batchSync,
  getLatestAttendance,
};
