# Database Structure Recommendations

## Current vs Proposed Structure Analysis

This document analyzes the proposed table structure and compares it with the existing database, providing recommendations for what to add, modify, or keep as-is.

---

## ✅ Tables That Already Exist (Keep As-Is with Minor Modifications)

### 1. **applications** (Existing - Mostly Good)
**Current Structure:**
```sql
- id (PK)
- corp_id (FK → corporations)
- project_id (FK → projects)
- applicant_name
- applicant_address
- authorized_representative
- representative_address
- authorization_letter_path
- preffered_release
- timestamps
```

**Recommendation:** ✅ **Keep with minor addition**
- Add `user_id` FK to track which user submitted the application
- This aligns with the `requests` table pattern

---

### 2. **projects** (Existing - Rename/Normalize)
**Current Structure:**
```sql
- id (PK)
- location (text)
- lot (string) - should be numeric
- bldg_improvement (string) - should be numeric
- right_over_land
- nature
- existing_land_use
- cost (decimal)
- question_1, if_yes_a, if_yes_b (written notice fields)
- question_b, if_yes_c, if_yes_d (similar application fields)
- timestamps
```

**Proposed: project_details**
```sql
- project_id (PK)
- application_id (FK)
- project_name
- nature
- location
- lot_area
- improvements
- project_cost
- duration
```

**Recommendation:** 🔄 **Keep existing but consider renaming to `project_details`**

**Rationale:**
- Current `projects` table already stores most needed information
- The current structure mixes land use questions (question_1, question_b) which should be in a separate table
- Consider creating a migration to:
  1. Rename `projects` → `project_details`
  2. Add `application_id` FK (redundant with current structure but clearer)
  3. Add `project_name` field
  4. Add `duration` field (for temporary projects)
  5. Change `lot` → `lot_area` (numeric)
  6. Change `bldg_improvement` → `improvements` (numeric)
  7. Move land use fields to new `land_use_information` table

---

### 3. **payments** (Existing - Already Perfect for Physical Tracking)
**Current Structure:**
```sql
- id (PK)
- request_id (FK)
- application_id (FK)
- amount
- payment_method (cash, bank_transfer, etc.)
- receipt_number ✅
- receipt_file_path (deprecated for physical)
- payment_date ✅
- payment_status (pending, verified, rejected)
- verified_by ✅ (confirmed_by equivalent)
- verified_at
- rejection_reason
- notes ✅ (remarks equivalent)
- timestamps
```

**Proposed: payments**
```sql
- payment_id (PK)
- application_id (FK)
- receipt_number
- payment_date
- confirmed_by
- remarks
```

**Recommendation:** ✅ **Keep existing - it's already perfect!**

**Rationale:**
- Your existing `payments` table has ALL the fields needed for physical payment tracking
- `receipt_number` ✅ (for treasury receipt)
- `payment_date` ✅
- `verified_by` ✅ (same as `confirmed_by`)
- `notes` ✅ (same as `remarks`)
- Bonus: It also has `payment_method` and `rejection_reason` for flexibility
- Just rename `verified_by` → `confirmed_by` conceptually (or keep as-is)

---

### 4. **certificates** (Existing - Already Perfect for Physical Tracking)
**Current Structure:**
```sql
- id (PK)
- request_id (FK)
- application_id (FK)
- payment_id (FK)
- certificate_number ✅
- certificate_file_path (deprecated for physical)
- issued_by ✅ (prepared_by equivalent)
- issued_at
- valid_until
- status (generated, sent, collected) ✅
- notes
- timestamps
```

**Additional Fields (from migration):**
```sql
- ready_date ✅
- collected_by ✅
- collected_at ✅
- physical_certificate_number ✅
```

**Proposed: certificates**
```sql
- certificate_id (PK)
- application_id (FK)
- certificate_number
- prepared_by
- ready_date
- status
```

**Recommendation:** ✅ **Keep existing - already excellent!**

**Rationale:**
- Your table already has everything needed
- `certificate_number` ✅
- `issued_by` = `prepared_by` ✅
- `ready_date` ✅ (from additional migration)
- `status` with "collected" option ✅
- Bonus: Tracks `payment_id` linkage, `valid_until`, and collection details

---

### 5. **notifications** (Existing - Perfect!)
**Current Structure:**
```sql
- id (PK)
- user_id (FK)
- type
- title
- message
- link
- data (json)
- read (boolean)
- read_at
- timestamps
```

**Proposed: notifications**
```sql
- notification_id (PK)
- user_id (FK)
- application_id (FK)
- channel
- subject
- message
- status
- sent_at
```

**Recommendation:** ✅ **Keep existing - more flexible!**

**Rationale:**
- Your current structure is more flexible with JSON `data` field
- Can store `application_id` in the `data` JSON field
- Can store `channel` (email/sms) in the `type` field
- `title` = `subject`
- Has `read` tracking which is valuable
- More feature-rich than proposed structure

---

## 🆕 Tables to ADD

### 6. **land_use_information** (NEW - Highly Recommended)
**Proposed Structure:**
```sql
CREATE TABLE land_use_information (
    land_use_id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT UNSIGNED NOT NULL,
    existing_land_use VARCHAR(100),
    written_notice ENUM('yes', 'no'),
    notice_officer_name VARCHAR(255),
    notice_dates DATE,
    similar_application ENUM('yes', 'no'),
    similar_application_offices TEXT,
    similar_application_dates DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id)
);
```

**Recommendation:** ✅ **ADD THIS TABLE**

**Rationale:**
- Currently, these fields are scattered in `projects` table (question_1, if_yes_a, etc.)
- This normalizes the database structure
- Makes queries cleaner and more logical
- Separates concerns: projects = physical details, land_use = regulatory info

**Migration Strategy:**
1. Create new `land_use_information` table
2. Migrate data from `projects.question_1`, `question_b`, etc.
3. Remove those columns from `projects` table

---

### 7. **uploaded_documents** (NEW - Highly Recommended)
**Proposed Structure:**
```sql
CREATE TABLE uploaded_documents (
    document_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    application_id INT UNSIGNED NOT NULL,
    document_type_id INT UNSIGNED NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT UNSIGNED,
    mime_type VARCHAR(100),
    uploaded_by INT UNSIGNED NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES document_types(document_type_id) ON DELETE RESTRICT,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_application_id (application_id),
    INDEX idx_document_type (document_type_id),
    INDEX idx_uploaded_at (uploaded_at)
);
```

**Recommendation:** ✅ **ADD THIS TABLE**

**Rationale:**
- Currently, only `authorization_letter_path` is stored in `applications` table
- This limits flexibility - what about other documents?
  - Proof of ownership
  - Site plans
  - Tax declarations
  - Building permits
  - Environmental clearances
- Allows multiple documents per application
- Better audit trail of document uploads

---

### 8. **document_types** (NEW - Highly Recommended)
**Proposed Structure:**
```sql
CREATE TABLE document_types (
    document_type_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    document_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    max_file_size INT UNSIGNED DEFAULT 5120, -- in KB
    allowed_extensions VARCHAR(255) DEFAULT 'pdf,jpg,jpeg,png',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active)
);

-- Seed with default document types
INSERT INTO document_types (document_name, description, is_required) VALUES
('Authorization Letter', 'Letter authorizing a representative to act on behalf of the applicant', TRUE),
('Proof of Ownership', 'Land title, deed of sale, or other ownership documents', TRUE),
('Site Plan', 'Detailed plan of the project site', FALSE),
('Tax Declaration', 'Property tax declaration', TRUE),
('Building Permit', 'Existing building permit (if applicable)', FALSE),
('Environmental Clearance', 'Environmental compliance certificate', FALSE),
('Barangay Clearance', 'Clearance from local barangay', FALSE),
('Location Plan', 'Map showing project location', FALSE);
```

**Recommendation:** ✅ **ADD THIS TABLE**

**Rationale:**
- Configurable document requirements
- Admin can add/remove document types
- Set which documents are required vs optional
- Configure file size limits and allowed types per document
- Better than hardcoding document types

---

### 9. **application_status** (NEW - Optional but Recommended)
**Proposed Structure:**
```sql
CREATE TABLE application_status (
    status_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(100) NOT NULL UNIQUE,
    status_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    order_sequence INT UNSIGNED,
    is_final BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status_code (status_code),
    INDEX idx_is_active (is_active)
);

-- Seed with workflow statuses
INSERT INTO application_status (status_name, status_code, order_sequence, is_final) VALUES
('Pending', 'pending', 1, FALSE),
('Under Review', 'under_review', 2, FALSE),
('Approved', 'approved', 3, FALSE),
('Rejected', 'rejected', 3, TRUE),
('Payment Pending', 'payment_pending', 4, FALSE),
('Payment Confirmed', 'payment_confirmed', 5, FALSE),
('Preparing Certificate', 'preparing_certificate', 6, FALSE),
('Ready for Collection', 'ready_for_collection', 7, FALSE),
('Certificate Collected', 'certificate_collected', 8, TRUE),
('Completed', 'completed', 9, TRUE);
```

**Recommendation:** 🤔 **Optional - Consider carefully**

**Rationale:**
- **Pros:**
  - Centralizes status definitions
  - Easy to add new statuses
  - Can track status order/sequence
  - Can add status descriptions for users
  
- **Cons:**
  - Currently using ENUM in `reports.evaluation`
  - Adds complexity with foreign keys
  - Need to update multiple places to add status
  
- **Decision:** 
  - If you frequently change statuses → ADD THIS
  - If statuses are stable → KEEP ENUM in reports table
  - **Recommendation:** Keep current ENUM approach for simplicity

---

### 10. **evaluations** (NEW - Highly Recommended)
**Proposed Structure:**
```sql
CREATE TABLE evaluations (
    evaluation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    application_id INT UNSIGNED NOT NULL,
    staff_id INT UNSIGNED NOT NULL,
    recommendation ENUM('approve', 'reject', 'revise') NOT NULL,
    remarks TEXT,
    evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_application_id (application_id),
    INDEX idx_staff_id (staff_id),
    INDEX idx_evaluation_date (evaluation_date)
);
```

**Recommendation:** ✅ **ADD THIS TABLE**

**Rationale:**
- Currently using `reports` table for evaluation, but it's not clear
- `reports.evaluation` stores the final status, not the evaluation history
- This table allows tracking:
  - **Multiple evaluations** (if needed for review/revise cycles)
  - **Who evaluated** (staff accountability)
  - **When evaluated** (timeline tracking)
  - **Recommendations** (approve/reject/revise)
  - **Detailed remarks** (reasoning)
  
- Separates evaluation process from final reporting
- Better audit trail
- Can show "evaluation history" to admin

---

### 11. **certificate_releases** (NEW - Recommended)
**Proposed Structure:**
```sql
CREATE TABLE certificate_releases (
    release_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    certificate_id BIGINT UNSIGNED NOT NULL,
    released_by INT UNSIGNED NOT NULL,
    released_to VARCHAR(255) NOT NULL,
    release_date DATE NOT NULL,
    release_time TIME NOT NULL,
    recipient_signature_path VARCHAR(500),
    valid_id_type VARCHAR(100),
    valid_id_number VARCHAR(100),
    relationship_to_applicant VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE,
    FOREIGN KEY (released_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_certificate_id (certificate_id),
    INDEX idx_release_date (release_date)
);
```

**Recommendation:** 🤔 **Optional but valuable**

**Rationale:**
- Currently, collection info is stored directly in `certificates` table
- This table provides more detailed tracking:
  - **Who collected** (name)
  - **Who released** (staff member)
  - **When** (date and time)
  - **Valid ID details** (for verification)
  - **Relationship to applicant** (applicant vs representative)
  - **Signature** (digital capture)
  
- **Pros:**
  - More detailed audit trail
  - Better security/verification
  - Can track if representative collects
  
- **Cons:**
  - May be overkill for simple collection
  - Current `certificates` table already tracks collection
  
- **Decision:** ADD if you need detailed collection records for legal/audit purposes

---

## 📊 Summary Table: Current vs Proposed

| Proposed Table | Current Table | Recommendation | Priority |
|---|---|---|---|
| **project_details** | `projects` | 🔄 Refactor existing | Medium |
| **land_use_information** | (scattered in `projects`) | ✅ **ADD NEW** | **High** |
| **uploaded_documents** | (only auth letter in `applications`) | ✅ **ADD NEW** | **High** |
| **document_types** | (hardcoded) | ✅ **ADD NEW** | **High** |
| **application_status** | ENUM in `reports` | 🤔 Optional | Low |
| **evaluations** | `reports` table | ✅ **ADD NEW** | **High** |
| **payments** | `payments` ✅ | ✅ Keep as-is | ✅ Done |
| **certificates** | `certificates` ✅ | ✅ Keep as-is | ✅ Done |
| **certificate_releases** | (in `certificates`) | 🤔 Optional | Medium |
| **notifications** | `notifications` ✅ | ✅ Keep as-is | ✅ Done |

---

## 🚀 Implementation Recommendations

### Phase 1: Essential Tables (Do First) 🔥
1. ✅ **uploaded_documents** - Allows multiple document types
2. ✅ **document_types** - Configure document requirements
3. ✅ **land_use_information** - Clean separation of concerns
4. ✅ **evaluations** - Track evaluation history

### Phase 2: Enhancements (Do Later) 
5. 🔄 **Refactor projects → project_details** - Better naming/structure
6. 🤔 **certificate_releases** - If detailed collection tracking needed

### Phase 3: Optional 
7. 🤔 **application_status** - Only if you need dynamic status management

---

## 🔧 Migration Strategy

### Step 1: Add New Tables (No Data Loss)
```bash
php artisan make:migration create_document_types_table
php artisan make:migration create_uploaded_documents_table
php artisan make:migration create_land_use_information_table
php artisan make:migration create_evaluations_table
```

### Step 2: Migrate Data
```bash
php artisan make:migration migrate_land_use_data_from_projects
# Move question_1, question_b fields to land_use_information
```

### Step 3: Update Models
```php
// Application.php
public function documents() {
    return $this->hasMany(UploadedDocument::class);
}

public function landUseInfo() {
    return $this->hasOne(LandUseInformation::class);
}

public function evaluations() {
    return $this->hasMany(Evaluation::class);
}
```

### Step 4: Update Controllers
- Modify `RequestController` to handle multiple documents
- Add `EvaluationController` for staff evaluations
- Update admin dashboard to show evaluation history

---

## ✅ Final Recommendation

**Your existing database structure is already quite good!** The main improvements needed are:

1. ✅ **Add `uploaded_documents` + `document_types`** - Most important for flexibility
2. ✅ **Add `land_use_information`** - Normalizes the database
3. ✅ **Add `evaluations`** - Better tracking of staff decisions
4. ✅ **Keep existing `payments` and `certificates`** - They're already perfect for physical tracking!

**Do NOT** over-engineer with `application_status` table if ENUMs work fine for you. Keep it simple.

---

**Need help implementing any of these? Let me know which tables to create first!** 🚀
