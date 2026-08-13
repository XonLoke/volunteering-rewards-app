-- 014_create_merchants.sql
-- Merchants and their products registered by admin.
-- Sponsors goods/services that become volunteer rewards.

CREATE TABLE IF NOT EXISTS merchants (
    id              SERIAL       PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(255),
    contact_email   VARCHAR(255),
    contact_phone   VARCHAR(20),
    address         TEXT,
    status          VARCHAR(20)  DEFAULT 'active',
    created_by      INTEGER      NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP    DEFAULT NOW(),
    updated_at      TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_products (
    id              SERIAL       PRIMARY KEY,
    merchant_id     INTEGER      NOT NULL REFERENCES merchants(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    points_cost     INTEGER      NOT NULL DEFAULT 0,
    image_url       TEXT,
    is_active       BOOLEAN      DEFAULT TRUE,
    created_at      TIMESTAMP    DEFAULT NOW(),
    updated_at      TIMESTAMP    DEFAULT NOW()
);
