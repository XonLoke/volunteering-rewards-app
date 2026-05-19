-- 005_create_event_registrations.sql
-- Join table linking volunteers to events they register for.
-- UNIQUE(user_id, event_id) prevents duplicate registration.

CREATE TABLE IF NOT EXISTS event_registrations (
    id                SERIAL       PRIMARY KEY,
    user_id           INTEGER      NOT NULL REFERENCES users(id),
    event_id          INTEGER      NOT NULL REFERENCES events(id),
    check_in_time     TIMESTAMP,
    check_in_method   VARCHAR(50),
    status            VARCHAR(20)  DEFAULT 'registered',
    notes             TEXT,
    reminder_sent     BOOLEAN      DEFAULT FALSE,
    created_at        TIMESTAMP    DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);
