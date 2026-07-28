# Physical Document Management System

## Overview
This system manages **physical certificates and payments** for the CPDO Project. The Super Admin has dedicated pages to track, verify, and manage the collection of physical documents.

## Database Structure

### 1. Certificates Table
Tracks physical certificate documents:
- `id`: Primary key
- `request_id`: Links to the request/application
- `certificate_number`: Unique certificate identifier
- `status`: `generated`, `ready_for_collection`, `collected`
- `issued_by`: User who issued the certificate
- `issued_at`: Date certificate was issued
- `valid_until`: Expiry date of certificate
- `notes`: Additional notes
- `created_at`, `updated_at`: Timestamps

### 2. Payments Table
Tracks physical payment receipts:
- `id`: Primary key
- `request_id`: Links to the request/application
- `amount`: Payment amount
- `payment_method`: `cash`, `check`, `bank_transfer`
- `receipt_number`: Official receipt number
- `payment_date`: Date payment was received
- `payment_status`: `pending`, `verified`, `rejected`
- `verified_by`: User who verified the payment
- `verified_at`: Verification timestamp
- `rejection_reason`: Reason if rejected
- `notes`: Additional notes
- `created_at`, `updated_at`: Timestamps

### 3. Certificate Releases Table
Tracks physical certificate collection:
- `id`: Primary key
- `certificate_id`: Links to certificate
- `released_by`: Staff member who released the certificate
- `collected_by_name`: Full name of person collecting
- `release_date`: Date of collection
- `release_time`: Time of collection
- `valid_id_type`: Type of ID presented (Driver's License, Passport, etc.)
- `valid_id_number`: ID number
- `relationship_to_applicant`: Self, Representative, Attorney, etc.
- `remarks`: Additional remarks
- `created_at`, `updated_at`: Timestamps

## Features

### Certificate Management (`/super-admin/certificates`)

#### Features:
1. **View All Certificates** - List all certificates with status
2. **Filter by Status** - Filter: Generated, Ready for Collection, Collected
3. **Search** - Search by certificate number or applicant name
4. **Mark as Ready** - Mark generated certificates as ready for collection
5. **Record Collection** - Record physical collection with:
   - Collector's full name
   - Valid ID details (type and number)
   - Relationship to applicant
   - Collection date and time
   - Remarks

#### Certificate Workflow:
1. Certificate is `generated` (created in system)
2. Physical certificate is printed and **marked as `ready_for_collection`**
3. Person collects certificate → Staff records collection → Status changes to `collected`

### Payment Management (`/super-admin/payments`)

#### Features:
1. **View All Payments** - List all payment records
2. **Filter by Status** - Filter: Pending, Verified, Rejected
3. **Filter by Method** - Filter: Cash, Check, Bank Transfer
4. **Search** - Search by receipt number or applicant name
5. **Verify Payment** - Confirm physical payment receipt with:
   - Amount verification
   - Receipt number
   - Payment date
   - Notes
6. **Reject Payment** - Reject with reason
7. **Edit Payment Details** - Update payment information

#### Payment Workflow:
1. Payment is recorded as `pending`
2. Staff physically receives payment
3. Super Admin **verifies** payment → Status changes to `verified`
4. Or **rejects** payment with reason → Status changes to `rejected`

## Routes

### Certificate Routes
```php
GET    /super-admin/certificates                     # List all certificates
PUT    /super-admin/certificates/{id}                # Update certificate
POST   /super-admin/certificates/{id}/mark-ready     # Mark as ready for collection
POST   /super-admin/certificates/{id}/release        # Record collection
```

### Payment Routes
```php
GET    /super-admin/payments                         # List all payments
PUT    /super-admin/payments/{id}                    # Update payment
POST   /super-admin/payments/{id}/verify             # Verify payment
POST   /super-admin/payments/{id}/reject             # Reject payment
```

## Controller Methods

### SuperAdminController

#### Certificate Methods:
- `certificates(Request)` - Display all certificates
- `updateCertificate(Request, $id)` - Update certificate details
- `markCertificateReady(Request, $id)` - Mark certificate as ready
- `releaseCertificate(Request, $id)` - Record certificate collection

#### Payment Methods:
- `payments(Request)` - Display all payments
- `updatePayment(Request, $id)` - Update payment details
- `verifyPayment(Request, $id)` - Verify a payment
- `rejectPayment(Request, $id)` - Reject a payment

## UI Components

### Certificate Page Components:
1. **Certificate Table** - Shows all certificates with actions
2. **Details Modal** - View full certificate details
3. **Mark Ready Modal** - Form to mark certificate as ready
4. **Release Modal** - Form to record collection with ID verification

### Payment Page Components:
1. **Payment Table** - Shows all payments with actions
2. **Details Modal** - View full payment details
3. **Verify Modal** - Form to verify payment
4. **Reject Modal** - Form to reject with reason
5. **Edit Modal** - Form to edit payment details

## Access Control

- **Super Admin Only** - Only users with `super_admin` role can access
- Protected by `auth` and `role:super_admin` middleware
- All actions are logged in the audit log system

## Sidebar Navigation

The Super Admin sidebar includes:
- 📋 **Certificate Management** - Link to certificates page
- 💳 **Payment Management** - Link to payments page

## Status Badges

### Certificate Statuses:
- 🔘 **Generated** - Certificate created but not ready
- 📦 **Ready for Collection** - Physical certificate available
- ✅ **Collected** - Certificate collected by applicant/representative

### Payment Statuses:
- ⏳ **Pending** - Awaiting verification
- ✅ **Verified** - Payment confirmed
- ❌ **Rejected** - Payment rejected

## Usage Examples

### Marking Certificate Ready:
1. Navigate to `/super-admin/certificates`
2. Find certificate with status "Generated"
3. Click "Mark Ready" button
4. Enter certificate number
5. Add any notes
6. Submit → Status changes to "Ready for Collection"

### Recording Certificate Collection:
1. Navigate to `/super-admin/certificates`
2. Find certificate with status "Ready for Collection"
3. Click "Record Collection" button
4. Fill in collector details:
   - Full name
   - Valid ID type and number
   - Relationship to applicant
   - Collection date and time
5. Submit → Status changes to "Collected"

### Verifying Payment:
1. Navigate to `/super-admin/payments`
2. Find payment with status "Pending"
3. Click "Verify" button
4. Confirm amount, receipt number, and date
5. Add notes if needed
6. Submit → Status changes to "Verified"

## Best Practices

1. **Always verify ID** - When releasing certificates, verify valid ID
2. **Record accurate times** - Record actual collection date/time
3. **Add notes** - Document any special circumstances
4. **Verify amounts** - Double-check payment amounts before verifying
5. **Use filters** - Use status filters to find pending items quickly

## Security Features

1. **Role-based access** - Only Super Admins can access
2. **Audit logging** - All actions are logged
3. **User tracking** - System tracks who issued/verified
4. **Timestamp tracking** - All actions timestamped

## Future Enhancements

Potential improvements:
- Signature capture for certificate collection
- Photo upload of valid ID
- Barcode/QR code scanning for receipts
- Email notifications when ready for collection
- SMS reminders for pending collections
- PDF generation for collection receipts
- Batch operations (mark multiple as ready)
- Advanced reporting and analytics
- Export to Excel/PDF

## Technical Stack

- **Backend**: Laravel (PHP)
- **Frontend**: React + Inertia.js
- **UI Components**: Shadcn/UI
- **Database**: MySQL/PostgreSQL
- **Authentication**: Laravel Breeze
- **Authorization**: Custom role middleware

## Related Documentation

- `DOCU/DATABASE_SCHEMA_COMPLETE.md` - Complete database schema
- `DOCU/ERD_NORMALIZED_FINAL.md` - Entity relationship diagram
- `DOCU/SYSTEM_MAIN_FLOW.md` - Main system workflow
- `README.md` - Project setup and installation

## Support

For issues or questions:
1. Check the audit logs for error details
2. Verify database connections
3. Check Laravel logs in `storage/logs/`
4. Review browser console for frontend errors
