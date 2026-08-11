-- 013_add_coupon_value_and_merchant.sql
-- Adds value_cents and merchant_name columns to coupons table.
-- These fields are required by API_CONTRACTS.md response shapes.
-- value_cents: monetary value of the coupon in cents (e.g. 500 = $5.00)
-- merchant_name: display name for the issuing merchant/outlet

ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS value_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS merchant_name VARCHAR(255);
