# REVISED CONTEXT DIAGRAM

## Context Diagram

**Figure 2-X. LandCert System Context Diagram**

```
┌─────────────────────────┐
│  SYSTEM ADMINISTRATOR   │
└───┬─────────────────┬───┘
    │                 ▲
    │                 │
    │                 │
    ▼                 │
    Login             User
    Credentials       Accounts
    User Mgmt         Activity
    Requests          Logs
    System            Status
    Configuration     Reports
    │                 System
    │                 Analytics
    │                 │
    │                 │
    ▼                 │
┌───────────────────────────────────────────────────┐
│                                                   │
│              LANDCERT SYSTEM                      │
│  (Land Certification Application and Record       │
│       Management with DSS Integration)            │
│                                                   │
└───────────────────────────────────────────────────┘
    │    ▲         │    ▲         │    ▲         │    ▲         │    ▲
    │    │         │    │         │    │         │    │         │    │
    ▼    │         ▼    │         ▼    │         ▼    │         ▼    │
    │    │         │    │         │    │         │    │         │    │
Application    Evaluation   Application   Notification  Storage     Application
Data           Requests     Requests      Messages      Requests    Data
Payment        DSS          Supporting                  Retrieval   User
Records        Assessment   Documents                   Queries     Records
Certificate    Data         Receipt                     Update      Document
Requests                    Images                      Commands    Files
    │            │          │             │             │           Audit
    │            │          │             │             │           Logs
    ▼            ▼          ▼             ▼             ▼           │
Digital      DSS Scores  Application    (Delivered   (Stored/       │
Certificates Decision    Status         to Users)    Retrieved)     │
Processing   Reports     Digital                                    │
Reports                  Certificates                               │
Evaluation               Notifications                              │
Results                                                             │
    │            │          │             │             │           │
    ▼            ▼          ▼             ▼             ▼           ▼
┌────────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────────┐ ┌────────────┐
│ CPDO STAFF │ │  CPDO    │ │ APPLICANTS  │ │  EMAIL/SMS   │ │  DATABASE  │
│  (Admin)   │ │EVALUATORS│ │  (Citizens) │ │   SERVICE    │ │(MySQL 8.x) │
└────────────┘ └──────────┘ └─────────────┘ └──────────────┘ └────────────┘
```

### Discussion

The context diagram illustrates the external entities that interact with the LandCert system and the data flows between them.

**System Administrator** provides login credentials, user management requests, and system configuration to the LandCert system. In return, the system provides user accounts, activity logs, status reports, and system analytics to the administrator.

**CPDO Staff (Admin)** sends application data, payment records, and certificate requests to the system. They receive digital certificates, processing reports, and evaluation results from the system to support their administrative functions.

**CPDO Evaluators** submit evaluation requests, DSS assessment data to the system. The system returns DSS scores and decision reports to assist evaluators in making consistent, criteria-based decisions on land certification applications.

**Applicants (Citizens)** input application requests, supporting documents, and receipt images into the system. They receive application status, digital certificates, and notifications about their application progress through the system.

**Email/SMS Service** receives notification messages from the system and delivers these communications to users, keeping them informed of application status changes, approvals, rejections, and certificate availability.

**Database (MySQL 8.x)** receives storage requests, retrieval queries, and update commands from the LandCert system. It provides application data, user records, document files, and audit logs, serving as the central data repository for all system information.

---
