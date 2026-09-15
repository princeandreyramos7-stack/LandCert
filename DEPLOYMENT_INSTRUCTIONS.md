# Deployment Instructions - Clearance Signature Fix

## What Was Fixed

### Issue: Duplicate Signatures on Clearance
**Problem:** The clearance was showing "Crisanta D. Concepcion" (Zoning Administrator) in BOTH signature blocks:
- "Prepared & Evaluated by" (should be Zoning Officer)
- "Approved by" (correctly shows Zoning Administrator)

**Root Cause:** When the Zoning Administrator (super_admin) reviewed an application themselves, their name appeared in both signature blocks because they were both the `reviewer` AND the `zoningAdministrator`.

**Solution:** Modified `ClearanceSheet.jsx` to detect when the reviewer is the same as the Zoning Administrator, and in that case:
- Show generic "Zoning Officer IV" title instead of the administrator's name in the "Prepared by" section
- Don't show the administrator's signature in the "Prepared by" section (only in "Approved by")

### Files Changed
- `resources/js/Components/ClearanceSheet.jsx` - Added logic to prevent duplicate signatures
- Built new assets in `public/build/`

---

## Deployment Steps

### On Your Production Server

#### 1. Upload Files
Upload these files/folders to your production server:
```
resources/js/Components/ClearanceSheet.jsx
public/build/  (entire folder with all new assets)
```

#### 2. Clear Caches
Run these commands on your production server:
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

#### 3. Verify the Fix
1. Log in as admin or super admin
2. Go to any approved application
3. Click "Generate Clearance"
4. Check the signature section:
   - "Prepared & Evaluated by" should show "Zoning Officer IV" (if Zoning Admin reviewed it)
   - "Approved by" should show "ENGR. Crisanta D. Concepcion, EnP"

---

## About the 500/422 Errors

### Current Status
Your application HAS an APP_KEY in `.env.production` - this is correct:
```
APP_KEY=base64:joUfRqkAQhAVtAOu8+uYa9JReNxPFVAxfwOINTBJoPI=
```

### Why You're Getting Errors
The errors you showed in the logs are from **September 14, 2026 at 11:13 PM**. This means:

1. **Either:** The APP_KEY was missing at that time and has since been fixed
2. **Or:** The application couldn't read the `.env` file due to:
   - File permissions issues
   - Cached configuration pointing to old `.env` values
   - Web server using a different `.env` file location

### Steps to Fix 500/422 Errors on Production

#### Step 1: Verify APP_KEY Exists
On your production server, run:
```bash
php artisan config:show
```

Look for the `APP_KEY` value. It should show:
```
app.key => 'base64:joUfRqkAQhAVtAOu8+uYa9JReNxPFVAxfwOINTBJoPI='
```

If it shows `null` or empty, the `.env` file isn't being read.

#### Step 2: Check .env File Permissions
```bash
ls -la .env
```

Should show something like:
```
-rw-r--r-- 1 user group 2048 Sep 15 12:00 .env
```

If it shows wrong permissions, fix with:
```bash
chmod 644 .env
```

#### Step 3: Clear All Caches (Again)
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
php artisan config:cache
```

#### Step 4: Restart Web Server
```bash
# For Apache:
sudo systemctl restart apache2

# For Nginx + PHP-FPM:
sudo systemctl restart php-fpm
sudo systemctl restart nginx
```

#### Step 5: Test Upload Receipt
1. Log in as an applicant
2. Try uploading a payment receipt
3. Check browser console for errors
4. If it fails, check: `storage/logs/laravel.log` for new errors

#### Step 6: Test Record Payment (Admin)
1. Log in as admin
2. Try recording a payment for an approved application
3. If you get 422 error:
   - Open browser DevTools → Network tab
   - Find the failed request
   - Click on it → Response tab
   - Look for the validation error message

**Common 422 Causes:**
- **Duplicate OR number** - That OR number already exists in the database
- **Invalid date format** - Payment date must be YYYY-MM-DD format
- **Missing required fields** - Check that all required fields are filled

---

## Fix Stuck Applications (Status Not Updating)

### Issue
Applications stuck at `payment_confirmed` status not progressing to `certificate_preparing`.

### Solution
We created a command to fix this. On your production server, run:

```bash
php artisan fix:stuck-certificates
```

This command will:
1. Find all applications at "payment_confirmed" with verified payments but no certificate
2. Attempt to create certificates for them automatically
3. Update their status to "certificate_preparing"
4. Show you which ones succeeded and which failed

### If the Command Doesn't Exist
The command file is at: `app/Console/Commands/FixStuckCertificates.php`

Make sure this file exists on your production server. If not, upload it from your local copy.

Then run:
```bash
php artisan list | grep fix
```

You should see: `fix:stuck-certificates`

---

## Checking Database Directly (If Needed)

### Connect to Database
On your production server:
```bash
php artisan tinker
```

### Check Recent Payments
```php
\App\Models\Payment::orderByDesc('id')->limit(10)->get(['id', 'request_id', 'receipt_number', 'amount', 'payment_status', 'payment_date']);
```

### Check for Duplicate OR Numbers
```php
\App\Models\Payment::where('receipt_number', 'OR-12345')->first();
```
(Replace `OR-12345` with the actual OR number)

### Check Stuck Applications
```php
\App\Models\Request::where('status', 'payment_confirmed')->with('payment', 'certificate')->get();
```

### Exit Tinker
```php
exit
```

---

## Monitoring Logs

### View Recent Laravel Errors
On Windows PowerShell:
```powershell
Get-Content storage\logs\laravel.log -Tail 50
```

On Linux/Mac:
```bash
tail -50 storage/logs/laravel.log
```

### View Real-Time Logs
On Linux/Mac:
```bash
tail -f storage/logs/laravel.log
```

On Windows PowerShell:
```powershell
Get-Content storage\logs\laravel.log -Wait -Tail 20
```

---

## Quick Reference: PowerShell Commands for Windows

Since you're on Windows and `tail` and `grep` don't work, use these instead:

### View Last 50 Lines of Log
```powershell
Get-Content storage\logs\laravel.log -Tail 50
```

### Search for Text in File
```powershell
Get-Content storage\logs\laravel.log | Select-String "APP_KEY"
```

### Check if APP_KEY is Set
```powershell
php artisan config:show | Select-String "app.key"
```

### Copy Files
```powershell
Copy-Item ".env.production" -Destination ".env" -Force
```

### Delete File
```powershell
Remove-Item test_file.php
```

---

## Need Help?

If issues persist after following these steps, provide:

1. **Output of:**
   ```bash
   php artisan config:show | grep -i "app.key\|app.debug\|app.env"
   ```
   (Or on Windows PowerShell):
   ```powershell
   php artisan config:show | Select-String "app.key|app.debug|app.env"
   ```

2. **Last 50 lines of Laravel log:**
   ```powershell
   Get-Content storage\logs\laravel.log -Tail 50
   ```

3. **Browser console error** (exact error message and stack trace)

4. **Network tab response** for 422 errors (the JSON response showing validation errors)
