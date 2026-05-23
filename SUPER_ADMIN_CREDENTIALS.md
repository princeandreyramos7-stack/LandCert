# Super Admin Credentials

## Super Admin User Created Successfully

**User Details:**
- **Name:** Super Admin
- **Email:** superadmin@cpdo.gov.ph
- **Password:** SuperAdmin123!
- **User Type:** super_admin
- **User ID:** 4
- **Created:** 2026-05-08 22:08:15

## Features

The Super Admin user has the following privileges:
- Full access to all admin routes and features
- Can access all admin dashboard functionalities
- Bypasses all role-based restrictions
- Has highest level of system access

## How to Create Additional Super Admin Users

Use the Artisan command:

```bash
php artisan user:create-super-admin
```

Or with options:

```bash
php artisan user:create-super-admin --name="Admin Name" --email="admin@example.com" --password="SecurePassword123"
```

## User Types in System

1. **applicant** - Regular users who submit applications
2. **staff** - Staff members with limited admin access
3. **admin** - Administrators with full admin panel access
4. **super_admin** - Super administrators with unrestricted access (highest privilege)

## Security Notes

- Please change the default password after first login
- Keep these credentials secure
- Super Admin access should be limited to trusted personnel only
- Consider implementing 2FA for super admin accounts in production

---

**Important:** Delete or secure this file before deploying to production!
