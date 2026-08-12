# Quick Reference - Normalized Database Access

## 🎯 Quick Guide for Developers

This document provides quick reference for accessing normalized database fields.

---

## 📋 Table Relationships

```
requests
  ├── applicant_id → applicants
  │     ├── id → normalized_corporations.applicant_id
  │     └── id → representatives.applicant_id
  ├── id → normalized_projects.request_id
  ├── id → locations.request_id
  ├── id → properties.request_id
  ├── id → reports.request_id
  └── user_id → users
```

---

## ✅ Field Migration Guide

### **Applicant Information**

| Old Field (requests table) | New Access | Table |
|---|---|---|
| `$request->applicant_name` | `$request->applicant->applicant_name` | applicants |
| `$request->applicant_address` | `$request->applicant->applicant_address` | applicants |
| `$request->applicant_contact` | `$request->applicant->applicant_contact` | applicants |

### **Corporation Information**

| Old Field | New Access | Table |
|---|---|---|
| `$request->corporation_name` | `$request->applicant->corporation->corporation_name` | normalized_corporations |
| `$request->corporation_address` | `$request->applicant->corporation->corporation_address` | normalized_corporations |

### **Representative Information**

| Old Field | New Access | Table |
|---|---|---|
| `$request->authorized_representative_name` | `$request->applicant->representative->representative_name` | representatives |
| `$request->authorized_representative_address` | `$request->applicant->representative->representative_address` | representatives |

### **Project Information**

| Old Field | New Access | Table |
|---|---|---|
| `$request->project_type` | `$request->project->project_type` | normalized_projects |
| `$request->project_nature` | `$request->project->project_nature` | normalized_projects |
| `$request->project_cost` | `$request->project->project_cost` | normalized_projects |
| `$request->project_nature_duration` | `$request->project->project_nature_duration` | normalized_projects |
| `$request->project_nature_years` | `$request->project->project_nature_years` | normalized_projects |

### **Location Information**

| Old Field | New Access | Table |
|---|---|---|
| `$request->project_location_street` | `$request->location->street_address` | locations |
| `$request->project_location_barangay` | `$request->location->barangay` | locations |
| `$request->project_location_city` | `$request->location->city_municipality` | locations |
| `$request->project_location_municipality` | `$request->location->city_municipality` | locations |
| `$request->project_location_province` | `$request->location->province` | locations |
| `$request->project_location_number` | `$request->location->lot_number` | locations |

### **Property Information**

| Old Field | New Access | Table |
|---|---|---|
| `$request->lot_area_sqm` | `$request->property->lot_area_sqm` | properties |
| `$request->bldg_improvement_sqm` | `$request->property->bldg_improvement_sqm` | properties |
| `$request->right_over_land` | `$request->property->right_over_land` | properties |
| `$request->existing_land_use` | `$request->property->existing_land_use` | properties |
| `$request->has_written_notice` | `$request->property->has_written_notice` | properties |
| `$request->notice_officer_name` | `$request->property->notice_officer_name` | properties |
| `$request->has_similar_application` | `$request->property->has_similar_application` | properties |

---

## 💻 Code Examples

### **Example 1: Loading Relationships (Eloquent)**

```php
use App\Models\Request as RequestModel;

// Load single request with relationships
$request = RequestModel::with([
    'applicant.corporation',
    'applicant.representative',
    'project',
    'location',
    'property',
    'user'
])->find($id);

// Access normalized data
$applicantName = $request->applicant->applicant_name ?? 'N/A';
$projectType = $request->project->project_type ?? 'N/A';
$barangay = $request->location->barangay ?? 'N/A';
$lotArea = $request->property->lot_area_sqm ?? 0;
```

### **Example 2: Query with Joins**

```php
use App\Models\Request as RequestModel;

$requests = RequestModel::leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
    ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
    ->leftJoin('locations', 'requests.id', '=', 'locations.request_id')
    ->leftJoin('properties', 'requests.id', '=', 'properties.request_id')
    ->select([
        'requests.id',
        'requests.status',
        'applicants.applicant_name',
        'normalized_projects.project_type',
        'locations.barangay',
        'properties.lot_area_sqm'
    ])
    ->get();

// Direct access (fields are in result)
foreach ($requests as $request) {
    echo $request->applicant_name;
    echo $request->project_type;
}
```

### **Example 3: In Mail Classes**

```php
class MyMailable extends Mailable
{
    public $request;

    public function __construct($request)
    {
        // Load relationships before passing to view
        if ($request && method_exists($request, 'load')) {
            $request->load(['applicant', 'project', 'location']);
        }
        
        $this->request = $request;
    }
}
```

### **Example 4: In Blade Templates**

```blade
<!-- Accessing with null safety -->
<p>Applicant: {{ $request->applicant->applicant_name ?? 'N/A' }}</p>
<p>Project Type: {{ $request->project->project_type ?? 'N/A' }}</p>
<p>Location: {{ $request->location->barangay ?? 'N/A' }}</p>
<p>Lot Area: {{ $request->property->lot_area_sqm ?? 'N/A' }} sqm</p>
```

### **Example 5: In Controllers with Search**

```php
public function search(Request $request)
{
    $query = $request->input('q');
    
    $results = RequestModel::leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
        ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
        ->where('applicants.applicant_name', 'LIKE', "%{$query}%")
        ->orWhere('normalized_projects.project_type', 'LIKE', "%{$query}%")
        ->select([
            'requests.id',
            'applicants.applicant_name',
            'normalized_projects.project_type'
        ])
        ->get();
    
    return response()->json($results);
}
```

---

## ⚠️ Common Mistakes to Avoid

### **❌ DON'T:**
```php
// This will return NULL - field doesn't exist in requests table
$name = $request->applicant_name;

// This will cause error if relationship not loaded
$name = $request->applicant->applicant_name;
```

### **✅ DO:**
```php
// Load relationship first
$request->load(['applicant']);
$name = $request->applicant->applicant_name;

// Or use null safety
$name = $request->applicant->applicant_name ?? 'N/A';

// Or check existence
if ($request->applicant) {
    $name = $request->applicant->applicant_name;
}
```

---

## 🔍 Debugging Tips

### **Check if Relationship is Loaded:**
```php
// Check if relationship is loaded
if ($request->relationLoaded('applicant')) {
    echo "Applicant loaded";
}

// Load if not already loaded
if (!$request->relationLoaded('applicant')) {
    $request->load(['applicant']);
}
```

### **See All Loaded Relationships:**
```php
// Get array of loaded relationships
$loaded = $request->getRelations();
dd($loaded);
```

### **Check SQL Queries:**
```php
// Enable query log
\DB::enableQueryLog();

// Your code here
$request = RequestModel::with(['applicant', 'project'])->find(1);

// See queries
dd(\DB::getQueryLog());
```

---

## 📊 Performance Tips

### **1. Eager Load Multiple Relationships:**
```php
// ✅ GOOD - One query per relationship
$requests = RequestModel::with(['applicant', 'project', 'location'])->get();

// ❌ BAD - N+1 query problem
$requests = RequestModel::all();
foreach ($requests as $request) {
    echo $request->applicant->applicant_name; // Query for each!
}
```

### **2. Use Joins for Large Datasets:**
```php
// For exports or large lists, use joins instead of eager loading
$requests = RequestModel::leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
    ->select(['requests.id', 'applicants.applicant_name'])
    ->get();
```

### **3. Select Only Needed Fields:**
```php
// ✅ GOOD - Select specific fields
$requests = RequestModel::with(['applicant:id,applicant_name,applicant_address'])
    ->select(['id', 'applicant_id', 'status'])
    ->get();

// ❌ BAD - Loads all fields
$requests = RequestModel::with(['applicant'])->get();
```

---

## 🛠️ Relationship Definitions in Models

### **Request Model:**
```php
class Request extends Model
{
    public function applicant()
    {
        return $this->belongsTo(Applicant::class);
    }

    public function project()
    {
        return $this->hasOne(NormalizedProject::class);
    }

    public function location()
    {
        return $this->hasOne(Location::class);
    }

    public function property()
    {
        return $this->hasOne(Property::class);
    }
}
```

### **Applicant Model:**
```php
class Applicant extends Model
{
    public function corporation()
    {
        return $this->hasOne(NormalizedCorporation::class);
    }

    public function representative()
    {
        return $this->hasOne(Representative::class);
    }
}
```

---

## 📞 Need Help?

If you encounter issues:

1. **Check relationship is loaded:**
   ```php
   $request->load(['applicant', 'project']);
   ```

2. **Use null safety:**
   ```php
   $name = $request->applicant->applicant_name ?? 'Default';
   ```

3. **Enable query logging** to see what SQL is being executed

4. **Refer to:**
   - `DATABASE_NORMALIZATION_FINAL_STATUS.md` - Complete migration guide
   - `ERD_FINAL_NORMALIZED.md` - Database schema
   - `SYSTEM_FLOW_ANALYSIS.md` - Application workflows

---

**Last Updated:** August 4, 2026  
**Version:** 1.0  
**Status:** Production Ready ✅
