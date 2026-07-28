# Entity Relationship Diagram - ULTRA DETAILED (All Fields with Data Types)

**Figure 2-15. LandCert Normalized ERD - Complete Specification (Part 2 of 3)**

## TABLE 2: REQUESTS (Continued from Part 1)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         REQUESTS (CONTINUED)                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 5: PROPERTY/LOT DETAILS (4 fields)                              │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ lot_area_sqm                                                            │
│    │   Type: DECIMAL(10,2)                                                   │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Lot area in square meters                                │
│    │                                                                          │
│    │ bldg_improvement_sqm                                                    │
│    │   Type: DECIMAL(10,2)                                                   │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Building/improvement area in square meters               │
│    │                                                                          │
│    │ right_over_land                                                         │
│    │   Type: ENUM('Owner', 'Lessee')                                         │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Descripxtion: Ownership status of land                                 │
│    │                                                                          │
│    │ existing_land_use                                                       │
│    │   Type: ENUM('Residential', 'Institutional', 'Commercial',              │
│    │         'Industrial', 'Tenanted', 'Vacant', 'Agricultural',             │
│    │         'Not Tenanted')                                                 │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Current use classification of land                       │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 6: PREVIOUS APPLICATIONS (6 fields)                             │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ has_written_notice                                                      │
│    │   Type: ENUM('yes', 'no')                                               │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Whether written notice was received                      │
│    │                                                                          │
│    │ notice_officer_name                                                     │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Name of officer who issued notice                        │
│    │                                                                          │
│    │ notice_dates                                                            │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Dates of notices received                                │
│    │                                                                          │
│    │ has_similar_application                                                 │
│    │   Type: ENUM('yes', 'no')                                               │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Whether similar app filed before                         │
│    │                                                                          │
│    │ similar_application_offices                                             │
│    │   Type: TEXT                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Offices where similar apps were filed                    │
│    │                                                                          │
│    │ similar_application_dates                                               │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Dates of similar applications                            │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 7: RELEASE PREFERENCES (2 fields)                               │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ preferred_release_mode                                                  │
│    │   Type: ENUM('pickup', 'mail_applicant', 'mail_representative',         │
│    │         'mail_other')                                                   │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: How to release the certificate                           │
│    │                                                                          │
│    │ release_address                                                         │
│    │   Type: TEXT                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Address for mailing certificate                          │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 8: APPLICATION STATUS (1 field)                                 │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ status                                                                   │
│    │   Type: ENUM('pending', 'approved', 'rejected')                         │
│    │   Nullable: NO                                                          │
│    │   Default: 'pending'                                                    │
│    │   Index: YES (requests_status_index)                                    │
│    │   Description: Current status of application                            │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 9: TIMESTAMPS (2 fields)                                        │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ created_at                                                              │
│    │   Type: TIMESTAMP                                                       │
│    │   Nullable: NO                                                          │
│    │   Default: CURRENT_TIMESTAMP                                            │
│    │   Index: YES (requests_created_at_index)                                │
│    │   Description: When application was submitted                           │
│    │                                                                          │
│    │ updated_at                                                              │
│    │   Type: TIMESTAMP                                                       │
│    │   Nullable: NO                                                          │
│    │   Default: CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP                │
│    │   Description: Last modification timestamp                              │
│    │                                                                          │
│ INDEXES:                                                                     │
│   - PRIMARY KEY (id)                                                         │
│   - FOREIGN KEY requests_user_id_foreign (user_id → users.id)                │
│   - INDEX requests_user_id_index (user_id)                                   │
│   - INDEX requests_status_index (status)                                     │
│   - INDEX requests_applicant_name_index (applicant_name)                     │
│   - INDEX requests_created_at_index (created_at)                             │
│                                                                              │
│ RELATIONSHIPS:                                                               │
│   ← users (1:*) via user_id                                                  │
│   → property_locations (1:1 UNIQUE) via property_locations.request_id        │
│   → reports (1:*) via reports.request_id                                     │
│   → dss_evaluations (1:*) via dss_evaluations.request_id                     │
│                                                                              │
│ TOTAL FIELDS: 30                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## TABLE 3: PROPERTY_LOCATIONS (14 Fields) - GIS CORE

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        PROPERTY_LOCATIONS (GIS Table)                        │
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
│    │   Unique: YES ⭐ (ENFORCES 1:1 RELATIONSHIP)                            │
│    │   Foreign Key: → requests.id                                            │
│    │   On Delete: CASCADE                                                    │
│    │   On Update: CASCADE                                                    │
│    │   Index: YES UNIQUE (unique_request_id)                                 │
│    │   Description: ONE property per request                                 │
│    │                                                                          │
│ FK │ zoning_rule_id                                                          │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Foreign Key: → zoning_rules.id                                        │
│    │   On Delete: SET NULL                                                   │
│    │   On Update: CASCADE                                                    │
│    │   Index: YES (property_locations_zoning_rule_id_index)                  │
│    │   Description: Zone classification                                      │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 1: COORDINATES (GIS) - 3 fields                                 │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ latitude                                                                │
│    │   Type: DECIMAL(10,8)                                                   │
│    │   Nullable: NO                                                          │
│    │   Index: YES (composite: latitude_longitude_index)                      │
│    │   Range: -90.00000000 to 90.00000000                                   │
│    │   Description: Geographic latitude (WGS84)                              │
│    │                                                                          │
│    │ longitude                                                               │
│    │   Type: DECIMAL(11,8)                                                   │
│    │   Nullable: NO                                                          │
│    │   Index: YES (composite: latitude_longitude_index)                      │
│    │   Range: -180.00000000 to 180.00000000                                 │
│    │   Description: Geographic longitude (WGS84)                             │
│    │                                                                          │
│    │ boundaries                                                              │
│    │   Type: JSON                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Format: GeoJSON Polygon                                               │
│    │   Example: {"type":"Polygon","coordinates":[[[lng,lat],...]]}          │
│    │   Description: Property boundary polygon                                │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 2: ADDRESS (Hierarchical) - 5 fields                            │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ street_address                                                          │
│    │   Type: VARCHAR(500)                                                    │
│    │   Nullable: NO                                                          │
│    │   Description: Street number and name                                   │
│    │                                                                          │
│    │ barangay                                                                │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Index: YES (property_locations_barangay_index)                        │
│    │   Description: Barangay name                                            │
│    │                                                                          │
│    │ city_municipality                                                       │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Index: YES (property_locations_city_municipality_index)               │
│    │   Description: City or municipality name                                │
│    │                                                                          │
│    │ province                                                                │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Description: Province name                                            │
│    │                                                                          │
│    │ district                                                                │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: District classification                                  │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 3: PROPERTY IDENTIFIERS - 3 fields                              │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ lot_number                                                              │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Official lot number                                      │
│    │                                                                          │
│    │ title_number                                                            │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Land title number                                        │
│    │                                                                          │
│    │ lot_area_sqm                                                            │
│    │   Type: DECIMAL(10,2)                                                   │
│    │   Nullable: NO                                                          │
│    │   Description: Total lot area in square meters                          │
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
│   - UNIQUE KEY unique_request_id (request_id) ⭐ 1:1 ENFORCER               │
│   - FOREIGN KEY (request_id → requests.id)                                   │
│   - FOREIGN KEY (zoning_rule_id → zoning_rules.id)                           │
│   - INDEX (latitude, longitude) - for spatial queries                        │
│   - INDEX (barangay)                                                         │
│   - INDEX (city_municipality)                                                │
│                                                                              │
│ RELATIONSHIPS:                                                               │
│   ← requests (1:1 UNIQUE) via request_id                                     │
│   ← zoning_rules (*:1) via zoning_rule_id                                    │
│   → dss_evaluations (1:*) via dss_evaluations.property_location_id          │
│                                                                              │
│ TOTAL FIELDS: 14                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## TABLE 4: ZONING_RULES (16 Fields) - GIS REGULATIONS

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       ZONING_RULES (GIS Regulations)                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ PK │ id                                                                      │
│    │   Type: BIGINT(20) UNSIGNED                                             │
│    │   Auto Increment: YES                                                   │
│    │   Nullable: NO                                                          │
│    │   Primary Key: YES                                                      │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 1: ZONE IDENTIFICATION - 4 fields                               │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ zone_code                                                               │
│    │   Type: VARCHAR(50)                                                     │
│    │   Nullable: NO                                                          │
│    │   Unique: YES                                                           │
│    │   Index: YES UNIQUE (unique_zoning_rules_zone_code)                     │
│    │   Examples: 'R-1', 'C-2', 'I-3', 'A-1'                                  │
│    │   Description: Unique zone identifier code                              │
│    │                                                                          │
│    │ zone_name                                                               │
│    │   Type: VARCHAR(255)                                                    │
│    │   Nullable: NO                                                          │
│    │   Examples: 'Residential Low Density', 'Commercial District'            │
│    │   Description: Descriptive zone name                                    │
│    │                                                                          │
│    │ zone_type                                                               │
│    │   Type: ENUM('residential', 'commercial', 'industrial',                 │
│    │         'agricultural', 'mixed')                                        │
│    │   Nullable: NO                                                          │
│    │   Index: YES (zoning_rules_zone_type_index)                             │
│    │   Description: General zone category                                    │
│    │                                                                          │
│    │ description                                                             │
│    │   Type: TEXT                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Detailed zone description                                │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 2: ALLOWED USES - 1 field                                       │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ allowed_uses                                                            │
│    │   Type: JSON                                                            │
│    │   Nullable: NO                                                          │
│    │   Format: Array of strings                                              │
│    │   Example: ["single_family","multi_family","retail"]                    │
│    │   Description: List of permitted land uses                              │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 3: DIMENSIONAL REQUIREMENTS - 4 fields                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ min_lot_area_sqm                                                        │
│    │   Type: DECIMAL(10,2)                                                   │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Minimum lot area in square meters                        │
│    │                                                                          │
│    │ max_lot_area_sqm                                                        │
│    │   Type: DECIMAL(10,2)                                                   │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Maximum lot area in square meters                        │
│    │                                                                          │
│    │ max_building_height_m                                                   │
│    │   Type: DECIMAL(8,2)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Unit: meters                                                          │
│    │   Description: Maximum building height                                  │
│    │                                                                          │
│    │ max_floor_area_ratio                                                    │
│    │   Type: DECIMAL(5,2)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Description: Maximum FAR (floor area / lot area)                      │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 4: SETBACK REQUIREMENTS - 3 fields (in meters)                  │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ min_setback_front_m                                                     │
│    │   Type: DECIMAL(8,2)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Unit: meters                                                          │
│    │   Description: Minimum front yard setback                               │
│    │                                                                          │
│    │ min_setback_rear_m                                                      │
│    │   Type: DECIMAL(8,2)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Unit: meters                                                          │
│    │   Description: Minimum rear yard setback                                │
│    │                                                                          │
│    │ min_setback_side_m                                                      │
│    │   Type: DECIMAL(8,2)                                                    │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Unit: meters                                                          │
│    │   Description: Minimum side yard setback                                │
│    │                                                                          │
│    │ ════════════════════════════════════════════════════════════════        │
│    │ SECTION 5: RESTRICTIONS - 2 fields (JSON)                               │
│    │ ════════════════════════════════════════════════════════════════        │
│    │                                                                          │
│    │ distance_restrictions                                                   │
│    │   Type: JSON                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Format: Object with key-value pairs                                   │
│    │   Example: {"school":100,"highway":50,"river":20,"fault_line":40}      │
│    │   Unit: meters                                                          │
│    │   Description: Distance restrictions from landmarks                     │
│    │                                                                          │
│    │ environmental_restrictions                                              │
│    │   Type: JSON                                                            │
│    │   Nullable: YES                                                         │
│    │   Default: NULL                                                         │
│    │   Format: Object with environmental constraints                         │
│    │   Example: {"flood_zone":true,"landslide_risk":"high",                 │
│    │             "protected_area":false}                                     │
│    │   Description: Environmental hazards and protections                    │
│    │                                                                          │
│    │ is_active                                                               │
│    │   Type: BOOLEAN (TINYINT 1)                                             │
│    │   Nullable: NO                                                          │
│    │   Default: TRUE (1)                                                     │
│    │   Index: YES (zoning_rules_is_active_index)                             │
│    │   Description: Whether rule is currently active                         │
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
│   - UNIQUE KEY unique_zoning_rules_zone_code (zone_code)                     │
│   - INDEX zoning_rules_zone_type_index (zone_type)                           │
│   - INDEX zoning_rules_is_active_index (is_active)                           │
│                                                                              │
│ RELATIONSHIPS:                                                               │
│   → property_locations (1:*) via property_locations.zoning_rule_id          │
│                                                                              │
│ TOTAL FIELDS: 16                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

**(Continued in PART 3...)**

**END OF PART 2**

**Continue to**: `ERD_ULTRA_DETAILED_ALL_FIELDS_PART3.md`
