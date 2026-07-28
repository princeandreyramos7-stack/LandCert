# Complete Database Structure - LandCert System
## Physical Payment & Certificate Workflow

---

## 🗄️ Complete Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER MANAGEMENT TABLES                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)            │
│ name               │
│ email              │
│ password           │
│ user_type          │──┐ (super_admin, admin, staff, applicant)
│ contact_number     │  │
│ address            │  │
│ email_verified_at  │  │
│ timestamps         │  │
└─────────────────────┘  │
                         │
                         │
┌────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION CORE TABLES                                │
└────────────────────────────────────────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼─────────────────────────┐
│            requests (NEW SYSTEM)                 │
├──────────────────────────────────────────────────┤
│ id (PK)                                         │
│ user_id (FK → users.id) ◄───────────────────────┘
│ status                                           │
│ applicant_name                                   │
│ corporation_name                                 │
│ applicant_address                                │
│ corporation_address                              │
│ authorized_representative_name                   │
│ authorized_representative_address                │
│ project_type                                     │
│ project_nature                                   │
│ project_location_* (number, street, barangay...) │
│ project_area_sqm, lot_area_sqm                  │
│ bldg_improvement_sqm                            │
│ project_cost                                     │
│ existing_land_use                                │
│ has_written_notice                               │
│ has_similar_application                          │
│ preferred_release_mode                           │
│ timestamps                                       │
└──────────────────┬───────────────────────────────┘
                   │
                   │ Links to legacy structure ↓
                   │
┌──────────────────▼───────────────────────────────┐
│         applications (LEGACY)                    │
├──────────────────────────────────────────────────┤
│ id (PK)                                         │
│ corp_id (FK → corporations.id) ────┐            │
│ project_id (FK → projects.id) ─────┼────┐       │
│ applicant_name                      │    │       │
│ applicant_address                   │    │       │
│ authorized_representative           │    │       │
│ representative_address              │    │       │
│ authorization_letter_path           │    │       │
│ preffered_release                   │    │       │
│ timestamps                          │    │       │
└─────────────────────────────────────┼────┼───────┘
                                      │    │
┌─────────────────────────────────────▼──┐ │
│        corporations                    │ │
├────────────────────────────────────────┤ │
│ id (PK)                               │ │
│ corporation_name                      │ │
│ corporation_address                   │ │
│ timestamps                            │ │
└───────────────────────────────────────┘ │
                                          │
┌─────────────────────────────────────────▼────────────┐
│              projects (to be refactored)             │
├──────────────────────────────────────────────────────┤
│ id (PK)                                             │
│ location (text)                                     │
│ lot (should be numeric)                             │
│ bldg_improvement (should be numeric)                │
│ right_over_land                                     │
│ nature                                              │
│ existing_land_use                                   │
│ cost                                                │
│ question_1, if_yes_a, if_yes_b ──┐ Move to new     │
│ question_b, if_yes_c, if_yes_d ──┘ land_use table  │
│ timestamps                                          │
└─────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED NEW TABLES (Phase 1)                         │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│      land_use_information (NEW) ✨        │
├────────────────────────────────────────────┤
│ land_use_id (PK)                          │
│ application_id (FK → applications.id) ◄────┐
│ existing_land_use                          │
│ written_notice (yes/no)                    │
│ notice_officer_name                        │
│ notice_dates                               │
│ similar_application (yes/no)               │
│ similar_application_offices                │
│ similar_application_dates                  │
│ timestamps                                 │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│      document_types (NEW) ✨              │
├────────────────────────────────────────────┤
│ document_type_id (PK)                     │
│ document_name (UNIQUE)                    │
│ description                               │
│ is_required (boolean)                     │
│ max_file_size (KB)                        │
│ allowed_extensions                        │
│ is_active (boolean)                       │
│ timestamps                                │
└──────────┬─────────────────────────────────┘
           │
           │
┌──────────▼─────────────────────────────────┐
│    uploaded_documents (NEW) ✨            │
├────────────────────────────────────────────┤
│ document_id (PK)                          │
│ application_id (FK → applications.id) ◄────┤
│ document_type_id (FK → document_types)  ◄──┘
│ file_path                                  │
│ file_name                                  │
│ file_size                                  │
│ mime_type                                  │
│ uploaded_by (FK → users.id)               │
│ uploaded_at                                │
└────────────────────────────────────────────┘

Examples:
- Authorization Letter
- Proof of Ownership
- Site Plan
- Tax Declaration
- Building Permit
- Environmental Clearance
- Barangay Clearance
- Location Plan


┌────────────────────────────────────────────────────────────────────────────┐
│                     EVALUATION & APPROVAL WORKFLOW                          │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│         evaluations (NEW) ✨              │
├────────────────────────────────────────────┤
│ evaluation_id (PK)                        │
│ application_id (FK → applications.id) ◄────┐
│ staff_id (FK → users.id)                   │
│ recommendation (approve/reject/revise)     │
│ remarks (TEXT)                             │
│ evaluation_date                            │
└────────────────────────────────────────────┘
           │
           │ Multiple evaluations possible
           │ (review cycles, revisions)
           ▼
┌────────────────────────────────────────────┐
│           reports (EXISTING) ✅           │
├────────────────────────────────────────────┤
│ id (PK)                                   │
│ app_id (FK → applications.id) ◄────────────┘
│ description                                │
│ amount                                     │
│ evaluation (pending/approved/rejected)     │
│ date_certified                             │
│ issued_by (FK → users.id)                 │
│ date_reported                              │
│ timestamps                                 │
└────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────┐
│                  PAYMENT TRACKING (Physical Process)                        │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│         payments (EXISTING) ✅            │
├────────────────────────────────────────────┤
│ id (PK)                                   │
│ request_id (FK → requests.id)             │
│ application_id (FK → applications.id) ◄────┐
│ amount                                     │
│ payment_method (cash, bank_transfer...)   │
│ receipt_number ✅ (Treasury receipt)      │
│ receipt_file_path (deprecated)             │
│ payment_date ✅                           │
│ payment_status (pending/verified/rejected) │
│ verified_by ✅ (Staff who confirmed)      │
│ verified_at                                │
│ rejection_reason                           │
│ notes ✅ (Remarks)                        │
│ timestamps                                 │
└────────────────────────────────────────────┘

** Perfect for Physical Payment Tracking **
- Staff records treasury receipt number
- Staff confirms payment date
- Staff adds remarks/notes
- Full audit trail maintained


┌────────────────────────────────────────────────────────────────────────────┐
│               CERTIFICATE MANAGEMENT (Physical Process)                     │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│       certificates (EXISTING) ✅          │
├────────────────────────────────────────────┤
│ id (PK)                                   │
│ request_id (FK → requests.id)             │
│ application_id (FK → applications.id) ◄────┘
│ payment_id (FK → payments.id)             │
│ certificate_number ✅                     │
│ certificate_file_path (deprecated)         │
│ issued_by ✅ (Prepared by)                │
│ issued_at                                  │
│ valid_until                                │
│ status (generated/sent/collected) ✅      │
│ ready_date ✅                             │
│ collected_by ✅                           │
│ collected_at ✅                           │
│ physical_certificate_number ✅            │
│ notes                                      │
│ timestamps                                 │
└──────────┬─────────────────────────────────┘
           │
           │ Optional: More detailed tracking ↓
           │
┌──────────▼─────────────────────────────────┐
│   certificate_releases (OPTIONAL) 🤔      │
├────────────────────────────────────────────┤
│ release_id (PK)                           │
│ certificate_id (FK → certificates.id)     │
│ released_by (FK → users.id)               │
│ released_to (name)                        │
│ release_date                               │
│ release_time                               │
│ recipient_signature_path                   │
│ valid_id_type                              │
│ valid_id_number                            │
│ relationship_to_applicant                  │
│ remarks                                    │
│ created_at                                 │
└────────────────────────────────────────────┘

** Use this if you need detailed collection records **
** Otherwise, existing certificates table is sufficient **


┌────────────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATIONS & AUDIT TRAIL                              │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│      notifications (EXISTING) ✅          │
├────────────────────────────────────────────┤
│ id (PK)                                   │
│ user_id (FK → users.id)                   │
│ type (payment_pending, approved, etc.)     │
│ title                                      │
│ message                                    │
│ link                                       │
│ data (JSON) - stores application_id, etc.  │
│ read (boolean)                             │
│ read_at                                    │
│ timestamps                                 │
└────────────────────────────────────────────┘

Notification Types:
- application_submitted
- application_approved
- application_rejected  
- payment_order_generated
- payment_confirmed
- certificate_ready
- certificate_collected


┌────────────────────────────────────────────┐
│       audit_logs (EXISTING) ✅            │
├────────────────────────────────────────────┤
│ id (PK)                                   │
│ user_id (FK → users.id)                   │
│ user_name                                  │
│ user_email                                 │
│ action (created/updated/deleted)           │
│ model_type (Application, Payment, etc.)    │
│ model_id                                   │
│ old_values (JSON)                          │
│ new_values (JSON)                          │
│ ip_address                                 │
│ user_agent                                 │
│ description                                │
│ created_at                                 │
└────────────────────────────────────────────┘

Tracks ALL system actions:
- Application submissions
- Status changes
- Evaluations
- Payment confirmations
- Certificate preparations
- User actions


┌────────────────────────────────────────────┐
│    activity_feed (EXISTING) ✅           │
├────────────────────────────────────────────┤
│ id (PK)                                   │
│ user_id (FK → users.id)                   │
│ action                                     │
│ description                                │
│ metadata (JSON)                            │
│ timestamps                                 │
└────────────────────────────────────────────┘
```

---

## 📋 Table Relationships Summary

### Core Flow
```
users
  └─→ requests
       └─→ applications
            ├─→ corporations (if corporate)
            ├─→ projects (project details)
            ├─→ land_use_information ✨ (NEW)
            ├─→ uploaded_documents ✨ (NEW)
            │    └─→ document_types ✨ (NEW)
            ├─→ evaluations ✨ (NEW)
            ├─→ reports (approval/rejection)
            ├─→ payments (physical tracking)
            └─→ certificates (physical tracking)
                 └─→ certificate_releases 🤔 (OPTIONAL)
```

### Audit & Notifications
```
users
  ├─→ notifications (email/sms alerts)
  ├─→ audit_logs (all actions tracked)
  └─→ activity_feed (activity stream)
```

---

## 🎯 Implementation Priority

### ✅ Already Complete (Keep As-Is)
1. ✅ **users** - User management working
2. ✅ **requests** - New application system
3. ✅ **applications** - Legacy structure
4. ✅ **corporations** - Corporate entities
5. ✅ **projects** - Project details (needs refactor)
6. ✅ **reports** - Evaluation results
7. ✅ **payments** - Physical payment tracking (perfect!)
8. ✅ **certificates** - Physical certificate tracking (perfect!)
9. ✅ **notifications** - Email/SMS system
10. ✅ **audit_logs** - Complete audit trail
11. ✅ **activity_feed** - Activity tracking

### 🔥 Phase 1: Essential Additions (Do Now)
1. ✨ **document_types** - Configure document requirements
2. ✨ **uploaded_documents** - Support multiple documents
3. ✨ **land_use_information** - Normalize land use data
4. ✨ **evaluations** - Track staff evaluations

### 📈 Phase 2: Enhancements (Do Later)
5. 🔄 Refactor **projects** → better structure
6. 🤔 **certificate_releases** - If detailed tracking needed

---

## 💡 Key Design Decisions

### Why Keep Existing `payments` Table?
✅ **Perfect for physical payment tracking:**
- Has `receipt_number` for treasury receipts
- Has `payment_date` for when paid
- Has `verified_by` for staff confirmation
- Has `notes` for remarks
- Complete audit trail

### Why Keep Existing `certificates` Table?
✅ **Perfect for physical certificate tracking:**
- Has `certificate_number` 
- Has `prepared_by` (issued_by)
- Has `ready_date` for when ready
- Has `status` (generated/sent/collected)
- Has collection tracking fields
- Complete workflow support

### Why Add `uploaded_documents`?
✨ **Current limitation:**
- Only stores `authorization_letter_path` in applications
- Cannot track multiple documents
- Cannot configure document requirements
- No audit trail of document uploads

✨ **New capability:**
- Support multiple document types
- Configure required vs optional
- Track who uploaded when
- Flexible for future requirements

### Why Add `land_use_information`?
✨ **Current problem:**
- Data scattered in `projects` table as question_1, question_b, etc.
- Poor naming (what is question_1?)
- Mixed concerns (project specs + regulatory info)

✨ **Solution:**
- Clean separation of concerns
- Better naming (written_notice vs question_1)
- Normalized structure
- Easier to query and maintain

### Why Add `evaluations`?
✨ **Current limitation:**
- `reports.evaluation` only stores final status
- No evaluation history
- Can't track who evaluated
- Can't track evaluation remarks

✨ **New capability:**
- Track multiple evaluations (review cycles)
- Track who evaluated (staff_id)
- Track when evaluated
- Track recommendations and remarks
- Better audit trail for decisions

---

## 🚀 Next Steps

1. **Review this structure** - Does it meet all requirements?
2. **Create migrations** for Phase 1 tables
3. **Create models** with relationships
4. **Update controllers** to use new tables
5. **Update UI** to support multiple documents
6. **Test thoroughly** before deployment

**Ready to start implementing? Let me know which tables to create first!** 🎯
