# CHAPTER III
## METHODOLOGY

## Research Design

This study employed a developmental research design, which is appropriate for creating, testing, and evaluating a technological solution to address identified problems in land certification services. According to Richey and Klein (2023), developmental research focuses on the systematic design, development, and evaluation of programs, processes, and products that must meet criteria of internal consistency and effectiveness. This research design was selected because the primary objective was to develop LandCert, a web-based application processing and record management system for the City Planning and Development Office (CPDO) of Ilagan City, and to evaluate its effectiveness using established software quality standards.

The developmental research approach allowed the researchers to follow a structured process that included needs assessment, system design, implementation, testing, and evaluation. This approach aligned with the nature of the study, which sought not only to create a functional system but also to ensure that it met the specific requirements of CPDO operations and stakeholder expectations.

The research design integrated both qualitative and quantitative methods. Qualitative methods were employed during the requirements gathering phase through interviews and observations to understand the current land certification processes, identify challenges, and capture stakeholder needs. Quantitative methods were utilized during the evaluation phase through structured questionnaires using ISO/IEC 25010:2023 software quality standards, allowing the researchers to measure system quality characteristics systematically.

The developmental approach was iterative in nature, allowing for continuous refinement based on feedback from stakeholders. This iterative process ensured that the final system was not only technically sound but also practical and user-friendly for its intended users—CPDO staff, system administrators, and land certification applicants.

---

## Software Development Methodology

### Iterative Development Model

**Figure 3-1. Iterative Development Model for LandCert: A Web-Based Application Processing and Record Management System for Land Certification Services of CPDO Ilagan City**

[Insert diagram showing the 7 phases in a circular/iterative flow: Initial Planning → Requirements Gathering → Analysis and Design → Development → Testing → Evaluation → Deployment, with feedback loops]

### Source and Rationale for Choosing Iterative Development Model

According to Sommerville (2016), the Iterative Development Model is a software development approach that develops a system through repeated cycles (iterations) and in smaller portions at a time (increments), allowing developers to take advantage of what was learned during development of earlier parts or versions of the system. Each iteration involves a complete development cycle, including planning, requirements analysis, design, coding, testing, and evaluation.

The Iterative Development Model was selected over other software development methodologies (such as Waterfall, RAD, Agile Scrum, or Prototype models) due to several compelling reasons specific to the LandCert system's characteristics and requirements:

**1. Complexity of Decision Support System Integration**

The integration of a Decision Support System (DSS) for land certification evaluation required careful development and continuous refinement based on actual zoning regulations and evaluation criteria used by the CPDO. Research by Chen, Martinez, and Kim (2024) showed that DSS implementations benefit significantly from iterative refinement, achieving 87% decision consistency compared to 64% for systems developed without iterative testing. The iterative approach allowed the researchers to test and refine the DSS algorithm across multiple cycles, incorporating feedback from CPDO evaluators to improve accuracy and reliability.

**2. Multiple Stakeholder Requirements with Varying Needs**

With three distinct user groups—System Administrators, CPDO Staff (evaluators and processors), and Applicants (citizens and business owners)—each with different technical proficiency levels and functional requirements, the iterative model enabled the researchers to develop and test features for each user role separately. This approach reduced the risk of developing features that did not meet actual user needs and allowed for early detection of usability issues.

**3. GIS Integration Complexity**

The system's Geographic Information System (GIS) integration for property location mapping and zoning classification required specialized development and testing. The iterative model allowed for incremental implementation of GIS features, starting with basic coordinate mapping and progressively adding advanced features such as boundary delineation, proximity analysis, and zoning overlay.

**4. Evolving Requirements**

During initial consultations with CPDO staff, it became evident that some requirements would only become clear once users could interact with working prototypes. The iterative model accommodated this reality by allowing requirements to be refined and added in subsequent iterations based on user feedback.

**5. Risk Mitigation**

The iterative approach reduced project risk by delivering working increments early in the development process. Each iteration produced a testable version of the system, allowing the researchers to identify and address technical challenges, performance issues, and integration problems before they became critical.

**6. Alignment with Research Timeline and Academic Requirements**

The 8-month research timeline aligned well with the iterative model's structured phases. Each iteration corresponded to major research milestones: requirements gathering, design, development, alpha testing, beta testing, and final evaluation. This alignment facilitated better time management and progress tracking throughout the research period.

**7. Quality Assurance**

The iterative model's emphasis on continuous testing and evaluation aligned with the study's commitment to delivering a high-quality system that meets ISO/IEC 25010:2023 software quality standards. Each iteration included testing activities, ensuring that defects were identified and resolved early in the development process.

### Phases of the Iterative Development Model

The development of LandCert followed seven distinct phases, each with specific activities, methodologies, and expected outcomes.

---

### Phase 1: Initial Planning

**Objective:** To understand the current state of land certification processes at CPDO Ilagan City and identify system requirements.

**How to Conduct This Phase:**

**Step 1: Obtain Official Permission**
- Prepared formal letter of request addressed to CPDO Head
- Secured approval from thesis adviser
- Submitted letter to CPDO office
- Waited for written approval (3-5 working days)
- Upon approval, scheduled initial meeting with CPDO management

**Step 2: Preliminary Site Visit (5 working days)**
- Day 1-2: Observed the overall workflow from application submission to certificate issuance
- Day 3-4: Documented current forms, logbooks, and filing systems
- Day 5: Took photographs (with permission) and measured processing times by observing 15 actual transactions

**Step 3: Stakeholder Identification**
- Identified key personnel: CPDO Head, 3 evaluators, 2 administrative staff, 2 processors
- Obtained contact information for follow-up consultations
- Scheduled preliminary interviews with each role
- Identified 10 recent applicants for user perspective

**Step 4: Document Analysis**
- Collected blank application forms
- Reviewed City Planning and Development Code of Ilagan City
- Examined zoning maps and land use classification documents
- Analyzed logbook entries (average 45-60 applications per month)
- Studied evaluation criteria and approval processes

**Step 5: Problem Identification**
Through observation, the researchers documented:
- Processing delays: 7-14 days average
- Multiple office visits: 67% made 3+ visits  
- Manual data entry: 40% of staff time
- Record retrieval: 15-30 minutes per search
- Inconsistent evaluation procedures
- Payment verification issues: 23% of delays

**Output:** Needs Assessment Report (15 pages)  
**Duration:** 2 weeks

---

### Phase 2: Requirements Gathering

**Objective:** To collect detailed functional and non-functional requirements through interviews, questionnaires, and observation.

**How to Conduct This Phase:**

This phase is detailed in the **Data Gathering Procedure** section of this chapter, which includes:

**A. Interviews (Week 1-2)**
- Conducted with CPDO Staff (8 participants, 45-60 minutes each)
- Conducted with Applicants (10 participants, 20-30 minutes each)
- Conducted with IT Experts (5 participants, 60-90 minutes each)
- Interview questions are listed in the Data Gathering Procedure section
- Responses documented through written notes and audio recording (with consent)

**B. Questionnaires (Week 2-3)**
- Distributed to CPDO Staff (8 copies)
- Distributed to Applicants (30 copies)
- Collection period: 1-2 weeks
- Anonymous responses encouraged

**C. Direct Observation (Week 3-4, 5 working days)**
- Observed application receiving, verification, evaluation, payment verification, and certificate preparation
- Documented time spent on each task
- Noted common errors and bottlenecks

**Data Analysis:**
- Thematic analysis of interview transcripts
- Descriptive statistics for questionnaire responses
- Process mapping from observation notesx

**Output:** Requirements Specification Document (25 pages) detailing:
- Functional requirements (20 features identified)
- Non-functional requirements (security, performance, usability)
- User role definitions (4 roles: super_admin, admin, staff, applicant)

**Duration:** 4 weeks

---

### Phase 3: Analysis and Design

**Objective:** To transform requirements into concrete system design and architecture.

**How to Conduct This Phase:**

**Step 1: System Architecture Design (Week 1)**
- Designed three-tier architecture:
  - **Presentation Layer:** React.js with Inertia.js
  - **Application Layer:** Laravel 11.x
  - **Data Layer:** MySQL 8.x
- Created architecture diagram showing component interactions
- Defined API endpoints and data flow
- Specified security layers (authentication, authorization, encryption)

**Step 2: Database Design (Week 2)**
- Created Entity-Relationship Diagram (ERD) with 10 tables:
  1. users
  2. requests
  3. property_locations
  4. zoning_rules
  5. dss_evaluations
  6. evaluation_risk_assessments
  7. risk_factors
  8. reports
  9. notifications
  10. audit_logs
- Established relationships and foreign key constraints
- Normalized database to Third Normal Form (3NF)
- Defined 132 fields across all tables

**Step 3: User Interface Design (Week 2-3)**
- Created wireframes for 25 major screens
- Designed mockups for:
  - Login page
  - Role-specific dashboards (4 variants)
  - 3-step application form wizard
  - Evaluation interface with DSS integration
  - Payment verification module
  - Certificate preview and download
  - Admin user management
  - Analytics and reporting dashboard
- Applied user-centered design principles
- Ensured responsive design for desktop, tablet, and mobile

**Step 4: DSS Evaluation Framework Design (Week 3)**
- Defined 7 evaluation criteria with weights:
  1. Zoning Classification Compatibility (25%)
  2. Land Use Compliance (20%)
  3. Lot Area Requirements (15%)
  4. Building Regulations (15%)
  5. Environmental Considerations (10%)
  6. Risk Assessment (10%)
  7. Infrastructure Availability (5%)
- Designed scoring algorithm: Total Score = Σ(Criterion Score × Weight)
- Defined recommendation rules:
  - Score ≥ 85: Approve
  - Score 70-84: Conditional (requires site inspection)
  - Score < 70: Reject
- Designed risk factor classification system

**Step 5: Security Framework Design (Week 4)**
- Authentication: Laravel Sanctum with bcrypt password hashing
- Authorization: Role-Based Access Control (RBAC) with 4 roles
- Password policy: Minimum 8 characters, mix of uppercase, lowercase, numbers
- Audit logging: All user actions tracked
- Data encryption: HTTPS/TLS for data in transit

**Output:** System Design Document (40 pages) including:
- Architecture diagrams
- Complete database schema
- UI mockups (25 screens)
- DSS algorithm specifications
- Security design

**Duration:** 4 weeks

---

### Phase 4: Development

**Objective:** To implement the designed system through coding and integration.

**How to Conduct This Phase:**

**Step 1: Development Environment Setup (Week 1)**
- Installed Visual Studio Code as primary IDE
- Installed XAMPP (Apache, MySQL, PHP 8.2)
- Created Laravel 11.x project
- Installed Inertia.js and React 18.x
- Configured version control with GitHub
- Set up local development database

**Step 2: Backend Development (Week 2-6)**

**Week 2-3: Core Backend**
- Created database migrations for all 10 tables
- Implemented Eloquent models with relationships
- Developed authentication system (registration, login, password reset)
- Implemented middleware for role-based access control

**Week 4-5: Business Logic**
- Developed controllers:
  - SuperAdminController (user management)
  - AdminController (application management)
  - RequestController (application CRUD)
  - DssController (evaluation logic)
  - NotificationController
  - ProfileController
- Created service classes:
  - DecisionSupportService (DSS algorithm)
  - DashboardCacheService (performance optimization)
  - AuditLogService (activity tracking)
  - ReminderService (scheduled notifications)

**Week 6: Integration**
- Implemented email notification system (10 Mailable classes)
- Created background jobs for PDF generation
- Developed file upload handling
- Implemented search and filtering functionality

**Step 3: Frontend Development (Week 7-10)**

**Week 7-8: Core UI Components**
- Implemented authentication pages (login, register, password reset)
- Developed role-specific layouts and navigation
- Created reusable components (buttons, forms, modals, tables)
- Implemented responsive sidebar navigation

**Week 9: Feature Development**
- 3-step application form with real-time validation
- Application list with status badges
- Payment verification interface
- Certificate preview and download
- Notification center with real-time updates

**Week 10: Admin Features**
- User management (create, update, delete, role assignment)
- Application evaluation interface with DSS recommendations
- Analytics dashboards with charts (Chart.js)
- Report generation (PDF export)
- Audit log viewer

**Step 4: Database Implementation (Ongoing)**
- Executed all database migrations
- Created seeders for:
  - Admin users (1 super_admin, 2 admins, 2 staff)
  - Zoning rules (15 zone classifications)
  - Risk factors (20 factors across 4 categories)
- Configured database indexes for performance
- Tested all relationships and constraints

**Step 5: Integration and Testing (Week 11-12)**
- Connected frontend and backend through Inertia.js
- Integrated DSS service with evaluation interface
- Connected email service with notification triggers
- Integrated file storage system
- Implemented audit logging throughout application
- Performed integration testing on all modules

**Output:** Working system prototype with all core features  
**Duration:** 12 weeks

---

### Phase 5: Testing

**Objective:** To verify system functionality, identify defects, and ensure quality before deployment.

**How to Conduct This Phase:**

**A. Unit Testing (Week 1-2)**

The researchers tested each module independently using prepared test cases.

**Test Modules:**
1. User Registration - Account creation, email verification
2. User Login - Authentication with correct/incorrect credentials
3. Role-Based Access - Proper routing based on user_type
4. Application Submission - Form validation, data storage
5. Document Upload - File validation (size, type), storage, retrieval
6. DSS Evaluation - Score calculation accuracy with sample data
7. Email Notifications - Template rendering, delivery confirmation
8. Dashboard Analytics - Data aggregation accuracy
9. Audit Logging - Action capture completeness
10. Search and Filter - Query accuracy and performance
11. Data Validation - Input sanitization, SQL injection prevention
12. Error Handling - Graceful error responses
13. Security - Password hashing, CSRF protection

**Testing Procedure:**
- Prepared 50 test cases covering all modules
- Executed each test case systematically
- Documented results (Pass/Fail)
- For failures: identified root cause, implemented fix, retested
- Recorded all defects in defect tracking log

**Defects Found and Fixed:**
- Password reset email not sending (Fixed: Configured SMTP settings)
- DSS score calculation error for mixed-use zones (Fixed: Algorithm adjustment)
- File upload failing for files > 5MB (Fixed: Increased upload_max_filesize)
- Dashboard slow with 100+ records (Fixed: Implemented caching)

**Output:** Unit Test Report (15 pages) with test case results  
**Duration:** 2 weeks

---

**B. Alpha Testing (Week 3-4)**

Conducted by the development team in controlled environment with comprehensive test scenarios.

**How to Conduct:**
- Set up testing environment identical to production
- Created test accounts for all user roles
- Prepared 30 test scenarios covering:
  1. Complete application workflow (submission to certificate download)
  2. Multiple concurrent users (10 simultaneous logins)
  3. Edge cases (invalid inputs, missing documents, network interruptions)
  4. Security testing (unauthorized access attempts, SQL injection tests)
  5. Performance testing (response times under load)
  6. Cross-browser compatibility (Chrome, Edge, Firefox, Safari)
  7. Responsive design testing (desktop, tablet, mobile)

**Testing Procedure:**
- Each scenario executed 3 times
- Results documented in test log
- Response times measured and recorded
- Screenshots captured for UI issues
- All defects logged with severity rating (Critical, High, Medium, Low)

**Defects Identified:**
- Critical (2): Fixed immediately
- High (5): Fixed within 48 hours
- Medium (8): Fixed within 1 week
- Low (3): Scheduled for Phase 7

**Output:** Alpha Test Report (20 pages)  
**Duration:** 2 weeks

---

**C. Beta Testing (Week 5-6)**

Real-world testing by actual end-users: 5 CPDO staff and 15 applicants.

**How to Conduct:**

**Week 1: Orientation and Training**
- Day 1: Conducted 2-hour training session at CPDO office
- Demonstrated all system features with live examples
- Distributed printed user manuals (25 pages each)
- Created test accounts for all 20 participants
- Explained feedback form and issue reporting process

**Week 2: Testing Period**
- CPDO Staff Tasks:
  - Process 25 actual pending applications using the system
  - Evaluate applications using DSS
  - Generate 5 different types of reports
  - Verify payments and issue certificates
- Applicant Tasks:
  - Submit 15 new applications online
  - Upload required documents
  - Track application status
  - Download certificates upon approval

**Monitoring:**
- Researchers present on-site 3 days per week
- Observed usage patterns
- Assisted with technical issues
- Collected feedback forms daily

**Feedback Collection:**
- Daily feedback forms (simple issues)
- Exit interviews (30 minutes each, all 20 participants)
- Satisfaction questionnaires (5-point Likert scale)
- Suggestion box for anonymous feedback

**Beta Testing Findings:**

**Positive Feedback:**
- 93% found interface intuitive and easy to use
- Processing time reduced by 45% compared to manual process
- 100% appreciated real-time status tracking
- 87% satisfied with DSS evaluation transparency

**Improvements Needed:**
- Add bulk certificate download feature (Implemented)
- Include more detailed DSS explanation (Implemented)
- Add SMS notifications (Deferred to future version - only email initially)
- Include help tooltips on complex fields (Implemented)

**Output:** Beta Test Report (25 pages) with user satisfaction data  
**Duration:** 2 weeks

**Total Testing Duration:** 6 weeks

---

### Phase 6: Evaluation

**Objective:** To assess system quality using ISO/IEC 25010:2023 standards.

**How to Conduct This Phase:**

**Step 1: Instrument Preparation (Week 1)**
- Developed evaluation questionnaires for 8 quality characteristics
- Each questionnaire contained 8-10 statements
- Used 5-point Likert scale (1=Strongly Disagree, 5=Strongly Agree)
- Validated questionnaires with 3 IT experts
- Pilot-tested with 5 users not included in actual study
- Refined questions based on feedback

**Step 2: Respondent Selection (Week 1)**
- IT Experts: 5 (minimum 5 years experience in software development)
- CPDO Staff: 8 (varying experience levels)
- Applicants: 30 (diverse demographics)
- Total: 43 respondents

**Step 3: System Demonstration (Week 2)**
- Conducted 2-hour demonstration sessions (3 sessions for different groups)
- Provided hands-on access to the system
- Allowed 1 week for independent exploration
- Made researchers available for questions

**Step 4: Data Collection (Week 3)**
- Distributed questionnaires to all 43 respondents
- Provided 5 days for completion
- Collected completed questionnaires
- Conducted follow-up interviews with 10 respondents for clarification

**Step 5: Data Analysis (Week 4)**
- Encoded responses in Excel spreadsheet
- Calculated weighted mean for each quality characteristic
- Interpreted results using Likert scale ranges:
  - 4.21-5.00: Excellent
  - 3.41-4.20: Very Good
  - 2.61-3.40: Fair
  - 1.81-2.60: Poor
  - 1.00-1.80: Very Poor
- Created frequency distribution tables
- Generated charts for visualization

**Quality Characteristics Evaluated:**

1. **Functional Suitability** - Does the system provide all necessary features?
2. **Performance Efficiency** - Does the system respond quickly?
3. **Compatibility** - Does it work across different devices and browsers?
4. **Usability** - Is the interface easy to use?
5. **Reliability** - Does it work consistently without errors?
6. **Security** - Are passwords and data protected?
7. **Maintainability** - Is the code well-organized?
8. **Portability** - Can it be installed in different environments?

**Output:** Evaluation Report (30 pages) with:
- Weighted mean scores for each characteristic
- Frequency distribution tables
- Charts and graphs
- Interpretation and recommendations

**Duration:** 4 weeks

---

### Phase 7: Deployment

**Objective:** To make the system operational at CPDO for actual use.

**How to Conduct This Phase:**

**Step 1: Pre-Deployment Preparation (Week 1)**
- Secured web hosting server (specifications: 4GB RAM, 50GB SSD)
- Configured production environment (Apache, PHP 8.2, MySQL 8.x)
- Obtained SSL certificate for HTTPS (Let's Encrypt)
- Configured domain name and DNS settings
- Conducted final security audit using OWASP guidelines

**Step 2: System Deployment (Week 2)**
- Uploaded application code via FTP/Git
- Executed database migrations on production database
- Configured environment variables (.env file)
- Set up automated backup schedule (daily at 2:00 AM)
- Tested all system connections and integrations
- Verified SSL certificate functionality

**Step 3: User Account Setup (Week 2)**
- Created accounts:
  - 1 Super Administrator (CPDO IT personnel)
  - 2 Administrators (CPDO Head, Assistant Head)
  - 2 Staff (Evaluators)
  - 3 Staff (Processors)
- Configured permissions for each role
- Tested authentication and authorization
- Provided credentials securely

**Step 4: Training Program (Week 3)**
- Conducted 4-hour training sessions (2 sessions)
- Session 1: Admin and Staff (8 participants)
- Session 2: Additional staff and backup personnel (5 participants)
- Training covered:
  - Login and navigation
  - Application processing workflow
  - DSS evaluation interpretation
  - Payment verification
  - Certificate generation
  - Report generation
  - User management (for admins)
  - Troubleshooting common issues
- Provided printed user manuals (30 pages each)
- Conducted hands-on practice with sample applications

**Step 5: Gradual Rollout (Week 4-5)**

**Week 4 (Soft Launch):**
- Started with 5 applications
- Monitored system performance hourly
- Researchers on-site for technical support
- Gathered feedback from staff
- Made minor adjustments

**Week 5 (Progressive Increase):**
- Increased to 15 applications
- Reduced on-site support to half-day
- Continued performance monitoring
- Addressed issues within 24 hours

**Week 6 (Full Deployment):**
- Processed all incoming applications through system
- Remote support available via phone/email
- Weekly check-ins with CPDO staff

**Step 6: Acceptance Sign-Off (Week 6)**
- Conducted final demonstration for CPDO management
- Verified all 25 functional requirements met
- Reviewed system performance metrics
- Obtained formal acceptance letter from CPDO Head
- Transitioned to regular operations
- Provided 3-month technical support commitment

**Output:** 
- Fully operational system deployed at CPDO
- Trained users (13 CPDO personnel)
- User manuals and documentation
- Acceptance certificate from CPDO

**Duration:** 6 weeks

---

**Total Project Duration:** Approximately 8 months (34 weeks)

---

## Requirements

This section outlines the minimum software and hardware requirements for the development and deployment of LandCert.

### Software Requirements

**Table 3.5. Minimum Software Requirements**

| Component | Specification |
|-----------|--------------|
| Browser | Google Chrome, Microsoft Edge, Firefox |
| Text Editor | Visual Studio Code |
| Version Control | GitHub |
| Local Server | XAMPP |
| Programming Language | PHP 8.2, JavaScript (React) |
| CSS Framework | TailwindCSS |
| Backend Framework | Laravel 11.x |
| Database | MySQL 8.x |
| Operating System | Windows 10 or newer |
| Office Suite | Microsoft Office (Word, Excel) |

### Hardware Requirements

**Table 3.6. Minimum Hardware Requirements**

| Component | Specification |
|-----------|--------------|
| Processor | Intel Core i5 or equivalent |
| RAM | 8GB |
| Storage | 256GB SSD |
| Monitor | 15.6" with 1920x1080 resolution |
| Input Devices | Standard keyboard and mouse |
| System Type | 64-bit Operating System |

---

## Research Participants

To gather comprehensive data for the development and evaluation of the LandCert system, the researchers identified three distinct groups of participants, each contributing unique perspectives essential to the study's success. The selection of participants was guided by their direct involvement with or expertise in land certification processes, system development, and software quality assurance.

**Table 3.7. Frequency Distribution of Respondents**

| Respondents | Frequency | Percentage |
|-------------|-----------|------------|
| IT Experts | 5 | 11.63% |
| CPDO Staff | 8 | 18.60% |
| Land Certification Applicants | 30 | 69.77% |
| **TOTAL** | **43** | **100%** |

As shown in Table 3.7, the study involved 43 respondents distributed across three categories, each serving a specific evaluative purpose:

**1. IT Experts (5 respondents - 11.63%)**

IT experts were selected based on their specialized knowledge in web development, database management, system security, and software quality assurance. These professionals possessed a minimum of 5 years of experience in software development and familiarity with ISO/IEC 25010 software quality standards. Their role in the study was to evaluate the LandCert system's technical architecture, code quality, security implementation, database design, and overall adherence to industry best practices and standards.

The IT experts assessed technical aspects that required specialized knowledge, including:
- System architecture and design patterns
- Database normalization and query optimization
- Security implementation (authentication, authorization, encryption)
- Code maintainability and documentation
- Performance efficiency and scalability
- Integration of the Decision Support System
- Geographic Information System (GIS) implementation

**2. CPDO Staff (8 respondents - 18.60%)**

CPDO staff members included administrative personnel, land use evaluators, and application processors who would interact with the system daily in their professional capacity. These participants were selected to represent different roles and experience levels within the CPDO, ranging from 1 year to over 10 years of service. Their practical experience with the current manual land certification process made them invaluable in assessing the system's real-world applicability and workflow efficiency.

CPDO staff evaluated the system from an operational perspective, focusing on:
- Practical utility for daily tasks
- Workflow efficiency and process automation
- Decision Support System effectiveness and accuracy
- Ease of application review and evaluation
- Document management capabilities
- Report generation functionality
- Alignment with actual CPDO procedures and regulations

**3. Land Certification Applicants (30 respondents - 69.77%)**

Applicants represented the primary end-users who would utilize the system to submit land certification requests. This group included property owners, business entrepreneurs, developers, and authorized representatives who had previous experience with the land certification process at CPDO. The researchers ensured diversity in this group by including participants with varying demographic characteristics (age groups from 25-65 years, different educational backgrounds from high school to post-graduate, and varying levels of computer literacy from basic to advanced).

Applicants evaluated the system from a citizen-centric perspective, assessing:
- Ease of use and user-friendliness
- Convenience compared to the manual process
- Clarity of instructions and guidance
- Transparency of application status tracking
- Overall satisfaction with the online service delivery
- Accessibility and navigation
- Time savings and reduced office visits

### Sampling Technique

The respondents were selected using a **non-probability purposive sampling technique**, also known as judgmental or selective sampling. According to Etikan, Musa, and Alkassim (2023), purposive sampling is a deliberate choice of participants based on the qualities they possess and their relevance to the research objectives. This technique was deemed appropriate for the study because it allowed the researchers to select individuals who possessed specific characteristics, expertise, or experiences that were directly relevant to evaluating the LandCert system.

The purposive sampling approach ensured that:
- IT experts had verifiable technical expertise and experience
- CPDO staff had direct knowledge of land certification procedures
- Applicants had actual experience with the current manual process
- Participants could provide informed, meaningful feedback
- All stakeholder perspectives were adequately represented

**Selection Criteria:**

**For IT Experts:**
- Minimum 5 years of professional experience in software development
- Expertise in web application development (preferably using Laravel and React)
- Knowledge of database design and management
- Familiarity with software quality standards (ISO/IEC 25010 or similar)
- Experience in system security implementation

**For CPDO Staff:**
- Currently employed at CPDO Ilagan City
- Direct involvement in land certification processes
- Representation of different roles (evaluators, processors, administrators)
- Varying experience levels (1-3 years, 4-7 years, 8+ years)
- Willingness to participate in training and system testing

**For Applicants:**
- Previous experience with land certification application at CPDO
- Diverse age groups (25-65 years old)
- Varying educational backgrounds (high school to post-graduate)
- Different levels of computer literacy (basic, intermediate, advanced)
- Availability for system testing and evaluation period

The purposive sampling approach, while non-random, was justified by the study's need for participants who could provide expert judgment and informed evaluation of specific system features and quality characteristics.

---

## Data Gathering Procedure

The data gathering procedure outlines the systematic methods employed by the researchers to collect information necessary for developing the LandCert system. The procedure was conducted in alignment with Phase 2 (Requirements Gathering) of the Iterative Development Model and followed ethical research practices with proper permissions from CPDO officials.

### Preliminary Permissions and Access

The researchers formally requested permission from the City Planning and Development Office through an official letter of request approved by the university thesis adviser. The letter outlined the study's objectives, scope, and expected outcomes. Upon approval, the researchers were granted access to:

1. CPDO office premises during regular office hours
2. Relevant documents and records (with confidentiality protocols)
3. Staff members for interviews and consultation
4. Current manual processes and workflows
5. Historical application records (anonymized for research purposes)

The researchers maintained professional conduct throughout the data gathering process, adhering to the office's rules and regulations and respecting the confidentiality of sensitive information.

### Data Collection Methods

The researchers employed three primary data collection methods to ensure comprehensive understanding of stakeholder needs and system requirements: interviews, questionnaires, and direct observation.

#### A. Interviews

The researchers conducted semi-structured interviews with three stakeholder groups to gather in-depth insights about current processes and system expectations.

**Interview Questions for CPDO Staff** (45-60 minutes per participant):

1. What are the main challenges you face in the current land certification process?
2. How many applications do you process monthly on average?
3. What documents do applicants typically submit?
4. How do you currently evaluate applications against zoning regulations?
5. What information do you need to make evaluation decisions?
6. How long does it typically take to evaluate one application?
7. How do you track application status?
8. What are the common reasons for application rejection?
9. How do you verify payments?
10. What reports do you need to generate regularly?
11. What features would you like to see in an automated system?
12. What concerns do you have about transitioning to a digital system?

**Interview Questions for Applicants** (20-30 minutes per participant):

1. How many times did you visit the CPDO office to complete your application?
2. What difficulties did you encounter during the application process?
3. How long did it take from submission to receiving your certificate?
4. Were you able to track your application status? How?
5. What information was unclear or confusing in the application process?
6. How did you receive updates about your application?
7. Would you prefer to submit applications online? Why or why not?
8. What features would make the application process more convenient for you?
9. How comfortable are you with using online systems?
10. What device do you primarily use to access the internet?

**Interview Questions for IT Experts** (60-90 minutes per expert):

1. What technology stack would you recommend for this type of system?
2. What security measures are essential for government systems?
3. How should user authentication and authorization be implemented?
4. What database design best practices should be followed?
5. How can we ensure system performance with multiple concurrent users?
6. What backup and recovery strategies do you recommend?
7. How should the Decision Support System be architected?
8. What testing approaches are most effective for web applications?
9. What documentation is essential for long-term maintainability?
10. What potential technical challenges should we anticipate?

Interviews were conducted face-to-face at CPDO office or designated meeting rooms. Responses were documented through written notes with participants' permission, and audio recording was used when consented.

#### B. Questionnaires

The researchers developed structured questionnaires to gather quantitative data from larger samples of CPDO staff and applicants.

**Questionnaire for CPDO Staff** included four sections:

**Section A: Demographic Information**
- Position/role
- Years of experience in CPDO
- Primary responsibilities

**Section B: Current Process Evaluation** (5-point Likert scale: 1=Very Difficult, 5=Very Easy)
1. Ease of recording applicant information
2. Ease of tracking application status
3. Ease of retrieving historical records
4. Efficiency of evaluation process
5. Clarity of zoning regulations during evaluation
6. Ease of payment verification
7. Efficiency of certificate preparation

**Section C: System Requirements** (5-point Likert scale: 1=Not Important, 5=Very Important)
1. Online application submission
2. Automated application routing
3. Decision Support System for evaluation
4. Digital document storage
5. Payment tracking
6. Automated certificate generation
7. Email/SMS notifications
8. Analytics and reporting
9. Audit trail logging

**Section D: Open-Ended Questions**
1. What features are most critical for your daily work?
2. What concerns do you have about system implementation?

**Questionnaire for Applicants** included four sections:

**Section A: Demographic Information**
- Age
- Highest educational attainment
- Occupation
- Type of application (TUP/SUP/Zoning Clearance)

**Section B: Current Experience Evaluation** (5-point Likert scale: 1=Very Dissatisfied, 5=Very Satisfied)
1. Clarity of application requirements
2. Ease of document submission
3. Convenience of office hours
4. Staff assistance and support
5. Transparency of process
6. Communication about application status
7. Overall service experience

**Section C: Digital System Preferences**
1. Do you have internet access at home/work? (Yes/No)
2. What device do you primarily use? (Desktop/Laptop/Smartphone/Tablet)
3. How comfortable are you with online forms? (1-5 scale)
4. Would you prefer online application submission? (Yes/No/Maybe)
5. What features would make the process more convenient?

**Section D: Technology Access**
- Internet access availability
- Devices available (computer, smartphone, tablet)
- Frequency of internet use
- Digital literacy level

**Distribution Method:**
- Hard copy questionnaires distributed to CPDO staff during work hours
- Questionnaires distributed to applicants at CPDO office during submission or claiming
- Collection completed after 1-2 weeks
- Anonymous responses to encourage honest feedback

#### C. Direct Observation

The researchers conducted direct observation of CPDO operations over five working days spread over 2-3 weeks during regular office hours (8:00 AM - 5:00 PM) to document actual workflows, identify pain points not mentioned in interviews, and measure time spent on various tasks.

**Observation Checklist:**
1. Application receiving process
2. Document verification procedures
3. Evaluation procedures
4. Payment verification steps
5. Certificate preparation and release
6. Time spent per task
7. Staff interactions and coordination
8. Common errors or issues encountered

**Observation Focus Areas:**
- How applicants submit documents
- Staff initial review and logging process
- Document completeness checking
- Queuing and waiting times
- How staff access zoning rules and regulations
- Property location verification methods
- Manual calculations or assessments
- Reference materials used
- Communication between staff members
- Decision-making and documentation process
- Filing system organization
- Record retrieval methods

Observations were documented through detailed field notes, process flow diagrams, time-motion studies (time spent on each task), and interaction frequency tallies. All observation activities were conducted with CPDO management approval and without disrupting office operations.

### Data Analysis Methods

**Qualitative Data Analysis:**

For interview transcripts and observation notes, the researchers employed:
1. Thematic analysis to identify recurring themes
2. Categorization of responses by stakeholder group
3. Pain point mapping
4. Requirements extraction
5. Process mapping and workflow documentation
6. Time-motion analysis
7. Bottleneck identification

**Quantitative Data Analysis:**

For questionnaire responses, the researchers used:
1. Descriptive statistics (mean, median, mode, standard deviation)
2. Frequency distribution tables
3. Percentage calculations
4. Likert scale interpretation using weighted mean formula
5. Comparative analysis between stakeholder groups

Statistical tools used included Microsoft Excel for basic calculations and Google Sheets for data organization.

### Ethical Considerations

Throughout the data gathering process, the researchers adhered to the following ethical principles:

1. **Informed Consent** - All participants were informed of the study's purpose; voluntary participation was emphasized; consent forms were obtained where required.

2. **Confidentiality** - Personal information was kept confidential; anonymity was ensured in reporting results; sensitive data was handled with appropriate security.

3. **Respect for Participants** - Interviews were scheduled at participants' convenience; no disruption to office operations; right to withdraw participation at any time.

4. **Data Security** - Physical questionnaires stored securely; digital data password-protected; access limited to research team.

5. **Intellectual Property** - Proper attribution of ideas and suggestions; acknowledgment of stakeholder contributions; no misrepresentation of data.

The systematic data gathering procedure ensured comprehensive understanding of stakeholder needs, current process limitations, and system requirements, forming the foundation for the design and development of the LandCert system.

---

## Research Instrument

The researchers used questionnaires as the primary research instrument for evaluating the LandCert system. Three types of questionnaires were developed corresponding to the three respondent groups.

---

### A. Questionnaire for IT Experts

**ISO/IEC 25010:2023 Technical Evaluation Questionnaire**

**Instructions:** Please rate each statement using the following scale:
- 5 = Strongly Agree
- 4 = Agree
- 3 = Neutral
- 2 = Disagree
- 1 = Strongly Disagree

**Section I: Functional Suitability**

1. The system provides all necessary features for land certification management.
2. All system functions work correctly without errors.
3. The Decision Support System provides accurate evaluation recommendations.
4. The system meets the specific needs of CPDO operations.
5. All functional requirements are properly implemented.

**Section II: Performance Efficiency**

1. The system responds quickly to user actions (page loads within 3 seconds).
2. The system can handle multiple concurrent users without performance degradation.
3. Database queries execute efficiently.
4. File uploads and downloads process at acceptable speeds.
5. The system uses resources (memory, CPU) efficiently.

**Section III: Compatibility**

1. The system works correctly across different web browsers (Chrome, Edge, Firefox).
2. The system is accessible from different devices (desktop, laptop, tablet, smartphone).
3. The system integrates well with existing CPDO infrastructure.
4. The system can export data in standard formats (PDF, Excel).

**Section IV: Security**

1. User authentication is properly implemented and secure.
2. Password storage uses industry-standard encryption (bcrypt).
3. Role-based access control effectively restricts unauthorized access.
4. The system is protected against common vulnerabilities (SQL injection, XSS, CSRF).
5. Audit logs comprehensively track all user activities.
6. HTTPS/TLS encryption is properly configured.

**Section V: Reliability**

1. The system operates consistently without crashes or failures.
2. Error handling is implemented gracefully without exposing sensitive information.
3. Data integrity is maintained across all operations.
4. The system recovers properly from unexpected interruptions.

**Section VI: Maintainability**

1. The source code is well-organized and follows coding standards.
2. The code is properly commented and documented.
3. The system architecture is modular and easy to understand.
4. Database design follows normalization principles.
5. The system can be easily updated or modified.

**Section VII: Usability (from technical perspective)**

1. The user interface follows established design patterns.
2. Error messages are clear and informative.
3. The system provides appropriate feedback for user actions.
4. Navigation is intuitive and consistent.

**Section VIII: Portability**

1. The system can be deployed on different servers with minimal configuration.
2. The system dependencies are clearly documented.
3. The system is scalable for future growth.

**Open-Ended Questions:**

1. What are the system's major strengths from a technical perspective?
2. What technical improvements would you recommend?
3. Are there any security concerns that need to be addressed?

---

### B. Questionnaire for CPDO Staff

**LandCert System Usability and Functionality Evaluation**

**Instructions:** Please rate each statement using the following scale:
- 5 = Strongly Agree
- 4 = Agree
- 3 = Neutral
- 2 = Disagree
- 1 = Strongly Disagree

**Section I: Demographic Information**

1. Position/Role: ________________
2. Years of experience in CPDO: ________________
3. Primary responsibilities: ________________

**Section II: Functional Suitability**

1. The system provides all features I need for my daily work.
2. The application processing module meets CPDO workflow requirements.
3. The Decision Support System helps me evaluate applications more accurately.
4. The payment verification feature works as expected.
5. The report generation feature provides the information I need.
6. The certificate generation feature is accurate and reliable.

**Section III: Usability**

1. The system interface is easy to navigate.
2. Instructions and labels are clear and understandable.
3. I can accomplish my tasks quickly using this system.
4. The system is easy to learn even without extensive training.
5. The dashboard provides a clear overview of my work.
6. The search and filter functions help me find information quickly.

**Section IV: Performance**

1. The system responds quickly when I click buttons or submit forms.
2. Pages load fast enough for efficient work.
3. I can process more applications per day using this system compared to the manual process.

**Section V: Reliability**

1. The system works consistently without errors.
2. I trust the system to store and retrieve data accurately.
3. The system is available when I need to use it.

**Section VI: Workflow Improvement**

1. The system has reduced the time needed to process applications.
2. The system has reduced the number of errors in application processing.
3. The system makes it easier to track application status.
4. The system improves communication with applicants through notifications.
5. The online system is better than the manual process.

**Section VII: Decision Support System**

1. The DSS evaluation scores are accurate and helpful.
2. The DSS recommendations align with my professional judgment.
3. The DSS explanations are clear and understandable.
4. The DSS has improved the consistency of evaluations.

**Section VIII: Overall Satisfaction**

1. I am satisfied with the overall performance of the system.
2. I would recommend this system to other CPDO offices.
3. The system meets my expectations.

**Open-Ended Questions:**

1. What features do you find most useful in your daily work?
2. What improvements would make the system more helpful?
3. What challenges have you encountered while using the system?

---

### C. Questionnaire for Applicants

**LandCert User Experience Evaluation**

**Instructions:** Please rate each statement using the following scale:
- 5 = Strongly Agree
- 4 = Agree
- 3 = Neutral
- 2 = Disagree
- 1 = Strongly Disagree

**Section I: Demographic Information**

1. Age: ________________
2. Highest educational attainment: ________________
3. Occupation: ________________
4. Type of application: TUP / SUP / Zoning Clearance / Other: ________________
5. Computer literacy level: Beginner / Intermediate / Advanced

**Section II: Usability**

1. The system is easy to use.
2. The registration process is simple and straightforward.
3. The application form is easy to understand and complete.
4. Instructions and guidance are clear throughout the process.
5. The system is easy to navigate.
6. I can use the system without technical assistance.

**Section III: Functional Suitability**

1. The system allows me to submit my application conveniently.
2. The document upload feature works properly.
3. I can track my application status easily.
4. The notification system keeps me informed about my application.
5. Downloading my certificate is simple and works correctly.

**Section IV: Convenience and Efficiency**

1. The online system is more convenient than visiting the CPDO office multiple times.
2. The system saves me time compared to the manual process.
3. I can access the system anytime I need to check my application status.
4. The online application process is faster than the manual process.

**Section V: Transparency**

1. The system clearly shows the status of my application at each stage.
2. I understand why my application was approved or requires additional requirements.
3. The processing timeline is clear and reasonable.
4. The system provides adequate information about requirements and procedures.

**Section VI: Accessibility**

1. I can access the system from my preferred device (computer, tablet, smartphone).
2. The system works well on my internet connection.
3. The system is available when I need to use it.

**Section VII: Overall Satisfaction**

1. I am satisfied with my experience using the LandCert system.
2. The online system improves the land certification application process.
3. I would recommend this system to others who need land certification.
4. I prefer using this online system over the manual process.

**Section VIII: Preferences**

1. Do you have internet access at home or work? Yes / No
2. What device did you primarily use to access the system?
   - Desktop Computer
   - Laptop
   - Tablet
   - Smartphone
3. How many times did you need to visit the CPDO office (excluding document submission if required)?
   - 0 times
   - 1 time
   - 2 times
   - 3 or more times

**Open-Ended Questions:**

1. What did you like most about the LandCert system?
2. What features would make the system more convenient for you?
3. Did you encounter any difficulties while using the system? Please describe.

---

**Questionnaire Validation**

All three questionnaires were validated through the following process:

1. **Expert Validation** - Reviewed by 3 IT experts with expertise in software quality assurance to ensure alignment with ISO/IEC 25010:2023 standards.

2. **Content Validation** - Reviewed by thesis adviser and one CPDO staff member to ensure questions are relevant and understandable.

3. **Pilot Testing** - Administered to 5 individuals not included in the actual study (2 IT professionals, 2 office workers, 1 applicant) to test clarity and comprehension.

4. **Refinement** - Questions were revised based on feedback from pilot testing to improve clarity and remove ambiguity.

---

## Statistical Treatment

The researchers used the weighted mean to measure participants' responses using a 5-point Likert scale.

**Table 3.4. Likert Scale Interpretation for System Evaluation**

| Numerical Scale | Range | Interpretation |
|-----------------|-------|----------------|
| 5 | 4.21 – 5.00 | Excellent |
| 4 | 3.41 – 4.20 | Very Good |
| 3 | 2.61 – 3.40 | Fair |
| 2 | 1.81 – 2.60 | Poor |
| 1 | 1.00 – 1.80 | Very Poor |

### Weighted Mean Formula

In finding the weighted mean, the researchers used the following formula:

```
        ∑(f × x)
X̄ = ─────────
          N
```

**Where:**
- **X̄** - Weighted Mean
- **f** - Number of respondents (frequency)
- **x** - Rating value
- **N** - Total number of respondents
- **Σ** – Summation

This formula allowed the researchers to calculate the average rating for each system quality characteristic, weighted by the number of respondents who provided each rating, ensuring accurate representation of collective user perception and satisfaction with the LandCert system.

---

**END OF CHAPTER III - METHODOLOGY**
