# 🚨 QUICK FIX: 500 Error on Application Submission

## The Problem
Users cannot submit applications - they get HTTP 500 error.

## The Cause
Missing database columns: `declared_at` and `declaration_version`

## The Fix (Choose ONE option)

### ⚡ FASTEST FIX (2 minutes)

```powershell
# 1. Run diagnostic
php check-database.php

# 2. If columns are missing, run this:
php artisan migrate --path=database/migrations/2026_09_21_fix_declared_at_column.php

# 3. Clear cache
php artisan config:clear

# 4. Test - run diagnostic again
php check-database.php
```

### 🔧 Manual Fix via MySQL (if migration doesn't work)

```sql
-- Open phpMyAdmin or MySQL command line, then run:

ALTER TABLE requests 
ADD COLUMN declared_at TIMESTAMP NULL AFTER created_at;

ALTER TABLE requests 
ADD COLUMN declaration_version VARCHAR(16) NULL AFTER declared_at;
```

### ✅ Verify Fix Worked

```powershell
php check-database.php
```

Should show: "✓ All critical columns present!"

### 🧪 Test Application Submission

1. Go to website
2. Login as test user
3. Create new application
4. Submit it
5. Should succeed (no 500 error)

---

## Need Help?

1. Check if MySQL is running (XAMPP Control Panel)
2. Check `.env` file database settings
3. See full documentation: `PRODUCTION_HOTFIX_500_ERROR.md`

---

## Files Created/Modified

✅ `database/migrations/2026_09_21_fix_declared_at_column.php` - Fix migration  
✅ `check-database.php` - Diagnostic tool  
✅ `resources/js/Components/Request_form/ApplicationSummaryModal.jsx` - Accessibility fix  

---

**Status**: Ready to deploy  
**Estimated Time**: 2-5 minutes  
**Risk**: Low (migration checks before adding columns)  
**Rollback**: `php artisan migrate:rollback --step=1`
