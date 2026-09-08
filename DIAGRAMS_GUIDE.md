# CPDO LC System - Diagrams Guide

## 📊 Complete Documentation Package

This guide explains all the system diagrams created for the CPDO Locational Clearance System.

---

## 📁 Diagram Files

### 1. **Entity Relationship Diagram (ERD)**
- **File:** `erd-diagram.puml`
- **Type:** Database Schema Diagram
- **Tool:** PlantUML
- **Purpose:** Shows all database tables, columns, data types, and relationships

### 2. **Use Case Diagram (Detailed)**
- **File:** `use-case-diagram.puml`
- **Type:** Use Case Diagram
- **Tool:** PlantUML
- **Purpose:** Complete 60 use cases across all actors

### 3. **Use Case Diagram (Simplified)**
- **File:** `use-case-simple.puml`
- **Type:** Use Case Diagram
- **Tool:** PlantUML
- **Purpose:** Simplified version with main use cases only (34 use cases)

### 4. **Workflow Diagram**
- **File:** `workflow-diagram.puml`
- **Type:** Activity Diagram
- **Tool:** PlantUML
- **Purpose:** Complete application workflow from submission to release

---

## 🎨 How to Generate Diagram Images

### Option 1: Online PlantUML Editor (Easiest)
1. Go to https://www.plantuml.com/plantuml/uml/
2. Copy the content of any `.puml` file
3. Paste into the editor
4. Download as PNG or SVG

### Option 2: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open any `.puml` file
3. Press `Alt+D` to preview
4. Right-click → Export to PNG/SVG

### Option 3: Command Line (requires Java & Graphviz)
```bash
# Install PlantUML
java -jar plantuml.jar erd-diagram.puml

# Or use online rendering
curl -X POST --data-binary @erd-diagram.puml https://www.plantuml.com/plantuml/png/ > erd.png
```

---

## 📋 Entity Relationship Diagram (ERD)

### Overview
The ERD shows **32 database tables** organized into 6 categories:

| Color | Category | Tables |
|-------|----------|--------|
| 🔵 Blue | **Identity** | users, applicants, corporations, representatives |
| 🟡 Yellow | **Core Application** | requests, projects, properties, locations, documents |
| 🟣 Purple | **Workflow** | reports, payments, certificates, timeline |
| 🟢 Green | **Audit & Config** | audit_logs, system_settings, dashboard_analytics |
| 🟠 Orange | **RBAC** | roles, permissions, role_has_permissions, model_has_roles |
| 🔴 Pink | **Communications** | notifications, reminders, sms_templates |

### Key Relationships

#### **Central Flow:**
```
users → applicants → requests → [projects, properties, locations, documents]
                       ↓
                    reports → payments → certificates
```

#### **Cardinality:**
- **1:1 Relationships:**
  - `users ←→ applicants` (one user = one applicant profile)
  - `applicants ←→ corporations` (if corporate applicant)
  - `requests ←→ projects` (one request = one project)
  - `requests ←→ properties` (one request = one property)
  - `requests ←→ locations` (one request = one location)
  - `payments ←→ certificates` (one payment = one certificate)

- **1:N Relationships:**
  - `applicants → requests` (one applicant, many applications)
  - `requests → documents` (one request, many documents)
  - `requests → reports` (one request, many evaluations)
  - `requests → payments` (one request, multiple payments)
  - `requests → timeline` (one request, many timeline events)
  - `users → notifications` (one user, many notifications)

- **M:N Relationships (via pivot tables):**
  - `roles ←→ permissions` (via `role_has_permissions`)
  - `users ←→ roles` (via `model_has_roles`)

### Important Notes in ERD:
1. **Soft Deletes:** users, applicants, requests, payments, certificates
2. **Unique Constraints:** 
   - `users.email`
   - `requests.application_number`
   - `requests.decision_number`
   - `certificates.certificate_number`
3. **CHECK Constraints:**
   - `payments.amount > 0`
   - Payment verification consistency
   - Rejection reason requirements

---

## 🎭 Use Case Diagram

### Actors (4)

| Actor | Role | Description |
|-------|------|-------------|
| **Applicant** | Citizen/Business Owner | Submits applications, tracks status, receives certificates |
| **Admin** | Zoning Officer IV | Reviews applications, verifies documents, generates certificates |
| **Super Admin** | Zoning Administrator | Final approval authority, user management, system configuration |
| **System** | Automated Tasks | Email/SMS notifications, auto-numbering, audit logging |

### Use Cases by Actor

#### **Applicant (19 Use Cases)**

**Application Management (7)**
1. Login/Logout
2. Submit New Application
3. View My Applications
4. Edit Application
5. Track Status
6. Download Application Form
7. View Application Timeline

**Payment & Documents (4)**
8. View Order of Payment
9. Upload Payment Receipt
10. Upload Required Documents
11. View Payment Status

**Certificates (3)**
12. Download Certificate
13. Print Certificate
14. View Certificate Status

**Profile (2)**
15. Update Profile
16. Change Password

**Notifications (3)**
17. Receive Email Notifications
18. Receive SMS Notifications
19. View Notifications

---

#### **Admin / Zoning Officer (20 Use Cases)**

**Application Review (7)**
20. View All Applications
21. Search/Filter Applications
22. Review Application Details
23. Verify Documents
24. Evaluate Application
25. Set Payment Amount
26. Submit for Approval

**Certificate Generation (6)**
27. Generate Certificate
28. Generate Clearance
29. Fill Certificate Details
30. Preview Certificate
31. Mark Certificate Ready
32. Record Release

**Payment Management (3)**
33. View Payments
34. Record Payment
35. Verify Payment Receipt

**Reports (4)**
36. View Dashboard Statistics
37. Export Applications
38. Export Payments
39. Generate Reports

---

#### **Super Admin / Zoning Administrator (16 Use Cases)**
*Inherits all Admin use cases (20) PLUS:*

**Final Approval (5)**
40. Review Submitted Applications
41. Approve Application
42. Reject Application
43. Return to Zoning Officer
44. One-Step Review & Decide

**User Management (4)**
45. View All Users
46. Create Admin Account
47. Edit User Account
48. Deactivate User

**SMS Management (3)**
49. Send SMS Broadcast
50. Manage SMS Templates
51. View SMS History

**System Administration (4)**
52. View Audit Logs
53. Export Audit Logs
54. Configure Settings
55. Manage Signatures

---

#### **System (5 Automated Use Cases)**
56. Send Auto Email Notifications
57. Send Auto SMS Notifications
58. Send Payment Reminders
59. Log System Activities
60. Generate Application Numbers

---

### Use Case Relationships

**Include Relationships:**
- `Submit Application` includes `Generate App Number`
- `Log Activities` includes `Send Notifications`

**Trigger Relationships (System Auto-actions):**
- `Submit Application` → triggers `Email + SMS`
- `Approve Application` → triggers `Email + SMS`
- `Verify Payment` → triggers `Email`
- `Certificate Ready` → triggers `Email + SMS`
- `Reject Application` → triggers `Email + SMS`

**Extend/Generalization:**
- `Super Admin` extends `Admin` (inherits all admin capabilities)

---

## 🔄 Workflow Diagram

### Complete Application Lifecycle

```
[START] 
   ↓
Register & Login
   ↓
Submit Application (4-Step Form)
   ↓
System: Generate App Number → Send Notifications
   ↓
Admin: Review & Verify Documents
   ↓
Admin: Evaluate & Set Payment → Submit for Approval
   ↓
Super Admin: Review & Decide
   ↓
┌─────────────┬──────────────┐
│  APPROVE    │   REJECT     │
└─────────────┴──────────────┘
      ↓              ↓
   Generate      Send Rejection
   Order of      Notification
   Payment           ↓
      ↓           [END]
   Applicant
   Pays
      ↓
   Admin Verifies
   Payment
      ↓
   Generate
   Certificate
      ↓
   Mark Ready
   for Pickup
      ↓
   Release to
   Applicant
      ↓
   [END]
```

### Workflow Statuses

| Status | Description | Actor |
|--------|-------------|-------|
| `pending` | Initial submission | Applicant |
| `for_approval` | Submitted by Zoning Officer | Admin |
| `approved` | Approved by Administrator | Super Admin |
| `rejected` | Rejected by Administrator | Super Admin |
| `payment_confirmed` | Payment verified | Admin |
| `certificate_preparing` | Certificate being generated | Admin |
| `certificate_ready` | Ready for pickup/delivery | Admin |
| `released` | Certificate released to applicant | Admin |

### Decision Points

1. **Documents Complete?**
   - No → Request additional documents
   - Yes → Proceed to evaluation

2. **Super Admin Decision:**
   - Approve → Generate order of payment
   - Reject → Send rejection notice
   - Return → Send back to Zoning Officer for revision

3. **Payment Valid?**
   - No → Reject payment, request resubmission
   - Yes → Verify payment, proceed to certificate generation

4. **Release Mode?**
   - Pickup at Office → Applicant collects in person
   - Mail Delivery → Certificate mailed to address

---

## 📝 Certificate Types

The system generates 4 types of certificates:

| Code | Type | Description |
|------|------|-------------|
| **CZ** | Certification of Zoning | Basic zoning certification |
| **CZC** | Zoning Clearance | Full zoning clearance |
| **TUP** | Temporary Use Permit | For temporary projects |
| **SUP** | Special Use Permit | For special use cases |

Each certificate includes:
- Certificate Number (auto-generated)
- Decision Number (assigned by administrator)
- Property details (lot area, location, etc.)
- Zone classification
- E-Signature of Zoning Administrator
- Validity period

---

## 🔔 Notification System

### Email Notifications (Automated)
1. Application submitted confirmation
2. Application approved/rejected notice
3. Order of payment generated
4. Payment verified confirmation
5. Payment rejected notice
6. Certificate ready for pickup
7. Certificate released confirmation

### SMS Notifications (Automated)
1. Application status change
2. Payment reminder (scheduled)
3. Certificate ready for pickup
4. Urgent updates

### SMS Broadcast (Manual)
- Super Admin can send broadcast messages
- Filterable by user type, status, date range
- Uses customizable templates

---

## 🔐 Role-Based Access Control (RBAC)

### Roles & Permissions Matrix

| Permission | Applicant | Admin | Super Admin |
|------------|-----------|-------|-------------|
| View own applications | ✅ | ✅ | ✅ |
| View all applications | ❌ | ✅ | ✅ |
| Create application | ✅ | ❌ | ❌ |
| Edit application | ✅ (own) | ❌ | ❌ |
| Review application | ❌ | ✅ | ✅ |
| Approve application | ❌ | ❌ | ✅ |
| Reject application | ❌ | ❌ | ✅ |
| Verify payment | ❌ | ✅ | ✅ |
| Generate certificate | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Send SMS broadcast | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |
| Configure system | ❌ | ❌ | ✅ |

---

## 📊 Data Flow Summary

### 1. **Application Submission Flow**
```
Applicant → Application Form → System (validate & store)
   ↓
System → Generate App Number → Send Notifications
   ↓
Admin Queue → Pending Applications
```

### 2. **Document Verification Flow**
```
Applicant → Upload Documents → Storage
   ↓
Admin → Review Documents → Verify Completeness
   ↓
System → Update Status → Notify Applicant
```

### 3. **Approval Flow**
```
Admin → Evaluate → Create Report → Set Payment → Submit
   ↓
Super Admin → Review → Approve/Reject/Return
   ↓
System → Update Status → Send Notifications
```

### 4. **Payment Flow**
```
Applicant → Pay at Cashier → Upload Receipt
   ↓
Admin → Verify Receipt → Record Payment
   ↓
System → Update Status → Confirm Payment
```

### 5. **Certificate Issuance Flow**
```
Admin → Generate Certificate → Fill Details → Preview
   ↓
Admin → Mark Ready → System Notifies Applicant
   ↓
Applicant → Pickup/Receive → Admin Records Release
   ↓
System → Update Status → Complete
```

---

## 🎯 System Features Illustrated in Diagrams

### 1. **Multi-Step Application Form**
- Step 1: Applicant Information
- Step 2: Project Details
- Step 3: Land Use Information
- Step 4: Requirements Upload

### 2. **Document Management**
- Upload multiple documents per requirement
- Track file metadata (name, size, type)
- Download/preview documents
- Verify completeness

### 3. **Dual Approval Workflow**
- Zoning Officer (Admin) evaluates
- Zoning Administrator (Super Admin) approves
- Return mechanism for revisions

### 4. **Payment Verification**
- Manual payment at cashier
- Receipt upload by applicant
- Admin verification
- Rejection with reason

### 5. **E-Signature Integration**
- Digital signature of administrator
- Stored as image file
- Applied to certificates automatically
- Signature management by Super Admin

### 6. **Timeline Tracking**
- All status changes logged
- Visible to applicants
- Shows user, timestamp, description
- Filterable by event type

### 7. **Audit Logging**
- All CRUD operations logged
- User actions tracked
- IP address recorded
- Old/new values stored as JSON

### 8. **Dashboard Analytics**
- Daily metrics aggregation
- Requests by type/status
- Payment totals
- Exportable reports

---

## 📚 For Your Thesis Documentation

### Chapter 3: System Design

**Include:**
1. **ERD** → Database design section
2. **Use Case Diagram** → Functional requirements section
3. **Workflow Diagram** → System processes section

### Chapter 4: Implementation

**Reference:**
- Table structures from ERD
- Feature implementation mapped to use cases
- Workflow implementation with status transitions

### Chapter 5: Testing

**Use:**
- Use cases as test scenarios
- Workflow paths as test cases
- ERD for integration testing

---

## 🛠️ Technical Implementation

### Database
- **Engine:** MySQL/MariaDB
- **ORM:** Laravel Eloquent
- **Migrations:** 77 migration files
- **Relationships:** 31 foreign keys
- **Indexes:** Composite indexes for performance
- **Soft Deletes:** Main tables support recovery

### Backend
- **Framework:** Laravel 10.x
- **Architecture:** MVC (Model-View-Controller)
- **Auth:** Laravel Breeze + Spatie Permissions
- **Notifications:** Laravel Mail + SMS Service
- **Jobs:** Queue system for async tasks
- **Caching:** Database cache driver

### Frontend
- **Framework:** React 18 with Inertia.js
- **UI Library:** shadcn/ui components
- **Styling:** Tailwind CSS
- **State:** React hooks
- **Forms:** Multi-step wizard pattern

---

## 📖 Diagram Reading Guide

### ERD Symbols
- **Rectangle:** Entity/Table
- **Line with crow's foot:** One-to-Many relationship
- **Line without crow's foot:** One-to-One relationship
- **Dashed line:** Optional relationship
- **<<PK>>:** Primary Key
- **<<FK>>:** Foreign Key
- **<<UK>>:** Unique Key

### Use Case Symbols
- **Oval:** Use Case
- **Stick figure:** Actor
- **Solid arrow →:** Association
- **Dashed arrow --|>:** Generalization (extends)
- **Dashed arrow ..>:** Include/Trigger

### Workflow Symbols
- **Rounded rectangle:** Activity
- **Diamond:** Decision point
- **Arrow:** Flow direction
- **Swimlane:** Actor responsibility area
- **Note:** Additional information

---

## 📥 Export Formats

You can export diagrams to:
- **PNG** - For documents (high resolution)
- **SVG** - For web (scalable)
- **PDF** - For thesis printing
- **EPS** - For academic publications

---

## ✅ Diagram Checklist for Thesis

- [x] Entity Relationship Diagram (ERD)
- [x] Use Case Diagram (Detailed - 60 use cases)
- [x] Use Case Diagram (Simplified - 34 use cases)
- [x] Workflow/Activity Diagram
- [x] Database schema documentation
- [x] Actor descriptions
- [x] Relationship cardinality
- [x] Status flow documentation
- [x] Permission matrix
- [x] Certificate types documentation

---

## 🎓 Academic Citations

When citing these diagrams in your thesis:

```
Figure X.X: Entity Relationship Diagram of CPDO LC System
Source: Researcher's system design (2026)

Figure X.X: Use Case Diagram showing system actors and functions
Source: Researcher's functional analysis (2026)

Figure X.X: Complete workflow of locational clearance processing
Source: Researcher's process documentation (2026)
```

---

## 🔗 Related Documentation Files

- `DATABASE_SCHEMA.md` - Detailed database documentation
- `USE_CASE_DIAGRAM.md` - Use case descriptions
- `SYSTEM_ANALYSIS_SUMMARY.md` - System overview
- `ACADEMIC_REFERENCES.md` - Thesis references guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment guide

---

**Generated:** September 7, 2026
**System:** CPDO Locational Clearance System v1.0
**Developer:** CPDO Development Team
