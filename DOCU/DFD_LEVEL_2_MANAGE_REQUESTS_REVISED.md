# Data Flow Diagram - Level 2: Process 1.0 (Manage Requests)

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

## Discussion

Figure 2-6 details Process 1.0 (Manage Requests) decomposed into five sub-processes that handle the complete application submission workflow.

**Process 1.1 (Authenticate User)** validates Login Credentials from the Applicant against D1:Users by sending a User Query and receiving the User Record. This process ensures that only registered users can submit applications and maintains system security.

**Process 1.2 (Create Request)** collects Request Data through a multi-step form interface. This process guides applicants through entering application details, project information, and property location data.

**Process 1.3 (Validate & Store Request)** validates the submitted data against business rules and stores the Request Record in D2:Requests while simultaneously creating a Status Update entry in D5:Status History. This dual storage ensures both current application data and historical status tracking are maintained.

**Process 1.4 (Generate Control Number)** creates a unique Control Number for the application following the format CPD-002-XXXX. This identifier serves as the primary reference for tracking the application throughout its lifecycle.

**Process 1.5 (Send Confirmation Notification)** stores a Notif Record in D6:Notifications for system tracking and sends a Confirmation Email to the Applicant. This process ensures applicants receive immediate acknowledgment of successful submission with their control number.

All processes are sequentially connected, ensuring data integrity as the application moves through authentication, creation, validation, identification, and notification stages. Data stores D1, D2, D5, and D6 are updated appropriately to maintain comprehensive system records.

---
