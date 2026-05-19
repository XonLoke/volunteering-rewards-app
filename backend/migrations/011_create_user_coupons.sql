-- 011_create_user_coupons.sql
-- Tracks each volunteer's redeemed coupons.
-- pin_code is a unique 6-digit numeric string generated at redemption time.
-- status: 'unused', 'used', 'expired'.

CREATE TABLE IF NOT EXISTS user_coupons (
    id          SERIAL       PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES users(id),
    coupon_id   INTEGER      NOT NULL REFERENCES coupons(id),
    pin_code    VARCHAR(6)   UNIQUE,
    status      VARCHAR(20)  DEFAULT 'unused',
    redeemed_at TIMESTAMP,
    verified_by INTEGER      REFERENCES users(id),
    expiry_date TIMESTAMP,
    created_at  TIMESTAMP    DEFAULT NOW()
);
