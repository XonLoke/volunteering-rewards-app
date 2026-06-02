const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

const awardPointsForEvent = async (client, eventId, volunteerId) => {
  // Get event details
  const eventResult = await client.query(
    `
    SELECT 
      id,
      title,
      COALESCE(points_value, 0)::int AS points_value
    FROM events
    WHERE id = $1
    FOR SHARE
    `,
    [eventId]
  );

  if (!eventResult.rows.length) {
    throw createError(404, "event_not_found");
  }

  const event = eventResult.rows[0];
  const points = event.points_value;

  // Check user exists
  const userResult = await client.query(
    `
    SELECT id, points
    FROM users
    WHERE id = $1
    FOR UPDATE
    `,
    [volunteerId]
  );

  if (!userResult.rows.length) {
    throw createError(404, "user_not_found");
  }

  // Prevent same user from scanning same event twice
  const existing = await client.query(
    `
    SELECT 1
    FROM attendance_logs
    WHERE event_id = $1
      AND user_id = $2
    `,
    [eventId, volunteerId]
  );

  if (existing.rows.length) {
    throw createError(409, "already_scanned");
  }

  // Insert attendance log
  const insertLog = await client.query(
    `
    INSERT INTO attendance_logs (
      event_id,
      user_id,
      scanned_by,
      scan_type,
      points_awarded,
      scanned_at
    )
    VALUES ($1, $2, $2, 'points_award', $3, NOW())
    RETURNING *
    `,
    [eventId, volunteerId, points]
  );

  // Update user points
  const updatedUser = await client.query(
    `
    UPDATE users
    SET 
      points = COALESCE(points, 0) + $2,
      updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, email, points
    `,
    [volunteerId, points]
  );

  return {
    attendance: insertLog.rows[0],
    eventName: event.title,
    pointsEarned: points,
    totalPoints: updatedUser.rows[0].points,
    user: updatedUser.rows[0],
  };
};

const scanQR = async (eventId, volunteerId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await awardPointsForEvent(client, eventId, volunteerId);

    await client.query("COMMIT");

    return {
      message: "Scan successful",
      eventName: result.eventName,
      pointsEarned: result.pointsEarned,
      totalPoints: result.totalPoints,
      attendance: result.attendance,
      user: result.user,
    };
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
        results.errors.push({
          scan,
          code: "invalid_scan",
          message: "eventId and volunteerId are required",
        });
        continue;
      }

      try {
        const record = await awardPointsForEvent(client, eventId, volunteerId);

        results.success.push({
          eventId,
          volunteerId,
          eventName: record.eventName,
          pointsEarned: record.pointsEarned,
          totalPoints: record.totalPoints,
          attendanceId: record.attendance.id,
        });
      } catch (error) {
        if (error.status === 409 && error.message === "already_scanned") {
          results.skipped.push({
            eventId,
            volunteerId,
            reason: "already_scanned",
          });
          continue;
        }

        results.errors.push({
          eventId,
          volunteerId,
          code: error.status || 500,
          message: error.message || "sync_error",
        });
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