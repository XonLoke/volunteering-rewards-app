-- 026_create_email_config.sql
-- Email SMTP configuration for the system.
-- Stores SMTP settings that can be configured via Admin Portal.
-- Falls back to environment variables if no row exists.

CREATE TABLE IF NOT EXISTS email_config (
    id              SERIAL PRIMARY KEY,
    smtp_host       VARCHAR(255) NOT NULL DEFAULT 'smtp.gmail.com',
    smtp_port       INTEGER NOT NULL DEFAULT 465,
    smtp_secure     BOOLEAN NOT NULL DEFAULT TRUE,
    email_user      VARCHAR(255) NOT NULL DEFAULT '',
    email_pass      VARCHAR(255) NOT NULL DEFAULT '',
    email_from_name VARCHAR(255) NOT NULL DEFAULT 'Volunteer Rewards App',
    updated_by      INTEGER REFERENCES users(id),
    updated_at      TIMESTAMP DEFAULT NOW(),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Insert default row so there's always a record to read
INSERT INTO email_config (smtp_host, smtp_port, smtp_secure, email_user, email_pass, email_from_name)
VALUES ('smtp.gmail.com', 465, TRUE, '', '', 'Volunteer Rewards App')
ON CONFLICT DO NOTHING;
