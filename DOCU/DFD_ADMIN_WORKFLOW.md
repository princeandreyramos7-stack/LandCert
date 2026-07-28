# Data Flow Diagram - Admin Workflow

**Figure 2-9. Admin Workflow Data Flow Diagram**

```
┌─────────────┐
│    Admin    │
└──────┬──────┘
       │
       │ Login Credentials
       │
       ▼
┌─────────────────────┐         ┌──────────────┐
│       1.0           │────────►│  D1: Users   │
│  Authenticate Admin │  Admin  └──────┬───────┘
│                     │  Query         │
│                     │◄───────────────┘
│                     │  Admin Record
└──────┬──────────────┘
       │
       │ Admin Session
       │
       ▼
┌─────────────────────┐         ┌──────────────┐
│       2.0           │────────►│ D2: Requests │
│  View Applications  │  Request└──────┬───────┘
│  Dashboard          │  Query         │
│                     │◄───────────────┘
│                     │  Application
│                     │  Data
└──────┬──────────────┘
       │
       │ Application List
       │
       ▼
┌─────────────────────┐
│       3.0           │
│  Select             │
│  Application        │
└──────┬──────────────┘
       │
       │ Application ID
       │
       ▼
┌─────────────────────┐         ┌──────────────┐
│       4.0           │────────►│ D2: Requests │
│  Review             │  Request└──────┬───────┘
│  Application        │  Details       │
│  Details            │◄───────────────┘
│                     │  Full
│                     │  Application
│                     │  Data
└──────┬──────────────┘
       │
       │ Application Details
       │
       ▼
┌─────────────────────┐
│       5.0           │
│  Perform DSS        │         ┌──────────────────┐
│  Evaluation         │────────►│ D7: DSS_         │
│                     │ DSS     │    EVALUATIONS   │
│                     │ Results └──────────────────┘
│                     │
│                     │         ┌──────────────────┐
│                     │────────►│ D3: PROPERTY_    │
└──────┬──────────────┘ Property│    LOCATIONS     │
       │                Data    └──────────────────┘
       │
       │ Evaluation Results
       │
       ▼
┌─────────────────────┐         ┌──────────────┐
│       6.0           │────────►│ D4: REPORTS  │
│  Create/Update      │ Report  └──────────────┘
│  Evaluation Report  │ Data
│                     │
│                     │         ┌──────────────┐
│                     │────────►│ D2: Requests │
└──────┬──────────────┘ Status  └──────────────┘
       │                Update
       │
       │ Report Created
       │
       ▼
┌─────────────────────┐         ┌──────────────────┐
│       7.0           │────────►│ D6: Notifications│
│  Generate           │ Notif   └──────────────────┘
│  Notification       │ Record
└─────────────────────┘
       │
       │ Notification
       │
       ▼
┌─────────────┐
│  Applicant  │
└─────────────┘


═══════════════════════════════════════════════════════════════

ALTERNATE FLOW: USER MANAGEMENT

┌─────────────┐
│    Admin    │
└──────┬──────┘
       │
       │ User Management Request
       │
       ▼
┌─────────────────────┐         ┌──────────────┐
│       8.0           │────────►│  D1: Users   │
│  View All           │  Query  └──────┬───────┘
│  Applicant Users    │◄───────────────┘
│                     │  User List
└──────┬──────────────┘
       │
       │ User List
       │
       ▼
┌─────────────────────┐
│       9.0           │
│  Select User for    │
│  Edit/Delete        │
└──────┬──────────────┘
       │
       │ User ID & Action
       │
       ▼
┌─────────────────────┐         ┌──────────────┐
│      10.0           │────────►│  D1: Users   │
│  Update or Delete   │ Updated └──────────────┘
│  User Information   │ User
│                     │ Data
└──────┬──────────────┘
       │
       │ Confirmation
       │
       ▼
┌─────────────┐
│    Admin    │
└─────────────┘
```

## Discussion

Figure 2-9 illustrates the Admin workflow in the LandCert system, decomposed into two main flows: Application Review Flow and User Management Flow.

### Application Review Flow (Processes 1.0 - 7.0)

**Process 1.0 (Authenticate Admin)** validates the admin's Login Credentials against D1:Users by sending an Admin Query and receiving the Admin Record. This ensures only authorized staff can access administrative functions.

**Process 2.0 (View Applications Dashboard)** retrieves applications from D2:Requests through a Request Query and displays the Application Data in a dashboard interface. This provides administrators with an overview of all pending and processed applications.

**Process 3.0 (Select Application)** allows the admin to choose a specific application by Application ID for detailed review.

**Process 4.0 (Review Application Details)** fetches detailed Request Details from D2:Requests, providing the Full Application Data including applicant information, project details, property location, and supporting documents.

**Process 5.0 (Perform DSS Evaluation)** executes the Decision Support System assessment, storing DSS Results in D7:DSS_EVALUATIONS and Property Data in D3:PROPERTY_LOCATIONS. The DSS automatically checks zoning compliance, calculates risk scores, and generates recommendations based on configured criteria.

**Process 6.0 (Create/Update Evaluation Report)** creates or updates the evaluation findings, storing Report Data in D4:REPORTS and updating Status in D2:Requests. This documents the admin's assessment and recommendations.

**Process 7.0 (Generate Notification)** creates a Notif Record in D6:Notifications and sends the Notification to the Applicant, informing them of the evaluation status (pending review, under review, or forwarded to Super Admin for approval).

### User Management Flow (Processes 8.0 - 10.0)

**Process 8.0 (View All Applicant Users)** retrieves the User List from D1:Users, displaying all registered applicants for management purposes.

**Process 9.0 (Select User for Edit/Delete)** allows the admin to choose a user by User ID and specify the desired Action (edit or delete).

**Process 10.0 (Update or Delete User Information)** modifies or removes Updated User Data in D1:Users based on the admin's action, then provides Confirmation of the operation.

The Admin role focuses on application processing, DSS evaluation, report generation, and basic user management, serving as the primary review and assessment layer before Super Admin final approval.

---

## Data Stores Referenced

| Data Store | Description | Admin Access |
|-----------|-------------|--------------|
| D1: Users | User accounts and profiles | Read/Write (applicants only) |
| D2: Requests | Application submissions | Read/Write |
| D3: Property_Locations | Geographic property data | Write (during evaluation) |
| D4: Reports | Evaluation reports | Read/Write |
| D6: Notifications | System notifications | Write |
| D7: DSS_Evaluations | Decision Support System assessments | Write |

---
