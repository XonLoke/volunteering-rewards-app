-- 010_create_coupons.sql
-- Reward coupons created by admins. Volunteers redeem these with points.
-- quantity tracks how many are still available (decremented on redemption).
-- status: 'active', 'inactive', 'depleted'.

CREATE TABLE IF NOT EXISTS coupons (
    id               SERIAL       PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    image_url        TEXT,
    points_required  INTEGER      NOT NULL,
    quantity         INTEGER      NOT NULL DEFAULT 0,
    expiry_date      TIMESTAMP    NOT NULL,
    status           VARCHAR(20)  DEFAULT 'active',
    created_by       INTEGER      NOT NULL REFERENCES users(id),
    created_at       TIMESTAMP    DEFAULT NOW(),
    updated_at       TIMESTAMP    DEFAULT NOW()
);
