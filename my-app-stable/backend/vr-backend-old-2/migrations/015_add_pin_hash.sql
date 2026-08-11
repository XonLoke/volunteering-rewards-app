-- 015_add_pin_hash.sql
-- Adds pin_hash column to user_coupons for secure PIN verification.
-- Grace's merchant service uses HMAC-SHA256 hashed PINs instead of plain text.

ALTER TABLE user_coupons
  ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(64);
