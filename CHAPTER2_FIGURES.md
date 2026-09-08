# Chapter II — Figures: Sketches, Captions and Narratives

Everything needed for the figures section of Chapter II. Each figure carries three parts:

1. **Sketch** — ASCII layout you can hand to draw.io, an AI, or follow by hand
2. **Caption** — the line that sits beneath the figure in the manuscript
3. **Narrative** — the prose that goes into Chapter II, ready to paste into Word

**Shape conventions:** `( )` process circle · `[ ]` entity box · `[( )]` data store · `< >` decision · `(( ))` use case oval

> **Before you paste:** every caption below uses your **current approved title** — *"for Locational Clearance Services of CPDO City of Ilagan."* If your adviser approves the broadened title, find-and-replace that one phrase across all ten captions. Nothing else changes.

> **Figure 2-8 is new.** Your original Figures 2-8 and 2-9 are now 2-9 and 2-10.

---

## Figure 2-1. Conceptual Framework

### Sketch

```
┌────────────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────┐
│           INPUT            │   │          PROCESS          │   │          OUTPUT           │
├────────────────────────────┤   ├───────────────────────────┤   ├───────────────────────────┤
│ ┌────────────────────────┐ │   │  ┌─────────────────────┐  │   │ ┌───────────────────────┐ │
│ │ KNOWLEDGE              │ │   │  │ 1. Planning         │  │   │ │      LocClear         │ │
│ │ System development     │ │   │  └──────────┬──────────┘  │   │ │                       │ │
│ │ Database design        │ │   │             v             │   │ │ A Web-Based           │ │
│ │ CPDO policies and      │ │   │  ┌─────────────────────┐  │   │ │ Application           │ │
│ │ zoning procedures      │ │   │  │ 2. Requirements     │  │   │ │ Processing and        │ │
│ └────────────────────────┘ │   │  │    Gathering        │  │   │ │ Records Management    │ │
│ ┌────────────────────────┐ │   │  └──────────┬──────────┘  │   │ │ System for CPDO       │ │
│ │ SOFTWARE               │ │   │             v             │   │ │ City of Ilagan        │ │
│ │ Laravel 12 / PHP 8.2   │ │══>│  ┌─────────────────────┐  │══>│ └───────────────────────┘ │
│ │ React 18 + Inertia.js  │ │   │  │ 3. Analysis and     │  │   │ ┌───────────────────────┐ │
│ │ Tailwind CSS, Vite     │ │   │  │    Design           │  │   │ │ Digitalized records   │ │
│ │ MySQL, DomPDF          │ │   │  └──────────┬──────────┘  │   │ │ Automated workflows   │ │
│ │ XAMPP, VS Code, Git    │ │   │             v             │   │ │ Reduced manual work   │ │
│ │ Semaphore SMS          │ │   │  ┌─────────────────────┐  │   │ │ Real-time tracking    │ │
│ └────────────────────────┘ │   │  │ 4. Development      │  │   │ │ Improved transparency │ │
│ ┌────────────────────────┐ │   │  └──────────┬──────────┘  │   │ └───────────────────────┘ │
│ │ HARDWARE & SERVICES    │ │   │             v             │   │                           │
│ │ System unit, printer   │ │   │  ┌─────────────────────┐  │   │                           │
│ │ Stable internet        │ │   │  │ 5. Functionality    │  │   │                           │
│ │ Domain and hosting     │ │   │  │    Testing          │  │   │                           │
│ └────────────────────────┘ │   │  └──────────┬──────────┘  │   │                           │
│                            │   │             v             │   │                           │
│                            │   │  ┌─────────────────────┐  │   │                           │
│                            │   │  │ 6. ISO/IEC 25010:   │  │   │                           │
│                            │   │  │    2023 Evaluation  │  │   │                           │
│                            │   │  └─────────────────────┘  │   │                           │
└────────────────────────────┘   └───────────────────────────┘   └───────────────────────────┘
       ^                                                                        │
       │                       FEEDBACK  (dashed arrow)                         │
       └────────────────────────────────────────────────────────────────────────┘
```

### Caption

> **Figure 2-1.** Conceptual Framework of LocClear: A Web-Based Application Processing and Record Management System for Locational Clearance Services of CPDO City of Ilagan

### Narrative

The LocClear system was developed by first identifying the key requirements needed for its creation. Software tools such as a web browser, Visual Studio Code, XAMPP, Laravel 12 on PHP 8.2, React 18 with Inertia.js, Tailwind CSS, the Vite build tool, MySQL, Git for version control, the Windows 11 operating system, and MS Office provided the environment necessary for coding, interface development, and database management, while domain and hosting services supported system operation. Supporting libraries extended this environment further: DomPDF for the server-side generation of clearances, certificates, application forms and Orders of Payment; the Spatie permission package for role-based access control; the Spatie backup package for the automated daily database backup; Recharts for the visual analytics presented on the dashboards; and the Semaphore gateway for the delivery of SMS notifications.

This also included hardware such as a system unit, a printer, and a stable internet connection to support both the development and the day-to-day operation of the system. Knowledge in system development, database design, and an understanding of CPDO policies and land certification procedures ensured that the system aligned with actual administrative practices and legal standards.

The development followed a systematic process using an iterative development model, beginning with planning to define the project's scope, goals, and direction. Requirements were gathered to identify existing challenges in the processing of locational clearances and zoning certifications and to determine the features needed to improve the application and approval process. In the analysis and design phase, the system's architecture, database structure, workflows, and user interfaces were created. After development, the system underwent comprehensive functionality testing, in which each module was exercised against prepared test cases and the actual results were compared with the expected results, to ensure that it worked accurately and reliably. An evaluation using the ISO/IEC 25010:2023 software quality standard verified that the system met expectations in terms of functional suitability, performance efficiency, compatibility, interaction capability, reliability, security, maintainability, flexibility, and safety.

The output of this process was the LocClear system, a fully functional web-based platform that digitized traditional record-keeping and organized locational clearance and zoning certification information more effectively. Its implementation resulted in several benefits, including improved and digitalized records management, automated workflows, increased efficiency and productivity of CPDO staff through reduced manual work, and enhanced transparency and citizen satisfaction through real-time application tracking and convenient online access.

A feedback loop connects the output back to the input, allowing insights from system performance and user feedback to guide improvements in system requirements and development. This ensures that the LocClear system can be continuously refined and enhanced to meet the evolving needs of the CPDO.

> ⚠ **Step 5 reads *Functionality Testing*, not unit testing.** Your original draft said unit testing, which contradicts Chapter I and your actual method — there is no automated test suite in the project.

---

## Figure 2-2. Research Paradigm

### Sketch

```
        ┌──────────────────────────────────────────────────────────────────┐
        │                    PROBLEM IDENTIFICATION                        │
        │  Processing delays  •  Repetitive data entry                     │
        │  Multiple client visits  •  Payment verification issues          │
        │  Inconsistent evaluations  •  Limited transparency               │
        │  Difficulty in record retrieval                                  │
        └────────────────────────────────┬─────────────────────────────────┘
                                         v
        ┌──────────────────────────────────────────────────────────────────┐
        │                      SYSTEM DEVELOPMENT                          │  <──┐
        │  User authentication  •  Online application submission           │     │
        │  Digital document management  •  Evaluation workflow             │     │
        │  Payment processing  •  Certificate generation                   │     │
        │  Notification system  •  Analytics dashboard  •  Audit trail     │     │
        └────────────────────────────────┬─────────────────────────────────┘     │
                                         v                                       │
        ┌──────────────────────────────────────────────────────────────────┐     │
        │                     FUNCTIONALITY TESTING                        │     │
        │  Test cases per module, executed under all three user roles      │     │
        │  and across both categories of service. Expected result          │     │
        │  compared with actual; defects corrected and retested.           │     │
        └────────────────────────────────┬─────────────────────────────────┘     │
                                         v                                       │
        ┌──────────────────────────────────────────────────────────────────┐     │
        │                 ISO/IEC 25010:2023 EVALUATION                    │     │
        │  Functional Suitability  •  Performance Efficiency               │     │
        │  Compatibility  •  Interaction Capability  •  Reliability        │     │
        │  Security  •  Maintainability  •  Flexibility  •  Safety         │     │
        └────────────────────────────────┬─────────────────────────────────┘     │
                                         v                                       │
        ┌──────────────────────────────────────────────────────────────────┐     │
        │                            OUTCOMES                              │─────┘
        │  Reduced processing time  •  Enhanced transparency               │
        │  Increased staff productivity  •  Better citizen satisfaction    │  (dashed:
        │  Comprehensive digital records management                        │  feedback)
        └──────────────────────────────────────────────────────────────────┘
```

### Caption

> **Figure 2-2.** Research Paradigm of LocClear: A Web-Based Application Processing and Record Management System for Locational Clearance Services of CPDO City of Ilagan

### Narrative

The research paradigm illustrates the systematic approach followed in developing and evaluating the LocClear system. The process began with problem identification through an assessment of the current manual processes at the CPDO, revealing specific challenges including processing delays, repetitive data entry, multiple client visits, payment verification issues, inconsistent evaluations, limited transparency, and difficulty in record retrieval. These identified problems guided the system development phase, where LocClear was designed with specific features to address each challenge: user authentication for security, online application submission for convenience, digital document management for better organization, a notification system for real-time updates, an analytics dashboard for monitoring, and audit trail logging for accountability.

Following development, the system underwent functionality testing to verify the operation of its individual modules and ensure that each component performed according to its specification. Test cases were prepared for every module, executed under each of the three user roles and across both categories of service, and documented by comparing the expected result with the actual result; defects identified in the course of testing were corrected and the affected function retested. The tested system was then evaluated using the ISO/IEC 25010:2023 Software Quality Standard, assessing its nine quality characteristics: functional suitability, performance efficiency, compatibility, interaction capability, reliability, security, maintainability, flexibility, and safety.

The expected outcomes include reduced processing time, enhanced transparency through real-time tracking, increased staff productivity by reducing manual work, better citizen satisfaction through convenient access, and comprehensive digital records management. This paradigm demonstrates a structured research approach that connects problem identification to solution development, testing, evaluation, and measurable outcomes.

> ⚠ **Nine ISO characteristics, not eight.** The 2023 revision renamed Usability → Interaction Capability and Portability → Flexibility, and added Safety.
>
> ⚠ **The 50% processing-time target was removed.** A numeric target commits you to a documented manual baseline and a comparable post-implementation measurement. If you have both, restore it and cite them.

---

## Figure 2-3. Three-Tier Architecture

### Sketch

```
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │  USERS                                                                      │
   │   (  Applicant  )      (  Zoning Officer  )     (  Zoning Administrator  )  │
   └──────────────────────────────────┬──────────────────────────────────────────┘
                                      v
   ┌═════════════════════════════════════════════════════════════════════════════┐
   ║  PRESENTATION LAYER — Client Side          React 18 + Inertia.js            ║
   ║  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ ┌────────────────┐  ║
   ║  │ Application  │ │ Dashboards   │ │ Records,         │ │ Notifications  │  ║
   ║  │ Forms and    │ │ and          │ │ Documents and    │ │ Panel          │  ║
   ║  │ Wizard       │ │ Analytics    │ │ Reports          │ │                │  ║
   ║  └──────────────┘ └──────────────┘ └──────────────────┘ └────────────────┘  ║
   └═════════════════════════════════════════════════════════════════════════════┘
                                     ^  v      (double-headed arrow)
   ┌═════════════════════════════════════════════════════════════════════════════┐
   ║  APPLICATION LAYER — Server Side           Laravel 12 / PHP 8.2             ║
   ║  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ ┌────────────────┐  ║      ┌──────────────┐
   ║  │ Controllers  │ │ Validation   │ │ Services:        │ │ PDF Generation │  ║ ───> │  EXTERNAL    │
   ║  │ Request      │ │ and Role     │ │ Payment,         │ │ DomPDF         │  ║      │  SERVICES    │
   ║  │ handling     │ │ Middleware   │ │ Certificate,     │ │                │  ║      │              │
   ║  │              │ │              │ │ Notification,    │ │                │  ║      │ Semaphore    │
   ║  │              │ │              │ │ Reminder, Audit  │ │                │  ║      │ SMS Gateway  │
   ║  └──────────────┘ └──────────────┘ └──────────────────┘ └────────────────┘  ║      │ Mail Service │
   └═════════════════════════════════════════════════════════════════════════════┘      └──────────────┘
                                     ^  v      (double-headed arrow)
   ┌═════════════════════════════════════════════════════════════════════════════┐
   ║  DATABASE LAYER                            MySQL                            ║
   ║   ⌈‾‾‾‾‾‾‾‾‾‾⌉   ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾⌉   ⌈‾‾‾‾‾‾‾‾‾‾‾‾⌉   ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉        ║
   ║   │  Users   │   │  Requests,  │   │ Documents, │   │ Notifications│        ║
   ║   │  and     │   │  Projects,  │   │ Payments,  │   │ Audit Logs,  │        ║
   ║   │  Roles   │   │  Properties │   │ Certificates│  │ Timeline     │        ║
   ║   ⌊__________⌋   ⌊_____________⌋   ⌊____________⌋   ⌊______________⌋        ║
   └═════════════════════════════════════════════════════════════════════════════┘
```

### Caption

> **Figure 2-3.** Three-Tier Architecture of LocClear: A Web-Based Application Processing and Record Management System for Locational Clearance Services of CPDO City of Ilagan

### Narrative

The system architecture of LocClear illustrates how Applicants, Zoning Officers, and the Zoning Administrator interact within a three-tier architecture to manage applications and related records. The system is web-based and can be accessed through computers, tablets, or smartphones with a stable internet connection. Access to the system is restricted to authorized users through role-based authentication to ensure security, confidentiality, and the proper management of information.

Applicants serve as the primary users of the system. They are responsible for creating accounts, submitting applications for a locational clearance in any of its three forms — the Certificate of Zoning Compliance (CZC), the Special Use Permit (SUP), and the Temporary Use Permit (TUP) — or for a Zoning Certification (ZC), and uploading the required supporting documents. Through the system, applicants can monitor the status of their applications and receive notifications regarding updates in the processing of their requests.

The Presentation Layer, also known as the client-side or front-end layer, provides the user interface through which applicants, Zoning Officers, and the Zoning Administrator interact with the system. It displays forms, dashboards, application records, notifications, and reports while ensuring a user-friendly experience for all users. In LocClear this layer is implemented in React and delivered through Inertia.js, which allows the interface to behave as a single-page application while the routing and authorization remain under the control of the server.

The Application Layer, also known as the server-side or back-end layer, handles the core business processes and system functionalities. It processes user requests, validates submitted information, manages workflows, enforces security rules, and facilitates communication between the presentation layer and the database layer. This layer also supports application monitoring, document management, and reporting functions. It is implemented in the Laravel framework, where controllers receive the request, form request classes validate the submitted data, service classes carry the business rules for notifications, payments, certificates, reminders and the audit trail, and middleware enforces role-based access before a controller is reached.

Zoning Officers are responsible for reviewing submitted applications, verifying documentary requirements against the checklist belonging to the service applied for, evaluating requests based on established criteria, preparing the Order of Payment, generating reports, and maintaining records. They can update application information and monitor the progress of transactions throughout the processing stage. After applicants settle the required fees over the counter, outside the system, the uploaded proof of payment is verified within the system before the processing and release of certificates proceeds.

The Zoning Administrator serves as the highest-level user of the system. This role is responsible for rendering the final decision on evaluated applications, verifying payments, managing user accounts, monitoring system activities, maintaining system configurations, and overseeing overall system operations. The Zoning Administrator also supervises application processing activities and ensures compliance with established policies and procedures.

The Database Layer functions as the central repository of the system. It stores user information, application records, uploaded documents, notifications, audit logs, reports, and other system-related data. This layer ensures secure storage, efficient retrieval, and the proper management of information to support daily operations within the City Planning and Development Office. It is implemented in MySQL, organized into normalized tables so that applicant, corporation, representative, project, property and location details are each held once and referenced by the application that requires them.

Two provisions protect the contents of this layer. Records in the principal tables are removed by soft deletion, meaning that a deleted row is marked with a deletion timestamp and withdrawn from ordinary queries rather than erased, so that a record removed in error remains recoverable and the history of a transaction is not lost. The database is additionally backed up in full on an automated daily schedule.

The system architecture follows a three-tier design consisting of the Presentation Layer, the Application Layer, and the Database Layer. This architecture promotes maintainability, scalability, security, and efficient system performance by separating user interface functions, business logic, and data management processes. Through this structure, the LocClear system provides a centralized platform for managing applications, monitoring transactions, organizing records, and supporting efficient service delivery within the City Planning and Development Office of Ilagan City.

---

## Figure 2-4. Context Diagram (Level 0 DFD)

### Sketch

One circle. Five external entities. **No data stores** — those appear only from Level 1 onward.

```
                        ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
                        │    CITY TREASURY      │   Dashed border.
                        │        OFFICE         │   Connects only to the
                        └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   Applicant, never to
                              ^           │          the system circle.
                   Payment    │           │  Official
                   over the   │           │  receipt
                   counter    │           v
   ┌───────────────────┐        ┌───────────────────┐
   │  ZONING OFFICER   │        │     APPLICANT     │
   └─────────┬─────────┘        └─────────┬─────────┘
             │   ^                        │   ^
             │   │                        │   │
             v   │                        v   │
      ╭──────────────────────────────────────────────────╮
      │                        0                         │
      │                 L o c C l e a r                  │
      │        Zoning Services Processing and            │
      │           Records Management System              │
      ╰──────────────────────────────────────────────────╯
             ^   │                        ^   │
             │   │                        │   │
             │   v                        │   v
   ┌─────────┴─────────┐        ┌─────────┴─────────┐
   │      ZONING       │        │  EMAIL AND SMS    │
   │   ADMINISTRATOR   │        │     SERVICES      │
   └───────────────────┘        └───────────────────┘
```

**Labelled data flows** — every arrow above carries one of these:

| From | To | Data flow |
|---|---|---|
| Applicant | System | Registration details, application data, documentary requirements, proof of payment |
| System | Applicant | Application status, Order of Payment, notifications, issued documents |
| Zoning Officer | System | Login credentials, requirement verification, evaluation report, assessed fee |
| System | Zoning Officer | Application records, uploaded documents, processing reports, work queue |
| Zoning Administrator | System | Login credentials, approval decision, **payment verification**, user account settings |
| System | Zoning Administrator | Applications for decision, audit trail, analytics and management reports |
| System | Email and SMS Services | Notification requests |
| Email and SMS Services | System | Delivery status |
| Applicant | City Treasury Office | Payment over the counter *(outside the system)* |
| City Treasury Office | Applicant | Official receipt *(outside the system)* |

### Caption

> **Figure 2-4.** Context Diagram of LocClear: A Web-Based Application Processing and Record Management System for Locational Clearance Services of CPDO City of Ilagan

### Narrative

The context diagram illustrates the interaction between the LocClear system and its external entities, namely the Applicants, the Zoning Officers, the Zoning Administrator, the Email and SMS services, and the City Treasury Office. It presents the overall flow of information entering and leaving the system and demonstrates how the system supports the locational clearance and zoning certification processes of the City Planning and Development Office (CPDO) of Ilagan City.

At the applicant level, citizens and business owners interact with the system by creating accounts, submitting application forms, and uploading the required supporting documents for a Certificate of Zoning Compliance (CZC), a Special Use Permit (SUP), a Temporary Use Permit (TUP), or a Zoning Certification (ZC). The system receives and validates the submitted information before storing it in the database for processing. Throughout the application process, applicants receive application status information and notification messages that keep them informed about the progress of their requests. This enables applicants to monitor their transactions without frequently visiting the office and provides greater transparency in the certification process.

Zoning Officers serve as the primary users responsible for processing and managing applications. Through the system, they access application records submitted by applicants, review documentary requirements, perform evaluations, update application information, and monitor transaction progress. The system provides evaluation data, application records, processing reports, and application status information that assist staff in performing their duties efficiently. The centralized platform reduces manual record keeping, improves information retrieval, and supports the timely processing of applications.

The Zoning Administrator functions as the highest-level user responsible for managing and maintaining the system. Through the use of login credentials, user account information, and system configuration settings, the administrator oversees user access, system operations, and security controls. The Zoning Administrator is also the officer who verifies payments recorded in the system. The system generates audit trail reports, security notifications, and system reports that enable the administrator to monitor activities, identify issues, and ensure that all transactions are properly recorded and managed in accordance with organizational policies and procedures.

The system also interacts with two external notification services. Electronic mail is delivered through a configured mail service, while SMS messages are transmitted through the Semaphore gateway. Notification requests generated by the system are passed to the appropriate service, and the delivery outcome returned by that service is recorded by the system. Because both services lie outside the system boundary, the successful delivery of a message depends on conditions the system does not control — the availability of the gateway, the service credits held with the provider, network coverage, and the accuracy of the contact details supplied by the applicant.

The City Treasury Office appears in the diagram as an entity of a different kind, drawn with a broken border and connected only to the Applicant. It takes part in the transaction as it is actually conducted, since the fees assessed on an application are settled at its counter, but it exchanges no information with the system: no assessment is transmitted to it, and no confirmation is returned by it. The applicant carries the Order of Payment to the Treasury, pays, receives an official receipt, and uploads an image of that receipt to the system, whereupon the Zoning Administrator — not the Treasury — examines it and records the payment as verified or rejected. The Treasury is therefore shown as context rather than as a data-exchanging entity, and the broken border is what marks that distinction. Representing it in this way makes explicit at the level of the diagram what the scope and limitations of the study state in words: that the settlement of fees lies outside the system boundary, and that the system's role in payment is confined to assessing it, receiving evidence of it, and recording its verification.

The LocClear system serves as the central processing component that manages all application-related transactions and coordinates communication among the external entities. It validates submitted information, processes requests, records transactions, manages user activities, and generates the reports needed for operational monitoring and decision-making. Through these interactions, the system provides a centralized and organized platform that supports efficient management of locational clearances and zoning certifications, improves transparency, enhances accountability, and facilitates better service delivery within the City Planning and Development Office of Ilagan City.

> ⚠ **Treasury connects to the Applicant only — never to the system circle.** Drawing a line from Treasury to the circle claims a data exchange that does not exist. A strict panelist may argue Treasury does not belong in a context diagram at all; the dashed border is your answer, marking it as context rather than a data-exchanging entity.

---

## Figure 2-5. Data Flow Diagram — Applicant

### Sketch

```
  ┌──────────────┐
  │  APPLICANT   │
  └──────┬───────┘
         │  Name, email, password, contact number, address
         v
      ╭──────────────╮   New user record    ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      │     1.0      │────────────────────> │ D1   Users    │
      │  Register    │                      ⌊_______________⌋
      │  Account     │                            ^     │
      ╰──────┬───────╯                            │     │ Stored
             v                                    │     │ credentials
      ╭──────────────╮   Verification confirmed   │     │
      │     1.1      │────────────────────────────┘     │
      │ Verify Email │                                  │
      │ Address      │                                  │
      ╰──────┬───────╯                                  │
             v                                          │
      ╭──────────────╮ <────────────────────────────────┘
      │     1.2      │ <──── Credentials ──── [ APPLICANT ]
      │ Authenticate │
      │ and Log In   │
      ╰──────┬───────╯
             │  Active session
             v
      ╭──────────────╮ <──── Applicant details, project and land use
      │     1.3      │       data, uploaded documents ──── [ APPLICANT ]
      │ Select       │
      │ Service and  │
      │ Submit       │
      ╰──────┬───────╯
             v
      ╭──────────────╮   Request, application number, status pending
      │     1.4      │──────────────────────────> ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      │ Validate and │                            │ D2   Requests       │
      │ Store        │                            ⌊_____________________⌋
      │ Request      │   Uploaded files by requirement
      │              │──────────────────────────> ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      │              │                            │ D7   Requirement    │
      │              │                            │      Documents      │
      │              │                            ⌊_____________________⌋
      │              │   Initial status entry
      │              │──────────────────────────> ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      │              │                            │ D3   Status History │
      │              │                            │      / Timeline     │
      │              │                            ⌊_____________________⌋
      │              │   Action record
      │              │──────────────────────────> ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      ╰──────┬───────╯                            │ D9   Audit Logs     │
             v                                    ⌊_____________________⌋
      ╭──────────────╮   Notification record
      │     1.5      │──────────────────────────> ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      │ Dispatch     │                            │ D6   Notifications  │
      │ Notifications│                            ⌊_____________________⌋
      ╰──────┬───────╯
             │  Email and SMS confirmation
             v
      ┌──────────────┐
      │  APPLICANT   │
      └──────────────┘
```

### Caption

> **Figure 2-5.** Data Flow Diagram of LocClear — Applicant User

### Narrative

Applicants can register and submit applications after accessing the LocClear system and being confirmed in the applicant role in the users table. The applicant enters the name, email address, password, contact number, and address required for registration, and this information is stored in the users table. Following registration, an email verification link is sent to confirm ownership of the account. Once verified, the applicant can log in using those credentials, which are validated against the users table to create a user session.

After successful login, the applicant selects the service applied for and proceeds to the submission page, entering the applicant information and, where the service requires it, the project details, location data and land measurements, and uploading the supporting documents. An application for a Zoning Certification omits the project and land-use steps, which do not apply to it. Following submission, the system validates the entered data and stores it in the requests table with a unique application number and a status of pending, while the uploaded documents are recorded in the requirement documents table against the requirement each satisfies. A corresponding entry is created in the status history and request timeline tables to document the initial state. Notifications are sent by electronic mail and SMS to confirm the submission, and every action performed by the applicant is written to the audit log.

The decision number is assigned later and separately, when a decision has been rendered on the application; it is the reference that appears on the clearance or certification subsequently issued. The two identifiers are distinct: the application number accompanies the request from the moment of submission, while the decision number exists only once the application has been decided.

> ⚠ **The control number no longer exists.** Migration `2026_08_26_000001` replaced it with `application_number` and `decision_number`, and they are assigned at different stages.

---

## Figure 2-6. Data Flow Diagram — Zoning Officer

### Sketch

```
  ┌───────────────────┐
  │  ZONING OFFICER   │
  └────────┬──────────┘
           │ Login credentials
           v
      ╭──────────────╮  Login activity    ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      │     1.0      │──────────────────> │ D1   Users    │
      │ Authenticate │ <────────────────── ⌊_______________⌋
      │ User         │   User profile
      ╰──────┬───────╯
             │ Active session
             v
      ╭──────────────╮ <─── Pending, ongoing and completed
      │     1.2      │      applications ─── ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      │ View         │                       │ D2   Requests    │
      │ Applications │                       ⌊__________________⌋
      │ Dashboard    │                             │       ^
      ╰──────┬───────╯                             │       │
             v                                     │       │ Requirement
      ╭──────────────╮                             │       │ verification
      │     1.3      │                             │       │
      │ Select       │                             │       │
      │ Application  │                             │       │
      ╰──────┬───────╯                             │       │
             │ Selected application                │       │
             v                                     │       │
      ╭──────────────╮ <───────────────────────────┘       │
      │     1.4      │   Complete application record       │
      │ Review       │                                     │
      │ Application  │ <─── Uploaded documents ─── ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      │ and Verify   │                             │ D7   Requirement    │
      │ Documents    │─────────────────────────────│      Documents      │
      ╰──────┬───────╯                             ⌊_____________________⌋
             v
      ╭──────────────╮ <─── Assessment and assessed fee ─── [ ZONING OFFICER ]
      │     1.5      │
      │ Create or    │  Evaluation report and assessed fee
      │ Update       │────────────────────────────> ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      │ Evaluation   │                              │ D4   Reports     │
      │ Report       │                              ⌊__________________⌋
      │              │  Updated status: reviewed
      │              │────────────────────────────> [ D2  Requests ]
      ╰──────┬───────╯
             v
      ╭──────────────╮  Notification record
      │     1.6      │────────────────────────────> ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      │ Generate     │                              │ D6   Notifications  │
      │ Notification │                              ⌊_____________________⌋
      ╰──────┬───────╯
             │ Status update and Order of Payment
             v
      ┌──────────────┐
      │  APPLICANT   │
      └──────────────┘
```

### Caption

> **Figure 2-6.** Data Flow Diagram of LocClear — Zoning Officer

### Narrative

Figure 2-6 presents the Level 1 Data Flow Diagram of the application evaluation process of the LocClear system. The figure illustrates the detailed flow of data from authentication up to the generation of notifications following the evaluation of applications. It also shows the interaction between the system processes and the data stores used in managing user accounts, application records, evaluation reports, and notifications.

The process begins with Process 1.0 (Authenticate User), where the Zoning Officer submits login credentials for authentication. The system validates the credentials against the Users (D1) data store by retrieving the corresponding user profile and recording the login activity. Once authenticated, an active user session is established, allowing access to the system.

After successful authentication, the user proceeds to Process 1.2 (View Applications Dashboard). This process retrieves application information from the Requests (D2) data store, allowing the user to view pending, ongoing, and completed application records. The retrieved data serves as the basis for selecting a specific application for evaluation.

In Process 1.3 (Select Application), the evaluator chooses a specific application from the available records. The selected application is then forwarded to Process 1.4 (Review Application Details), where detailed information regarding the request is examined. This process retrieves the complete application record from the Requests (D2) data store, together with the uploaded documents from the Requirement Documents (D7) data store, and validates the submitted information before the evaluation stage. Each requirement is marked as verified individually against the checklist belonging to the service applied for.

Once the application has been reviewed, Process 1.5 (Create or Update Evaluation Report) generates or updates the evaluation report based on the officer's assessment. The generated report is stored in the Reports (D4) data store for documentation and future reference, and the assessed fee recorded there becomes the basis of the Order of Payment issued to the applicant. Simultaneously, the application status is updated in the Requests (D2) data store. The updated status is then prepared for notification to the applicant.

The final stage is Process 1.6 (Generate Notification), where notification records are created using the updated application information. The notification details are stored in the Notifications (D6) data store and dispatched to the applicant by electronic mail and SMS, informing them of the application status and other relevant updates. This process ensures timely communication between the City Planning and Development Office and applicants throughout the evaluation process.

Overall, Figure 2-6 demonstrates how the LocClear system integrates authentication, application review, evaluation, report generation, and notification management into a structured workflow. The interaction among the various processes and data stores ensures efficient information handling, supports accurate application processing, and improves communication between the office and applicants.

> ⚠ **The numbering skips 1.1** — it runs 1.0, 1.2, 1.3, 1.4, 1.5, 1.6. Preserved so the figure matches your text. If your adviser queries it, renumber the figure *and* the narrative together.

---

## Figure 2-7. Data Flow Diagram — Zoning Administrator

### Sketch

```
  ┌────────────────────────┐
  │  ZONING ADMINISTRATOR  │
  └───────────┬────────────┘
              v
      ╭────────────────────╮ <── Reviewed applications ── ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
      │        1.1         │                              │ D2   Requests    │
      │ View Applications  │                              ⌊__________________⌋
      │ Awaiting Final     │                                     │      ^
      │ Approval           │                                     │      │
      ╰──────────┬─────────╯                                     │      │
                 │ Application details                           │      │
                 v                                               │      │
      ╭────────────────────╮ <──────────────────────────────────-┘      │
      │        1.2         │   Application record                       │
      │ Perform Review     │                                            │
      │                    │ <── Officer evaluation ── ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉│
      │                    │     report                │ D4   Reports  ││
      ╰──────────┬─────────╯                           ⌊_______________⌋│
                 v                                            ^         │
      ╭────────────────────╮                                  │         │
      │        1.3         │                                  │         │
      │ Make Final         │                                  │         │
      │ Decision           │                                  │         │
      ╰──────────┬─────────╯                                  │         │
                 v                                            │         │
           ◇─────────────────◇                                │         │
          ╱  Requirements     ╲                               │         │
         ◇    satisfied?       ◇                              │         │
          ╲                   ╱                               │         │
           ◇────┬────────┬───◇                                │         │
            YES │        │ NO — reason recorded               │         │
                v        v                                    │         │
      ╭────────────────────╮   Status approved with decision   │        │
      │        1.4         │   number, or status rejected      │        │
      │ Record Decision    │───────────────────────────────────┼────────┘
      │ and Notify         │   Decision record                 │
      │                    │───────────────────────────────────┘
      │                    │   Timeline entry
      │                    │──────────────> [ D3  Request Timeline ]
      │                    │   Notification record
      │                    │──────────────> [ D6  Notifications ]
      ╰──────────┬─────────╯
                 │ Decision notice
                 v
          ┌──────────────┐
          │  APPLICANT   │
          └──────────────┘
```

### Caption

> **Figure 2-7.** Data Flow Diagram of LocClear — Zoning Administrator

### Narrative

Figure 2-7 presents the Level 1 Data Flow Diagram of the final approval process of the LocClear system. The figure illustrates how the Zoning Administrator reviews evaluated applications and makes the final approval or rejection decision.

The process begins with Process 1.1 (View Applications Awaiting Final Approval). In this stage, the Zoning Administrator accesses the list of applications that have already undergone evaluation by the Zoning Officer. The process retrieves reviewed application records and the relevant application details from the Requests (D2) data store. These records contain the information necessary for final assessment and decision-making.

The retrieved application information is then forwarded to Process 1.2 (Perform Review). During this stage, the Zoning Administrator examines the application details, the supporting documents, and the evaluation results prepared by the Zoning Officer. The process retrieves the necessary application data from the Requests (D2) data store to ensure that all submitted information has been properly reviewed before a final decision is made. This stage serves as the final verification of the application.

After reviewing all relevant information, the process proceeds to Process 1.3 (Make Final Decision). At this stage, the Zoning Administrator determines whether the application satisfies the requirements and evaluation criteria established by the City Planning and Development Office. The decision process results in either an approval or a rejection.

If the application meets all requirements, the system updates the application status as approved and assigns the decision number that will appear on the document subsequently issued. If deficiencies or non-compliance are identified, the system updates the status as rejected and records the reason given. In either case the decision is written to the Requests (D2) data store, the corresponding decision information is stored in the Reports (D4) data store for administrative reporting, an entry is added to the request timeline, and a notification is dispatched to the applicant.

Overall, Figure 2-7 demonstrates the final decision-making workflow within the LocClear system. The process ensures that all applications undergo proper review, validation, and assessment before a decision is issued. By integrating evaluation reports and administrative review, the system promotes consistency, accountability, and transparency in the approval process.

> ⚠ **Strict DFD notation has no decision diamond** — branching is two labelled arrows from one process. The diamond reads more clearly and most panels accept it. Drop it if your adviser is strict.

---

## Figure 2-8. Data Flow Diagram — Payment and Certificate Release — **NEW**

### Sketch

```
                              ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
                              │ D4   Reports  │
                              ⌊_______┬_______⌋
                                      │ Assessed fee
                                      v
                            ╭────────────────────╮
                            │        1.1         │
                            │ Generate Order     │
                            │ of Payment         │
                            ╰──────────┬─────────╯
                                       │ Order of Payment
                                       v
  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐            ┌──────────────┐
  │  CITY TREASURY  │ <───────── │  APPLICANT   │   Payment over the counter
  │                 │            │              │
  │  Outside system │ ─────────> │              │   Official receipt
  │  boundary       │            └──────┬───────┘
  └ ─ ─ ─ ─ ─ ─ ─ ─ ┘                   │ Receipt image, number and date
       (dashed box)                     v
                            ╭────────────────────╮ <── Existing records:
                            │        1.2         │     duplicate check
                            │ Submit Proof       │     ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉
                            │ of Payment         │────>│ D5   Payments  │
                            ╰──────────┬─────────╯     ⌊________________⌋
                                  ^    │ Payment, status pending    ^
                                  │    v                            │
                                  │ ╭────────────────────╮          │
                                  │ │        1.3         │  Status verified,
                                  │ │ Verify Payment     │──verifying user
                                  │ │                    │  and time
                                  │ ╰──────────┬─────────╯
                                  │            │  <── Verification decision
                                  │            v      ── [ ZONING ADMINISTRATOR ]
                                  │      ◇──────────────◇
                                  │     ╱   Receipt      ╲
                                  │    ◇    accepted?     ◇
                                  │     ╲                ╱
                                  │      ◇──┬────────┬──◇
                                  └─────────┘        │ YES
                                    NO — reason      v
                                    recorded   ╭────────────────────╮
                                               │        1.4         │
                                               │ Generate Document  │
                                               ╰──────────┬─────────╯
                       PDF with decision number,          │
                       certificate number, validity,      │  Ready for release
                       digital signatures                 │──────> [ APPLICANT ]
                                  ⌈‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⌉ <───┤
                                  │ D8 Certificates │     v
                                  ⌊_________________⌋ ╭────────────────────╮
                                            ^         │        1.5         │
       Claimant name, ID type and number,   │         │ Record Release     │
       signature, status released ──────────┘         ╰──────────┬─────────╯
                                                           ^     │ Timeline entries
                            Valid identification ──────────┘     v
                            and signature                 [ D3  Request Timeline ]
                            [ APPLICANT ]
```

### Caption

> **Figure 2-8.** Data Flow Diagram of LocClear — Payment and Certificate Release

### Narrative

Figure 2-8 presents the Level 1 Data Flow Diagram of the payment and certificate release process of the LocClear system. The figure illustrates the stage that follows the approval decision, in which the fee assessed on an application is settled, the payment verified, and the resulting document generated and released to the applicant.

The process begins with Process 1.1 (Generate Order of Payment), in which the fee assessed during evaluation and held in the Reports (D4) data store is rendered as an Order of Payment addressed to the applicant, and the applicant is notified that it is ready. The applicant settles the amount over the counter at the City Treasury Office, outside the system, and receives an official receipt.

In Process 1.2 (Submit Proof of Payment), the applicant uploads an image of that receipt together with its number and date. The system checks the submission against existing records in the Payments (D5) data store to guard against the same receipt being recorded twice, and stores it with a payment status of pending.

Process 1.3 (Verify Payment) presents the uploaded receipt to the Zoning Administrator, who either accepts it, setting the payment status to verified and recording the verifying user and the time of verification, or rejects it, recording the reason. A rejected payment returns the applicant to Process 1.2. A verified payment is the precondition of the stage that follows.

Process 1.4 (Generate Document) produces the clearance or certification as a PDF bearing the decision number, the certificate number, the validity period, and the digital signatures of the authorized signatories, and records it in the Certificates (D8) data store with a status of preparing. When the document has been printed and signed, it is marked ready for release and the applicant is notified.

Process 1.5 (Record Release) completes the transaction. The claimant presents a valid identification document at the office, and the officer records the name of the person receiving the document, the type and number of the identification presented, and the claimant's signature, whereupon the certificate status becomes released. Every step in this sequence is written to the request timeline and the audit log, so that the interval between assessment, payment, issuance and release can be measured for any application.

Overall, Figure 2-8 demonstrates that the system's involvement in payment is confined to assessing the fee, receiving evidence that it was paid, and recording the verification of that evidence. The settlement itself occurs at the City Treasury Office, which is shown outside the system boundary, and the release of the physical document remains a personal transaction at the office. By recording the claimant's identification and signature at the point of release, the system preserves in digital form the evidence that the manual logbook was kept to provide.

> ⚠ **Two details this diagram must show.** The **dashed Treasury box** proves payment happens outside the system — it answers "does your system accept payments?" before it is asked. The **NO branch looping back to 1.2** shows a rejected receipt returns the applicant to resubmission. A workflow diagram without its failure path is incomplete.

---

## Figure 2-9. Use Case Diagram

### Sketch

```
                    ┌────────────────────────────────────────────────┐
                    │                                                │
                    │                                                │
     O              │   (( Create Account and Log In ))              │            O
    /|\ ────────────┼──────────────^        ^        ^               │           /|\
    / \             │   (( Submit Application CZC / SUP / TUP / ZC ))│           / \
  APPLICANT         │              ^                                 │      ZONING OFFICER
     ├──────────────┼──────────────┘                                 │           │
     ├──────────────┼── (( Upload Documentary Requirements ))        │           │
     ├──────────────┼── (( Track Application Status ))               │           │
     ├──────────────┼── (( Upload Proof of Payment ))                │           │
     └──────────────┼── (( Download Issued Document ))               │           │
                    │                                                │           │
                    │   (( Review Applications and Verify Docs ))────┼───────────┤
                    │   (( Prepare Evaluation Report ))──────────────┼───────────┤
                    │   (( Generate Order of Payment ))──────────────┼───────────┤
                    │   (( Generate Reports and Analytics ))─────────┼───────────┘
                    │   (( Verify Payment )) ────────────────────────┼───────────┤ 
                    │   ((  Generate Clearance or Certification))──────────┼─────|
                    │   (( Record Certificate Release ))───────────-─┼───────────┤
                    │                                                                         O
                    │  (( Approve or Reject Application ))     ───┼───────────┤              /|\
                    │   (( Manage User Accounts and Permissions ))──┼───────────┤            / \
                    │   (( Review Audit Trail ))───────────────────┼───────────┘             ZONING ADMINISTRATOR
                    └────────────────────────────────────────────────┘
```

**Use cases by actor**

| Applicant | Zoning Officer | Zoning Administrator |
|---|---|---|
| Create Account and Log In | Create Account and Log In | Create Account and Log In |
| Submit Application (CZC / SUP / TUP / ZC) | Review Applications and Verify Documents | Approve or Reject Application |
| Upload Documentary Requirements | Prepare Evaluation Report | Verify Payment |
| Track Application Status | Generate Order of Payment | Generate Clearance or Certification |
| Upload Proof of Payment | Generate Reports and Analytics | Record Certificate Release |
| Download Issued Document | | Manage User Accounts and Permissions |
| | | Review Audit Trail |

### Caption

> **Figure 2-9.** Use Case Diagram of LocClear

### Narrative

The use case diagram illustrates the functional requirements and the interactions between three primary actors and the LocClear system: the Applicant, the Zoning Officer, and the Zoning Administrator. Each actor has distinct roles and responsibilities within the workflow.

The Applicant represents individuals or organizations requesting the services of the office. Applicants can create an account, log in to the system, submit an application for a Certificate of Zoning Compliance, a Special Use Permit, a Temporary Use Permit, or a Zoning Certification, upload the required supporting documents, upload proof of payment, monitor the real-time status of their application, and download or print the document issued to them.

The Zoning Officer represents authorized CPDO personnel responsible for processing and evaluating applications. Officers log in to access the system, review submitted applications and documents, verify each documentary requirement, prepare evaluation reports, generate Orders of Payment indicating the applicable fees, and produce reports such as application summaries and workflow statistics to support operational monitoring and decision-making.

The Zoning Administrator represents the senior official with the highest level of system authority. The Administrator logs in to access advanced administrative controls, approves or rejects evaluated applications, verifies payment transactions, generates the official clearance or certification bearing its decision number and certificate number, records the release of the physical document, reviews the audit trail, and manages user accounts by assigning roles and permissions and ensuring system security.

The diagram highlights a clear workflow from application submission through evaluation, decision, payment and issuance to release, ensuring proper role separation, accountability, and efficient processing.

> ⚠ **Proper UML:** actors are stick figures, use cases are ovals, and the system boundary rectangle encloses the ovals but **not** the actors. Draw this one in draw.io — it has a UML shape library, and this figure is past what an image model renders legibly.

---

## Figure 2-10. Entity Relationship Diagram

### Sketch

Crow's foot notation. `1` = one · `∞` = many · `0..1` = optional one

The diagram is drawn in three tiers so that no relationship line crosses another.
`REQUESTS` appears at the foot of Tier 1 and at the head of Tiers 2 and 3; it is
one entity shown three times for legibility, not three entities.

**Tier 1 — Identity: who is applying**

```
                              ┌─────────────┐
                              │    USERS    │
                              └──────┬──────┘
            ┌──────────────┬─────────┴─────────┬──────────────┐
       1:0..1│         1:∞ │              1:∞ │          1:∞ │
            v              v                  v              v
    ┌─────────────┐ ┌───────────────┐  ┌───────────┐  ┌────────────┐
    │ APPLICANTS  │ │ NOTIFICATIONS │  │ REMINDERS │  │ AUDIT_LOGS │
    └──────┬──────┘ └───────────────┘  └───────────┘  └────────────┘
           │
           ├──── 1:0..1 ────>  ┌──────────────┐
           │                   │ CORPORATIONS │
           │                   └──────────────┘
           │
           ├──── 1:∞ ───────>  ┌─────────────────┐
           │                   │ REPRESENTATIVES │
           │                   └─────────────────┘
           │
           │ 1:∞   files
           v
      ┌─────────────┐
      │  REQUESTS   │
      └─────────────┘
```

**Tier 2 — The application: what was filed**

```
                              ┌─────────────┐
                              │  REQUESTS   │
                              └──────┬──────┘
       ┌────────────┬────────────┬───┴────────┬──────────────┐
   1:1 │        1:1 │        1:1 │        1:∞ │          1:∞ │
       v            v            v            v              v
┌────────────┐┌────────────┐┌───────────┐┌─────────────┐┌──────────────────┐
│  PROJECTS  ││ PROPERTIES ││ LOCATIONS ││ REQUIREMENT ││ REQUEST_TIMELINE │
│            ││            ││           ││ _DOCUMENTS  ││                  │
└────────────┘└────────────┘└───────────┘└─────────────┘└──────────────────┘
```

**Tier 3 — Decision, payment and issuance: what came of it**

```
                              ┌─────────────┐
                              │  REQUESTS   │
                              └──────┬──────┘
            ┌──────────────────┬─────┴──────────────┐
        1:∞ │              1:∞ │             1:0..1 │
            v                  v                    v
      ┌───────────┐      ┌───────────┐      ┌──────────────┐
      │  REPORTS  │      │ PAYMENTS  │      │ CERTIFICATES │
      └─────┬─────┘      └─────┬─────┘      └──────────────┘
            │                  │                    ^
 reviewed_by│ ∞:1              └─── 1:0..1 ─────────┘
            v                    entitles issuance
      ┌───────────┐
      │   USERS   │
      └───────────┘
```

**Standing alone — and correctly so**

```
      ┌────────────────┐   Configuration, not application data. Rows are
      │ SMS_TEMPLATES  │   found by event name, not by joining to a request,
      └────────────────┘   so it holds no foreign key. Not an oversight.
```

**Key fields per entity**

| Entity | Key fields |
|---|---|
| USERS | `id` PK · `name` · `email` UK · `password` · `user_type` · `signature_path` |
| APPLICANTS | `id` PK · `user_id` FK · `applicant_name` · `applicant_type` |
| CORPORATIONS | `id` PK · `applicant_id` FK · `corporation_name` · `tin` |
| REPRESENTATIVES | `id` PK · `applicant_id` FK · `representative_name` · `is_primary` |
| REQUESTS | `id` PK · `application_number` UK · `decision_number` UK · `user_id` FK · `applicant_id` FK · `status` · `verified_requirements` |
| PROJECTS | `id` PK · `request_id` FK · `project_type` · `project_cost` |
| PROPERTIES | `id` PK · `request_id` FK · `lot_area_sqm` · `title_number` |
| LOCATIONS | `id` PK · `request_id` FK · `barangay` · `city_municipality` |
| REQUIREMENT_DOCUMENTS | `id` PK · `request_id` FK · `requirement_id` · `file_path` |
| REPORTS | `id` PK · `request_id` FK · `amount` · `evaluation` · `workflow_status` |
| PAYMENTS | `id` PK · `request_id` FK · `amount` · `payment_method` · `payment_status` · `verified_by` FK |
| CERTIFICATES | `id` PK · `request_id` FK · `payment_id` FK · `certificate_number` UK · `status` · `released_to_name` |
| STATUS_HISTORY | `id` PK · `request_id` FK · `status_type` · `new_status` |
| REQUEST_TIMELINE | `id` PK · `request_id` FK · `event_type` · `visible_to_applicant` |
| NOTIFICATIONS | `id` PK · `user_id` FK · `type` · `read` |
| REMINDERS | `id` PK · `user_id` FK · `type` · `status` |
| AUDIT_LOGS | `id` PK · `user_id` FK · `action` · `model_type` |
| SMS_TEMPLATES | `id` PK · `event_key` UK · `message` · `enabled` |

### Caption

> **Figure 2-10.** Entity Relationship Diagram (ERD) of LocClear

### Narrative

The entity relationship diagram presents the structure of the database and the associations among its entities. A user holds one applicant record, and an applicant may hold one corporation record where the applicant is of the corporate type, together with one or more representative records where the applicant acts through another person. Each applicant may file many requests, and every request carries exactly one project record, one property record, and one location record, each held in its own table so that no detail is repeated across applications.

A request accumulates many requirement documents, one for each uploaded file, and many timeline entries recording its progress. It carries one report holding the officer's evaluation and the assessed fee, one payment recording the settlement of that fee, and one certificate representing the document issued upon approval. The certificate references the payment that entitled the applicant to it, so that no certificate may be released against an unverified payment. Users additionally hold many notifications, many reminders, and many audit log entries, the last of these retaining the acting user's name and electronic mail address alongside the reference, so that the record of an action survives any later change to the account that performed it.

The normalization of applicant, corporation, representative, project, property and location details into separate tables eliminates the redundancy that would arise from holding them repeatedly on each request, and maintains the database in Third Normal Form. The SMS templates table stands apart from these associations because it holds configuration rather than application data: it records the message sent for each notifiable event and joins to no other entity.

> ⚠ **The relationship to defend aloud.** `PAYMENTS → CERTIFICATES` exists so no certificate can be issued without a verified payment behind it — the database enforces the rule rather than trusting the interface to. If a panelist asks you to justify one design decision in your ERD, that is the one.

---

## Checklist before you submit the figures

- [ ] Figure 2-1 step 5 says **Functionality Testing**, not unit testing
- [ ] Figure 2-2 lists **nine** ISO/IEC 25010:2023 characteristics
- [ ] Every DFD arrow carries a label — an unlabelled flow is an incomplete DFD
- [ ] The context diagram has **no** data stores
- [ ] Treasury connects only to the Applicant, never to the system circle
- [ ] Figure 2-8 exists and shows the dashed Treasury box and the rejection loop
- [ ] Process numbers in each figure match the narrative text exactly
- [ ] Role names read **Zoning Officer** and **Zoning Administrator**, matching Chapter I
- [ ] Application types read **CZC / SUP / TUP / ZC**, never "Zoning Clearance"
- [ ] All ten captions use the same title — whichever one your adviser approves
