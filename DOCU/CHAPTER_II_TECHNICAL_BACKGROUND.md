# Chapter II: Technical Background

## Table of Contents

1. [Conceptual Framework](#conceptual-framework)
2. [System Architecture](#system-architecture)
3. [Context Diagram](#context-diagram)
4. [Data Flow Diagram](#data-flow-diagram)
5. [Entity Relationship Diagram](#entity-relationship-diagram)
6. [Database Schema](#database-schema)
7. [GANTT Chart](#gantt-chart)

---

## Conceptual Framework

The CPDO Management System is built on a three-tier architecture that separates concerns between presentation, business logic, and data management. The conceptual framework follows modern web application design principles with emphasis on security, scalability, and user experience.

### Core Concepts

#### 1. Role-Based Access Control (RBAC)

The system implements a hierarchical role structure:

- **Applicant**: Submit and track land certification requests
- **Admin**: Review applications, verify payments, manage workflow
- **Super Admin**: Final approval authority, certificate generation, system oversight

#### 2. Workflow Management

The application follows a structured workflow:

```
Request Submission → Admin Review → Super Admin Approval → Payment → Certificate Issuance
```

#### 3. Payment Integration

Dual payment processing system:

- **Manual Payment**: Traditional receipt upload and verification
- **Online Payment**: Xendit payment gateway integration (GCash, GrabPay, Bank Transfer, etc.)

#### 4. Audit Trail

Comprehensive logging system:

- Status history tracking for all requests
- Audit logs for administrative actions
- Payment verification records
- Certificate issuance tracking

#### 5. Notification System

Multi-channel notification delivery:

- Database-backed persistent notifications
- Email notifications for critical events
- SMS notifications via Semaphore API (GCash, Smart, Globe)
- Scheduled reminders for pending actions
- Unread count tracking
- User-configurable SMS preferences

### Technology Stack Integration

The system leverages modern technologies to achieve optimal performance:

**Frontend Layer**:

- React 18 with functional components and hooks
- Inertia.js for seamless SPA experience without API overhead
- Tailwind CSS + shadcn/ui for consistent, accessible UI components
- Lucide React for iconography

**Backend Layer**:

- Laravel 12 framework with MVC architecture
- Eloquent ORM for database abstraction
- Spatie Permission for role management
- DomPDF for certificate generation
- Semaphore SMS API integration

**Data Layer**:

- MySQL relational database
- Foreign key constraints for data integrity
- Indexed columns for query optimization
- Cascade delete for referential integrity

---

## System Architecture

The CPDO Management System follows a **Three-Tier Architecture** pattern, separating the application into distinct layers with specific responsibilities.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   React 18   │  │  Inertia.js  │  │ Tailwind CSS │         │
│  │  Components  │  │   Adapter    │  │  + shadcn/ui │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Laravel 12 Framework                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Controllers  │  Services  │  Middleware  │  Observers   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • RequestController      • XenditService                │  │
│  │  • AdminController        • ReminderService              │  │
│  │  • SuperAdminController   • AuditLogService              │  │
│  │  • PaymentController      • DashboardCacheService        │  │
│  │                           • SmsService                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Eloquent ORM Models                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  User │ Request │ Report │ Payment │ Certificate         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MySQL Database                         │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │  │
│  │  │ users  │ │requests│ │payments│ │  certs │            │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Xendit    │  │     SMTP     │  │  Semaphore   │         │
│  │   Payment    │  │     Email    │  │     SMS      │         │
│  │   Gateway    │  │   Service    │  │   Gateway    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐                                              │
│  │ File System  │                                              │
│  │   Storage    │                                              │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Descriptions

#### 1. Presentation Layer

**Purpose**: User interface and user experience management

**Components**:

- **React Components**: Modular, reusable UI components
- **Inertia.js**: Bridges Laravel backend with React frontend without building an API
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: Pre-built accessible component library

**Responsibilities**:

- Render user interfaces
- Handle user interactions
- Form validation (client-side)
- State management
- Responsive design

#### 2. Application Layer

**Purpose**: Business logic and request processing

**Components**:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Encapsulate complex business logic
- **Middleware**: Request filtering and authentication
- **Observers**: Automatic model event handling
- **Jobs**: Asynchronous task processing

**Responsibilities**:

- Request routing and validation
- Business rule enforcement
- Payment processing
- Email and SMS notifications
- PDF generation
- Audit logging
- Cache management

#### 3. Data Layer

**Purpose**: Data persistence and retrieval

**Components**:

- **Eloquent Models**: Object-relational mapping
- **MySQL Database**: Relational data storage
- **Migrations**: Version-controlled schema changes
- **Seeders**: Test data generation

**Responsibilities**:

- Data storage and retrieval
- Relationship management
- Query optimization
- Data integrity enforcement
- Transaction management

---

## Context Diagram

The Context Diagram shows the CPDO Management System and its interactions with external entities.

```
                    ┌─────────────────────┐
                    │     Applicant       │
                    │   (External User)   │
                    └──────────┬──────────┘
                               │
                               │ Submit Requests
                               │ Upload Documents
                               │ Make Payments
                               │ View Status
                               │
                               ▼
    ┌──────────────┐    ┌─────────────────────────┐    ┌──────────────┐
    │    Admin     │◄───┤   LandCert              │───►│ Super Admin  │
    │   (Staff)    │    │                         │    │ (Approver)   │
    └──────────────┘    └─────────────────────────┘    └──────────────┘
           │                      │                            │
           │                      │                            │
           │ Review Applications  │                            │ Final Approval
           │ Verify Payments      │                            │ Generate Certificates
           │ Generate Reports     │                            │ System Management
           │                      │                            │
           │                      ▼                            │
           │            ┌──────────────────┐                   │
           │            │  MySQL Database  │                   │
           │            │   (Data Store)   │                   │
           │            └──────────────────┘                   │



           cdrdssff
           │                      │                            │
           │                      │                            │
           ▼                      ▼                            ▼
    ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
    │ Email Server │    │ Semaphore SMS    │    │ Xendit Payment   │
    │    (SMTP)    │    │     Gateway      │    │     Gateway      │
    └──────────────┘    └──────────────────┘    └──────────────────┘
           │                      │                            │
           │ Email Notifications  │ SMS Notifications          │ Process Payments
           │ Reminders            │ Status Updates             │ Payment Verification
           │                      │                            │
           │                      │              ┌──────────────────┐
           │                      │              │  File Storage    │
           │                      │              │    (Local)       │
           │                      │              └──────────────────┘
           │                      │                            │
           │                      │                            │ Store Documents
           │                      │                            │ Store Certificates
           │                      │                            │ Store Receipts
           │                      │                            │
           └──────────────────────┴────────────────────────────┘
```

### External Entities

1. **Applicant**: Citizens or organizations applying for land certifications
2. **Admin**: CPDO staff members who review and process applications
3. **Super Admin**: Senior officials with approval and certificate generation authority
4. **MySQL Database**: Persistent data storage
5. **Email Server**: SMTP service for sending email notifications
6. **Semaphore SMS Gateway**: Third-party SMS notification service
7. **Xendit Payment Gateway**: Third-party payment processing service
8. **File Storage**: Local file system for document and certificate storage

---

## Data Flow Diagram

**Figure 2-4. Level 0 Data Flow Diagram (Context Level)**

```
                         ┌─────────────┐
                         │  Applicant  │
                         └──────┬──────┘
                                │
                    Request Info│
                    Payment Info│
                                │
                                ▼
                    ┌───────────────────────┐
                    │                       │
                    │   CPDO Management     │──────► Certificates
                    │       System          │        Reports
                    │                       │        Notifications
                    └───────────────────────┘
                                ▲
                                │
                    Review Data │
                    Approval    │
                                │
                         ┌──────┴──────┐
                         │    Admin/   │
                         │ Super Admin │
                         └─────────────┘
```

### Discussion

Figure 2-4 illustrates the Level 0 Data Flow Diagram, showing the highest-level view of the LandCert system's interactions with external entities. The Applicant provides Request Info and Payment Info to the CPDO Management System, which processes these inputs and produces Certificates, Reports, and Notifications as outputs. Admin and Super Admin users provide Review Data and Approval decisions to the system, enabling the workflow progression from submission to certificate issuance.

**Figure 2-5. Level 1 Data Flow Diagram (Major Processes)**

```
┌─────────────┐
│  Applicant  │
└──────┬──────┘
       │
       │ Request Details
       │
       ▼
┌─────────────────────┐         ┌──────────────┐
│       1.0           │────────►│  D1: Users   │
│  Manage Requests    │  User   └──────────────┘
│                     │  Data
│                     │         ┌──────────────┐
│                     │────────►│ D2: Requests │
└──────┬──────────────┘ Request └──────────────┘
       │                Data           │
       │                               │
       │ Request Info                  │ Request Data
       │                               │
       ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│       2.0           │◄────────│       Admin         │
│  Review & Evaluate  │  Review └─────────────────────┘
│                     │  Data
│                     │         ┌──────────────┐
│                     │────────►│ D2: Requests │
└──────┬──────────────┘ Updated └──────────────┘
       │                Request
       │                Data
       │
       │ Evaluation Report
       │
       ▼
┌─────────────────────┐
│       3.0           │◄────────┐
│  Approve/Reject     │         │ Approval Decision
│                     │  ┌──────┴──────────┐
│                     │  │  Super Admin    │
│                     │  └─────────────────┘
│                     │
│                     │         ┌──────────────┐
│                     │────────►│ D2: Requests │
└──────┬──────────────┘ Status  └──────────────┘
       │                Update
       │
       │ Approval Status
       │
       ▼
┌─────────────────────┐
│       4.0           │         ┌──────────────┐
│  Process Payment    │────────►│ D3: Payments │
│                     │ Payment └──────────────┘
│                     │ Data
└──────┬──────────────┘
       │
       │ Payment Confirmation
       │
       ▼
┌─────────────────────┐         ┌────────────────────┐
│       5.0           │────────►│ D4: Certificates   │
│  Generate           │ Cert    └────────────────────┘
│  Certificate        │ Data
└─────────────────────┘
       │
       │ Certificate
       │
       ▼
┌─────────────┐
│  Applicant  │
└─────────────┘
```

### Discussion

Figure 2-5 presents the Level 1 Data Flow Diagram, decomposing the system into five major processes. Process 1.0 (Manage Requests) accepts Request Details from the Applicant and stores User Data in D1:Users and Request Data in D2:Requests. Process 2.0 (Review & Evaluate) retrieves Request Data from D2:Requests, receives Review Data from Admin, and updates the request status in D2:Requests. Process 3.0 (Approve/Reject) receives Evaluation Report and Approval Decision from Super Admin, updating Status in D2:Requests. Process 4.0 (Process Payment) handles Payment Data storage in D3:Payments and confirms payment. Finally, Process 5.0 (Generate Certificate) creates Cert Data in D4:Certificates and delivers the Certificate to the Applicant.

**Figure 2-6. Level 2 Data Flow Diagram - Process 1.0: Manage Requests (Detailed)**

```
┌─────────────┐
│  Applicant  │
└──────┬──────┘
       │
       │ Login Credentials
       │
       ▼
┌─────────────────────┐         ┌──────────────┐
│       1.1           │────────►│  D1: Users   │
│  Authenticate User  │  User   └──────┬───────┘
│                     │  Query         │
│                     │◄───────────────┘
│                     │  User Record
└──────┬──────────────┘
       │
       │ User Session
       │
       ▼
┌─────────────────────┐
│       1.2           │
│  Create Request     │
│  (Multi-step Form)  │
└──────┬──────────────┘
       │
       │ Request Data
       │
       ▼
┌─────────────────────┐         ┌──────────────┐
│       1.3           │────────►│ D2: Requests │
│  Validate & Store   │ Request └──────────────┘
│  Request            │ Record
│                     │
│                     │         ┌──────────────────┐
│                     │────────►│ D5: Status       │
└──────┬──────────────┘ Status  │     History      │
       │                Update  └──────────────────┘
       │
       │ Validated Request
       │
       ▼
┌─────────────────────┐
│       1.4           │
│  Generate Control   │
│  Number             │
└──────┬──────────────┘
       │
       │ Control Number
       │
       ▼
┌─────────────────────┐         ┌──────────────────┐
│       1.5           │────────►│ D6: Notifications│
│  Send Confirmation  │ Notif   └──────────────────┘
│  Notification       │ Record
└─────────────────────┘
       │
       │ Confirmation Email
       │
       ▼
┌─────────────┐
│  Applicant  │
└─────────────┘
```

### Discussion

Figure 2-6 details Process 1.0 (Manage Requests) broken down into five sub-processes. Process 1.1 (Authenticate User) validates Login Credentials against D1:Users by sending a User Query and receiving the User Record. Process 1.2 (Create Request) collects Request Data through a multi-step form. Process 1.3 (Validate & Store Request) validates the data and stores the Request Record in D2:Requests while creating a Status Update entry in D5:Status History. Process 1.4 (Generate Control Number) creates a unique identifier. Finally, Process 1.5 (Send Confirmation Notification) stores a Notif Record in D6:Notifications and sends a Confirmation Email to the Applicant.

**Figure 2-7. Level 2 Data Flow Diagram - Process 4.0: Process Payment (Detailed)**

```
┌─────────────┐
│  Applicant  │
└──────┬──────┘
       │
       │ Payment Method Selection
       │
       ▼
┌─────────────────────┐
│       4.1           │
│  Select Payment     │
│  Method             │
└──────┬──────────────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
       │ Manual       │ Online       │
       │ Payment      │ Payment      │
       │ Choice       │ Choice       │
       │              │              │
       ▼              ▼              │
┌─────────────┐ ┌─────────────┐    │
│    4.2a     │ │    4.2b     │    │
│  Upload     │ │  Initialize │    │
│  Receipt    │ │  Xendit     │    │
└──────┬──────┘ └──────┬──────┘    │
       │              │              │
       │ Receipt      │ Invoice URL  │
       │ Image        │              │
       │              ▼              │
       │        ┌─────────────┐     │
       │        │   Xendit    │     │
       │        │   Gateway   │     │
       │        │ (External)  │     │
       │        └──────┬──────┘     │
       │              │              │
       │              │ Payment      │
       │              │ Confirmation │
       │              │              │
       ▼              ▼              │
┌─────────────────────────────┐    │
│           4.3               │    │
│  Create Payment Record      │    │
└──────┬──────────────────────┘    │
       │                            │
       │ Payment Data               │
       │                            │
       ▼                            │
┌─────────────────────┐  ┌──────────────┐
│       4.4           │─►│ D3: Payments │
│  Store Payment      │  └──────────────┘
│  Information        │  Payment Record
└──────┬──────────────┘
       │
       │ Pending Payment Status
       │
       ▼
┌─────────────────────┐  ┌──────────────┐
│       4.5           │◄─│    Admin     │
│  Verify Payment     │  └──────────────┘
│                     │  Verification
│                     │  Decision
│                     │
│                     │  ┌──────────────┐
│                     │─►│ D3: Payments │
└──────┬──────────────┘  └──────────────┘
       │                 Updated Status
       │
       │ Verified Payment Status
       │
       ▼
┌─────────────────────┐  ┌──────────────────┐
│       4.6           │─►│ D6: Notifications│
│  Send Payment       │  └──────────────────┘
│  Confirmation       │  Notif Record
└─────────────────────┘
       │
       │ Payment Receipt Notification
       │
       ▼
┌─────────────┐
│  Applicant  │
└─────────────┘
```

### Discussion

Figure 2-7 illustrates Process 4.0 (Process Payment) decomposed into six sub-processes handling both manual and online payment workflows. Process 4.1 (Select Payment Method) receives Payment Method Selection from the Applicant, branching into two paths: Process 4.2a (Upload Receipt) for Manual Payment Choice accepting Receipt Image, or Process 4.2b (Initialize Xendit) for Online Payment Choice generating an Invoice URL for the External Xendit Gateway, which returns Payment Confirmation. Both paths converge at Process 4.3 (Create Payment Record) which consolidates Payment Data. Process 4.4 (Store Payment Information) saves the Payment Record in D3:Payments with Pending Payment Status. Process 4.5 (Verify Payment) receives Verification Decision from Admin and updates the payment Updated Status in D3:Payments. Process 4.6 (Send Payment Confirmation) creates a Notif Record in D6:Notifications and sends Payment Receipt Notification to the Applicant.

---

## Entity Relationship Diagram

**Figure 2-8. LandCert Entity Relationship Diagram (ERD)**

```
┌─────────────────────────────────────────────────────────────────────┐
│                              USERS                                  │
├─────────────────────────────────────────────────────────────────────┤
│ PK │ id (INT)                                                       │
│    │ name (VARCHAR)                                                 │
│    │ email (VARCHAR) UNIQUE                                         │
│    │ password (VARCHAR)                                             │
│    │ contact_number (VARCHAR)                                       │
│    │ address (TEXT)                                                 │
│    │ user_type (ENUM: applicant, admin, super_admin)               │
│    │ created_at, updated_at (TIMESTAMP)                            │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ 1                  │ 1                  │ 1
         │                    │                    │
         │ *                  │ *                  │ *
         ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    REQUESTS      │  │    PAYMENTS      │  │  CERTIFICATES    │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ PK │ id          │  │ PK │ id          │  │ PK │ id          │
│ FK │ user_id     │  │ FK │ verified_by │  │ FK │ issued_by   │
│    │ control_num │  │    │ ...         │  │    │ ...         │
│    │ ...         │  └──────────────────┘  └──────────────────┘
└──────────────────┘
         │
         │ 1
         │
         ├─────────────┬─────────────┬─────────────┐
         │ *           │ *           │ *           │ *
         ▼             ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   REPORTS    │ │   PAYMENTS   │ │ CERTIFICATES │ │STATUS_HISTORY│
├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│PK│report_id  │ │PK│ id        │ │PK│ id        │ │PK│ id        │
│FK│request_id │ │FK│request_id │ │FK│request_id │ │FK│request_id │
│  │description│ │  │amount     │ │FK│payment_id │ │  │old_status │
│  │evaluation │ │  │method     │ │  │cert_number│ │  │new_status │
│  │amount     │ │  │status     │ │  │issued_at  │ │  │changed_by │
│  │...        │ │  │...        │ │  │...        │ │  │...        │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
                         │
                         │ 1
                         │
                         │ *
                         ▼
                 ┌──────────────┐
                 │ CERTIFICATES │
                 ├──────────────┤
                 │PK│ id        │
                 │FK│payment_id │
                 │  │...        │
                 └──────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  NOTIFICATIONS   │  │   AUDIT_LOGS     │  │    REMINDERS     │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│PK│ id            │  │PK│ id            │  │PK│ id            │
│FK│ user_id       │  │FK│ user_id       │  │FK│ request_id    │
│  │ type          │  │  │ action        │  │  │ type          │
│  │ message       │  │  │ model_type    │  │  │ scheduled_at  │
│  │ read_at       │  │  │ ip_address    │  │  │ sent_at       │
│  │ ...           │  │  │ ...           │  │  │ ...           │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐
│    SMS_LOGS      │
├──────────────────┤
│PK│ id            │
│FK│ user_id       │
│  │ mobile_number │
│  │ message       │
│  │ status        │
│  │ provider_id   │
│  │ cost          │
│  │ ...           │
└──────────────────┘
```

### Discussion

Figure 2-8 presents the Entity Relationship Diagram (ERD) for the LandCert database, illustrating the structure and relationships among all database entities. The USERS entity serves as the central table with three one-to-many relationships: USERS (1) to REQUESTS (*), USERS (1) to PAYMENTS (*) as verified_by, and USERS (1) to CERTIFICATES (*) as issued_by. This design enables role-based functionality where applicants submit requests, admins verify payments, and super admins issue certificates.

The REQUESTS entity acts as the core transactional table, maintaining one-to-many relationships with REPORTS (*), PAYMENTS (*), CERTIFICATES (*), and STATUS_HISTORY (*). Each request can have multiple evaluation reports, payment records (for resubmissions or adjustments), certificates (for renewals), and status change records for audit trail purposes. The foreign key `requests.user_id` links back to USERS, establishing request ownership.

The PAYMENTS entity connects to CERTIFICATES through a one-to-one relationship (PAYMENTS:1 to CERTIFICATES:*), ensuring that certificates are only generated after verified payment. The PAYMENTS table includes `verified_by` as a foreign key to USERS, documenting which admin verified each payment transaction.

Supporting entities include NOTIFICATIONS for user alerts (linked to USERS), AUDIT_LOGS for system activity tracking (linked to USERS), REMINDERS for scheduled notifications (linked to REQUESTS), and SMS_LOGS for SMS communication records (linked to USERS). These entities enable comprehensive tracking of user interactions, system events, and communication history.

All foreign key relationships include appropriate cascade rules: CASCADE on delete for dependent records (e.g., deleting a request cascades to its reports, payments, and status history), and SET NULL for reference-only relationships (e.g., deleting a user sets `verified_by` to NULL in payments rather than deleting payment records). This design ensures referential integrity while preserving critical transaction history.

### Relationships Description

#### One-to-Many Relationships

1. **Users → Requests**
    - One user can submit multiple requests
    - Foreign Key: `requests.user_id` → `users.id`
    - Cascade: SET NULL on delete

2. **Requests → Reports**
    - One request can have multiple evaluation reports
    - Foreign Key: `reports.request_id` → `requests.id`
    - Cascade: CASCADE on delete

3. **Requests → Payments**
    - One request can have multiple payment records
    - Foreign Key: `payments.request_id` → `requests.id`
    - Cascade: CASCADE on delete

4. **Requests → Certificates**
    - One request can have multiple certificates (renewals)
    - Foreign Key: `certificates.request_id` → `requests.id`
    - Cascade: CASCADE on delete

5. **Requests → Status History**
    - One request has multiple status change records
    - Foreign Key: `status_history.request_id` → `requests.id`
    - Cascade: CASCADE on delete

6. **Payments → Certificates**
    - One payment can generate one certificate
    - Foreign Key: `certificates.payment_id` → `payments.id`
    - Cascade: SET NULL on delete

7. **Users → Payments (Verifier)**
    - One admin can verify multiple payments
    - Foreign Key: `payments.verified_by` → `users.id`
    - Cascade: SET NULL on delete

8. **Users → Certificates (Issuer)**
    - One super admin can issue multiple certificates
    - Foreign Key: `certificates.issued_by` → `users.id`
    - Cascade: SET NULL on delete

9. **Users → Notifications**
    - One user can receive multiple notifications
    - Foreign Key: `notifications.user_id` → `users.id`
    - Cascade: CASCADE on delete

10. **Users → Audit Logs**
    - One user can have multiple audit log entries
    - Foreign Key: `audit_logs.user_id` → `users.id`
    - Cascade: SET NULL on delete

11. **Requests → Reminders**
    - One request can have multiple scheduled reminders
    - Foreign Key: `reminders.request_id` → `requests.id`
    - Cascade: CASCADE on delete

12. **Users → SMS Logs**
    - One user can have multiple SMS log entries
    - Foreign Key: `sms_logs.user_id` → `users.id`
    - Cascade: SET NULL on delete

---

## Database Schema

### Table: users

**Purpose**: Store user account information and authentication credentials

| Column                    | Type         | Constraints                   | Description                         |
| ------------------------- | ------------ | ----------------------------- | ----------------------------------- |
| id                        | INT          | PRIMARY KEY, AUTO_INCREMENT   | Unique user identifier              |
| name                      | VARCHAR(255) | NOT NULL                      | Full name of user                   |
| email                     | VARCHAR(255) | NOT NULL, UNIQUE              | Email address (login)               |
| email_verified_at         | TIMESTAMP    | NULLABLE                      | Email verification timestamp        |
| password                  | VARCHAR(255) | NOT NULL                      | Hashed password                     |
| contact_number            | VARCHAR(255) | NULLABLE                      | Phone number                        |
| mobile_number             | VARCHAR(255) | NULLABLE                      | Mobile number for SMS               |
| sms_notifications_enabled | BOOLEAN      | DEFAULT TRUE                  | SMS notification preference         |
| address                   | TEXT         | NULLABLE                      | Physical address                    |
| user_type                 | ENUM         | NOT NULL, DEFAULT 'applicant' | Role: applicant, admin, super_admin |
| remember_token            | VARCHAR(100) | NULLABLE                      | Session token                       |
| created_at                | TIMESTAMP    | NOT NULL                      | Record creation time                |
| updated_at                | TIMESTAMP    | NOT NULL                      | Last update time                    |

**Indexes**:

- PRIMARY KEY (id)
- UNIQUE KEY (email)

---

### Table: requests

**Purpose**: Store land certification request applications

| Column                            | Type          | Constraints                 | Description                             |
| --------------------------------- | ------------- | --------------------------- | --------------------------------------- |
| id                                | BIGINT        | PRIMARY KEY, AUTO_INCREMENT | Unique request identifier               |
| control_number                    | VARCHAR(255)  | UNIQUE                      | Generated control number (CPD-002-XXXX) |
| application_type                  | ENUM          | NULLABLE                    | Type: new, renewal                      |
| user_id                           | INT           | FOREIGN KEY, NULLABLE       | Reference to users.id                   |
| applicant_name                    | VARCHAR(255)  | NOT NULL                    | Name of applicant                       |
| corporation_name                  | VARCHAR(255)  | NULLABLE                    | Corporation name (if applicable)        |
| applicant_address                 | TEXT          | NOT NULL                    | Applicant's address                     |
| corporation_address               | TEXT          | NULLABLE                    | Corporation address                     |
| authorized_representative_name    | VARCHAR(255)  | NULLABLE                    | Representative name                     |
| authorized_representative_address | TEXT          | NULLABLE                    | Representative address                  |
| authorized_representative_email   | VARCHAR(255)  | NULLABLE                    | Representative email                    |
| project_type                      | VARCHAR(255)  | NOT NULL                    | Type of project                         |
| project_nature                    | VARCHAR(255)  | NOT NULL                    | Nature of project                       |
| project_location_number           | VARCHAR(255)  | NULLABLE                    | Location number                         |
| project_location_street           | VARCHAR(255)  | NULLABLE                    | Street name                             |
| project_location_barangay         | VARCHAR(255)  | NULLABLE                    | Barangay                                |
| project_location_city             | VARCHAR(255)  | NULLABLE                    | City                                    |
| project_location_municipality     | VARCHAR(255)  | NULLABLE                    | Municipality                            |
| project_location_province         | VARCHAR(255)  | NULLABLE                    | Province                                |
| project_area_sqm                  | DECIMAL(10,2) | NULLABLE                    | Project area in sqm                     |
| lot_area_sqm                      | DECIMAL(10,2) | NULLABLE                    | Lot area in sqm                         |
| bldg_improvement_sqm              | DECIMAL(10,2) | NULLABLE                    | Building improvement area               |
| right_over_land                   | ENUM          | NULLABLE                    | Owner or Lessee                         |
| project_nature_duration           | ENUM          | NULLABLE                    | Permanent or Temporary                  |
| project_nature_years              | INT           | NULLABLE                    | Duration in years                       |
| project_cost                      | TEXT          | NULLABLE                    | Estimated project cost                  |
| existing_land_use                 | ENUM          | NULLABLE                    | Current land use type                   |
| has_written_notice                | ENUM          | NULLABLE                    | yes or no                               |
| notice_officer_name               | VARCHAR(255)  | NULLABLE                    | Officer name                            |
| notice_dates                      | VARCHAR(255)  | NULLABLE                    | Notice dates                            |
| has_similar_application           | ENUM          | NULLABLE                    | yes or no                               |
| similar_application_offices       | TEXT          | NULLABLE                    | Other offices applied to                |
| similar_application_dates         | VARCHAR(255)  | NULLABLE                    | Application dates                       |
| preferred_release_mode            | ENUM          | NULLABLE                    | pickup, mail_applicant, etc.            |
| release_address                   | TEXT          | NULLABLE                    | Release address                         |
| status                            | ENUM          | NOT NULL, DEFAULT 'pending' | pending, approved, rejected             |
| reviewed_status                   | ENUM          | NULLABLE                    | Admin review status                     |
| reviewed_by                       | INT           | FOREIGN KEY, NULLABLE       | Admin who reviewed                      |
| reviewed_at                       | TIMESTAMP     | NULLABLE                    | Review timestamp                        |
| payment_deadline                  | DATE          | NULLABLE                    | Payment due date                        |
| created_at                        | TIMESTAMP     | NOT NULL                    | Record creation time                    |
| updated_at                        | TIMESTAMP     | NOT NULL                    | Last update time                        |

**Indexes**:

- PRIMARY KEY (id)
- UNIQUE KEY (control_number)
- INDEX (user_id)
- INDEX (status)
- INDEX (reviewed_by)

**Foreign Keys**:

- user_id → users(id) ON DELETE SET NULL
- reviewed_by → users(id) ON DELETE SET NULL

---

### Table: reports

**Purpose**: Store evaluation reports for requests

| Column          | Type          | Constraints                 | Description                           |
| --------------- | ------------- | --------------------------- | ------------------------------------- |
| report_id       | INT           | PRIMARY KEY, AUTO_INCREMENT | Unique report identifier              |
| request_id      | BIGINT        | FOREIGN KEY, NOT NULL       | Reference to requests.id              |
| description     | TEXT          | NULLABLE                    | Report description                    |
| date_certified  | DATE          | NULLABLE                    | Certification date                    |
| amount          | DECIMAL(12,2) | NULLABLE                    | Assessed amount                       |
| evaluation      | ENUM          | NULLABLE                    | pending, reviewed, approved, rejected |
| date_reported   | DATETIME      | NULLABLE                    | Report submission date                |
| issued_by       | VARCHAR(255)  | NULLABLE                    | Report issuer name                    |
| workflow_status | VARCHAR(255)  | NULLABLE                    | Current workflow status               |
| created_at      | TIMESTAMP     | NOT NULL                    | Record creation time                  |
| updated_at      | TIMESTAMP     | NOT NULL                    | Last update time                      |

**Indexes**:

- PRIMARY KEY (report_id)
- INDEX (request_id)
- INDEX (evaluation)

**Foreign Keys**:

- request_id → requests(id) ON DELETE CASCADE

---

### Table: payments

**Purpose**: Store payment records for requests

| Column                        | Type          | Constraints                 | Description                      |
| ----------------------------- | ------------- | --------------------------- | -------------------------------- |
| id                            | BIGINT        | PRIMARY KEY, AUTO_INCREMENT | Unique payment identifier        |
| request_id                    | BIGINT        | FOREIGN KEY, NOT NULL       | Reference to requests.id         |
| amount                        | DECIMAL(10,2) | NOT NULL                    | Payment amount                   |
| payment_method                | ENUM          | NOT NULL, DEFAULT 'cash'    | cash, bank_transfer, gcash, etc. |
| payment_type                  | ENUM          | NOT NULL, DEFAULT 'manual'  | manual or online                 |
| receipt_number                | VARCHAR(255)  | NULLABLE                    | Receipt number                   |
| receipt_file_path             | VARCHAR(255)  | NULLABLE                    | Uploaded receipt file path       |
| payment_date                  | DATE          | NOT NULL                    | Date of payment                  |
| payment_status                | ENUM          | NOT NULL, DEFAULT 'pending' | pending, verified, rejected      |
| verified_by                   | INT           | FOREIGN KEY, NULLABLE       | Admin who verified               |
| verified_at                   | TIMESTAMP     | NULLABLE                    | Verification timestamp           |
| rejection_reason              | TEXT          | NULLABLE                    | Reason for rejection             |
| notes                         | TEXT          | NULLABLE                    | Additional notes                 |
| checkout_url                  | VARCHAR(255)  | NULLABLE                    | Payment gateway URL              |
| transaction_reference         | VARCHAR(255)  | NULLABLE                    | Transaction reference            |
| paid_at                       | TIMESTAMP     | NULLABLE                    | Payment completion time          |
| xendit_invoice_id             | VARCHAR(255)  | NULLABLE                    | Xendit invoice ID                |
| xendit_charge_id              | VARCHAR(255)  | NULLABLE                    | Xendit charge ID                 |
| xendit_external_id            | VARCHAR(255)  | NULLABLE                    | External reference ID            |
| invoice_url                   | VARCHAR(255)  | NULLABLE                    | Xendit invoice URL               |
| payment_channel               | VARCHAR(255)  | NULLABLE                    | Payment channel used             |
| xendit_metadata               | JSON          | NULLABLE                    | Additional Xendit data           |
| order_of_payment_number       | VARCHAR(255)  | NULLABLE                    | Order of payment number          |
| order_of_payment_generated_at | TIMESTAMP     | NULLABLE                    | OOP generation time              |
| created_at                    | TIMESTAMP     | NOT NULL                    | Record creation time             |
| updated_at                    | TIMESTAMP     | NOT NULL                    | Last update time                 |

**Indexes**:

- PRIMARY KEY (id)
- INDEX (request_id)
- INDEX (payment_status)
- INDEX (verified_by)
- INDEX (xendit_invoice_id)

**Foreign Keys**:

- request_id → requests(id) ON DELETE CASCADE
- verified_by → users(id) ON DELETE SET NULL

---

### Table: certificates

**Purpose**: Store issued certificates for approved requests

| Column                | Type         | Constraints                   | Description                          |
| --------------------- | ------------ | ----------------------------- | ------------------------------------ |
| id                    | BIGINT       | PRIMARY KEY, AUTO_INCREMENT   | Unique certificate identifier        |
| request_id            | BIGINT       | FOREIGN KEY, NOT NULL         | Reference to requests.id             |
| payment_id            | BIGINT       | FOREIGN KEY, NULLABLE         | Reference to payments.id             |
| certificate_number    | VARCHAR(255) | NOT NULL, UNIQUE              | Generated cert number (CPD-010-XXXX) |
| certificate_file_path | VARCHAR(255) | NULLABLE                      | PDF file path                        |
| issued_by             | INT          | FOREIGN KEY, NULLABLE         | Super admin who issued               |
| issued_at             | TIMESTAMP    | NULLABLE                      | Issuance timestamp                   |
| valid_until           | DATE         | NULLABLE                      | Certificate expiry date              |
| status                | ENUM         | NOT NULL, DEFAULT 'generated' | generated, sent, collected           |
| notes                 | TEXT         | NULLABLE                      | Additional notes                     |
| created_at            | TIMESTAMP    | NOT NULL                      | Record creation time                 |
| updated_at            | TIMESTAMP    | NOT NULL                      | Last update time                     |

**Indexes**:

- PRIMARY KEY (id)
- UNIQUE KEY (certificate_number)
- INDEX (request_id)
- INDEX (payment_id)
- INDEX (issued_by)

**Foreign Keys**:

- request_id → requests(id) ON DELETE CASCADE
- payment_id → payments(id) ON DELETE SET NULL
- issued_by → users(id) ON DELETE SET NULL

---

### Table: status_history

**Purpose**: Track status changes for audit trail

| Column     | Type         | Constraints                 | Description               |
| ---------- | ------------ | --------------------------- | ------------------------- |
| id         | BIGINT       | PRIMARY KEY, AUTO_INCREMENT | Unique history identifier |
| request_id | BIGINT       | FOREIGN KEY, NOT NULL       | Reference to requests.id  |
| old_status | VARCHAR(255) | NULLABLE                    | Previous status           |
| new_status | VARCHAR(255) | NOT NULL                    | New status                |
| changed_by | INT          | FOREIGN KEY, NULLABLE       | User who made change      |
| notes      | TEXT         | NULLABLE                    | Change notes              |
| created_at | TIMESTAMP    | NOT NULL                    | Change timestamp          |
| updated_at | TIMESTAMP    | NOT NULL                    | Last update time          |

**Indexes**:

- PRIMARY KEY (id)
- INDEX (request_id)
- INDEX (changed_by)

**Foreign Keys**:

- request_id → requests(id) ON DELETE CASCADE
- changed_by → users(id) ON DELETE SET NULL

---

### Table: audit_logs

**Purpose**: System-wide audit logging

| Column     | Type         | Constraints                 | Description               |
| ---------- | ------------ | --------------------------- | ------------------------- |
| id         | BIGINT       | PRIMARY KEY, AUTO_INCREMENT | Unique log identifier     |
| user_id    | INT          | FOREIGN KEY, NULLABLE       | User who performed action |
| action     | VARCHAR(255) | NOT NULL                    | Action performed          |
| model_type | VARCHAR(255) | NULLABLE                    | Model class name          |
| model_id   | BIGINT       | NULLABLE                    | Model record ID           |
| old_values | JSON         | NULLABLE                    | Previous values           |
| new_values | JSON         | NULLABLE                    | New values                |
| ip_address | VARCHAR(45)  | NULLABLE                    | User IP address           |
| user_agent | TEXT         | NULLABLE                    | Browser user agent        |
| created_at | TIMESTAMP    | NOT NULL                    | Action timestamp          |
| updated_at | TIMESTAMP    | NOT NULL                    | Last update time          |

**Indexes**:

- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (model_type, model_id)
- INDEX (created_at)

**Foreign Keys**:

- user_id → users(id) ON DELETE SET NULL

---

### Table: notifications

**Purpose**: Store user notifications

| Column     | Type         | Constraints                 | Description                    |
| ---------- | ------------ | --------------------------- | ------------------------------ |
| id         | BIGINT       | PRIMARY KEY, AUTO_INCREMENT | Unique notification identifier |
| user_id    | INT          | FOREIGN KEY, NOT NULL       | Reference to users.id          |
| type       | VARCHAR(255) | NOT NULL                    | Notification type              |
| title      | VARCHAR(255) | NOT NULL                    | Notification title             |
| message    | TEXT         | NOT NULL                    | Notification message           |
| data       | JSON         | NULLABLE                    | Additional data                |
| read_at    | TIMESTAMP    | NULLABLE                    | Read timestamp                 |
| created_at | TIMESTAMP    | NOT NULL                    | Creation timestamp             |
| updated_at | TIMESTAMP    | NOT NULL                    | Last update time               |

**Indexes**:

- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (read_at)
- INDEX (created_at)

**Foreign Keys**:

- user_id → users(id) ON DELETE CASCADE

---

### Table: reminders

**Purpose**: Store scheduled reminders for requests

| Column       | Type         | Constraints                 | Description                |
| ------------ | ------------ | --------------------------- | -------------------------- |
| id           | BIGINT       | PRIMARY KEY, AUTO_INCREMENT | Unique reminder identifier |
| request_id   | BIGINT       | FOREIGN KEY, NOT NULL       | Reference to requests.id   |
| type         | VARCHAR(255) | NOT NULL                    | Reminder type              |
| scheduled_at | TIMESTAMP    | NOT NULL                    | When to send reminder      |
| sent_at      | TIMESTAMP    | NULLABLE                    | When reminder was sent     |
| status       | ENUM         | NOT NULL, DEFAULT 'pending' | pending, sent, failed      |
| created_at   | TIMESTAMP    | NOT NULL                    | Record creation time       |
| updated_at   | TIMESTAMP    | NOT NULL                    | Last update time           |

**Indexes**:

- PRIMARY KEY (id)
- INDEX (request_id)
- INDEX (scheduled_at)
- INDEX (status)

**Foreign Keys**:

- request_id → requests(id) ON DELETE CASCADE

---

### Table: sms_logs

**Purpose**: Track all SMS notifications sent

| Column              | Type         | Constraints                 | Description               |
| ------------------- | ------------ | --------------------------- | ------------------------- |
| id                  | BIGINT       | PRIMARY KEY, AUTO_INCREMENT | Unique SMS log identifier |
| user_id             | INT          | FOREIGN KEY, NULLABLE       | Reference to users.id     |
| mobile_number       | VARCHAR(255) | NOT NULL                    | Recipient mobile number   |
| message             | TEXT         | NOT NULL                    | SMS message content       |
| status              | ENUM         | NOT NULL, DEFAULT 'pending' | pending, sent, failed     |
| provider_message_id | VARCHAR(255) | NULLABLE                    | Semaphore message ID      |
| provider_status     | VARCHAR(255) | NULLABLE                    | Provider status response  |
| cost                | DECIMAL(8,2) | NULLABLE                    | SMS cost in PHP           |
| error_message       | TEXT         | NULLABLE                    | Error details if failed   |
| created_at          | TIMESTAMP    | NOT NULL                    | Send timestamp            |
| updated_at          | TIMESTAMP    | NOT NULL                    | Last update time          |

**Indexes**:

- PRIMARY KEY (id)
- INDEX (user_id, created_at)
- INDEX (status)

**Foreign Keys**:

- user_id → users(id) ON DELETE SET NULL

---

### Supporting Tables

#### Table: password_reset_tokens

| Column     | Type         | Constraints | Description         |
| ---------- | ------------ | ----------- | ------------------- |
| email      | VARCHAR(255) | PRIMARY KEY | User email          |
| token      | VARCHAR(255) | NOT NULL    | Reset token         |
| created_at | TIMESTAMP    | NULLABLE    | Token creation time |

#### Table: sessions

| Column        | Type         | Constraints           | Description             |
| ------------- | ------------ | --------------------- | ----------------------- |
| id            | VARCHAR(255) | PRIMARY KEY           | Session identifier      |
| user_id       | INT          | FOREIGN KEY, NULLABLE | Reference to users.id   |
| ip_address    | VARCHAR(45)  | NULLABLE              | User IP address         |
| user_agent    | TEXT         | NULLABLE              | Browser user agent      |
| payload       | LONGTEXT     | NOT NULL              | Session data            |
| last_activity | INT          | NOT NULL              | Last activity timestamp |

#### Table: cache

| Column     | Type         | Constraints | Description      |
| ---------- | ------------ | ----------- | ---------------- |
| key        | VARCHAR(255) | PRIMARY KEY | Cache key        |
| value      | MEDIUMTEXT   | NOT NULL    | Cached value     |
| expiration | INT          | NOT NULL    | Expiry timestamp |

#### Table: jobs

| Column       | Type         | Constraints                 | Description         |
| ------------ | ------------ | --------------------------- | ------------------- |
| id           | BIGINT       | PRIMARY KEY, AUTO_INCREMENT | Job identifier      |
| queue        | VARCHAR(255) | NOT NULL                    | Queue name          |
| payload      | LONGTEXT     | NOT NULL                    | Job data            |
| attempts     | TINYINT      | NOT NULL                    | Retry attempts      |
| reserved_at  | INT          | NULLABLE                    | Reserved timestamp  |
| available_at | INT          | NOT NULL                    | Available timestamp |
| created_at   | INT          | NOT NULL                    | Creation timestamp  |

---

## GANTT Chart

### Project Timeline: CPDO Management System Development

```
Project Duration: 6 Months (October 2025 - March 2026)

Phase 1: Planning & Analysis (October 2025)
├─ Requirements Gathering        [████████░░] Week 1-2
├─ System Analysis               [████████░░] Week 2-3
└─ Technical Specification       [████████░░] Week 3-4

Phase 2: Design (November 2025)
├─ Database Design               [████████░░] Week 1-2
├─ UI/UX Design                  [████████░░] Week 2-3
├─ System Architecture           [████████░░] Week 3-4
└─ API Design                    [████████░░] Week 3-4

Phase 3: Development (December 2025 - January 2026)
├─ Backend Development
│  ├─ User Authentication        [██████████] Week 1-2
│  ├─ Request Management         [██████████] Week 3-4
│  ├─ Admin Dashboard            [██████████] Week 5-6
│  └─ Payment Integration        [██████████] Week 7-8
│
└─ Frontend Development
   ├─ Landing & Auth Pages       [██████████] Week 1-2
   ├─ Applicant Dashboard        [██████████] Week 3-4
   ├─ Admin Interface            [██████████] Week 5-6
   └─ Super Admin Interface      [██████████] Week 7-8

Phase 4: Integration & Testing (February 2026)
├─ System Integration            [██████████] Week 1-2
├─ Unit Testing                  [██████████] Week 2-3
├─ Integration Testing           [██████████] Week 3-4
└─ User Acceptance Testing       [██████████] Week 4

Phase 5: Deployment (March 2026)
├─ Server Setup                  [██████████] Week 1
├─ Database Migration            [██████████] Week 1
├─ System Deployment             [██████████] Week 2
├─ User Training                 [██████████] Week 2-3
└─ Go-Live                       [██████████] Week 4
```

### Detailed Task Breakdown

#### Month 1: October 2025 - Planning & Analysis

| Week | Task                      | Duration | Status       |
| ---- | ------------------------- | -------- | ------------ |
| 1    | Stakeholder meetings      | 3 days   | ✅ Completed |
| 1-2  | Requirements gathering    | 7 days   | ✅ Completed |
| 2    | Document requirements     | 3 days   | ✅ Completed |
| 2-3  | System analysis           | 7 days   | ✅ Completed |
| 3    | Feasibility study         | 3 days   | ✅ Completed |
| 3-4  | Technical specification   | 7 days   | ✅ Completed |
| 4    | Project plan finalization | 2 days   | ✅ Completed |

#### Month 2: November 2025 - Design Phase

| Week | Task                       | Duration | Status       |
| ---- | -------------------------- | -------- | ------------ |
| 1    | Database schema design     | 5 days   | ✅ Completed |
| 1-2  | ERD creation               | 3 days   | ✅ Completed |
| 2    | UI wireframes              | 5 days   | ✅ Completed |
| 2-3  | UI mockups                 | 5 days   | ✅ Completed |
| 3    | System architecture design | 4 days   | ✅ Completed |
| 3-4  | API endpoint design        | 5 days   | ✅ Completed |
| 4    | Design review & approval   | 2 days   | ✅ Completed |

#### Month 3-4: December 2025 - January 2026 - Development Phase

| Week | Task                           | Duration | Status       |
| ---- | ------------------------------ | -------- | ------------ |
| 1    | Setup development environment  | 2 days   | ✅ Completed |
| 1    | Laravel project initialization | 1 day    | ✅ Completed |
| 1-2  | User authentication system     | 7 days   | ✅ Completed |
| 2    | Role-based access control      | 3 days   | ✅ Completed |
| 3    | Request submission module      | 5 days   | ✅ Completed |
| 3-4  | Request management (CRUD)      | 7 days   | ✅ Completed |
| 4    | Admin review workflow          | 5 days   | ✅ Completed |
| 5    | Super admin approval system    | 5 days   | ✅ Completed |
| 5-6  | Payment module (manual)        | 7 days   | ✅ Completed |
| 6    | Xendit payment integration     | 5 days   | ✅ Completed |
| 7    | Certificate generation         | 5 days   | ✅ Completed |
| 7    | PDF export functionality       | 3 days   | ✅ Completed |
| 8    | Email notification system      | 5 days   | ✅ Completed |
| 8    | SMS notification integration   | 3 days   | ✅ Completed |
| 8    | Reminder scheduling            | 3 days   | ✅ Completed |

#### Month 3-4: Frontend Development (Parallel)

| Week | Task                       | Duration | Status       |
| ---- | -------------------------- | -------- | ------------ |
| 1    | React + Inertia setup      | 2 days   | ✅ Completed |
| 1    | Tailwind CSS configuration | 1 day    | ✅ Completed |
| 1-2  | Login & registration pages | 5 days   | ✅ Completed |
| 2    | Landing page               | 3 days   | ✅ Completed |
| 3    | Applicant dashboard        | 5 days   | ✅ Completed |
| 3-4  | Request submission form    | 7 days   | ✅ Completed |
| 4    | Request tracking interface | 5 days   | ✅ Completed |
| 5    | Admin dashboard            | 5 days   | ✅ Completed |
| 5-6  | Admin request management   | 7 days   | ✅ Completed |
| 6    | Payment verification UI    | 5 days   | ✅ Completed |
| 7    | Super admin dashboard      | 5 days   | ✅ Completed |
| 7-8  | Approval & certificate UI  | 7 days   | ✅ Completed |
| 8    | Notification components    | 3 days   | ✅ Completed |

#### Month 5: February 2026 - Integration & Testing

| Week | Task                         | Duration | Status       |
| ---- | ---------------------------- | -------- | ------------ |
| 1    | Backend-frontend integration | 5 days   | ✅ Completed |
| 1-2  | API endpoint testing         | 5 days   | ✅ Completed |
| 2    | Payment gateway testing      | 3 days   | ✅ Completed |
| 2-3  | Unit test development        | 7 days   | ✅ Completed |
| 3    | Integration testing          | 5 days   | ✅ Completed |
| 3    | Bug fixing                   | 3 days   | ✅ Completed |
| 4    | User acceptance testing      | 5 days   | ✅ Completed |
| 4    | Performance optimization     | 3 days   | ✅ Completed |

#### Month 6: March 2026 - Deployment & Launch

| Week | Task                        | Duration | Status         |
| ---- | --------------------------- | -------- | -------------- |
| 1    | Production server setup     | 2 days   | ✅ Completed   |
| 1    | Database migration          | 1 day    | ✅ Completed   |
| 1    | SSL certificate setup       | 1 day    | ✅ Completed   |
| 2    | System deployment           | 2 days   | ✅ Completed   |
| 2    | Final testing on production | 2 days   | ✅ Completed   |
| 2-3  | User training sessions      | 5 days   | ✅ Completed   |
| 3    | Documentation finalization  | 3 days   | ✅ Completed   |
| 4    | System go-live              | 1 day    | ✅ Completed   |
| 4    | Post-launch monitoring      | Ongoing  | 🔄 In Progress |

### Visual GANTT Chart

```
Task Name                    Oct    Nov    Dec    Jan    Feb    Mar
─────────────────────────────────────────────────────────────────────
Planning & Analysis          ████
Requirements Gathering       ██
System Analysis               ██
Technical Specification         ██

Design Phase                       ████
Database Design                    ██
UI/UX Design                        ██
System Architecture                   ██
API Design                            ██

Backend Development                      ████████
Authentication                           ██
Request Management                         ██
Admin Dashboard                              ██
Payment Integration                            ██

Frontend Development                     ████████
Auth Pages                               ██
Applicant Interface                        ██
Admin Interface                              ██
Super Admin Interface                          ██

Integration & Testing                              ████
System Integration                                 ██
Unit Testing                                        ██
UAT                                                   ██

Deployment                                               ████
Server Setup                                             █
System Deployment                                         █
User Training                                              ██
Go-Live                                                      █

─────────────────────────────────────────────────────────────────────
Legend: █ = Completed  ░ = In Progress  ▓ = Planned
```

### Milestones

| Milestone             | Target Date  | Status      |
| --------------------- | ------------ | ----------- |
| Requirements Approved | Oct 31, 2025 | ✅ Achieved |
| Design Completed      | Nov 30, 2025 | ✅ Achieved |
| Backend MVP Ready     | Dec 31, 2025 | ✅ Achieved |
| Frontend MVP Ready    | Jan 15, 2026 | ✅ Achieved |
| Integration Complete  | Jan 31, 2026 | ✅ Achieved |
| Testing Complete      | Feb 28, 2026 | ✅ Achieved |
| System Deployed       | Mar 15, 2026 | ✅ Achieved |
| Go-Live               | Mar 27, 2026 | ✅ Achieved |

### Critical Path

The critical path for the project includes:

1. Requirements Gathering → System Analysis → Technical Specification
2. Database Design → Backend Development → Frontend Development
3. Integration → Testing → Deployment

Total Project Duration: 24 weeks (6 months)

---

## Summary

This technical background chapter provides a comprehensive overview of the CPDO Management System's architecture, design, and implementation. The system successfully implements:

- **Modern Architecture**: Three-tier architecture with clear separation of concerns
- **Robust Database**: Well-normalized schema with proper relationships and constraints
- **Secure Workflow**: Role-based access control with comprehensive audit trails
- **Payment Integration**: Dual payment system supporting both manual and online payments
- **Multi-Channel Notifications**: Email and SMS notifications via Semaphore API
- **User Experience**: Responsive, accessible interface built with modern frameworks
- **Scalability**: Optimized queries, caching, and efficient data structures

The system is production-ready and successfully deployed, serving the City Planning and Development Office's needs for land certification management.

---

**Document Version**: 1.0  
**Last Updated**: March 27, 2026  
**Status**: Complete
