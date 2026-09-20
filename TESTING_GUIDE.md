# CPDO System Testing Guide

## Test Credentials

### Super Admin
- **Email:** crisanta@cpdo.com
- **Password:** password

### Admin  
- **Email:** admin@cpdo.com
- **Password:** password

### Applicant (Existing)
- **Email:** amelita@gmail.com
- **Password:** password

---

## Complete Application Flow Test

### Phase 1: New Applicant Registration & Application

#### 1.1 Register New Account
1. Open browser: `http://localhost` or your local domain
2. Click "Create a Free Account"
3. Fill registration form:
   - First Name: Juan
   - Middle Name: Santos
   - Last Name: Dela Cruz
   - Email: juan.delacruz@test.com
   - Phone: 09171234567
   - Address: Complete Philippine address
   - Consent checkbox: ✓
4. Click "Create Account"
5. **Expected:** Email sent (check logs or mailtrap), redirected to email verification page
6. **Verify:** Check database `users` table for new record

#### 1.2 Login as New Applicant
1. Navigate to login page
2. Email: juan.delacruz@test.com
3. Password: (what you entered)
4. Remember Me: ✓ (test this feature)
5. **Expected:** Dashboard loads, shows "No applications yet"

#### 1.3 Submit New Application
1. Click "New Application" or "Apply Now"
2. **Step 1 - Personal Information:**
   - Applicant Name: Juan Santos Dela Cruz
   - Contact Number: 09171234567
   - Email: juan.delacruz@test.com
   - Address: Complete address
   - Corporation Name: (optional) Test Corp
3. **Step 2 - Project Details:**
   - Project Nature: Residential Building
   - Project Type: Select (CZC/SUP/TUP/ZC)
   - Project Location: Street, Barangay, Municipality, Province
   - Coordinates: (if available)
4. **Step 3 - Land Use:**
   - Land Use Type: Select appropriate
   - Area (sqm): 500
   - Existing Use: Vacant Lot
   - Proposed Use: Residential
5. **Step 4 - Requirements:**
   - Upload dummy PDF/JPG files for:
     * Barangay Clearance
     * Tax Declaration
     * Location Plan
     * Site Development Plan
     * Other required documents
6. Click "Submit Application"
7. **Expected:**
   - Application number assigned (e.g., LC-2026-001)
   - Status: pending_review
   - Email notification sent
   - Redirected to "My Applications"

#### 1.4 Check Application Status (Applicant)
1. Navigate to "My Applications"
2. **Expected:**
   - Application listed with status badge
   - Can view application details
   - Can download Order of Payment PDF
3. **Test Console:** No React warnings, no errors

---

### Phase 2: Admin Document Verification

#### 2.1 Login as Admin
1. Logout from applicant account
2. Login: admin@cpdo.com / password
3. **Expected:** Admin dashboard loads

#### 2.2 View All Applications
1. Navigate to "All Applications"
2. **Expected:** New application appears in table
3. **TEST DROPDOWN:** Click 3-dot menu on the application row
4. **Expected:** Dropdown menu appears with options:
   - View Application
   - Document Verification
5. **Verify:** No console warnings about refs

#### 2.3 Document Verification
1. Click "Document Verification" from dropdown
2. **Expected:** Document verification page loads
3. Review each uploaded document:
   - Click to view/download
   - Mark as "Verified" or "Rejected"
4. If all verified, click "Complete Verification"
5. **Expected:**
   - Status changes to "pending_payment"
   - Applicant notified via email
   - Order of Payment becomes available

---

### Phase 3: Payment Submission & Verification

#### 3.1 Upload Payment Receipt (Applicant)
1. Logout, login as applicant
2. Navigate to "My Applications"
3. Click on the application
4. **Expected:** Order of Payment available for download
5. Click "Upload Payment Receipt"
6. Upload dummy receipt image (JPG/PNG)
7. Enter payment details:
   - OR Number: 123456
   - Amount: 5000.00
   - Payment Date: Today
8. Submit
9. **Expected:**
   - Status: payment_submitted
   - Admin notified

#### 3.2 Verify Payment (Admin)
1. Logout, login as admin
2. Navigate to "Payments" → "Pending Verification"
3. Find the application
4. Click "View Receipt"
5. **Expected:** Receipt image displayed
6. Click "Record Payment"
7. Verify OR number, amount, date
8. Click "Confirm Payment"
9. **Expected:**
   - Status: payment_verified
   - Applicant notified
   - Application moved to "Ready for Review" (for super admin)

---

### Phase 4: Super Admin Approval

#### 4.1 Login as Super Admin
1. Logout, login as crisanta@cpdo.com / password
2. Navigate to "All Applications"
3. **Expected:** Application with "payment_verified" status visible

#### 4.2 Review & Approve
1. Click 3-dot menu → "View Application"
2. Review all details:
   - Personal info
   - Project details
   - Documents (all verified)
   - Payment (verified)
3. Click "Approve" button
4. Enter approval details:
   - Decision Number: DC-2026-001
   - Remarks: (optional)
5. **Expected:**
   - Status: approved
   - Decision number assigned
   - Applicant notified via email & SMS
   - Application ready for certificate generation

#### 4.3 Test Denial Flow (Optional)
1. For another application, click "Deny"
2. Enter reason for denial (required)
3. **Expected:**
   - Status: denied
   - Applicant notified with reason
   - Cannot generate certificate

---

### Phase 5: Certificate Generation

#### 5.1 Generate Certificate (Admin)
1. Logout, login as admin
2. Navigate to "Certificates"
3. Find approved application
4. Click "Generate Certificate"
5. **Expected:** Certificate generation form loads

#### 5.2 Fill Signer Information
1. Signer Name: Engr. Maria Santos
2. Position: Zoning Administrator
3. Upload signature image (PNG with transparent background)
4. **Expected:** Signature preview shown

#### 5.3 Preview & Generate
1. Click "Preview Certificate"
2. **Expected:** PDF preview shows:
   - CPDO letterhead
   - Applicant details
   - Project details
   - Approval information
   - Signature & seal
   - QR code for verification
3. If preview OK, click "Generate Final Certificate"
4. **Expected:**
   - Status: certificate_ready
   - Certificate stored in database
   - Applicant notified

---

### Phase 6: Certificate Download & Verification

#### 6.1 Download Certificate (Applicant)
1. Logout, login as applicant
2. Navigate to "My Applications"
3. Click on approved application
4. **Expected:** "Download Certificate" button visible
5. Click download
6. **Expected:** PDF downloads successfully

#### 6.2 QR Code Verification (Public)
1. Open certificate PDF
2. Scan QR code (or manually visit the URL)
3. **Expected:** Public verification page shows:
   - Application number
   - Applicant name
   - Approval date
   - Certificate status: Valid

---

## Error Testing Checklist

### Console Errors
- [ ] No React ref warnings (fixed WithTooltip issue)
- [ ] No "key" prop warnings in lists
- [ ] No network 500 errors
- [ ] No undefined variable errors

### Dropdown Menus
- [ ] ApplicationsTable dropdown appears (All Applications)
- [ ] ApplicationsTable dropdown appears (Reviewed Applications)
- [ ] NotificationBell dropdown appears
- [ ] User profile dropdown appears
- [ ] Mobile: dropdowns work on touch devices

### Form Validation
- [ ] Registration: validates email format
- [ ] Registration: validates Philippine phone number
- [ ] Registration: requires consent checkbox
- [ ] Application: requires all mandatory fields
- [ ] File upload: enforces 5MB limit
- [ ] File upload: only accepts PDF/JPG/PNG
- [ ] Payment: validates OR number format

### Security
- [ ] Applicant cannot access /admin routes (redirects to dashboard)
- [ ] Admin cannot access /super-admin routes
- [ ] Cannot view other users' documents (IDOR test)
- [ ] File downloads require authentication
- [ ] API endpoints require CSRF token

### Email & SMS
- [ ] Welcome email on registration
- [ ] Application submitted notification
- [ ] Document verification complete
- [ ] Payment verified notification
- [ ] Approval/denial notification
- [ ] Certificate ready notification
- [ ] SMS sent for approval/denial (check logs if SMS_ENABLED=true)

### Remember Me & Forgot Password
- [ ] Remember Me checkbox persists session
- [ ] Forgot Password link works
- [ ] Reset email delivered
- [ ] Password reset form works
- [ ] Can login with new password

---

## Performance Checks

### Page Load Times
- Dashboard: ___ms
- All Applications (50 records): ___ms
- Document Verification: ___ms
- Certificate Generation: ___ms

### Database Queries
- Check `storage/logs/laravel.log` for N+1 queries
- Verify indexes exist on frequently queried columns

### File Operations
- Upload speed (5MB file): ___s
- Download speed (certificate PDF): ___s

---

## Known Issues to Monitor

1. **Dropdown z-index:** Increased to 9999, verify no conflicts
2. **Ref warnings:** Removed WithTooltip wrappers, verify no warnings
3. **APP_DEBUG:** Currently FALSE for presentation
4. **Credentials in .env:** Production values (to be updated post-presentation)
5. **Email config:** Using Gmail SMTP (princeandreyramos7@gmail.com)

---

## Critical Issues (MUST FIX before production)

From `CRITICAL_ISSUES_AUDIT.md`:

1. **Security:**
   - [ ] Change all default passwords
   - [ ] Remove test email credentials from .env
   - [ ] Generate new APP_KEY
   - [ ] Update SEMAPHORE_API_KEY with production key

2. **Configuration:**
   - [ ] Update MAIL_FROM_ADDRESS to official email
   - [ ] Update SMS sender name
   - [ ] Update contact numbers in all templates
   - [ ] Update office address

3. **Data:**
   - [ ] Remove test/demo data from production DB
   - [ ] Verify all seeders use production-ready data

---

## Sign-off

**Tested by:** ________________  
**Date:** ________________  
**Build Version:** (from npm run build)  
**Laravel Version:** 11.x  
**PHP Version:** 8.2+

**Status:**  
- [ ] All critical paths tested
- [ ] No blocking issues found
- [ ] Ready for presentation
- [ ] Post-presentation fixes documented

**Notes:**
_________________________________
_________________________________
_________________________________
