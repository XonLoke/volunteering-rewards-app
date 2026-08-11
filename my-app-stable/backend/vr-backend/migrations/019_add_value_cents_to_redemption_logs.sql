-- 019_add_value_cents_to_redemption_logs.sql
-- Snapshot the coupon's dollar value (in cents) at the time of redemption.
-- This ensures historical redemption records remain accurate even if the
-- coupon's value_cents or rewards config changes later.

-- Add value_cents column for snapshotting the value at redemption time
ALTER TABLE redemption_logs
  ADD COLUMN IF NOT EXISTS value_cents INTEGER;

-- Make user_id and coupon_id nullable — some code paths (cashier verified)
-- create redemption_logs with only user_coupon_id, not the direct user/coupon IDs
ALTER TABLE redemption_logs
  ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE redemption_logs
  ALTER COLUMN coupon_id DROP NOT NULL;

-- Backfill existing records with the current coupon's value_cents
UPDATE redemption_logs rl
  SET value_cents = c.value_cents
  FROM coupons c
  WHERE rl.coupon_id = c.id
    AND rl.value_cents IS NULL;

-- For records missing coupon_id (cashier-verified path), get value from user_coupons chain
UPDATE redemption_logs rl
  SET value_cents = c.value_cents
  FROM user_coupons uc
  JOIN coupons c ON c.id = uc.coupon_id
  WHERE rl.user_coupon_id = uc.id
    AND rl.coupon_id IS NULL
    AND rl.value_cents IS NULL;
