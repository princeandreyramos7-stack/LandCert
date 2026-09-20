# Production Database Migration Guide

## Issue
Registration failing in production with error:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'consented_at' in 'INSERT INTO'
```

## Solution
The production database is missing consent tracking columns that were added for GDPR compliance.

## Pre-Flight Check

### 1. Check Which Migrations Are Missing
Upload `check_production_migrations.sql` to production and run it to see which columns are missing.

```bash
mysql -u root -p u988863428_zone_clear < check_production_migrations.sql
```

## Migration Steps (Run on Production Server)

### 1. Backup Database First ⚠️
```bash
# SSH into production server
ssh your-production-server

# Backup the database
mysqldump -u root -p u988863428_zone_clear > backup_before_migrations_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Upload New Migration Files
Upload these migration files to production server:
- `database/migrations/2026_09_21_040402_add_consent_fields_to_users_table.php`
- `database/migrations/2026_09_21_020857_add_corporation_address_fields_to_applicants_table.php`

### 3. Run Migrations
```bash
# Navigate to project directory
cd /path/to/cpdo_project

# Run all pending migrations
php artisan migrate

# Or run specific migration only
php artisan migrate --path=database/migrations/2026_09_21_040402_add_consent_fields_to_users_table.php
```

### 4. Verify the Migration
```bash
# Check if columns were added
php artisan tinker
>>> Schema::hasColumn('users', 'consented_at')
>>> Schema::hasColumn('users', 'consent_version')
>>> Schema::hasColumn('users', 'consent_ip')
# All should return true
```

### 5. Alternative: Manual SQL (if artisan not available)
If you can't run artisan commands, execute this SQL directly:

```sql
USE u988863428_zone_clear;

-- Check if columns already exist before adding
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'u988863428_zone_clear' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'consented_at';

-- If the above returns no results, run these ALTER statements:

-- Add consent tracking columns to users
ALTER TABLE `users` 
ADD COLUMN `consented_at` TIMESTAMP NULL AFTER `password`,
ADD COLUMN `consent_version` VARCHAR(10) NULL AFTER `consented_at`,
ADD COLUMN `consent_ip` VARCHAR(45) NULL AFTER `consent_version`;

-- Add corporation address fields to applicants (if missing)
ALTER TABLE `applicants`
ADD COLUMN `corporation_region_code` VARCHAR(20) NULL AFTER `corporation_address`,
ADD COLUMN `corporation_province_code` VARCHAR(20) NULL AFTER `corporation_region_code`,
ADD COLUMN `corporation_city_code` VARCHAR(20) NULL AFTER `corporation_province_code`,
ADD COLUMN `corporation_barangay_code` VARCHAR(20) NULL AFTER `corporation_city_code`,
ADD COLUMN `corporation_street` VARCHAR(255) NULL AFTER `corporation_barangay_code`;

-- Verify columns were added
DESCRIBE users;
DESCRIBE applicants;
```

### 6. Clear Application Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 7. Test Registration
After migration, test user registration to ensure it works.

## What These Columns Do

### Users Table (Consent Tracking)
- `consented_at`: Timestamp when user accepted Terms & Privacy Policy
- `consent_version`: Version of T&C/Privacy Policy they accepted (e.g., "1.0")
- `consent_ip`: IP address from which consent was given (for audit trail)

### Applicants Table (Corporation Address)
- `corporation_region_code`: PSGC region code (e.g., "020000000")
- `corporation_province_code`: PSGC province code (e.g., "023100000")
- `corporation_city_code`: PSGC city code (e.g., "023114000")
- `corporation_barangay_code`: PSGC barangay code (e.g., "023114082")
- `corporation_street`: Street/Purok address

## Rollback (if needed)
```bash
# Rollback last migration
php artisan migrate:rollback --step=1
```

Or manual SQL:
```sql
-- Remove consent columns
ALTER TABLE `users` 
DROP COLUMN `consented_at`,
DROP COLUMN `consent_version`,
DROP COLUMN `consent_ip`;

-- Remove corporation address columns
ALTER TABLE `applicants`
DROP COLUMN `corporation_region_code`,
DROP COLUMN `corporation_province_code`,
DROP COLUMN `corporation_city_code`,
DROP COLUMN `corporation_barangay_code`,
DROP COLUMN `corporation_street`;
```

## Files Changed in This Update
1. **Migration**: `database/migrations/2026_09_21_040402_add_consent_fields_to_users_table.php`
2. **Migration**: `database/migrations/2026_09_21_020857_add_corporation_address_fields_to_applicants_table.php`
3. **Controller**: `app/Http/Controllers/Auth/RegisteredUserController.php`
4. **Controller**: `app/Http/Controllers/RequirementDocumentController.php` (file upload limits)
5. **Controller**: `app/Http/Controllers/AdminController.php` (file upload limits)
6. **Controller**: `app/Http/Controllers/SuperAdminController.php` (file upload limits)
7. **Frontend**: `resources/js/Pages/Auth/Register.jsx`
8. **Frontend**: `resources/js/Pages/Admin/ViewApplication.jsx` (Back button + auto-refresh)
9. **Frontend**: `resources/js/Pages/SuperAdmin/ViewApplication.jsx` (Back button + auto-refresh)
10. **Frontend**: `resources/js/Pages/Applicant/PrintCertificate.jsx` (Back button)
11. **Frontend**: `resources/js/Pages/Applicant/PrintClearance.jsx` (Back button)
12. **Config**: `public/.htaccess` (PHP upload limits)

## Recent Features Added
- ✅ GDPR consent tracking on registration
- ✅ Corporation address using PSGC dropdowns
- ✅ File upload limit increased to 20MB
- ✅ Back buttons on View Application pages
- ✅ Auto-refresh on admin/super-admin view pages (30s)
- ✅ Notarized form upload enabled regardless of status
- ✅ Back buttons on certificate/clearance pages

## Notes
- Migration includes safety checks (`Schema::hasColumn`) to prevent errors if columns already exist
- All consent fields are nullable to support existing users
- IP field supports both IPv4 and IPv6 (VARCHAR 45)
- Corporation address fields match the structure used in user addresses

