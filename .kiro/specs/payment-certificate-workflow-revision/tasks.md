# Implementation Plan: Payment Certificate Workflow Revision

## Overview

This implementation plan transitions the land certification system from digital/online workflows to physical/offline processes. The plan follows a 5-phase approach: (1) Database schema updates and data migration, (2) Service layer implementation, (3) Email templates and notifications, (4) Controller and API endpoints, and (5) Frontend components and scheduled tasks. Implementation uses PHP for backend services/controllers and TypeScript for frontend components.

## Tasks

### Phase 1: Database Schema Updates and Data Migration

- [-] 1. Create database migrations for new workflow fields
  - [ ] 1.1 Create migration for payment order fields in payments table
    - Add fields: payment_order_number, payment_order_generated_at, payment_order_pdf_path, treasury_receipt_number, payment_completed_at, payment_completed_by, is_legacy_payment
    - Add indexes for payment_order_number and payment_completed_at
    - Add foreign key constraint for payment_completed_by
    - _Requirements: 2.5, 3.2, 3.3, 3.4, 10.1, 10.2_
  
  - [ ] 1.2 Create migration for certificate collection fields in certificates table
    - Add fields: physical_certificate_number, ready_for_collection_at, ready_for_collection_by, collected_at, collected_by_staff, collection_notes, is_legacy_certificate
    - Add indexes for physical_certificate_number, ready_for_collection_at, collected_at
    - Add foreign key constraints for ready_for_collection_by and collected_by_staff
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 11.1, 11.2_
  
  - [ ] 1.3 Create migration for submission deadline fields in requests table
    - Add fields: submission_deadline, submission_deadline_set_by, requirements_submitted_at, requirements_submitted_by
    - Add indexes for submission_deadline and requirements_submitted_at
    - Add foreign key constraints for submission_deadline_set_by and requirements_submitted_by
    - _Requirements: 7.1, 7.2, 8.1_
  
  - [ ] 1.4 Create migration to update workflow status values
    - Update Report model workflow_status: payment_submitted → payment_order_generated
    - Update Report model workflow_status: payment_verified → payment_completed
    - Update Report model workflow_status: certificate_issued → certificate_ready_for_collection
    - Mark existing payment records with is_legacy_payment = true
    - Mark existing certificate records with is_legacy_certificate = true
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.7, 10.3, 11.3_
  
  - [ ]* 1.5 Write migration tests
    - Test all migrations run successfully without errors
    - Test existing data is preserved with legacy flags set
    - Test new fields are nullable and properly indexed
    - Test status values are updated correctly
    - _Requirements: 10.3, 11.3_

### Phase 2: Service Layer Implementation

- [ ] 2. Implement PaymentOrderService
  - [ ] 2.1 Create PaymentOrderService class with generatePaymentOrder method
    - Generate unique payment order number (format: PO-YYYY-NNNNN)
    - Calculate payment amount based on application details
    - Create payment record with order details
    - Update request status to 'payment_order_generated'
    - Generate payment order PDF document
    - Send PaymentOrderGenerated email with PDF attachment
    - Log payment order generation event
    - Clear dashboard cache
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 15.1_
  
  - [ ]* 2.2 Write property test for PaymentOrderService.generatePaymentOrder
    - **Property 1: Payment Order Generation on Approval**
    - **Validates: Requirements 2.1, 2.5**
    - Generate random approved applications, verify payment order created with unique number and status updated
  
  - [ ]* 2.3 Write property test for payment order required fields
    - **Property 2: Payment Order Required Fields**
    - **Validates: Requirements 2.2**
    - Generate random payment orders, verify all required fields present and non-null
  
  - [ ] 2.4 Implement PaymentOrderService.recordPaymentCompletion method
    - Update payment record with treasury_receipt_number, payment_completed_at, payment_completed_by
    - Update request status to 'payment_completed'
    - Log payment completion event
    - Clear dashboard cache
    - Throw exception if payment already completed
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 15.2_
  
  - [ ]* 2.5 Write property test for payment completion data capture
    - **Property 5: Payment Completion Data Capture**
    - **Validates: Requirements 3.2, 3.3, 3.4**
    - Generate random payment completions, verify all required data captured
  
  - [ ]* 2.6 Write property test for payment completion status update
    - **Property 6: Payment Completion Status Update**
    - **Validates: Requirements 3.5**
    - Generate random payment completions, verify status updated to "payment_completed"
  
  - [ ]* 2.7 Write unit tests for PaymentOrderService
    - Test payment order generation with valid approved application
    - Test rejection when application not approved
    - Test duplicate payment order prevention
    - Test PDF generation success and failure scenarios
    - Test payment completion with valid treasury receipt number
    - Test rejection when payment already completed
    - _Requirements: 2.1, 3.5_

- [ ] 3. Implement CertificateCollectionService
  - [ ] 3.1 Create CertificateCollectionService class with markReadyForCollection method
    - Create certificate record with physical_certificate_number
    - Update certificate with ready_for_collection_at, ready_for_collection_by
    - Update request status to 'certificate_ready_for_collection'
    - Send CertificateReadyForCollection email
    - Log certificate ready event
    - Clear dashboard cache
    - Throw exception if payment not completed
    - _Requirements: 5.1, 5.2, 6.1, 15.3_
  
  - [ ]* 3.2 Write property test for certificate ready email notification
    - **Property 7: Certificate Ready Email Notification**
    - **Validates: Requirements 5.2, 6.1**
    - Generate random certificate ready events, verify email sent
  
  - [ ]* 3.3 Write property test for certificate ready email content
    - **Property 8: Certificate Ready Email Content**
    - **Validates: Requirements 6.2, 6.3, 6.4**
    - Generate random certificate ready emails, verify all required content present
  
  - [ ] 3.4 Implement CertificateCollectionService.recordCollection method
    - Update certificate with collected_at, collected_by_staff, collection_notes
    - Update request status to 'certificate_collected'
    - Log certificate collection event
    - Clear dashboard cache
    - Throw exception if certificate not ready or already collected
    - _Requirements: 5.4, 5.5, 5.6, 5.7, 15.4_
  
  - [ ]* 3.5 Write property test for collection data capture
    - **Property 9: Certificate Collection Data Capture**
    - **Validates: Requirements 5.4, 5.5, 5.6**
    - Generate random certificate collections, verify all required data captured
  
  - [ ]* 3.6 Write property test for collection status update
    - **Property 10: Certificate Collection Status Update**
    - **Validates: Requirements 5.7**
    - Generate random certificate collections, verify status updated to "certificate_collected"
  
  - [ ] 3.7 Implement CertificateCollectionService.getCollectionStats method
    - Return statistics about certificates ready and collected
    - _Requirements: 14.1, 14.4, 14.5_
  
  - [ ]* 3.8 Write unit tests for CertificateCollectionService
    - Test marking certificate ready with valid data
    - Test rejection when payment not completed
    - Test recording collection with valid data
    - Test rejection when certificate not ready
    - Test rejection when certificate already collected
    - _Requirements: 5.1, 5.7_

- [ ] 4. Implement RequirementSubmissionService
  - [ ] 4.1 Create RequirementSubmissionService class with setSubmissionDeadline method
    - Validate deadline is in the future
    - Update request with submission_deadline, submission_deadline_set_by
    - Throw exception if deadline is in the past
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 4.2 Write property test for deadline future validation
    - **Property 11: Submission Deadline Future Validation**
    - **Validates: Requirements 7.3**
    - Generate random past dates, verify deadline setting rejected
  
  - [ ]* 4.3 Write property test for deadline modification
    - **Property 12: Submission Deadline Modification**
    - **Validates: Requirements 7.5**
    - Generate random future deadlines, verify they can be modified
  
  - [ ] 4.4 Implement RequirementSubmissionService.checkAndSubmitDeadlines method
    - Find requests with submission_deadline <= now and status not submitted
    - For each request: update status to 'requirements_submitted', set requirements_submitted_at
    - Send RequirementsAutoSubmitted email to applicant
    - Send notification email to staff
    - Log auto-submission event
    - Handle incomplete requirements with appropriate email flag
    - Return count of submitted requests
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 15.5_
  
  - [ ]* 4.5 Write property test for automatic requirement submission
    - **Property 13: Automatic Requirement Submission**
    - **Validates: Requirements 8.1, 8.2**
    - Generate random requests with past deadlines, verify requirements submitted
  
  - [ ]* 4.6 Write property test for auto-submission email notifications
    - **Property 14: Auto-Submission Email Notifications**
    - **Validates: Requirements 8.3, 8.4**
    - Generate random auto-submissions, verify emails sent to applicant and staff
  
  - [ ]* 4.7 Write property test for auto-submission audit logging
    - **Property 15: Auto-Submission Audit Logging**
    - **Validates: Requirements 8.5**
    - Generate random auto-submissions, verify audit log entries exist
  
  - [ ]* 4.8 Write property test for incomplete submission handling
    - **Property 16: Incomplete Submission Handling**
    - **Validates: Requirements 8.6**
    - Generate random incomplete requests with past deadlines, verify submission occurs with incomplete flag
  
  - [ ] 4.9 Implement RequirementSubmissionService.getUpcomingDeadlines method
    - Return collection of requests with deadlines in next N days
    - _Requirements: 7.4_
  
  - [ ]* 4.10 Write unit tests for RequirementSubmissionService
    - Test setting deadline with future date
    - Test rejection when deadline is in past
    - Test modifying deadline before it occurs
    - Test rejection when modifying past deadline
    - Test auto-submission when deadline reached
    - _Requirements: 7.3, 8.1_

- [ ] 5. Update AuditLogService for new event types
  - [ ] 5.1 Add audit log methods for new workflow events
    - Add logPaymentOrderGenerated method
    - Add logPaymentCompleted method
    - Add logCertificateReady method
    - Add logCertificateCollected method
    - Add logRequirementsAutoSubmitted method
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [ ]* 5.2 Write property test for comprehensive audit logging
    - **Property 28: Comprehensive Audit Logging**
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5**
    - Generate random workflow events, verify audit log entries exist with required details
  
  - [ ]* 5.3 Write unit tests for AuditLogService
    - Test audit log creation for each event type
    - Test audit logs contain required details (timestamp, staff member, event data)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 6. Update DashboardCacheService for new statuses
  - [ ] 6.1 Update dashboard statistics calculation methods
    - Add count for 'payment_order_generated' status
    - Add count for 'payment_completed' status
    - Add count for 'certificate_ready_for_collection' status
    - Add count for 'certificate_collected' status
    - Remove counts for deprecated statuses (payment_submitted, payment_verified, payment_rejected)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  
  - [ ]* 6.2 Write property test for dashboard status count accuracy
    - **Property 27: Dashboard Status Count Accuracy**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**
    - Generate random database states, verify dashboard counts match actual counts
  
  - [ ]* 6.3 Write unit tests for DashboardCacheService
    - Test dashboard counts match database counts for each status
    - Test dashboard updates after workflow transitions
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 7. Checkpoint - Ensure all service layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Email Templates and Notifications

- [ ] 8. Create new email templates
  - [ ] 8.1 Create PaymentOrderGenerated email class and Blade template
    - Include applicant name, request ID, payment order number, amount
    - Attach payment order PDF
    - Include treasury office address, operating hours, payment instructions
    - _Requirements: 2.4, 12.6_
  
  - [ ]* 8.2 Write property test for payment order email notification
    - **Property 4: Payment Order Email Notification**
    - **Validates: Requirements 2.4**
    - Generate random payment orders, verify email sent with PDF attachment
  
  - [ ] 8.3 Create CertificateReadyForCollection email class and Blade template
    - Include applicant name, request ID, certificate number
    - Include CPDO office address, operating hours
    - Include document collection instructions (ID, treasury receipt, authorization letter)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 8.4 Create RequirementsAutoSubmitted email class and Blade template
    - Include applicant name, request ID, submission time
    - Include completion status (complete or incomplete)
    - Include note about incomplete submission if applicable
    - _Requirements: 8.3_
  
  - [ ]* 8.5 Write unit tests for email content
    - Test payment order email contains required information
    - Test certificate ready email contains required information
    - Test auto-submission email indicates completion status
    - _Requirements: 2.4, 6.2, 6.3, 6.4, 8.3_

- [ ] 9. Update existing email templates
  - [ ] 9.1 Update ApplicationApproved email template
    - Remove references to "upload payment receipt"
    - Add information about payment order generation
    - Include treasury payment instructions
    - Mention separate email with payment order document
    - _Requirements: 12.1_
  
  - [ ]* 9.2 Write property test for approval email content
    - **Property 23: Application Approval Email Content**
    - **Validates: Requirements 12.1**
    - Generate random approval emails, verify they mention payment order and treasury
  
  - [ ] 9.3 Update UserRegistrationWelcome email template
    - Remove references to online payment receipt upload
    - Describe treasury-based cash payment process
    - Mention physical certificate collection at CPDO office
    - _Requirements: 12.2_
  
  - [ ]* 9.4 Write property test for welcome email content
    - **Property 24: Welcome Email Content**
    - **Validates: Requirements 12.2**
    - Generate random welcome emails, verify they describe treasury payment process
  
  - [ ]* 9.5 Write property test for deprecated content removal
    - **Property 25: Deprecated Content Removal from Emails**
    - **Validates: Requirements 12.3, 12.4**
    - Generate random emails, verify no deprecated content present
  
  - [ ]* 9.6 Write property test for physical collection references
    - **Property 26: Physical Collection References in Emails**
    - **Validates: Requirements 12.5**
    - Generate random certificate emails, verify they mention CPDO office

- [ ] 10. Remove deprecated email functionality
  - [ ] 10.1 Remove PaymentDueReminder email class
    - Delete app/Mail/PaymentDueReminder.php
    - Delete associated Blade template
    - _Requirements: 13.1, 13.4_
  
  - [ ] 10.2 Update ReminderService to remove payment reminder methods
    - Remove sendPaymentReminders method
    - Remove payment reminder scheduling logic
    - Keep other reminder functionality (document pending, certificate expiry)
    - _Requirements: 13.2, 13.5, 13.6_
  
  - [ ]* 10.3 Write unit tests for email delivery
    - Test email queue processing
    - Test email template rendering with real data
    - Test email delivery failure handling and retry logic
    - _Requirements: 2.4, 6.1, 8.3_

- [ ] 11. Checkpoint - Ensure all email tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Controller and API Endpoints

- [ ] 12. Update PaymentController
  - [ ] 12.1 Remove deprecated payment receipt endpoints
    - Remove POST /payments endpoint (store payment receipt)
    - Remove GET /payments/{id}/download endpoint (download receipt)
    - Ensure endpoints return 404 or are removed from routes
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 12.2 Update GET /payments endpoint for applicant payment page
    - Modify to display payment orders instead of receipt upload form
    - Show payment order download button when available
    - Show payment status (order generated, completed)
    - Display treasury payment instructions
    - _Requirements: 2.3_
  
  - [ ] 12.3 Add GET /payment-orders/{id}/download endpoint
    - Return payment order PDF as binary file response
    - Verify applicant authorization (can only download own payment orders)
    - _Requirements: 2.3_
  
  - [ ]* 12.4 Write property test for payment order download availability
    - **Property 3: Payment Order Download Availability**
    - **Validates: Requirements 2.3**
    - Generate random payment orders, verify download endpoint returns valid PDF
  
  - [ ]* 12.5 Write unit tests for PaymentController
    - Test deprecated endpoints return 404
    - Test payment order download with valid authorization
    - Test payment order download rejects unauthorized access
    - _Requirements: 1.1, 2.3_

- [ ] 13. Create CertificateController
  - [ ] 13.1 Create CertificateController class with index method
    - Display certificate management interface for staff (GET /admin/certificates)
    - List all applications with payment completed
    - Show applicant name, payment completion date, certificate status
    - Provide filters by certificate status (ready, collected)
    - Provide search by applicant name or certificate number
    - _Requirements: 5.1, 5.3_
  
  - [ ] 13.2 Implement markReady method in CertificateController
    - Handle POST /admin/certificates/ready
    - Accept request_id and physical_certificate_number
    - Call CertificateCollectionService.markReadyForCollection
    - Return redirect with success message
    - _Requirements: 5.1_
  
  - [ ] 13.3 Implement recordCollection method in CertificateController
    - Handle POST /admin/certificates/{id}/collect
    - Accept collection_notes
    - Call CertificateCollectionService.recordCollection
    - Return redirect with success message
    - _Requirements: 5.3_
  
  - [ ] 13.4 Implement stats method in CertificateController
    - Handle GET /admin/certificates/stats
    - Call CertificateCollectionService.getCollectionStats
    - Return JSON response with statistics
    - _Requirements: 14.4, 14.5_
  
  - [ ]* 13.5 Write unit tests for CertificateController
    - Test all endpoints return correct responses
    - Test authorization is properly enforced (staff only)
    - Test input validation works correctly
    - _Requirements: 5.1, 5.3_

- [ ] 14. Update AdminController for payment management
  - [ ] 14.1 Add payments method to AdminController
    - Display payment management interface (GET /admin/payments)
    - List all applications with payment orders generated
    - Show payment order number, applicant name, amount, generation date
    - Provide filters by payment status (order generated, completed)
    - Provide search by applicant name or payment order number
    - _Requirements: 3.1_
  
  - [ ] 14.2 Add completePayment method to AdminController
    - Handle POST /admin/payments/{id}/complete
    - Accept treasury_receipt_number
    - Call PaymentOrderService.recordPaymentCompletion
    - Return redirect with success message
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 14.3 Write unit tests for AdminController payment methods
    - Test payment management interface displays correctly
    - Test payment completion with valid data
    - Test authorization is properly enforced (staff only)
    - _Requirements: 3.1_

- [ ] 15. Update RequestController for deadline management
  - [ ] 15.1 Add setDeadline method to RequestController
    - Handle POST /admin/requests/{id}/deadline
    - Accept submission_deadline (datetime)
    - Call RequirementSubmissionService.setSubmissionDeadline
    - Return redirect with success message
    - _Requirements: 7.1, 7.2_
  
  - [ ] 15.2 Add manualSubmit method to RequestController
    - Handle POST /admin/requests/{id}/submit
    - Call RequirementSubmissionService.manuallySubmitRequirements
    - Return redirect with success message
    - _Requirements: 8.1_
  
  - [ ]* 15.3 Write unit tests for RequestController deadline methods
    - Test deadline setting with valid future date
    - Test deadline setting rejects past dates
    - Test manual submission works correctly
    - Test authorization is properly enforced (staff only)
    - _Requirements: 7.1, 7.3_

- [ ] 16. Update route definitions
  - [ ] 16.1 Update routes/web.php with new endpoints
    - Remove deprecated payment receipt routes
    - Add payment order download route
    - Add certificate management routes
    - Add payment management routes
    - Add deadline management routes
    - Apply appropriate middleware (auth, role)
    - _Requirements: 1.1, 2.3, 3.1, 5.1, 7.1_
  
  - [ ]* 16.2 Write route tests
    - Test all new routes are accessible with correct authorization
    - Test deprecated routes return 404
    - Test unauthorized access is rejected
    - _Requirements: 1.1, 2.3, 3.1, 5.1, 7.1_

- [ ] 17. Checkpoint - Ensure all controller tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: Frontend Components and Scheduled Tasks

- [ ] 18. Update applicant dashboard components (TypeScript/React)
  - [ ] 18.1 Update payment section in applicant dashboard
    - Remove payment receipt upload form
    - Display payment order download button when available
    - Show payment status: "Payment Order Generated" or "Payment Completed"
    - Display treasury payment instructions
    - _Requirements: 1.1, 2.3_
  
  - [ ] 18.2 Update certificate section in applicant dashboard
    - Remove certificate PDF download button
    - Display collection status: "Ready for Collection" or "Collected"
    - Show CPDO office address and operating hours when ready
    - Display physical certificate number
    - _Requirements: 4.2, 4.3, 6.5_
  
  - [ ] 18.3 Add submission deadline display to applicant dashboard
    - Display submission deadline if configured
    - Show countdown timer to deadline
    - Display submission status after auto-submission
    - _Requirements: 7.4_

- [ ] 19. Create staff admin interfaces (TypeScript/React)
  - [ ] 19.1 Create payment management interface component
    - List applications with payment orders generated
    - Display payment order number, applicant name, amount, generation date
    - Provide "Mark as Completed" button for each payment
    - Modal form to enter treasury receipt number
    - Filters by payment status (order generated, completed)
    - Search by applicant name or payment order number
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 19.2 Create certificate management interface component
    - List applications with payment completed
    - Display applicant name, payment completion date, certificate status
    - Provide "Mark Ready for Collection" button with form for physical certificate number
    - Provide "Record Collection" button for ready certificates with form for collection notes
    - Filters by certificate status (ready, collected)
    - Search by applicant name or certificate number
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6_
  
  - [ ] 19.3 Create deadline configuration interface component
    - Date and time picker for submission deadline
    - Validation to ensure future date
    - Display current deadline if set
    - Option to modify deadline before it occurs
    - List of upcoming deadlines across all applications
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ] 20. Update dashboard statistics components (TypeScript/React)
  - [ ] 20.1 Update dashboard statistics display
    - Add count for 'payment_order_generated' status
    - Add count for 'payment_completed' status
    - Add count for 'certificate_ready_for_collection' status
    - Add count for 'certificate_collected' status
    - Remove counts for deprecated statuses
    - _Requirements: 14.2, 14.3, 14.4, 14.5, 14.6_

- [ ] 21. Create scheduled task for deadline checking
  - [ ] 21.1 Create CheckSubmissionDeadlines console command
    - Implement handle method that calls RequirementSubmissionService.checkAndSubmitDeadlines
    - Display count of auto-submitted applications
    - Log execution results
    - _Requirements: 8.7_
  
  - [ ] 21.2 Configure cron schedule in app/Console/Kernel.php
    - Schedule command to run every 15 minutes
    - Add withoutOverlapping() to prevent concurrent executions
    - Add runInBackground() for non-blocking execution
    - _Requirements: 8.7_
  
  - [ ]* 21.3 Write unit tests for CheckSubmissionDeadlines command
    - Test command executes successfully
    - Test command calls service method
    - Test command logs results
    - _Requirements: 8.7_

- [ ] 22. Write property-based tests for workflow sequences
  - [ ]* 22.1 Write property test for workflow status migration
    - **Property 17: Workflow Status Migration**
    - **Validates: Requirements 9.7**
    - Generate random existing records, verify no old status values remain after migration
  
  - [ ]* 22.2 Write property test for workflow sequence ordering
    - **Property 18: Workflow Sequence Ordering**
    - **Validates: Requirements 9.8**
    - Generate random workflow progressions, verify status transitions follow correct sequence
  
  - [ ]* 22.3 Write property test for historical payment data preservation
    - **Property 19: Historical Payment Data Preservation**
    - **Validates: Requirements 10.3**
    - Generate random existing payment records, verify all data preserved after migration
  
  - [ ]* 22.4 Write property test for deprecated payment workflow prevention
    - **Property 20: Deprecated Payment Workflow Prevention**
    - **Validates: Requirements 10.4**
    - Generate random attempts to use old payment workflow, verify they are rejected
  
  - [ ]* 22.5 Write property test for historical certificate data preservation
    - **Property 21: Historical Certificate Data Preservation**
    - **Validates: Requirements 11.3**
    - Generate random existing certificate records, verify all data preserved after migration
  
  - [ ]* 22.6 Write property test for certificate PDF generation prevention
    - **Property 22: Certificate PDF Generation Prevention**
    - **Validates: Requirements 11.4**
    - Generate random attempts to generate certificate PDFs, verify they are rejected

- [ ] 23. Write end-to-end integration tests
  - [ ]* 23.1 Write end-to-end test for complete workflow
    - Test workflow from application approval to certificate collection
    - Test payment order generation → payment completion → certificate ready → certificate collection
    - Verify all status transitions occur correctly
    - Verify all emails are sent
    - Verify all audit logs are created
    - _Requirements: 9.8_
  
  - [ ]* 23.2 Write end-to-end test for deadline workflow
    - Test deadline setting → auto-submission → email notifications
    - Verify auto-submission occurs at correct time
    - Verify emails sent to applicant and staff
    - Verify audit log created
    - _Requirements: 7.1, 8.1, 8.3, 8.4, 8.5_
  
  - [ ]* 23.3 Write end-to-end test for error recovery scenarios
    - Test payment completion failure recovery
    - Test email delivery failure handling
    - Test scheduled task failure handling
    - _Requirements: 3.5, 8.7_

- [ ] 24. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at phase boundaries
- Property tests validate universal correctness properties (100+ iterations each)
- Unit tests validate specific examples and edge cases
- Implementation uses PHP for backend (Laravel services, controllers, migrations) and TypeScript for frontend (React/Inertia.js components)
- All 28 correctness properties from the design document are covered by property-based tests
- Historical data preservation is critical - all migrations must mark existing records with legacy flags
- Email delivery failures should not block workflow operations - implement queue with retry logic
- Scheduled task must use withoutOverlapping() to prevent concurrent executions
- Dashboard statistics should be cached for performance - clear cache on workflow transitions
