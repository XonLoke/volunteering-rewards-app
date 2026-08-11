-- 012_create_redemption_logs.sql
-- Immutable audit trail for all point-spending actions.
-- Each row records what was spent, on which coupon, and who performed the action.

CREATE TABLE IF NOT EXISTS redemption_logs (
    id              SERIAL       PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES users(id),
    coupon_id       INTEGER      NOT NULL REFERENCES coupons(id),
    user_coupon_id  INTEGER      REFERENCES user_coupons(id),
    points_spent    INTEGER      NOT NULL,
    action          VARCHAR(20)  NOT NULL,
    action_by       INTEGER      REFERENCES users(id),
    ip_address      VARCHAR(45),
    created_at      TIMESTAMP    DEFAULT NOW(),
    notes           TEXT
);
