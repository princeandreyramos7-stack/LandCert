# Property Management Guide

## How Properties Are Added to the GIS Map

There are **THREE ways** to add properties to the GIS Zoning Map:

---

## 1. AUTOMATIC (Client-Driven) ✨

### How It Works:
When a client submits a land certification request through the request form, the system can automatically create a property location record.

### Current Status:
⚠️ **NOT YET IMPLEMENTED** - The request form collects location data but doesn't automatically create property_locations records.

### What Needs to Be Done:
Update `RequestController@store` to automatically create a `PropertyLocation` record when a request is submitted.

### Benefits:
- No manual data entry required
- Properties appear on map immediately after request submission
- Reduces admin workload
- Ensures all requests have map representation

### Data Collected from Request Form:
- Project location (street, barangay, municipality, province)
- Lot area (sqm)
- Project area (sqm)
- Existing land use (Residential, Commercial, Industrial, etc.)

### Missing Data:
- GPS coordinates (latitude/longitude) - needs to be added to form
- Zoning rule assignment - can be auto-assigned based on existing land use
- Title number and lot number - already in system but not in request form

---

## 2. MANUAL (Admin Interface) 🖱️

### How It Works:
Admins can manually add properties through a dedicated admin interface.

### Current Status:
⚠️ **NOT YET IMPLEMENTED** - No UI exists for manual property addition.

### What Will Be Created:
- Admin page: "Add Property" under GIS & Zoning section
- Form with all property fields
- Map picker to select GPS coordinates
- Zoning rule dropdown
- Save and view on map

### When to Use:
- Adding historical property data
- Bulk property registration
- Properties without associated requests
- Correcting or updating existing properties

### Benefits:
- Full control over property data
- Can add properties before requests are submitted
- Useful for pre-populating the map
- Admin can verify and correct data

---

## 3. BULK IMPORT (Database/Seeder) 📊

### How It Works:
Import multiple properties at once using database seeders or SQL scripts.

### Current Status:
✅ **IMPLEMENTED** - `PropertyLocationSeeder.php` exists

### When to Use:
- Initial system setup
- Migrating from old system
- Adding large datasets
- Testing and development

### How to Use:
```bash
# Run the seeder
php artisan db:seed --class=PropertyLocationSeeder

# Or create custom seeder for your data
php artisan make:seeder CustomPropertySeeder
```

### Benefits:
- Fast bulk addition
- Good for initial data migration
- Can import from CSV/Excel
- Repeatable and version-controlled

---

## Recommended Implementation Plan

### Phase 1: Enable Automatic Property Creation (HIGH PRIORITY)
1. Update `RequestController@store` to create `PropertyLocation` records
2. Add GPS coordinate fields to request form (optional but recommended)
3. Auto-assign zoning based on existing land use
4. Test with new request submissions

### Phase 2: Create Admin Manual Entry Interface (MEDIUM PRIORITY)
1. Create "Add Property" page in admin panel
2. Add form with all property fields
3. Integrate map picker for coordinates
4. Add to GIS & Zoning sidebar menu
5. Test manual property addition

### Phase 3: Enhance with Advanced Features (LOW PRIORITY)
1. Bulk import from CSV/Excel
2. Property editing interface
3. Property deletion with confirmation
4. Property search and filtering
5. Export property data

---

## Data Flow Diagram

### Automatic Flow (Client):
```
Client Submits Request
    ↓
Request Form Data
    ↓
RequestController@store
    ↓
Create Request Record
    ↓
[NEW] Create PropertyLocation Record
    ↓
Property Appears on GIS Map
```

### Manual Flow (Admin):
```
Admin Opens "Add Property" Page
    ↓
Fills Property Form
    ↓
Clicks Map to Set Coordinates
    ↓
Selects Zoning Rule
    ↓
Saves Property
    ↓
Property Appears on GIS Map
```

### Bulk Flow (Developer/Admin):
```
Prepare Property Data (CSV/Array)
    ↓
Create/Update Seeder
    ↓
Run: php artisan db:seed
    ↓
Properties Appear on GIS Map
```

---

## Property Data Requirements

### Required Fields:
- `latitude` - GPS latitude (decimal)
- `longitude` - GPS longitude (decimal)
- `address` - Full property address
- `lot_area` - Lot area in square meters

### Optional Fields:
- `request_id` - Link to request (nullable)
- `barangay` - Barangay name
- `district` - District name
- `zoning_rule_id` - Zoning classification
- `lot_number` - Lot number
- `title_number` - Title number
- `boundaries` - Property boundary coordinates (JSON)

---

## GPS Coordinates

### How to Get Coordinates:

**Method 1: Google Maps**
1. Open Google Maps
2. Right-click on property location
3. Click coordinates to copy
4. Format: `16.9754, 121.8947`

**Method 2: GPS Device**
- Use handheld GPS device
- Record latitude and longitude
- Ensure decimal format

**Method 3: Mobile Phone**
- Use GPS apps (GPS Status, Coordinates)
- Stand at property location
- Record coordinates

**Method 4: Map Picker (Recommended for Admin Interface)**
- Click on map to select location
- Coordinates auto-filled
- Visual confirmation

### Coordinate Format:
- Latitude: -90 to 90 (Ilagan City: ~16.97)
- Longitude: -180 to 180 (Ilagan City: ~121.89)
- Decimal places: 6-8 for accuracy

---

## Zoning Rule Assignment

### Automatic Assignment Logic:
```
Request "existing_land_use" → Zoning Rule
- Residential → R1 (Low Density Residential)
- Commercial → C1 (Neighborhood Commercial)
- Industrial → I1 (Light Industrial)
- Agricultural → A1 (Agricultural Zone)
- Institutional → R2 (Medium Density Residential)
- Mixed Use → MX1 (Mixed Use Zone)
```

### Manual Assignment:
Admin can override automatic assignment and select specific zoning rule from dropdown.

---

## Current Limitations

### What's Missing:
1. ❌ Automatic property creation from requests
2. ❌ GPS coordinates in request form
3. ❌ Admin UI for manual property addition
4. ❌ Property editing interface
5. ❌ Bulk import from CSV

### What Exists:
1. ✅ Property database table
2. ✅ Zoning rules system
3. ✅ GIS map display
4. ✅ Property seeder for testing
5. ✅ Property-request relationship

---

## Next Steps

### For Developers:
1. Implement automatic property creation in `RequestController`
2. Add GPS coordinate fields to request form
3. Create admin "Add Property" page
4. Add property editing functionality

### For Admins:
1. Use seeders to add initial property data
2. Wait for admin interface to be built
3. Manually add properties via database (temporary)

### For Clients:
1. Continue submitting requests normally
2. Properties will appear on map once automatic creation is enabled
3. Provide accurate location information

---

## Technical Implementation Notes

### Database Relationship:
```php
Request (1) → (0..1) PropertyLocation
- A request can have zero or one property location
- A property location can exist without a request
```

### Auto-Creation Logic:
```php
// In RequestController@store, after creating request:
if ($validated['lot_area_sqm'] && $validated['project_location_barangay']) {
    PropertyLocation::create([
        'request_id' => $newRequest->id,
        'address' => $location,
        'barangay' => $validated['project_location_barangay'],
        'lot_area' => $validated['lot_area_sqm'],
        'latitude' => $validated['latitude'] ?? null,
        'longitude' => $validated['longitude'] ?? null,
        'zoning_rule_id' => $this->getZoningRuleId($validated['existing_land_use']),
    ]);
}
```

---

## FAQ

**Q: Can properties exist without requests?**
A: Yes, `request_id` is nullable. Properties can be standalone.

**Q: What if GPS coordinates are not provided?**
A: Properties can be created without coordinates, but won't appear on map until coordinates are added.

**Q: Can one request have multiple properties?**
A: Currently no. One request = one property location. This can be enhanced later.

**Q: How do I update existing properties?**
A: Currently via database only. Admin edit interface coming soon.

**Q: Can clients see the map?**
A: Currently only admins. Can be made public if needed.

---

**Last Updated**: February 24, 2026
**Status**: Documentation Complete, Implementation Pending
