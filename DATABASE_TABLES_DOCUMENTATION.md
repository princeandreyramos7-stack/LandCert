# CPDO Locational Clearance System - Database Schema Documentation

## Complete Database Table Specifications

**Database Name:** `u988863428_zone_clear` (Production) / `zoning_compliance` (Development)  
**Database Engine:** MySQL/MariaDB  
**Total Tables:** 32  
**Documentation Date:** September 7, 2026

---

## Table Categories

1. **Identity & User Management** (4 tables)
2. **Core Application Domain** (6 tables)
3. **Workflow & Processing** (4 tables)
4. **Role-Based Access Control** (5 tables)
5. **Communications & Notifications** (3 tables)
6. **Audit & System Configuration** (3 tables)
7. **Laravel Framework** (7 tables)

---

# 1. IDENTITY & USER MANAGEMENT

## Table 1-1. users

**Purpose:** Central table for all system users (applicants, staff, admin, super admin)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | INT(10) UNSIGNED | 1 |
| UK | email | VARCHAR(255) | juan.delacruz@gmail.com |
| | name | VARCHAR(255) | Juan Dela Cruz |
| | password | VARCHAR(255) | $2y$12$... (hashed) |
| | contact_number | VARCHAR(20) | 09171234567 |
| | address | TEXT | 123 Main St, Ilagan |
| | avatar_path | VARCHAR(255) | avatars/user_1.jpg |
| | user_type | ENUM('applicant', 'staff', 'admin', 'super_admin') | applicant |
| | signature_path | VARCHAR(255) | signatures/admin_sig.png |
| | signature_url | VARCHAR(255) | /images/E-signitures/... |
| | email_verified_at | TIMESTAMP NULL | 2026-09-07 10:30:00 |
| | remember_token | VARCHAR(100) NULL | xyz123abc... |
| | deleted_at | TIMESTAMP NULL | NULL |
| | created_at | TIMESTAMP | 2026-09-01 09:00:00 |
| | updated_at | TIMESTAMP | 2026-09-07 10:30:00 |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `email`
- INDEX: `deleted_at`

**Notes:**
- Supports soft deletes
- Default user_type: 'applicant'
- signature_url added for e-signature feature

---

## Table 1-2. applicants

**Purpose:** Profile information for applicants (1:1 relationship with users)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK, UK | user_id | INT(10) UNSIGNED | 1 |
| | applicant_name | VARCHAR(255) | Juan Dela Cruz |
| | applicant_address | TEXT | 123 Main St, Brgy. Centro |
| | applicant_contact | VARCHAR(20) | 09171234567 |
| | applicant_type | ENUM('individual', 'corporate') | individual |
| | deleted_at | TIMESTAMP NULL | NULL |
| | created_at | TIMESTAMP | 2026-09-01 09:05:00 |
| | updated_at | TIMESTAMP | 2026-09-01 09:05:00 |

**Foreign Keys:**
- `user_id` REFERENCES `users(id)` ON DELETE SET NULL

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `user_id`
- INDEX: `deleted_at`

**Notes:**
- Default applicant_type: 'individual'
- Enforces 1:1 relationship with users table

---

## Table 1-3. normalized_corporations

**Purpose:** Corporate details for business applicants

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK, UK | applicant_id | BIGINT(20) UNSIGNED | 1 |
| | corporation_name | VARCHAR(255) | ABC Construction Inc. |
| | corporation_address | TEXT | 456 Business Ave, Ilagan |
| | registration_number | VARCHAR(100) | CS201234567 |
| | tin | VARCHAR(50) | 123-456-789-000 |
| | created_at | TIMESTAMP | 2026-09-01 09:10:00 |
| | updated_at | TIMESTAMP | 2026-09-01 09:10:00 |

**Foreign Keys:**
- `applicant_id` REFERENCES `applicants(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `applicant_id`

**Notes:**
- Only populated when applicant_type = 'corporate'
- Enforces 1:1 with applicants table

---

## Table 1-4. representatives

**Purpose:** Authorized representatives for applicants

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK | applicant_id | BIGINT(20) UNSIGNED | 1 |
| | representative_name | VARCHAR(255) | Maria Santos |
| | representative_address | TEXT | 789 Rep St, Ilagan |
| | representative_email | VARCHAR(255) | maria@example.com |
| | representative_contact | VARCHAR(20) | 09181234567 |
| | authorization_letter_path | VARCHAR(255) | auth_letters/rep_1.pdf |
| | relationship | VARCHAR(100) | Attorney |
| | is_primary | TINYINT(1) | 1 |
| | created_at | TIMESTAMP | 2026-09-01 09:15:00 |
| | updated_at | TIMESTAMP | 2026-09-01 09:15:00 |

**Foreign Keys:**
- `applicant_id` REFERENCES `applicants(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `applicant_id`

**Notes:**
- One applicant can have multiple representatives
- is_primary: 1 = primary contact, 0 = alternate

---

# 2. CORE APPLICATION DOMAIN

## Table 2-1. requests

**Purpose:** Main application/request for locational clearance (aggregate root)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| UK | application_number | VARCHAR(50) | APP-2026-09-0001 |
| UK | decision_number | VARCHAR(50) | DN-2026-09-0001 |
| FK | applicant_id | BIGINT(20) UNSIGNED | 1 |
| FK | user_id | INT(10) UNSIGNED | 1 |
| | status | VARCHAR(50) | pending |
| | has_written_notice | ENUM('yes', 'no') | no |
| | has_similar_application | ENUM('yes', 'no') | no |
| | preferred_release_mode | ENUM('pickup', 'mail_applicant', 'mail_representative', 'mail_other') | pickup |
| | release_address | TEXT NULL | 123 Main St, Ilagan |
| | submission_deadline | TIMESTAMP NULL | 2026-09-15 17:00:00 |
| FK | submission_deadline_set_by | INT(10) UNSIGNED NULL | 2 |
| | requirements_submitted_at | TIMESTAMP NULL | 2026-09-05 14:30:00 |
| FK | requirements_submitted_by | INT(10) UNSIGNED NULL | 1 |
| | verified_requirements | JSON NULL | {"requirement_1": true, ...} |
| | released_to_applicant_at | TIMESTAMP NULL | 2026-09-20 10:00:00 |
| FK | released_by | INT(10) UNSIGNED NULL | 3 |
| | deleted_at | TIMESTAMP NULL | NULL |
| | created_at | TIMESTAMP | 2026-09-01 10:00:00 |
| | updated_at | TIMESTAMP | 2026-09-07 11:00:00 |

**Foreign Keys:**
- `applicant_id` REFERENCES `applicants(id)` ON DELETE CASCADE
- `user_id` REFERENCES `users(id)` ON DELETE SET NULL
- `submission_deadline_set_by` REFERENCES `users(id)` ON DELETE SET NULL
- `requirements_submitted_by` REFERENCES `users(id)` ON DELETE SET NULL
- `released_by` REFERENCES `users(id)` ON DELETE SET NULL

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `application_number`, `decision_number`
- COMPOSITE: `(status, created_at)`, `(user_id, status)`
- INDEX: `deleted_at`

**Status Values:**
- `pending` - Initial submission
- `approved` - Approved by administrator
- `rejected` - Rejected by administrator
- `payment_confirmed` - Payment verified
- `certificate_preparing` - Certificate being generated
- `certificate_ready` - Ready for pickup/delivery
- `released` - Certificate released to applicant

**Notes:**
- Aggregate root for application workflow
- application_number auto-generated on creation
- decision_number assigned upon approval

---

## Table 2-2. normalized_projects

**Purpose:** Project details for each request (1:1 relationship)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK, UK | request_id | BIGINT(20) UNSIGNED | 1 |
| | project_type | VARCHAR(255) | Residential Construction |
| | project_nature | VARCHAR(255) | New Building Construction |
| | project_nature_duration | ENUM('Permanent', 'Temporary') | Permanent |
| | project_nature_years | INT NULL | NULL |
| | project_cost | DECIMAL(15,2) | 5000000.00 |
| | project_description | TEXT | Two-story residential house |
| | created_at | TIMESTAMP | 2026-09-01 10:05:00 |
| | updated_at | TIMESTAMP | 2026-09-01 10:05:00 |

**Foreign Keys:**
- `request_id` REFERENCES `requests(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `request_id`

**Notes:**
- One request has exactly one project
- project_nature_years used when duration = 'Temporary'

---

## Table 2-3. properties

**Purpose:** Land/property information for each request (1:1 relationship)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK, UK | request_id | BIGINT(20) UNSIGNED | 1 |
| | lot_area_sqm | DECIMAL(10,2) | 500.00 |
| | bldg_improvement_sqm | DECIMAL(10,2) NULL | 150.00 |
| | lot_number | VARCHAR(100) | Lot 123, Block 45 |
| | tax_declaration_no | VARCHAR(100) | TD-2026-001234 |
| | zone_classification | VARCHAR(100) | Residential Zone A |
| | title_number | VARCHAR(100) | TCT-12345 |
| | right_over_land | ENUM('Owner', 'Lessee') | Owner |
| | existing_land_use | ENUM('Residential', 'Institutional', 'Commercial', 'Industrial', 'Tenanted', 'Vacant', 'Agricultural', 'Not Tenanted') | Vacant |
| | created_at | TIMESTAMP | 2026-09-01 10:10:00 |
| | updated_at | TIMESTAMP | 2026-09-01 10:10:00 |

**Foreign Keys:**
- `request_id` REFERENCES `requests(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `request_id`

**Notes:**
- One request has exactly one property
- bldg_improvement_sqm can be NULL for vacant lots

---

## Table 2-4. locations

**Purpose:** Geographic location details for each request (1:1 relationship)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK, UK | request_id | BIGINT(20) UNSIGNED | 1 |
| | street_address | VARCHAR(255) | 123 Main Street |
| | barangay | VARCHAR(100) | Centro |
| | city_municipality | VARCHAR(100) | Ilagan City |
| | province | VARCHAR(100) | Isabela |
| | postal_code | VARCHAR(10) | 3300 |
| | district | VARCHAR(50) | District 1 |
| | created_at | TIMESTAMP | 2026-09-01 10:15:00 |
| | updated_at | TIMESTAMP | 2026-09-01 10:15:00 |

**Foreign Keys:**
- `request_id` REFERENCES `requests(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `request_id`

**Notes:**
- One request has exactly one location
- All address fields are required

---

## Table 2-5. requirement_documents

**Purpose:** Uploaded document files for each request

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK | request_id | BIGINT(20) UNSIGNED | 1 |
| | requirement_id | INT | 1 |
| | requirement_name | VARCHAR(255) | Location Plan |
| | file_path | VARCHAR(500) | requirements/req_1_doc.pdf |
| | original_filename | VARCHAR(255) | location_plan.pdf |
| | mime_type | VARCHAR(100) | application/pdf |
| | file_size | INT | 2048576 |
| | created_at | TIMESTAMP | 2026-09-01 10:20:00 |
| | updated_at | TIMESTAMP | 2026-09-01 10:20:00 |

**Foreign Keys:**
- `request_id` REFERENCES `requests(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `id`
- COMPOSITE: `(request_id, requirement_id)`

**Notes:**
- One request can have multiple documents
- file_size in bytes
- Stores full file metadata

---

## Table 2-6. reports

**Purpose:** Evaluation reports created by zoning officers

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | report_id | INT(10) UNSIGNED | 1 |
| FK | request_id | BIGINT(20) UNSIGNED | 1 |
| | description | TEXT NULL | Property complies with zoning |
| | payment_amount | DECIMAL(10,2) NULL | 5000.00 |
| | requirements | JSON NULL | {"req_1": true, "req_2": true} |
| | admin_notes | TEXT NULL | All documents verified |
| | evaluation | ENUM('pending', 'approved', 'rejected', 'reviewed') | pending |
| | approved_by | VARCHAR(255) NULL | Admin User |
| | approved_at | TIMESTAMP NULL | 2026-09-05 14:00:00 |
| | date_certified | DATE NULL | 2026-09-05 |
| | amount | DECIMAL(12,2) NULL | 5000.00 |
| | date_reported | DATETIME NULL | 2026-09-05 14:00:00 |
| | issued_by | VARCHAR(255) NULL | Zoning Officer |
| | reviewed_by | BIGINT NULL | 3 |
| | created_at | TIMESTAMP | 2026-09-02 11:00:00 |
| | updated_at | TIMESTAMP | 2026-09-05 14:00:00 |

**Foreign Keys:**
- `request_id` REFERENCES `requests(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `report_id`
- INDEX: `request_id`

**Notes:**
- One request can have multiple reports (revisions)
- evaluation stays 'approved' once approved
- Legacy columns: approved_by, issued_by (VARCHAR instead of FK)

---

# 3. WORKFLOW & PROCESSING

## Table 3-1. payments

**Purpose:** Payment records and verification

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK | request_id | BIGINT(20) UNSIGNED | 1 |
| FK | user_id | INT(10) UNSIGNED NULL | 1 |
| | amount | DECIMAL(10,2) | 5000.00 |
| | payment_method | ENUM('cash') | cash |
| | receipt_number | VARCHAR(100) NULL | OR-2026-001234 |
| | receipt_file_path | VARCHAR(255) NULL | receipts/receipt_1.jpg |
| | payment_date | DATE | 2026-09-06 |
| | payment_status | ENUM('pending', 'verified', 'rejected') | pending |
| FK | verified_by | INT(10) UNSIGNED NULL | 2 |
| | verified_at | TIMESTAMP NULL | 2026-09-06 15:00:00 |
| | rejection_reason | TEXT NULL | NULL |
| | is_legacy_payment | TINYINT(1) | 0 |
| | deleted_at | TIMESTAMP NULL | NULL |
| | created_at | TIMESTAMP | 2026-09-06 10:00:00 |
| | updated_at | TIMESTAMP | 2026-09-06 15:00:00 |

**Foreign Keys:**
- `request_id` REFERENCES `requests(id)` ON DELETE CASCADE
- `user_id` REFERENCES `users(id)` ON DELETE SET NULL
- `verified_by` REFERENCES `users(id)` ON DELETE SET NULL

**Indexes:**
- PRIMARY KEY: `id`
- COMPOSITE: `(payment_status, payment_date)`, `(request_id, payment_status)`, `(user_id, payment_date)`
- INDEX: `deleted_at`

**Check Constraints:**
- `amount > 0`
- `payment_status = 'verified'` requires `verified_by` AND `verified_at`
- `payment_status = 'rejected'` requires `rejection_reason`

**Notes:**
- payment_method: Only 'cash' after gateway removal
- Default status: 'pending'
- Supports soft deletes

---

## Table 3-2. certificates

**Purpose:** Certificate generation, tracking and release

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK | request_id | BIGINT(20) UNSIGNED | 1 |
| FK | user_id | INT(10) UNSIGNED | 1 |
| FK, UK | payment_id | BIGINT(20) UNSIGNED | 1 |
| UK | certificate_number | VARCHAR(50) | CERT-2026-09-0001 |
| | physical_certificate_number | VARCHAR(50) NULL | CZ-2026-001 |
| | status | ENUM('preparing', 'ready_for_pickup', 'released', 'cancelled') | preparing |
| | ready_for_collection_at | TIMESTAMP NULL | 2026-09-10 09:00:00 |
| FK | ready_for_collection_by | INT(10) UNSIGNED NULL | 2 |
| | collected_at | TIMESTAMP NULL | 2026-09-12 10:30:00 |
| FK | collected_by_staff | INT(10) UNSIGNED NULL | 2 |
| FK | issued_by | INT(10) UNSIGNED NULL | 3 |
| | issued_at | TIMESTAMP NULL | 2026-09-10 09:00:00 |
| | released_at | TIMESTAMP NULL | 2026-09-12 10:30:00 |
| FK | released_by | INT(10) UNSIGNED NULL | 2 |
| | released_to_name | VARCHAR(255) NULL | Juan Dela Cruz |
| | released_to_id_type | VARCHAR(50) NULL | Driver's License |
| | released_to_id_number | VARCHAR(100) NULL | N01-12-345678 |
| | release_signature_path | VARCHAR(255) NULL | signatures/release_1.png |
| | valid_until | DATE NULL | 2027-09-10 |
| | is_legacy_certificate | TINYINT(1) | 0 |
| | deleted_at | TIMESTAMP NULL | NULL |
| | created_at | TIMESTAMP | 2026-09-08 11:00:00 |
| | updated_at | TIMESTAMP | 2026-09-12 10:30:00 |

**Foreign Keys:**
- `request_id` REFERENCES `requests(id)` ON DELETE CASCADE
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE
- `ready_for_collection_by` REFERENCES `users(id)` ON DELETE SET NULL
- `collected_by_staff` REFERENCES `users(id)` ON DELETE SET NULL
- `issued_by` REFERENCES `users(id)` ON DELETE SET NULL
- `released_by` REFERENCES `users(id)` ON DELETE SET NULL

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `certificate_number`, `payment_id`
- COMPOSITE: `(status, issued_at)`, `(request_id, status)`
- INDEX: `deleted_at`

**Notes:**
- One certificate per payment (1:1)
- Default status: 'preparing'
- Tracks complete lifecycle from generation to release
- physical_certificate_number: Manual number (e.g., CZ, CZC, TUP, SUP)

---

## Table 3-3. request_timeline

**Purpose:** Complete audit trail for each request (visible to applicants)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK | request_id | BIGINT(20) UNSIGNED | 1 |
| | event_type | VARCHAR(50) | status_change |
| | old_status | VARCHAR(50) NULL | pending |
| | new_status | VARCHAR(50) NULL | approved |
| | title | VARCHAR(255) | Application Approved |
| | description | TEXT NULL | Your application has been approved |
| | metadata | JSON NULL | {"decision_number": "DN-2026-..."} |
| FK | user_id | INT(10) UNSIGNED NULL | 3 |
| | user_role | VARCHAR(50) NULL | super_admin |
| | visible_to_applicant | TINYINT(1) | 1 |
| | created_at | TIMESTAMP | 2026-09-05 14:00:00 |
| | updated_at | TIMESTAMP | 2026-09-05 14:00:00 |

**Foreign Keys:**
- `request_id` REFERENCES `requests(id)` ON DELETE CASCADE
- `user_id` REFERENCES `users(id)` ON DELETE SET NULL

**Indexes:**
- PRIMARY KEY: `id`
- COMPOSITE: `(request_id, created_at)`, `(request_id, event_type)`

**Event Types:**
- `submitted`, `status_change`, `document_uploaded`, `payment_submitted`, `payment_verified`, `certificate_ready`, `released`

**Notes:**
- Separate from audit_logs (this is applicant-visible)
- visible_to_applicant: 1 = shown in applicant's timeline, 0 = internal only

---

## Table 3-4. audit_logs

**Purpose:** System-wide audit trail (all model changes)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK | user_id | INT(10) UNSIGNED NULL | 2 |
| | action | VARCHAR(255) | updated |
| | model_type | VARCHAR(255) | App\Models\Request |
| | model_id | BIGINT | 1 |
| | old_values | JSON NULL | {"status": "pending"} |
| | new_values | JSON NULL | {"status": "approved"} |
| | metadata | JSON NULL | {"ip": "192.168.1.1"} |
| | ip_address | VARCHAR(45) | 192.168.1.1 |
| | user_agent | TEXT NULL | Mozilla/5.0... |
| | created_at | TIMESTAMP | 2026-09-05 14:00:00 |
| | updated_at | TIMESTAMP | 2026-09-05 14:00:00 |

**Foreign Keys:**
- `user_id` REFERENCES `users(id)` ON DELETE SET NULL

**Indexes:**
- PRIMARY KEY: `id`
- COMPOSITE: `(user_id, created_at)`, `(model_type, model_id)`

**Notes:**
- Automatically logged for all CRUD operations
- Stores complete old/new values
- Used for admin audit review only

---

# 4. ROLE-BASED ACCESS CONTROL (RBAC)

## Table 4-1. roles

**Purpose:** User roles (Spatie Laravel-Permission)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| UK | name | VARCHAR(255) | admin |
| UK | guard_name | VARCHAR(255) | web |
| | created_at | TIMESTAMP | 2026-09-01 08:00:00 |
| | updated_at | TIMESTAMP | 2026-09-01 08:00:00 |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `(name, guard_name)`

**Seeded Roles:**
1. applicant
2. admin
3. super_admin

**Notes:**
- guard_name: Always 'web' for this system

---

## Table 4-2. permissions

**Purpose:** System permissions (Spatie Laravel-Permission)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| UK | name | VARCHAR(255) | view applications |
| UK | guard_name | VARCHAR(255) | web |
| | created_at | TIMESTAMP | 2026-09-01 08:00:00 |
| | updated_at | TIMESTAMP | 2026-09-01 08:00:00 |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `(name, guard_name)`

**Seeded Permissions:**
1. view applications
2. create applications
3. edit applications
4. delete applications
5. manage reports
6. approve applications
7. reject applications

---

## Table 4-3. role_has_permissions

**Purpose:** Pivot table linking roles to permissions

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK, FK | permission_id | BIGINT(20) UNSIGNED | 1 |
| PK, FK | role_id | BIGINT(20) UNSIGNED | 2 |

**Foreign Keys:**
- `permission_id` REFERENCES `permissions(id)` ON DELETE CASCADE
- `role_id` REFERENCES `roles(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `(permission_id, role_id)`

**Notes:**
- Many-to-many relationship
- Defines which permissions each role has

---

## Table 4-4. model_has_roles

**Purpose:** Polymorphic table assigning roles to models (users)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK, FK | role_id | BIGINT(20) UNSIGNED | 2 |
| PK | model_type | VARCHAR(255) | App\Models\User |
| PK | model_id | BIGINT(20) UNSIGNED | 1 |

**Foreign Keys:**
- `role_id` REFERENCES `roles(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `(role_id, model_type, model_id)`
- INDEX: `(model_id, model_type)`

**Notes:**
- Polymorphic many-to-many
- Typically model_type = 'App\Models\User'

---

## Table 4-5. model_has_permissions

**Purpose:** Polymorphic table for direct permission assignment (bypasses roles)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK, FK | permission_id | BIGINT(20) UNSIGNED | 1 |
| PK | model_type | VARCHAR(255) | App\Models\User |
| PK | model_id | BIGINT(20) UNSIGNED | 1 |

**Foreign Keys:**
- `permission_id` REFERENCES `permissions(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `(permission_id, model_type, model_id)`
- INDEX: `(model_id, model_type)`

**Notes:**
- Allows assigning permissions directly to users
- Rarely used (permissions typically assigned via roles)

---

# 5. COMMUNICATIONS & NOTIFICATIONS

## Table 5-1. notifications

**Purpose:** In-app notifications for users

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK | user_id | INT(10) UNSIGNED | 1 |
| | type | VARCHAR(255) | payment_pending |
| | title | VARCHAR(255) | Payment Pending |
| | message | TEXT | Please upload payment receipt |
| | data | JSON NULL | {"request_id": 1} |
| | read | TINYINT(1) | 0 |
| | read_at | TIMESTAMP NULL | NULL |
| | created_at | TIMESTAMP | 2026-09-06 09:09:45 |
| | updated_at | TIMESTAMP | 2026-09-06 09:09:45 |

**Foreign Keys:**
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `id`
- COMPOSITE: `(user_id, read, created_at)`, `(user_id, read)`

**Notification Types:**
- `payment_pending`, `payment_verified`, `payment_rejected`
- `application_submitted`, `application_reviewed`, `application_approved`, `application_rejected`
- `certificate_ready`, `certificate_expiring`
- `document_pending`

**Notes:**
- read: 0 = unread, 1 = read
- read_at: Timestamp when marked as read

---

## Table 5-2. reminders

**Purpose:** Scheduled reminder system (email/SMS)

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| FK | user_id | INT(10) UNSIGNED | 1 |
| | type | VARCHAR(50) | payment_reminder |
| | related_id | BIGINT | 1 |
| | related_type | VARCHAR(255) | App\Models\Request |
| | scheduled_at | TIMESTAMP | 2026-09-15 09:00:00 |
| | status | ENUM('pending', 'sent', 'failed') | pending |
| | sent_at | TIMESTAMP NULL | NULL |
| | error_message | TEXT NULL | NULL |
| | created_at | TIMESTAMP | 2026-09-06 10:00:00 |
| | updated_at | TIMESTAMP | 2026-09-06 10:00:00 |

**Foreign Keys:**
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY: `id`
- COMPOSITE: `(status, scheduled_at)`, `(related_type, related_id)`

**Notes:**
- Polymorphic: related_type + related_id points to any model
- WARNING: scheduled_at has ON UPDATE CURRENT_TIMESTAMP (auto-updates)
- status: pending → sent/failed

---

## Table 5-3. sms_templates

**Purpose:** Editable SMS message templates

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| UK | event_key | VARCHAR(100) | application_submitted |
| | event_label | VARCHAR(255) | Application Submitted |
| | message | TEXT | Your CPDO LC application {application_number} has been submitted. |
| | enabled | TINYINT(1) | 1 |
| | created_at | TIMESTAMP | 2026-09-01 08:00:00 |
| | updated_at | TIMESTAMP | 2026-09-02 12:00:00 |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `event_key`

**Seeded Event Keys (12):**
1. application_submitted
2. application_reviewed
3. application_approved
4. application_approved_next_steps
5. application_rejected
6. requirements_submitted
7. payment_reminder
8. payment_verified
9. payment_rejected
10. certificate_preparing
11. certificate_ready
12. certificate_released

**Template Variables:**
- `{application_number}`, `{decision_number}`, `{name}`, `{payment_amount}`, etc.

**Notes:**
- All templates updated to use "CPDO LC" branding
- enabled: 1 = active, 0 = disabled

---

# 6. AUDIT & SYSTEM CONFIGURATION

## Table 6-1. system_settings

**Purpose:** Key-value configuration storage

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| UK | setting_key | VARCHAR(100) | system_name |
| | category | VARCHAR(50) | General |
| | value | TEXT | CPDO Locational Clearance |
| | type | VARCHAR(50) | string |
| | is_public | TINYINT(1) | 1 |
| | created_at | TIMESTAMP | 2026-09-01 08:00:00 |
| | updated_at | TIMESTAMP | 2026-09-07 10:00:00 |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `setting_key`

**Categories:**
- General (system_name, contact_email, etc.)
- System (maintenance_mode, debug_mode)
- Uploads (max_file_size, allowed_file_types)
- Certificates (validity_period, certificate_prefix)
- Notifications (email_enabled, sms_enabled)
- Payments (default_payment_amount)

**Notes:**
- type: string, integer, boolean, json
- is_public: 1 = visible to applicants, 0 = admin only

---

## Table 6-2. dashboard_analytics

**Purpose:** Pre-aggregated daily metrics for dashboard

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| UK | date | DATE | 2026-09-07 |
| UK | metric_type | VARCHAR(50) | daily_requests |
| | total_requests | INT | 15 |
| | total_payment_amount | DECIMAL(15,2) | 75000.00 |
| | requests_by_type | JSON | {"Residential": 10, "Commercial": 5} |
| | requests_by_nature | JSON | {"New": 12, "Renovation": 3} |
| | metadata | JSON NULL | {"avg_processing_time": 5} |
| | created_at | TIMESTAMP | 2026-09-07 23:59:59 |
| | updated_at | TIMESTAMP | 2026-09-07 23:59:59 |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `(date, metric_type)`

**Metric Types:**
- `daily_requests`, `daily_payments`, `daily_certificates`

**Notes:**
- Aggregated nightly via scheduled task
- Used for fast dashboard rendering
- Avoids real-time calculations

---

# 7. LARAVEL FRAMEWORK TABLES

## Table 7-1. password_reset_tokens

**Purpose:** Password reset token storage

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | email | VARCHAR(255) | user@example.com |
| | token | VARCHAR(255) | xyz123... |
| | created_at | TIMESTAMP | 2026-09-07 10:00:00 |

**Indexes:**
- PRIMARY KEY: `email`

---

## Table 7-2. sessions

**Purpose:** Database session storage

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | VARCHAR(255) | session_abc123... |
| FK | user_id | BIGINT(20) UNSIGNED NULL | 1 |
| | ip_address | VARCHAR(45) | 192.168.1.1 |
| | user_agent | TEXT | Mozilla/5.0... |
| | payload | LONGTEXT | (serialized session data) |
| | last_activity | INT | 1725724800 |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `user_id`, `last_activity`

---

## Table 7-3. cache

**Purpose:** Database cache storage

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | key | VARCHAR(255) | cache_key_123 |
| | value | MEDIUMTEXT | (cached value) |
| | expiration | INT | 1725724800 |

**Indexes:**
- PRIMARY KEY: `key`
- INDEX: `expiration`

---

## Table 7-4. cache_locks

**Purpose:** Cache locking mechanism

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | key | VARCHAR(255) | lock_key_123 |
| | owner | VARCHAR(255) | process_123 |
| | expiration | INT | 1725724800 |

**Indexes:**
- PRIMARY KEY: `key`

---

## Table 7-5. jobs

**Purpose:** Queued job storage

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| | queue | VARCHAR(255) | default |
| | payload | LONGTEXT | (serialized job) |
| | attempts | TINYINT UNSIGNED | 0 |
| | reserved_at | INT UNSIGNED NULL | NULL |
| | available_at | INT UNSIGNED | 1725724800 |
| | created_at | INT UNSIGNED | 1725724800 |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `queue`

---

## Table 7-6. job_batches

**Purpose:** Job batch tracking

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | VARCHAR(255) | batch_123 |
| | name | VARCHAR(255) | Export Reports |
| | total_jobs | INT | 100 |
| | pending_jobs | INT | 50 |
| | failed_jobs | INT | 0 |
| | failed_job_ids | LONGTEXT | [] |
| | options | MEDIUMTEXT NULL | NULL |
| | cancelled_at | INT NULL | NULL |
| | created_at | INT | 1725724800 |
| | finished_at | INT NULL | NULL |

**Indexes:**
- PRIMARY KEY: `id`

---

## Table 7-7. failed_jobs

**Purpose:** Failed queue jobs

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT(20) UNSIGNED | 1 |
| UK | uuid | VARCHAR(255) | uuid-123 |
| | connection | TEXT | database |
| | queue | TEXT | default |
| | payload | LONGTEXT | (serialized job) |
| | exception | LONGTEXT | (error details) |
| | failed_at | TIMESTAMP | 2026-09-07 10:00:00 |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `uuid`

---

# APPENDIX

## A. Database Statistics

| Category | Table Count |
|----------|-------------|
| Identity & User Management | 4 |
| Core Application Domain | 6 |
| Workflow & Processing | 4 |
| RBAC (Spatie) | 5 |
| Communications | 3 |
| Audit & Configuration | 2 |
| Laravel Framework | 7 |
| **TOTAL** | **32** |

## B. Foreign Key Count

- **Total Foreign Keys:** 31
- **ON DELETE CASCADE:** 18
- **ON DELETE SET NULL:** 13
- **ON UPDATE RESTRICT:** All (31)

## C. Index Summary

- **Primary Keys:** 32
- **Unique Keys:** 15
- **Composite Indexes:** 12
- **Regular Indexes:** 25+

## D. Soft Delete Tables

1. users
2. applicants
3. requests
4. payments
5. certificates

## E. JSON Column Usage

- audit_logs (old_values, new_values, metadata)
- dashboard_analytics (requests_by_type, requests_by_nature, metadata)
- notifications (data)
- reminders (metadata) - if exists
- reports (requirements)
- request_timeline (metadata)
- requests (verified_requirements)

## F. ENUM Field Summary

| Table | Field | Values |
|-------|-------|--------|
| users | user_type | applicant, staff, admin, super_admin |
| applicants | applicant_type | individual, corporate |
| requests | has_written_notice | yes, no |
| requests | has_similar_application | yes, no |
| requests | preferred_release_mode | pickup, mail_applicant, mail_representative, mail_other |
| normalized_projects | project_nature_duration | Permanent, Temporary |
| properties | right_over_land | Owner, Lessee |
| properties | existing_land_use | Residential, Institutional, Commercial, Industrial, Tenanted, Vacant, Agricultural, Not Tenanted |
| reports | evaluation | pending, approved, rejected, reviewed |
| payments | payment_method | cash |
| payments | payment_status | pending, verified, rejected |
| certificates | status | preparing, ready_for_pickup, released, cancelled |
| reminders | status | pending, sent, failed |

---

**Document Version:** 1.0  
**Last Updated:** September 7, 2026  
**Maintained By:** CPDO Development Team  
**For:** Thesis Documentation & System Reference

