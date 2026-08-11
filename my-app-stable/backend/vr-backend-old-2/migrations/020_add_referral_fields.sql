-- 020_add_referral_fields.sql
-- Volunteer Referral Program (F3)
-- Adds referral code tracking and a referral_logs audit table.
-- Referral codes are auto-generated UUID-like strings.
-- downline_1st_level and downline_2nd_level are scrollable text fields
-- storing "name (email)" pairs for display purposes.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referral_code      VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_code   VARCHAR(20),
  ADD COLUMN IF NOT EXISTS referral_points    INTEGER     DEFAULT 0;

-- Track referrals for audit trail and points awarding
CREATE TABLE IF NOT EXISTS referral_logs (
    id              SERIAL       PRIMARY KEY,
    referrer_id     INTEGER      NOT NULL REFERENCES users(id),
    referred_id     INTEGER      NOT NULL REFERENCES users(id),
    level           INTEGER      NOT NULL DEFAULT 1,  -- 1 = direct, 2 = indirect
    points_awarded  INTEGER      DEFAULT 0,
    status          VARCHAR(20)  DEFAULT 'pending',    -- pending / rewarded
    created_at      TIMESTAMP    DEFAULT NOW()
);
