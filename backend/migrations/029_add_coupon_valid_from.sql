-- Add optional valid_from to coupons.
-- The admin portal has always shown a "Valid From" date field, but the value was
-- never persisted (no column existed). Wire it through now so the field actually works.
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS valid_from TIMESTAMP;
