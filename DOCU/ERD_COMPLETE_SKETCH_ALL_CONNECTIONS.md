# Entity Relationship Diagram - Complete Visual Sketch with All Connections

**Figure 2-14. LandCert Normalized ERD - Complete Relationship Diagram**

## Complete ERD Sketch - All 10 Tables Connected

```
                                    ┌─────────────────────────────────────────────────┐
                                    │              USERS                              │
                                    │─────────────────────────────────────────────────│
                                    │ PK: id                                          │
                                    │     name, email, password                       │
                                    │     contact_number, address                     │
                                    │     user_type, email_verified_at                │
                                    │     remember_token                              │
                                    │     created_at, updated_at                      │
                                    └────────┬──────────┬──────────┬──────────────────┘
                                             │          │          │
                                             │ 1        │ 1        │ 1
                                             │          │          │
                  ┌──────────────────────────┘          │          └─────────────────────┐
                  │                                     │                                │
                  │ submits                             │ receives                       │ generates
                  │                                     │                                │
                  │ *                                   │ *                              │ *
                  ▼                                     ▼                                ▼
┌─────────────────────────────────────┐    ┌─────────────────────────────┐    ┌──────────────────────────────┐
│        REQUESTS                     │    │      NOTIFICATIONS          │    │       AUDIT_LOGS             │
│─────────────────────────────────────│    │─────────────────────────────│    │──────────────────────────────│
│ PK: id                              │    │ PK: id                      │    │ PK: id                       │
│ FK: user_id → users.id              │    │ FK: user_id → users.id      │    │ FK: user_id → users.id       │
│                                     │    │                             │    │                              │
│ -- Applicant Info --                │    │ type, title, message        │    │ user_name, user_type         │
│ applicant_name                      │    │ link, data                  │    │ action, model_type           │
│ applicant_address                   │    │ read, read_at               │    │ model_id, description        │
│ applicant_contact                   │    │ created_at, updated_at      │    │ old_values, new_values       │
│                                     │    │                             │    │ ip_address, user_agent       │
│ -- Corporation (Optional) --        │    └─────────────────────────────┘    │ url, method                  │
│ corporation_name                    │                                       │ created_at                   │
│ corporation_address                 │                                       │                              │
│                                     │                                       └──────────────────────────────┘
│ -- Representative (Optional) --     │
│ representative_name                 │
│ representative_address              │
│ representative_email                │
│ authorization_letter_path           │
│                                     │
│ -- Project Details --               │
│ project_type, project_nature        │
│ project_nature_duration             │
│ project_nature_years                │
│ project_cost                        │
│                                     │
│ -- Property/Lot Details --          │
│ lot_area_sqm                        │
│ bldg_improvement_sqm                │
│ right_over_land                     │
│ existing_land_use                   │
│                                     │
│ -- Previous Applications --         │
│ has_written_notice                  │
│ notice_officer_name, notice_dates   │
│ has_similar_application             │
│ similar_application_offices         │
│ similar_application_dates           │
│                                     │
│ -- Release Preferences --           │
│ preferred_release_mode              │
│ release_address                     │
│                                     │
│ -- Status --                        │
│ status (pending/approved/rejected)  │
│                                     │
│ created_at, updated_at              │
└──────┬───────────┬──────────────────┘
       │           │
       │ 1         │ 1
       │           │
       │ has       │ located at
       │           │
       │ *         │ 1 (UNIQUE)
       │           │
       ▼           ▼
┌──────────────────────────────────┐         ┌─────────────────────────────────────────────────┐
│         REPORTS                  │         │         PROPERTY_LOCATIONS (GIS Core)           │
│──────────────────────────────────│         │─────────────────────────────────────────────────│
│ PK: id                           │         │ PK: id                                          │
│ FK: request_id → requests.id     │         │ FK: request_id → requests.id (UNIQUE 1:1)       │
│ FK: evaluated_by → users.id      │         │ FK: zoning_rule_id → zoning_rules.id            │
│                                  │         │                                                 │
│ description                      │         │ -- Coordinates (GIS) --                         │
│ evaluation (pending/approved/    │         │ latitude (DECIMAL 10,8)                         │
│   rejected/under_review)         │         │ longitude (DECIMAL 11,8)                        │
│ amount                           │         │ boundaries (JSON - GeoJSON polygon)             │
│ date_certified                   │         │                                                 │
│ date_reported                    │         │ -- Address (Hierarchical) --                    │
│ issued_by_name                   │         │ street_address                                  │
│                                  │         │ barangay                                        │
│ created_at, updated_at           │         │ city_municipality                               │
│                                  │         │ province                                        │
└──────────────────────────────────┘         │ district                                        │
       ▲                                      │                                                 │
       │                                      │ -- Property Identifiers --                      │
       │ 1                                    │ lot_number                                      │
       │                                      │ title_number                                    │
       │ evaluates                            │ lot_area_sqm                                    │
       │                                      │                                                 │
       │ *                                    │ created_at, updated_at                          │
       │                                      └──────────┬──────────────────────────────────────┘
       │                                                 │
       │                                                 │ *:1
       │                                                 │
       │                                                 │ classified under
       │                                                 │
       │                                                 ▼
       │                              ┌───────────────────────────────────────────────────────────┐
       │                              │         ZONING_RULES (GIS Regulations)                    │
       │                              │───────────────────────────────────────────────────────────│
       │                              │ PK: id                                                    │
       │                              │                                                           │
       │                              │ -- Zone Identification --                                 │
       │                              │ zone_code (UNIQUE)                                        │
       │                              │ zone_name                                                 │
       │                              │ zone_type (residential/commercial/industrial/             │
       │                              │   agricultural/mixed)                                     │
       │                              │ description                                               │
       │                              │                                                           │
       │                              │ -- Allowed Uses --                                        │
       │                              │ allowed_uses (JSON array)                                 │
       │                              │                                                           │
       │                              │ -- Dimensional Requirements --                            │
       │                              │ min_lot_area_sqm, max_lot_area_sqm                        │
       │                              │ max_building_height_m                                     │
       │                              │ max_floor_area_ratio                                      │
       │                              │                                                           │
       │                              │ -- Setback Requirements (meters) --                       │
       │                              │ min_setback_front_m                                       │
       │                              │ min_setback_rear_m                                        │
       │                              │ min_setback_side_m                                        │
       │                              │                                                           │
       │                              │ -- Distance Restrictions --                               │
       │                              │ distance_restrictions (JSON)                              │
       │                              │                                                           │
       │                              │ -- Environmental Constraints --                           │
       │                              │ environmental_restrictions (JSON)                         │
       │                              │                                                           │
       │                              │ is_active                                                 │
       │                              │ created_at, updated_at                                    │
       │                              │                                                           │
       │                              └───────────────────────────────────────────────────────────┘
       │
       │
       │
       └──────────────────────────────────────────┐
                                                  │
                                                  │
                  ┌───────────────────────────────┴─────────────────────────────┐
                  │                                                             │
                  │                                                             │
       ┌──────────┴────────────┐                                    ┌──────────┴──────────────┐
       │                       │                                    │                         │
       │ 1                     │ 1                                  │ 1                       │ 1
       │                       │                                    │                         │
       │ assessed by           │ evaluated as                       │ performs                │ evaluates
       │                       │                                    │                         │
       │ *                     │ *                                  │ *                       │ *
       │                       │                                    │                         │
       ▼                       ▼                                    ▼                         ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DSS_EVALUATIONS                                                │
│──────────────────────────────────────────────────────────────────────────────────────────────────│
│ PK: id                                                                                           │
│ FK: request_id → requests.id                                                                     │
│ FK: property_location_id → property_locations.id                                                 │
│ FK: evaluated_by_user_id → users.id                                                              │
│                                                                                                  │
│ -- Assessment Results --                                                                         │
│ recommendation (approve/deny/review_required)                                                    │
│ compliance_score (0-100)                                                                         │
│ risk_score (0-100)                                                                               │
│                                                                                                  │
│ -- Validation Details --                                                                         │
│ validation_results (JSON)                                                                        │
│   {"zoning_compliant":true, "lot_area_ok":true, "setback_ok":false, "height_ok":true}          │
│ violations (JSON)                                                                                │
│   [{"rule":"min_setback_front", "actual":2, "required":3}]                                      │
│ warnings (JSON)                                                                                  │
│   [{"type":"proximity", "message":"Within 50m of highway"}]                                     │
│                                                                                                  │
│ ai_suggestion (TEXT)                                                                             │
│ evaluated_at                                                                                     │
│ created_at, updated_at                                                                           │
└──────────────────┬───────────────────────────────────────────────────────────────────────────────┘
                   │
                   │ 1
                   │
                   │ contains
                   │
                   │ *
                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│              EVALUATION_RISK_ASSESSMENTS (Junction Table)                                │
│──────────────────────────────────────────────────────────────────────────────────────────│
│ PK: id                                                                                   │
│ FK: dss_evaluation_id → dss_evaluations.id                                               │
│ FK: risk_factor_id → risk_factors.id                                                     │
│                                                                                          │
│ is_present (BOOLEAN)                                                                     │
│ severity (0-10 scale)                                                                    │
│ notes                                                                                    │
│                                                                                          │
│ created_at, updated_at                                                                   │
└──────────────────────────────────────────┬───────────────────────────────────────────────┘
                                           │
                                           │ *:1
                                           │
                                           │ references
                                           │
                                           ▼
                           ┌───────────────────────────────────────────────────────┐
                           │              RISK_FACTORS                             │
                           │───────────────────────────────────────────────────────│
                           │ PK: id                                                │
                           │                                                       │
                           │ factor_name                                           │
                           │ category (environmental/safety/land_use/              │
                           │   infrastructure)                                     │
                           │ description                                           │
                           │ weight (1-10 importance scale)                        │
                           │ criteria (JSON)                                       │
                           │   {"check_type":"proximity", "threshold":100,         │
                           │    "unit":"meters"}                                   │
                           │                                                       │
                           │ is_active                                             │
                           │ created_at, updated_at                                │
                           │                                                       │
                           └───────────────────────────────────────────────────────┘
```

---

## Relationship Connection Summary (13 Total)

### PRIMARY RELATIONSHIPS

#### 1. USERS → REQUESTS (1:*)
```
┌───────┐                    ┌──────────┐
│ USERS │ ───── submits ───→ │ REQUESTS │
└───────┘        1:*         └──────────┘
FK: requests.user_id → users.id
```
**Description**: Each user can submit multiple requests (applications). Each request belongs to one user.

---

#### 2. USERS → NOTIFICATIONS (1:*)
```
┌───────┐                        ┌───────────────┐
│ USERS │ ───── receives ──────→ │ NOTIFICATIONS │
└───────┘        1:*             └───────────────┘
FK: notifications.user_id → users.id
```
**Description**: Each user receives multiple notifications. Each notification is for one user.

---

#### 3. USERS → AUDIT_LOGS (1:*)
```
┌───────┐                      ┌─────────────┐
│ USERS │ ───── generates ───→ │ AUDIT_LOGS  │
└───────┘        1:*           └─────────────┘
FK: audit_logs.user_id → users.id
```
**Description**: Each user generates multiple audit log entries. Each log entry belongs to one user.

---

#### 4. USERS → REPORTS (1:*)
```
┌───────┐                      ┌─────────┐
│ USERS │ ───── evaluates ───→ │ REPORTS │
└───────┘        1:*           └─────────┘
FK: reports.evaluated_by → users.id
```
**Description**: Each user (admin/staff) can evaluate multiple reports. Each report is evaluated by one user.

---

#### 5. USERS → DSS_EVALUATIONS (1:*)
```
┌───────┐                       ┌──────────────────┐
│ USERS │ ───── performs ─────→ │ DSS_EVALUATIONS  │
└───────┘        1:*            └──────────────────┘
FK: dss_evaluations.evaluated_by_user_id → users.id
```
**Description**: Each user (admin) performs multiple DSS evaluations. Each evaluation is performed by one user.

---

#### 6. REQUESTS → REPORTS (1:*)
```
┌──────────┐                  ┌─────────┐
│ REQUESTS │ ───── has ─────→ │ REPORTS │
└──────────┘       1:*        └─────────┘
FK: reports.request_id → requests.id
```
**Description**: Each request has multiple reports (evaluation history). Each report belongs to one request.

---

#### 7. REQUESTS → PROPERTY_LOCATIONS (1:1) ⭐ UNIQUE
```
┌──────────┐                        ┌────────────────────┐
│ REQUESTS │ ── located at (1:1) ─→ │ PROPERTY_LOCATIONS │
└──────────┘                        └────────────────────┘
FK: property_locations.request_id → requests.id (UNIQUE)
```
**Description**: Each request has exactly ONE property location. UNIQUE constraint enforces 1:1 relationship.

---

#### 8. REQUESTS → DSS_EVALUATIONS (1:*)
```
┌──────────┐                         ┌──────────────────┐
│ REQUESTS │ ──── assessed by ─────→ │ DSS_EVALUATIONS  │
└──────────┘         1:*             └──────────────────┘
FK: dss_evaluations.request_id → requests.id
```
**Description**: Each request is assessed by multiple DSS evaluations. Each evaluation assesses one request.

---

#### 9. PROPERTY_LOCATIONS → ZONING_RULES (*:1)
```
┌────────────────────┐                    ┌──────────────┐
│ PROPERTY_LOCATIONS │ ── classified ───→ │ ZONING_RULES │
└────────────────────┘    under (*:1)     └──────────────┘
FK: property_locations.zoning_rule_id → zoning_rules.id
```
**Description**: Many properties can be classified under one zoning rule. Each property belongs to one zone.

---

#### 10. PROPERTY_LOCATIONS → DSS_EVALUATIONS (1:*)
```
┌────────────────────┐                      ┌──────────────────┐
│ PROPERTY_LOCATIONS │ ─── evaluated as ──→ │ DSS_EVALUATIONS  │
└────────────────────┘        1:*           └──────────────────┘
FK: dss_evaluations.property_location_id → property_locations.id
```
**Description**: Each property location has multiple DSS evaluations. Each evaluation is for one location.

---

#### 11. DSS_EVALUATIONS → EVALUATION_RISK_ASSESSMENTS (1:*)
```
┌──────────────────┐                        ┌────────────────────────────┐
│ DSS_EVALUATIONS  │ ───── contains ──────→ │ EVALUATION_RISK_ASSESSMENTS│
└──────────────────┘         1:*            └────────────────────────────┘
FK: evaluation_risk_assessments.dss_evaluation_id → dss_evaluations.id
```
**Description**: Each DSS evaluation contains multiple risk assessments. Each assessment belongs to one evaluation.

---

#### 12. RISK_FACTORS → EVALUATION_RISK_ASSESSMENTS (1:*)
```
┌──────────────┐                          ┌────────────────────────────┐
│ RISK_FACTORS │ ─── referenced in ─────→ │ EVALUATION_RISK_ASSESSMENTS│
└──────────────┘         1:*              └────────────────────────────┘
FK: evaluation_risk_assessments.risk_factor_id → risk_factors.id
```
**Description**: Each risk factor is referenced in multiple assessments. Each assessment references one factor.

---

#### 13. DSS_EVALUATIONS ↔ RISK_FACTORS (*:*) - Many-to-Many
```
┌──────────────────┐                                 ┌──────────────┐
│ DSS_EVALUATIONS  │ ←──── assesses (many-to-many) → │ RISK_FACTORS │
└──────────────────┘                                 └──────────────┘
                          ▲
                          │
                          │ through
                          │
          ┌────────────────────────────┐
          │ EVALUATION_RISK_ASSESSMENTS│ (Junction Table)
          └────────────────────────────┘
```
**Description**: Many DSS evaluations assess many risk factors through the junction table.

---

## Cardinality Notation Legend

```
1    = Exactly one (mandatory)
*    = Zero or many (optional, multiple)
1:1  = One-to-one relationship
1:*  = One-to-many relationship
*:1  = Many-to-one relationship
*:*  = Many-to-many relationship
```

---

## Cascade Rules Summary

| Relationship | Delete Action | Update Action |
|-------------|---------------|---------------|
| users → requests | SET NULL | CASCADE |
| users → notifications | CASCADE | CASCADE |
| users → audit_logs | SET NULL | CASCADE |
| users → reports | SET NULL | CASCADE |
| users → dss_evaluations | SET NULL | CASCADE |
| requests → reports | CASCADE | CASCADE |
| requests → property_locations | CASCADE | CASCADE |
| requests → dss_evaluations | CASCADE | CASCADE |
| property_locations → zoning_rules | SET NULL | CASCADE |
| property_locations → dss_evaluations | CASCADE | CASCADE |
| dss_evaluations → eval_risk_assessments | CASCADE | CASCADE |
| risk_factors → eval_risk_assessments | CASCADE | CASCADE |

---

## Key Relationship Features

### 1. Enforced 1:1 Relationship
**REQUESTS ↔ PROPERTY_LOCATIONS**
- UNIQUE constraint on `property_locations.request_id`
- Ensures each request has exactly ONE location
- Database-level enforcement

### 2. Many-to-Many with Junction Table
**DSS_EVALUATIONS ↔ RISK_FACTORS**
- Junction table: `evaluation_risk_assessments`
- Allows flexible risk factor assessment
- Stores severity and notes per assessment

### 3. Self-Documenting Foreign Keys
All foreign keys follow naming convention:
- `{related_table}_id` → points to `{related_table}.id`
- Example: `user_id` → `users.id`

### 4. Nullable vs Non-Nullable
- **Nullable FKs**: Optional relationships (SET NULL on delete)
- **Non-Nullable FKs**: Required relationships (CASCADE or RESTRICT)

---

## Relationship Flow Visualization

### Application Submission Flow
```
USER submits → REQUEST created
                  ↓
        PROPERTY_LOCATION created (1:1)
                  ↓
        DSS_EVALUATION performed
                  ↓
        EVALUATION_RISK_ASSESSMENTS created
                  ↓
        REPORT generated
                  ↓
        NOTIFICATION sent to USER
                  ↓
        AUDIT_LOG recorded
```

### Data Retrieval Flow
```
REQUEST
  ├─→ USER (submitter)
  ├─→ PROPERTY_LOCATION (1:1)
  │     └─→ ZONING_RULE
  ├─→ DSS_EVALUATIONS
  │     ├─→ USER (evaluator)
  │     ├─→ PROPERTY_LOCATION
  │     └─→ EVALUATION_RISK_ASSESSMENTS
  │           └─→ RISK_FACTORS
  ├─→ REPORTS
  │     └─→ USER (evaluator)
  └─→ NOTIFICATIONS
        └─→ USER
```

---

## Discussion

Figure 2-14 presents a comprehensive visualization of the LandCert normalized database structure, illustrating all 10 tables and their 13 interconnected relationships.

The diagram demonstrates a **hub-and-spoke architecture** with three primary centers:

1. **USERS Hub**: Central authentication and authorization entity connecting to requests, notifications, audit logs, reports, and DSS evaluations through one-to-many relationships.

2. **REQUESTS Hub**: Core business entity that consolidates all application data, connecting to property locations (1:1 unique relationship), reports (evaluation history), and DSS evaluations (assessment results).

3. **DSS_EVALUATIONS Hub**: Decision support system center linking requests, property locations, users, and risk factors through a sophisticated many-to-many relationship via the evaluation_risk_assessments junction table.

The **PROPERTY_LOCATIONS ↔ REQUESTS relationship** is particularly significant, employing a UNIQUE constraint on request_id to enforce the one-to-one relationship at the database level, ensuring data integrity for geographic information system (GIS) data.

The **many-to-many relationship** between DSS_EVALUATIONS and RISK_FACTORS through EVALUATION_RISK_ASSESSMENTS enables flexible risk assessment, allowing each evaluation to assess multiple factors with individual severity ratings and notes.

All foreign key relationships implement appropriate cascade rules: SET NULL for optional relationships preserving historical data when references are deleted, and CASCADE for required relationships maintaining referential integrity throughout the system.

The normalized structure eliminates redundancy present in the previous design (applications, projects, corporations tables), consolidating all data into the requests table while properly separating GIS data into property_locations and maintaining clean separation of concerns across all entities.

---

## Table and Relationship Count

**Total Tables**: 10
1. users
2. requests
3. property_locations
4. zoning_rules
5. dss_evaluations
6. evaluation_risk_assessments
7. risk_factors
8. reports
9. notifications
10. audit_logs

**Total Relationships**: 13
- Direct 1:* relationships: 10
- Direct 1:1 relationship: 1 (requests ↔ property_locations)
- Direct *:1 relationship: 1 (property_locations → zoning_rules)
- Indirect *:* relationship: 1 (dss_evaluations ↔ risk_factors)

**Foreign Keys**: 12
**Unique Constraints**: 1 (property_locations.request_id)
**Cascade Rules**: 12 (all relationships)

---

**END OF COMPLETE ERD SKETCH**
