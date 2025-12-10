# Admin System & Event Feature Deployment Guide

**Date:** December 10, 2025
**Prepared For:** Database Administrator / Technical Lead
**Context:** Feature request to allow "Administrative" control over the platform, specifically for organizing temporary events (custom navigation buttons).

## 1. Executive Summary
We are introducing a lightweight Role-Based Access Control (RBAC) system. This requires a schema update to differentiate between standard `users` and `admins`. Additionally, a `system_settings` table is required to store dynamic configurations (like temporary event links) without requiring code redeployments.

## 2. Required Database Changes

Please execute the SQL script located at:
`backend/database/migration_admin_system.sql`

### Summary of Changes:
1.  **Table Modification (`users`):** Adds a `role` column (`user`, `admin`, `moderator`). Default is `user`.
2.  **New Table (`system_settings`):** Stores key-value (JSONB) configurations.
3.  **Security (RLS):**
    *   `system_settings` is publicly readable (SELECT).
    *   `system_settings` is writable (INSERT/UPDATE/DELETE) **only** by users with `role = 'admin'`.

## 3. Post-Deployment Actions

After running the migration script, you must manually designate at least one administrator to enable management capabilities.

**Run this SQL command:**
```sql
UPDATE users 
SET role = 'admin' 
WHERE wallet = 'YOUR_ADMIN_WALLET_ADDRESS';
-- OR WHERE username = 'target_username';
```

## 4. Feature Usage (How it works)

Once deployed:
1.  The frontend will check `user.role` upon login.
2.  Admins will see an extra "Admin Dashboard" link (future implementation).
3.  The **Navbar** will query `system_settings` for key `event_button_config`.
    *   If `is_active = true`, a special button (e.g., "🔥 Hackathon") will appear on the navigation bar for all users.
    *   Admins can update this config (Label, URL, Active Status) directly via the database or a future Admin UI.

---
*End of Document*
