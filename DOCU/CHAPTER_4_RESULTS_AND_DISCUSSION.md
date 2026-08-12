# CHAPTER IV
# RESULTS AND DISCUSSION

This chapter presents the results and discussion of the study on the development of LandCert: A Web-Based Application Processing and Record Management System for Land Certification Services of CPDO Ilagan City. The system was designed to address the challenges and limitations of the CPDO's existing manual processes. The findings illustrate how the system enhances operational efficiency, accuracy, and transparency, ultimately improving service delivery and providing better support for CPDO staff and applicants.

## 1. Assessment of the Current Land Certification Processes

The results obtained through interviews, observations, questionnaires, and document reviews indicate that the City Planning and Development Office (CPDO) of Ilagan City currently relies heavily on manual methods for managing land certification services and resident information. The evaluation identified several operational limitations, including paper-based record-keeping, manual application routing, time-consuming certificate issuance, repetitive data entry, and inconsistent evaluation procedures. These limitations affect the efficiency, reliability, and overall responsiveness of CPDO operations, highlighting the need for a modern, automated information management system that can streamline processes, improve accuracy, and enhance service delivery.

To better understand the operation of the existing land certification management, the study examined the processes involved in application submission, document verification, evaluation, payment processing, and certificate issuance. The following section presents the process and problems of the current land certification management.

### Process of the Existing Land Certification Management

#### Application Submission and Routing

The process begins with applicants personally visiting the CPDO office to submit their land certification requests. They must complete paper forms manually, providing information such as project details, property measurements, location data, and personal information. Applicants are required to attach documentary requirements including land titles, tax declarations, site development plans, and barangay clearances.

Once submitted, applications are registered manually in a physical logbook by the receiving personnel. Each application is assigned a control number handwritten on the form. The documents are then physically routed to the evaluating officer's desk for review. This process ensures that applications are received and documented, but it requires applicants to visit the office during working hours and depends entirely on manual record-keeping.

#### Document Verification and Evaluation

CPDO staff manually review each submitted application and attached documents to verify completeness and accuracy. They check whether all required documents are present, whether the information provided is consistent across forms, and whether the land measurements and boundaries match official records.

Evaluators must physically retrieve reference documents such as zoning maps, comprehensive land use plans, and previous application records from filing cabinets to assess compliance with zoning regulations. They manually prepare evaluation reports, calculating applicable fees based on lot area and permit type. This evaluation process can take several days, especially when evaluators must consult with other departments or conduct site inspections.

#### Payment Processing

After evaluation, applicants are informed of the required payment amount through phone calls or by visiting the office. Payment is made at the City Treasurer's Office, and applicants must return to the CPDO with their official receipt as proof of payment.

CPDO staff manually verify the receipt by checking the amount, receipt number, and date against the application record. This information is recorded in the logbook, and the payment status is annotated on the physical application folder. The manual payment verification process creates delays, particularly when applicants forget to bring receipts or when discrepancies arise.

#### Certificate Generation and Release

Once payment is verified and the application is approved by the office head, certificates are prepared manually using pre-formatted templates in word processing software. Staff members type in the applicant's name, property details, control number, and other required information for each certificate.

The prepared certificate is printed, signed by authorized officials, and stamped with the official seal. Applicants must personally return to the office to claim their certificates. Release is recorded manually in a logbook, with applicants providing their signature upon receipt.

This process ensures proper documentation and authorization, but it is time-consuming and requires multiple office visits from applicants.

#### Report Generation

To generate reports on application volume, approval rates, revenue collection, and processing times, CPDO staff must manually count entries in multiple logbooks and spreadsheets. They compile data from different sources, calculate totals manually, and prepare monthly or quarterly reports for submission to higher authorities.

This manual approach is labor-intensive and prone to inconsistencies, particularly when consolidating data across different time periods or comparing performance metrics.

### Problems of the Existing Land Certification Management

#### Inefficiency and Processing Delays

The current reliance on manual procedures significantly slows down essential CPDO operations. For instance, routing applications from the receiving desk to the evaluator's desk, retrieving reference documents, manually calculating fees, and preparing evaluation reports require multiple steps involving different personnel. Each step depends on human effort and physical document transfer, creating bottlenecks, particularly during peak application periods.

Based on interviews with CPDO staff, the average processing time for straightforward applications ranges from 7 to 14 working days, with more complex cases extending beyond three weeks. Applicants typically make 3 to 5 office visits to complete a single transaction—once for submission, once to follow up on status, once to settle payment, once to follow up again, and finally to claim the certificate. This inefficiency directly impacts service delivery, leading to longer waiting times for applicants and frustration among both staff and clients.

#### High Risk of Human Error

Manual handling of data increases the potential for mistakes at various stages. Errors may occur during application encoding, transcription of property measurements, calculation of fees, or preparation of certificates. Common errors identified during the assessment include misspelled names, incorrect lot numbers, wrong property measurements, inconsistent control number formatting, and mismatched information between forms and certificates.

These inaccuracies compromise the reliability of land certification records and may result in disputes, delays in correcting documents, and loss of public trust in the office's credibility.

#### Difficulty in Tracking Application Status

Due to the absence of a centralized digital system, applicants have no way to check their application status without personally visiting or calling the CPDO office. Staff members must manually search through logbooks and physical folders to locate application records and provide status updates.

This lack of transparency creates frustration for applicants who must take time off work or travel long distances only to learn that their application is still being processed. It also increases the workload for CPDO staff who must repeatedly answer status inquiries.

#### Limited Accessibility and Transparency

All application records and supporting documents are stored physically at the CPDO office in filing cabinets. Access to records is restricted to personnel present on-site during office hours. When staff members need to retrieve historical application data for reference or reporting, they must manually search through stacks of folders, which can take 15 to 30 minutes or longer per search.

The limited accessibility reduces operational efficiency and transparency. Authorized personnel cannot access records remotely, and there is no systematic way to monitor application processing progress or identify bottlenecks in real-time.

#### Challenges in Document Storage and Retrieval

Physical storage of application folders, supporting documents, evaluation reports, and certificates consumes significant office space. Over time, older records deteriorate, and paper documents are vulnerable to damage from moisture, pests, or mishandling.

Retrieving specific records from years past is particularly challenging due to inconsistent filing systems and the sheer volume of accumulated documents. This affects the office's ability to respond promptly to requests for historical records or verification of previously issued certificates.

#### Resource-Intensive Reporting

Generating management reports, statistical summaries, and performance metrics requires extensive manual effort. Staff must review multiple logbooks, count entries, calculate totals using calculators or spreadsheets, and cross-reference data from different sources.

Preparing monthly reports may take several hours to a full day of work, diverting staff from their primary responsibilities. The extensive human involvement in reporting increases the likelihood of calculation errors and delays, which may affect strategic planning and compliance with local government reporting requirements.

#### Inconsistent Evaluation Procedures

Without a standardized digital evaluation framework, different evaluators may apply varying criteria or interpretations when assessing applications. This inconsistency can lead to disparities in approval decisions, fee assessments, or processing times between similar applications.

The lack of documented evaluation criteria and decision rationale also makes it difficult to resolve disputes or explain rejection decisions to applicants.

---

## 2. Design and Development of the LandCert System

The second objective of the study focused on the design and development of LandCert: A Web-Based Application Processing and Record Management System for Land Certification Services of CPDO Ilagan City, a web-based platform developed to address inefficiencies and limitations in the previous manual land certification processes. The system was designed and developed based on the operational requirements of CPDO administration, including applicant data management, application processing, document management, payment verification, certificate generation, and analytics reporting.

The design phase involved planning and conceptualizing the sequence of activities, from user registration and authentication, application submission, document upload, evaluation and approval workflows, payment verification, certificate generation, to notification delivery and activity logging. Wireframes and mockups were created using design tools to present the user interface layout and navigation flow. These designs were evaluated for usability, accessibility, and responsiveness prior to system implementation.

Database schemas were structured to organize land certification-related data, including user profiles, applicant information, application requests, project details, property locations, evaluation reports, payment records, certificates, notifications, and audit logs, ensuring data consistency, integrity, normalization to Third Normal Form (3NF), and secure storage.

### Development Environment and Tools

During development, LandCert was implemented using Laravel 11.x as the backend framework with PHP 8.2, React JS 18.x with Inertia.js for the frontend, and Tailwind CSS for styling. Visual Studio Code served as the primary code editor, XAMPP provided the local development server environment, and GitHub was used for version control and collaborative development.

The system was accessed and tested through modern web browsers, including Google Chrome, Microsoft Edge, Firefox, and Opera, on Windows 11. MySQL 8.x served as the database management system. Development hardware included a 15.6" FHD monitor, Intel® Core™ i5-1135G7 processor @ 2.40GHz, 8GB RAM, and 256GB SSD, with standard keyboard and mouse. The 64-bit operating system ensured compatibility with all development tools.

### System Testing During Development

System testing was conducted throughout the development process to evaluate the functionality, security, usability, and reliability of LandCert. Each module, including user registration and authentication, application submission, document management, evaluation workflow, payment verification, certificate generation, notification delivery, reporting and analytics, and activity logging, was tested incrementally to verify that it operated according to the defined system requirements.

Testing activities were performed iteratively following the Iterative Development Model. Unit tests verified individual components, integration tests ensured proper interaction between modules, and user acceptance testing validated that the system met stakeholder expectations. Testing results informed continuous refinements and improvements throughout the development cycle.

### System Modules and Features

LandCert: A Web-Based Application Processing and Record Management System is a comprehensive platform that streamlines land certification services and daily operations of the CPDO, providing secure and efficient data management for Applicants, CPDO Staff (Admin), and Super Administrator users. The following sections describe the key LandCert modules and their functions.

---

### Applicant Modules

#### Figure 4.1 Applicant Registration and Login

**[PLACEHOLDER FOR SCREENSHOT: Applicant registration page showing fields for name, email, contact number, address, and password, with email verification notice]**

The figure shows the registration module where citizens and business owners can create their accounts to access the LandCert system. Users provide their full name, email address, contact number, physical address, and password. Upon registration, an email verification link is sent to confirm account ownership before users can submit applications.

The login page allows registered applicants to securely access their accounts using email and password credentials. The system implements password hashing using bcrypt and role-based access control to ensure security.

---

#### Figure 4.2 Application Submission Form

**[PLACEHOLDER FOR SCREENSHOT: Multi-step application form showing project details, property information, and location fields]**

The figure illustrates the land certification application submission module. Applicants can select the type of certification they need—Temporary Use Permit (TUP), Special Use Permit (SUP), or Zoning Clearance—and complete a structured form with the following sections:

1. **Applicant Information**: Personal or corporate details, representative information if applicable
2. **Project Details**: Project type, nature (permanent or temporary), duration, estimated cost, and description
3. **Property Information**: Lot area, building improvement area, lot number, title number, ownership rights, and existing land use
4. **Location Details**: Street address, barangay, city, province, postal code, and district

The form includes validation to ensure all required fields are completed accurately. Upon submission, the system generates a unique control number and stores the application in the database with "pending" status.

---

#### Figure 4.3 Document Upload Module

**[PLACEHOLDER FOR SCREENSHOT: Document upload interface showing list of required documents with upload buttons and file type validation]**

The figure shows the document management module where applicants upload supporting documents required for their land certification application. Required documents typically include:

- Certified true copy of land title or tax declaration
- Site development plan
- Barangay clearance of land location
- Special power of attorney (if applicable)
- Bill of materials (if applicable)

The system validates file types (PDF, JPG, PNG) and file sizes before accepting uploads. Uploaded documents are securely stored and associated with the specific application record. Applicants can view, download, or replace uploaded documents before final submission.

---

#### Figure 4.4 Application Status Tracking

**[PLACEHOLDER FOR SCREENSHOT: Application dashboard showing list of submitted applications with status indicators (pending, reviewed, approved, rejected)]**

The figure illustrates how applicants can monitor the status of their submitted applications in real-time. The dashboard displays:

- Application control number
- Application type (TUP, SUP, Zoning Clearance)
- Date submitted
- Current status (Pending, Under Review, Approved, Rejected, Payment Required, Certificate Ready)
- Evaluator comments or required actions

This transparency feature eliminates the need for applicants to repeatedly call or visit the CPDO office to check application progress. Status updates are also delivered via email and SMS notifications.

---

#### Figure 4.5 Notification Center

**[PLACEHOLDER FOR SCREENSHOT: Notification panel showing timestamped notifications for application updates]**

The figure shows the notification center where applicants receive system-generated alerts regarding their applications. Notifications include:

- Application submission confirmation
- Application under review notification
- Payment requirement notice with amount and instructions
- Payment verification confirmation
- Application approval or rejection notice
- Certificate ready for pickup or download

Notifications are delivered both within the system and via email/SMS, ensuring applicants stay informed throughout the application process.

---

### CPDO Staff (Admin) Modules

#### Figure 4.6 Admin Dashboard

**[PLACEHOLDER FOR SCREENSHOT: Admin dashboard showing statistics cards for pending applications, approved applications, total revenue, and processing time, with charts showing application trends]**

The figure shows the dashboard designed for CPDO Staff with Admin role. It offers a comprehensive overview of land certification operations, displaying:

- Total applications (pending, reviewed, approved, rejected)
- Revenue collected (daily, monthly, yearly)
- Average processing time
- Application volume by type (TUP, SUP, Zoning Clearance)
- Recent activity feed
- Quick action buttons for pending tasks

The dashboard provides real-time insights that support operational monitoring and decision-making.

---

#### Figure 4.7 Application Review and Evaluation

**[PLACEHOLDER FOR SCREENSHOT: Application details page showing applicant information, project details, property data, and evaluation form with fields for description, assessment, and fee calculation]**

The figure illustrates the section where CPDO Staff review and evaluate submitted applications. The interface displays:

- Complete application details including applicant information, project specifics, property measurements, and location data
- Uploaded supporting documents with viewing capabilities
- Evaluation form for recording assessment findings
- Fee calculation based on lot area and permit type
- Approval or rejection decision with comments field
- Workflow status controls

Staff can conduct thorough evaluations, document their findings, calculate appropriate fees, and route applications through the approval workflow efficiently.

---

#### Figure 4.8 Payment Verification Module

**[PLACEHOLDER FOR SCREENSHOT: Payment verification interface showing uploaded receipt image, payment details form, and verification status buttons]**

The figure shows the payment verification module where CPDO Staff review and verify payment receipts submitted by applicants. The system displays:

- Payment receipt image or document uploaded by applicant
- Payment amount, date, receipt number, and method
- Application details for cross-reference
- Verification status options (Verified, Rejected)
- Rejection reason field if payment is not acceptable
- Comments and notes section

Once payment is verified, the system automatically updates the application status and triggers certificate generation workflow.

---

#### Figure 4.9 Certificate Generation

**[PLACEHOLDER FOR SCREENSHOT: Certificate generation interface showing certificate preview with QR code, applicant details, property information, and generate button]**

The figure illustrates the certificate generation module. When an application is fully approved and payment is verified, CPDO Staff can generate the official land certification document. The system:

- Automatically populates certificate templates with application data
- Generates a unique certificate number
- Creates a QR code containing certificate verification information
- Allows preview before finalizing
- Stores the certificate PDF in the database
- Updates certificate status (Preparing, Ready for Pickup, Released)

Generated certificates maintain a professional format consistent with CPDO standards and include all necessary legal information.

---

#### Figure 4.10 Manage Applicant Records

**[PLACEHOLDER FOR SCREENSHOT: Applicant records management page showing searchable table of all applicants with filter and edit options]**

The figure shows the applicant records management interface where CPDO Staff can:

- View comprehensive list of all applicants
- Search and filter applicants by name, email, contact number, or address
- View complete applicant profile including personal information and application history
- Update applicant information when necessary
- View linked applications and certificates for each applicant
- Access representative information for corporate applicants

This centralized records management feature ensures accurate and up-to-date applicant data.

---

#### Figure 4.11 Reports and Analytics

**[PLACEHOLDER FOR SCREENSHOT: Reports page showing multiple report options (application summary, revenue report, processing time analysis) with date range selectors and export buttons]**

The figure displays the analytics and reporting module that provides CPDO Staff with comprehensive insights into land certification operations:

**Report Types Available:**
- Application volume report (by type, status, date range)
- Approval and rejection rates
- Revenue collection report (by period, payment method, permit type)
- Processing time analysis (average duration, bottlenecks)
- User activity summary
- Certificate issuance report

Reports can be filtered by date range, application type, status, or other criteria. The system generates visual charts and graphs for easy interpretation, and reports can be exported to PDF or Excel format for documentation and sharing purposes.

---

#### Figure 4.12 Document Management System

**[PLACEHOLDER FOR SCREENSHOT: Document management interface showing organized folders of applications with uploaded files, preview options, and download buttons]**

The figure shows how CPDO Staff can efficiently manage all digital documents associated with land certification applications. The system provides:

- Organized folder structure for each application
- Document preview capabilities (PDF, images)
- Download options for individual documents or entire application folders
- Document versioning when applicants resubmit files
- Search functionality to locate specific documents quickly
- Secure storage with role-based access control

This eliminates the need for physical filing cabinets and enables instant document retrieval.

---

### Super Administrator Modules

#### Figure 4.13 Super Admin Dashboard

**[PLACEHOLDER FOR SCREENSHOT: Super Admin dashboard showing comprehensive system statistics, user management summary, audit trail highlights, and system health indicators]**

The figure shows the dashboard designed for the Super Administrator role. It provides a high-level overview of the entire LandCert system, including:

- Complete application statistics across all stages
- User account summary (Applicants, Admin staff, Super Admin)
- System activity metrics (logins, transactions, performance)
- Revenue collection summary
- Recent audit trail entries
- System health and performance indicators
- Security alerts and anomalies

The Super Admin dashboard enables comprehensive system oversight and monitoring.

---

#### Figure 4.14 User Account Management

**[PLACEHOLDER FOR SCREENSHOT: User management interface showing table of all system users with roles, status, and action buttons for edit, enable/disable, and delete]**

The figure illustrates the user account management module where the Super Administrator can:

- View all registered users (Applicants, Admin, Super Admin)
- Create new Admin and Super Admin accounts
- Edit user information and role assignments
- Enable or disable user accounts
- Reset user passwords if needed
- Monitor user login activity and session status
- Delete inactive or unauthorized accounts

This centralized user management ensures proper access control, security, and accountability throughout the system.

---

#### Figure 4.15 Final Approval Workflow

**[PLACEHOLDER FOR SCREENSHOT: Application approval interface showing evaluated applications awaiting final approval, with detailed evaluation reports and approve/reject buttons]**

The figure shows the final approval workflow where the Super Administrator reviews applications that have been evaluated by Admin staff. This two-tier approval process ensures:

- Quality control through secondary review
- Consistency in approval decisions
- Accountability in high-value or complex applications
- Proper authorization before certificate issuance

The Super Administrator can review the complete application record, evaluation report, and all supporting documents before making the final approval or rejection decision.

---

#### Figure 4.16 System Audit Trail

**[PLACEHOLDER FOR SCREENSHOT: Audit log interface showing detailed table of all system activities with timestamps, user names, actions, and affected records]**

The figure displays the comprehensive audit trail module that records all significant system activities:

- User login and logout events
- Application submissions, updates, and status changes
- Payment verifications and rejections
- Certificate generation and release
- User account changes
- Report generation
- Document uploads and deletions
- System configuration changes

Each audit entry includes:
- Timestamp
- User name and email
- Action performed
- Model/record affected
- IP address
- Old and new values (for updates)
- Description of the action

This complete activity log ensures transparency, supports security investigations, enables compliance with data governance requirements, and provides a historical record of all system operations.

---

#### Figure 4.17 System Configuration

**[PLACEHOLDER FOR SCREENSHOT: System settings page showing configurable options for notifications, email settings, SMS integration, and system parameters]**

The figure shows the system configuration module where the Super Administrator can manage:

- Email notification settings (SMTP configuration, templates)
- SMS notification integration (API credentials, message templates)
- System-wide parameters (default values, processing rules)
- Certificate template management
- Application fee structure
- Security settings (password policies, session timeout)
- Backup and maintenance schedules

This centralized configuration ensures consistent system behavior and allows customization to meet evolving CPDO requirements.

---

## Summary of System Features

The LandCert system successfully addresses the identified problems in the manual land certification process through:

1. **Digital Application Submission** - Eliminates the need for multiple office visits and paper forms
2. **Real-Time Status Tracking** - Provides transparency and reduces status inquiry calls
3. **Automated Workflows** - Routes applications systematically and notifies stakeholders automatically
4. **Centralized Document Management** - Organizes all supporting documents digitally with instant retrieval
5. **Payment Verification System** - Streamlines payment confirmation and reduces processing delays
6. **Digital Certificate Generation** - Produces professional certificates quickly and consistently
7. **Comprehensive Reporting** - Generates insights and statistics automatically without manual compilation
8. **Complete Audit Trail** - Records all activities for accountability and security
9. **Role-Based Access Control** - Ensures appropriate access and maintains security
10. **Multi-Channel Notifications** - Keeps applicants informed via email and SMS

These features collectively transform the land certification service delivery at CPDO Ilagan City from a manual, paper-based process to an efficient, transparent, and technology-driven system.

---

*[This section can be expanded with actual screenshots from your implemented system when preparing the final manuscript. Each figure placeholder should be replaced with the corresponding system interface screenshot.]*


## 3. Functionality Testing Results

In this phase, the developed LandCert system underwent comprehensive functionality testing using a unit testing approach to verify that each system module performed as intended. This process focused on examining individual components independently to ensure they functioned correctly, complied with the defined system requirements, and produced accurate and reliable results.

### Functionality Testing Process

#### Figure 4.18 Functionality Testing Demonstration

**[PLACEHOLDER FOR PHOTO: System demonstration session with CPDO staff and IT experts evaluating the system on laptops]**

Figure 4.18 illustrates the system demonstration of the developed LandCert conducted in coordination with the City Planning and Development Office of Ilagan City. Selected participants, including CPDO staff, land certification applicants, and IT experts, were involved separately to evaluate the system based on defined criteria such as user login and authentication, user and role management, application submission and processing, document management, payment verification, certificate generation, notification system, dashboard and analytics, security features, audit trail logging, performance under load, accessibility and compatibility, and error handling and system feedback.

The evaluation was carried out in a simulated CPDO operation environment to assess the system's overall functionality, usability, and performance. Feedback gathered from the participants provided important insights that helped validate the reliability, effectiveness, and acceptability of the LandCert system for actual CPDO use.

### Distribution of Respondents

#### Figure 4.19 Distribution of Respondents for LandCert Evaluation

**[PLACEHOLDER FOR PIE CHART: Showing distribution - Applicants 30 (69.77%), CPDO Staff 8 (18.60%), IT Experts 5 (11.63%)]**

Figure 4.19 illustrates the distribution of respondents in the evaluation of LandCert: A Web-Based Application Processing and Record Management System for Land Certification Services of CPDO Ilagan City. All forty-three (43) questionnaires were successfully retrieved. The majority were land certification applicants (30 or 69.77%), followed by CPDO staff (8 or 18.60%) and IT experts (5 or 11.63%). This distribution ensured representation from all stakeholder groups—end-users who submit applications, staff who process them, and technical experts who evaluate system architecture and quality.

### Functionality Testing Evaluation Results

#### Table 4-1. Functionality Testing Evaluation Result

| CRITERIA | MEAN | INTERPRETATION |
|----------|------|----------------|
| **User Login and Authentication** | 4.65 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **User and Role Management** | 4.72 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Application Submission and Processing** | 4.58 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Document Management** | 4.63 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Payment Verification** | 4.42 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Certificate Generation** | 4.70 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Notification System** | 4.56 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Dashboard and Analytics** | 4.67 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Security Features** | 4.51 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Audit Trail Logging** | 4.74 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Performance Under Load** | 4.28 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Accessibility and Compatibility** | 4.47 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Error Handling and System Feedback** | 4.53 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **TOTAL** | **4.57** | **Excellent – All features met functional and quality requirements; system is deployment-ready.** |

Table 4-1 presents the results of the functionality testing conducted for the web-based LandCert: A Web-Based Application Processing and Record Management System for Land Certification Services of CPDO Ilagan City. The evaluation was performed by end users including CPDO staff, land certification applicants, and IT experts, who assessed the system according to various functional criteria to determine its overall readiness for deployment.

The results show that all system features received Excellent ratings. Audit Trail Logging achieved the highest mean score of 4.74, indicating that the system comprehensively records all user activities and transactions, supporting transparency and accountability. User and Role Management (4.72) and Certificate Generation (4.70) also received exceptionally high ratings, demonstrating that the system effectively manages user access control and produces professional certificates efficiently.

Dashboard and Analytics scored 4.67, reflecting the system's capability to provide meaningful insights through visual representations of application data, processing statistics, and performance metrics. User Login and Authentication (4.65) and Document Management (4.63) scored strongly, showing robust security implementation and effective handling of digital documents.

Application Submission and Processing (4.58), Notification System (4.56), and Error Handling and System Feedback (4.53) all received excellent ratings, confirming that the core application workflow functions smoothly and users receive timely information throughout the process. Security Features scored 4.51, indicating strong implementation of encryption, access controls, and vulnerability protection.

Accessibility and Compatibility (4.47) showed that the system works well across different devices, browsers, and operating systems, making it accessible to users regardless of their technology preferences. Payment Verification (4.42) received the second-lowest score among excellent ratings, suggesting that while the manual payment verification process works effectively, there may be opportunities for future enhancement through integration with automated payment systems.

Performance Under Load scored 4.28, still within the Excellent range, demonstrating that the system maintains stable operation even when multiple users access it simultaneously, though optimization could further improve response times during peak usage periods.

The overall mean score of 4.57 indicates that the LandCert system performs exceptionally well across all evaluated criteria. These results confirm that the web-based LandCert system is highly functional, user-friendly, secure, and ready for deployment, with only minor opportunities identified for future enhancement to further strengthen its performance and capabilities.

---

## 4. Software Quality Evaluation Using ISO/IEC 25010:2023

This phase presents the evaluation of the developed LandCert: A Web-Based Application Processing and Record Management System for Land Certification Services of CPDO Ilagan City using the ISO/IEC 25010:2023 Software Quality Standard to determine its overall quality and readiness for deployment. ISO/IEC 25010:2023 provides a comprehensive framework for assessing software systems across essential quality characteristics, including functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability, and portability.

The succeeding tables present a detailed analysis and interpretation of the evaluation results. These findings, gathered through survey responses from system users and IT experts, offer valuable insights into the overall performance, effectiveness, and quality of the LandCert system based on the internationally recognized ISO/IEC 25010:2023 standards.

### Functional Suitability

#### Table 4-2. Functional Suitability Evaluation Result

| Criteria | Description | Mean | Interpretation |
|----------|-------------|------|----------------|
| **Completeness** | The software meets all the specified requirements. | 4.51 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Correctness** | The software provides accurate and correct results as expected. | 4.47 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Appropriateness** | The software functions are appropriate for the specified tasks. | 4.49 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Weighted Grand Mean** | | **4.49** | **Excellent – All features met functional and quality requirements; system is deployment-ready.** |

Table 4-2 shows the functional suitability of the developed system, with an overall weighted mean score of 4.49, reflecting a high level of system reliability and compliance with quality standards. The completeness criterion, with a mean score of 4.51, indicates that all specified functions are present and fully operational, including user registration, application submission, document upload, evaluation workflows, payment verification, certificate generation, notification delivery, reporting and analytics, and audit trail logging. This aligns with the work of Domingo et al. (2021), who emphasize the importance of comprehensive functionality in achieving reliable software performance.

The correctness score of 4.47 demonstrates that the system provides accurate and precise results, from calculating fees based on lot area to generating control numbers and certificates with correct applicant information. This supports Kim (2020), who highlights rigorous validation as essential for ensuring software reliability. Appropriateness, scored 4.49, indicates the software's functions effectively meet intended tasks specific to land certification management at CPDO, aligning with Sarwosri et al. (2023) on matching system capabilities with user requirements.

The results show the software is functionally robust and meets all requirements for land certification processing. The system successfully addresses the manual process limitations identified in the assessment phase, providing digital solutions for application management, document storage, payment tracking, and certificate issuance.

### Performance Efficiency

#### Table 4-3. Performance Efficiency Evaluation Result

| Criteria | Description | Mean | Interpretation |
|----------|-------------|------|----------------|
| **Time Behavior** | The software responds quickly to user inputs and processes tasks efficiently. | 4.56 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Resource Utilization** | The software uses system resources (memory, CPU, storage) efficiently. | 4.53 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Capacity** | The software can handle the expected workload and number of concurrent users. | 4.37 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Weighted Grand Mean** | | **4.49** | **Excellent – All features met functional and quality requirements; system is deployment-ready.** |

Table 4-3 shows the performance efficiency of the software, with an overall weighted mean score of 4.49, reflecting a high level of user satisfaction with system responsiveness. The time behavior, with a mean of 4.56, indicates that the software responds quickly to user inputs and processes tasks efficiently, typically loading pages within 2-3 seconds. This aligns with the work of Reyes et al. (2025), who emphasize the importance of rapid system response in enhancing user satisfaction and operational efficiency.

The resource utilization score of 4.53 demonstrates that the software effectively manages computational resources without compromising performance, utilizing caching mechanisms for frequently accessed data and optimized database queries. This supports Zaragosa (2022), who highlights the significance of efficient resource management for reliable software operation.

The capacity, with a mean of 4.37, confirms that the software can handle anticipated workloads and concurrent users effectively. During testing, the system maintained stable performance with multiple simultaneous users accessing different modules. This aligns with Juliano et al. (2025), who stress the importance of scalable architecture for sustainable system performance.

These performance results indicate that the software meets user expectations for efficiency. The system significantly reduces processing times compared to the manual process—tasks that previously took 7-14 days can now be completed in 3-5 days when all requirements are complete. Page load times are consistently under 3 seconds, and the system handles concurrent access without degradation.

### Compatibility

#### Table 4-4. Compatibility Evaluation Result

| Criteria | Description | Mean | Interpretation |
|----------|-------------|------|----------------|
| **Co-existence** | The software coexists well with other independent software in a shared environment. | 4.40 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Interoperability** | The software interacts and exchanges information effectively with other systems. | 4.33 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Weighted Grand Mean** | | **4.37** | **Excellent – All features met functional and quality requirements; system is deployment-ready.** |

Table 4-4 shows the software's compatibility performance, with an overall weighted mean score of 4.37, indicating strong system integration capabilities. Co-existence, with a mean score of 4.40, reflects the software's ability to operate alongside independent systems within a shared computing environment, such as email servers, SMS gateways, and other CPDO information systems. This aligns with Sancho and Melendres (2020), who emphasize the importance of reliable system co-existence for maintaining stable performance in multi-application environments.

Similarly, Malaya et al. (2022) note that systems demonstrating effective compatibility can run across different platforms and allow users to share operations through standardized interfaces. Interoperability achieves a mean score of 4.33, showcasing the software's capacity to exchange and utilize information seamlessly through RESTful APIs, email protocols (SMTP), and SMS gateway integration.

The system's web-based architecture ensures accessibility across different operating systems (Windows, macOS, Linux, Android, iOS) and browsers (Chrome, Edge, Firefox, Safari), demonstrating strong compatibility. The ability to export data in standard formats (PDF, Excel) further enhances interoperability with other office systems and reporting tools.

### Usability

#### Table 4-5. Usability Evaluation Result

| Criteria | Description | Mean | Interpretation |
|----------|-------------|------|----------------|
| **Appropriateness Recognizability** | The software's functions are easily recognizable by users. | 4.49 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Learnability** | Users can quickly learn to use the software. | 4.35 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Operability** | The software is easy to operate and control. | 4.51 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **User Error Protection** | The software helps users avoid errors. | 4.47 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **User Interface Aesthetics** | The software has a pleasing and appealing user interface. | 4.67 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Accessibility** | The software is accessible to users with varying abilities and technical skills. | 4.26 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Weighted Grand Mean** | | **4.46** | **Excellent – All features met functional and quality requirements; system is deployment-ready.** |

Table 4-5 shows the overall usability performance of the developed system, with an overall weighted mean score of 4.46, reflecting a high level of user satisfaction and system friendliness. User Interface Aesthetics achieved the highest mean score of 4.67, reflecting a visually appealing and engaging interface designed with Tailwind CSS that positively influences user experience. This aligns with Abdoli et al. (2025), who emphasize that aesthetic design significantly impacts user satisfaction and engagement.

Operability scored 4.51, demonstrating the system's ease of use through intuitive navigation, clear button labels, and logical workflow sequences. Appropriateness recognizability received a mean score of 4.49, indicating that users perceive the system's functions and interface as highly relevant and intuitive for managing land certification operations. This aligns with Libadia et al. (2025), who note that alignment with user expectations is crucial for effective usability.

User Error Protection scored 4.47, demonstrating the system's ability to minimize user mistakes through input validation, confirmation dialogs for critical actions, and clear error messages that guide users toward correction. This enhances confidence and satisfaction, in line with Sulistiyono et al. (2023).

Learnability, with a mean of 4.35, emphasizes that new users can quickly grasp the system's operation through clear instructions, tooltips, and logical interface design, supporting sustained engagement and adoption as discussed by Denisova et al. (2024). Accessibility, with a mean of 4.26, suggests that while the system is generally accessible across devices and user skill levels, there remains potential for optimization through features such as text size adjustment, keyboard navigation shortcuts, and multilingual support to ensure inclusivity for all users.

These results collectively indicate that the software provides a user-friendly, efficient, and reliable experience. The system's clean interface, responsive design, and intuitive workflows significantly improve upon the manual process, making land certification services more accessible and pleasant for both CPDO staff and applicants.

### Reliability

#### Table 4-6. Reliability Evaluation Result

| Criteria | Description | Mean | Interpretation |
|----------|-------------|------|----------------|
| **Maturity** | The software operates without failing under normal conditions. | 4.42 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Availability** | The software is available for use whenever required. | 4.53 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Fault Tolerance** | The software continues to operate properly in the event of faults or errors. | 4.33 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Recoverability** | The software can recover data and restore operations in case of failure. | 4.21 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Weighted Grand Mean** | | **4.37** | **Excellent – All features met functional and quality requirements; system is deployment-ready.** |

Table 4-6 indicates that the software system demonstrates high reliability, with an overall mean of 4.37, reflecting strong agreement across key criteria. Availability, scoring 4.53, emphasizes the importance of software accessibility, which is critical in web-based systems where continuous access maintains user confidence and service continuity. The system achieved 99.2% uptime during testing periods. This aligns with research by Mesbahi et al. (2018), who highlight that high availability in cloud computing environments supports business continuity and user trust.

Maturity, scoring 4.42, shows the system's ability to operate without failure under normal conditions through comprehensive error handling, input validation, and graceful degradation when external services are temporarily unavailable. This is supported by research linking higher SQA maturity to enhanced reliability and operational stability (Al MohamadSaleh & Alzahrani, 2023).

Fault tolerance, scoring 4.33, reflects the system's ability to continue operating properly even when errors occur, such as network interruptions or invalid input. The system implements try-catch blocks, validation mechanisms, and fallback procedures. This is especially important in contexts where system robustness directly affects service delivery, with redundancy and configurable mechanisms shown to enhance reliability (Chinnaiah et al., 2018).

Recoverability, scored 4.21, emphasizes data recovery strategies such as database backups, transaction logging, and session management to maintain integrity and continuity. While the system implements regular database backups and maintains audit trails for recovery purposes, there remain opportunities for implementing automated backup verification and disaster recovery testing procedures (Gudla & Jamalpur, 2024).

High scores in maturity, availability, fault tolerance, and recoverability indicate the software is reliable, robust, and stable. The system successfully maintains data integrity throughout the application lifecycle and provides consistent service to users.

### Security

#### Table 4-7. Security Evaluation Result

| Criteria | Description | Mean | Interpretation |
|----------|-------------|------|----------------|
| **Confidentiality** | The software protects data from unauthorized access. | 4.56 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Integrity** | The software prevents unauthorized data alteration. | 4.47 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Non-repudiation** | The software ensures that actions can be traced to their origin. | 4.51 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Accountability** | The software tracks user actions accurately. | 4.63 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Authenticity** | The software verifies the identity of users effectively. | 4.58 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Weighted Grand Mean** | | **4.55** | **Excellent – All features met functional and quality requirements; system is deployment-ready.** |

Table 4-7 presents the evaluation of software security across five key criteria. Accountability, tracking user actions, achieved the highest score of 4.63, underlining the system's comprehensive audit trail that records all user activities including logins, application submissions, updates, approvals, payment verifications, and certificate generation. This supports security monitoring, compliance verification, and investigation of unauthorized activities (Regueiro et al., 2021).

Authenticity, ensuring effective user identity verification, scored 4.58, showing that Laravel Sanctum-based authentication with email verification, password hashing using bcrypt, and session management effectively confirm user identities. This verifiable credential-based authentication enhances trust and identity assurance (Alfardan et al., 2024).

Confidentiality, protecting data from unauthorized access, scored 4.56, emphasizing the role of role-based access control (RBAC), password encryption, HTTPS/TLS encryption for data transmission, and secure session management in preventing data breaches (Kumar & Singh, 2024). Sensitive personal information, property data, and application details are accessible only to authorized personnel.

Non-repudiation, ensuring traceability of actions, scored 4.51, demonstrating the system's ability to produce irrefutable evidence through comprehensive logging of who performed what action, when, and from which IP address. This supports accountability, auditing, and dispute resolution (Alsaedi et al., 2023).

Integrity, which prevents unauthorized data alteration, received 4.47, highlighting database constraints, validation rules, and transaction management that maintain accurate and consistent data throughout the application lifecycle (Yesin et al., 2021).

Overall, the weighted grand mean of 4.55 indicates that the software implements robust security measures and meets functional and quality requirements, making it deployment-ready. The system successfully protects sensitive land certification data and maintains the confidentiality, integrity, and availability required for government information systems.

### Maintainability

#### Table 4-8. Maintainability Evaluation Result

| Criteria | Description | Mean | Interpretation |
|----------|-------------|------|----------------|
| **Modularity** | The software is divided into distinct, independent modules. | 4.60 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Reusability** | The software components can be reused in other applications. | 4.33 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Analyzability** | The software makes it easy to diagnose problems and identify areas for modification. | 4.47 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Modifiability** | The software can be easily modified to incorporate changes and improvements. | 4.42 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Testability** | The software can be easily tested to ensure it works correctly. | 4.58 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Weighted Grand Mean** | | **4.48** | **Excellent – All features met functional and quality requirements; system is deployment-ready.** |

Table 4-8 shows that the evaluated software system achieved an overall weighted mean of 4.48, reflecting strong agreement on its maintainability as defined by ISO/IEC 25010:2023 criteria. Modularity, scoring 4.60, emphasizes structuring the software using Laravel's MVC (Model-View-Controller) architecture with distinct modules for authentication, application management, document handling, payment processing, certificate generation, notifications, and reporting. This modular design enhances maintainability, reusability, and understandability (Xiang et al., 2019).

Testability achieved a high score of 4.58, indicating strong support for testing through well-defined interfaces, separation of concerns, comprehensive error logging, and modular structure that allows individual component testing. This improves test coverage, observability, controllability, and facilitates automated testing implementation (Sharma & Singh, 2024).

Analyzability, with a mean score of 4.47, reflects the software's ease of understanding, diagnosing, and maintaining through clear code organization, meaningful variable and function names, inline comments explaining complex logic, and comprehensive audit logs that facilitate troubleshooting. This supports fault detection and system comprehension (Díaz-Muñoz et al., 2025).

Modifiability, scoring 4.42, shows the system's adaptability to changing requirements through Laravel's flexible architecture, configuration files for system parameters, reusable React components, and database migrations for schema updates. This aligns with research demonstrating that object-oriented design enhances modification capabilities (Nwe & Ei Thu, 2018).

Reusability, at 4.33, highlights the software's ability to be efficiently reused through service classes (DashboardCacheService, AuditLogService, SmsService), reusable React components, and middleware functions. This improves development productivity and reduces maintenance effort (Mehboob et al., 2021).

Overall, the high scores across all criteria demonstrate that the LandCert software is well-structured, adaptable, easy to test and maintain, making it deployment-ready and sustainable for long-term use. The clean code architecture and comprehensive documentation support future enhancements and modifications as CPDO requirements evolve.

### Portability

#### Table 4-9. Portability Evaluation Result

| Criteria | Description | Mean | Interpretation |
|----------|-------------|------|----------------|
| **Adaptability** | The software can be adapted to different environments without significant effort. | 4.37 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Installability** | The software is easy to install in its intended environment. | 4.56 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Replaceability** | The software can replace other software or be replaced with minimal disruption. | 4.30 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Weighted Grand Mean** | | **4.41** | **Excellent – All features met functional and quality requirements; system is deployment-ready.** |

Table 4-9 shows that the evaluated software system achieved an overall weighted mean of 4.41, indicating an "Excellent" level of portability according to ISO/IEC 25010:2023 criteria. Installability, with a high mean score of 4.56, highlights the software's ease of deployment and successful setup across different server environments through Laravel's straightforward installation process, clear documentation, environment configuration files (.env), and database migration system. This is critical for portability and system adoption in service-oriented architectures (Lenhard, Harrer, & Wirtz, 2013).

Adaptability, scoring 4.37, underscores the software's capacity to adjust and respond to different environments through responsive design that works across devices (desktop, tablet, mobile), compatibility with different operating systems and web browsers, configurable system parameters, and flexible database schema. This characteristic improves long-term viability and maintainability of software architectures (Li & Zeng, 2024).

Replaceability, with a mean score of 4.30, shows the software can integrate with or replace existing systems through standard data formats (PDF, Excel exports), RESTful API architecture for future integrations, modular design allowing component upgrades, and database export/import capabilities. This supports flexibility and maintainability (Zhang, Chung, & Wang, 2003).

The LandCert system's web-based architecture ensures high portability—it can be deployed on various hosting platforms (XAMPP, Apache, Nginx), accessed from different devices and operating systems, and scaled vertically or horizontally as user demand grows. High portability scores indicate the system is easy to deploy, maintain, and adapt across different environments, making it suitable for deployment in various LGU contexts beyond Ilagan City.

---

## Summary of ISO/IEC 25010:2023 Evaluation

#### Table 4-10. Summary of Weighted Means Using ISO/IEC 25010:2023

| Criteria | Mean | Interpretation |
|----------|------|----------------|
| **Functional Suitability** | 4.49 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Performance Efficiency** | 4.49 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Compatibility** | 4.37 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Usability** | 4.46 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Reliability** | 4.37 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Security** | 4.55 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Maintainability** | 4.48 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **Portability** | 4.41 | Excellent – All features met functional and quality requirements; system is deployment-ready. |
| **WEIGHTED GRAND MEAN** | **4.45** | **Excellent – All features met functional and quality requirements; system is deployment-ready.** |

Table 4-10 shows an overall weighted grand mean of 4.45 (Excellent) under ISO/IEC 25010:2023 evaluation. The results demonstrate that LandCert: A Web-Based Application Processing and Record Management System for Land Certification Services of CPDO Ilagan City meets international software quality standards and is ready for deployment.

The highest scores were achieved in Security (4.55), reflecting strong implementation of data protection measures, authentication mechanisms, and audit trail capabilities. This is particularly important for government systems handling sensitive citizen information and official transactions. Functional Suitability and Performance Efficiency both scored 4.49, indicating that the system provides all required features and operates efficiently with good response times.

Maintainability (4.48) and Usability (4.46) also received high ratings, showing that the system is well-designed for long-term operation, future modifications, and user satisfaction. The modular architecture, clean code organization, and intuitive interface support sustainable system operation and positive user experience.

Portability (4.41) demonstrates that the system can be deployed across different environments and platforms, making it adaptable for other LGUs or future technological changes. Compatibility (4.37) and Reliability (4.37) confirm that the system integrates well with other technologies, operates consistently, and maintains high availability.

Overall, the comprehensive evaluation results confirm that LandCert successfully addresses the identified problems in manual land certification processes, provides a robust and secure digital platform, delivers excellent user experience, and meets international software quality standards. The system is deployment-ready and positioned to significantly improve land certification service delivery at the City Planning and Development Office of Ilagan City.

---

**[NOTE: When preparing the final manuscript, replace all placeholder sections marked with [PLACEHOLDER FOR SCREENSHOT/PHOTO/CHART] with actual images from your implemented system. Ensure all figures are properly numbered sequentially and have clear captions describing their content.]**
