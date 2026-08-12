# LandCert System - Database Schema Tables

**Version**: 4.0 (Fully Normalized)  
**Date**: August 3, 2026  
**Normalization**: Third Normal Form (3NF)  
**Total Tables**: 13 Business Logic Tables

---

## Table 2-1. Users Table

Table 2-1 shows the different fields of the users information. This table contains detailed information about system users including applicants, staff, admin, and super admin. It stores authentication credentials, contact information, and user type classification for role-based access control throughout the system.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | INT UNSIGNED | 1 |
| | name | VARCHAR(255) | Juan Dela Cruz |
| UNIQUE | email | VARCHAR(255) | juandelacruz@example.com |
| | email_verified_at | TIMESTAMP | 2025-03-26 09:09:45 |
| | password | VARCHAR(255) | $2y$10$.... |
| | contact_number | VARCHAR(255) | 09123456789 |
| | address | TEXT | 123 Main St, Ilagan City |
| | user_type | ENUM('applicant', 'staff', 'admin', 'super_admin') | applicant |
| | remember_token | VARCHAR(100) | NULL |
| | created_at | TIMESTAMP | 2025-03-26 09:09:45 |
| | updated_at | TIMESTAMP | 2025-03-26 09:09:45 |

**Purpose**: User authentication and authorization  
**Relationships**: 1:1 optional with applicants, 1:* with requests, notifications, audit_logs

---

## Table 2-2. Applicants Table

Table 2-2 shows the different fields of the applicants information. This table stores applicant information separately from user accounts, enabling the normalization of data. It contains applicant personal details, contact information, and applicant type classification (individual or corporate), which is essential for determining whether additional corporate information is required.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| FK, UNIQUE | user_id | INT UNSIGNED | 1 → users.id |
| | applicant_name | VARCHAR(255) | Juan Dela Cruz |
| | applicant_address | TEXT | 123 Main St, Ilagan City |
| | applicant_contact | VARCHAR(255) | 09123456789 |
| | applicant_type | ENUM('individual', 'corporate') | individual |
| | created_at | TIMESTAMP | 2025-03-26 09:09:45 |
| | updated_at | TIMESTAMP | 2025-03-26 09:09:45 |

**Purpose**: Store applicant information separately from user accounts  
**Relationships**: 1:1 optional with users, 1:1 with normalized_corporations, 1:* with representatives, 1:* with requests  
**Foreign Key**: user_id → users.id (SET NULL on delete)

---

## Table 2-3. Normalized Corporations Table

Table 2-3 shows the different fields of the normalized corporations information. This table contains corporate entity information for applicants classified as corporate type. It stores the corporation name, address, registration number, and Tax Identification Number (TIN), ensuring proper documentation of corporate applicants in compliance with legal requirements.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| FK, UNIQUE | applicant_id | BIGINT UNSIGNED | 1 → applicants.id |
| | corporation_name | VARCHAR(255) | ABC Corporation |
| | corporation_address | TEXT | 456 Business Ave, Ilagan City |
| | registration_number | VARCHAR(255) | REG-2025-001 |
| | tin | VARCHAR(255) | 123-456-789-000 |
| | created_at | TIMESTAMP | 2025-03-26 09:09:45 |
| | updated_at | TIMESTAMP | 2025-03-26 09:09:45 |

**Purpose**: Corporate entity information for corporate applicants  
**Relationships**: 1:1 with applicants  
**Foreign Key**: applicant_id → applicants.id (CASCADE on delete)

---

## Table 2-4. Representatives Table

Table 2-4 shows the different fields of the representatives information. This table stores information about authorized representatives who act on behalf of applicants. It contains representative contact details, authorization letter path, relationship to the applicant, and a flag indicating whether they are the primary representative, supporting cases where applicants designate multiple representatives.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| FK | applicant_id | BIGINT UNSIGNED | 1 → applicants.id |
| | representative_name | VARCHAR(255) | Maria Santos |
| | representative_address | TEXT | 789 Rep St, Ilagan City |
| | representative_email | VARCHAR(255) | maria@example.com |
| | representative_contact | VARCHAR(255) | 09987654321 |
| | authorization_letter_path | VARCHAR(255) | /storage/auth/letter1.pdf |
| | relationship | VARCHAR(255) | Attorney |
| | is_primary | BOOLEAN | 1 |
| | created_at | TIMESTAMP | 2025-03-26 09:09:45 |
| | updated_at | TIMESTAMP | 2025-03-26 09:09:45 |

**Purpose**: Authorized representatives for applicants  
**Relationships**: *:1 with applicants  
**Foreign Key**: applicant_id → applicants.id (CASCADE on delete)

---

## Table 2-5. Requests Table (Core)

Table 2-5 shows the different fields of the requests information. This is the central table in the system that stores land certification application requests. It contains only request-specific data such as control number, previous application history, release preferences, and application status. All detailed information about projects, properties, and locations are normalized into separate tables to eliminate data redundancy and maintain Third Normal Form compliance.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| UNIQUE | control_number | VARCHAR(255) | LCR-2025-001 |
| FK | user_id | INT UNSIGNED | 1 → users.id |
| FK | applicant_id | BIGINT UNSIGNED | 1 → applicants.id |
| | has_written_notice | ENUM('yes', 'no') | yes |
| | notice_officer_name | VARCHAR(255) | Officer Smith |
| | notice_dates | VARCHAR(255) | 2025-03-20 |
| | has_similar_application | ENUM('yes', 'no') | no |
| | similar_application_offices | TEXT | NULL |
| | similar_application_dates | VARCHAR(255) | NULL |
| | preferred_release_mode | ENUM('pickup', 'mail_applicant', 'mail_representative', 'mail_other') | pickup |
| | release_address | TEXT | NULL |
| | status | ENUM('pending', 'needs_revision', 'under_review', 'approved', 'rejected') | pending |
| | created_at | TIMESTAMP | 2025-03-26 09:09:45 |
| | updated_at | TIMESTAMP | 2025-03-26 09:09:45 |

**Purpose**: Central application request record (fully normalized - no redundant data)  
**Relationships**: *:1 with users, *:1 with applicants, 1:1 with projects/properties/locations, 1:* with reports/payments, 1:1 with certificates  
**Foreign Keys**: 
- user_id → users.id (SET NULL on delete)
- applicant_id → applicants.id (CASCADE on delete)

---

## Table 2-6. Normalized Projects Table

Table 2-6 shows the different fields of the normalized projects information. This table contains project-specific details for each land certification request. It stores information about the project type, nature, duration (permanent or temporary), estimated cost, and detailed description, providing comprehensive documentation of the proposed development or land use project.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| FK, UNIQUE | request_id | BIGINT UNSIGNED | 1 → requests.id |
| | project_type | VARCHAR(255) | Commercial Building |
| | project_nature | VARCHAR(255) | Construction |
| | project_nature_duration | ENUM('Permanent', 'Temporary') | Permanent |
| | project_nature_years | INT | NULL |
| | project_cost | DECIMAL(15, 2) | 5000000.00 |
| | project_description | TEXT | Multi-story commercial building |
| | created_at | TIMESTAMP | 2025-03-26 09:09:45 |
| | updated_at | TIMESTAMP | 2025-03-26 09:09:45 |

**Purpose**: Project-specific details for each request  
**Relationships**: 1:1 with requests  
**Foreign Key**: request_id → requests.id (CASCADE on delete)

---

## Table 2-7. Properties Table

Table 2-7 shows the different fields of the properties information. This table contains detailed property and land information for each request. It stores measurements such as lot area and building improvement area in square meters, lot and title numbers, ownership rights (owner or lessee), and existing land use classification, which are critical for land certification evaluation and compliance verification.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| FK, UNIQUE | request_id | BIGINT UNSIGNED | 1 → requests.id |
| | lot_area_sqm | DECIMAL(10, 2) | 1000.50 |
| | bldg_improvement_sqm | DECIMAL(10, 2) | 500.25 |
| | lot_number | VARCHAR(255) | LOT-001 |
| | title_number | VARCHAR(255) | TCT-12345 |
| | right_over_land | ENUM('Owner', 'Lessee') | Owner |
| | existing_land_use | ENUM('Residential', 'Institutional', 'Commercial', 'Industrial', 'Tenanted', 'Vacant', 'Agricultural', 'Not Tenanted') | Vacant |
| | created_at | TIMESTAMP | 2025-03-26 09:09:45 |
| | updated_at | TIMESTAMP | 2025-03-26 09:09:45 |

**Purpose**: Property and land information  
**Relationships**: 1:1 with requests  
**Foreign Key**: request_id → requests.id (CASCADE on delete)

---

## Table 2-8. Locations Table

Table 2-8 shows the different fields of the locations information. This table stores complete address and location details for each property involved in a land certification request. It includes street address, barangay, city or municipality, province, postal code, and district information, ensuring accurate geographic identification and proper documentation of the property location for administrative and legal purposes.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| FK, UNIQUE | request_id | BIGINT UNSIGNED | 1 → requests.id |
| | street_address | VARCHAR(500) | 123 Main St, Corner Oak Ave |
| | barangay | VARCHAR(255) | Poblacion |
| | city_municipality | VARCHAR(255) | Ilagan City |
| | province | VARCHAR(255) | Isabela |
| | postal_code | VARCHAR(20) | 3300 |
| | district | VARCHAR(255) | District 1 |
| | created_at | TIMESTAMP | 2025-03-26 09:09:45 |
| | updated_at | TIMESTAMP | 2025-03-26 09:09:45 |

**Purpose**: Address and location information  
**Relationships**: 1:1 with requests  
**Foreign Key**: request_id → requests.id (CASCADE on delete)

---

## Table 2-9. Reports Table

Table 2-9 shows the different fields of the reports information. This table contains evaluation reports generated by staff members who review land certification requests. It stores the evaluation status, assessment description, recommended amount or fees, certification date, report date, evaluator information, and detailed remarks, serving as the official record of the evaluation process and decision-making documentation.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| FK | request_id | BIGINT UNSIGNED | 1 → requests.id |
| FK | evaluated_by | INT UNSIGNED | 2 → users.id |
| | description | TEXT | Application meets all requirements |
| | evaluation | ENUM('pending', 'approved', 'rejected', 'reviewed') | approved |
| | amount | DECIMAL(12, 2) | 5000.00 |
| | date_certified | DATE | 2025-03-30 |
| | date_reported | DATETIME | 2025-03-30 14:30:00 |
| | issued_by_name | VARCHAR(255) | Admin User |
| | remarks | TEXT | Approved for certificate generation |
| | created_at | TIMESTAMP | 2025-03-26 09:09:45 |
| | updated_at | TIMESTAMP | 2025-03-26 09:09:45 |

**Purpose**: Evaluation reports for requests  
**Relationships**: *:1 with requests, *:1 with users (evaluator)  
**Foreign Keys**:
- request_id → requests.id (CASCADE on delete)
- evaluated_by → users.id (SET NULL on delete)

---

## Table 2-10. Payments Table

Table 2-10 shows the different fields of the payments information. This table tracks physical payment receipts submitted by applicants for their land certification requests. It stores payment amount, method (cash, bank transfer, check, etc.), receipt details, payment date, verification status, and notes from the verifying staff member. The system maintains a manual payment verification workflow where staff members review uploaded payment receipts and update the verification status accordingly.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| | is_legacy_payment | BOOLEAN | 0 |
| FK | request_id | BIGINT UNSIGNED | 1 → requests.id |
| | application_id | INT UNSIGNED | NULL |
| | amount | DECIMAL(10, 2) | 5000.00 |
| | payment_method | ENUM('cash', 'bank_transfer', 'gcash', 'paymaya', 'check', 'other') | cash |
| | receipt_number | VARCHAR(255) | RCP-2025-001 |
| | receipt_file_path | VARCHAR(255) | /storage/receipts/receipt1.pdf |
| | payment_date | DATE | 2025-03-28 |
| | payment_status | ENUM('pending', 'verified', 'rejected') | verified |
| FK | verified_by | INT UNSIGNED | 2 → users.id |
| | verified_at | TIMESTAMP | 2025-03-29 10:00:00 |
| | rejection_reason | TEXT | NULL |
| | notes | TEXT | Payment verified successfully |
| | created_at | TIMESTAMP | 2025-03-28 09:09:45 |
| | updated_at | TIMESTAMP | 2025-03-29 10:00:00 |

**Purpose**: Physical payment receipt tracking  
**Relationships**: *:1 with requests, *:1 with users (submitter), *:1 with users (verifier)  
**Foreign Keys**:
- request_id → requests.id (CASCADE on delete)
- verified_by → users.id (SET NULL on delete)

---

## Table 2-11. Certificates Table

Table 2-11 shows the different fields of the certificates information. This table manages physical land certificates issued to approved applicants. It stores the unique certificate number, file path to the certificate document, issuance details including issuing staff member and date, validity period, and current status (preparing, ready for pickup, released, or cancelled). The table tracks the complete lifecycle of certificate preparation, readiness, and physical release to applicants.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| FK, UNIQUE | request_id | BIGINT UNSIGNED | 1 → requests.id |
| | application_id | INT UNSIGNED | NULL |
| | payment_id | BIGINT UNSIGNED | 1 |
| UNIQUE | certificate_number | VARCHAR(255) | CERT-2025-001 |
| | certificate_file_path | VARCHAR(255) | /storage/certs/cert1.pdf |
| FK | issued_by | INT UNSIGNED | 2 → users.id |
| | issued_at | TIMESTAMP | 2025-04-01 09:00:00 |
| | valid_until | DATE | 2026-04-01 |
| | status | ENUM('preparing', 'ready_for_pickup', 'released', 'cancelled') | released |
| | notes | TEXT | Certificate released to applicant |
| | created_at | TIMESTAMP | 2025-04-01 09:00:00 |
| | updated_at | TIMESTAMP | 2025-04-02 14:00:00 |

**Purpose**: Physical certificate tracking and release management  
**Relationships**: 1:1 with requests, *:1 with users (issuer)  
**Foreign Keys**:
- request_id → requests.id (CASCADE on delete)
- issued_by → users.id (SET NULL on delete)

---

## Table 2-12. Notifications Table

Table 2-12 shows the different fields of the notifications information. This table manages system-generated notifications sent to users about important events and status updates. It stores notification type, title, message content, related link for navigation, additional data in JSON format, and read status with timestamp. The notification system keeps users informed about application status changes, payment verifications, certificate readiness, and other significant events throughout the land certification process.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| FK | user_id | INT UNSIGNED | 1 → users.id |
| | type | VARCHAR(100) | application_approved |
| | title | VARCHAR(255) | Application Approved |
| | message | TEXT | Your application has been approved |
| | link | VARCHAR(255) | /requests/1 |
| | data | JSON | {"request_id": 1} |
| | read | BOOLEAN | 0 |
| | read_at | TIMESTAMP | NULL |
| | created_at | TIMESTAMP | 2025-03-30 14:30:00 |
| | updated_at | TIMESTAMP | 2025-03-30 14:30:00 |

**Purpose**: User notification management  
**Relationships**: *:1 with users  
**Foreign Key**: user_id → users.id (CASCADE on delete)

---

## Table 2-13. Audit Logs Table

Table 2-13 shows the different fields of the audit logs information. This table maintains a comprehensive audit trail of all significant system activities and data modifications. It records user actions, model type and ID of affected records, detailed descriptions of changes, old and new values in JSON format, user information, IP address, user agent, request URL, and HTTP method. This audit logging ensures accountability, traceability, and security compliance by documenting all critical system operations and user activities.

| Key | Fields | Data Type | Example |
|-----|--------|-----------|---------|
| PK | id | BIGINT UNSIGNED | 1 |
| FK | user_id | INT UNSIGNED | 2 → users.id |
| | user_name | VARCHAR(255) | Admin User |
| | user_type | VARCHAR(50) | admin |
| | action | VARCHAR(100) | updated |
| | model_type | VARCHAR(100) | Request |
| | model_id | BIGINT | 1 |
| | description | VARCHAR(500) | Updated request status to approved |
| | old_values | JSON | {"status": "pending"} |
| | new_values | JSON | {"status": "approved"} |
| | ip_address | VARCHAR(45) | 192.168.1.100 |
| | user_agent | VARCHAR(500) | Mozilla/5.0... |
| | url | VARCHAR(500) | /admin/requests/1 |
| | method | VARCHAR(10) | POST |
| | created_at | TIMESTAMP | 2025-03-30 14:30:00 |

**Purpose**: System audit trail  
**Relationships**: *:1 with users  
**Foreign Key**: user_id → users.id (SET NULL on delete)

---

## Database Summary

### Statistics

| Metric | Value |
|--------|-------|
| **Total Tables** | 13 |
| **Total Columns** | 151 |
| **Total Foreign Keys** | 16 |
| **Total Unique Constraints** | 9 |
| **Normalization Level** | 3NF |
| **Data Redundancy** | 0% |

### Table Categories

| Category | Tables | Count |
|----------|--------|-------|
| **Authentication** | users | 1 |
| **Identity** | applicants, normalized_corporations, representatives | 3 |
| **Core** | requests | 1 |
| **Details** | normalized_projects, properties, locations | 3 |
| **Processing** | reports, payments, certificates | 3 |
| **Support** | notifications, audit_logs | 2 |

### Key Relationships

1. **users** → applicants (1:1 optional)
2. **applicants** → normalized_corporations (1:1)
3. **applicants** → representatives (1:many)
4. **applicants** → requests (1:many)
5. **users** → requests (1:many)
6. **requests** → normalized_projects (1:1)
7. **requests** → properties (1:1)
8. **requests** → locations (1:1)
9. **requests** → reports (1:many)
10. **requests** → payments (1:many)
11. **requests** → certificates (1:1)
12. **users** → notifications (1:many)
13. **users** → audit_logs (1:many)

### Cascade Rules

| Action | Tables | Rule |
|--------|--------|------|
| **CASCADE** | normalized_corporations, representatives, normalized_projects, properties, locations, reports, payments, certificates, notifications | Delete child records when parent is deleted |
| **SET NULL** | applicants.user_id, requests.user_id, reports.evaluated_by, payments.verified_by, certificates.issued_by, audit_logs.user_id | Set FK to NULL when parent is deleted |

---

## Normalization Compliance

### ✅ First Normal Form (1NF)
- All columns contain atomic values
- No repeating groups
- Each column has unique name

### ✅ Second Normal Form (2NF)
- All 1NF requirements met
- No partial dependencies
- All non-key attributes fully depend on primary key

### ✅ Third Normal Form (3NF)
- All 2NF requirements met
- No transitive dependencies
- Non-key attributes depend only on primary key
- **Zero data redundancy**

---

## Key Design Principles

1. **Single Source of Truth**: Each piece of data stored exactly once
2. **Referential Integrity**: All relationships enforced with foreign keys
3. **Data Independence**: Tables can be modified independently
4. **Minimal Redundancy**: No duplicate data across tables
5. **Clear Relationships**: All table connections explicitly defined
6. **Scalable Structure**: Ready for growth and expansion

---

*Database Schema v4.0 - Table Format*  
*Date: August 3, 2026*  
*Status: Production Ready ✅*
