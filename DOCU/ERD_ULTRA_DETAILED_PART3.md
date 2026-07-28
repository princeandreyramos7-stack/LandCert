# Entity Relationship Diagram - ULTRA DETAILED (All Fields with Data Types)

**Figure 2-15. LandCert Normalized ERD - Complete Specification (Part 3 of 4)**

## TABLE 5: DSS_EVALUATIONS (11 Fields) - Decision Support System

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       DSS_EVALUATIONS (Assessment Core)                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ PK │ id                                                                      │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Auto Increment: YES                                                   │
│    │   Nullable: NO                                                          │
│    │   Primary Key: YES                                                      │
│    │                                                                          │
│ FK │ request_id                                                              │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Nullable: NO                                                          │
│    │   Foreign Key: → requests.id                                            │
│    │   On Delete: CASCADE                                                    │
│    │   On Update: CASCADE                                                    │
│    │   Index: YES (dss_evaluations_request_id_index)                         │
│    │   Description: Reference to application request                         │
│    │                                                                          │
│ FK │ property_location_id                                                    │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Nullable: NO                                                          │
│    │   Foreign Key: → property_locations.id                                  │
│    │   On Delete: CASCADE                                                    │
│    │   On Update: CASCADE                                                    │
│    │   Index: YES (dss_evaluations_property_location_id_index)               │
│    │   Description: Reference to property GIS data                           │
│    │                                                                          │
│ FK │ evaluated_by_user_id                                                    │
│    │   Type: INT(10) UNSIGNED                                                │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Foreign Key: → users.id                                               │
│    │   On Delete: SET NULL                                                   │
│    │   On Update: CASCADE                                                    │
│    │   Index: YES (dss_evaluations_evaluated_by_user_id_index)               │
│    │   Description: Admin/staff who performed evaluation                     │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 1: ASSESSMENT RESULTS - 3 fields                                │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ recommendation                                                          │
│    │   Type: ENUM('approve', 'deny', 'review_required')                      │
│    │   Nullable: NO                                                          │
│    │   Index: YES (dss_evaluations_recommendation_index)                     │
│    │   Description: DSS automated recommendation                             │
│    │                                                                          │
│    │ compliance_score                                                        │
│    │   Type: INT(11)                                                         │
│    │   Nullable: NO                                                          │
│    │   Default: 0                                                            │
│    │   Range: 0-100                                                          │
│    │   Description: Compliance percentage score                              │
│    │                                                                          │
│    │ risk_score                                                              │
│    │   Type: INT(11)                                                         │
│    │   Nullable: NO                                                          │
│    │   Default: 0                                                            │
│    │   Range: 0-100                                                          │
│    │   Description: Risk assessment score                                    │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 2: VALIDATION DETAILS - 3 fields (JSON)                         │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ validation_results                                                      │
│    │   Type: JSON                                                            │
│    │   Nullable: NO                                                          │
│    │   Format: Object with boolean check results                             │
│    │   Example: {"zoning_compliant":true,"lot_area_ok":true,                │
│    │             "setback_ok":false,"height_ok":true}                        │
│    │   Description: Detailed validation check results                        │
│    │                                                                          │
│    │ violations                                                              │
│    │   Type: JSON                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Format: Array of violation objects                                    │
│    │   Example: [{"rule":"min_setback_front","actual":2,"required":3,       │
│    │             "severity":"high"}]                                         │
│    │   Description: List of regulation violations found                      │
│    │                                                                          │
│    │ warnings                                                                │
│    │   Type: JSON                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Format: Array of warning objects                                      │
│    │   Example: [{"type":"proximity","message":"Within 50m of highway",     │
│    │             "severity":"medium"}]                                       │
│    │   Description: Non-critical warnings and advisories                     │
│    │                                                                          │
│    │ ai_suggestion                                                           │
│    │   Type: TEXT                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: AI-generated recommendation text                         │
│    │                                                                          │
│    │ evaluated_at                                                            │
│    │   Type: TIMESTAMP                                                       │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: When evaluation was completed                            │
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
│   - FOREIGN KEY (property_location_id → property_locations.id)               │
│   - FOREIGN KEY (evaluated_by_user_id → users.id)                            │
│   - INDEX (request_id)                                                       │
│   - INDEX (property_location_id)                                             │
│   - INDEX (recommendation)                                                   │
│   - INDEX (evaluated_by_user_id)                                             │
│                                                                              │
│ RELATIONSHIPS:                                                               │
│   ← requests (1:*) via request_id                                            │
│   ← property_locations (1:*) via property_location_id                        │
│   ← users (1:*) via evaluated_by_user_id                                     │
│   → evaluation_risk_assessments (1:*) via evaluation_risk_assessments...    │
│   ↔ risk_factors (*:*) through evaluation_risk_assessments                   │
│                                                                              │
│ TOTAL FIELDS: 11                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## TABLE 6: EVALUATION_RISK_ASSESSMENTS (7 Fields) - Junction Table

```
┌──────────────────────────────────────────────────────────────────────────────┐
│         EVALUATION_RISK_ASSESSMENTS (Many-to-Many Junction)                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ PK │ id                                                                      │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Auto Increment: YES                                                   │
│    │   Nullable: NO                                                          │
│    │   Primary Key: YES                                                      │
│    │                                                                          │
│ FK │ dss_evaluation_id                                                       │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Nullable: NO                                                          │
│    │   Foreign Key: → dss_evaluations.id                                     │
│    │   On Delete: CASCADE                                                    │
│    │   On Update: CASCADE                                                    │
│    │   Index: YES (eval_risk_assessments_dss_evaluation_id_index)            │
│    │   Composite Unique: YES (with risk_factor_id)                           │
│    │   Description: Reference to DSS evaluation                              │
│    │                                                                          │
│ FK │ risk_factor_id                                                          │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Nullable: NO                                                          │
│    │   Foreign Key: → risk_factors.id                                        │
│    │   On Delete: CASCADE                                                    │
│    │   On Update: CASCADE                                                    │
│    │   Index: YES (eval_risk_assessments_risk_factor_id_index)               │
│    │   Composite Unique: YES (with dss_evaluation_id)                        │
│    │   Description: Reference to risk factor                                 │
│    │                                                                          │
│    │ is_present                                                              │
│    │   Type: BOOLEAN (TINYINT 1)                                             │
│    │   Nullable: NO                                                          │
│    │   Default: FALSE (0)                                                    │
│    │   Description: Whether this risk factor is present                      │
│    │                                                                          │
│    │ severity                                                                │
│    │   Type: INT(11)                                                         │
│    │   Nullable: NO                                                          │
│    │   Default: 0                                                            │
│    │   Range: 0-10                                                           │
│    │   Scale: 0=none, 10=critical                                            │
│    │   Description: Severity rating if risk is present                       │
│    │                                                                          │
│    │ notes                                                                   │
│    │   Type: TEXT                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Additional notes about this risk assessment              │
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
│   - FOREIGN KEY (dss_evaluation_id → dss_evaluations.id)                     │
│   - FOREIGN KEY (risk_factor_id → risk_factors.id)                           │
│   - INDEX (dss_evaluation_id)                                                │
│   - INDEX (risk_factor_id)                                                   │
│   - UNIQUE KEY (dss_evaluation_id, risk_factor_id) - Prevent duplicates      │
│                                                                              │
│ RELATIONSHIPS:                                                               │
│   ← dss_evaluations (1:*) via dss_evaluation_id                              │
│   ← risk_factors (1:*) via risk_factor_id                                    │
│                                                                              │
│ PURPOSE:                                                                     │
│   Junction table enabling many-to-many relationship between                  │
│   dss_evaluations and risk_factors with additional assessment data           │
│                                                                              │
│ TOTAL FIELDS: 7                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## TABLE 7: RISK_FACTORS (8 Fields) - Risk Reference Data

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      RISK_FACTORS (Risk Catalog)                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ PK │ id                                                                      │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Auto Increment: YES                                                   │
│    │   Nullable: NO                                                          │
│    │   Primary Key: YES                                                      │
│    │                                                                          │
│    │ factor_name                                                             │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Index: YES (risk_factors_factor_name_index)                           │
│    │   Examples: 'Flood Zone', 'Landslide Risk', 'Near Fault Line'          │
│    │   Description: Name of risk factor                                      │
│    │                                                                          │
│    │ category                                                                │
│    │   Type: ENUM('environmental', 'safety', 'land_use',                     │
│    │         'infrastructure')                                               │
│    │   Nullable: NO                                                          │
│    │   Index: YES (risk_factors_category_index)                              │
│    │   Description: Risk category classification                             │
│    │                                                                          │
│    │ description                                                             │
│    │   Type: TEXT                                                            │
│    │   Nullable: NO                                                          │
│    │   Description: Detailed description of risk factor                      │
│    │                                                                          │
│    │ weight                                                                  │
│    │   Type: INT(11)                                                         │
│    │   Nullable: NO                                                          │
│    │   Default: 5                                                            │
│    │   Range: 1-10                                                           │
│    │   Scale: 1=low importance, 10=critical importance                       │
│    │   Description: Relative importance/weight of risk factor                │
│    │                                                                          │
│    │ criteria                                                                │
│    │   Type: JSON                                                            │
│    │   Nullable: NO                                                          │
│    │   Format: Object with check criteria                                    │
│    │   Example: {"check_type":"proximity","threshold":100,                  │
│    │             "unit":"meters","target":"fault_line"}                      │
│    │   Description: Criteria for checking this risk factor                   │
│    │                                                                          │
│    │ is_active                                                               │
│    │   Type: BOOLEAN (TINYINT 1)                                             │
│    │   Nullable: NO                                                          │
│    │   Default: TRUE (1)                                                     │
│    │   Index: YES (risk_factors_is_active_index)                             │
│    │   Description: Whether risk factor is currently active                  │
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
│   - INDEX risk_factors_category_index (category)                             │
│   - INDEX risk_factors_is_active_index (is_active)                           │
│   - INDEX risk_factors_factor_name_index (factor_name)                       │
│                                                                              │
│ RELATIONSHIPS:                                                               │
│   → evaluation_risk_assessments (1:*) via evaluation_risk_assessments...    │
│   ↔ dss_evaluations (*:*) through evaluation_risk_assessments                │
│                                                                              │
│ TOTAL FIELDS: 8                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

**(Continued in PART 4...)**

**END OF PART 3**

**Continue to**: `ERD_ULTRA_DETAILED_PART4.md`
