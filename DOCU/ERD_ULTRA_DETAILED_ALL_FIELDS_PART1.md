# Entity Relationship Diagram - ULTRA DETAILED (All Fields with Data Types)

**Figure 2-15. LandCert Normalized ERD - Complete Specification (Part 1 of 3)**

## COMPLETE DATABASE SCHEMA - EVERY FIELD WITH FULL SPECIFICATIONS

This document contains EVERY SINGLE FIELD from all 10 tables with complete data type specifications, constraints, nullability, defaults, and relationship connections.

---

## TABLE 1: USERS (11 Fields)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                  USERS                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ PK │ id                                                                      │
│    │   Type: INT (10) UNSIGNED                                               │
│    │   Auto Increment: YES                                                   │
│    │   Nullable: NO                                                          │
│    │   Primary Key: YES                                                      │
│    │                                                                          │
│    │ name                                                                     │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Description: Full name of user                                        │
│    │                                                                          │
│    │ email                                                                    │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Unique: YES                                                           │
│    │   Index: YES (unique_users_email)                                       │
│    │   Description: Email address for login                                  │
│    │                                                                          │
│    │ email_verified_at                                                       │
│    │   Type: TIMESTAMP                                                       │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: When email was verified                                  │
│    │                                                                         │
│    │ password                                                                │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Description: Hashed password                                          │
│    │                                                                         │
│    │ contact_number                                                          │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Phone/mobile number                                      │
│    │                                                                         │
│    │ address                                                                 │
│    │   Type: TEXT                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: User's address                                           │
│    │                                                                         │
│    │ user_type                                                               │
│    │   Type: ENUM('applicant', 'staff', 'admin', 'super_admin')              │
│    │   Nullable: NO                                                          │
│    │   Default: 'applicant'                                                  │
│    │   Description: User role/permission level                               │
│    │                                                                          │
│    │ remember_token                                                          │
│    │   Type: VARCHAR(100)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Laravel remember me token                                │
│    │                                                                          │
│    │ created_at                                                              │
│    │   Type: TIMESTAMP                                  x                     │
│    │   Nullable: NO                                                          │
│    │   Default: CURRENT_TIMESTAMP                                            │
│    │   Description: Record creation timestamp                                │
│    │                                                                          │
│    │ updated_at                                                              │
│    │   Type: TIMESTAMP                                                       │
│    │   Nullable: NO                                                          │
│    │   Default: CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP                │
│    │   Description: Last modification timestamp                              │
│    │                                                                          │
│ INDEXES:                                                                     │
│   - PRIMARY KEY (id)                                                         │
│   - UNIQUE KEY unique_users_email (email)                                    │
│                                                                              │
│ RELATIONSHIPS:                                                               │
│   → requests (1:*) via requests.user_id                                      │
│   → notifications (1:*) via notifications.user_id                            │
│   → audit_logs (1:*) via audit_logs.user_id                                  │
│   → reports (1:*) via reports.evaluated_by                                   │
│   → dss_evaluations (1:*) via dss_evaluations.evaluated_by_user_id          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## TABLE 2: REQUESTS (30 Fields) - CONSOLIDATED

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              REQUESTS                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ PK │ id                                                                      │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Auto Increment: YES                                                   │
│    │   Nullable: NO                                                          │
│    │   Primary Key: YES                                                      │
│    │                                                                          │
│ FK │ user_id                                                                 │
│    │   Type: INT(10) UNSIGNED                                                │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Foreign Key: → users.id                                               │
│    │   On Delete: SET NULL                                                   │
│    │   On Update: CASCADE                                                    │
│    │   Index: YES (requests_user_id_foreign)                                 │
│    │   Description: Reference to user who submitted                          │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 1: APPLICANT INFORMATION (3 fields)                             │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ applicant_name                                                          │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Index: YES (requests_applicant_name_index)                            │
│    │   Description: Full name of primary applicant                           │
│    │                                                                          │
│    │ applicant_address                                                       │
│    │   Type: TEXT                                                            │
│    │   Nullable: NO                                                          │
│    │   Description: Complete address of applicant                            │
│    │                                                                          │
│    │ applicant_contact                                                       │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Contact number of applicant                              │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 2: CORPORATION (OPTIONAL - 2 fields)                            │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ corporation_name                                                        │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Company/corporation name if corporate applicant          │
│    │                                                                          │
│    │ corporation_address                                                     │
│    │   Type: TEXT                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Corporation's business address                           │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 3: AUTHORIZED REPRESENTATIVE (OPTIONAL - 4 fields)              │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ authorized_representative_name                                          │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Name of authorized representative                        │
│    │                                                                          │
│    │ authorized_representative_address                                       │
│    │   Type: TEXT                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Address of representative                                │
│    │                                                                          │
│    │ authorized_representative_email                                         │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Email of representative                                  │
│    │                                                                          │
│    │ authorization_letter_path                                               │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: File path to authorization letter                        │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 4: PROJECT DETAILS (5 fields)                                   │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ project_type                                                            │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Description: Type of development project                              │
│    │   Examples: Residential, Commercial, Industrial                         │
│    │                                                                          │
│    │ project_nature                                                          │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Description: Nature/purpose of project                                │
│    │                                                                          │
│    │ project_nature_duration                                                 │
│    │   Type: ENUM('Permanent', 'Temporary')                                  │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Duration classification of project                       │
│    │                                                                          │
│    │ project_nature_years                                                    │
│    │   Type: INT(11)                                                         │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Number of years for temporary projects                   │
│    │                                                                          │
│    │ project_cost                                                            │
│    │   Type: TEXT                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Estimated cost of project                                │
│    │                                                                          │
└──────────────────────────────────────────────────────────────────────────────┘

(Continued in PART 2...)
```

---

**END OF PART 1**

**Continue to**: `ERD_ULTRA_DETAILED_ALL_FIELDS_PART2.md`
