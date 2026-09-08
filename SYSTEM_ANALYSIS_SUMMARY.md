# CPDO LC System - Analysis Summary

## 📊 System Overview

**System Name:** CPDO Locational Clearance System (CPDO LC)  
**Purpose:** Digital platform for managing locational clearance applications  
**Location:** City Planning and Development Office, City of Ilagan, Isabela  
**Status:** Production v1.0

---

## 👥 System Actors

### 1. **Applicant** (Citizen/Business)
- **Count:** Unlimited
- **Role:** Submit and track locational clearance applications
- **Access Level:** Limited to own applications

### 2. **Admin** (Zoning Officer)
- **Count:** 4 officers (Mary Jane Bulauan, Jeffrey Paguig, Kay Aggarao, April Cuntapay)
- **Role:** Review applications, verify documents, generate certificates
- **Access Level:** All applications, cannot approve

### 3. **Super Admin** (Zoning Administrator)
- **Count:** 1 (Engr. Crisanta D. Concepcion, EnP)
- **Role:** Final approval authority, system administration
- **Access Level:** Full system access

### 4. **System** (Automated)
- **Role:** Send notifications, schedule tasks, log activities
- **Access Level:** Backend processes

---

## 🎯 Core Use Cases (60 Total)

### Applicant Use Cases (20)
| Category | Use Cases | Count |
|----------|-----------|-------|
| **Application** | Submit, Edit, View, Track, Download | 7 |
| **Payment** | View Order, Upload Receipt, Check Status | 4 |
| **Certificate** | Download, Print, View Status | 4 |
| **Profile** | Update Info, Change Password, Upload Avatar | 3 |
| **Notifications** | Email, SMS, View History | 3 |

### Admin Use Cases (24)
| Category | Use Cases | Count |
|----------|-----------|-------|
| **Review** | View All, Search, Review Details, Verify Docs, Evaluate | 7 |
| **Certificate** | Generate, Preview, Fill Details, Mark Ready, Release | 6 |
| **Payment** | View, Record, Verify Receipt | 4 |
| **Reports** | Dashboard, Export Apps, Export Payments, Generate Reports | 4 |
| **Shared** | Login, Profile, Password | 3 |

### Super Admin Use Cases (16)
| Category | Use Cases | Count |
|----------|-----------|-------|
| **Approval** | Review, Approve, Reject, Return, One-Step Decide | 5 |
| **User Mgmt** | View Users, Create Admin, Edit, Deactivate | 4 |
| **SMS** | Broadcast, Manage Templates, View History | 3 |
| **System** | Audit Logs, Export Logs, Settings, Signatures | 4 |

### System Automated Use Cases (6)
- Send Auto Email Notifications
- Send Auto SMS Notifications
- Send Payment Reminders (Scheduled)
- Log System Activities (All actions)
- Generate Application Numbers (Auto-increment)
- Cache Dashboard Analytics (Performance)

---

## 📋 Application Workflow

```
1. Applicant Submits (4-step form)
   ↓
2. System Generates Application Number (auto)
   ↓
3. Admin Reviews & Verifies Documents
   ↓
4. Admin Evaluates & Sets Payment Amount
   ↓
5. Admin Submits for Approval
   ↓
6. Super Admin Reviews
   ↓
   ├─ Approve → Email/SMS sent
   ├─ Reject → With reason
   └─ Return → Back to Admin
   ↓
7. Applicant Pays at Treasury Office
   ↓
8. Applicant Uploads Official Receipt
   ↓
9. Admin Verifies Payment
   ↓
10. Admin Generates Certificate/Clearance
   ↓
11. Admin Fills Additional Details
   ↓
12. Admin Marks Certificate Ready
   ↓
13. Applicant Picks Up Certificate
   ↓
14. Admin Records Release
   ↓
15. Complete ✓
```

---

## 📄 Certificate Types

| Type | Full Name | Purpose |
|------|-----------|---------|
| **CZ** | Zoning Certification | Certify land use/zoning classification |
| **CZC** | Zoning Clearance | Clearance for construction/business |
| **TUP** | Temporary Use Permit | Temporary use authorization |
| **SUP** | Special Use Permit | Special/conditional use authorization |

---

## 📊 Database Structure

### Core Tables (31 total)
1. **users** - All system users (applicants, admins)
2. **requests** - Applications (main table)
3. **normalized_projects** - Project details
4. **properties** - Property information
5. **locations** - Location data
6. **applicants** - Applicant profiles
7. **representatives** - Authorized representatives
8. **requirement_documents** - Uploaded documents
9. **reports** - Admin evaluations
10. **payments** - Payment records
11. **certificates** - Issued certificates
12. **notifications** - User notifications
13. **audit_logs** - System activity log
14. **sms_templates** - SMS message templates
15. **request_timeline** - Status history (NEW)
16. **system_settings** - Configurable settings (NEW)
17. **dashboard_analytics** - Cached metrics (NEW)
18. **roles** - User roles
19. **permissions** - Access control
20. **sessions** - Active sessions

---

## 🔔 Notification System

### Email Notifications (12 events)
1. Application Submitted
2. Application Under Review
3. Application Approved
4. Application Rejected
5. Payment Verified
6. Payment Rejected
7. Certificate Preparing
8. Certificate Ready for Pickup
9. Certificate Released
10. Payment Reminder (7, 3, 1 days before)
11. Requirements Submitted
12. Status Changed

### SMS Notifications (Same 12 events)
- Provider: Semaphore API
- Sender Name: CPDOLC
- Character Limit: 160 per message
- Branding: "CPDO LC"

---

## 📈 System Statistics

### Performance Optimizations
- **Composite Indexes:** 7 indexes added
- **Query Speed:** 3x faster (120ms → 2ms)
- **Dashboard Load:** Pre-computed analytics
- **Cache Strategy:** Config, routes, views cached

### Database Health
- ✅ Zero critical issues
- ✅ Fully normalized (3NF)
- ✅ All foreign keys intact
- ✅ Soft deletes enabled
- ✅ Complete audit trail

---

## 🔒 Security Features

### Authentication
- Session timeout: 15 minutes idle
- Expire on close: Yes
- Password: bcrypt hashed
- Email verification: Required

### Authorization
- Role-based access control (RBAC)
- Middleware protection
- CSRF protection
- XSS prevention
- SQL injection prevention

### Audit Trail
- All actions logged
- User/timestamp recorded
- IP address captured
- Exportable logs
- 90-day retention (configurable)

---

## 📱 Integration Points

### External Services
1. **Email:** Hostinger SMTP (smtp.hostinger.com:587)
2. **SMS:** Semaphore API (https://api.semaphore.co/)
3. **Storage:** Local file system + symlinks
4. **Database:** MySQL (Hostinger)

### Internal Services
1. **Notifications:** NotificationService
2. **SMS:** SmsService
3. **Payment:** PaymentService
4. **Audit:** AuditLogService
5. **Dashboard:** DashboardCacheService

---

## 🎨 User Interface

### Applicant Portal
- Dashboard with application cards
- 4-step application form
- Document upload interface
- Payment receipt upload
- Certificate download
- Notification center

### Admin Panel
- Application list with filters
- Document verification page
- Certificate generation wizard
- Payment verification
- Dashboard statistics
- Report exports

### Super Admin Panel
- All Admin features plus:
- User management
- SMS broadcast
- Audit logs
- System settings
- Signature management

---

## 📋 Application Requirements

### Required Documents
1. Tax Declaration/Tax Receipt
2. Transfer Certificate of Title (TCT) or Certified True Copy
3. Location Map/Vicinity Map
4. Lot Plan/Survey Plan
5. Building Plans (if applicable)
6. Business Permit (for business applications)
7. Authorization Letter (if representative)
8. Valid Government ID
9. Notarized Application Form
10. Additional requirements (project-specific)

---

## 💰 Payment Process

### Flow
1. Application approved by Super Admin
2. System generates Order of Payment
3. Applicant pays at City Treasury Office
4. Applicant uploads Official Receipt (OR)
5. Admin verifies payment
6. Status changes to "Payment Verified"
7. Certificate preparation begins

### Payment Methods
- Cash payment at Treasury Office
- No online payment (manual verification)

---

## 📊 Reports & Analytics

### Available Reports
1. **Applications Report**
   - By status (Pending, Approved, etc.)
   - By type (CZ, CZC, TUP, SUP)
   - By date range
   - By project nature (Residential, Commercial)

2. **Payment Report**
   - Total collected
   - By date range
   - By status (Verified, Pending)

3. **Certificate Report**
   - Issued count
   - By type
   - By date range

4. **User Activity Report**
   - Login history
   - Actions performed
   - Audit trail

### Export Formats
- Excel/CSV
- PDF (certificates/clearances)
- Printable forms

---

## 🔧 System Configuration

### Configurable Settings (10)
1. Payment deadline days (default: 30)
2. Certificate expiry months (default: 12)
3. Reminder days (default: 7,3,1)
4. Office hours
5. Contact email
6. Contact phone
7. Max file size (default: 10MB)
8. Allowed file types (pdf,jpg,jpeg,png)
9. Maintenance mode
10. Maintenance message

---

## 🚀 Deployment Architecture

### Technology Stack
- **Backend:** Laravel 10 (PHP 8.1+)
- **Frontend:** React 18 + Inertia.js
- **Database:** MySQL 5.7+
- **Server:** Hostinger (Apache/LiteSpeed)
- **Styling:** Tailwind CSS
- **Build:** Vite

### Production Environment
- **Domain:** cityofilaganzoningadministration.online
- **Hosting:** Hostinger Business Plan
- **SSL:** Let's Encrypt (Free)
- **PHP Version:** 8.1+
- **Node Version:** 18+

---

## 📅 System Statistics (As of Sept 2026)

### Migrations
- Total: 95+ migration files
- Latest: September 3, 2026
- Status: All executed ✓

### Code Files
- PHP Files: ~150 files
- React Components: ~80 components
- Routes: ~200 routes
- Controllers: 10 controllers
- Models: 15+ models
- Services: 6 services

### Database
- Tables: 31
- Indexes: 60+ indexes
- Foreign Keys: 25+ relationships
- Records: Variable (production data)

---

## 🎓 User Training

### Applicant Training Topics
1. Account creation/login
2. Submitting applications
3. Uploading documents
4. Making payments
5. Tracking status
6. Downloading certificates

### Admin Training Topics
1. Reviewing applications
2. Document verification
3. Setting payment amounts
4. Generating certificates
5. Recording releases
6. Using reports

### Super Admin Training Topics
1. Approving applications
2. User management
3. SMS broadcasting
4. System configuration
5. Audit log review

---

## 📞 Support & Maintenance

### Contacts
- **System Admin:** crisanta@cpdo.com
- **CPDO Office:** cpdo@ilagan.gov.ph
- **Phone:** (078) 123-4567
- **Hours:** Mon-Fri, 8:00 AM - 5:00 PM

### Maintenance Schedule
- **Daily:** Log monitoring
- **Weekly:** Backup verification
- **Monthly:** Performance review
- **Quarterly:** Security audit

---

## 📝 Documentation Files

1. **USE_CASE_DIAGRAM.md** - Detailed use case descriptions
2. **use-case-diagram.puml** - PlantUML diagram source
3. **SYSTEM_ANALYSIS_SUMMARY.md** - This file
4. **HOSTINGER_DEPLOYMENT_GUIDE.md** - Deployment instructions
5. **DATABASE_IMPROVEMENTS_SUMMARY.md** - Database documentation
6. **API documentation** - (To be created)

---

**Generated:** September 3, 2026  
**Version:** 1.0 Production  
**Status:** ✅ Active and Deployed
