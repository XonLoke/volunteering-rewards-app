-- 021_add_sponsorship_config.sql
-- Sponsorship Referral Program (F3 redesign)
-- Replaces the old referral_code system with email-based upline tracking.
-- Points values are configurable via sponsorship_configuration table.

-- Sponsorship configuration (like rewards_configuration)
CREATE TABLE IF NOT EXISTS sponsorship_configuration (
    id                      SERIAL       PRIMARY KEY,
    direct_sponsor_points   INTEGER      NOT NULL DEFAULT 10,
    helped_sponsor_points   INTEGER      NOT NULL DEFAULT 4,
    upline_helper_points    INTEGER      NOT NULL DEFAULT 6,
    updated_by              INTEGER      REFERENCES users(id),
    updated_at              TIMESTAMP    DEFAULT NOW(),
    created_at              TIMESTAMP    DEFAULT NOW()
);

-- Insert default config
INSERT INTO sponsorship_configuration (direct_sponsor_points, helped_sponsor_points, upline_helper_points)
SELECT 10, 4, 6
WHERE NOT EXISTS (SELECT 1 FROM sponsorship_configuration);

-- Add upline email fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS upline_1_email  VARCHAR(255),
  ADD COLUMN IF NOT EXISTS upline_2_email  VARCHAR(255);
