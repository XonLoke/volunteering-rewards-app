-- 002_create_users.sql
-- Core user table. Stores auth credentials, role FK, points balance,
-- and the unique QR code used for attendance scanning.

CREATE TABLE IF NOT EXISTS users (
    id                SERIAL       PRIMARY KEY,
    email             VARCHAR(255) UNIQUE NOT NULL,
    password_hash     TEXT         NOT NULL,
    name              VARCHAR(255) NOT NULL,
    phone             VARCHAR(20),
    role_id           INTEGER      NOT NULL REFERENCES roles(id),
    points            INTEGER      DEFAULT 0,
    volunteer_qr_code VARCHAR(36)  UNIQUE,
    status            VARCHAR(20)  DEFAULT 'active',
    profile_image_url TEXT,
    refresh_token     TEXT,
    created_at        TIMESTAMP    DEFAULT NOW(),
    updated_at        TIMESTAMP    DEFAULT NOW()
);
