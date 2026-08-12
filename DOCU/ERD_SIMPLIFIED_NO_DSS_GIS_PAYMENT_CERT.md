# Entity Relationship Diagram - Simplified System (Core Features Only)

**Document Version**: 2.0 (Simplified)  
**Date**: August 3, 2026  
**Purpose**: ERD without DSS, GIS, Online Payment, and Digital Certificate features

---

## REMOVED FEATURES

The following features and their associated tables have been removed:

### ❌ Removed Features:
1. **DSS (Decision Support System)** - Automated risk assessment and zoning compliance
2. **GIS (Geographic Information System)** - Spatial data, coordinates, and zoning rules
3. **Online Payment Gateway** - Third-party payment processor integration
4. **Digital Certificates** - Electronic certificate generation and download

### ❌ Removed Tables:
1. `property_locations` (GIS)
2. `zoning_rules` (GIS)
3. `dss_evaluations` (DSS)
4. `evaluation_risk_assessments` (DSS)
5. `risk_factors` (DSS)

### ✅ Retained Tables (Physical Process):
- `payments` - Physical payment receipt uploads (kept for manual verification)
- `certificates` - Physical certificate tracking (kept for manual release tracking)

---

## Simplified Database Summary

### Final Table Count: **7 Core Tables**

#### Core Business Tables (5):
1. **users** - User authentication and authorization
2. **requests** - Land certification applications
3. **reports** - Evaluation reports
4. **payments** - Physical payment receipt uploads
5. **certificates** - Physical certificate release tracking

#### Supporting Tables (2):
6. **notifications** - User notifications
7. **audit_logs** - System activity tracking

**Total: 7 Tables** (down from 10)

---

## Part 1: Core User and Request Management

```
┌─────────────────────────────────────────────────────────────────┐
│                            USERS                                │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id (INT) AUTO_INCREMENT                                    │
│    │ name (VARCHAR 255) NOT NULL                                │
│    │ email (VARCHAR 255) UNIQUE NOT NULL                        │
│    │ email_verified_at (TIMESTAMP) NULLABLE                     │
│    │ password (VARCHAR 255) NOT NULL                            │
│    │ contact_number (VARCHAR 255) NULLABLE                      │
│    │ address (TEXT) NULLABLE                                    │
│    │ user_type (ENUM: applicant, staff, admin, super_admin)    │
│    │           DEFAULT 'applicant' NOT NULL                     │
│    │ remember_token (VARCHAR 100) NULLABLE                      │
│    │ created_at (TIMESTAMP) NOT NULL                            │
│    │ updated_at (TIMESTAMP) NOT NULL                            │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ 1                  │ 1                  │ 1
         │ submits            │ receives           │ generates
         │                    │                    │
         │ *                  │ *                  │ *
         ▼                    ▼                    ▼
    REQUESTS           NOTIFICATIONS          AUDIT_LOGS


┌────────────────────────────────────────────────────────────────────────┐
│                     REQUESTS (Simplified)                              │
├────────────────────────────────────────────────────────────────────────┤
│ PK │ id (BIGINT) AUTO_INCREMENT                                        │
│ FK │ user_id (INT) NULLABLE → users.id                                 │
│    │                                                                    │
│    │ --- APPLICANT INFORMATION ---                                     │
│    │ applicant_name (VARCHAR 255) NOT NULL                             │
│    │ applicant_address (TEXT) NOT NULL                                 │
│    │ applicant_contact (VARCHAR 255) NULLABLE                          │
│    │                                                                    │
│    │ --- CORPORATION (Optional - for corporate applicants) ---         │
│    │ corporation_name (VARCHAR 255) NULLABLE                           │
│    │ corporation_address (TEXT) NULLABLE                               │
│    │                                                                    │
│    │ --- AUTHORIZED REPRESENTATIVE (Optional) ---                      │
│    │ representative_name (VARCHAR 255) NULLABLE                        │
│    │ representative_address (TEXT) NULLABLE                            │
│    │ representative_email (VARCHAR 255) NULLABLE                       │
│    │ authorization_letter_path (VARCHAR 255) NULLABLE                  │
│    │                                                                    │
│    │ --- PROJECT DETAILS ---                                           │
│    │ project_type (VARCHAR 255) NOT NULL                               │
│    │ project_nature (VARCHAR 255) NOT NULL                             │
│    │ project_nature_duration (ENUM: Permanent, Temporary) NULLABLE     │
│    │ project_nature_years (INT) NULLABLE                               │
│    │ project_cost (DECIMAL 15,2) NULLABLE                              │
│    │                                                                    │
│    │ --- PROPERTY/LOT DETAILS ---                                      │
│    │ lot_area_sqm (DECIMAL 10,2) NULLABLE                              │
│    │ bldg_improvement_sqm (DECIMAL 10,2) NULLABLE                      │
│    │ right_over_land (ENUM: Owner, Lessee) NULLABLE                    │
│    │ existing_land_use (ENUM: Residential, Institutional,              │
│    │   Commercial, Industrial, Tenanted, Vacant,                       │
│    │   Agricultural, Not Tenanted) NULLABLE                            │
│    │                                                                    │
│    │ --- LOCATION (Simple Text-Based) ---                              │
│    │ location_street (VARCHAR 500) NULLABLE                            │
│    │ location_barangay (VARCHAR 255) NULLABLE                          │
│    │ location_city (VARCHAR 255) NULLABLE                              │
│    │ location_province (VARCHAR 255) NULLABLE                          │
│    │ lot_number (VARCHAR 255) NULLABLE                                 │
│    │ title_number (VARCHAR 255) NULLABLE                               │
│    │                                                                    │
│    │ --- PREVIOUS APPLICATIONS ---                                     │
│    │ has_written_notice (ENUM: yes, no) NULLABLE                       │
│    │ notice_officer_name (VARCHAR 255) NULLABLE                        │
│    │ notice_dates (VARCHAR 255) NULLABLE                               │
│    │ has_similar_application (ENUM: yes, no) NULLABLE                  │
│    │ similar_application_offices (TEXT) NULLABLE                       │
│    │ similar_application_dates (VARCHAR 255) NULLABLE                  │
│    │                                                                    │
│    │ --- RELEASE PREFERENCES ---                                       │
│    │ preferred_release_mode (ENUM: pickup, mail_applicant,             │
│    │   mail_representative, mail_other) NULLABLE                       │
│    │ release_address (TEXT) NULLABLE                                   │
│    │                                                                    │
│    │ --- APPLICATION STATUS ---                                        │
│    │ status (ENUM: pending, under_review, approved,                    │
│    │         rejected) DEFAULT 'pending' NOT NULL                      │
│    │                                                                    │
│    │ --- TIMESTAMPS ---                                                │
│    │ created_at (TIMESTAMP) NOT NULL                                   │
│    │ updated_at (TIMESTAMP) NOT NULL                                   │
│    │                                                                    │
│    │ INDEXES:                                                           │
│    │   - INDEX(user_id)                                                │
│    │   - INDEX(status)                                                 │
│    │   - INDEX(applicant_name)                                         │
│    │   - INDEX(created_at)                                             │
│    │   - INDEX(location_barangay)                                      │
│    │   - INDEX(location_city)                                          │
└────────────────────────────────────────────────────────────────────────┘
         │
         │ 1
         │ has
         ├──────────────┬──────────────┬──────────────┐
         │ *            │ *            │ *            │ *
         ▼              ▼              ▼              ▼
     REPORTS      PAYMENTS     CERTIFICATES    NOTIFICATIONS


┌────────────────────────────────────────────────────────────────┐
│                          REPORTS                               │
├────────────────────────────────────────────────────────────────┤
│ PK │ id (BIGINT) AUTO_INCREMENT                                │
│ FK │ request_id (BIGINT) NOT NULL → requests.id                │
│ FK │ evaluated_by (INT) NULLABLE → users.id                    │
│    │                                                            │
│    │ description (TEXT) NULLABLE                               │
│    │ evaluation (ENUM: pending, under_review, approved,        │
│    │   rejected) DEFAULT 'pending' NOT NULL                    │
│    │ amount (DECIMAL 12,2) NULLABLE                            │
│    │ date_certified (DATE) NULLABLE                            │
│    │ date_reported (DATETIME) NULLABLE                         │
│    │ issued_by_name (VARCHAR 255) NULLABLE                     │
│    │                                                            │
│    │ created_at (TIMESTAMP) NOT NULL                           │
│    │ updated_at (TIMESTAMP) NOT NULL                           │
│    │                                                            │
│    │ INDEXES:                                                   │
│    │   - INDEX(request_id)                                     │
│    │   - INDEX(evaluated_by)                                   │
│    │   - INDEX(evaluation)                                     │
│    │   - INDEX(date_reported)                                  │
└────────────────────────────────────────────────────────────────┘
```

## Part 2: Physical Payment and Certificate Tracking

```
┌────────────────────────────────────────────────────────────────────────┐
│                  PAYMENTS (Physical Receipt Uploads)                   │
├────────────────────────────────────────────────────────────────────────┤
│ PK │ id (BIGINT) AUTO_INCREMENT                                        │
│ FK │ request_id (BIGINT) NOT NULL → requests.id                        │
│ FK │ user_id (INT) NOT NULL → users.id                                 │
│    │                                                                    │
│    │ --- PAYMENT DETAILS ---                                           │
│    │ amount (DECIMAL 12,2) NOT NULL                                    │
│    │ reference_number (VARCHAR 255) NULLABLE                           │
│    │ payment_method (ENUM: cash, check, bank_transfer,                │
│    │   money_order) NOT NULL                                           │
│    │ payment_date (DATE) NOT NULL                                      │
│    │                                                                    │
│    │ --- RECEIPT IMAGE/FILE ---                                        │
│    │ receipt_path (VARCHAR 255) NOT NULL                               │
│    │                                                                    │
│    │ --- VERIFICATION STATUS ---                                       │
│    │ payment_status (ENUM: pending, verified, rejected)                │
│    │   DEFAULT 'pending' NOT NULL                                      │
│    │ verified_by (INT) NULLABLE → users.id                             │
│    │ verified_at (TIMESTAMP) NULLABLE                                  │
│    │ rejection_reason (TEXT) NULLABLE                                  │
│    │                                                                    │
│    │ --- NOTES ---                                                     │
│    │ notes (TEXT) NULLABLE                                             │
│    │                                                                    │
│    │ created_at (TIMESTAMP) NOT NULL                                   │
│    │ updated_at (TIMESTAMP) NOT NULL                                   │
│    │                                                                    │
│    │ INDEXES:                                                           │
│    │   - INDEX(request_id)                                             │
│    │   - INDEX(user_id)                                                │
│    │   - INDEX(payment_status)                                         │
│    │   - INDEX(verified_by)                                            │
│    │   - INDEX(payment_date)                                           │
└────────────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────┐
│            CERTIFICATES (Physical Certificate Tracking)                │
├────────────────────────────────────────────────────────────────────────┤
│ PK │ id (BIGINT) AUTO_INCREMENT                                        │
│ FK │ request_id (BIGINT) UNIQUE NOT NULL → requests.id                 │
│ FK │ user_id (INT) NOT NULL → users.id                                 │
│    │                                                                    │
│    │ --- CERTIFICATE INFO ---                                          │
│    │ certificate_number (VARCHAR 255) UNIQUE NOT NULL                  │
│    │ issued_at (TIMESTAMP) NULLABLE                                    │
│    │ issued_by (INT) NULLABLE → users.id                               │
│    │ valid_until (DATE) NULLABLE                                       │
│    │                                                                    │
│    │ --- PHYSICAL CERTIFICATE STATUS ---                               │
│    │ status (ENUM: preparing, ready_for_pickup, released,              │
│    │   cancelled) DEFAULT 'preparing' NOT NULL                         │
│    │                                                                    │
│    │ --- RELEASE TRACKING ---                                          │
│    │ ready_at (TIMESTAMP) NULLABLE                                     │
│    │ released_at (TIMESTAMP) NULLABLE                                  │
│    │ released_by (INT) NULLABLE → users.id                             │
│    │ released_to_name (VARCHAR 255) NULLABLE                           │
│    │ released_to_id_type (VARCHAR 100) NULLABLE                        │
│    │ released_to_id_number (VARCHAR 100) NULLABLE                      │
│    │ release_signature_path (VARCHAR 255) NULLABLE                     │
│    │                                                                    │
│    │ --- NOTES ---                                                     │
│    │ notes (TEXT) NULLABLE                                             │
│    │                                                                    │
│    │ created_at (TIMESTAMP) NOT NULL                                   │
│    │ updated_at (TIMESTAMP) NOT NULL                                   │
│    │                                                                    │
│    │ INDEXES:                                                           │
│    │   - UNIQUE(request_id) -- One certificate per request             │
│    │   - UNIQUE(certificate_number)                                    │
│    │   - INDEX(user_id)                                                │
│    │   - INDEX(status)                                                 │
│    │   - INDEX(issued_by)                                              │
│    │   - INDEX(released_by)                                            │
└────────────────────────────────────────────────────────────────────────┘
```

## Part 3: Supporting System Tables

```
┌────────────────────────────────────────────────────────────────────────┐
│                          NOTIFICATIONS                                 │
├────────────────────────────────────────────────────────────────────────┤
│ PK │ id (BIGINT) AUTO_INCREMENT                                        │
│ FK │ user_id (INT) NOT NULL → users.id                                 │
│    │                                                                    │
│    │ type (VARCHAR 100) NOT NULL                                       │
│    │   Values: application_submitted, application_approved,            │
│    │           application_rejected, payment_verified,                 │
│    │           certificate_ready, certificate_released, etc.           │
│    │ title (VARCHAR 255) NOT NULL                                      │
│    │ message (TEXT) NOT NULL                                           │
│    │ link (VARCHAR 255) NULLABLE                                       │
│    │ data (JSON) NULLABLE                                              │
│    │                                                                    │
│    │ read (BOOLEAN) DEFAULT FALSE NOT NULL                             │
│    │ read_at (TIMESTAMP) NULLABLE                                      │
│    │                                                                    │
│    │ created_at (TIMESTAMP) NOT NULL                                   │
│    │ updated_at (TIMESTAMP) NOT NULL                                   │
│    │                                                                    │
│    │ INDEXES:                                                           │
│    │   - INDEX(user_id, read, created_at) -- Composite for unread     │
│    │   - INDEX(type)                                                   │
└────────────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────┐
│                           AUDIT_LOGS                                   │
├────────────────────────────────────────────────────────────────────────┤
│ PK │ id (BIGINT) AUTO_INCREMENT                                        │
│ FK │ user_id (INT) NULLABLE → users.id                                 │
│    │                                                                    │
│    │ user_name (VARCHAR 255) NULLABLE                                  │
│    │ user_type (VARCHAR 50) NULLABLE                                   │
│    │                                                                    │
│    │ action (VARCHAR 100) NOT NULL                                     │
│    │   Values: created, updated, deleted, viewed, exported,            │
│    │           approved, rejected, verified, released, etc.            │
│    │ model_type (VARCHAR 100) NULLABLE                                 │
│    │   Values: Request, Report, Payment, Certificate, User, etc.      │
│    │ model_id (BIGINT) NULLABLE                                        │
│    │ description (VARCHAR 500) NOT NULL                                │
│    │                                                                    │
│    │ old_values (JSON) NULLABLE                                        │
│    │ new_values (JSON) NULLABLE                                        │
│    │                                                                    │
│    │ ip_address (VARCHAR 45) NULLABLE                                  │
│    │ user_agent (VARCHAR 500) NULLABLE                                 │
│    │ url (VARCHAR 500) NULLABLE                                        │
│    │ method (VARCHAR 10) NULLABLE                                      │
│    │                                                                    │
│    │ created_at (TIMESTAMP) DEFAULT CURRENT_TIMESTAMP                  │
│    │                                                                    │
│    │ INDEXES:                                                           │
│    │   - INDEX(user_id)                                                │
│    │   - INDEX(action)                                                 │
│    │   - INDEX(model_type, model_id) -- Composite                      │
│    │   - INDEX(created_at)                                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Relationship Summary

### Visual Connection Map

```
                    USERS (11)
                       │
        ┌──────────────┼──────────────┬──────────────┬──────────────┐
        │ 1:*          │ 1:*          │ 1:*          │ 1:*          │ 1:*
        ▼              ▼              ▼              ▼              ▼
    REQUESTS       NOTIFICATIONS  AUDIT_LOGS     PAYMENTS     CERTIFICATES
      (36)            (10)          (15)           (14)          (18)
        │                                           │              │
        ├───────────────────────────────────────────┼──────────────┤
        │ 1:*                                       │ 1:*          │ 1:1
        ▼                                           ▼              ▼
     REPORTS                                    (to requests)  (to requests)
      (10)
```

### Relationship Table

| From Table | To Table | Type | Cardinality | Foreign Key | Cascade |
|-----------|----------|------|-------------|-------------|---------|
| users | requests | submits | 1:* | requests.user_id | SET NULL |
| users | notifications | receives | 1:* | notifications.user_id | CASCADE |
| users | audit_logs | generates | 1:* | audit_logs.user_id | SET NULL |
| users | reports | evaluates | 1:* | reports.evaluated_by | SET NULL |
| users | payments | submits | 1:* | payments.user_id | CASCADE |
| users | certificates | owns | 1:* | certificates.user_id | CASCADE |
| requests | reports | has | 1:* | reports.request_id | CASCADE |
| requests | payments | has | 1:* | payments.request_id | CASCADE |
| requests | certificates | has | 1:1 | certificates.request_id (UNIQUE) | CASCADE |

**Total Relationships: 9** (down from 13)

---

## Key Changes from Previous ERD

### 1. ❌ Removed GIS Tables
**Removed:**
- `property_locations` - Spatial coordinates, boundaries, GeoJSON
- `zoning_rules` - Zone classifications, dimensional requirements

**Replacement:**
- Simple text fields in `requests` table:
  - `location_street`
  - `location_barangay`
  - `location_city`
  - `location_province`
  - `lot_number`
  - `title_number`

**Impact:**
- ✅ No complex spatial queries
- ✅ No automated zoning validation
- ✅ Manual location review by staff
- ✅ Simpler data entry

### 2. ❌ Removed DSS Tables
**Removed:**
- `dss_evaluations` - Automated risk assessments
- `evaluation_risk_assessments` - Junction table
- `risk_factors` - Risk catalog

**Replacement:**
- Manual evaluation through `reports` table
- Staff reviews applications manually
- No automated compliance scoring
- No automated recommendation system

**Impact:**
- ✅ No AI/algorithmic decision making
- ✅ Staff-driven evaluation process
- ✅ Simpler workflow
- ✅ No risk scoring system

### 3. ✅ Kept Physical Payment System
**Retained:**
- `payments` table for physical receipt uploads

**Reason:**
- Tracks physical payment receipts (cash, check, bank transfer)
- Staff manually verifies payment authenticity
- No third-party payment gateway integration
- Simple file upload system

**Workflow:**
1. Applicant pays at bank/office
2. Applicant uploads receipt image
3. Staff verifies payment manually
4. Status updated to verified/rejected

### 4. ✅ Kept Physical Certificate Tracking
**Retained:**
- `certificates` table for physical certificate management

**Reason:**
- Tracks physical certificate preparation
- Manages pickup/release process
- No digital certificate download
- Manual release with signature tracking

**Workflow:**
1. Certificate printed physically
2. Status: preparing → ready_for_pickup
3. Applicant picks up in person
4. Staff records release with ID verification

---

## Benefits of Simplified System

### 1. **Reduced Complexity**
- Fewer tables (7 vs. 10)
- Fewer relationships (9 vs. 13)
- No spatial data complexity
- No AI/algorithmic components

### 2. **Simpler Implementation**
- No GIS libraries required
- No complex spatial queries
- No automated evaluation logic
- Standard CRUD operations only

### 3. **Lower Maintenance**
- No zoning rule updates required
- No risk factor maintenance
- No algorithm tuning
- Simple database backups

### 4. **Manual Control**
- Staff reviews all applications manually
- Staff verifies all payments manually
- Staff manages certificate release manually
- No automated decisions

### 5. **Lower Technical Requirements**
- Basic PHP/Laravel skills
- Standard MySQL database
- No PostGIS or spatial extensions
- No machine learning libraries

---

## System Workflow (Simplified)

### Application Process
1. **Submit Request** → Applicant fills form with text-based location
2. **Manual Review** → Staff reviews application details manually
3. **Report Creation** → Staff creates evaluation report
4. **Payment Upload** → Applicant uploads payment receipt
5. **Payment Verification** → Staff verifies payment manually
6. **Certificate Preparation** → Physical certificate printed
7. **Certificate Release** → Physical pickup with ID verification

### No Automated Steps
- ❌ No automated location validation
- ❌ No automated zoning compliance check
- ❌ No automated risk assessment
- ❌ No automated payment processing
- ❌ No digital certificate generation

### All Manual Steps
- ✅ Staff reviews all location data
- ✅ Staff checks zoning compliance (external reference)
- ✅ Staff evaluates risk factors
- ✅ Staff verifies payments
- ✅ Staff prepares physical certificates

---

## Database Statistics (Simplified)

| Category | Tables | Fields | Purpose |
|----------|--------|--------|---------|
| Core Business | 5 | ~88 | Users, requests, reports, payments, certificates |
| Supporting | 2 | ~25 | Notifications, audit logs |
| **TOTAL** | **7** | **~113** | - |

### Comparison with Previous Version

| Metric | Previous | Simplified | Change |
|--------|----------|------------|--------|
| Total Tables | 10 | 7 | -30% |
| Total Relationships | 13 | 9 | -31% |
| GIS Tables | 2 | 0 | -100% |
| DSS Tables | 3 | 0 | -100% |
| Complexity | High | Low | -70% |

---

## Migration Notes

### If Migrating from Full System

1. **Data Preservation:**
   - Copy location data from `property_locations` to `requests` text fields
   - Archive `dss_evaluations` data for historical reference
   - Keep `zoning_rules` data in separate reference document

2. **Feature Changes:**
   - Disable GIS map views
   - Remove automated evaluation features
   - Switch to manual verification workflows
   - Remove digital certificate download

3. **Training Required:**
   - Staff training on manual review process
   - Payment verification procedures
   - Certificate release procedures
   - Location verification methods

---

## Summary

This simplified ERD represents a **manual, staff-driven land certification system** without automated decision support, spatial analysis, online payment processing, or digital certificate generation.

**Core Principle**: Simple, manual processes with staff oversight at every step.

**Best For**:
- Small municipalities with limited IT resources
- Organizations preferring manual control
- Systems with low application volume
- Environments without GIS infrastructure

**Not Suitable For**:
- High-volume application processing
- Organizations requiring automated compliance checks
- Systems needing spatial analysis
- Environments requiring online payment processing

---

**END OF SIMPLIFIED ERD DOCUMENTATION**

**Related Documents**:
- Previous ERD (with DSS/GIS): See `ERD_NORMALIZED_FINAL.md`
- Database Schema: See `DATABASE_SCHEMA_COMPLETE.md`
- System Flow: See `SYSTEM_MAIN_FLOW.md`

**Last Updated**: August 3, 2026  
**Schema Version**: 2.0 (Simplified)  
**Status**: Simplified for Manual Operations
