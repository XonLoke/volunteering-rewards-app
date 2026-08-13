-- 022_create_user_settings.sql
-- User notification preferences and settings
-- Supports: push_tokens, email_notifications, location_access toggles
--
-- Required by: GET/PUT /api/settings (from Vivian's settings.routes.js)
-- Usage: settings are auto-created on first GET if not present

CREATE TABLE IF NOT EXISTS user_settings (
    user_id             INTEGER      PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    push_notifications  BOOLEAN      NOT NULL DEFAULT TRUE,
    email_notifications BOOLEAN      NOT NULL DEFAULT TRUE,
    location_access     BOOLEAN      NOT NULL DEFAULT FALSE,
    expo_push_token     VARCHAR(255),
    created_at          TIMESTAMP    DEFAULT NOW(),
    updated_at          TIMESTAMP    DEFAULT NOW()
);

-- Auto-create settings row for existing users via INSERT ... ON CONFLICT
-- (handled by the GET /api/settings handler)
