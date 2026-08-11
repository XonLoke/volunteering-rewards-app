-- 027_fix_email_config_duplicates.sql
-- Fix: migration 026 had INSERT ... ON CONFLICT DO NOTHING without a conflict target,
-- so every migration re-run inserted a new default row. This caused the UPDATE in
-- emailConfig.service.js (which used LIMIT 1 without ORDER BY) to hit a stale row,
-- making config changes appear to silently fail.
--
-- Fix steps:
--   1. Delete all rows EXCEPT the most recent one (keep the one with actual config)
--   2. Add a single-row constraint to prevent future duplicates
--   3. Update the INSERT in migration 026 to use WHERE NOT EXISTS

-- Step 1: Keep only the latest email_config row
DELETE FROM email_config
WHERE id NOT IN (
  SELECT id FROM email_config ORDER BY id DESC LIMIT 1
);

-- Step 2: Add a single-row constraint (enforce exactly one config row)
-- Use a partial unique index on a constant column (TRUE) to allow only one row
ALTER TABLE email_config ADD COLUMN IF NOT EXISTS single_row BOOLEAN DEFAULT TRUE;

-- Remove any existing duplicate constraints first (safe re-run)
DROP INDEX IF EXISTS idx_email_config_single_row;

-- Create a unique index — only one row can have single_row = TRUE
CREATE UNIQUE INDEX idx_email_config_single_row ON email_config (single_row);
