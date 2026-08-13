-- 016_create_merchant_prospects.sql
-- Merchant sourcing/prospect tracking for admin.
-- Admin can track potential merchants before full registration.

CREATE TABLE IF NOT EXISTS merchant_prospects (
    id              SERIAL       PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(255),
    contact_email   VARCHAR(255),
    contact_phone   VARCHAR(20),
    notes           TEXT,
    status          VARCHAR(20)  DEFAULT 'lead',
    created_by      INTEGER      REFERENCES users(id),
    created_at      TIMESTAMP    DEFAULT NOW(),
    updated_at      TIMESTAMP    DEFAULT NOW()
);
