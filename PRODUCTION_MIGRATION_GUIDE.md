# Production Database Migration Guide

## Issue
Registration failing in production with error:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'consented_at' in 'INSERT INTO'
```

## Solution
The production database is missing consent tracking columns that were added for GDPR compliance.

## Steps to Fix (Run on Production Server)

### 1. Backup Database First
```bash
# SSH into production server
ssh your-production-server

# Backup the database
mysqldump -u root -p u988863428_zone_clear > backup_before_consent_migration_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Run the Migration
```bash
# Navigate to project directory
cd /path/to/cpdo_project

# Run the specific migration
php artisan migrate --path=database/migrations/2026_09_21_040402_add_consent_fields_to_users_table.php
```

### 3. Verify the Migration
```bash
# Check if columns were added
php artisan tinker
>>> Schema::hasColumn('users', 'consented_at')
>>> Schema::hasColumn('users', 'consent_version')
>>> Schema::hasColumn('users', 'consent_ip')
# All should return true
```

### 4. Alternative: Manual SQL (if artisan not available)
If you can't run artisan commands, execute this SQL directly:

```sql
USE u988863428_zone_clear;

-- Add consent tracking columns
ALTER TABLE `users` 
ADD COLUMN `consented_at` TIMESTAMP NULL AFTER `password`,
ADD COLUMN `consent_version` VARCHAR(10) NULL AFTER `consented_at`,
ADD COLUMN `consent_ip` VARCHAR(45) NULL AFTER `consent_version`;

-- Verify columns were added
DESCRIBE users;
```

### 5. Test Registration
After migration, test user registration to ensure it works.

## What These Columns Do
- `consented_at`: Timestamp when user accepted Terms & Privacy Policy
- `consent_version`: Version of T&C/Privacy Policy they accepted (e.g., "1.0")
- `consent_ip`: IP address from which consent was given (for audit trail)

## Rollback (if needed)
```bash
# Rollback this specific migration
php artisan migrate:rollback --step=1
```

Or manual SQL:
```sql
ALTER TABLE `users` 
DROP COLUMN `consented_at`,
DROP COLUMN `consent_version`,
DROP COLUMN `consent_ip`;
```

## Files Changed
- Migration: `database/migrations/2026_09_21_040402_add_consent_fields_to_users_table.php`
- Controller: `app/Http/Controllers/Auth/RegisteredUserController.php` (already updated)
- Frontend: `resources/js/Pages/Auth/Register.jsx` (already updated)

## Notes
- Migration includes safety checks (`Schema::hasColumn`) to prevent errors if columns already exist
- Fields are nullable to support existing users
- IP field supports both IPv4 and IPv6 (VARCHAR 45)
