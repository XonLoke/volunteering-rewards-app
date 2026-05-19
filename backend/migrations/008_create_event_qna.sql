-- 008_create_event_qna.sql
-- Q&A board per event. Volunteers ask, organizers answer.

CREATE TABLE IF NOT EXISTS event_qna (
    id           SERIAL       PRIMARY KEY,
    event_id     INTEGER      NOT NULL REFERENCES events(id),
    question_by  INTEGER      NOT NULL REFERENCES users(id),
    question     TEXT         NOT NULL,
    answer_by    INTEGER      REFERENCES users(id),
    answer       TEXT,
    is_published BOOLEAN      DEFAULT FALSE,
    created_at   TIMESTAMP    DEFAULT NOW(),
    updated_at   TIMESTAMP    DEFAULT NOW()
);
