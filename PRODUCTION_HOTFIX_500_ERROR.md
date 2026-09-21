# 🚨 Production Hotfix: 500 Error on Application Submission

**Date**: September 21, 2026  
**Severity**: CRITICAL  
**Impact**: Users cannot submit applications  
**Status**: FIX READY

---

## Problem Summary

Users are encountering a 500 error when trying to submit applications with the following error message:

```
System error — this is not a problem with your form. Please try again later or contact the CPDO office.
HTTP 500 — The system was busy and could not file your application. Nothing was saved — please try again.
```

### Root Cause

The database is missing the `declared_at` and `declaration_version` columns in the `requests` table. The application code tries to insert these columns during application submission, causing a SQL error:

```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'declared_at' in 'field list'
```

### Why This Happened

The migration `2026_09_20_000001_record_consent_to_the_published_notices.php` shows as "Ran" in the migrations table, but the actual columns were not created. This can happen if:
1. The migration ran but encountered an error that wasn't caught
2. The database was restored from an old backup
3. MySQL crashed during the migration
4. The migration was rolled back and not re-run

---

## 🔧 Fix Instructions

### Option 1: Quick Fix (Recommended for Production)

Run the emergency fix migration that checks if columns exist before adding them:

```powershell
# Navigate to project directory
cd c:\xampp\htdocs\cpdo_project

# Run the fix migration
php artisan migrate --path=database/migrations/2026_09_21_fix_declared_at_column.php

# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

### Option 2: Manual Database Fix

If you prefer to add the columns manually via phpMyAdmin or MySQL command line:

```sql
-- Check if columns exist
SHOW COLUMNS FROM requests LIKE 'declared%';

-- Add declared_at column if missing
ALTER TABLE requests 
ADD COLUMN declared_at TIMESTAMP NULL 
AFTER created_at;

-- Add declaration_version column if missing  
ALTER TABLE requests 
ADD COLUMN declaration_version VARCHAR(16) NULL 
AFTER declared_at;

-- Verify columns were added
DESCRIBE requests;
```

### Option 3: Re-run Original Migration

If the original migration somehow didn't run properly:

```powershell
# Check migration status
php artisan migrate:status | Select-String -Pattern "record_consent"

# If it shows as "Pending", run it
php artisan migrate --path=database/migrations/2026_09_20_000001_record_consent_to_the_published_notices.php

# If it shows as "Ran" but columns are missing, roll it back and re-run
php artisan migrate:rollback --step=1
php artisan migrate
```

---

## ✅ Verification Steps

After applying the fix, verify it worked:

### 1. Check Database Columns

```powershell
# Using PHP Artisan Tinker
php artisan tinker

# Then run:
Schema::hasColumn('requests', 'declared_at')
# Should return: true

Schema::hasColumn('requests', 'declaration_version')
# Should return: true

# Exit tinker
exit
```

### 2. Test Application Submission

1. Log in as a test user
2. Start a new application
3. Fill out all required information
4. Upload required documents
5. Review and submit
6. **Expected Result**: Application submits successfully with a confirmation message
7. **Expected Behavior**: No 500 error, user receives application number

### 3. Check Laravel Logs

```powershell
# View recent log entries
Get-Content storage/logs/laravel-2026-09-21.log -Tail 50

# Look for "Application submission successful" messages
# Should NOT see "Column not found" errors
```

### 4. Verify in Database

```sql
-- Check if new applications have declared_at set
SELECT id, application_number, declared_at, declaration_version, created_at
FROM requests
ORDER BY id DESC
LIMIT 5;

-- declared_at should have a timestamp
-- declaration_version should have a value like "1.0"
```

---

## 🔍 Additional Issues Fixed

### Accessibility Warning Fixed

The DialogContent accessibility warning has also been fixed:

```
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
```

**File Changed**: `resources/js/Components/Request_form/ApplicationSummaryModal.jsx`

**Fix Applied**: Added `DialogDescription` component to the Application Summary modal.

No further action needed for this—it's fixed in the code.

---

## 📊 Testing Checklist

After applying the fix, test these scenarios:

- [ ] New application submission (CZC/Locational Clearance)
- [ ] New application submission (Zoning Certification)
- [ ] New application submission (Special Use Permit)
- [ ] New application submission (Temporary Use Permit)
- [ ] Application with corporation details
- [ ] Application with authorized representative
- [ ] Application with all required documents uploaded
- [ ] Application with only some documents uploaded
- [ ] Check email notifications are sent
- [ ] Check SMS notifications are sent (if enabled)
- [ ] Verify application appears in "My Applications"
- [ ] Verify admin can see the new application
- [ ] Check application number is generated correctly

---

## 🛡️ Prevention Measures

To prevent this from happening again:

### 1. Add Migration Tests

Create a test to verify critical columns exist:

```php
// tests/Feature/DatabaseStructureTest.php
public function test_requests_table_has_required_columns()
{
    $this->assertTrue(Schema::hasColumn('requests', 'declared_at'));
    $this->assertTrue(Schema::hasColumn('requests', 'declaration_version'));
}
```

### 2. Database Backup Before Migrations

Always backup before running migrations in production:

```powershell
# Create backup
php artisan backup:run --only-db

# Then run migrations
php artisan migrate

# If something goes wrong, restore backup
```

### 3. Migration Health Check Script

Create a script to verify all expected columns exist:

```php
// app/Console/Commands/CheckDatabaseStructure.php
php artisan make:command CheckDatabaseStructure

// Add logic to check critical columns
```

### 4. Staging Environment Testing

Always test migrations on a staging environment first:

1. Copy production database to staging
2. Run migrations on staging
3. Test application functionality
4. If successful, apply to production

---

## 📝 Deployment Notes

### Before Deploying Fix

1. ✅ Announce maintenance window (5-10 minutes)
2. ✅ Notify users via website banner
3. ✅ Take database backup
4. ✅ Note current migration status

### During Deployment

1. Run migration fix
2. Verify columns exist
3. Test application submission
4. Monitor error logs

### After Deployment

1. Remove maintenance banner
2. Send "all clear" notification
3. Monitor for any new errors
4. Check first few submissions manually

---

## 🐛 Rollback Plan

If the fix causes new issues:

```powershell
# Rollback the fix migration
php artisan migrate:rollback --step=1

# Remove the columns manually if needed
mysql -u root zoning_compliance -e "
ALTER TABLE requests DROP COLUMN declared_at;
ALTER TABLE requests DROP COLUMN declaration_version;
"

# Restore from backup if necessary
# (Follow your backup restoration procedure)
```

**Note**: Rolling back will restore the 500 error, so only do this if the fix creates a worse problem.

---

## 📞 Support Information

### If Fix Doesn't Work

1. Check MySQL is running: `Get-Service | Where-Object {$_.Name -like "*mysql*"}`
2. Check database connection in `.env` file
3. Try connecting to MySQL directly: `C:\xampp\mysql\bin\mysql.exe -u root -h 127.0.0.1`
4. Review full error log: `storage/logs/laravel-2026-09-21.log`

### Contact Information

- **System Administrator**: [Your contact info]
- **Database Administrator**: [DBA contact info]
- **Emergency Support**: [Emergency contact]

---

## 📚 Related Files

### Modified Files

1. `database/migrations/2026_09_21_fix_declared_at_column.php` - NEW: Emergency fix migration
2. `resources/js/Components/Request_form/ApplicationSummaryModal.jsx` - FIXED: Accessibility warning

### Related Files (No Changes Required)

- `database/migrations/2026_09_20_000001_record_consent_to_the_published_notices.php` - Original migration
- `app/Models/Request.php` - Uses declared_at in fillable fields
- `app/Http/Controllers/RequestController.php` - Sets declared_at during submission
- `app/Support/LegalDocuments.php` - Defines declaration version

---

## 🎯 Success Criteria

The fix is successful when:

✅ No 500 errors on application submission  
✅ `declared_at` column exists in `requests` table  
✅ `declaration_version` column exists in `requests` table  
✅ New applications have both columns populated  
✅ Users receive confirmation after submission  
✅ No accessibility warnings in browser console  
✅ Email notifications are sent  
✅ Applications appear in admin dashboard  

---

## 📈 Monitoring

After deployment, monitor these metrics:

- Application submission success rate (should be 100%)
- 500 error count (should be 0)
- Average submission time
- User complaints/support tickets
- Database query performance

### Log Monitoring Commands

```powershell
# Watch for errors in real-time
Get-Content storage/logs/laravel-2026-09-21.log -Wait | Select-String -Pattern "ERROR|CRITICAL"

# Count successful submissions
Get-Content storage/logs/laravel-2026-09-21.log | Select-String -Pattern "Application submission successful" | Measure-Object

# Check for column errors
Get-Content storage/logs/laravel-2026-09-21.log | Select-String -Pattern "Column not found"
```

---

## 🏁 Conclusion

This hotfix addresses a critical production issue preventing users from submitting applications. The fix is:

- ✅ Safe (checks before adding columns)
- ✅ Tested (migration includes verification)
- ✅ Reversible (rollback available)
- ✅ Quick (takes less than 5 minutes)

**Recommended Action**: Apply Option 1 (Quick Fix) immediately.

---

**Prepared by**: Development Team  
**Reviewed by**: [Reviewer Name]  
**Approved by**: [Approver Name]  
**Deployment Date**: September 21, 2026  
**Version**: 1.0
