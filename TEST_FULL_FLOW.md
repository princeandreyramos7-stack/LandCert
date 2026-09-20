# Full Application Flow Test

## Test Date: 2026-09-15
## Purpose: Test complete flow from application submission to certificate generation

---

## Test Steps

### 1. APPLICANT REGISTRATION & LOGIN
- [ ] Register new account with valid Philippine address
- [ ] Receive welcome email
- [ ] Login successfully
- [ ] Dashboard loads without errors

### 2. APPLICATION SUBMISSION
- [ ] Navigate to "New Application"
- [ ] **Step 1 - Personal Info**: Fill all required fields
- [ ] **Step 2 - Project Details**: Fill project nature, type, location
- [ ] **Step 3 - Land Use**: Fill land use details
- [ ] **Step 4 - Requirements**: Upload all required documents (PDF/JPG)
- [ ] Submit application
- [ ] Application number assigned
- [ ] Status shows "pending_review"
- [ ] Email notification sent

### 3. ADMIN REVIEW (Document Verification)
- [ ] Login as admin
- [ ] Application appears in "All Applications"
- [ ] Click 3-dot menu → "Document Verification"
- [ ] Review all uploaded documents
- [ ] Mark documents as verified/rejected
- [ ] If rejected: applicant receives notification
- [ ] If approved: status changes to "pending_payment"

### 4. PAYMENT SUBMISSION
- [ ] Login as applicant
- [ ] View Order of Payment
- [ ] Upload payment receipt
- [ ] Status shows "payment_submitted"
- [ ] Admin notified

### 5. ADMIN PAYMENT VERIFICATION
- [ ] Login as admin
- [ ] Navigate to "Payments" → "Pending Verification"
- [ ] View payment receipt
- [ ] Record payment (OR number, amount, date)
- [ ] Status changes to "payment_verified"
- [ ] Applicant notified

### 6. SUPER ADMIN APPROVAL
- [ ] Login as super_admin
- [ ] Application appears in "All Applications"
- [ ] Click 3-dot menu → "View Application"
- [ ] Review all details
- [ ] Click "Approve" or "Deny"
- [ ] If approved: Status = "approved", Decision number assigned
- [ ] If denied: Status = "denied", Reason required
- [ ] Applicant notified via email and SMS

### 7. CERTIFICATE GENERATION (Admin)
- [ ] Login as admin
- [ ] Navigate to "Certificates"
- [ ] Find approved application
- [ ] Click "Generate Certificate"
- [ ] Enter signer information (name, position, signature upload)
- [ ] Preview certificate
- [ ] Generate final certificate
- [ ] Status changes to "certificate_ready"
- [ ] Applicant notified

### 8. CERTIFICATE DOWNLOAD (Applicant)
- [ ] Login as applicant
- [ ] Navigate to "My Applications"
- [ ] Click "Download Certificate"
- [ ] PDF downloads successfully
- [ ] QR code verification works

---

## Error Checks

### Console Errors
- [ ] No React ref warnings
- [ ] No missing key warnings
- [ ] No network errors (except expected 401/403)
- [ ] No undefined variable errors

### Database Integrity
- [ ] All status transitions recorded in audit logs
- [ ] File paths stored correctly
- [ ] Uploaded files exist in storage/app/private
- [ ] No orphaned records

### Email & SMS
- [ ] Welcome email sent on registration
- [ ] Application submitted notification sent
- [ ] Payment reminder sent (if applicable)
- [ ] Approval/denial notification sent
- [ ] Certificate ready notification sent
- [ ] SMS sent for critical status changes

### Security
- [ ] Applicant cannot access admin routes
- [ ] Admin cannot access super_admin routes
- [ ] File downloads require authentication
- [ ] Cannot view other users' documents

### UI/UX
- [ ] All dropdowns appear correctly
- [ ] Forms validate properly
- [ ] Loading states shown during async operations
- [ ] Error messages are user-friendly
- [ ] Mobile responsive

---

## Known Issues to Monitor

1. **Dropdown Menu**: After z-index fix, verify it appears in all tables
2. **Ref Warnings**: After WithTooltip removal, verify no console warnings
3. **File Uploads**: Ensure 5MB limit enforced, only PDF/JPG/PNG allowed
4. **Remember Me**: Verify checkbox works and session persists
5. **Forgot Password**: Test email delivery and reset flow

---

## Test Results

### Pass/Fail Summary
- Total Steps: ___ 
- Passed: ___
- Failed: ___
- Blocked: ___

### Critical Issues Found
(List any critical issues that block production deployment)

### Non-Critical Issues Found
(List issues that can be fixed post-deployment)

### Performance Notes
- Average page load time: ___
- Build time: 42.63s
- Database query count per page: ___

---

## Sign-off

Tested by: ________________
Date: ________________
Approved for deployment: YES / NO
