# Data Flow Diagram - Level 0 (Context Level)

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
                    │   LandCert System     │──────► Certificates
                    │                       │        Reports
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

## Discussion

Figure 2-4 illustrates the Level 0 Data Flow Diagram, showing the highest-level view of the LandCert system's interactions with external entities. The Applicant provides Request Info and Payment Info to the LandCert System, which processes these inputs and produces Certificates, Reports, and Notifications as outputs. Admin and Super Admin users provide Review Data and Approval decisions to the system, enabling the workflow progression from submission to certificate issuance.

The context diagram demonstrates the system boundary, clearly separating internal system processes from external entities. All data flows use noun-based labels to describe the information being exchanged between entities and the system.

---
