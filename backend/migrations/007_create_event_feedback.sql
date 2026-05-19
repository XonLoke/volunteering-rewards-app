-- 007_create_event_feedback.sql
-- Volunteer feedback and ratings for events they attended.

CREATE TABLE IF NOT EXISTS event_feedback (
    id          SERIAL       PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES users(id),
    event_id    INTEGER      NOT NULL REFERENCES events(id),
    rating      INTEGER      CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    created_at  TIMESTAMP    DEFAULT NOW()
);
