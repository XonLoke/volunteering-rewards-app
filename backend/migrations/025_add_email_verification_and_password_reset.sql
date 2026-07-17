-- 025_add_email_verification_and_password_reset.sql
-- Adds email verification and password reset support to the users table.
-- Required for:
--   - Email verification on registration (verify before first login)
--   - Forgot password / reset password flow (self-service password reset)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP,
  ADD COLUMN IF NOT EXISTS reset_password_token    VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reset_password_expires  TIMESTAMP;

-- Mark existing test users as verified so they don't break
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;
