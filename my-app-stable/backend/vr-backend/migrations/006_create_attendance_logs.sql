-- 006_create_attendance_logs.sql
-- Immutable audit log for QR-based attendance and points awards.
-- scan_type: 'check_in' (arrival) or 'points_award' (post-event points).
-- UNIQUE(user_id, event_id, scan_type) prevents duplicate scans of the same type.

CREATE TABLE IF NOT EXISTS attendance_logs (
    id              SERIAL       PRIMARY KEY,
    event_id        INTEGER      NOT NULL REFERENCES events(id),
    user_id         INTEGER      NOT NULL REFERENCES users(id),
    scanned_by      INTEGER      REFERENCES users(id),
    scan_type       VARCHAR(20)  NOT NULL CHECK (scan_type IN ('check_in', 'points_award')),
    qr_code_value   TEXT,
    points_awarded  INTEGER      DEFAULT 0,
    scanned_at      TIMESTAMP    DEFAULT NOW(),
    UNIQUE(user_id, event_id, scan_type)
);
