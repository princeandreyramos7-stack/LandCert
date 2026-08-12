# My Applications N/A Fields Fix - CORRECTED

## Issue
All fields in the "My Applications" page were showing "N/A" instead of actual data.

## Root Cause
After database normalization, the data structure changed significantly:

### Actual Normalized Database Structure:
- **`requests`** - Base request information (user_id, status, preferences)
- **`applicants`** - Applicant information (applicant_name, applicant_address, applicant_type)
- **`normalized_corporations`** - Corporation details (linked to applicants)
- **`representatives`** - Authorized representatives (linked to applicants)
- **`normalized_projects`** - Project details (project_type, project_nature, cost, duration)
- **`locations`** - Location information (street_address, barangay, city_municipality, province)
- **`properties`** - Property details (lot_area_sqm, existing_land_use, right_over_land, lot_number)
- **`reports`** - Evaluation and reports

The code had two major issues:

### Problem 1: Store Method Not Using Normalized Tables
The `RequestController::store()` method was trying to save all data directly to the `requests` table, but the `requests` table no longer has columns for applicant info, project details, etc.

**Result**: Data was not being saved to the normalized tables, so all fields were NULL.

### Problem 2: Query Not Joining Normalized Tables with Correct Names
The `myApplications()` and `dashboard()` methods were trying to join non-existent tables like `projects` (actual name: `normalized_projects`) and referencing wrong column names.

**Result**: SQL errors and no data retrieved.

## Solution

### Fix 1: Updated Store Method
Modified `RequestController::store()` to properly create records in all normalized tables with correct names:

```php
DB::transaction(function () {
    // 1. Create Applicant (applicants table)
    $applicant = Applicant::create([
        'applicant_name' => ...,
        'applicant_address' => ...,
        'applicant_type' => 'individual' or 'corporate'
    ]);
    
    // 2. Create Request (with applicant_id)
    $request = Request::create([...]);
    
    // 3. Create Corporation if applicable (normalized_corporations)
    NormalizedCorporation::create([...]);
    
    // 4. Create Representative if applicable (representatives)
    Representative::create([...]);
    
    // 5. Create Project (normalized_projects)
    NormalizedProject::create([...]);
    
    // 6. Create Location (locations)
    Location::create([
        'street_address' => ...,
        'barangay' => ...,
        'city_municipality' => ...,
        'province' => ...
    ]);
    
    // 7. Create Property (properties - includes lot_area, land_use, etc.)
    Property::create([...]);
    
    // 8. Create Report
    Report::create([...]);
});
```

### Fix 2: Updated Query Methods
Modified `myApplications()` and `dashboard()` to join correct normalized tables:

```php
RequestModel::where('requests.user_id', auth()->id())
    ->leftJoin('reports', 'requests.id', '=', 'reports.request_id')
    ->leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
    ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
    ->leftJoin('locations', 'requests.id', '=', 'locations.request_id')
    ->leftJoin('properties', 'requests.id', '=', 'properties.request_id')
    ->leftJoin('normalized_corporations', 'applicants.id', '=', 'normalized_corporations.applicant_id')
    ->leftJoin('representatives', 'applicants.id', '=', 'representatives.applicant_id')
    ->select(
        'requests.*',
        'applicants.applicant_name',
        'applicants.applicant_address',
        'normalized_corporations.corporation_name',
        'representatives.representative_name as authorized_representative_name',
        'normalized_projects.project_type',
        'normalized_projects.project_nature',
        'locations.street_address as project_location_street',
        'locations.barangay as project_location_barangay',
        'locations.city_municipality as project_location_city',
        'locations.province as project_location_province',
        'properties.lot_area_sqm',
        'properties.existing_land_use',
        'properties.right_over_land',
        // ... all other fields
    )
    ->get();
```

## Key Column Name Mappings

| Frontend Expects | Actual Table | Actual Column |
|------------------|--------------|---------------|
| `applicant_name` | `applicants` | `applicant_name` |
| `applicant_address` | `applicants` | `applicant_address` |
| `project_type` | `normalized_projects` | `project_type` |
| `project_nature` | `normalized_projects` | `project_nature` |
| `project_location_city` | `locations` | `city_municipality` |
| `project_location_street` | `locations` | `street_address` |
| `lot_area_sqm` | `properties` | `lot_area_sqm` |
| `existing_land_use` | `properties` | `existing_land_use` |
| `corporation_name` | `normalized_corporations` | `corporation_name` |
| `authorized_representative_name` | `representatives` | `representative_name` |

## Files Modified

1. ✅ **`app/Http/Controllers/RequestController.php`**
   - Updated `store()` method to create records in correct normalized tables
   - Updated `myApplications()` query to join correct tables with correct column names
   - Updated `dashboard()` query to join correct tables with correct column names

## Testing Required

### For New Submissions:
1. ✅ Submit a new request through the UI
2. ✅ Verify data appears in all normalized tables:
   - `applicants` table has applicant info
   - `normalized_projects` table has project details
   - `locations` table has location data
   - `properties` table has property and land use data
   - `normalized_corporations` table (if corporation)
   - `representatives` table (if representative)
3. ✅ Check "My Applications" page shows all fields correctly

### For Existing Data:
**NOTE**: Old requests (ID #1-5) submitted before this fix will still show N/A because they don't have data in the normalized tables. Only new requests submitted after this fix will display properly.

## Related Fixes
- See `NOTIFICATION_SERVICE_FIX.md` for the NotificationService type error fix

## Status
✅ **FIXED** - New request submissions will now properly save to correct normalized tables and display in My Applications

## Date
August 4, 2026 - Corrected with actual table names and structure
