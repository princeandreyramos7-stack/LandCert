# Super Admin vs Admin - Roles and Capabilities

## Super Admin (super_admin)
**Route Prefix:** `/super-admin`
**Color Theme:** Purple/Indigo gradient
**Icon:** Shield

### Capabilities:
1. **Dashboard**
   - System-wide statistics
   - Total users, admins, applicants
   - Total and pending requests
   - Recent system activity logs

2. **Request Management**
   - ✅ **Approve** requests directly
   - ✅ **Reject** requests directly
   - View all requests
   - Full request details
   - Statistics: Total, Pending, Reviewed, Approved, Rejected

3. **User Management**
   - View all users (including admins)
   - Create new admin users
   - Create staff users
   - Update user information
   - Delete users

4. **Audit Logs**
   - View all system activity
   - Track all changes
   - Monitor admin actions

5. **Settings**
   - System configuration
   - Advanced settings

### UI Features:
- Purple/Indigo gradient theme
- Shield icon branding
- "Super Administrator" label
- Enhanced statistics dashboard
- Direct approve/reject actions

---

## Admin (admin)
**Route Prefix:** `/admin`
**Color Theme:** Blue gradient
**Icon:** Admin Panel

### Capabilities:
1. **Dashboard**
   - Application statistics
   - Analytics and charts
   - Performance metrics

2. **Request Management**
   - ✅ **View** requests
   - ✅ **Edit** requests
   - ✅ **Mark as Reviewed** (sets status to "reviewed")
   - ✅ **Delete** requests
   - ❌ Cannot approve/reject directly

3. **User Management**
   - View applicant users only
   - Update applicant information
   - Delete applicant users
   - ❌ Cannot manage admin users

4. **GIS & Zoning**
   - Zoning map
   - DSS evaluation
   - Property management

### UI Features:
- Blue gradient theme
- Standard admin panel
- "Administrator" label
- Limited to review actions
- Cannot make final approve/reject decisions

---

## Key Differences

| Feature | Super Admin | Admin |
|---------|-------------|-------|
| **Approve Requests** | ✅ Yes | ❌ No |
| **Reject Requests** | ✅ Yes | ❌ No |
| **Mark as Reviewed** | ✅ Yes | ✅ Yes |
| **Manage Admin Users** | ✅ Yes | ❌ No |
| **Create Admins** | ✅ Yes | ❌ No |
| **View Audit Logs** | ✅ Yes | ❌ Limited |
| **System Settings** | ✅ Yes | ❌ No |
| **Dashboard Route** | `/super-admin/dashboard` | `/admin/dashboard` |
| **UI Theme** | Purple/Indigo | Blue |
| **Icon** | Shield | Admin Panel |

---

## Workflow

### Admin Workflow:
1. Admin reviews request
2. Admin marks as "Reviewed"
3. Request waits for Super Admin approval

### Super Admin Workflow:
1. Super Admin sees reviewed requests
2. Super Admin approves or rejects
3. Final decision made

---

## Login Credentials

### Super Admin:
- **Email:** superadmin@cpdo.gov.ph
- **Password:** SuperAdmin123!
- **Redirects to:** `/super-admin/dashboard`

### Admin:
- **Email:** admin@cpdo.gov.ph
- **Password:** (your admin password)
- **Redirects to:** `/admin/dashboard`

---

## Security Notes

- Super Admin has highest privilege level
- Super Admin can access admin routes (but not vice versa)
- Only Super Admin can make final approve/reject decisions
- Only Super Admin can manage other admin accounts
- Audit logs track all Super Admin actions
