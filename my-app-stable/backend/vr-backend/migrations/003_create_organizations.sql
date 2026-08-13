-- 003_create_organizations.sql
-- Organizations that host volunteering events.
-- Requires admin approval before becoming active.

CREATE TABLE IF NOT EXISTS organizations (
    id                     SERIAL       PRIMARY KEY,
    org_name               VARCHAR(255) NOT NULL,
    org_type               VARCHAR(100),
    uen                    VARCHAR(20),
    address                TEXT,
    contact_person         VARCHAR(255),
    contact_email          VARCHAR(255),
    contact_phone          VARCHAR(20),
    approval_document_url  TEXT,
    approval_status        VARCHAR(20)  DEFAULT 'pending',
    approved_by            INTEGER      REFERENCES users(id),
    approved_at            TIMESTAMP,
    status                 VARCHAR(20)  DEFAULT 'active',
    created_at             TIMESTAMP    DEFAULT NOW(),
    updated_at             TIMESTAMP    DEFAULT NOW()
);
