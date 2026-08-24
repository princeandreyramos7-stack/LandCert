# Payment Receipt Upload Restrictions

## Overview
Payment receipt upload is restricted to **APPROVED applications only**. Applicants cannot upload payment receipts for applications that are still pending or under review.

---

## Business Logic

### Application Status Flow

```
Application Submitted → Status: PENDING
    ↓
Admin Reviews → Status: UNDER REVIEW
    ↓
Admin Decision
    ↓
    ├─→ Status: APPROVED → ✅ CAN UPLOAD RECEIPT
    └─→ Status: REJECTED → ❌ CANNOT UPLOAD RECEIPT
```

### Payment Upload Availability

| Application Status | Can Upload Receipt? | Reason |
|-------------------|-------------------|---------|
| **Pending** | ❌ NO | Application not yet reviewed |
| **Under Review** | ❌ NO | Application still being evaluated |
| **Approved** | ✅ YES | Application approved, payment required |
| **Rejected** | ❌ NO | Application not approved |
| **Completed** | ✅ YES* | If payment already made and verified |

*Note: For completed applications, receipt upload may not be needed if payment is already verified.

---

## Implementation

### 1. Frontend Button Visibility

**File**: `resources/js/Components/MyApplications/MyApplicationsList.jsx`

**Logic**:
```jsx
{/* Upload Receipt button - only show if application is approved */}
{application.status?.toLowerCase() === 'approved' && (
    <Button
        onClick={() => window.location.href = route('receipt.upload.page', application.id)}
        className="text-green-600 hover:bg-green-50 border border-green-200"
    >
        <DollarSign className="h-4 w-4 mr-1" />
        Upload Receipt
    </Button>
)}
```

**Result**:
- Button **VISIBLE** only when `application.status === 'approved'`
- Button **HIDDEN** for pending, under review, or rejected applications

---

### 2. Backend Route Protection

**File**: `app/Http/Controllers/PaymentController.php`

#### Method: `uploadReceiptPage()`

**Check Added**:
```php
// Check if application is approved
if (strtolower($request->status) !== 'approved') {
    return redirect()->route('my-applications')
        ->with('error', 'You can only upload payment receipt after your application is approved.');
}
```

**Result**:
- User redirected to My Applications page if application not approved
- Error message displayed: *"You can only upload payment receipt after your application is approved."*

---

### 3. Backend Upload Submission Protection

**File**: `app/Http/Controllers/PaymentController.php`

#### Method: `store()`

**Check Added**:
```php
// Get the request and check if it's approved
$requestModel = \App\Models\Request::findOrFail($validated['request_id']);

// Check if application is approved
if (strtolower($requestModel->status) !== 'approved') {
    return response()->json([
        'success' => false,
        'message' => 'Payment receipts can only be uploaded for approved applications.'
    ], 403);
}
```

**Result**:
- Upload rejected with 403 Forbidden status
- Error message returned: *"Payment receipts can only be uploaded for approved applications."*

---

### 4. Frontend UI Warning

**File**: `resources/js/Pages/UploadReceipt.jsx`

**Warning Alert**:
```jsx
{/* Warning if not approved */}
{application.status?.toLowerCase() !== 'approved' && (
    <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
            <strong>Payment Receipt Upload Not Available</strong>
            <p className="mt-2 text-sm">
                You can only upload payment receipts after your application has been approved by the admin.
                Current status: <strong>{application.status}</strong>
            </p>
            <p className="mt-2 text-sm">
                Please wait for your application to be reviewed and approved before uploading your payment receipt.
            </p>
        </AlertDescription>
    </Alert>
)}
```

**Upload Form Visibility**:
```jsx
{/* Upload Form - only show if approved */}
{application.status?.toLowerCase() === 'approved' && 
 (!existingPayment || existingPayment.payment_status === 'rejected') && (
    <Card>
        {/* Upload form fields */}
    </Card>
)}
```

**Result**:
- Warning message displayed if status is not "approved"
- Upload form completely hidden if not approved
- User sees clear explanation of why they cannot upload

---

## Security Layers

### Layer 1: UI Button
- **Level**: Frontend
- **Purpose**: User experience
- **Protection**: Prevents user from seeing button for non-approved applications
- **Bypassable**: Yes (can manipulate DOM or directly access URL)

### Layer 2: Page Access
- **Level**: Backend (Controller - uploadReceiptPage)
- **Purpose**: Prevent page access
- **Protection**: Redirects user if application not approved
- **Bypassable**: No (server-side check)

### Layer 3: Form Display
- **Level**: Frontend (Upload page)
- **Purpose**: Visual feedback
- **Protection**: Hides upload form, shows warning message
- **Bypassable**: Yes (can manipulate DOM)

### Layer 4: Upload Submission
- **Level**: Backend (Controller - store)
- **Purpose**: Final validation
- **Protection**: Rejects upload attempt if application not approved
- **Bypassable**: No (server-side check)

---

## User Experience

### Scenario 1: Pending Application

**What User Sees**:
1. In My Applications list: "Upload Receipt" button **NOT VISIBLE**
2. Only sees: "Upload Docs", "Print", and "View" buttons
3. Application status badge shows: "Pending Review"

**If User Directly Accesses URL**:
- Redirected to My Applications page
- Error message: "You can only upload payment receipt after your application is approved."

---

### Scenario 2: Under Review Application

**What User Sees**:
1. In My Applications list: "Upload Receipt" button **NOT VISIBLE**
2. Application status badge shows: "Under Review"

**If User Directly Accesses URL**:
- Redirected to My Applications page
- Error message: "You can only upload payment receipt after your application is approved."

---

### Scenario 3: Approved Application

**What User Sees**:
1. In My Applications list: "Upload Receipt" button **VISIBLE** (green color)
2. Application status badge shows: "Approved"
3. Can click button to upload receipt

**On Upload Page**:
- Full upload form displayed
- Instructions shown
- Can upload receipt file
- Can enter amount and date
- Submit button enabled

---

### Scenario 4: Rejected Application

**What User Sees**:
1. In My Applications list: "Upload Receipt" button **NOT VISIBLE**
2. Application status badge shows: "Rejected"

**If User Directly Accesses URL**:
- Redirected to My Applications page
- Error message: "You can only upload payment receipt after your application is approved."

---

## Error Messages

### Frontend (My Applications Page)
```
Error: "You can only upload payment receipt after your application is approved."
Display: Flash message at top of page
Color: Red/Error theme
```

### Frontend (Upload Page - Warning)
```
Title: "Payment Receipt Upload Not Available"
Message: "You can only upload payment receipts after your application has been approved by the admin.
         Current status: [STATUS]
         Please wait for your application to be reviewed and approved before uploading your payment receipt."
Display: Alert box with amber/warning theme
Icon: AlertCircle
```

### Backend (API Response)
```json
{
    "success": false,
    "message": "Payment receipts can only be uploaded for approved applications."
}
```
HTTP Status: 403 Forbidden

---

## Testing Checklist

### ✅ UI Button Visibility Tests
- [x] Button NOT visible when status = "pending"
- [x] Button NOT visible when status = "under review"
- [x] Button NOT visible when status = "rejected"
- [x] Button VISIBLE when status = "approved"
- [x] Button style: green color, DollarSign icon

### ✅ Page Access Tests
- [x] Direct URL access redirects if status = "pending"
- [x] Direct URL access redirects if status = "under review"
- [x] Direct URL access redirects if status = "rejected"
- [x] Page loads correctly if status = "approved"
- [x] Error message displayed after redirect

### ✅ Form Display Tests
- [x] Warning message shown if status != "approved"
- [x] Upload form hidden if status != "approved"
- [x] Upload form shown if status = "approved"
- [x] Instructions displayed correctly

### ✅ Upload Submission Tests
- [x] Upload rejected (403) if status = "pending"
- [x] Upload rejected (403) if status = "under review"
- [x] Upload rejected (403) if status = "rejected"
- [x] Upload succeeds if status = "approved"
- [x] Error message returned in JSON response

### ✅ User Experience Tests
- [x] Clear error messages displayed
- [x] User understands why upload is not available
- [x] No confusion about when upload becomes available
- [x] Smooth transition when application is approved

---

## Admin Workflow

### Application Approval Process

1. **Admin Reviews Application**
   - Views application details
   - Checks all requirements
   - Makes decision

2. **Admin Approves Application**
   - Clicks "Approve" button
   - Application status → "approved"
   - Applicant receives notification

3. **Applicant Receives Notification**
   - Email: "Your application has been approved"
   - In-app notification
   - Instructions to upload payment receipt

4. **Applicant Uploads Receipt**
   - "Upload Receipt" button now visible
   - Clicks button
   - Uploads receipt file
   - Submits payment

5. **Admin Verifies Payment**
   - Views uploaded receipt
   - Verifies payment
   - Certificate preparation begins

---

## Business Rules Summary

### Rule 1: Status-Based Access
**Rule**: Payment receipt upload is only available for approved applications.

**Enforcement**:
- Frontend: Button visibility
- Backend: Route protection
- Backend: Submission validation

**Exception**: None - this rule is absolute

---

### Rule 2: Re-upload After Rejection
**Rule**: If payment receipt is rejected, applicant can re-upload.

**Condition**: Application must still be "approved"

**Note**: Payment rejection does NOT change application status

---

### Rule 3: Multiple Uploads Prevention
**Rule**: Only one active payment per application.

**Behavior**:
- Pending payment: Cannot upload again
- Verified payment: Cannot upload again
- Rejected payment: Can re-upload

---

## Future Considerations

### Possible Status Additions

**"Payment Required"** Status:
- Explicitly indicates payment is due
- Separate from "approved" status
- Makes process clearer for applicants

**"Payment Pending"** Status:
- Application approved AND receipt uploaded
- Waiting for admin verification
- Distinct from general "approved" status

### Enhanced Notifications

**After Approval**:
- Email with payment instructions
- Link directly to upload receipt page
- Amount to pay clearly stated

**Payment Deadline**:
- Set deadline for payment upload
- Reminder emails if not uploaded
- Status change if deadline missed

---

## Documentation Date
August 20, 2026

## Feature Status
✅ **IMPLEMENTED AND TESTED**

## Related Documents
- `PAYMENT_RECEIPT_UPLOAD_FEATURE.md` - Complete feature documentation
- `RECENT_UPDATES_SUMMARY.md` - Summary of all recent updates
