# Admin Payment Confirmation - Requirements

## Overview
Implement a system for CPDO admins to manually record and verify payments made by applicants at the Treasury Office. This enables the workflow to continue after payment verification.

## User Story
**As an** Admin  
**I want to** record payments that applicants made at the Treasury Office  
**So that** the application process can continue and certificates can be generated

## Background
- Applicants pay at the Treasury Office (near CPDO)
- They receive an Official Receipt (OR) from Treasury
- They bring the OR to CPDO office
- Admin needs to verify the OR and record it in the system

## Functional Requirements

### FR1: View Payments Pending
- **FR1.1**: Admin can see a list of all approved applications awaiting payment
- **FR1.2**: List shows: Request ID, Applicant Name, Amount Due, Approval Date, Days Since Approval
- **FR1.3**: List is sortable by date, amount, applicant name
- **FR1.4**: List is searchable by request ID or applicant name
- **FR1.5**: Display count of pending payments

### FR2: Record Payment
- **FR2.1**: Admin can click "Record Payment" on any pending payment request
- **FR2.2**: System displays a form with:
  - Request details (read-only): Request ID, Applicant Name, Expected Amount
  - Official Receipt Number (required, text input)
  - Payment Amount (required, number input, pre-filled with expected amount)
  - Payment Date (required, date picker, defaults to today)
  - Payment Method (required, dropdown: Cash, Check, Bank Transfer, GCash, PayMaya, Other)
  - Check Number (conditional, shown only if payment method is "Check")
  - Reference Number (conditional, shown for Bank Transfer, GCash, PayMaya)
  - Notes (optional, textarea)
  - Receipt Upload (optional, image/PDF upload)

### FR3: Payment Validation
- **FR3.1**: System validates OR number is not empty
- **FR3.2**: System checks if OR number was already used (warn if duplicate)
- **FR3.3**: System validates payment amount is greater than 0
- **FR3.4**: System warns if payment amount differs from expected amount
- **FR3.5**: System validates payment date isi not in the future
- **FR3.6**: Admin can proceed despite warnings after confirmation

### FR4: Payment Confirmation
- **FR4.1**: After clicking "Confirm Payment", system shows confirmation dialog
- **FR4.2**: Dialog displays summary: OR Number, Amount, Date, Payment Method
- **FR4.3**: Admin confirms or cancels
- **FR4.4**: On confirmation:
  - Payment record created with status "verified"
  - Payment marked as verified_by current admin
  - Request status updated to "payment_confirmed"
  - Timestamp recorded for verification
  - Applicant notified via email/SMS

### FR5: Payment History
- **FR5.1**: Admin can view all payment records
- **FR5.2**: Payment list shows: OR Number, Request ID, Applicant, Amount, Date, Verified By, Status
- **FR5.3**: Filter by: Status (Verified/Rejected), Date Range, Payment Method
- **FR5.4**: Search by: OR Number, Request ID, Applicant Name
- **FR5.5**: Export to Excel/PDF

### FR6: View Payment Details
- **FR6.1**: Admin can click on any payment to view full details
- **FR6.2**: Details include:
  - All payment information
  - Uploaded receipt (if any)
  - Who verified the payment
  - When it was verified
  - Full audit trail

### FR7: Payment Rejection (Optional - for future)
- **FR7.1**: Admin can reject a payment record with reason
- **FR7.2**: Rejected payment requires re-submission

### FR8: Notifications
- **FR8.1**: After payment confirmation, applicant receives:
  - Email with payment confirmation
  - SMS notification (if enabled)
  - In-app notification
- **FR8.2**: Notification includes: OR Number, Amount, Date, Next steps

### FR9: Dashboard Integration
- **FR9.1**: Admin dashboard shows "Payments Pending" widget
- **FR9.2**: Widget displays count and quick link to pending payments
- **FR9.3**: Dashboard shows recent payment activity

## Non-Functional Requirements

### NFR1: Security
- Only Admin and Super Admin roles can record payments
- All payment actions are logged in audit trail
- Uploaded receipts are securely stored
- Sensitive payment data is encrypted

### NFR2: Performance
- Payment list loads within 2 seconds
- Search results appear within 1 second
- Payment confirmation processes within 3 seconds

### NFR3: Usability
- Interface is clean and easy to use
- Form has clear labels and help text
- Validation errors are clear and actionable
- Mobile-responsive for tablet use

### NFR4: Data Integrity
- No duplicate OR numbers allowed
- Payment amounts cannot be negative
- All payment transactions are atomic
- Payment records are immutable once verified

## Business Rules

### BR1: Payment Amount
- Payment amount can be adjusted by admin if needed
- If amount differs from expected, admin must provide note
- Partial payments not allowed (must pay full amount)

### BR2: Official Receipt
- OR number must be unique per payment
- OR number format can be any alphanumeric string
- System warns but doesn't block if OR already exists

### BR3: Payment Date
- Payment date cannot be in the future
- Payment date should be within reasonable time (e.g., last 30 days)
- System warns if payment date is too old

### BR4: Request Status Flow
```
approved → awaiting_payment → payment_confirmed → certificate_generation
```

### BR5: Verification
- All manually entered payments are automatically "verified"
- Verified_by is set to current admin user
- Verified_at is set to current timestamp

## Acceptance Criteria

### AC1: Payments Pending List
```gherkin
Given I am logged in as an Admin
When I navigate to the Payments section
Then I should see a list of all approved applications awaiting payment
And each item shows Request ID, Applicant Name, Amount Due, and Days Waiting
```

### AC2: Record Payment Success
```gherkin
Given an approved application is awaiting payment
When I click "Record Payment"
And I enter valid OR number, amount, and date
And I click "Confirm Payment"
Then the payment should be saved as verified
And the request status should update to "payment_confirmed"
And the applicant should receive a confirmation notification
```

### AC3: Duplicate OR Warning
```gherkin
Given an OR number "OR-12345" already exists in the system
When I try to record a new payment with OR number "OR-12345"
Then I should see a warning "This OR number has already been used"
And I can choose to proceed or cancel
```

### AC4: Payment History View
```gherkin
Given there are payment records in the system
When I navigate to Payment History
Then I should see all payment records sorted by date (newest first)
And I can filter by status, date range, or payment method
And I can search by OR number or applicant name
```

## Out of Scope (Future Enhancements)
- QR code scanning for OR
- Integration with Treasury Office system
- Automated payment verification via API
- Installment payments
- Refund processing
- Payment voucher generation

## Dependencies
- Payment table already exists in database
- Request model and status flow
- Email/SMS notification service
- File upload service for receipt images

## Success Metrics
- Time to record payment: < 2 minutes per payment
- Payment recording accuracy: > 99%
- Admin user satisfaction: > 4/5 rating
- Reduction in payment processing errors
