-- Migration: Fix category constraint to support all categories
-- This fixes Bug 2 where posts with certain categories were being rejected

-- Drop the old constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;

-- Add the new constraint with all supported categories
ALTER TABLE projects ADD CONSTRAINT projects_category_check
  CHECK (category IN ('DeFi', 'NFT', 'Gaming', 'Infrastructure', 'DAO', 'DePIN', 'Social', 'Mobile', 'Security'));

COMMIT;
