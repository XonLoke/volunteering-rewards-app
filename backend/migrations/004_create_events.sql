-- 004_create_events.sql
-- Volunteering events created by organizers.
-- Denormalized feedback_score caches the average rating.

CREATE TABLE IF NOT EXISTS events (
    id                SERIAL          PRIMARY KEY,
    organization_id   INTEGER         REFERENCES organizations(id),
    organizer_id      INTEGER         NOT NULL REFERENCES users(id),
    title             VARCHAR(255)    NOT NULL,
    description       TEXT,
    location          VARCHAR(255),
    latitude          DECIMAL(10, 8),
    longitude         DECIMAL(11, 8),
    event_date        TIMESTAMP       NOT NULL,
    duration_hours    DECIMAL(4, 2),
    capacity          INTEGER,
    points_value      INTEGER         DEFAULT 10,
    status            VARCHAR(20)     DEFAULT 'upcoming',
    image_url         TEXT,
    category          VARCHAR(100),
    feedback_score    DECIMAL(2, 1),
    created_at        TIMESTAMP       DEFAULT NOW(),
    updated_at        TIMESTAMP       DEFAULT NOW()
);
