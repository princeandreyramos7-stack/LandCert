# Application Submission Issues - Fix Documentation

## Issue 1: Address Pre-fill ✅ ALREADY IMPLEMENTED

**Request:** "Make the 3. Address of Applicant by default is the user address then I can edit it in the form"

**Status:** ✅ Already Working!

The address pre-fill is already implemented in the code:

### How it works:
1. **Form Initialization** (`resources/js/Components/Request_form/index.jsx` lines 58-66):
   ```jsx
   applicant_address_region_code: existingApplication?.applicant_address_region_code || me.address_region_code || "",
   applicant_address_province_code: existingApplication?.applicant_address_province_code || me.address_province_code || "",
   applicant_address_city_code: existingApplication?.applicant_address_city_code || me.address_city_code || "",
   applicant_address_barangay_code: existingApplication?.applicant_address_barangay_code || me.address_barangay_code || "",
   applicant_address_street: existingApplication?.applicant_address_street || me.address_street || "",
   ```

2. **UI Notification** (`resources/js/Components/Request_form/Step1ApplicantInfo.jsx` lines 59-68):
   Shows blue info box: "Filled in from your account. Leave it if this is your address, or change it above if this application needs a different one."

3. **Backend Support** (`app/Http/Controllers/RequestController.php` lines 90-118):
   - Method `rememberAddressOnAccount()` stores address on user account
   - Address from last application is copied to account if missing

### User Can Edit:
The `PhilippineAddressFields` component allows full editing - user can select different region, province, city, barangay, and street.

---

## Issue 2: Application Not Saving to Database ⚠️ NEEDS INVESTIGATION

**Symptom:** "Showing successful submit notif but it not submit"

### Possible Causes:

#### 1. **Validation Failure (Silent)**
- Declaration checkbox not checked
- Required files missing
- Address validation failing (PSGC chain validation)

#### 2. **Database Transaction Failure**
- Duplicate application number collision (retries 5 times)
- Missing foreign key data
- Database connection issue

#### 3. **Silent JavaScript Error**
- Form submission completing but redirect failing
- Toast showing success but transaction rolled back

### Diagnostic Steps:

#### Step 1: Enable Logging
Add this to `.env`:
```ini
LOG_LEVEL=debug
```

#### Step 2: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Submit application
4. Look for:
   - Red errors
   - Network request status (should be 200 or 302)
   - Response body

#### Step 3: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Submit application
4. Find the POST request to `/request`
5. Check:
   - Status Code (should be 200 or 302)
   - Response (should have success message or redirect)
   - Payload (all form data sent)

#### Step 4: Check Database
```sql
-- Check if applications are being created
SELECT id, application_number, user_id, status, created_at 
FROM requests 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if last submission exists
SELECT * FROM requests 
WHERE user_id = (SELECT id FROM users WHERE email = 'amelita@gmail.com')
ORDER BY created_at DESC 
LIMIT 1;
```

#### Step 5: Check Laravel Logs
```powershell
# View latest log file
Get-Content storage\logs\laravel-2026-09-20.log -Tail 100

# Search for errors
Get-Content storage\logs\laravel-2026-09-20.log | Select-String -Pattern "ERROR|error|Application submission"
```

---

## Common Issues & Solutions

### Issue A: Declaration Checkbox Not Working
**Symptom:** Form validates but doesn't submit

**Fix:** Check if declaration checkbox is being set:
- File: `resources/js/Components/Request_form/index.jsx`
- Line 519: `formData.append('declaration', declared ? '1' : '0');`
- Ensure `declared` parameter is true in `confirmSubmit({ declared: true })`

### Issue B: Files Too Large
**Symptom:** "Failed to fetch" error, no response from server

**Check:**
- `.env`: `UPLOAD_MAX_FILESIZE` and `POST_MAX_SIZE`
- Form shows error: "Files are too large to send"

### Issue C: CSRF Token Missing/Expired
**Symptom:** 419 error, "CSRF token mismatch"

**Fix:**
```javascript
// Check if token exists
console.log(document.querySelector('meta[name="csrf-token"]'));

// Refresh page if session expired
```

### Issue D: Validation Errors Not Showing
**Symptom:** Form submits but returns to same page

**Check:** Controller validation at line 384-445 in `RequestController.php`

Common validation failures:
- `declaration` must be 'accepted'  
- `applicant_name` required
- Address fields must form valid PSGC chain
- File uploads must be pdf/jpg/jpeg/png under 5MB

---

## Testing the Fix

### Test Scenario 1: New Application (Empty Address)
1. Create new user account WITHOUT address
2. Go to "New Application"
3. **Expected:** Address fields should be empty
4. **Expected:** No "Filled in from your account" message
5. Fill address manually
6. Submit
7. **Expected:** Application saved, redirected to My Applications

### Test Scenario 2: New Application (With Address)
1. Login as existing user (amelita@gmail.com)
2. Go to "New Application"  
3. **Expected:** Address fields pre-filled from account
4. **Expected:** Blue info box shows "Filled in from your account"
5. Optionally edit address
6. Submit
7. **Expected:** Application saved with edited/original address

### Test Scenario 3: Second Application
1. Submit first application (address: Barangay A)
2. Submit second application
3. Change address to Barangay B
4. Submit
5. **Expected:** Both applications saved with different addresses
6. **Expected:** NOT blocked by duplicate detection

---

## Quick Debug Commands

### Check User Address Data
```php
php artisan tinker

$user = App\Models\User::where('email', 'amelita@gmail.com')->first();
echo "Name: " . $user->name . "\n";
echo "Address: " . $user->address . "\n";
echo "Barangay Code: " . $user->address_barangay_code . "\n";
exit;
```

### Check Recent Applications
```php
php artisan tinker

$apps = App\Models\Request::with('applicant')
    ->latest()
    ->take(3)
    ->get(['id', 'application_number', 'user_id', 'status', 'created_at']);
    
foreach ($apps as $app) {
    echo $app->application_number . " - " . $app->status . " - " . $app->created_at . "\n";
}
exit;
```

### Test Application Submission (Dry Run)
```php
// Create test file: test_submission.php
<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Simulate submission data
$user = App\Models\User::where('email', 'amelita@gmail.com')->first();
if (!$user) {
    echo "User not found\n";
    exit;
}

echo "User ID: " . $user->id . "\n";
echo "User has address: " . ($user->address_barangay_code ? 'YES' : 'NO') . "\n";

// Check recent submissions
$recent = App\Models\Request::where('user_id', $user->id)
    ->where('created_at', '>=', now()->subMinutes(5))
    ->count();
    
echo "Recent submissions (last 5 min): " . $recent . "\n";

// Check required data
echo "\nRequired for submission:\n";
echo "- Name: " . ($user->name ? '✓' : '✗') . "\n";
echo "- Email: " . ($user->email ? '✓' : '✗') . "\n";
echo "- Address: " . ($user->address ? '✓' : '✗') . "\n";
```

---

## Manual Testing Checklist

- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Open DevTools before submitting (F12)
- [ ] Fill minimum required fields:
  - [ ] Applicant name
  - [ ] Complete address (region, province, city, barangay)
  - [ ] Project type
  - [ ] Project location
  - [ ] At least one requirement document uploaded
  - [ ] Declaration checkbox checked
- [ ] Click Submit
- [ ] Check Console for errors
- [ ] Check Network tab for `/request` POST
- [ ] Check if redirected to My Applications
- [ ] Verify application appears in list

---

## Contact Developer If:

1. **Console shows errors** - Screenshot and send error message
2. **Network request fails** - Check Status Code and Response
3. **Validation errors appear** - Note which fields are failing
4. **Database empty after submission** - Check logs for transaction errors
5. **Success toast shows but nothing saved** - Transaction might be rolling back

---

**Last Updated:** September 15, 2026
**Status:** Address pre-fill ✅ Working | Submission issue ⚠️ Needs testing
