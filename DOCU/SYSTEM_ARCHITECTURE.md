# LandCert System Architecture
## Based on Actual System Implementation

This document provides a detailed system architecture based on the actual LandCert codebase implementation.

---

## **FIGURE: LandCert Complete System Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT ACCESS LAYER                                 │
│                     (Web Browsers - Any Device)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Supported Browsers: Chrome, Edge, Firefox, Safari                          │
│  Device Support: Desktop, Laptop, Tablet, Smartphone                        │
│  Requirement: Internet Connection (HTTPS)                                    │
│                                                                               │
└──────────────┬──────────────┬───────────────┬──────────────┬────────────────┘
               │              │               │              │
               │              │               │              │
    ┌──────────▼───┐  ┌──────▼─────┐  ┌─────▼──────┐  ┌───▼──────────┐
    │   SUPER      │  │   ADMIN    │  │   STAFF    │  │  APPLICANTS  │
    │   ADMIN      │  │   (CPDO)   │  │ (Evaluator)│  │  (Citizens)  │
    └──────────────┘  └────────────┘  └────────────┘  └──────────────┘
         (1)                (Many)          (Many)          (Many)
               │              │               │              │
               └──────────────┴───────────────┴──────────────┘
                                     │
                                     │
┌────────────────────────────────────▼─────────────────────────────────────────┐
│                        PRESENTATION LAYER                                     │
│                   (Laravel 11.x + Inertia.js + React 18.x)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐           │
│  │  Authentication │  │  Role-Based     │  │  Session         │           │
│  │  Middleware     │  │  Access Control │  │  Management      │           │
│  │  (Laravel Auth) │  │  (RoleMiddleware)│  │  (Laravel)       │           │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘           │
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐           │
│  │  Audit Log      │  │  Performance    │  │  CSRF Protection │           │
│  │  Middleware     │  │  Headers        │  │  (Laravel)       │           │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘           │
│                                                                               │
│  React Components (Inertia.js SSR):                                         │
│  - Super Admin Dashboard & Management Pages                                  │
│  - Admin Dashboard & Application Management                                  │
│  - Staff Evaluation & DSS Interface                                          │
│  - Applicant Request Forms & Tracking                                        │
│  - Shared Components (Sidebar, Notifications, etc.)                          │
│                                                                               │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ROUTING & CONTROLLER LAYER                            │
│                             (Laravel Routes)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Route Groups (with Middleware Protection):                           │ │
│  │                                                                         │ │
│  │  • Public Routes: /login, /register, /welcome                         │ │
│  │  • Authenticated: /dashboard, /profile, /notifications                │ │
│  │  • Super Admin: /super-admin/* (role:super_admin)                     │ │
│  │  • Admin: /admin/* (role:admin)                                       │ │
│  │  • Applicant: /request, /my-applications (auth + verified)            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Controllers:                                                          │  │
│  │                                                                         │  │
│  │  SuperAdminController:                                                 │  │
│  │  - dashboard(), users(), requests(), approveRequest(),                │  │
│  │    rejectRequest(), createAdmin(), updateUser(), deleteUser(),        │  │
│  │    auditLogs(), settings(), zoningMap(), storeProperty()              │  │
│  │                                                                         │  │
│  │  AdminController:                                                      │  │
│  │  - dashboard(), applications(), requests(), viewRequest(),            │  │
│  │    deleteRequest(), updateEvaluation(), users(), payments(),          │  │
│  │    exportPayments(), exportApplications()                             │  │
│  │                                                                         │  │
│  │  RequestController:                                                    │  │
│  │  - dashboard(), index(), myApplications(), store()                    │  │
│  │                                                                         │  │
│  │  DssController:                                                        │  │
│  │  - evaluate(), show(), zoningMap(), addProperty(), storeProperty()    │  │
│  │                                                                         │  │
│  │  NotificationController:                                               │  │
│  │  - index(), page(), markAsRead(), markAllAsRead(), destroy()          │  │
│  │                                                                         │  │
│  │  ProfileController:                                                    │  │
│  │  - edit(), update(), destroy()                                         │  │
│  │                                                                         │  │
│  │  Auth Controllers:                                                     │  │
│  │  - Login, Register, Password Reset, Email Verification                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS LOGIC LAYER                                  │
│                     (Services, Models, Jobs, Mail)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  CORE SERVICES:                                                        │ │
│  │                                                                         │ │
│  │  • DecisionSupportService - DSS evaluation engine                     │ │
│  │  • DashboardCacheService - Analytics caching                          │ │
│  │  • AuditLogService - Activity logging                                 │ │
│  │  • ReminderService - Payment reminders scheduling                     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  ELOQUENT MODELS (Database Entities):                                 │ │
│  │                                                                         │ │
│  │  • User - Authentication & authorization                              │ │
│  │  • Request - Application requests                                     │ │
│  │  • Application - Detailed application data                            │ │
│  │  • Report - Evaluation reports                                        │ │
│  │  • Corporation - Corporate applicant details                          │ │
│  │  • Project - Project specifications                                   │ │
│  │  • PropertyLocation - GIS coordinates & location                      │ │
│  │  • ZoningRule - Zoning regulations                                    │ │
│  │  • DssEvaluation - DSS assessment results                             │ │
│  │  • RiskFactor - Risk assessment data                                  │ │
│  │  • AuditLog - System activity logs                                    │ │
│  │  • Notification - User notifications                                  │ │
│  │  • ActivityFeed - Activity tracking                                   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  JOBS (Background Processing):                                         │ │
│  │                                                                         │ │
│  │  • GeneratePdfExport - Async PDF generation                           │ │
│  │  • SendScheduledReminders - Automated reminders                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  MAILABLE CLASSES (Email Notifications):                              │ │
│  │                                                                         │ │
│  │  • ApplicationSubmitted - Confirmation email                          │ │
│  │  • ApplicationApproved - Approval notification                        │ │
│  │  • ApplicationRejected - Rejection notification                       │ │
│  │  • StatusChangeNotification - Status updates                          │ │
│  │  • PaymentDueReminder - Payment reminders                             │ │
│  │  • PaymentReceiptSubmitted - Payment confirmation                     │ │
│  │  • PaymentRejected - Payment rejection                                │ │
│  │  • DocumentPendingReminder - Document follow-up                       │ │
│  │  • CertificateIssued - Certificate ready                              │ │
│  │  • CertificateExpiryReminder - Expiry notification                    │ │
│  │  • UserRegistrationWelcome - Welcome email                            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA ACCESS LAYER                                   │
│                       (Eloquent ORM + Query Builder)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  • Database Migrations - Schema definitions                                  │
│  • Database Seeders - Initial data population                               │
│  • Eloquent Relationships - Model associations                              │
│  • Query Optimization - Eager loading, caching                              │
│  • Transactions - Data integrity                                             │
│                                                                               │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                       │
│                            (MySQL 8.x)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │  CORE TABLES:                                                           ││
│  │                                                                          ││
│  │  users - User accounts & authentication                                ││
│  │  ├─ id, name, email, password, user_type, contact_number, address     ││
│  │  └─ Roles: super_admin, admin, staff, applicant                        ││
│  │                                                                          ││
│  │  requests - Application submissions                                     ││
│  │  ├─ Applicant information (name, address, corporation)                 ││
│  │  ├─ Project details (type, nature, location, cost)                     ││
│  │  ├─ Land use information                                               ││
│  │  └─ Status tracking                                                     ││
│  │                                                                          ││
│  │  applications - Detailed application records                            ││
│  │  ├─ corp_id (FK: corporations)                                         ││
│  │  ├─ project_id (FK: projects)                                          ││
│  │  ├─ applicant_name, applicant_address                                  ││
│  │  └─ authorization_letter_path                                          ││
│  │                                                                          ││
│  │  reports - Evaluation outcomes                                          ││
│  │  ├─ app_id (FK: applications)                                          ││
│  │  ├─ evaluation (pending, approved, rejected, reviewed)                 ││
│  │  ├─ description, amount, date_certified                                ││
│  │  └─ issued_by, date_reported                                           ││
│  │                                                                          ││
│  │  corporations - Corporate entity details                                ││
│  │  projects - Project specifications                                      ││
│  │                                                                          ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │  DSS & GIS TABLES:                                                      ││
│  │                                                                          ││
│  │  property_locations - Geographic data                                   ││
│  │  ├─ request_id (FK: requests)                                          ││
│  │  ├─ latitude, longitude, address, barangay, district                   ││
│  │  ├─ zoning_rule_id (FK: zoning_rules)                                 ││
│  │  └─ lot_area, lot_number, title_number                                 ││
│  │                                                                          ││
│  │  zoning_rules - Zoning classifications & regulations                    ││
│  │  ├─ zone_type (residential, commercial, industrial, etc.)             ││
│  │  ├─ zone_name, zone_code, description                                  ││
│  │  ├─ min/max lot_area, building_height, lot_coverage                   ││
│  │  └─ is_active                                                           ││
│  │                                                                          ││
│  │  dss_evaluations - DSS assessment results                              ││
│  │  ├─ request_id (FK: requests)                                          ││
│  │  ├─ property_location_id (FK: property_locations)                     ││
│  │  ├─ evaluated_by (FK: users)                                          ││
│  │  ├─ total_score, recommendation, risk_level                            ││
│  │  ├─ criteria_scores (JSON) - Individual criterion scores               ││
│  │  └─ evaluation_notes                                                    ││
│  │                                                                          ││
│  │  risk_factors - Risk assessment details                                 ││
│  │  ├─ dss_evaluation_id (FK: dss_evaluations)                           ││
│  │  ├─ factor_type, severity_level, description                           ││
│  │  └─ mitigation_recommendation                                          ││
│  │                                                                          ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │  AUDIT & TRACKING TABLES:                                              ││
│  │                                                                          ││
│  │  audit_logs - Comprehensive activity tracking                           ││
│  │  ├─ user_id (FK: users), user_name, user_email                        ││
│  │  ├─ action (created, updated, deleted, etc.)                           ││
│  │  ├─ model_type, model_id                                               ││
│  │  ├─ old_values (JSON), new_values (JSON)                               ││
│  │  ├─ ip_address, user_agent, description                                ││
│  │  └─ created_at (timestamp)                                             ││
│  │                                                                          ││
│  │  notifications - User notification queue                                ││
│  │  ├─ user_id (FK: users), type, notifiable_type, notifiable_id         ││
│  │  ├─ data (JSON), read_at                                               ││
│  │  └─ created_at                                                          ││
│  │                                                                          ││
│  │  activity_feed - Activity stream                                        ││
│  │  └─ User actions, application events, system activities                ││
│  │                                                                          ││
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼─────────────────────────────────────┐
│                        EXTERNAL SERVICES LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐           │
│  │  SMTP Server    │  │  File Storage   │  │  Queue System    │           │
│  │  (Email)        │  │  (Public/       │  │  (Laravel Queue) │           │
│  │                 │  │   Storage)      │  │                  │           │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘           │
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐                                  │
│  │  Cache System   │  │  Session        │                                  │
│  │  (Redis/File)   │  │  Storage        │                                  │
│  │                 │  │  (Database/File)│                                  │
│  └─────────────────┘  └─────────────────┘                                  │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## **USER ROLES & ACCESS CONTROL**

### **1. Super Admin (user_type: 'super_admin')**
**Highest Level Access - System-Wide Management**

**Capabilities:**
- Complete system administration and oversight
- Create, update, delete all user types (admin, staff, applicant, super_admin)
- Approve or reject any application/request
- Access all modules and features
- View comprehensive system audit logs
- Configure DSS evaluation criteria and system parameters
- Manage zoning map and property locations
- Generate system-wide reports and analytics
- Monitor system performance and health
- Access all user data and application records

**Routes:** `/super-admin/*`
**Middleware:** `auth`, `role:super_admin`

---

### **2. Admin (user_type: 'admin')**
**CPDO Administrative Staff - Application Processing**

**Capabilities:**
- View comprehensive dashboard with analytics
- Manage land certification applications
- Update application evaluation status (pending, approved, rejected, reviewed)
- Process applications through DSS evaluation
- Verify payment submissions
- Generate and issue digital certificates
- Manage applicant accounts (view, update, delete)
- Export applications and payments (CSV/PDF)
- View payment records and statistics
- Access application analytics and reports
- **Cannot:** Create other admins, access system-level settings, delete audit logs

**Routes:** `/admin/*`
**Middleware:** `auth`, `role:admin`

---

### **3. Staff (user_type: 'staff')**
**CPDO Evaluators - Application Review**

**Capabilities:**
- View assigned applications for evaluation
- Utilize DSS for criteria-based assessment
- Submit evaluation recommendations
- View application details and documents
- Add evaluation notes and recommendations
- **Cannot:** Final approval/rejection, payment verification, certificate issuance, user management

**Routes:** Limited admin access (evaluation-focused)
**Middleware:** `auth`, `role:staff`

---

### **4. Applicant (user_type: 'applicant')**
**Citizens/Business Owners - Service Recipients**

**Capabilities:**
- Register and verify account
- Submit new land certification requests
- Upload required documents (authorization letters, etc.)
- Track application status in real-time
- View own applications only
- Receive email/SMS notifications
- Update profile information
- View notification history
- **Cannot:** Access other users' data, admin functions, system settings

**Routes:** `/dashboard`, `/request`, `/my-applications`, `/profile`
**Middleware:** `auth`, `verified`

---

## **SYSTEM WORKFLOW**

### **Application Submission Workflow**

```
┌──────────────────────────────────────────────────────────────┐
│  PHASE 1: APPLICATION SUBMISSION (Applicant)                  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
        Applicant logs in → Creates new request
                            │
                            ▼
        Multi-step form completion:
        ├─ Page 1: Applicant Information
        │  └─ Personal/Corporate details, Authorization
        ├─ Page 2: Project Details
        │  └─ Type, Nature, Location, Cost
        └─ Page 3: Land Use Information
           └─ Existing use, Notices, Previous applications
                            │
                            ▼
        System validation → Document upload (optional)
                            │
                            ▼
        Database Transaction:
        ├─ Create Corporation record (if applicable)
        ├─ Create Project record
        ├─ Create Application record
        ├─ Create Report record (status: pending)
        └─ Create Request record (user linkage)
                            │
                            ▼
        Email notification sent → "ApplicationSubmitted"
                            │
                            ▼
        Display success message with Request ID

┌──────────────────────────────────────────────────────────────┐
│  PHASE 2: INITIAL REVIEW (Admin/Staff)                       │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
        Admin/Staff accesses dashboard
                            │
                            ▼
        Views pending applications
                            │
                            ▼
        Opens application details
        ├─ Applicant information
        ├─ Project specifications
        ├─ Uploaded documents
        └─ Location details
                            │
                            ▼
        Document completeness check
        │
        ├─ Complete → Proceed to DSS Evaluation
        └─ Incomplete → Request additional documents
                         (Email: DocumentPendingReminder)

┌──────────────────────────────────────────────────────────────┐
│  PHASE 3: DSS EVALUATION (Staff with DSS Integration)        │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
        Staff initiates DSS evaluation
                            │
                            ▼
        DecisionSupportService.evaluateRequest()
        │
        ├─ Load PropertyLocation data
        ├─ Load applicable ZoningRule
        ├─ Calculate criteria scores:
        │  ├─ Zoning compliance
        │  ├─ Land use compatibility
        │  ├─ Environmental factors
        │  ├─ Building regulations
        │  ├─ Infrastructure adequacy
        │  └─ Risk assessment
        │
        ▼
        Generate DssEvaluation record:
        ├─ total_score (weighted calculation)
        ├─ recommendation (approve/review/reject)
        ├─ risk_level (low/medium/high)
        ├─ criteria_scores (JSON detail)
        └─ evaluation_notes
                            │
                            ▼
        Identify RiskFactors (if any):
        └─ Store risk details with mitigation recommendations
                            │
                            ▼
        Present DSS results to evaluator
        ├─ Overall score and recommendation
        ├─ Criterion-by-criterion breakdown
        ├─ Risk factors identified
        └─ Suggested decision
                            │
                            ▼
        Evaluator reviews DSS output
        └─ Applies professional judgment
           (considers site-specific factors)

┌──────────────────────────────────────────────────────────────┐
│  PHASE 4: DECISION MAKING (Admin)                            │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
        Admin makes final decision
        │
        ├─ APPROVE → Report.evaluation = 'approved'
        │  ├─ Set date_certified, issued_by
        │  ├─ Update Report record
        │  ├─ Create AuditLog entry
        │  ├─ Send ApplicationApproved email
        │  └─ Schedule PaymentDueReminder (3 days)
        │
        ├─ REJECT → Report.evaluation = 'rejected'
        │  ├─ Add rejection reason
        │  ├─ Update Report record
        │  ├─ Create AuditLog entry
        │  └─ Send ApplicationRejected email
        │
        └─ REVIEW → Report.evaluation = 'reviewed'
           ├─ Add review notes
           ├─ Update Report record
           └─ Flag for senior review

┌──────────────────────────────────────────────────────────────┐
│  PHASE 5: PAYMENT PROCESSING (Manual Verification)           │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
        Applicant receives approval notification
                            │
                            ▼
        Applicant pays at City Treasurer's Office
        ├─ Receives official receipt
        └─ Returns to LandCert system
                            │
                            ▼
        Applicant uploads receipt image
        └─ Payment record created (status: pending)
                            │
                            ▼
        Admin views pending payments
                            │
                            ▼
        Admin verifies receipt details:
        ├─ Receipt number
        ├─ Amount
        ├─ Payment date
        └─ Receipt image authenticity
                            │
                            ▼
        Decision:
        ├─ VERIFY → Payment.payment_status = 'verified'
        │  ├─ Set verified_by, verified_at
        │  ├─ Send PaymentReceiptSubmitted email
        │  └─ Proceed to certificate generation
        │
        └─ REJECT → Payment.payment_status = 'rejected'
           ├─ Add rejection_reason
           ├─ Send PaymentRejected email
           └─ Request resubmission

┌──────────────────────────────────────────────────────────────┐
│  PHASE 6: CERTIFICATE GENERATION & ISSUANCE                  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
        Admin generates digital certificate
                            │
                            ▼
        System compiles certificate data:
        ├─ Application details
        ├─ Evaluation results
        ├─ Payment information
        ├─ Approval signatures
        └─ QR code generation
                            │
                            ▼
        PDF generation (DomPDF/Laravel):
        ├─ Professional template
        ├─ Official letterhead
        ├─ Authorized signatures
        ├─ Unique reference number
        └─ QR code for verification
                            │
                            ▼
        Certificate saved to storage
                            │
                            ▼
        Email notification: CertificateIssued
        └─ Contains download link
                            │
                            ▼
        Applicant downloads certificate
                            │
                            ▼
        Certificate status updated (collected/sent)
                            │
                            ▼
        Schedule CertificateExpiryReminder
        (if applicable based on permit type)

```

---

