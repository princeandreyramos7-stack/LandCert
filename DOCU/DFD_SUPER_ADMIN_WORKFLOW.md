# Data Flow Diagram - Super Admin Workflow

**Figure 2-10. Super Admin Workflow Data Flow Diagram**

```
┌─────────────────┐
│  Super Admin    │
└────────┬────────┘
         │
         │ Login Credentials
         │
         ▼
┌─────────────────────┐         ┌──────────────┐
│       1.0           │────────►│  D1: Users   │
│  Authenticate       │  Super  └──────┬───────┘
│  Super Admin        │  Admin         │
│                     │  Query         │
│                     │◄───────────────┘
│                     │  Super Admin
└──────┬──────────────┘  Record
       │
       │ Super Admin Session
       │
       ▼
┌─────────────────────┐         ┌──────────────────┐
│       2.0           │────────►│ D2: Requests     │
│  View System        │  System └──────┬───────────┘
│  Dashboard          │  Queries       │
│                     │◄───────────────┤
│                     │  System        │
│                     │  Statistics    │
│                     │         ┌──────┴──────────┐
│                     │◄────────│ D4: REPORTS     │
│                     │  Report └─────────────────┘
│                     │  Data
└──────┬──────────────┘
       │
       │ System Overview
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼


═══════════════════════════════════════════════════════════════
FLOW 1: FINAL APPROVAL/REJECTION
═══════════════════════════════════════════════════════════════

┌─────────────────┐
│  Super Admin    │
└────────┬────────┘
         │
         │ View Reviewed Applications
         │
         ▼
┌─────────────────────┐         ┌──────────────┐
│       3.0           │────────►│ D2: Requests │
│  View Applications  │  Query  └──────┬───────┘
│  Awaiting Final     │  Reviewed      │
│  Approval           │  Apps          │
│                     │◄───────────────┤
│                     │  Application   │
│                     │  List          │
│                     │         ┌──────┴──────┐
│                     │◄────────│ D4: REPORTS │
└──────┬──────────────┘ Report  └─────────────┘
       │                Data
       │
       │ Application Details
       │
       ▼
┌─────────────────────┐
│       4.0           │
│  Review Admin       │         ┌──────────────────┐
│  Evaluation &       │────────►│ D7: DSS_         │
│  DSS Results        │  Query  │    EVALUATIONS   │
│                     │  DSS    └──────┬───────────┘
│                     │  Data          │
│                     │◄───────────────┘
│                     │  DSS Scores
└──────┬──────────────┘  Risk Analysis
       │
       │ Evaluation Complete
       │
       ▼
┌─────────────────────┐
│       5.0           │
│  Make Final         │
│  Decision           │
└──────┬──────────────┘
       │
       ├──────────────┬──────────────┐
       │ Approve      │ Reject       │
       │              │              │
       ▼              ▼              │
┌──────────────┐ ┌──────────────┐   │
│     6.0a     │ │     6.0b     │   │
│  Update as   │ │  Update as   │   │
│  Approved    │ │  Rejected    │   │
└──────┬───────┘ └──────┬───────┘   │
       │              │              │
       │              │              │
       │  Approval    │  Rejection   │
       │  Data        │  Data        │
       │              │              │
       ▼              ▼              │
     ┌─────────────────────────┐    │
     │ D4: REPORTS             │    │
     └──────┬──────────────────┘    │
            │                       │
            │ Updated Report Status │
            │                       │
            ▼                       │
     ┌─────────────────────────┐   │
     │ D2: Requests            │   │
     └──────┬──────────────────┘   │
            │                      │
            │ Updated Status       │
            │                      │
            ▼                      │
┌─────────────────────┐            │
│       7.0           │            │
│  Generate           │            │
│  Notification       │            │
└──────┬──────────────┘            │
       │                           │
       │ Notification              │
       │ Message                   │
       │                           │
       ▼                           │
┌──────────────────┐               │
│ D6: Notifications│               │
└──────┬───────────┘               │
       │                           │
       │ Notification              │
       │                           │
       ▼                           │
┌─────────────┐                    │
│  Applicant  │                    │
└─────────────┘                    │
                                   │

═══════════════════════════════════════════════════════════════
FLOW 2: USER MANAGEMENT (ALL USERS)
═══════════════════════════════════════════════════════════════

┌─────────────────┐
│  Super Admin    │
└────────┬────────┘
         │
         │ User Management Request
         │
         ▼
┌─────────────────────┐         ┌──────────────┐
│       8.0           │────────►│  D1: Users   │
│  View All Users     │  Query  └──────┬───────┘
│  (Applicants,       │  All           │
│   Admins, Staff)    │  Users         │
│                     │◄───────────────┘
│                     │  User List
└──────┬──────────────┘
       │
       │ User List
       │
       ▼
┌─────────────────────┐
│       9.0           │
│  Select Action:     │
│  Create/Edit/Delete │
└──────┬──────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │ Create       │ Edit         │ Delete       │
       │              │              │              │
       ▼              ▼              ▼              │
┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│    10.0a     │ │    10.0b     │ │    10.0c     ││
│  Create New  │ │  Update User │ │  Delete User ││
│  User        │ │  Information │ │              ││
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘│
       │              │              │             │
       │ New User     │ Updated      │ Delete      │
       │ Data         │ User Data    │ Command     │
       │              │              │             │
       ▼              ▼              ▼             │
     ┌────────────────────────────────────┐       │
     │         D1: Users                  │       │
     └───────────────┬────────────────────┘       │
                     │                            │
                     │ Confirmation               │
                     │                            │
                     ▼                            │
            ┌─────────────────┐                  │
            │  Super Admin    │                  │
            └─────────────────┘                  │


═══════════════════════════════════════════════════════════════
FLOW 3: AUDIT LOG MONITORING
═══════════════════════════════════════════════════════════════

┌─────────────────┐
│  Super Admin    │
└────────┬────────┘
         │
         │ View Audit Logs Request
         │
         ▼
┌─────────────────────┐         ┌──────────────────┐
│      11.0           │────────►│ D8: AUDIT_LOGS   │
│  View System        │  Query  └──────┬───────────┘
│  Audit Logs         │  Logs          │
│                     │◄───────────────┘
│                     │  Audit Records
└──────┬──────────────┘
       │
       │ Audit Log List
       │
       ▼
┌─────────────────────┐
│      12.0           │
│  Apply Filters      │
│  (User, Action,     │
│   Date, Model)      │
└──────┬──────────────┘
       │
       │ Filtered Logs
       │
       ▼
┌─────────────────────┐
│      13.0           │
│  Review Activity    │
│  and Changes        │
└─────────────────────┘
       │
       │ Activity Analysis
       │
       ▼
┌─────────────────┐
│  Super Admin    │
└─────────────────┘


═══════════════════════════════════════════════════════════════
FLOW 4: ZONING MAP MANAGEMENT
═══════════════════════════════════════════════════════════════

┌─────────────────┐
│  Super Admin    │
└────────┬────────┘
         │
         │ View Zoning Map Request
         │
         ▼
┌─────────────────────┐         ┌──────────────────┐
│      14.0           │────────►│ D3: PROPERTY_    │
│  View Zoning Map    │  Query  │    LOCATIONS     │
│  with Properties    │  Props  └──────┬───────────┘
│                     │◄───────────────┤
│                     │  Property      │
│                     │  Data          │
│                     │         ┌──────┴───────────┐
│                     │◄────────│ D9: ZONING_RULES │
└──────┬──────────────┘ Zoning  └──────────────────┘
       │                Rules
       │
       │ Map Data
       │
       ▼
┌─────────────────────┐
│      15.0           │
│  Add/Edit Property  │
│  Location           │
└──────┬──────────────┘
       │
       │ Property Data
       │
       ▼
┌─────────────────────┐         ┌──────────────────┐
│      16.0           │────────►│ D3: PROPERTY_    │
│  Store Property     │ Property│    LOCATIONS     │
│  with Zoning        │ Record  └──────────────────┘
│  Classification     │
└─────────────────────┘
       │
       │ Confirmation
       │
       ▼
┌─────────────────┐
│  Super Admin    │
└─────────────────┘
```

## Discussion

Figure 2-10 illustrates the Super Admin workflow in the LandCert system, decomposed into four major flows: Final Approval/Rejection, User Management, Audit Log Monitoring, and Zoning Map Management.

### Flow 1: Final Approval/Rejection (Processes 3.0 - 7.0)

**Process 3.0 (View Applications Awaiting Final Approval)** retrieves applications that have been reviewed by Admin staff from D2:Requests and their corresponding evaluation reports from D4:REPORTS, providing the Application List to the Super Admin.

**Process 4.0 (Review Admin Evaluation & DSS Results)** fetches detailed DSS Data from D7:DSS_EVALUATIONS, including DSS Scores and Risk Analysis generated by the automated Decision Support System, allowing the Super Admin to verify the admin's assessment.

**Process 5.0 (Make Final Decision)** represents the Super Admin's decision-making authority, branching into approval or rejection paths.

**Process 6.0a (Update as Approved)** stores Approval Data in D4:REPORTS and updates the request status in D2:Requests when the Super Admin approves an application.

**Process 6.0b (Update as Rejected)** stores Rejection Data in D4:REPORTS and updates the request status in D2:Requests when the Super Admin rejects an application.

**Process 7.0 (Generate Notification)** creates a Notification Message in D6:Notifications and delivers it to the Applicant, informing them of the final decision.

### Flow 2: User Management (Processes 8.0 - 10.0)

**Process 8.0 (View All Users)** retrieves the complete User List from D1:Users, including applicants, admins, staff, and other super admins, providing comprehensive user oversight.

**Process 9.0 (Select Action)** allows the Super Admin to choose between creating, editing, or deleting users.

**Process 10.0a (Create New User)** stores New User Data in D1:Users, enabling the Super Admin to create new accounts for any user type (applicant, staff, admin, super_admin).

**Process 10.0b (Update User Information)** modifies Updated User Data in D1:Users, allowing changes to user profiles, roles, and permissions.

**Process 10.0c (Delete User)** executes Delete Command on D1:Users, removing user accounts from the system (with safeguards against self-deletion).

### Flow 3: Audit Log Monitoring (Processes 11.0 - 13.0)

**Process 11.0 (View System Audit Logs)** retrieves comprehensive Audit Records from D8:AUDIT_LOGS, providing visibility into all system activities.

**Process 12.0 (Apply Filters)** enables filtering by user, action, date, and model type, producing Filtered Logs for targeted analysis.

**Process 13.0 (Review Activity and Changes)** allows the Super Admin to analyze Activity patterns, detect anomalies, and ensure system security and compliance.

### Flow 4: Zoning Map Management (Processes 14.0 - 16.0)

**Process 14.0 (View Zoning Map with Properties)** retrieves Property Data from D3:PROPERTY_LOCATIONS and Zoning Rules from D9:ZONING_RULES, displaying geographic Map Data with property locations and zoning classifications.

**Process 15.0 (Add/Edit Property Location)** captures Property Data including coordinates, address, lot area, and zoning classification.

**Process 16.0 (Store Property with Zoning Classification)** saves the Property Record in D3:PROPERTY_LOCATIONS with proper zoning classification, updating the GIS database.

The Super Admin role provides the highest level of system authority with final approval power, comprehensive user management, audit trail oversight, and GIS/zoning administration capabilities.

---

## Data Stores Referenced

| Data Store | Description | Super Admin Access |
|-----------|-------------|-------------------|
| D1: Users | User accounts (all types) | Full Read/Write/Delete |
| D2: Requests | Application submissions | Read/Write |
| D3: Property_Locations | Geographic property data | Full Read/Write |
| D4: Reports | Evaluation reports | Read/Write (final approval) |
| D6: Notifications | System notifications | Write |
| D7: DSS_Evaluations | Decision Support System assessments | Read |
| D8: Audit_Logs | System activity logs | Read |
| D9: Zoning_Rules | Zoning classifications and rules | Read |

---

## Key Differences: Admin vs Super Admin

| Feature | Admin | Super Admin |
|---------|-------|-------------|
| **Final Approval** | Cannot approve | Can approve/reject |
| **User Management** | Applicants only | All user types |
| **Audit Logs** | No access | Full access |
| **Zoning Map** | No access | Full management |
| **DSS Evaluation** | Creates evaluations | Reviews evaluations |
| **System Settings** | No access | Full access |

---
