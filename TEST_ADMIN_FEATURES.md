# Testing Admin Payment & Certificate Features

## Quick Test Guide

### Prerequisites
1. Database migrations are up to date
2. Admin user exists in database
3. Sample payment and certificate records exist

---

## 1. LOGIN AS ADMIN

```
URL: http://localhost/login
Email: admin@cpdo.com
Password: admin123
```

After login, you should see the Admin Dashboard.

---

## 2. TEST PAYMENT MANAGEMENT

### Access Payments Page
1. Click sidebar hamburger menu (if collapsed)
2. Navigate to **"Processing"** → **"Payments"**
3. URL should be: `http://localhost/admin/payments`

### Expected Elements
- ✅ Page title: "Payment Management"
- ✅ Search bar with blue search button
- ✅ Filter by Status dropdown (All, Pending, Verified, Rejected)
- ✅ Filter by Method dropdown (All, Cash, Check, Bank Transfer)
- ✅ Table with columns: Receipt #, Applicant, Amount, Method, Status, Date, Actions
- ✅ Pagination at bottom

### Test Actions

#### A. View Payment Details
1. Click **eye icon** (👁️) on any payment row
2. **Expected**: Modal opens showing:
   - Receipt number
   - Status badge
   - Applicant name
   - Project type
   - Amount (formatted as ₱X,XXX.XX)
   - Payment method badge
   - Payment date
   - Submitted date
   - Verification details (if verified)
   - Rejection reason (if rejected)
   - Notes (if any)

#### B. Verify Payment (Pending Only)
1. Find a payment with "Pending" status
2. Click blue **"Verify"** button
3. **Expected**: Verify modal opens
4. Fill in:
   - Amount: `5000.00`
   - Receipt Number: `RCP-2026-001`
   - Payment Date: Select today's date
   - Notes: `Payment verified by admin` (optional)
5. Click blue **"Verify Payment"** button
6. **Expected**:
   - Success message appears
   - Payment status changes to "Verified"
   - Your name appears as verifier
   - Page refreshes with updated data

#### C. Reject Payment (Pending Only)
1. Find another payment with "Pending" status
2. Click red **"Reject"** button
3. **Expected**: Reject modal opens
4. Enter rejection reason: `Incorrect amount submitted`
5. Click red **"Reject Payment"** button
6. **Expected**:
   - Success message appears
   - Payment status changes to "Rejected"
   - Rejection reason is stored

#### D. Test Filters
1. **Status Filter**: Select "Verified" → Only verified payments show
2. **Method Filter**: Select "Cash" → Only cash payments show
3. **Search**: Type applicant name → Filtered results show
4. **Reset**: Select "All Statuses" and "All Methods" → All payments show

---

## 3. TEST CERTIFICATE MANAGEMENT

### Access Certificates Page
1. Navigate to **"Processing"** → **"Certificates"**
2. URL should be: `http://localhost/admin/certificates`

### Expected Elements
- ✅ Page title: "Certificate Management"
- ✅ Search bar with blue search button
- ✅ Filter by Status dropdown (All, Generated, Ready for Collection, Collected)
- ✅ Table with columns: Certificate #, Applicant, Project Type, Status, Issued Date, Valid Until, Actions
- ✅ Pagination at bottom

### Test Actions

#### A. View Certificate Details
1. Click **eye icon** (👁️) on any certificate row
2. **Expected**: Modal opens showing:
   - Certificate number
   - Status badge
   - Applicant name
   - Project type
   - Issued date
   - Valid until date
   - Collection details (if collected)

#### B. Mark Certificate as Ready
1. Find a certificate with "Generated" status
2. Click blue **"Mark Ready"** button
3. **Expected**: Mark Ready modal opens
4. Fill in:
   - Certificate Number: `CERT-2026-001`
   - Notes: `Physical certificate prepared` (optional)
5. Click blue **"Mark as Ready"** button
6. **Expected**:
   - Success message appears
   - Certificate status changes to "Ready for Collection"
   - Page refreshes with updated data

#### C. Record Certificate Collection
1. Find a certificate with "Ready for Collection" status
2. Click blue **"Record Collection"** button
3. **Expected**: Collection modal opens
4. Fill in all required fields:
   - Collected By: `Juan Dela Cruz`
   - Relationship: `Self`
   - Valid ID Type: Select "Driver's License"
   - ID Number: `N01-12-123456`
   - Collection Date: Today's date
   - Collection Time: Current time
   - Remarks: `Certificate collected in person` (optional)
5. Click blue **"Record Collection"** button
6. **Expected**:
   - Success message appears
   - Certificate status changes to "Collected"
   - Collection details are stored
   - View details shows collector information

#### D. Test Filters
1. **Status Filter**: Select "Ready for Collection" → Only ready certificates show
2. **Search**: Type certificate number → Filtered results show
3. **Reset**: Select "All Statuses" → All certificates show

---

## 4. VERIFY AUDIT LOGS

### Access Audit Logs
1. Navigate to **"Management"** → **"Audit Logs"**
2. **Expected**: See recent actions including:
   - Payment verified by [Your Name]
   - Payment rejected by [Your Name]
   - Certificate marked as ready by [Your Name]
   - Certificate collection recorded by [Your Name]

---

## 5. TEST PERMISSIONS (NEGATIVE TESTS)

### Admin Should NOT Be Able To:
1. ❌ Edit payment after verification (no edit button for verified payments)
2. ❌ Edit certificate after marking ready (no edit button in Admin interface)
3. ❌ Delete payments or certificates (no delete buttons in Admin interface)
4. ❌ Access Super Admin dashboard at `/super-admin/dashboard` (should redirect or error)

---

## 6. COMPARE WITH SUPER ADMIN

### Login as Super Admin
```
Email: superadmin@cpdo.com
Password: superadmin123
```

### Super Admin Should Have:
1. ✅ Edit button on payments (pencil icon)
2. ✅ Edit modal with full form for payments
3. ✅ Edit capability for certificates
4. ✅ Additional analytics and dashboard features
5. ✅ Full CRUD operations

---

## 7. COMMON ISSUES & FIXES

### Issue: "404 Not Found" on /admin/payments
**Fix**: Make sure routes are cleared
```bash
php artisan route:clear
php artisan route:cache
```

### Issue: "Sidebar not showing Processing section"
**Fix**: Clear browser cache or hard refresh (Ctrl + F5)

### Issue: "Modal not opening"
**Fix**: Check browser console for JavaScript errors

### Issue: "Buttons not blue"
**Fix**: Rebuild frontend assets
```bash
npm run build
```

### Issue: "No payments/certificates showing"
**Fix**: Seed database with sample data
```bash
php artisan db:seed
```

---

## 8. SUCCESS CRITERIA

✅ **PASSED** if all of the following work:
- Admin can log in and access payment/certificate pages
- Admin can verify and reject payments
- Admin can mark certificates ready and record collections
- Admin CANNOT edit verified payments or certificates
- Audit logs track all admin actions
- UI is consistent with blue buttons and proper styling
- Filters and search work correctly
- Pagination works
- Success messages appear after actions
- Data persists in database

---

## TESTING STATUS

- [ ] Payment viewing
- [ ] Payment verification
- [ ] Payment rejection
- [ ] Payment filters and search
- [ ] Certificate viewing
- [ ] Certificate mark ready
- [ ] Certificate collection recording
- [ ] Certificate filters and search
- [ ] Audit logging
- [ ] Permission boundaries (admin vs super admin)
- [ ] UI/UX consistency

**Date Tested**: _______________
**Tested By**: _______________
**Result**: PASS / FAIL
**Notes**: _______________
