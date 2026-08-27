# Visibility Rules: Application Number vs Decision Number

## Application Number (TPZ-MM-YY-NNNN)

### Who Can See It:
✅ **Applicants** - In all their views (My Applications, emails, SMS)
✅ **Admin** - In all admin panels and reviews
✅ **Super Admin** - In all super admin panels

### Where It Appears:
- My Applications list (applicant view)
- Application submission confirmation
- Email notifications to applicants
- SMS notifications to applicants
- Upload receipt page
- Admin review pages
- Super admin review pages
- Payment records
- Audit logs
- Search functionality

### Purpose:
- Primary tracking number for applicants
- Used in all communications with applicants
- Public-facing identifier

---

## Decision Number (XXX-MM-YY-NNNN-NNNN)

### Who Can See It:
❌ **Applicants** - Should NOT see this in their portal
✅ **Admin** - Can see in admin panels
✅ **Super Admin** - Can see in super admin panels
✅ **Certificate PDFs** - Appears on official certificates

### Where It Appears:
- Admin review pages (when displaying request details)
- Super admin review pages
- Certificate PDF documents (official use)
- Internal admin reports
- NOT in applicant-facing views
- NOT in applicant emails/SMS

### Purpose:
- Internal tracking for approved/issued permits
- Official reference on certificates
- Links to specific permit type
- Administrative use only

---

## Current Implementation Status

### ✅ Correctly Hidden from Applicants:
- MyApplicationsList.jsx - Only shows `application_number`
- UploadReceipt.jsx - Only shows `application_number`
- Email notifications - Only mention application number
- SMS notifications - Only mention application number

### ✅ Visible to Admins:
- Admin/ReviewRequest.jsx - Can see both numbers (if needed)
- SuperAdmin/ReviewRequest.jsx - Can see both numbers (if needed)
- Certificate templates - Shows decision number on official docs
- PrintForm.jsx - Shows both for admin printing

### 📋 Key Rule:
**Applicants interact with Application Number only. Decision Number is for administrative and official certificate purposes.**

---

## Rationale

1. **Simplicity for Applicants**: One number to track their application
2. **Security**: Decision numbers contain permit type info that may be internal
3. **Professional**: Certificates show formal decision numbers
4. **Workflow**: Application number from submission → Decision number when approved/issued

---

## Example Flow

1. **Applicant submits** → Gets `TPZ-03-26-9627` (Application Number)
2. **Admin reviews** → Sees `TPZ-03-26-9627`
3. **Admin approves** → System generates `CZC-02-26-3114-5151` (Decision Number)
4. **Certificate issued** → PDF shows both numbers
5. **Applicant receives certificate** → Sees Decision Number only on physical certificate
6. **Applicant checks portal** → Still sees `TPZ-03-26-9627` for tracking

---

**Last Updated**: August 26, 2026
