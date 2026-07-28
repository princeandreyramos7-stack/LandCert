# LandCert System - Main Process Flow
## Simplified System Architecture

---

## **FIGURE: LandCert Main System Flow**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    1. USER ACCESS & AUTHENTICATION                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐  │
│   │  SUPER   │      │  ADMIN   │      │  STAFF   │      │APPLICANT │  │
│   │  ADMIN   │      │ (CPDO)   │      │(Evaluator)│     │(Citizen) │  │
│   └────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘  │
│        │                 │                   │                 │         │
│        └─────────────────┴───────────────────┴─────────────────┘         │
│                                  │                                        │
│                     ┌────────────▼────────────┐                          │
│                     │  Login Authentication   │                          │
│                     │  (Email + Password)     │                          │
│                     └────────────┬────────────┘                          │
│                                  │                                        │
│                     ┌────────────▼────────────┐                          │
│                     │  Role-Based Access      │                          │
│                     │  Control (RBAC)         │                          │
│                     └─────────────────────────┘                          │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              2. APPLICATION SUBMISSION (Applicant Side)                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  STEP 1: Applicant Information                                │     │
│   │  • Applicant name, address                                    │     │
│   │  • Corporation details (if applicable)                        │     │
│   │  • Authorized representative (if applicable)                  │     │
│   │  • Upload authorization letter                                │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│   ┌──────────────────────▼───────────────────────────────────────┐     │
│   │  STEP 2: Project Details                                      │     │
│   │  • Project type (TUP, SUP, Zoning Clearance)                 │     │
│   │  • Project nature & location                                  │     │
│   │  • Lot area, building improvements                            │     │
│   │  • Project cost                                               │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│   ┌──────────────────────▼───────────────────────────────────────┐     │
│   │  STEP 3: Land Use Information                                 │     │
│   │  • Existing land use                                          │     │
│   │  • Written notices                                            │     │
│   │  • Similar applications                                       │     │
│   │  • Preferred certificate release mode                         │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│               ┌───────────────────────┐                                 │
│               │  SUBMIT APPLICATION   │                                 │
│               └───────────┬───────────┘                                 │
│                           │                                              │
│                           ▼                                              │
│         ┌─────────────────────────────────────┐                         │
│         │  System Creates:                    │                         │
│         │  • Request Record                   │                         │
│         │  • Application Record               │                         │
│         │  • Corporation Record (if needed)   │                         │
│         │  • Project Record                   │                         │
│         │  • Report Record (status: pending)  │                         │
│         └─────────────┬───────────────────────┘                         │
│                       │                                                  │
│                       ▼                                                  │
│         ┌─────────────────────────────┐                                 │
│         │  Send Confirmation Email    │                                 │
│         │  to Applicant               │                                 │
│         └─────────────────────────────┘                                 │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           3. APPLICATION REVIEW (Admin/Staff Side)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  Admin/Staff Views Application in Dashboard                   │     │
│   │  • Application details                                         │     │
│   │  • Applicant information                                       │     │
│   │  • Project specifications                                      │     │
│   │  • Uploaded documents                                          │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  Document Completeness Check                                  │     │
│   │  • Verify all required documents submitted                    │     │
│   │  • Check authorization letter (if applicable)                 │     │
│   │  • Validate applicant information                             │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│                    ┌──────────────┐                                     │
│                    │  Documents    │                                     │
│                    │  Complete?    │                                     │
│                    └──┬────────┬───┘                                     │
│                       │        │                                         │
│                   NO  │        │  YES                                    │
│                       │        │                                         │
│        ┌──────────────▼─┐      ▼                                        │
│        │  Request More  │   ┌─────────────────────────────────┐        │
│        │  Documents     │   │  Proceed to Evaluation          │        │
│        └────────────────┘   └──────────────┬──────────────────┘        │
│                                             │                            │
│                                             ▼                            │
└─────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│     4. DSS EVALUATION (Decision Support System Integration)             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  DSS Evaluates Application Against Criteria:                  │     │
│   │                                                                │     │
│   │  ✓ Zoning Classification Compatibility                        │     │
│   │  ✓ Land Use Compliance (Residential/Commercial/Industrial)    │     │
│   │  ✓ Lot Area Requirements                                      │     │
│   │  ✓ Building Height Restrictions                               │     │
│   │  ✓ Lot Coverage Limits                                        │     │
│   │  ✓ Setback Requirements                                       │     │
│   │  ✓ Environmental Constraints                                  │     │
│   │  ✓ Risk Assessment (Flood zones, fault lines, etc.)          │     │
│   │  ✓ Infrastructure Availability                                │     │
│   │  ✓ Proximity to Critical Facilities                           │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  DSS Generates:                                               │     │
│   │  • Total Score (0-100)                                        │     │
│   │  • Individual Criterion Scores                                │     │
│   │  • Risk Level Assessment (Low/Medium/High)                    │     │
│   │  • Recommendation (Approve/Conditional/Reject)                │     │
│   │  • Evaluation Notes                                           │     │
│   │  • Risk Factors & Mitigation Recommendations                  │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  Staff Reviews DSS Recommendation                             │     │
│   │  • Examine DSS scores and reasoning                           │     │
│   │  • Consider site-specific factors                             │     │
│   │  • Apply professional judgment                                │     │
│   │  • Conduct site inspection (if needed)                        │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  Staff Makes Final Decision                                   │     │
│   │  • Can override DSS recommendation with justification         │     │
│   │  • Human oversight maintained                                 │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
└───────────────────────────┼──────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              5. EVALUATION DECISION & NOTIFICATION                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│                    ┌──────────────────┐                                 │
│                    │  Final Decision  │                                 │
│                    └────┬────────┬────┘                                 │
│                         │        │                                       │
│                 APPROVED│        │REJECTED                              │
│                         │        │                                       │
│        ┌────────────────▼─┐    ┌▼──────────────────┐                   │
│        │  Update Report:  │    │  Update Report:   │                   │
│        │  • Status:       │    │  • Status:        │                   │
│        │    "approved"    │    │    "rejected"     │                   │
│        │  • Amount to pay │    │  • Rejection      │                   │
│        │  • Date certified│    │    reason         │                   │
│        │  • Issued by     │    │  • Date reported  │                   │
│        └────────┬─────────┘    └─┬─────────────────┘                   │
│                 │                 │                                      │
│                 ▼                 ▼                                      │
│    ┌────────────────────┐   ┌───────────────────┐                      │
│    │  Send Approval     │   │  Send Rejection   │                      │
│    │  Email with:       │   │  Email with:      │                      │
│    │  • Payment amount  │   │  • Rejection      │                      │
│    │  • Payment         │   │    reasons        │                      │
│    │    instructions    │   │  • Instructions   │                      │
│    │  • Reference #     │   │    to resubmit    │                      │
│    └────────┬───────────┘   └───────────────────┘                      │
│             │                                                            │
│             ▼                                                            │
│    ┌────────────────────┐                                               │
│    │  Schedule Payment  │                                               │
│    │  Reminder (3 days) │                                               │
│    └────────────────────┘                                               │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              6. PAYMENT VERIFICATION (If Approved)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  Applicant Makes Payment at City Treasurer's Office           │     │
│   │  • Receives official receipt                                  │     │
│   │  • Payment amount as specified in approval                    │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  Applicant Uploads Receipt in LandCert System                │     │
│   │  • Digital image/scan of official receipt                     │     │
│   │  • Receipt number, payment date, amount                       │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  CPDO Staff Verifies Payment                                  │     │
│   │  • Check receipt authenticity                                 │     │
│   │  • Verify amount matches approved amount                      │     │
│   │  • Confirm payment date                                       │     │
│   │  • Cross-check with Treasurer's Office records               │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│                    ┌──────────────┐                                     │
│                    │  Payment     │                                     │
│                    │  Verified?   │                                     │
│                    └──┬────────┬──┘                                     │
│                       │        │                                         │
│                   NO  │        │  YES                                    │
│                       │        │                                         │
│        ┌──────────────▼─┐      ▼                                        │
│        │  Reject Payment│   ┌─────────────────────────────────┐        │
│        │  with Reason   │   │  Mark Payment as Verified       │        │
│        └────────────────┘   └──────────────┬──────────────────┘        │
│                                             │                            │
│                                             ▼                            │
└─────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              7. CERTIFICATE GENERATION & RELEASE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  System Automatically Generates Digital Certificate:          │     │
│   │                                                                │     │
│   │  • Certificate Type (TUP/SUP/Zoning Clearance)               │     │
│   │  • Applicant Name & Address                                   │     │
│   │  • Property Location & Details                                │     │
│   │  • Project Specifications                                     │     │
│   │  • Approval Conditions                                        │     │
│   │  • Unique Reference Number                                    │     │
│   │  • QR Code for Verification                                   │     │
│   │  • Authorized Signatures                                      │     │
│   │  • Official CPDO Seal                                         │     │
│   │  • Issue Date & Validity Period                               │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  Certificate Stored in System                                 │     │
│   │  • PDF format                                                 │     │
│   │  • Digitally signed                                           │     │
│   │  • Tamper-proof QR code                                       │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  Send Email Notification to Applicant                         │     │
│   │  • Certificate ready for download                             │     │
│   │  • Download link                                              │     │
│   │  • Certificate reference number                               │     │
│   └──────────────────────┬───────────────────────────────────────┘     │
│                           │                                              │
│                           ▼                                              │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  Applicant Downloads Certificate                              │     │
│   │  • Instant download from system                               │     │
│   │  • 24/7 availability                                          │     │
│   │  • Can re-download if needed                                  │     │
│   └──────────────────────────────────────────────────────────────┘     │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                8. AUDIT TRAIL & TRACKING                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  System Automatically Logs All Activities:                    │     │
│   │                                                                │     │
│   │  • Application submission                                     │     │
│   │  • Document uploads                                           │     │
│   │  • Status changes                                             │     │
│   │  • DSS evaluations                                            │     │
│   │  • Staff decisions                                            │     │
│   │  • Payment verifications                                      │     │
│   │  • Certificate generation                                     │     │
│   │  • User logins & actions                                      │     │
│   │                                                                │     │
│   │  Each log includes:                                           │     │
│   │  • Timestamp                                                  │     │
│   │  • User who performed action                                  │     │
│   │  • Action description                                         │     │
│   │  • Old and new values (for updates)                           │     │
│   │  • IP address                                                 │     │
│   └──────────────────────────────────────────────────────────────┘     │
│                                                                           │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  Real-Time Status Tracking:                                   │     │
│   │                                                                │     │
│   │  Applicants can track:                                        │     │
│   │  • Submitted → Under Review → Evaluated → Approved →          │     │
│   │    Payment Pending → Payment Verified → Certificate Ready     │     │
│   │                                                                │     │
│   │  Staff/Admin can monitor:                                     │     │
│   │  • All applications dashboard                                 │     │
│   │  • Pending evaluations                                        │     │
│   │  • Payment verifications needed                               │     │
│   │  • Analytics & reports                                        │     │
│   └──────────────────────────────────────────────────────────────┘     │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## **Key Features Throughout the Flow:**

### **1. Automation**
- Automatic record creation
- Auto-generation of certificates
- Automated email notifications
- Scheduled payment reminders

### **2. Decision Support System (DSS)**
- Criteria-based evaluation
- Consistent scoring across applications
- Risk assessment
- Recommendation generation
- Human oversight maintained

### **3. Transparency**
- Real-time status tracking
- Email notifications at each stage
- Complete audit trail
- Accessible application history

### **4. Security**
- Role-based access control
- Password encryption
- Secure file uploads
- Tamper-proof QR codes
- Comprehensive activity logging

### **5. Efficiency**
- Reduced processing time (target: 50% reduction from 7-14 days)
- Eliminated multiple office visits
- 24/7 application submission
- Instant certificate download
- Reduced manual data entry (40% staff time saved)

---

## **Summary: End-to-End Processing**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  APPLICANT   │────>│     CPDO     │────>│     DSS      │────>│  APPLICANT   │
│   SUBMITS    │     │   REVIEWS    │     │  EVALUATES   │     │  RECEIVES    │
│ APPLICATION  │     │  DOCUMENTS   │     │   & SCORES   │     │ CERTIFICATE  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │                     │
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │    STAFF     │────>│   PAYMENT    │
                     │   DECIDES    │     │  VERIFIED    │
                     │ (APPROVE/    │     │              │
                     │  REJECT)     │     │              │
                     └──────────────┘     └──────────────┘

Average Timeline: 3-7 days (target vs 7-14 days baseline)
Office Visits: 0-1 (vs 3+ visits baseline)
```

