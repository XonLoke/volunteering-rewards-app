-- ============================================================
-- Cleanup: orphan check-ins (attendance_logs with NO registration)
-- Created 2 Aug 2026 — after fixing scan to require registration
--
-- HOW TO RUN (3 steps):
--   1. Open https://console.neon.tech/app/projects/flat-sea-20242971
--   2. Left sidebar → "SQL Editor"
--   3. Paste ALL of this file, then click Run
--
-- IMPORTANT: Run STEP 1 first and look at the output. If the volunteer
-- really DID attend the event but is registered under the OTHER duplicate
-- event (e.g. same-named event), tell Xon before running Steps 2-3.
-- ============================================================

-- ── STEP 1 — PREVIEW: who are the orphan check-ins? ─────────
-- Shows every check-in record that has no matching event registration.
-- (For the reported bug this is 1 row: event 18 "Beach Cleanup @ East Coast")
SELECT al.id, al.event_id, e.title AS event, al.user_id,
       u.name AS volunteer, u.email, al.points_awarded, al.scanned_at
FROM attendance_logs al
JOIN users u ON u.id = al.user_id
JOIN events e ON e.id = al.event_id
WHERE al.scan_type = 'check_in'
  AND NOT EXISTS (
    SELECT 1 FROM event_registrations er
    WHERE er.event_id = al.event_id AND er.user_id = al.user_id
  );

-- ── STEP 2 — REFUND points awarded by those orphan check-ins ─
UPDATE users u
SET points = GREATEST(COALESCE(u.points, 0) - al.points_awarded, 0)
FROM attendance_logs al
WHERE u.id = al.user_id
  AND al.scan_type = 'check_in'
  AND NOT EXISTS (
    SELECT 1 FROM event_registrations er
    WHERE er.event_id = al.event_id AND er.user_id = al.user_id
  );

-- ── STEP 3 — DELETE the orphan attendance logs ──────────────
DELETE FROM attendance_logs al
WHERE al.scan_type = 'check_in'
  AND NOT EXISTS (
    SELECT 1 FROM event_registrations er
    WHERE er.event_id = al.event_id AND er.user_id = al.user_id
  );

-- ── STEP 4 — VERIFY: this must return 0 ─────────────────────
SELECT COUNT(*) AS remaining_orphans
FROM attendance_logs al
WHERE al.scan_type = 'check_in'
  AND NOT EXISTS (
    SELECT 1 FROM event_registrations er
    WHERE er.event_id = al.event_id AND er.user_id = al.user_id
  );
