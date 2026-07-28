# LandCert Database Schema - Complete Reference

**Document Version**: 1.0  
**Date**: June 16, 2026  
**Database**: cpdo_database  
**Total Tables**: 10  
**Total Fields**: 132  
**Total Relationships**: 13

---

## Table of Contents

1. [Overview](#overview)
2. [Database Statistics](#database-statistics)
3. [Table Definitions](#table-definitions)
4. [Relationship Diagram](#relationship-diagram)
5. [Index Strategy](#index-strategy)
6. [Data Types Reference](#data-types-reference)

---

## Overview

The LandCert database is a normalized relational database designed for a land certification management system with integrated GIS (Geographic Information System) and DSS (Decision Support System) capabilities.

### Key Features:
- **Normalized Structure**: 3rd Normal Form (3NF) compliant
- **GIS Integration**: Spatial data support with coordinates and boundaries
- **Decision Support**: Automated risk assessment and zoning compliance
- **Comprehensive Auditing**: Full activity tracking and change history
- **User Notifications**: Real-time alert system
- **Role-Based Access**: Four user levels (applicant, staff, admin, super_admin)

---

## Database Statistics

### Table Categories

| Category | Tables | Fields | Purpose |
|----------|--------|--------|---------|
| Core Business | 3 | 51 | Users, requests, reports |
| GIS System | 2 | 30 | Property locations, zoning rules |
| Decision Support | 3 | 26 | DSS evaluations, risk assessments |
| Supporting | 2 | 25 | Notifications, audit logs |
| **TOTAL** | **10** | **132** | - |

### Relationship Types

| Type | Count | Description |
|------|-------|-------------|
| One-to-Many (1:*) | 10 | Standard parent-child relationships |
| One-to-One (1:1) | 1 | Request ↔ Property Location (UNIQUE) |
| Many-to-One (*:1) | 1 | Property Locations → Zoning Rules |
| Many-to-Many (*:*) | 1 | DSS Evaluations ↔ Risk Factors (via junction) |
| **TOTAL** | **13** | - |

### Index Summary

| Index Type | Count | Purpose |
|------------|-------|---------|
| Primary Keys | 10 | Unique record identification |
| Foreign Keys | 12 | Referential integrity |
| Unique Constraints | 3 | Enforce uniqueness |
| Regular Indexes | 17+ | Query optimization |
| Composite Indexes | 3+ | Multi-column queries |
| **TOTAL** | **45+** | - |

---

## Table Definitions

### 1. USERS (Core - 11 Fields)

**Purpose**: User authentication and authorization

| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | INT(10) UNSIGNED | NO | PK | AUTO | User ID |
| name | VARCHAR(255) | NO | | | Full name |
| email | VARCHAR(255) | NO | UNI | | Email (login) |
| email_verified_at | TIMESTAMP | YES | | NULL | Verification timestamp |
| password | VARCHAR(255) | NO | | | Hashed password |
| contact_number | VARCHAR(255) | YES | | NULL | Phone number |
| address | TEXT | YES | | NULL | User address |
| user_type | ENUM | NO | | applicant | Role: applicant/staff/admin/super_admin |
| remember_token | VARCHAR(100) | YES | | NULL | Laravel token |
| created_at | TIMESTAMP | NO | | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | | NOW() | Update timestamp |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE KEY (email)

**Relationships**:
- → requests (1:*) via requests.user_id
- → notifications (1:*) via notifications.user_id
- → audit_logs (1:*) via audit_logs.user_id
- → reports (1:*) via reports.evaluated_by
- → dss_evaluations (1:*) via dss_evaluations.evaluated_by_user_id

---

### 2. REQUESTS (Core - 30 Fields)

**Purpose**: Land certification application data (consolidated)

| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | BIGINT(20) UNSIGNED | NO | PK | AUTO | Request ID |
| user_id | INT(10) UNSIGNED | YES | FK | NULL | Submitter → users.id |
| **APPLICANT INFO** |
| applicant_name | VARCHAR(255) | NO | IDX | | Applicant name |
| applicant_address | TEXT | NO | | | Applicant address |
| applicant_contact | VARCHAR(255) | YES | | NULL | Contact number |
| **CORPORATION (Optional)** |
| corporation_name | VARCHAR(255) | YES | | NULL | Company name |
| corporation_address | TEXT | YES | | NULL | Company address |
| **REPRESENTATIVE (Optional)** |
| authorized_representative_name | VARCHAR(255) | YES | | NULL | Rep name |
| authorized_representative_address | TEXT | YES | | NULL | Rep address |
| authorized_representative_email | VARCHAR(255) | YES | | NULL | Rep email |
| authorization_letter_path | VARCHAR(255) | YES | | NULL | Auth letter file |
| **PROJECT DETAILS** |
| project_type | VARCHAR(255) | NO | | | Project type |
| project_nature | VARCHAR(255) | NO | | | Project nature |
| project_nature_duration | ENUM | YES | | NULL | Permanent/Temporary |
| project_nature_years | INT(11) | YES | | NULL | Duration years |
| project_cost | TEXT | YES | | NULL | Estimated cost |
| **PROPERTY/LOT DETAILS** |
| lot_area_sqm | DECIMAL(10,2) | YES | | NULL | Lot area (m²) |
| bldg_improvement_sqm | DECIMAL(10,2) | YES | | NULL | Building area (m²) |
| right_over_land | ENUM | YES | | NULL | Owner/Lessee |
| existing_land_use | ENUM | YES | | NULL | Current land use |
| **PREVIOUS APPLICATIONS** |
| has_written_notice | ENUM | YES | | NULL | yes/no |
| notice_officer_name | VARCHAR(255) | YES | | NULL | Officer name |
| notice_dates | VARCHAR(255) | YES | | NULL | Notice dates |
| has_similar_application | ENUM | YES | | NULL | yes/no |
| similar_application_offices | TEXT | YES | | NULL | Other offices |
| similar_application_dates | VARCHAR(255) | YES | | NULL | Other dates |
| **RELEASE PREFERENCES** |
| preferred_release_mode | ENUM | YES | | NULL | pickup/mail options |
| release_address | TEXT | YES | | NULL | Mailing address |
| **STATUS** |
| status | ENUM | NO | IDX | pending | pending/approved/rejected |
| created_at | TIMESTAMP | NO | IDX | NOW() | Submission date |
| updated_at | TIMESTAMP | NO | | NOW() | Update date |

**Indexes**:
- PRIMARY KEY (id)
- FOREIGN KEY (user_id → users.id) ON DELETE SET NULL
- INDEX (user_id)
- INDEX (status)
- INDEX (applicant_name)
- INDEX (created_at)

**Relationships**:
- ← users (1:*) via user_id
- → property_locations (1:1 UNIQUE) via property_locations.request_id
- → reports (1:*) via reports.request_id
- → dss_evaluations (1:*) via dss_evaluations.request_id

---

### 3. PROPERTY_LOCATIONS (GIS - 14 Fields)

**Purpose**: Geographic property data and GIS integration

| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | BIGINT(20) UNSIGNED | NO | PK | AUTO | Location ID |
| request_id | BIGINT(20) UNSIGNED | NO | UNI | | → requests.id (1:1) |
| zoning_rule_id | BIGINT(20) UNSIGNED | YES | FK | NULL | → zoning_rules.id |
| **COORDINATES (GIS)** |
| latitude | DECIMAL(10,8) | NO | IDX | | Latitude (WGS84) |
| longitude | DECIMAL(11,8) | NO | IDX | | Longitude (WGS84) |
| boundaries | JSON | YES | | NULL | GeoJSON polygon |
| **ADDRESS (Hierarchical)** |
| street_address | VARCHAR(500) | NO | | | Street address |
| barangay | VARCHAR(255) | NO | IDX | | Barangay name |
| city_municipality | VARCHAR(255) | NO | IDX | | City/Municipality |
| province | VARCHAR(255) | NO | | | Province |
| district | VARCHAR(255) | YES | | NULL | District |
| **PROPERTY IDENTIFIERS** |
| lot_number | VARCHAR(255) | YES | | NULL | Lot number |
| title_number | VARCHAR(255) | YES | | NULL | Title number |
| lot_area_sqm | DECIMAL(10,2) | NO | | | Lot area (m²) |
| created_at | TIMESTAMP | NO | | NOW() | Creation date |
| | TIMESTAMP | NO | | NOW() | Update date |

**Indexes**:
- PRIMARY KEY (id)
- **UNIQUE KEY (request_id)** ⭐ Enforces 1:1 relationship
- FOREIGN KEY (request_id → requests.id) ON DELETE CASCADE
- FOREIGN KEY (zoning_rule_id → zoning_rules.id) ON DELETE SET NULL
- COMPOSITE INDEX (latitude, longitude) - Spatial queries
- INDEX (barangay)
- INDEX (city_municipality)
updated_at 
**Relationships**:
- ← requests (1:1 UNIQUE) via request_id
- ← zoning_rules (*:1) via zoning_rule_id
- → dss_evaluations (1:*) via dss_evaluations.property_location_id

---

### 4. ZONING_RULES (GIS - 16 Fields)

**Purpose**: Zoning regulations and spatial compliance rules

| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | BIGINT(20) UNSIGNED | NO | PK | AUTO | Rule ID |
| **ZONE IDENTIFICATION** |
| zone_code | VARCHAR(50) | NO | UNI | | Zone code (R-1, C-2) |
| zone_name | VARCHAR(255) | NO | | | Zone name |
| zone_type | ENUM | NO | IDX | | residential/commercial/industrial/agricultural/mixed |
| description | TEXT | YES | | NULL | Description |
| **ALLOWED USES** |
| allowed_uses | JSON | NO | | | Array of permitted uses |
| **DIMENSIONAL REQUIREMENTS** |
| min_lot_area_sqm | DECIMAL(10,2) | YES | | NULL | Min lot area (m²) |
| max_lot_area_sqm | DECIMAL(10,2) | YES | | NULL | Max lot area (m²) |
| max_building_height_m | DECIMAL(8,2) | YES | | NULL | Max height (m) |
| max_floor_area_ratio | DECIMAL(5,2) | YES | | NULL | Max FAR |
| **SETBACK REQUIREMENTS (meters)** |
| min_setback_front_m | DECIMAL(8,2) | YES | | NULL | Front setback (m) |
| min_setback_rear_m | DECIMAL(8,2) | YES | | NULL | Rear setback (m) |
| min_setback_side_m | DECIMAL(8,2) | YES | | NULL | Side setback (m) |
| **RESTRICTIONS** |
| distance_restrictions | JSON | YES | | NULL | Distance limits (JSON) |
| environmental_restrictions | JSON | YES | | NULL | Env constraints (JSON) |
| is_active | BOOLEAN | NO | IDX | TRUE | Active flag |
| created_at | TIMESTAMP | NO | | NOW() | Creation date |
| updated_at | TIMESTAMP | NO | | NOW() | Update date |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE KEY (zone_code)
- INDEX (zone_type)
- INDEX (is_active)

**Relationships**:
- → property_locations (1:*) via property_locations.zoning_rule_id

---

### 5. DSS_EVALUATIONS (DSS - 11 Fields)

**Purpose**: Decision Support System assessment results

| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | BIGINT(20) UNSIGNED | NO | PK | AUTO | Evaluation ID |
| request_id | BIGINT(20) UNSIGNED | NO | FK | | → requests.id |
| property_location_id | BIGINT(20) UNSIGNED | NO | FK | | → property_locations.id |
| evaluated_by_user_id | INT(10) UNSIGNED | YES | FK | NULL | → users.id |
| **ASSESSMENT RESULTS** |
| recommendation | ENUM | NO | IDX | | approve/deny/review_required |
| compliance_score | INT(11) | NO | | 0 | Score 0-100 |
| risk_score | INT(11) | NO | | 0 | Score 0-100 |
| **VALIDATION DETAILS** |
| validation_results | JSON | NO | | | Check results (JSON) |
| violations | JSON | YES | | NULL | Violations found (JSON) |
| warnings | JSON | YES | | NULL | Warnings (JSON) |
| ai_suggestion | TEXT | YES | | NULL | AI recommendation |
| evaluated_at | TIMESTAMP | YES | | NULL | Evaluation timestamp |
| created_at | TIMESTAMP | NO | | NOW() | Creation date |
| updated_at | TIMESTAMP | NO | | NOW() | Update date |

**Indexes**:
- PRIMARY KEY (id)
- FOREIGN KEY (request_id → requests.id) ON DELETE CASCADE
- FOREIGN KEY (property_location_id → property_locations.id) ON DELETE CASCADE
- FOREIGN KEY (evaluated_by_user_id → users.id) ON DELETE SET NULL
- INDEX (request_id)
- INDEX (property_location_id)
- INDEX (recommendation)
- INDEX (evaluated_by_user_id)

**Relationships**:
- ← requests (1:*) via request_id
- ← property_locations (1:*) via property_location_id
- ← users (1:*) via evaluated_by_user_id
- → evaluation_risk_assessments (1:*) via evaluation_risk_assessments.dss_evaluation_id
- ↔ risk_factors (*:*) through evaluation_risk_assessments

---

### 6. EVALUATION_RISK_ASSESSMENTS (DSS Junction - 7 Fields)

**Purpose**: Many-to-many junction between DSS evaluations and risk factors

| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | BIGINT(20) UNSIGNED | NO | PK | AUTO | Assessment ID |
| dss_evaluation_id | BIGINT(20) UNSIGNED | NO | FK+UNI | | → dss_evaluations.id |
| risk_factor_id | BIGINT(20) UNSIGNED | NO | FK+UNI | | → risk_factors.id |
| is_present | BOOLEAN | NO | | FALSE | Risk present flag |
| severity | INT(11) | NO | | 0 | Severity 0-10 |
| notes | TEXT | YES | | NULL | Assessment notes |
| created_at | TIMESTAMP | NO | | NOW() | Creation date |
| updated_at | TIMESTAMP | NO | | NOW() | Update date |

**Indexes**:
- PRIMARY KEY (id)
- FOREIGN KEY (dss_evaluation_id → dss_evaluations.id) ON DELETE CASCADE
- FOREIGN KEY (risk_factor_id → risk_factors.id) ON DELETE CASCADE
- INDEX (dss_evaluation_id)
- INDEX (risk_factor_id)
- **UNIQUE KEY (dss_evaluation_id, risk_factor_id)** - Prevent duplicates

**Relationships**:
- ← dss_evaluations (1:*) via dss_evaluation_id
- ← risk_factors (1:*) via risk_factor_id

---

### 7. RISK_FACTORS (DSS Reference - 8 Fields)

**Purpose**: Risk factor catalog for assessments

| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | BIGINT(20) UNSIGNED | NO | PK | AUTO | Factor ID |
| factor_name | VARCHAR(255) | NO | IDX | | Risk factor name |
| category | ENUM | NO | IDX | | environmental/safety/land_use/infrastructure |
| description | TEXT | NO | | | Detailed description |
| weight | INT(11) | NO | | 5 | Importance 1-10 |
| criteria | JSON | NO | | | Check criteria (JSON) |
| is_active | BOOLEAN | NO | IDX | TRUE | Active flag |
| created_at | TIMESTAMP | NO | | NOW() | Creation date |
| updated_at | TIMESTAMP | NO | | NOW() | Update date |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (category)
- INDEX (is_active)
- INDEX (factor_name)

**Relationships**:
- → evaluation_risk_assessments (1:*) via evaluation_risk_assessments.risk_factor_id
- ↔ dss_evaluations (*:*) through evaluation_risk_assessments

---

### 8. REPORTS (Supporting - 10 Fields)

**Purpose**: Evaluation reports and findings

| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | BIGINT(20) UNSIGNED | NO | PK | AUTO | Report ID |
| request_id | BIGINT(20) UNSIGNED | NO | FK | | → requests.id |
| evaluated_by | INT(10) UNSIGNED | YES | FK | NULL | → users.id |
| description | TEXT | YES | | NULL | Findings |
| evaluation | ENUM | NO | IDX | pending | pending/under_review/approved/rejected |
| amount | DECIMAL(12,2) | YES | | NULL | Fee amount |
| date_certified | DATE | YES | | NULL | Certificate date |
| date_reported | DATETIME | YES | IDX | NULL | Report date |
| issued_by_name | VARCHAR(255) | YES | | NULL | Issuer name |
| created_at | TIMESTAMP | NO | | NOW() | Creation date |
| updated_at | TIMESTAMP | NO | | NOW() | Update date |

**Indexes**:
- PRIMARY KEY (id)
- FOREIGN KEY (request_id → requests.id) ON DELETE CASCADE
- FOREIGN KEY (evaluated_by → users.id) ON DELETE SET NULL
- INDEX (request_id)
- INDEX (evaluated_by)
- INDEX (evaluation)
- INDEX (date_reported)

**Relationships**:
- ← requests (1:*) via request_id
- ← users (1:*) via evaluated_by

---

### 9. NOTIFICATIONS (Supporting - 10 Fields)

**Purpose**: User notification system

| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | BIGINT(20) UNSIGNED | NO | PK | AUTO | Notification ID |
| user_id | INT(10) UNSIGNED | NO | FK | | → users.id |
| type | VARCHAR(100) | NO | IDX | | Notification type |
| title | VARCHAR(255) | NO | | | Notification title |
| message | TEXT | NO | | | Message content |
| link | VARCHAR(255) | YES | | NULL | Action link |
| data | JSON | YES | | NULL | Additional data |
| read | BOOLEAN | NO | IDX | FALSE | Read flag |
| read_at | TIMESTAMP | YES | | NULL | Read timestamp |
| created_at | TIMESTAMP | NO | IDX | NOW() | Creation date |
| updated_at | TIMESTAMP | NO | | NOW() | Update date |

**Indexes**:
- PRIMARY KEY (id)
- FOREIGN KEY (user_id → users.id) ON DELETE CASCADE
- COMPOSITE INDEX (user_id, read, created_at) - Unread queries
- INDEX (type)

**Relationships**:
- ← users (1:*) via user_id

---

### 10. AUDIT_LOGS (Supporting - 15 Fields)

**Purpose**: System activity tracking and audit trail

| Field | Type | Null | Key | Default | Description |
|-------|------|------|-----|---------|-------------|
| id | BIGINT(20) UNSIGNED | NO | PK | AUTO | Log ID |
| user_id | INT(10) UNSIGNED | YES | FK | NULL | → users.id |
| **USER INFO (Cached)** |
| user_name | VARCHAR(255) | YES | | NULL | Cached name |
| user_email | VARCHAR(255) | YES | | NULL | Cached email |
| user_type | VARCHAR(50) | YES | | NULL | Cached role |
| **ACTION DETAILS** |
| action | VARCHAR(100) | NO | IDX | | Action type |
| model_type | VARCHAR(100) | YES | IDX | NULL | Model class |
| model_id | BIGINT(20) | YES | IDX | NULL | Model ID |
| description | VARCHAR(500) | NO | | | Action description |
| **CHANGE TRACKING** |
| old_values | JSON | YES | | NULL | Before values |
| new_values | JSON | YES | | NULL | After values |
| **REQUEST METADATA** |
| ip_address | VARCHAR(45) | YES | | NULL | IP address |
| user_agent | VARCHAR(500) | YES | | NULL | Browser info |
| url | VARCHAR(500) | YES | | NULL | Request URL |
| method | VARCHAR(10) | YES | | NULL | HTTP method |
| created_at | TIMESTAMP | NO | IDX | NOW() | Action timestamp |

**Indexes**:
- PRIMARY KEY (id)
- FOREIGN KEY (user_id → users.id) ON DELETE SET NULL
- INDEX (user_id)
- INDEX (action)
- COMPOSITE INDEX (model_type, model_id)
- INDEX (created_at)
- COMPOSITE INDEX (user_id, created_at)

**Relationships**:
- ← users (1:*) via user_id

---

## Relationship Diagram

### Visual Connection Map

```
                    USERS (11)
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │ 1:*          │ 1:*          │ 1:*          │ 1:*
        ▼              ▼              ▼              ▼
    REQUESTS(30)  NOTIFICATIONS AUDIT_LOGS   REPORTS(10)
        │             (10)         (15)           │
        │                                         │
    ┌───┴───┬────────────┐                       │
    │ 1:1   │ 1:*        │ 1:*                   │
    ▼       ▼            ▼                       │
PROPERTY  REPORTS   DSS_EVAL(11)                 │
LOCATIONS  (10)         │                        │
  (14)                  │                        │
    │                   ├────────────────────────┘
    │ *:1               │ 1:*
    ▼                   ▼
ZONING_RULES    EVAL_RISK_ASSESSMENTS(7)
  (16)                  │ *:1
                        ▼
                   RISK_FACTORS(8)
```

### Relationship Details Table

| # | From | To | Type | Foreign Key | Cascade |
|---|------|-----|------|-------------|---------|
| 1 | users | requests | 1:* | requests.user_id | SET NULL |
| 2 | users | notifications | 1:* | notifications.user_id | CASCADE |
| 3 | users | audit_logs | 1:* | audit_logs.user_id | SET NULL |
| 4 | users | reports | 1:* | reports.evaluated_by | SET NULL |
| 5 | users | dss_evaluations | 1:* | dss_evaluations.evaluated_by_user_id | SET NULL |
| 6 | requests | reports | 1:* | reports.request_id | CASCADE |
| 7 | **requests** | **property_locations** | **1:1** ⭐ | **property_locations.request_id (UNIQUE)** | **CASCADE** |
| 8 | requests | dss_evaluations | 1:* | dss_evaluations.request_id | CASCADE |
| 9 | property_locations | zoning_rules | *:1 | property_locations.zoning_rule_id | SET NULL |
| 10 | property_locations | dss_evaluations | 1:* | dss_evaluations.property_location_id | CASCADE |
| 11 | dss_evaluations | evaluation_risk_assessments | 1:* | evaluation_risk_assessments.dss_evaluation_id | CASCADE |
| 12 | risk_factors | evaluation_risk_assessments | 1:* | evaluation_risk_assessments.risk_factor_id | CASCADE |
| 13 | dss_evaluations | risk_factors | *:* | through evaluation_risk_assessments | - |

---

## Index Strategy

### Primary Purpose

| Index Type | Count | Purpose | Example |
|------------|-------|---------|---------|
| Primary Keys | 10 | Unique identification | users.id |
| Foreign Keys | 12 | Referential integrity | requests.user_id → users.id |
| Unique Constraints | 3 | Enforce uniqueness | users.email, property_locations.request_id |
| Regular Indexes | 17+ | Query optimization | requests.status, users.user_type |
| Composite Indexes | 3+ | Multi-column queries | (user_id, read, created_at) |

### Unique Constraints (Critical)

1. **users.email** - Prevent duplicate accounts
2. **property_locations.request_id** ⭐ - Enforce 1:1 relationship
3. **zoning_rules.zone_code** - Unique zone identifiers

### Composite Indexes (Performance)

1. **notifications (user_id, read, created_at)** - Unread notification queries
2. **audit_logs (model_type, model_id)** - Model activity lookups
3. **audit_logs (user_id, created_at)** - User activity timeline
4. **property_locations (latitude, longitude)** - Spatial queries

---

## Data Types Reference

### Numeric Types Usage

| Type | Count | Usage | Example Field |
|------|-------|-------|---------------|
| INT(10) UNSIGNED | 5 | User IDs | users.id |
| INT(11) | 7 | Scores, years, severity | dss_evaluations.compliance_score |
| BIGINT(20) UNSIGNED | 18 | Primary/Foreign keys | requests.id |
| DECIMAL(10,2) | 10 | Areas (m²) | lot_area_sqm |
| DECIMAL(11,8) | 1 | Longitude | property_locations.longitude |
| DECIMAL(10,8) | 1 | Latitude | property_locations.latitude |
| DECIMAL(8,2) | 4 | Heights, setbacks (m) | max_building_height_m |
| DECIMAL(12,2) | 1 | Money amounts | reports.amount |
| DECIMAL(5,2) | 1 | Ratios | max_floor_area_ratio |
| BOOLEAN/TINYINT(1) | 5 | Flags | notifications.read |

### String Types Usage

| Type | Count | Usage | Example Field |
|------|-------|-------|---------------|
| VARCHAR(50) | 1 | Short codes | zoning_rules.zone_code |
| VARCHAR(100) | 4 | Medium text | notifications.type |
| VARCHAR(255) | 36 | Standard text | users.name, requests.applicant_name |
| VARCHAR(500) | 3 | Long text | property_locations.street_address |
| TEXT | 18 | Large text | requests.applicant_address |

### Date/Time Types Usage

| Type | Count | Usage | Example Field |
|------|-------|-------|---------------|
| DATE | 1 | Dates only | reports.date_certified |
| DATETIME | 1 | Date + time | reports.date_reported |
| TIMESTAMP | 20 | Auto timestamps | created_at, updated_at |

### Special Types Usage

| Type | Count | Usage | Example Field |
|------|-------|-------|---------------|
| ENUM | 11 | Status, categories | requests.status, users.user_type |
| JSON | 9 | Complex data | property_locations.boundaries, dss_evaluations.violations |

---

## Database Creation Script

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS cpdo_database 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE cpdo_database;

-- Set default engine and charset
SET default_storage_engine=InnoDB;
SET NAMES utf8mb4;
```

---

## Maintenance Notes

### Backup Strategy
- Daily full backups recommended
- Transaction log backups every 4 hours
- Test restore procedures monthly

### Performance Monitoring
- Monitor slow queries (> 2 seconds)
- Check index usage monthly
- Analyze table sizes quarterly

### Data Retention
- Audit logs: Retain 2 years
- Notifications: Archive after 1 year
- Applications: Permanent retention

---

**END OF DATABASE SCHEMA DOCUMENTATION**

**Related Documents**:
- Detailed ERD: See `ERD_ULTRA_DETAILED_PART1.md` through `PART4.md`
- Normalization Guide: See `DATABASE_NORMALIZATION_SUMMARY.md`
- Implementation Guide: See `DATABASE_NORMALIZATION_IMPLEMENTATION_GUIDE.md`
- Visual Diagram: See `ERD_COMPLETE_SKETCH_ALL_CONNECTIONS.md`

**Last Updated**: June 16, 2026  
**Schema Version**: 1.0 (Normalized)  
**Status**: Production Ready
