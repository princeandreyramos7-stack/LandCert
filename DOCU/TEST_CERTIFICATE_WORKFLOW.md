# Certificate Workflow Testing Guide

**Date:** August 4, 2026  
**Purpose:** Verify certificate generation works after payment verification

---

## Quick Test Commands

### 1. Check Migration Status
```bash
php artisan migrate:status
```
Expected: `2026_08_04_000001_update_certificates_table_for_physical_workflow` should show as **Ran**

### 2. Test Email Configuration
```bash
php artisan test:email
```
Expected: Test email should be sent successfully

### 3. Check Database Structure
```bash
php artisan tinker
```
Then in tinker:
```php
\Schema::hasColumn('certificates', 'user_id')  // Should return true
\Schema::hasColumn('certificates', 'ready_at')  // Should return true
\Schema::hasColumn('certificates', 'released_at')  // Should return true
```

---

## Manual Testing Workflow

### Scenario 1: Complete Happy Path

#### Step 1: Create Test Request
1. Login as applicant user
2. Go to request submission page
3. Fill out and submit a new request
4. **Expected:** Request created successfully

#### Step 2: Admin Approves Request
1. Login as admin/super admin
2. Go to admin dashboard or requests page
3. Find the test request
4. Approve the request with evaluation "approved"
5. **Expected:** 
   - Request status changes to "approved"
   - Applicant receives approval email
   - Applicant receives approval SMS (if configured)

#### Step 3: Applicant Uploads Payment Receipt
1. Login as applicant
2. Go to payment page or request details
3. Upload payment receipt with:
   - Amount (e.g., 5000)
   - Payment method (e.g., bank_transfer)
   - Receipt file (image or PDF)
   - Payment date
4. Submit payment
5. **Expected:**
   - Payment record created with status "pending"
   - Applicant receives confirmation email
   - Admin receives notification of pending payment

#### Step 4: Admin Verifies Payment ⭐ (CRITICAL TEST)
1. Login as admin/super admin
2. Go to payments page
3. Find the test payment
4. Click "Verify" and enter:
   - Confirm amount
   - Receipt number
   - Payment date
   - Optional notes
5. Submit verification
6. **Expected - THIS IS THE BUG FIX:**
   - ✅ Payment status changes to "verified"
   - ✅ **CERTIFICATE IS AUTOMATICALLY CREATED**
   - ✅ Certificate number generated (format: CPDO-2026-XXXXXX)
   - ✅ Certificate status is "preparing"
   - ✅ Applicant receives email: "Certificate Being Prepared"
   - ✅ Applicant receives SMS notification
   - ✅ In-app notification created
   - ✅ Audit log entry created

#### Step 5: Verify Certificate in Database
Run this query:
```bash
php artisan tinker
```
```php
$certificate = \App\Models\Certificate::latest()->first();
dd([
    'id' => $certificate->id,
    'certificate_number' => $certificate->certificate_number,
    'status' => $certificate->status,
    'request_id' => $certificate->request_id,
    'payment_id' => $certificate->payment_id,
    'user_id' => $certificate->user_id,
    'issued_at' => $certificate->issued_at,
    'valid_until' => $certificate->valid_until,
]);
```

**Expected Output:**
```php
[
    'id' => [some number],
    'certificate_number' => 'CPDO-2026-000XXX',
    'status' => 'preparing',
    'request_id' => [request ID],
    'payment_id' => [payment ID],
    'user_id' => [applicant user ID],
    'issued_at' => '2026-08-04 ...',
    'valid_until' => '2027-08-04 ...',
]
```

#### Step 6: Mark Certificate Ready for Pickup
1. Login as admin/super admin
2. Go to certificates page
3. Find the test certificate
4. Click "Mark as Ready" button
5. **Expected:**
   - Certificate status changes to "ready_for_pickup"
   - `ready_at` timestamp set
   - Applicant receives notification

#### Step 7: Record Physical Release
1. Admin/staff meets applicant at office
2. Admin verifies applicant's ID
3. In system, click "Record Release" and enter:
   - Collected by name
   - ID type (e.g., "Driver's License")
   - ID number
   - Relationship (e.g., "applicant")
   - Date and time
   - Optional remarks
4. Submit release record
5. **Expected:**
   - Certificate status changes to "released"
   - All release tracking fields populated
   - `released_at` timestamp set

---

## Scenario 2: Test Duplicate Prevention

1. Follow Scenario 1 steps 1-4 to verify a payment
2. **Expected:** Certificate created successfully
3. Try to verify the SAME payment again
4. **Expected:** 
   - Payment already verified message, OR
   - No duplicate certificate created (system checks for existing certificate)

To verify:
```bash
php artisan tinker
```
```php
$requestId = 1; // Use actual request ID
$certificates = \App\Models\Certificate::where('request_id', $requestId)->count();
echo "Certificates for this request: $certificates\n"; // Should be 1, not 2
```

---

## Scenario 3: Email Testing

### Test Certificate Issued Email
```bash
php artisan tinker
```
```php
$request = \App\Models\Request::first();
$certificate = \App\Models\Certificate::first();
$user = $request->user;

\Mail::to($user->email)->send(new \App\Mail\CertificateIssued($request, $certificate));
```

**Check email inbox for:**
- Subject: "Certificate Being Prepared - Collection Notice"
- Content mentions certificate number
- Explains physical collection process
- No PDF attachment

### Test Payment Receipt Email
```php
$payment = \App\Models\Payment::first();
$request = $payment->request;
$user = $request->user;

\Mail::to($user->email)->send(new \App\Mail\PaymentReceiptSubmitted($payment, $request));
```

**Check email inbox for:**
- Subject: "Payment Receipt Submitted - Awaiting Verification"
- Shows payment details
- Explains verification process

---

## Scenario 4: Check Logs

### Application Logs
```bash
# View recent logs
tail -n 50 storage/logs/laravel.log

# Or on Windows
Get-Content storage/logs/laravel.log -Tail 50
```

**Look for:**
- "Certificate {number} created for request #{id}"
- "Failed to send..." (check if any email/SMS failures)
- Any error messages

### Audit Logs (Database)
```bash
php artisan tinker
```
```php
// Get recent audit logs
$logs = \App\Models\AuditLog::latest()->take(10)->get();
foreach ($logs as $log) {
    echo "{$log->created_at} - {$log->user_name} - {$log->action} - {$log->model_type} #{$log->model_id}\n";
    echo "  {$log->description}\n\n";
}
```

**Look for:**
- "Certificate CPDO-2026-XXXXXX created after payment verification"
- "Payment verified by admin"

---

## Troubleshooting

### Certificate Not Generated After Payment Verification

**Check:**
1. Migration was run successfully:
   ```bash
   php artisan migrate:status | grep update_certificates_table
   ```

2. Payment was actually verified:
   ```bash
   php artisan tinker
   ```
   ```php
   $payment = \App\Models\Payment::find([payment_id]);
   echo $payment->payment_status; // Should be "verified"
   ```

3. Check for errors in logs:
   ```bash
   Get-Content storage/logs/laravel.log -Tail 100 | Select-String -Pattern "certificate"
   ```

4. Check if certificate exists:
   ```php
   $requestId = [your_request_id];
   $cert = \App\Models\Certificate::where('request_id', $requestId)->first();
   dd($cert);
   ```

### Email Not Sent

**Check `.env` configuration:**
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="CPDO System"
```

**Test email:**
```bash
php artisan test:email
```

**Clear config cache:**
```bash
php artisan config:cache
```

### SMS Not Sent (Optional)

SMS is optional and failures won't break the workflow. Check:
```bash
Get-Content storage/logs/laravel.log -Tail 50 | Select-String -Pattern "SMS"
```

See `DOCU/README_SMS_SETUP.md` for SMS configuration.

---

## Expected Success Criteria

✅ **Bug #1 Fixed:** Certificate is generated after payment verification  
✅ **No Duplicates:** System prevents duplicate certificates  
✅ **Emails Sent:** Applicant receives confirmation emails  
✅ **Notifications Created:** In-app notifications appear  
✅ **Audit Trail:** All actions logged in audit_logs table  
✅ **Physical Workflow:** Status progresses: preparing → ready_for_pickup → released  
✅ **Data Integrity:** All foreign keys and relationships work correctly  

---

## Database Verification Queries

### Check Certificate Table Structure
```sql
DESCRIBE certificates;
```

Expected columns:
- id, request_id, payment_id, user_id
- certificate_number, certificate_file_path
- issued_by, issued_at, valid_until
- status (preparing, ready_for_pickup, released, cancelled)
- ready_at, released_at, released_by
- released_to_name, released_to_id_type, released_to_id_number
- release_signature_path
- notes, created_at, updated_at

### Check Certificate Count
```sql
SELECT COUNT(*) as total_certificates FROM certificates;
SELECT status, COUNT(*) as count FROM certificates GROUP BY status;
```

### Check Recent Certificates
```sql
SELECT 
    c.id,
    c.certificate_number,
    c.status,
    c.issued_at,
    r.applicant_name,
    p.payment_status,
    p.amount
FROM certificates c
JOIN requests r ON c.request_id = r.id
JOIN payments p ON c.payment_id = p.id
ORDER BY c.created_at DESC
LIMIT 10;
```

---

## Success Message

If all tests pass, you should see:

**✅ CERTIFICATE WORKFLOW WORKING CORRECTLY**

The critical bug is fixed:
- Certificates are generated automatically after payment verification
- All notifications are sent properly
- Physical certificate workflow is complete
- System is ready for production use

---

## Need Help?

If tests fail:
1. Check `storage/logs/laravel.log` for errors
2. Verify database migration ran: `php artisan migrate:status`
3. Clear all caches: `php artisan config:cache && php artisan route:cache`
4. Check email configuration in `.env`
5. Review `DOCU/CERTIFICATE_WORKFLOW_FIX_COMPLETE.md` for implementation details
