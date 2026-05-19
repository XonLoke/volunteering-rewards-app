/**
 * Attendance Controller — QR scanning and check-in
 *
 * Response shapes defined in API_CONTRACTS.md (Organiser Scanning App section).
 */

// ─── POST /api/attendance/scan ───────────────────────────────
async function scan(req, res, next) {
  try {
    // TODO: EVT-04 — Record attendance, award points
    // Body: { volunteer_id, event_id, scanned_at }
    // Errors: not_registered, already_checked_in, event_not_today
    res.json({
      attendance: { id: "", volunteer_id: "", volunteer_name: "", event_id: "", event_title: "", points_awarded: 0, checked_in_at: "" },
      volunteer: { name: "", points_balance: 0 },
    });
  } catch (err) { next(err); }
}

// ─── POST /api/attendance/batch ──────────────────────────────
async function batch(req, res, next) {
  try {
    // TODO: EVT-05 — Batch sync offline scans
    // Body: { scans: [{ volunteer_id, event_id, scanned_at }], device_id }
    res.json({ results: [], success_count: 0, skipped_count: 0 });
  } catch (err) { next(err); }
}

module.exports = { scan, batch };
