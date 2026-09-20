# Test Application Submission - Step by Step

## Setup Complete ✅

1. **Logging Enabled** - Changed LOG_LEVEL from 'error' to 'debug'
2. **Debug Script Created** - `debug_submission.php` to check system status
3. **Enhanced Logging** - Added detailed logs to RequestController

---

## Current Status

### User: amelita@gmail.com
- ✓ Account exists
- ✓ Has old text address: "Osmena, City of Ilagan, Isabela"
- ⚠️ Missing PSGC codes (address_barangay_code = NULL)
- **Result:** Address picker will be EMPTY (user must fill manually)

### Existing Applications
- 3 applications exist for this user
- Latest: #3 (TPZ-09-26-0004) - Status: pending
- No recent submissions (5-min window clear)

---

## Testing Steps

### Step 1: Open Application Form
1. Login as: amelita@gmail.com / password
2. Navigate to "New Application"
3. **Expected:** Welcome screen appears
4. Click "Proceed to Application Form"

### Step 2: Fill Step 1 - Personal Information
1. **Applicant Name:** Should be pre-filled ("Amelita Maneja")
2. **Address of Applicant:** Will be EMPTY (no PSGC codes)
   - Select Region: Region II (Cagayan Valley)
   - Select Province: Isabela
   - Select City: City of Ilagan
   - Select Barangay: Any barangay (e.g., "Osmena")
   - Street: "Test Street"
3. **Corporation:** Leave empty or type "N/A"
4. **Corporation Address:** Leave empty or type "N/A"
5. Leave "Authorized Representative" unchecked
6. Click "Next"

### Step 3: Fill Step 2 - Project Details  
1. **Project Type:** Select "ZC" (Zoning Certification)
2. **Project Nature:** "Residential"
3. **Project Location:** Will auto-fill from applicant address for ZC
4. **Lot Area:** "100"
5. **Building Area:** "50"
6. **Right Over Land:** "Owner"
7. **Duration:** "Permanent"
8. **Years:** "0" (or leave empty)
9. **Project Cost:** "500000"
10. Click "Next"

### Step 4: Fill Step 3 - Land Use
1. **Existing Land Use:** "Residential"
2. **Written Notice:** "No"
3. **Similar Application:** "No"
4. **Preferred Release Mode:** "Pickup"
5. Click "Next"

### Step 5: Fill Step 4 - Requirements
1. **Upload Files** (for ZC type):
   - Title: Upload any PDF
   - Tax Declaration: Upload any PDF
   - Vicinity Map: Upload any PDF/image
   - Latest Tax Receipt: Upload any PDF
   - Sketch Plan: Upload any PDF
2. Click "Submit Application"

### Step 6: Confirm Submission
1. **Dialog appears:** "Confirm Submission"
2. **Check declaration checkbox:** "I certify that the information..."
3. Click "Submit"

### Step 7: Verify Result

#### Success Scenario:
- ✓ Toast appears: "Application Submitted"
- ✓ Redirected to "My Applications"
- ✓ New application appears in list
- ✓ Application number assigned (e.g., TPZ-09-26-0007)

#### Failure Scenario:
- ✗ Error toast appears
- ✗ Form validation errors shown
- ✗ Stays on form page

---

## Debugging If Submission Fails

### Check Browser Console (F12)
1. Open DevTools before submitting
2. Go to **Console** tab
3. Look for:
   - Red error messages
   - `Application submission started` log
   - `Validation passed` log

### Check Network Tab (F12)
1. Go to **Network** tab
2. Find POST request to `/request`
3. Check:
   - **Status:** Should be 200 or 302
   - **Response:** Check for errors
   - **Payload:** Verify form data sent

### Check Laravel Logs
```powershell
# View latest logs
cd c:\xampp\htdocs\cpdo_project
Get-Content storage\logs\laravel-$(Get-Date -Format 'yyyy-MM-dd').log -Tail 50

# Search for your submission
Get-Content storage\logs\laravel-$(Get-Date -Format 'yyyy-MM-dd').log | Select-String -Pattern "Application submission" -Context 2,5
```

### Check Database
```powershell
php debug_submission.php
```

This will show:
- User details
- Recent applications  
- Latest application info
- Validation test results

---

## Common Issues & Solutions

### Issue 1: "Declaration must be accepted"
**Cause:** Checkbox not checked
**Fix:** Check "I certify..." checkbox in confirmation dialog

### Issue 2: "Address chain validation failed"
**Cause:** Invalid PSGC combination (barangay not in selected city)
**Fix:** Reselect address from top (Region → Province → City → Barangay)

### Issue 3: "Files are too large"
**Cause:** Upload > 5MB or total > POST_MAX_SIZE
**Fix:** Use smaller files (under 5MB each)

### Issue 4: Form submits but nothing saved
**Cause:** JavaScript completing but server returning error
**Fix:** 
1. Check Network tab for actual server response
2. Check logs: `Get-Content storage\logs\laravel-$(Get-Date -Format 'yyyy-MM-dd').log -Tail 100`

### Issue 5: "Duplicate submission"
**Cause:** Same location submitted within 5 minutes
**Fix:** 
- Change project location barangay
- OR wait 5 minutes
- OR use different user account

---

## What to Report

If submission still fails, provide:

1. **Console Errors:**
   - Screenshot of Console tab (F12)
   - Copy any red error messages

2. **Network Response:**
   - Status code of `/request` POST
   - Response body
   - Screenshot of Network tab

3. **Laravel Logs:**
   ```powershell
   Get-Content storage\logs\laravel-$(Get-Date -Format 'yyyy-MM-dd').log | Select-String -Pattern "Application submission|ERROR" -Context 3,3
   ```

4. **Database Check:**
   ```powershell
   php debug_submission.php
   ```

5. **Form Data:**
   - Which step validation failed
   - What values were entered
   - Which files were uploaded

---

## After Testing

### If Submission Works:
1. Change LOG_LEVEL back to 'error' in `.env`
2. Run: `php artisan config:clear`
3. System ready for presentation

### If Submission Fails:
1. Keep LOG_LEVEL='debug'
2. Collect all diagnostic info above
3. Review logs for specific error
4. Fix identified issue
5. Test again

---

## Quick Commands Reference

```powershell
# Check system status
php debug_submission.php

# View logs in real-time
Get-Content storage\logs\laravel-$(Get-Date -Format 'yyyy-MM-dd').log -Wait -Tail 20

# Clear caches
php artisan config:clear
php artisan cache:clear

# Check database
php artisan tinker
>>> App\Models\Request::latest()->first()
>>> exit
```

---

**Created:** September 15, 2026  
**LOG_LEVEL:** debug (for testing)  
**Status:** Ready to test
