/**
 * Attendance Controller — QR scanning and check-in
 *
 * Response shapes defined in API_CONTRACTS.md (Organiser Scanning App section).
 */

const attendanceService = require("../services/attendance.service");
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

// ─── POST /api/attendance/scan ───────────────────────────────
async function scan(req, res, next) {
  try {
    const { event_id, qr_code_value, volunteer_id } = req.body;

    if (!event_id) {
      throw createError(400, "validation_error", "event_id is required.");
    }

    // Two ways to identify the volunteer: QR code (scanner app) or
    // volunteer_id (organiser portal's manual check-in).
    let volunteerId;
    if (volunteer_id) {
      const vId = parseInt(volunteer_id, 10);
      if (!Number.isInteger(vId) || vId <= 0) {
        throw createError(400, "validation_error", "Invalid volunteer_id.");
      }
      const userResult = await pool.query(
        `SELECT id FROM users WHERE id = $1 AND role_id = (SELECT id FROM roles WHERE role_name = 'volunteer')`,
        [vId]
      );
      if (!userResult.rows.length) {
        throw createError(404, "volunteer_not_found", "No volunteer found with that ID.");
      }
      volunteerId = vId;
    } else {
      if (!qr_code_value) {
        throw createError(400, "validation_error", "qr_code_value is required (or volunteer_id).");
      }
      // Look up volunteer by QR code
      const userResult = await pool.query(
        `SELECT id FROM users WHERE volunteer_qr_code = $1 AND role_id = (SELECT id FROM roles WHERE role_name = 'volunteer')`,
        [qr_code_value]
      );

      if (!userResult.rows.length) {
        throw createError(404, "volunteer_not_found", "No volunteer found with that QR code.");
      }

      volunteerId = userResult.rows[0].id;
    }

    const result = await attendanceService.scanQR(event_id, volunteerId);

    // Enrich with volunteer name + balance for the scanner UI (additive —
    // existing clients only read message/data.points_awarded, which are unchanged).
    const volResult = await pool.query(
      `SELECT id, name, COALESCE(points, 0)::int AS points_balance FROM users WHERE id = $1`,
      [volunteerId]
    );

    res.status(201).json({
      message: "Check-in recorded successfully.",
      data: {
        attendance_id: result.attendance.id,
        points_awarded: result.awardedPoints,
      },
      volunteer: volResult.rows[0] || null,
    });
  } catch (err) { next(err); }
}

// ─── POST /api/attendance/batch ──────────────────────────────
async function batch(req, res, next) {
  try {
    const scans = req.body.scans || [];
    const result = await attendanceService.batchSync(scans);
    res.json({
      results: result,
      success_count: result.success.length,
      skipped_count: result.skipped.length,
      error_count: result.errors.length,
    });
  } catch (err) { next(err); }
}

// ─── GET /api/attendance/volunteer/:id/latest ──────────────────
async function getLatestAttendance(req, res, next) {
  try {
    const volunteerId = parseInt(req.params.id, 10);
    if (!Number.isInteger(volunteerId) || volunteerId <= 0) {
      throw createError(400, "validation_error", "Invalid volunteer ID.");
    }

    const after = req.query.after || new Date(0).toISOString();
    const attendance = await attendanceService.getLatestAttendance(volunteerId, after);

    if (!attendance) {
      return res.json({ found: false });
    }

    res.json({
      found: true,
      attendance: {
        id: attendance.id,
        eventId: attendance.eventId,
        event_id: attendance.eventId,
        eventName: attendance.eventName,
        event_name: attendance.eventName,
        location: attendance.location,
        pointsEarned: attendance.pointsAwarded,
        points_earned: attendance.pointsAwarded,
        pointsAwarded: attendance.pointsAwarded,
        points_awarded: attendance.pointsAwarded,
        scannedAt: attendance.scannedAt,
        scanned_at: attendance.scannedAt,
      },
    });
  } catch (err) { next(err); }
}

module.exports = { scan, batch, getLatestAttendance };
