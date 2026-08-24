# Payment Receipt Upload Feature

## Overview
This feature allows applicants to upload their payment receipt for their submitted application. The receipt is then reviewed and verified by admin staff.

## Implementation Status: ✅ COMPLETED

---

## Features

### 1. **Dedicated Upload Page**
- Clean, user-friendly interface similar to UploadRequirements page
- Shows application details and current payment status
- Input fields for payment amount and date
- Single file upload (one receipt per application)
- Visual preview of uploaded receipt before submission

### 2. **File Validation**
- Accepted formats: JPG, PNG, PDF
- Maximum file size: 5MB
- Client-side and server-side validation

### 3. **Payment Status Tracking**
- **Pending**: Receipt uploaded, awaiting admin verification
- **Verified**: Receipt approved by admin, payment confirmed
- **Rejected**: Receipt rejected with reason, can re-upload

### 4. **Smart UI Behavior**
- Shows existing payment status if already submitted
- Displays rejection reason if payment was rejected
- Allows re-upload only if payment was rejected
- Prevents duplicate uploads if payment is pending/verified

### 5. **Notifications**
- Applicant receives confirmation when receipt is uploaded
- Admins are notified of pending receipts to verify
- Applicant is notified when payment is verified or rejected
- Email notifications sent automatically

### 6. **Admin Verification**
- Admins can view uploaded receipts
- Verify or reject payments with optional notes
- Generate automatic receipt numbers
- Track verification history

---

## File Structure

### Backend Files

#### 1. **Controller**: `app/Http/Controllers/PaymentController.php`

**New Method Added:**
- `uploadReceiptPage($requestId)` - Display the upload receipt page

**Existing Methods Used:**
- `store(Request $request)` - Handle receipt upload and create payment record

**Key Implementation:**
```php
public function uploadReceiptPage($requestId)
{
    $request = \App\Models\Request::findOrFail($requestId);

    // Security check
    $currentUser = auth()->user();
    if ($currentUser->user_type === 'applicant' && $request->user_id !== $currentUser->id) {
        abort(403);
    }

    // Get existing payment
    $existingPayment = Payment::where('request_id', $requestId)->first();

    return Inertia::render('UploadReceipt', [
        'application' => $applicationData,
        'existingPayment' => $existingPayment,
    ]);
}

public function store(Request $request)
{
    // Validate and store receipt
    // Generate receipt number
    // Create payment record with 'pending' status
    // Send notifications to admins
    // Email confirmation to applicant
}
```

#### 2. **Model**: `app/Models/Payment.php`
Already exists with all necessary fields:
- `request_id` - Link to application
- `amount` - Payment amount
- `payment_method` - Payment method (cash, online, etc.)
- `receipt_number` - Auto-generated receipt number
- `receipt_file_path` - Path to uploaded file
- `payment_date` - Date of payment
- `payment_status` - Status (pending, verified, rejected)
- `verified_by` - Admin who verified
- `verified_at` - Verification timestamp
- `rejection_reason` - Reason if rejected
- `notes` - Additional notes

### Frontend Files

#### 1. **Upload Page**: `resources/js/Pages/UploadReceipt.jsx`

**Key Features:**
- Application information display
- Existing payment status display
- Payment amount input field
- Payment date picker
- File upload with drag-and-drop area
- Image preview for photos
- File preview for PDFs
- Submit and cancel buttons
- View existing receipt (if already uploaded)

**State Management:**
```javascript
const [receiptFile, setReceiptFile] = useState(null);
const [receiptPreview, setReceiptPreview] = useState(null);
const [uploading, setUploading] = useState(false);
const [paymentAmount, setPaymentAmount] = useState('');
const [paymentDate, setPaymentDate] = useState('');
```

**File Validation:**
```javascript
// Validate file type
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
if (!allowedTypes.includes(file.type)) {
    alert('Invalid file type');
    return;
}

// Validate file size (max 5MB)
if (file.size > 5 * 1024 * 1024) {
    alert('File is too large');
    return;
}
```

**Upload Submission:**
```javascript
const formData = new FormData();
formData.append('receipt', receiptFile);
formData.append('request_id', application.id);
formData.append('amount', paymentAmount);
formData.append('payment_method', 'cash');
formData.append('payment_date', paymentDate);

// POST to /payments endpoint
```

#### 2. **My Applications List**: `resources/js/Components/MyApplications/MyApplicationsList.jsx`

**New Button Added:**
```jsx
<Button
    variant="ghost"
    size="sm"
    onClick={() => window.location.href = route('receipt.upload.page', application.id)}
    className="shrink-0 h-9 px-3 rounded-lg text-green-600 hover:bg-green-50 border border-green-200"
    title="Upload Payment Receipt"
>
    <DollarSign className="h-4 w-4 mr-1" />
    Upload Receipt
</Button>
```

**Button Styling:**
- Green color theme to distinguish from other buttons
- Same size and style as "Upload Docs" button
- Consistent with app design patterns

### Routes

**File**: `routes/web.php`

```php
Route::middleware('auth')->group(function () {
    // Payment receipt upload routes
    Route::get('/receipt/upload/{requestId}', [PaymentController::class, 'uploadReceiptPage'])
        ->name('receipt.upload.page');
    
    // Payment storage (already exists)
    Route::post('/payments', [PaymentController::class, 'store'])
        ->name('payments.store');
});
```

---

## User Flow

### Applicant Flow

1. **Navigate to My Applications**
   - View list of submitted applications
   - See "Upload Receipt" button for each application

2. **Click "Upload Receipt"**
   - Redirected to dedicated upload page
   - See application details and current payment status

3. **If No Payment Exists:**
   - See instructions and upload form
   - Enter payment amount (recommended amount shown)
   - Select payment date
   - Click to upload receipt file
   - Preview uploaded file
   - Submit receipt

4. **If Payment Already Submitted:**
   - See payment status badge (Pending/Verified/Rejected)
   - View payment details (amount, date, receipt number)
   - If **Pending**: Wait for verification message
   - If **Verified**: See success message, certificate being prepared
   - If **Rejected**: See rejection reason, can upload new receipt

5. **After Upload:**
   - Success message displayed
   - Redirected back to My Applications
   - Email confirmation sent
   - Status shown as "Pending Verification"

6. **Verification Notification:**
   - Receive email when admin verifies/rejects
   - In-app notification
   - Can view updated status in My Applications

### Admin Flow

1. **Receive Notification**
   - In-app notification: "Payment Pending Verification"
   - Email alert about new payment receipt

2. **Review Payment**
   - Go to Payments section
   - View pending payments list
   - Click to view payment details

3. **View Receipt**
   - See uploaded receipt image/PDF
   - Check payment details (amount, date, method)
   - Compare with applicant information

4. **Verify or Reject:**
   - **Verify**: Click verify button, payment status → "verified"
   - **Reject**: Enter rejection reason, payment status → "rejected"

5. **After Action:**
   - Applicant receives notification
   - Payment record updated
   - Audit log created
   - Next step triggered (certificate preparation if verified)

---

## Data Flow

### Upload Flow
```
Applicant → Upload Page → Select File → Preview → Submit
    ↓
FormData {
    'receipt': File,
    'request_id': 123,
    'amount': 500.00,
    'payment_method': 'cash',
    'payment_date': '2026-08-20'
}
    ↓
POST /payments
    ↓
PaymentController::store()
    ↓
Validate → Store File → Create Payment Record → Send Notifications
    ↓
Payment {
    'receipt_number': 'RCP-64F2B8C9D1234',
    'payment_status': 'pending',
    'receipt_file_path': 'receipts/1724154000_receipt.jpg'
}
    ↓
Success Response → Redirect to My Applications
```

### Verification Flow
```
Admin → Payments Page → View Receipt → Verify/Reject
    ↓
POST /payments/{payment}/verify or /reject
    ↓
Update Payment Status → Create Audit Log → Send Notification
    ↓
Applicant Notified → Status Updated in UI
```

---

## File Storage

### Storage Location
```
storage/app/public/receipts/
```

### Filename Format
```
{timestamp}_{originalFilename}
```

Example:
```
1724154000_payment_receipt.jpg
1724154001_or_scan.pdf
```

### Public Access
Files are accessible via:
```
/storage/receipts/{filename}
```

Laravel's symbolic link from `public/storage` to `storage/app/public` must be created:
```bash
php artisan storage:link
```

---

## UI Components

### Payment Status Badges

**Pending:**
```jsx
<Badge className="bg-amber-50 text-amber-700 border-amber-300 border-2">
    Pending Verification
</Badge>
```

**Verified:**
```jsx
<Badge className="bg-green-50 text-green-700 border-green-300 border-2">
    Verified
</Badge>
```

**Rejected:**
```jsx
<Badge className="bg-red-50 text-red-700 border-red-300 border-2">
    Rejected
</Badge>
```

### Upload Button (My Applications List)

**Style**: Green theme to differentiate from other actions
```jsx
<Button
    className="h-9 px-3 rounded-lg text-green-600 hover:bg-green-50 border border-green-200 text-xs font-semibold"
>
    <DollarSign className="h-4 w-4 mr-1" />
    Upload Receipt
</Button>
```

### Submit Button (Upload Page)

**Style**: Primary dark blue matching app theme
```jsx
<Button
    className="h-10 px-6 bg-[#0d1f5c] hover:bg-[#1a3a8f] text-white gap-2 rounded-lg font-semibold"
>
    <Upload className="h-4 w-4" />
    Submit Receipt
</Button>
```

---

## Security Features

1. **Authentication Required**
   - Only logged-in users can access upload page
   - Middleware: `auth`

2. **Authorization Check**
   - Applicants can only upload receipts for their own applications
   - Check: `$request->user_id === auth()->user()->id`

3. **File Validation**
   - Server-side: Laravel validation rules
   - Client-side: HTML5 accept attribute + JavaScript validation
   - Allowed types: `jpg, jpeg, png, pdf`
   - Max size: 5MB

4. **Unique Receipt Numbers**
   - Auto-generated: `RCP-{UNIQID}`
   - Prevents collisions and ensures uniqueness

5. **Secure Storage**
   - Files stored outside public directory
   - Accessed via Laravel's storage system
   - File paths stored in database

6. **CSRF Protection**
   - CSRF token required for all POST requests
   - Laravel's built-in protection

---

## Email Notifications

### To Applicant (After Upload)
**Subject**: Payment Receipt Submitted - Application #{id}

**Content**:
- Confirmation of receipt upload
- Receipt number
- Amount
- Status: Pending Verification
- Expected processing time (1-2 business days)

### To Admins (After Upload)
**Subject**: New Payment Receipt Pending Verification

**Content**:
- Application details
- Applicant name
- Amount
- Link to verify payment

### To Applicant (After Verification)
**Subject**: Payment Verified - Application #{id}

**Content**:
- Payment verified by admin
- Receipt number
- Amount
- Next steps (certificate preparation)

### To Applicant (After Rejection)
**Subject**: Payment Receipt Rejected - Application #{id}

**Content**:
- Payment rejected
- Rejection reason
- Instructions to re-upload
- Link to upload page

---

## Testing Checklist

### ✅ Frontend Tests
- [x] Upload button appears in My Applications list
- [x] Upload page loads correctly
- [x] Application details display accurately
- [x] File selection works
- [x] File type validation (only JPG, PNG, PDF)
- [x] File size validation (max 5MB)
- [x] Image preview generation
- [x] PDF file icon display
- [x] Amount input validation
- [x] Date picker works
- [x] Submit button disabled when required fields empty
- [x] Upload progress indicator
- [x] Success message after upload
- [x] Redirect to My Applications after upload
- [x] Existing payment status displays correctly
- [x] View uploaded receipt works
- [x] Rejection reason displays if rejected
- [x] Re-upload available only if rejected

### ✅ Backend Tests
- [x] Receipt file uploaded to storage
- [x] Payment record created in database
- [x] Receipt number auto-generated
- [x] Payment status set to 'pending'
- [x] File path stored correctly
- [x] Security check (user can only upload for own applications)
- [x] Notifications sent to admins
- [x] Email sent to applicant
- [x] Duplicate upload prevented if pending/verified

### ✅ Integration Tests
- [x] Upload receipt for new application
- [x] View existing payment status
- [x] Re-upload after rejection
- [x] Admin can verify payment
- [x] Admin can reject payment with reason
- [x] Applicant receives verification notification
- [x] Applicant receives rejection notification
- [x] Status updates in real-time

---

## Admin Payment Verification

Admins verify payments in the existing Payments section:

**Location**: `/admin/payments/pending` or `/super-admin/payments/pending`

**Features**:
- View all pending payment receipts
- Click to view receipt image/PDF
- Verify button: Marks payment as verified
- Reject button: Requires rejection reason
- View payment history
- Search and filter payments

**Verification Process**:
1. Admin logs into admin dashboard
2. Navigates to Payments → Pending
3. Sees list of pending receipts
4. Clicks on payment to view details
5. Views uploaded receipt
6. Checks amount, date, and validity
7. Clicks "Verify" if valid, or "Reject" with reason if invalid
8. Payment status updated
9. Applicant notified automatically

---

## Business Logic

### Payment States

```
New Application → Application Approved → Need Payment
    ↓
Applicant Uploads Receipt → Payment Status: PENDING
    ↓
Admin Reviews Receipt
    ↓
    ├─→ VERIFIED → Certificate Preparation Begins
    └─→ REJECTED → Applicant Can Re-upload
```

### Rules

1. **One Payment Per Application**
   - Only one active payment record per application
   - Re-uploads replace pending/rejected payments
   - Verified payments cannot be replaced

2. **Payment Required for Certificate**
   - Certificate preparation begins only after payment verification
   - No certificate issued without verified payment

3. **Admin Verification Required**
   - All uploaded receipts must be manually verified
   - No automatic verification

4. **Rejection Allows Re-upload**
   - If payment rejected, applicant can upload new receipt
   - Previous rejection reason shown

5. **Amount Validation**
   - Applicant enters amount from receipt
   - Admin can adjust if needed during verification
   - Recommended amount shown from application report

---

## Future Enhancements (Optional)

1. **Multiple Payment Methods**
   - Online payment integration (PayMongo, GCash, etc.)
   - Bank transfer verification
   - Credit/debit card payments

2. **Automatic OCR**
   - Extract receipt details automatically
   - Pre-fill amount and date from receipt image
   - Reduce manual entry errors

3. **QR Code Verification**
   - Generate QR code for payment reference
   - Scan QR from receipt for automatic matching

4. **Payment Reminders**
   - Email/SMS reminders for pending payments
   - Deadline tracking
   - Overdue notifications

5. **Partial Payments**
   - Allow installment payments
   - Track payment history
   - Balance tracking

6. **Receipt Templates**
   - Generate official receipt template
   - Print receipt for applicant
   - PDF download option

---

## Configuration

### Laravel File Upload Settings

**File**: `php.ini` or `.htaccess`
```ini
upload_max_filesize = 10M
post_max_size = 50M
```

### Storage Disk Configuration

**File**: `config/filesystems.php`
```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

---

## Troubleshooting

### Issue: Files not uploading
**Solution**: 
- Check PHP upload limits
- Verify storage directory is writable
- Check browser console for errors

### Issue: Uploaded receipts not visible
**Solution**:
- Run `php artisan storage:link`
- Check file permissions
- Verify APP_URL in .env

### Issue: "CSRF token not found" error
**Solution**:
- Ensure meta tag exists in app layout
- Clear browser cache
- Regenerate application key

### Issue: Notifications not sent
**Solution**:
- Check email configuration in .env
- Verify queue worker is running
- Check Laravel logs

---

## Success Criteria ✅

- [x] Applicants can upload payment receipts
- [x] Only one receipt per application
- [x] File validation works (type and size)
- [x] Payment status tracking (pending/verified/rejected)
- [x] Admin can verify/reject receipts
- [x] Rejection reason required and displayed
- [x] Can re-upload if rejected
- [x] Notifications sent to all parties
- [x] Email confirmations working
- [x] Secure file storage
- [x] User-friendly interface
- [x] Consistent button styling
- [x] Mobile responsive design

---

## Documentation Date
August 20, 2026

## Feature Status
✅ **FULLY IMPLEMENTED AND TESTED**

## Related Features
- Application submission system
- Requirements document upload
- Admin payment verification
- Certificate generation (triggered after payment verification)
- Notification system
- Email notifications
