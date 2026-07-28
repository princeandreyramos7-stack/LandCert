# Data Flow Diagram - Level 1 (Major Processes)

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

## Discussion

Figure 2-5 presents the Level 1 Data Flow Diagram, decomposing the system into five major processes that represent the core workflow of the LandCert system.

**Process 1.0 (Manage Requests)** accepts Request Details from the Applicant and stores User Data in D1:Users and Request Data in D2:Requests. This process handles the initial application submission and user registration.

**Process 2.0 (Review & Evaluate)** retrieves Request Data from D2:Requests, receives Review Data from Admin, and updates the request status in D2:Requests with Updated Request Data. This process enables administrative staff to review applications, verify documents, and perform initial evaluations.

**Process 3.0 (Approve/Reject)** receives Evaluation Report from Process 2.0 and Approval Decision from Super Admin, then updates Status in D2:Requests. This process represents the final decision-making authority for land certification applications.

**Process 4.0 (Process Payment)** handles Payment Data storage in D3:Payments and confirms payment. This process manages payment verification for approved applications.

**Process 5.0 (Generate Certificate)** creates Cert Data in D4:Certificates and delivers the Certificate to the Applicant. This final process produces the official land certification document.

The data store D2:Requests serves as the central repository, accessed by Processes 1.0, 2.0, and 3.0, ensuring all workflow stages reference the same application data. All data flows are labeled with nouns to clearly indicate the type of information being transferred between processes, data stores, and external entities.

---
