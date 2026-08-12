# Admin Database Normalization Fix Plan

## CRITICAL: Admin files are using OLD database structure

This document tracks the migration of all admin-related files from the old database structure to the new normalized structure.

---

## Status: **IN PROGRESS**

### Priority 1 - CRITICAL (Breaks Core Functionality)
- [ ] **AdminController.php** - Dashboard, applications(), payments() methods
- [ ] **SuperAdminController.php** - Same methods as AdminController
- [ ] **OptimizedQueries.php** - Complete rewrite needed
- [ ] **DashboardCacheService.php** - Query fixes

### Priority 2 - HIGH (Breaks Notifications/Emails)
- [ ] **NotificationService.php** - All methods
- [ ] **RequestObserver.php** - created() method
- [ ] **StatusChangeNotification.php** - Mail class
- [ ] **PaymentDueReminder.php** - Mail class

### Priority 3 - MEDIUM (Breaks Search/Reports)
- [ ] **PaymentController.php** - Search
- [ ] **CertificateController.php** - Search
- [ ] **PDF Export Templates** (4 files)
- [ ] **Email Templates** (4 files)

---

## The Fix Pattern

### OLD (WRONG):
```php
$request->applicant_name        // Field doesn't exist on requests table
$request->project_type          // Field doesn't exist on requests table
$request->corporation_name      // Field doesn't exist on requests table
```

### NEW (CORRECT):
```php
$request->applicant->applicant_name              // From applicants table
$request->project->project_type                  // From normalized_projects table
$request->applicant->corporation->corporation_name   // From normalized_corporations table
$request->location->street_address               // From locations table
$request->property->lot_area_sqm                 // From properties table
```

---

## Required Eager Loading

All queries must include:
```php
RequestModel::with([
    'user',
    'reports',
    'applicant' => function($query) {
        $query->with(['corporation', 'representative']);
    },
    'project',
    'location',
    'property'
])
```

---

## Next Steps

1. Fix AdminController dashboard() and applications() methods
2. Fix SuperAdminController equivalent methods
3. Rewrite OptimizedQueries trait
4. Fix DashboardCacheService analytics queries
5. Update all notification and mail classes
6. Fix search functionality in PaymentController and CertificateController
7. Update all PDF and email templates

---

## Testing Plan

After each fix:
1. Test admin dashboard loads
2. Test application list displays correct data
3. Test payments list displays correct data
4. Test email notifications work
5. Test PDF exports work

---

## Completion Criteria

- [ ] All admin pages load without errors
- [ ] All data displays correctly from normalized tables
- [ ] No references to old field names remain
- [ ] All email notifications work
- [ ] All PDF exports work
- [ ] Search functionality works across all admin pages
