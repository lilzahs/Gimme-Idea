# Database Migrations

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://pcipyfyannlmvaribhub.supabase.co
2. Navigate to the SQL Editor
3. Copy the contents of `migration_fix_categories.sql`
4. Paste and run the SQL in the editor
5. You should see "Success. No rows returned" message

### Option 2: Using Command Line

Run this command from the backend directory:

```bash
NODE_NO_WARNINGS=1 npx tsx database/run-migration.ts
```

---

## Current Migration Status

### ✅ Already Applied
- `migration_add_login_tracking.sql` - Login count tracking
- `migration_add_ideas_support.sql` - Ideas type support

### ⏳ Needs to be Applied
- `migration_fix_categories.sql` - **IMPORTANT**: Fixes category validation to support DePIN, Social, Mobile, Security

---

## What This Migration Fixes

The `migration_fix_categories.sql` fixes **Bug #2** where posts with certain categories (DePIN, Social, Mobile, Security) were being rejected by the database even though the frontend and backend DTOs supported them.

Before: Only supported `DeFi, NFT, Gaming, Infrastructure, DAO`
After: Supports all 9 categories: `DeFi, NFT, Gaming, Infrastructure, DAO, DePIN, Social, Mobile, Security`

---

## Migration File: migration_fix_categories.sql

```sql
-- Migration: Fix category constraint to support all categories
-- This fixes Bug 2 where posts with certain categories were being rejected

-- Drop the old constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;

-- Add the new constraint with all supported categories
ALTER TABLE projects ADD CONSTRAINT projects_category_check
  CHECK (category IN ('DeFi', 'NFT', 'Gaming', 'Infrastructure', 'DAO', 'DePIN', 'Social', 'Mobile', 'Security'));

COMMIT;
```
