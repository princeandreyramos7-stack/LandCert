# Database Normalization Implementation Guide

**Date**: August 3, 2026  
**Purpose**: Implement normalized database structure (13 tables) without DSS/GIS

---

## Overview

This guide will help you migrate your database from the simplified 7-table structure to a properly normalized 13-table structure that follows 3NF (Third Normal Form) principles.

### New Tables Created:
1. `applicants` - Applicant information
2. `normalized_corporations` - Corporate entities
3. `representatives` - Authorized representatives
4. `normalized_projects` - Project details
5. `properties` - Property/lot information
6. `locations` - Address/location data

### Existing Tables:
7. `users` - User accounts
8. `requests` - Core application data
9. `reports` - Evaluation reports
10. `payments` - Payment tracking
11. `certificates` - Certificate management
12. `notifications` - User notifications
13. `audit_logs` - System audit trail

---

## Pre-Migration Checklist

- [ ] **Backup your database**
  ```bash
  mysqldump -u root cpdo_database > cpdo_database_backup_$(date +%Y%m%d).sql
  ```

- [ ] **Check current database status**
  ```bash
  php artisan migrate:status
  ```

- [ ] **Ensure XAMPP MySQL is running**

- [ ] **Stop any running application servers**

---

## Step-by-Step Migration

### Step 1: Backup Current Database

```bash
# Windows (CMD)
cd C:\xampp\mysql\bin
mysqldump -u root cpdo_database > C:\xampp\htdocs\cpdo_project\backup\cpdo_database_backup.sql

# Or using PHP artisan
php artisan db:backup
```

### Step 2: Run New Migrations

```bash
# Navigate to project directory
cd C:\xampp\htdocs\cpdo_project

# Run the new migrations
php artisan migrate

# You should see:
# - 2026_08_03_000001_create_normalized_applicants_table .................... DONE
# - 2026_08_03_000002_create_normalized_corporations_table ................ DONE
# - 2026_08_03_000003_create_representatives_table ........................ DONE
# - 2026_08_03_000004_create_normalized_projects_table .................... DONE
# - 2026_08_03_000005_create_properties_table .............................. DONE
# - 2026_08_03_000006_create_locations_table ............................... DONE
# - 2026_08_03_000007_update_requests_table_for_normalization .............. DONE
# - 2026_08_03_000008_migrate_data_to_normalized_tables .................... DONE
```

### Step 3: Verify Data Migration

```bash
# Check if data was migrated correctly
php artisan tinker
```

In Tinker:
```php
// Check applicants
\App\Models\Applicant::count();

// Check corporations
\App\Models\NormalizedCorporation::count();

// Check representatives
\App\Models\Representative::count();

// Check projects
\App\Models\NormalizedProject::count();

// Check properties
\App\Models\Property::count();

// Check locations
\App\Models\Location::count();

// Test relationships
$request = \App\Models\Request::first();
$request->applicant;
$request->project;
$request->property;
$request->location;

// Exit tinker
exit
```

### Step 4: Clear Cache

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Step 5: Test the Application

1. **Start your development server**
   ```bash
   php artisan serve
   ```

2. **Test key features:**
   - [ ] Login as user
   - [ ] Create new request
   - [ ] View existing requests
   - [ ] Edit request
   - [ ] Submit payment
   - [ ] View certificates

---

## Database Structure

### Before Normalization (7 Tables)
```
users
requests (with all embedded data)
reports
payments
certificates
notifications
audit_logs
```

### After Normalization (13 Tables)
```
users
  ↓
applicants
  ├── normalized_corporations (1:1)
  └── representatives (1:*)
     
requests
  ├── applicant_id (FK)
  ├── normalized_projects (1:1)
  ├── properties (1:1)
  ├── locations (1:1)
  ├── reports (1:*)
  ├── payments (1:*)
  └── certificates (1:1)

notifications
audit_logs
```

---

## Verification Queries

### Check Table Counts

```sql
-- Count all tables
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'applicants', COUNT(*) FROM applicants
UNION ALL
SELECT 'normalized_corporations', COUNT(*) FROM normalized_corporations
UNION ALL
SELECT 'representatives', COUNT(*) FROM representatives
UNION ALL
SELECT 'requests', COUNT(*) FROM requests
UNION ALL
SELECT 'normalized_projects', COUNT(*) FROM normalized_projects
UNION ALL
SELECT 'properties', COUNT(*) FROM properties
UNION ALL
SELECT 'locations', COUNT(*) FROM locations
UNION ALL
SELECT 'reports', COUNT(*) FROM reports
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'certificates', COUNT(*) FROM certificates
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;
```

### Check Relationships

```sql
-- Verify applicants are linked to requests
SELECT 
    a.applicant_name,
    COUNT(r.id) as request_count
FROM applicants a
LEFT JOIN requests r ON r.applicant_id = a.id
GROUP BY a.id, a.applicant_name;

-- Verify projects are linked to requests
SELECT 
    COUNT(DISTINCT r.id) as requests_with_projects
FROM requests r
INNER JOIN normalized_projects p ON p.request_id = r.id;

-- Verify locations are linked to requests
SELECT 
    COUNT(DISTINCT r.id) as requests_with_locations
FROM requests r
INNER JOIN locations l ON l.request_id = r.id;
```

---

## Rollback Procedure

If you need to rollback:

```bash
# Rollback the last batch of migrations
php artisan migrate:rollback

# Or rollback specific steps
php artisan migrate:rollback --step=8

# Restore from backup
mysql -u root cpdo_database < C:\xampp\htdocs\cpdo_project\backup\cpdo_database_backup.sql
```

---

## Benefits of Normalization

### 1. Data Integrity
- ✅ No duplicate applicant information
- ✅ Corporate entities properly separated
- ✅ Multiple representatives per applicant supported

### 2. Flexibility
- ✅ Easy to add new applicants without requests
- ✅ Can track corporate entities independently
- ✅ Representatives can be added/removed easily

### 3. Query Efficiency
- ✅ Smaller table sizes
- ✅ Targeted indexes
- ✅ Efficient joins

### 4. Maintainability
- ✅ Clear table responsibilities
- ✅ Easy to understand structure
- ✅ Simple updates and modifications

---

## Updated Model Usage Examples

### Creating a New Request (Normalized Way)

```php
use App\Models\Applicant;
use App\Models\Request;
use App\Models\NormalizedProject;
use App\Models\Property;
use App\Models\Location;

// Create applicant
$applicant = Applicant::create([
    'user_id' => auth()->id(),
    'applicant_name' => 'Juan Dela Cruz',
    'applicant_address' => '123 Main St, Cebu City',
    'applicant_contact' => '09123456789',
    'applicant_type' => 'individual',
]);

// Create request
$request = Request::create([
    'user_id' => auth()->id(),
    'applicant_id' => $applicant->id,
    'status' => 'pending',
    'has_written_notice' => 'no',
    'has_similar_application' => 'no',
    'preferred_release_mode' => 'pickup',
]);

// Create project
NormalizedProject::create([
    'request_id' => $request->id,
    'project_type' => 'Building Construction',
    'project_nature' => 'Residential',
    'project_nature_duration' => 'Permanent',
    'project_cost' => 500000.00,
]);

// Create property
Property::create([
    'request_id' => $request->id,
    'lot_area_sqm' => 200.00,
    'bldg_improvement_sqm' => 150.00,
    'lot_number' => 'Lot 123',
    'right_over_land' => 'Owner',
    'existing_land_use' => 'Residential',
]);

// Create location
Location::create([
    'request_id' => $request->id,
    'street_address' => '123 Main Street',
    'barangay' => 'Poblacion',
    'city_municipality' => 'Cebu City',
    'province' => 'Cebu',
    'postal_code' => '6000',
]);
```

### Querying Normalized Data

```php
// Get request with all related data
$request = Request::with([
    'applicant',
    'applicant.corporation',
    'applicant.representatives',
    'project',
    'property',
    'location',
    'payments',
    'certificates',
])->find($id);

// Access related data
echo $request->applicant->applicant_name;
echo $request->project->project_type;
echo $request->property->lot_area_sqm;
echo $request->location->full_address; // Uses accessor

// Check if corporate
if ($request->applicant->isCorporate()) {
    echo $request->applicant->corporation->corporation_name;
}

// Get primary representative
if ($rep = $request->applicant->primaryRepresentative) {
    echo $rep->representative_name;
}
```

---

## Troubleshooting

### Issue: Migration fails with foreign key constraint error

**Solution:**
```bash
# Disable foreign key checks temporarily
php artisan tinker
DB::statement('SET FOREIGN_KEY_CHECKS=0;');
exit

# Run migrations again
php artisan migrate

# Re-enable foreign key checks
php artisan tinker
DB::statement('SET FOREIGN_KEY_CHECKS=1;');
exit
```

### Issue: Data not migrated properly

**Solution:**
```bash
# Run the data migration again
php artisan migrate:refresh --path=/database/migrations/2026_08_03_000008_migrate_data_to_normalized_tables.php
```

### Issue: Relationships not working

**Solution:**
```bash
# Clear all caches
php artisan optimize:clear

# Regenerate autoload files
composer dump-autoload
```

---

## Next Steps

After successful normalization:

1. **Update Controllers** - Modify controllers to use new normalized models
2. **Update Forms** - Adjust forms to work with new structure
3. **Update Queries** - Optimize queries to use relationships
4. **Test Thoroughly** - Test all CRUD operations
5. **Update Documentation** - Update API docs if applicable
6. **Monitor Performance** - Check query performance

---

## Support & References

- **ERD Documentation**: `DOCU/ERD_NORMALIZED_NO_DSS_GIS.md`
- **Model Files**: `app/Models/`
- **Migration Files**: `database/migrations/2026_08_03_*`

---

**END OF NORMALIZATION GUIDE**

**Status**: Ready for Implementation  
**Last Updated**: August 3, 2026  
**Version**: 1.0
