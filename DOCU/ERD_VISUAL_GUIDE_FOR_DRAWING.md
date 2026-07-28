# ERD Visual Guide - Complete with All Connections

**Reference Guide for Drawing Entity Relationship Diagram**

---

## Table Overview (10 Tables)

### Core Tables (3)
1. USERS
2. REQUESTS
3. REPORTS

### GIS Tables (2)
4. PROPERTY_LOCATIONS
5. ZONING_RULES

### DSS Tables (3)
6. DSS_EVALUATIONS
7. EVALUATION_RISK_ASSESSMENTS
8. RISK_FACTORS

### System Tables (2)
9. NOTIFICATIONS
10. AUDIT_LOGS

---

## Complete Visual ERD with Connections

```
                    ┌──────────────────────────┐
                    │         USERS            │
                    ├──────────────────────────┤
                    │ PK: id (INT)             │
                    │     name                 │
                    │     email (UNIQUE)       │
                    │     password             │
                    │     contact_number       │
                    │     address              │
                    │     user_type (ENUM)     │
                    │     email_verified_at    │
                    │     remember_token       │
                    │     created_at           │
                    │     updated_at           │
                    └──────────────────────────┘
                          │      │       │       │       │
           ┌──────────────┘      │       │       │       └──────────────┐
           │ 1                   │       │       │                      │ 1
           │ submits             │       │       │                      │ evaluates
           │                     │       │       │                      │
           │ *                   │       │       │                      │ *
           │                     │       │       │                      │
           ▼                     │       │       │                      │
┌────────────────────────┐       │       │       │                      │
│       REQUESTS         │       │       │       │                      │
├────────────────────────┤       │       │       │                      │
│ PK: id (BIGINT)        │       │       │       │                      │
│ FK: user_id → users.id │       │       │       │                      │
│     applicant_name     │       │       │       │                      │
│     applicant_address  │       │       │       │                      │
│     corporation_name   │       │       │       │                      │
│     corporation_addr   │       │       │       │                      │
│     representative_*   │       │       │       │                      │
│     project_type       │       │       │       │                      │
│     project_nature     │       │       │       │                      │
│     lot_area_sqm       │       │       │       │                      │
│     existing_land_use  │       │       │       │                      │
│     status (ENUM)      │       │       │       │                      │
│     ... (30 fields)    │       │       │       │                      │
│     created_at         │       │       │       │                      │
│     updated_at         │       │       │       │                      │
└────────────────────────┘       │       │       │                      │
           │        │             │       │       │                      │
           │ 1      │ 1           │       │       │                      │
           │ has    │ located at  │       │       │                      │
           │        │             │       │       │                      │
           │ *      │ 1 (UNIQUE)  │       │       │                      │
           │        │             │       │       │                      │
           ▼        ▼             │       │       │                      │
┌──────────────┐  ┌───────────────────────────┐   │                     │
│   REPORTS    │  │   PROPERTY_LOCATIONS      │   │                     │
├──────────────┤  ├───────────────────────────┤   │                     │
│PK:id (BIGINT)│  │ PK: id (BIGINT)           │   │                     │
│FK:request_id │  │ FK: request_id (UNIQUE)   │   │                     │
│  →requests.id│  │     → requests.id         │   │                     │
│FK:evaluated  │◄─┼─────────────────────────────┼─┼─────────────────────┘
│  _by         │  │ FK: zoning_rule_id        │   │ 1
│  →users.id   │  │     → zoning_rules.id     │   │ receives
│  description │  │     latitude (DECIMAL)    │   │
│  evaluation  │  │     longitude (DECIMAL)   │   │ *
│  (ENUM)      │  │     boundaries (JSON)     │   │
│  amount      │  │     street_address        │   ▼
│  date_cert   │  │     barangay              │  ┌──────────────────┐
│  date_report │  │     city_municipality     │  │  NOTIFICATIONS   │
│  issued_by   │  │     province              │  ├──────────────────┤
│  created_at  │  │     district              │  │PK:id (BIGINT)    │
│  updated_at  │  │     lot_number            │  │FK:user_id        │
└──────────────┘  │     title_number          │  │  →users.id       │
                  │     lot_area_sqm          │  │  type            │
                  │     created_at            │  │  title           │
                  │     updated_at            │  │  message         │
                  └───────────────────────────┘  │  link            │
                           │         │            │  data (JSON)     │
                           │ *:1     │ 1          │  read            │
                           │         │            │  read_at         │
                           │         │ evaluated  │  created_at      │
                           │         │ as         │  updated_at      │
                           │         │            └──────────────────┘
                           │         │ *
                           │         │
                  ┌────────┘         └────────────┐
                  │ classified                    │
                  │ under                         │
                  │                               ▼
                  ▼                    ┌─────────────────────────┐
┌───────────────────────────┐         │   DSS_EVALUATIONS       │
│      ZONING_RULES         │         ├─────────────────────────┤
├───────────────────────────┤         │ PK: id (BIGINT)         │
│ PK: id (BIGINT)           │         │ FK: request_id          │
│     zone_code (UNIQUE)    │         │     → requests.id       │
│     zone_name             │         │ FK: property_location_id│
│     zone_type (ENUM)      │         │     → property_loc...id │
│     description           │         │ FK: evaluated_by_user_id│
│     allowed_uses (JSON)   │         │     → users.id          │
│     min_lot_area_sqm      │         │     recommendation(ENUM)│
│     max_lot_area_sqm      │         │     compliance_score    │
│     max_building_height_m │         │     risk_score          │
│     max_floor_area_ratio  │         │     validation_results  │
│     min_setback_front_m   │         │     (JSON)              │
│     min_setback_rear_m    │         │     violations (JSON)   │
│     min_setback_side_m    │         │     warnings (JSON)     │
│     distance_restrictions │         │     ai_suggestion       │
│     (JSON)                │         │     evaluated_at        │
│     environmental_        │         │     created_at          │
│     restrictions (JSON)   │         │     updated_at          │
│     is_active             │         └─────────────────────────┘
│     created_at            │                    │
│     updated_at            │                    │ 1
└───────────────────────────┘                    │ contains
                                                 │
                ┌────────────────────────────────┘
                │                                │ *
                │                                │
                │ 1                              ▼
                │ generates        ┌──────────────────────────────┐
                │                  │  EVALUATION_RISK_ASSESSMENTS │
                │                  ├──────────────────────────────┤
        ┌───────┴────────┐         │ PK: id (BIGINT)              │
        │   USERS        │         │ FK: dss_evaluation_id        │
        │  (see above)   │         │     → dss_evaluations.id     │
        └────────────────┘         │ FK: risk_factor_id           │
               │                   │     → risk_factors.id        │
               │ 1                 │     is_present               │
               │ generates         │     severity (0-10)          │
               │                   │     notes                    │
               │ *                 │     created_at               │
               │                   │     updated_at               │
               ▼                   │ UNIQUE(dss_eval_id,          │
        ┌──────────────┐           │        risk_factor_id)       │
        │  AUDIT_LOGS  │           └──────────────────────────────┘
        ├──────────────┤                          │
        │PK:id(BIGINT) │                          │ *:1
        │FK:user_id    │                          │ references
        │  →users.id   │                          │
        │  user_name   │                          │ 1
        │  user_type   │                          ▼
        │  action      │           ┌──────────────────────────┐
        │  model_type  │           │     RISK_FACTORS         │
        │  model_id    │           ├──────────────────────────┤
        │  description │           │ PK: id (BIGINT)          │
        │  old_values  │           │     factor_name          │
        │  (JSON)      │           │     category (ENUM)      │
        │  new_values  │           │     description          │
        │  (JSON)      │           │     weight (1-10)        │
        │  ip_address  │           │     criteria (JSON)      │
        │  user_agent  │           │     is_active            │
        │  url         │           │     created_at           │
        │  method      │           │     updated_at           │
        │  created_at  │           └──────────────────────────┘
        └──────────────┘
```

---

## Connection Legend

### Crow's Foot Notation:

```
│     = One (exactly one)
├──   = One (exactly one) with connection
│ *   = Many (zero or more)
│ 1   = One (exactly one)
```

### Relationship Symbols:

```
──►  = One-way relationship direction
◄──► = Two-way relationship (read both ways)
FK:  = Foreign Key
PK:  = Primary Key
```

---

## Detailed Connection Table

| # | Parent Table | Child Table | Relationship | Type | Foreign Key | Cascade | Notes |
|---|-------------|-------------|--------------|------|-------------|---------|-------|
| 1 | users | requests | submits | 1:* | requests.user_id | SET NULL | One user submits many requests |
| 2 | users | notifications | receives | 1:* | notifications.user_id | CASCADE | One user receives many notifications |
| 3 | users | audit_logs | generates | 1:* | audit_logs.user_id | SET NULL | One user generates many audit logs |
| 4 | users | reports | evaluates | 1:* | reports.evaluated_by | SET NULL | One user evaluates many reports |
| 5 | users | dss_evaluations | performs | 1:* | dss_evaluations.evaluated_by_user_id | SET NULL | One user performs many DSS evaluations |
| 6 | requests | reports | has | 1:* | reports.request_id | CASCADE | One request has many reports |
| 7 | requests | property_locations | located at | 1:1 | property_locations.request_id (UNIQUE) | CASCADE | One request has ONE property location |
| 8 | requests | dss_evaluations | assessed by | 1:* | dss_evaluations.request_id | CASCADE | One request has many DSS evaluations |
| 9 | zoning_rules | property_locations | classifies | 1:* | property_locations.zoning_rule_id | SET NULL | One zone classifies many properties |
| 10 | property_locations | dss_evaluations | evaluated as | 1:* | dss_evaluations.property_location_id | CASCADE | One property has many evaluations |
| 11 | dss_evaluations | evaluation_risk_assessments | contains | 1:* | evaluation_risk_assessments.dss_evaluation_id | CASCADE | One evaluation contains many risk assessments |
| 12 | risk_factors | evaluation_risk_assessments | referenced in | 1:* | evaluation_risk_assessments.risk_factor_id | CASCADE | One risk factor in many assessments |
| 13 | dss_evaluations | risk_factors | assesses | *:* | through evaluation_risk_assessments | - | Many-to-many through junction |

---

## Drawing Instructions

### Step 1: Draw Tables (Boxes)
1. Draw 10 rectangular boxes
2. Label each with table name at top
3. Add horizontal line under table name
4. List PK first, then FK, then other fields
5. Mark PK with "PK:", FK with "FK:"

### Step 2: Position Tables
```
Layout suggestion:

Row 1:        [USERS]

Row 2:  [NOTIFICATIONS] [REQUESTS] [AUDIT_LOGS]

Row 3:  [REPORTS]  [PROPERTY_LOCATIONS]

Row 4:             [ZONING_RULES]

Row 5:             [DSS_EVALUATIONS]

Row 6:  [RISK_FACTORS] [EVALUATION_RISK_ASSESSMENTS]
```

### Step 3: Draw Connections (Lines)

#### From USERS (5 connections):
1. USERS → REQUESTS: Line down, label "1" near USERS, "*" near REQUESTS, "submits"
2. USERS → NOTIFICATIONS: Line left, label "1:*", "receives"
3. USERS → AUDIT_LOGS: Line right, label "1:*", "generates"
4. USERS → REPORTS: Line down through REQUESTS, label "1:*", "evaluates"
5. USERS → DSS_EVALUATIONS: Line down, label "1:*", "performs"

#### From REQUESTS (3 connections):
6. REQUESTS → REPORTS: Line down-left, label "1:*", "has"
7. REQUESTS → PROPERTY_LOCATIONS: Line down, label "1:1", "located at"
8. REQUESTS → DSS_EVALUATIONS: Line down, label "1:*", "assessed by"

#### From PROPERTY_LOCATIONS (2 connections):
9. PROPERTY_LOCATIONS → ZONING_RULES: Line to left, label "*:1", "classified under"
10. PROPERTY_LOCATIONS → DSS_EVALUATIONS: Line down, label "1:*", "evaluated as"

#### From DSS_EVALUATIONS (1 connection):
11. DSS_EVALUATIONS → EVALUATION_RISK_ASSESSMENTS: Line down, label "1:*", "contains"

#### From RISK_FACTORS (1 connection):
12. RISK_FACTORS → EVALUATION_RISK_ASSESSMENTS: Line right, label "1:*", "referenced in"

#### Many-to-Many (shown through junction):
13. DSS_EVALUATIONS ↔ RISK_FACTORS: Dotted line through EVALUATION_RISK_ASSESSMENTS, label "*:*", "assesses"

### Step 4: Add Cardinality Notation

**Crow's Foot Symbols:**
```
─────○  = Zero or one
─────│  = Exactly one
─────<  = Many (crow's foot)
─────○< = Zero or more
─────│< = One or more
```

**Apply to each relationship:**
- Parent side: Usually "─────│" (one)
- Child side: Usually "─────<" (many)
- One-to-One: "─────│" on both sides

### Step 5: Color Coding (Optional)

- **Core Tables** (USERS, REQUESTS, REPORTS): Blue
- **GIS Tables** (PROPERTY_LOCATIONS, ZONING_RULES): Green
- **DSS Tables** (DSS_EVALUATIONS, EVALUATION_RISK_ASSESSMENTS, RISK_FACTORS): Orange
- **System Tables** (NOTIFICATIONS, AUDIT_LOGS): Gray

---

## Field Count by Table

1. **USERS**: 11 fields
2. **REQUESTS**: 30 fields
3. **REPORTS**: 10 fields
4. **PROPERTY_LOCATIONS**: 14 fields
5. **ZONING_RULES**: 16 fields
6. **DSS_EVALUATIONS**: 11 fields
7. **EVALUATION_RISK_ASSESSMENTS**: 7 fields
8. **RISK_FACTORS**: 8 fields
9. **NOTIFICATIONS**: 10 fields
10. **AUDIT_LOGS**: 15 fields

**Total: 132 fields across 10 tables**

---

## Key Relationships to Emphasize

### 1. USERS as Central Hub
- Connects to: REQUESTS, NOTIFICATIONS, AUDIT_LOGS, REPORTS, DSS_EVALUATIONS
- Role: Central authentication and authorization

### 2. REQUESTS as Transaction Core
- Connects to: USERS, REPORTS, PROPERTY_LOCATIONS, DSS_EVALUATIONS
- Role: Main business transaction entity

### 3. PROPERTY_LOCATIONS (GIS Core)
- Connects to: REQUESTS (1:1), ZONING_RULES, DSS_EVALUATIONS
- Role: Spatial data and geographic information

### 4. DSS System Triangle
- DSS_EVALUATIONS ← junction → RISK_FACTORS
- Forms many-to-many through EVALUATION_RISK_ASSESSMENTS
- Role: Automated decision support

### 5. One-to-One Relationship (Important!)
- REQUESTS ↔ PROPERTY_LOCATIONS (1:1 UNIQUE)
- Enforced by UNIQUE constraint on property_locations.request_id

---

## Constraints to Show

### Primary Keys (PK)
- All tables have: `id` as PRIMARY KEY AUTO_INCREMENT

### Foreign Keys (FK)
Show with arrow from child to parent:
```
REPORTS.request_id ──→ REQUESTS.id
REPORTS.evaluated_by ──→ USERS.id
PROPERTY_LOCATIONS.request_id ──→ REQUESTS.id
PROPERTY_LOCATIONS.zoning_rule_id ──→ ZONING_RULES.id
... etc
```

### Unique Constraints
- USERS.email (UNIQUE)
- ZONING_RULES.zone_code (UNIQUE)
- PROPERTY_LOCATIONS.request_id (UNIQUE) ← **This enforces 1:1**
- EVALUATION_RISK_ASSESSMENTS (dss_evaluation_id, risk_factor_id) ← **Composite UNIQUE**

---

## Software Tool Recommendations

### For Drawing ERD:

1. **Draw.io (diagrams.net)** - Free
   - Has ERD shapes library
   - Crow's foot notation support
   - Export to PNG/PDF

2. **Lucidchart** - Free tier
   - Professional ERD templates
   - Auto-layout features

3. **MySQL Workbench** - Free
   - Can generate ERD from database
   - Reverse engineer option

4. **dbdiagram.io** - Free
   - Code-based ERD definition
   - Generates visual diagram

5. **Microsoft Visio** - Paid
   - Professional quality
   - Database diagram templates

### For Presentation:

- Export as PNG (high resolution)
- Export as PDF (for documents)
- Export as SVG (scalable)

---

## Verification Checklist

When drawing your ERD, verify:

✅ All 10 tables are present  
✅ All 13 relationships are drawn  
✅ Cardinality is marked on both ends of each line  
✅ Primary keys are clearly marked  
✅ Foreign keys are marked and point to correct table  
✅ One-to-one relationship (REQUESTS ↔ PROPERTY_LOCATIONS) is clearly shown  
✅ Many-to-many relationship uses junction table  
✅ All field names are readable  
✅ Table grouping (Core/GIS/DSS/System) is visually clear  
✅ Legend is included explaining symbols  

---

This guide provides everything you need to create a complete, accurate ERD diagram following database normalization best practices!
