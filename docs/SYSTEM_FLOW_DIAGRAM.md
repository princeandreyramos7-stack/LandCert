# LandCert System Flow Diagrams

## Complete Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    LANDCERT SYSTEM FLOW                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   APPLICANT  │
└──────┬───────┘
       │
       │ 1. Register/Login
       ▼
┌──────────────────┐
│  Submit Request  │
│  (3-Step Form)   │
└──────┬───────────┘
       │
       │ 2. Fill Application
       ▼
┌─────────────────────────────────┐
│  Step 1: Applicant Info         │
│  Step 2: Project Details        │
│  Step 3: Land Use               │
└──────┬──────────────────────────┘
       │
       │ 3. Submit
       ▼
┌──────────────────┐
│  Request Stored  │
│  Status: Pending │
└──────┬───────────┘
       │
       │ 4. Notification sent
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    ADMIN RECEIVES REQUEST                     │
└──────┬───────────────────────────────────────────────────────┘
       │
       │ 5. Admin reviews
       ▼
┌──────────────────────┐
│  Add Property        │
│  Location Data       │
│  - Coordinates       │
│  - Address           │
│  - Zoning Rule       │
│  - Lot Area          │
└──────┬───────────────┘
       │
       │ 6. Property location saved
       ▼
┌──────────────────────────────────────────────────────────────┐
│              RUN DSS EVALUATION (Automated)                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  VALIDATION ENGINE                                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  ✓ Lot Area Check                                   │    │
│  │    - Min/Max area requirements                      │    │
│  │  ✓ Land Use Check                                   │    │
│  │    - Allowed uses in zone                           │    │
│  │  ✓ Building Height Check                            │    │
│  │    - Maximum height limit                           │    │
│  │  ✓ Distance Restrictions                            │    │
│  │    - Schools, hospitals, highways                   │    │
│  │  ✓ Environmental Checks                             │    │
│  │    - Flood zones, fault lines                       │    │
│  │  ✓ Setback Requirements                             │    │
│  │    - Front, rear, side setbacks                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                    │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  RISK ASSESSMENT ENGINE                              │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  Environmental Risks:                                │    │
│  │    • Flood prone area                               │    │
│  │    • Near fault line                                │    │
│  │    • Steep slope                                    │    │
│  │  Safety Risks:                                       │    │
│  │    • Near industrial zone                           │    │
│  │  Infrastructure Risks:                               │    │
│  │    • Traffic congestion                             │    │
│  │    • Inadequate water supply                        │    │
│  │    • Limited road access                            │    │
│  │  Land Use Risks:                                     │    │
│  │    • Land use conflict                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                    │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SCORING ALGORITHM                                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  Compliance Score = (Passed / Total) × 100          │    │
│  │  Risk Score = (Severity / Max) × 100                │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                    │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  RECOMMENDATION ENGINE                               │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  IF critical violations → DENY                      │    │
│  │  ELSE IF compliance ≥80% AND risk ≤30% → APPROVE   │    │
│  │  ELSE IF compliance ≥60% AND risk ≤50% → REVIEW     │    │
│  │  ELSE → DENY                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                    │
└──────────────────────────┼────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              EVALUATION RESULTS GENERATED                     │
├──────────────────────────────────────────────────────────────┤
│  • Recommendation: Approve/Deny/Review                        │
│  • Compliance Score: 0-100                                    │
│  • Risk Score: 0-100                                          │
│  • Violations List                                            │
│  • Warnings List                                              │
│  • AI Suggestions                                             │
└──────┬───────────────────────────────────────────────────────┘
       │
       │ 7. Admin reviews evaluation
       ▼
┌──────────────────┐
│  Admin Decision  │
├──────────────────┤
│  • Approve       │
│  • Reject        │
│  • Request More  │
└──────┬───────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────┐      ┌──────────┐
│ APPROVED │      │ REJECTED │
└──────┬───┘      └──────┬───┘
       │                 │
       │                 │ 8. Notification
       │                 ▼
       │          ┌─────────────┐
       │          │  Applicant  │
       │          │  Notified   │
       │          └─────────────┘
       │
       │ 9. Payment required
       ▼
┌──────────────────┐
│  Applicant Pays  │
│  Uploads Receipt │
└──────┬───────────┘
       │
       │ 10. Payment verification
       ▼
┌──────────────────┐
│  Admin Verifies  │
│  Payment         │
└──────┬───────────┘
       │
       │ 11. Payment approved
       ▼
┌──────────────────────┐
│  Certificate         │
│  Auto-Generated      │
│  (PDF with QR Code)  │
└──────┬───────────────┘
       │
       │ 12. Download available
       ▼
┌──────────────────┐
│  Applicant       │
│  Downloads       │
│  Certificate     │
└──────────────────┘
```

## DSS Evaluation Detail Flow

```
┌─────────────────────────────────────────────────────────────┐
│           DSS EVALUATION DETAILED PROCESS                    │
└─────────────────────────────────────────────────────────────┘

INPUT:
┌──────────────────┐     ┌──────────────────┐
│  Request Data    │     │  Property Data   │
├──────────────────┤     ├──────────────────┤
│ • Project type   │     │ • Coordinates    │
│ • Land use       │     │ • Lot area       │
│ • Building specs │     │ • Zoning rule    │
│ • Project cost   │     │ • Address        │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  Load Zoning Rule      │
         │  & Risk Factors        │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────────────────────┐
         │  VALIDATION CHECKS (Parallel)          │
         ├────────────────────────────────────────┤
         │                                         │
         │  Check 1: Lot Area                     │
         │  ├─ Compare with min_lot_area          │
         │  └─ Compare with max_lot_area          │
         │      Result: PASS/FAIL + Message       │
         │                                         │
         │  Check 2: Land Use                     │
         │  ├─ Get proposed use                   │
         │  └─ Check if in allowed_uses[]         │
         │      Result: PASS/FAIL + Message       │
         │                                         │
         │  Check 3: Building Height              │
         │  ├─ Get building height                │
         │  └─ Compare with max_building_height   │
         │      Result: PASS/FAIL + Message       │
         │                                         │
         │  Check 4: Distance Restrictions        │
         │  ├─ For each POI type:                 │
         │  │   ├─ Calculate distance              │
         │  │   └─ Compare with minimum            │
         │  └─ Result: PASS/FAIL + Details        │
         │                                         │
         │  Check 5: Environmental                │
         │  ├─ Check flood zone                   │
         │  ├─ Check fault line proximity         │
         │  └─ Check slope                        │
         │      Result: PASS/FAIL + Details       │
         │                                         │
         └────────────┬───────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────┐
         │  RISK ASSESSMENT (Parallel)            │
         ├────────────────────────────────────────┤
         │                                         │
         │  For each Risk Factor:                 │
         │  ├─ Evaluate criteria                  │
         │  ├─ Check if present                   │
         │  ├─ Calculate severity (0-10)          │
         │  └─ Apply weight                       │
         │                                         │
         │  Risk Categories:                      │
         │  • Environmental (4 factors)           │
         │  • Safety (1 factor)                   │
         │  • Infrastructure (3 factors)          │
         │  • Land Use (1 factor)                 │
         │                                         │
         └────────────┬───────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────┐
         │  CALCULATE SCORES                      │
         ├────────────────────────────────────────┤
         │                                         │
         │  Compliance Score:                     │
         │  ├─ Count total checks                 │
         │  ├─ Count passed checks                │
         │  └─ Score = (passed/total) × 100       │
         │                                         │
         │  Risk Score:                           │
         │  ├─ Sum all risk severities            │
         │  ├─ Calculate max possible             │
         │  └─ Score = (total/max) × 100          │
         │                                         │
         └────────────┬───────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────┐
         │  GENERATE RECOMMENDATION               │
         ├────────────────────────────────────────┤
         │                                         │
         │  Decision Tree:                        │
         │                                         │
         │  Has Critical Violations?              │
         │  ├─ YES → DENY                         │
         │  └─ NO → Continue                      │
         │                                         │
         │  Compliance ≥ 80% AND Risk ≤ 30%?     │
         │  ├─ YES → APPROVE                      │
         │  └─ NO → Continue                      │
         │                                         │
         │  Compliance ≥ 60% AND Risk ≤ 50%?     │
         │  ├─ YES → REVIEW REQUIRED              │
         │  └─ NO → DENY                          │
         │                                         │
         └────────────┬───────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────┐
         │  GENERATE AI SUGGESTION                │
         ├────────────────────────────────────────┤
         │                                         │
         │  • Summarize violations                │
         │  • List warnings                       │
         │  • Provide recommendations             │
         │  • Suggest next steps                  │
         │                                         │
         └────────────┬───────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────┐
         │  STORE EVALUATION                      │
         ├────────────────────────────────────────┤
         │                                         │
         │  Save to dss_evaluations:              │
         │  • recommendation                      │
         │  • compliance_score                    │
         │  • risk_score                          │
         │  • validation_results (JSON)           │
         │  • violations (JSON)                   │
         │  • warnings (JSON)                     │
         │  • ai_suggestion                       │
         │                                         │
         │  Save risk assessments:                │
         │  • Link to evaluation_risk_assessments │
         │  • Store severity and notes            │
         │                                         │
         └────────────┬───────────────────────────┘
                      │
                      ▼
OUTPUT:
┌──────────────────────────────────────────────────────────────┐
│  EVALUATION REPORT                                            │
├──────────────────────────────────────────────────────────────┤
│  Recommendation: [APPROVE/DENY/REVIEW REQUIRED]              │
│  Compliance Score: [0-100]                                    │
│  Risk Score: [0-100]                                          │
│                                                               │
│  Violations: [List of critical/high severity issues]         │
│  Warnings: [List of medium severity issues]                  │
│  Risk Factors: [List of detected risks with severity]        │
│  AI Suggestion: [Detailed recommendation text]               │
│                                                               │
│  Timestamp: [Evaluation date/time]                           │
│  Evaluated By: [System/User]                                 │
└──────────────────────────────────────────────────────────────┘
```

## GIS Map Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│              GIS MAP INTERACTION FLOW                        │
└─────────────────────────────────────────────────────────────┘

User Opens Zoning Map
        │
        ▼
┌───────────────────┐
│  Load Map Data    │
├───────────────────┤
│ • Zoning Rules    │
│ • Properties      │
│ • Coordinates     │
└────────┬──────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Initialize Google Maps            │
│  Center: Manila (default)          │
│  Zoom: 13                          │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Plot Property Markers             │
│  For each property:                │
│  ├─ Create marker at coordinates   │
│  ├─ Set color by zone type         │
│  └─ Attach info window             │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Display Zone Legend               │
│  Show all zone types with colors   │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  User Interactions:                │
│                                    │
│  Click Marker                      │
│  ├─ Show info window               │
│  ├─ Display property details       │
│  └─ Update sidebar                 │
│                                    │
│  Pan/Zoom Map                      │
│  ├─ Update visible area            │
│  └─ Load more markers if needed    │
│                                    │
│  Click Zone Legend                 │
│  └─ Filter properties by zone      │
│                                    │
└────────────────────────────────────┘
```

## User Role Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ROLE FLOWS                           │
└─────────────────────────────────────────────────────────────┘

APPLICANT ROLE:
┌──────────────┐
│  Applicant   │
└──────┬───────┘
       │
       ├─► Submit Request
       ├─► Upload Documents
       ├─► Track Status
       ├─► Upload Payment Receipt
       ├─► Download Certificate
       └─► View Notifications

PLANNING OFFICER ROLE:
┌──────────────────┐
│ Planning Officer │
└──────┬───────────┘
       │
       ├─► Review Requests
       ├─► Add Property Locations
       ├─► Run DSS Evaluations
       ├─► View Evaluation Reports
       ├─► Make Recommendations
       └─► View GIS Map

EVALUATOR ROLE:
┌──────────────┐
│  Evaluator   │
└──────┬───────┘
       │
       ├─► Review DSS Results
       ├─► Verify Compliance
       ├─► Assess Risks
       ├─► Provide Comments
       └─► Recommend Actions

ADMIN ROLE:
┌──────────────┐
│    Admin     │
└──────┬───────┘
       │
       ├─► All Planning Officer functions
       ├─► Verify Payments
       ├─► Approve/Reject Requests
       ├─► Manage Users
       ├─► Manage Zoning Rules
       ├─► View Analytics
       ├─► Export Reports
       ├─► View Audit Logs
       └─► System Configuration
```

---

These diagrams provide a visual representation of how the LandCert system operates from end to end.
