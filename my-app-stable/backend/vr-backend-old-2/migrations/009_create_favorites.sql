-- 009_create_favorites.sql
-- Polymorphic bookmark table. Volunteers can favourite events or coupons.
-- item_type distinguishes the target: 'event' or 'coupon'.

CREATE TABLE IF NOT EXISTS favorites (
    id          SERIAL       PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES users(id),
    item_type   VARCHAR(20)  NOT NULL,
    item_id     INTEGER      NOT NULL,
    created_at  TIMESTAMP    DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);
