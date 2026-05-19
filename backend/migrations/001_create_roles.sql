-- 001_create_roles.sql
-- Lookup table for user roles (volunteer, organizer, admin).

CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL       PRIMARY KEY,
    role_name   VARCHAR(50)  NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP    DEFAULT NOW()
);
