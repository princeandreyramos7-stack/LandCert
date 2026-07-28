# Entity Relationship Diagram - ULTRA DETAILED (All Fields with Data Types)

**Figure 2-15. LandCert Normalized ERD - Complete Specification (Part 4 of 4 - FINAL)**

## TABLE 8: REPORTS (10 Fields) - Evaluation Reports

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          REPORTS (Evaluation Reports)                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ PK │ id                                                                      │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Auto Increment: YES                                                   │
│    │   Nullable: NO                                                          │
│    │   Primary Key: YES                                                      │
│    │   Note: Uses 'id' not 'report_id' in normalized structure               │
│    │                                                                          │
│ FK │ request_id                                                              │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Nullable: NO                                                          │
│    │   Foreign Key: → requests.id                                            │
│    │   On Delete: CASCADE                                                    │
│    │   On Update: CASCADE                                                    │
│    │   Index: YES (reports_request_id_index)                                 │
│    │   Description: Reference to application request                         │
│    │                                                                          │
│ FK │ evaluated_by                                                            │
│    │   Type: INT(10) UNSIGNED                                                │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Foreign Key: → users.id                                               │
│    │   On Delete: SET NULL                                                   │
│    │   On Update: CASCADE                                                    │
│    │   Index: YES (reports_evaluated_by_index)                               │
│    │   Description: Admin/staff who created report                           │
│    │                                                                          │
│    │ description                                                             │
│    │   Type: TEXT                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Evaluation findings and comments                         │
│    │                                                                          │
│    │ evaluation                                                              │
│    │   Type: ENUM('pending', 'under_review', 'approved', 'rejected')         │
│    │   Nullable: NO                                                          │
│    │   Default: 'pending'                                                    │
│    │   Index: YES (reports_evaluation_index)                                 │
│    │   Description: Evaluation status/decision                               │
│    │                                                                          │
│    │ amount                                                                  │
│    │   Type: DECIMAL(12,2)                                                   │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Fee amount if applicable                                 │
│    │                                                                          │
│    │ date_certified                                                          │
│    │   Type: DATE                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Date when certificate was issued                         │
│    │                                                                          │
│    │ date_reported                                                           │
│    │   Type: DATETIME                                                        │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Index: YES (reports_date_reported_index)                              │
│    │   Description: When report was generated                                │
│    │                                                                          │
│    │ issued_by_name                                                          │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Name of issuing officer                                  │
│    │                                                                          │
│    │ created_at                                                              │
│    │   Type: TIMESTAMP                                                       │
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
│   - FOREIGN KEY (request_id → requests.id)                                   │
│   - FOREIGN KEY (evaluated_by → users.id)                                    │
│   - INDEX reports_request_id_index (request_id)                              │
│   - INDEX reports_evaluated_by_index (evaluated_by)                          │
│   - INDEX reports_evaluation_index (evaluation)                              │
│   - INDEX reports_date_reported_index (date_reported)                        │
│                                                                              │
│ RELATIONSHIPS:                                                               │
│   ← requests (1:*) via request_id                                            │
│   ← users (1:*) via evaluated_by                                             │
│                                                                              │
│ TOTAL FIELDS: 10                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## TABLE 9: NOTIFICATIONS (10 Fields) - User Notifications

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATIONS (System Alerts)                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ PK │ id                                                                      │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Auto Increment: YES                                                   │
│    │   Nullable: NO                                                          │
│    │   Primary Key: YES                                                      │
│    │                                                                          │
│ FK │ user_id                                                                 │
│    │   Type: INT(10) UNSIGNED                                                │
│    │   Nullable: NO                                                          │
│    │   Foreign Key: → users.id                                               │
│    │   On Delete: CASCADE                                                    │
│    │   On Update: CASCADE                                                    │
│    │   Index: YES (composite: user_id_read_created_at_index)                 │
│    │   Description: User who receives notification                           │
│    │                                                                          │
│    │ type                                                                    │
│    │   Type: VARCHAR(100)                                                    │
│    │   Nullable: NO                                                          │
│    │   Index: YES (notifications_type_index)                                 │
│    │   Values: application_submitted, application_approved,                  │
│    │          application_rejected, under_review, document_pending,          │
│    │          payment_pending, certificate_ready, etc.                       │
│    │   Description: Notification type/category                               │
│    │                                                                          │
│    │ title                                                                   │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Description: Notification title/subject                               │
│    │                                                                          │
│    │ message                                                                 │
│    │   Type: TEXT                                                            │
│    │   Nullable: NO                                                          │
│    │   Description: Full notification message content                        │
│    │                                                                          │
│    │ link                                                                    │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: URL link to related page/action                          │
│    │                                                                          │
│    │ data                                                                    │
│    │   Type: JSON                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Format: Additional metadata object                                    │
│    │   Example: {"request_id":123,"status":"approved"}                      │
│    │   Description: Additional contextual data                               │
│    │                                                                          │
│    │ read                                                                    │
│    │   Type: BOOLEAN (TINYINT 1)                                             │
│    │   Nullable: NO                                                          │
│    │   Default: FALSE (0)                                                    │
│    │   Index: YES (composite: user_id_read_created_at_index)                 │
│    │   Description: Whether notification has been read                       │
│    │                                                                          │
│    │ read_at                                                                 │
│    │   Type: TIMESTAMP                                                       │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: When notification was marked as read                     │
│    │                                                                          │
│    │ created_at                                                              │
│    │   Type: TIMESTAMP                                                       │
│    │   Nullable: NO                                                          │
│    │   Default: CURRENT_TIMESTAMP                                            │
│    │   Index: YES (composite: user_id_read_created_at_index)                 │
│    │   Description: When notification was created                            │
│    │                                                                          │
│    │ updated_at                                                              │
│    │   Type: TIMESTAMP                                                       │
│    │   Nullable: NO                                                          │
│    │   Default: CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP                │
│    │   Description: Last modification timestamp                              │
│    │                                                                          │
│ INDEXES:                                                                     │
│   - PRIMARY KEY (id)                                                         │
│   - FOREIGN KEY (user_id → users.id)                                         │
│   - COMPOSITE INDEX user_id_read_created_at_index                            │
│     (user_id, read, created_at) - Optimized for unread queries               │
│   - INDEX notifications_type_index (type)                                    │
│                                                                              │
│ RELATIONSHIPS:                                                               │
│   ← users (1:*) via user_id                                                  │
│                                                                              │
│ TOTAL FIELDS: 10                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## TABLE 10: AUDIT_LOGS (15 Fields) - System Activity Tracking

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     AUDIT_LOGS (Activity Tracking)                           │
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
│    │   Index: YES (audit_logs_user_id_index)                                 │
│    │   Description: User who performed action                                │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 1: USER INFORMATION (Cached) - 3 fields                         │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ user_name                                                               │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Cached user name (preserved if user deleted)             │
│    │                                                                          │
│    │ user_email                                                              │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Cached user email                                        │
│    │                                                                          │
│    │ user_type                                                               │
│    │   Type: VARCHAR(50)                                                     │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Cached user role                                         │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 2: ACTION DETAILS - 4 fields                                    │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ action                                                                  │
│    │   Type: VARCHAR(100)                                                    │
│    │   Nullable: NO                                                          │
│    │   Index: YES (audit_logs_action_index)                                  │
│    │   Values: created, updated, deleted, viewed, exported,                  │
│    │          approved, rejected, login, logout, etc.                        │
│    │   Description: Type of action performed                                 │
│    │                                                                          │
│    │ model_type                                                              │
│    │   Type: VARCHAR(100)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Index: YES (composite: model_type_model_id_index)                     │
│    │   Values: Request, Report, User, DSS_Evaluation, etc.                   │
│    │   Description: Laravel model class name                                 │
│    │                                                                          │
│    │ model_id                                                                │
│    │   Type: BIGINT(20)                                                      │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Index: YES (composite: model_type_model_id_index)                     │
│    │   Description: ID of affected model record                              │
│    │                                                                          │
│    │ description                                                             │
│    │   Type: VARCHAR(500)                                                    │
│    │   Nullable: NO                                                          │
│    │   Description: Human-readable action description                        │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 3: CHANGE TRACKING - 2 fields (JSON)                            │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ old_values                                                              │
│    │   Type: JSON                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Format: Object with previous field values                             │
│    │   Example: {"status":"pending","evaluation":"under_review"}            │
│    │   Description: Values before change (for updates)                       │
│    │                                                                          │
│    │ new_values                                                              │
│    │   Type: JSON                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Format: Object with new field values                                  │
│    │   Example: {"status":"approved","evaluation":"approved"}               │
│    │   Description: Values after change (for creates/updates)                │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 4: REQUEST METADATA - 4 fields                                  │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ ip_address                                                              │
│    │   Type: VARCHAR(45)                                                     │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Format: IPv4 or IPv6                                                  │
│    │   Description: IP address of user                                       │
│    │                                                                          │
│    │ user_agent                                                              │
│    │   Type: VARCHAR(500)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Browser/client user agent string                         │
│    │                                                                          │
│    │ url                                                                     │
│    │   Type: VARCHAR(500)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Request URL path                                         │
│    │                                                                          │
│    │ method                                                                  │
│    │   Type: VARCHAR(10)                                                     │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Values: GET, POST, PUT, DELETE, PATCH                                 │
│    │   Description: HTTP request method                                      │
│    │                                                                          │
│    │ created_at                                                              │
│    │   Type: TIMESTAMP                                                       │
│    │   Nullable: NO                                                          │
│    │   Default: CURRENT_TIMESTAMP                                            │
│    │   Index: YES (audit_logs_created_at_index)                              │
│    │   Composite Index: YES (user_id, created_at)                            │
│    │   Description: When action occurred                                     │
│    │                                                                          │
│ INDEXES:                                                                     │
│   - PRIMARY KEY (id)                                                         │
│   - FOREIGN KEY (user_id → users.id)                                         │
│   - INDEX audit_logs_user_id_index (user_id)                                 │
│   - INDEX audit_logs_action_index (action)                                   │
│   - COMPOSITE INDEX model_type_model_id_index (model_type, model_id)         │
│   - INDEX audit_logs_created_at_index (created_at)                           │
│   - COMPOSITE INDEX user_id_created_at_index (user_id, created_at)           │
│                                                                              │
│ RELATIONSHIPS:                                                               │
│   ← users (1:*) via user_id                                                  │
│                                                                              │
│ SPECIAL FEATURES:                                                            │
│   - Caches user info (name, email, type) to preserve audit trail            │
│   - Tracks before/after values for all changes                              │
│   - Records HTTP request metadata for security                              │
│   - Optimized indexes for common queries (by user, by date, by model)       │
│                                                                              │
│ TOTAL FIELDS: 15                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## ═══════════════════════════════════════════════════════════════════════════
## COMPLETE DATABASE SUMMARY - ALL 10 TABLES
## ═══════════════════════════════════════════════════════════════════════════

### Total Field Count by Table

| # | Table Name | Fields | Category |
|---|-----------|--------|----------|
| 1 | users | 11 | Core |
| 2 | requests | 30 | Core |
| 3 | property_locations | 14 | GIS |
| 4 | zoning_rules | 16 | GIS |
| 5 | dss_evaluations | 11 | DSS |
| 6 | evaluation_risk_assessments | 7 | DSS |
| 7 | risk_factors | 8 | DSS |
| 8 | reports | 10 | Supporting |
| 9 | notifications | 10 | Supporting |
| 10 | audit_logs | 15 | Supporting |

**GRAND TOTAL: 132 FIELDS** across 10 tables

---

### Relationship Summary (All 13 Relationships)

| From | To | Type | Foreign Key | Cascade |
|------|-----|------|-------------|---------|
| users | requests | 1:* | requests.user_id | SET NULL |
| users | notifications | 1:* | notifications.user_id | CASCADE |
| users | audit_logs | 1:* | audit_logs.user_id | SET NULL |
| users | reports | 1:* | reports.evaluated_by | SET NULL |
| users | dss_evaluations | 1:* | dss_evaluations.evaluated_by_user_id | SET NULL |
| requests | reports | 1:* | reports.request_id | CASCADE |
| requests | property_locations | 1:1 | property_locations.request_id (UNIQUE) | CASCADE |
| requests | dss_evaluations | 1:* | dss_evaluations.request_id | CASCADE |
| property_locations | zoning_rules | *:1 | property_locations.zoning_rule_id | SET NULL |
| property_locations | dss_evaluations | 1:* | dss_evaluations.property_location_id | CASCADE |
| dss_evaluations | evaluation_risk_assessments | 1:* | evaluation_risk_assessments.dss_evaluation_id | CASCADE |
| risk_factors | evaluation_risk_assessments | 1:* | evaluation_risk_assessments.risk_factor_id | CASCADE |
| dss_evaluations | risk_factors | *:* | through evaluation_risk_assessments | - |

---

### Index Summary (Total: 42+ Indexes)

**Primary Keys**: 10 (one per table)
**Foreign Keys**: 12
**Unique Constraints**: 3 (users.email, property_locations.request_id, zoning_rules.zone_code)
**Regular Indexes**: 17+
**Composite Indexes**: 3+

---

### Data Type Usage Summary

**Numeric Types**:
- INT(10) UNSIGNED: 5 fields (user IDs)
- INT(11): 7 fields (scores, years, severity)
- BIGINT(20) UNSIGNED: 18 fields (primary/foreign keys)
- DECIMAL(10,2): 10 fields (areas)
- DECIMAL(11,8): 1 field (longitude)
- DECIMAL(10,8): 1 field (latitude)
- DECIMAL(8,2): 4 fields (heights, setbacks)
- DECIMAL(12,2): 1 field (amount)
- DECIMAL(5,2): 1 field (ratio)
- BOOLEAN/TINYINT(1): 5 fields (flags)

**String Types**:
- VARCHAR(50): 1 field
- VARCHAR(100): 4 fields
- VARCHAR(255): 36 fields
- VARCHAR(500): 3 fields
- TEXT: 18 fields

**Date/Time Types**:
- DATE: 1 field
- DATETIME: 1 field
- TIMESTAMP: 20 fields (created_at, updated_at)

**Special Types**:
- ENUM: 11 fields (status, categories, types)
- JSON: 9 fields (spatial, validation, metadata)

---

## END OF ULTRA DETAILED ERD - COMPLETE! ✅

**Total Documentation**:
- **4 Parts** covering all 10 tables
- **132 Fields** with complete specifications
- **13 Relationships** fully documented
- **42+ Indexes** specified
- **All data types, constraints, nullability, defaults included**

This is the most comprehensive ERD documentation for the LandCert normalized database.

---

**Document Version**: 1.0  
**Date**: June 16, 2026  
**Status**: COMPLETE - All Fields Documented  
**Figure Number**: 2-15 (Parts 1-4)
