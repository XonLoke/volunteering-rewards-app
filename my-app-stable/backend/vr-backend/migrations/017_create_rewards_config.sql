-- 017_create_rewards_config.sql
-- Rewards configuration table for storing points values persistently.

CREATE TABLE IF NOT EXISTS rewards_configuration (
    id                  SERIAL       PRIMARY KEY,
    points_per_dollar   INTEGER      NOT NULL DEFAULT 100,
    min_redeem_points   INTEGER      NOT NULL DEFAULT 50,
    max_redeem_per_day  INTEGER      NOT NULL DEFAULT 5,
    default_event_points INTEGER     NOT NULL DEFAULT 50,
    updated_at          TIMESTAMP    DEFAULT NOW(),
    updated_by          INTEGER      REFERENCES users(id)
);

-- Seed default config
INSERT INTO rewards_configuration (points_per_dollar, min_redeem_points, max_redeem_per_day, default_event_points)
SELECT 100, 50, 5, 50
WHERE NOT EXISTS (SELECT 1 FROM rewards_configuration);
