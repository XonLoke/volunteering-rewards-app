-- 018_allow_null_user_id_in_coupons.sql
-- PINs are generated at coupon batch creation before any user claims them.
-- user_id must be nullable to support pre-generated PIN inventory.
-- When a volunteer redeems a coupon, user_id is set at that point.

ALTER TABLE user_coupons
  ALTER COLUMN user_id DROP NOT NULL;
