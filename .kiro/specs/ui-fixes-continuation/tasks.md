# Tasks: Fix UI Issues - Dropdown, Requirements Numbering, and Region Field

## Task 1: Fix Critical Build Error - Duplicate Align Attribute
**Priority**: CRITICAL  
**Estimated effort**: 5 minutes

### Description
Remove duplicate `align="end"` attribute from DropdownMenuContent in ApplicationsTable.jsx that is causing build failure.

### Steps
1. Open `resources/js/Components/Applications/ApplicationsTable.jsx`
2. Navigate to lines 130-136 (the DropdownMenuContent component in Actions function)
3. Remove line 132 which contains standalone `align="end"`
4. Keep line 134 with all attributes: `align="end" side="bottom" sideOffset={8} className="z-[100] min-w-[200px]"`
5. Optionally format for readability (each prop on its own line)
6. Save file

### Expected Result
```jsx
<DropdownMenuContent
    onClick={(e) => e.stopPropagation()}
    align="end"
    side="bottom"
    sideOffset={8}
    className="z-[100] min-w-[200px]"
>
```

### Verification
- Run `npm run build`
- Build completes successfully with no JSX duplicate attribute errors
- No other build errors introduced

---

## Task 2: Verify and Test Dropdown Menu Positioning
**Priority**: HIGH  
**Estimated effort**: 15 minutes  
**Depends on**: Task 1

### Description
After fixing the duplicate attribute, verify that dropdown menu positioning works correctly when clicking the 3-dots action button.

### Steps
1. Run `npm run dev` to start development server
2. Navigate to Applications page (as Admin or SuperAdmin role)
3. Locate any application row in the table
4. Click the 3-dots (MoreVertical) button in the Action column
5. Observe dropdown behavior:
   - Does it open downward from the button?
   - Is it aligned to the right edge of the button?
   - Are "View Application" and "Document Verification" menu items fully visible?
   - Can you click the menu items successfully?

### Acceptance Criteria
- Dropdown opens downward (below the trigger button)
- Dropdown is right-aligned with the trigger button
- Menu items are fully visible and clickable
- No overlap with table content
- Behavior is consistent across multiple rows

### If positioning is still incorrect:
1. Try adjusting props:
   - Remove `side="bottom"` to let Radix auto-detect direction
   - Adjust `sideOffset` value (try 4, 6, 10)
   - Add `alignOffset={0}` or adjust to negative/positive values
2. Check for parent container issues:
   - Inspect table container for `overflow: hidden`
   - Verify z-index hierarchy
3. Consider Portal approach if needed

### Verification
- Take screenshot of dropdown in open state
- User confirms "items going down" issue is resolved
- Dropdown works on desktop and tablet screen sizes

---

## Task 3: Investigate and Fix Duplicate Requirements Numbering
**Priority**: MEDIUM  
**Estimated effort**: 30 minutes

### Description
Investigate why "6. Barangay clearance" appears with duplicate "6" in My Applications > Application Details, then fix the issue.

### Investigation Steps
1. Open `resources/js/Pages/Applicant/ApplicationDetails.jsx`
2. Locate the requirements rendering section (search for "renderRequirement")
3. Check how `req.name` is displayed
4. Open `app/Constants/ApplicationRequirements.php`
5. Check the definition of requirement ID 12:
   ```php
   [
       'id' => 12,
       'name' => '6. Barangay Clearance',  // Already has "6." prefix
   ```
6. Search for any code that adds numbering prefix to requirement names
7. Check if the issue is in:
   - The constant definition (already has number)
   - The rendering logic (adds another number)
   - The map iteration (uses index to add number)

### Expected Finding
- ApplicationRequirements.php includes "6." in the name
- ApplicationDetails.jsx displays `req.name` as-is
- No additional numbering should be added

### If duplicate "6." truly exists in display:

**Option A: Fix in Constants** (Recommended)
1. Remove number prefixes from all requirement names in ApplicationRequirements.php
2. Update rendering logic to add consistent numbering:
   ```jsx
   {mainRequirements.map((req, index) => (
       <div key={req.id}>
           <p>{index + 1}. {req.name}</p>
       </div>
   ))}
   ```

**Option B: Fix in Display Logic**
1. Strip number prefix from req.name before displaying:
   ```jsx
   const displayName = req.name.replace(/^\d+\.\s*/, '');
   ```
2. Add numbering in map iteration if needed

### Implementation
1. Choose Option A or B based on investigation findings
2. Update relevant file(s)
3. Test display for all project types (CZC, SUP, TUP, ZC)
4. Verify all requirements show correct single numbering

### Verification
- View Application Details for CZC application
- Confirm "6. Barangay clearance" shows only once (not "6. 6.")
- Verify all other requirements (1-5) show correct numbering
- Test SUP, TUP, ZC applications for consistent numbering
- Optional requirements show "(Optional)" suffix correctly

---

## Task 4: Backend - Add Region API Endpoints
**Priority**: HIGH  
**Estimated effort**: 1 hour

### Description
Create backend API endpoints to support Region selection in address forms.

### Steps

#### 4.1: Check Database Schema
1. Check if region columns exist in database tables:
   ```bash
   php artisan db:show applications --column
   php artisan db:show users --column
   ```
2. Look for columns like:
   - `project_location_region`
   - `applicant_region`
   - `corporation_region`
   - `representative_region`

#### 4.2: Create Migration (if needed)
1. Create migration:
   ```bash
   php artisan make:migration add_region_fields_to_applications_table
   ```
2. Edit migration file:
   ```php
   public function up()
   {
       Schema::table('applications', function (Blueprint $table) {
           $table->string('project_location_region', 10)->nullable()->after('project_type');
           $table->string('applicant_region', 10)->nullable()->after('applicant_address');
           $table->string('corporation_region', 10)->nullable()->after('corporation_address');
           $table->string('representative_region', 10)->nullable()->after('representative_address');
       });
   }

   public function down()
   {
       Schema::table('applications', function (Blueprint $table) {
           $table->dropColumn([
               'project_location_region',
               'applicant_region',
               'corporation_region',
               'representative_region'
           ]);
       });
   }
   ```
3. Run migration:
   ```bash
   php artisan migrate
   ```

#### 4.3: Add Regions Endpoint
1. Open `app/Http/Controllers/PSGCController.php` (or create if doesn't exist)
2. Add regions method:
   ```php
   public function regions()
   {
       $regions = [
           ['code' => '01', 'name' => 'Region I', 'long_name' => 'Ilocos Region'],
           ['code' => '02', 'name' => 'Region II', 'long_name' => 'Cagayan Valley'],
           ['code' => '03', 'name' => 'Region III', 'long_name' => 'Central Luzon'],
           ['code' => '04A', 'name' => 'Region IV-A', 'long_name' => 'CALABARZON'],
           ['code' => '04B', 'name' => 'Region IV-B', 'long_name' => 'MIMAROPA'],
           ['code' => '05', 'name' => 'Region V', 'long_name' => 'Bicol Region'],
           ['code' => '06', 'name' => 'Region VI', 'long_name' => 'Western Visayas'],
           ['code' => '07', 'name' => 'Region VII', 'long_name' => 'Central Visayas'],
           ['code' => '08', 'name' => 'Region VIII', 'long_name' => 'Eastern Visayas'],
           ['code' => '09', 'name' => 'Region IX', 'long_name' => 'Zamboanga Peninsula'],
           ['code' => '10', 'name' => 'Region X', 'long_name' => 'Northern Mindanao'],
           ['code' => '11', 'name' => 'Region XI', 'long_name' => 'Davao Region'],
           ['code' => '12', 'name' => 'Region XII', 'long_name' => 'SOCCSKSARGEN'],
           ['code' => '13', 'name' => 'Region XIII', 'long_name' => 'Caraga'],
           ['code' => '14', 'name' => 'NCR', 'long_name' => 'National Capital Region'],
           ['code' => '15', 'name' => 'CAR', 'long_name' => 'Cordillera Administrative Region'],
           ['code' => '16', 'name' => 'BARMM', 'long_name' => 'Bangsamoro Autonomous Region in Muslim Mindanao'],
       ];

       return response()->json(['data' => $regions]);
   }
   ```

#### 4.4: Update Provinces Endpoint
1. Modify provinces method to accept region filter:
   ```php
   public function provinces(Request $request)
   {
       $regionCode = $request->query('region');
       
       // If using database with region_code column:
       $query = DB::table('provinces')->select('code', 'name', 'region_code', 'region_name');
       
       if ($regionCode) {
           $query->where('region_code', $regionCode);
       }
       
       $provinces = $query->orderBy('name')->get();
       
       return response()->json(['data' => $provinces]);
   }
   ```

#### 4.5: Add Routes
1. Open `routes/web.php`
2. Add region route:
   ```php
   Route::get('/psgc/regions', [PSGCController::class, 'regions'])->name('psgc.regions.index');
   ```
3. Ensure provinces route exists:
   ```php
   Route::get('/psgc/provinces', [PSGCController::class, 'provinces'])->name('psgc.provinces.index');
   ```

#### 4.6: Update Validation
1. Open application request validation file (e.g., `app/Http/Requests/StoreApplicationRequest.php`)
2. Add region validation rules:
   ```php
   public function rules()
   {
       return [
           // ... existing rules
           'project_location_region' => ['required', 'string', 'max:10'],
           'applicant_region' => ['required', 'string', 'max:10'],
           'corporation_region' => ['nullable', 'string', 'max:10'],
           'representative_region' => ['nullable', 'string', 'max:10'],
       ];
   }
   ```

### Verification
- Test endpoint: `GET /psgc/regions` returns 17 regions
- Test endpoint: `GET /psgc/provinces` returns all provinces
- Test endpoint: `GET /psgc/provinces?region=02` returns only Region II provinces
- Migration runs successfully
- Validation accepts region fields

---

## Task 5: Frontend - Add Region Field to PhilippineAddressFields Component
**Priority**: HIGH  
**Estimated effort**: 1.5 hours  
**Depends on**: Task 4

### Description
Update PhilippineAddressFields.jsx component to include Region dropdown and implement cascading filtering.

### Steps

#### 5.1: Update State Management
1. Open `resources/js/Components/Address/PhilippineAddressFields.jsx`
2. Add region to lists state:
   ```jsx
   const [lists, setLists] = useState({ 
       regions: [],      // ADD
       provinces: [], 
       cities: [], 
       barangays: [] 
   });
   ```
3. Add region to loading state:
   ```jsx
   const [loading, setLoading] = useState({ 
       regions: false,   // ADD
       provinces: true, 
       cities: false, 
       barangays: false 
   });
   ```

#### 5.2: Load Regions on Mount
1. Add useEffect to load regions:
   ```jsx
   useEffect(() => { 
       load("regions", route("psgc.regions.index"), "all"); 
   }, [load]);
   ```

#### 5.3: Update Cascade Logic
1. Add region to cascade clearing:
   ```jsx
   const set = (part, value) => {
       const below = {
           region: ["province_code", "city_code", "barangay_code"],  // ADD
           province_code: ["city_code", "barangay_code"],
           city_code: ["barangay_code"],
       }[part] || [];

       onChange(field(part), value);
       below.forEach((p) => onChange(field(p), ""));
   };
   ```

#### 5.4: Filter Provinces by Region
1. Update provinces useEffect:
   ```jsx
   const region = valueOf("region");  // ADD
   const province = valueOf("province_code");
   const city = valueOf("city_code");

   useEffect(() => {
       if (!region) {  // CHANGE: was !province
           setLists((s) => ({ ...s, provinces: [], cities: [], barangays: [] })); 
           return; 
       }
       load("provinces", route("psgc.provinces.index") + `?region=${region}`, region);
   }, [region, load]);  // CHANGE: was [province, load]
   ```

#### 5.5: Add Region Dropdown to UI
1. Update the grid section to include Region row:
   ```jsx
   <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
       <Row
           part="region"
           label="Region"
           options={lists.regions.map((r) => ({
               value: r.code,
               label: r.name,
               hint: r.long_name,
           }))}
           loadingLevel="regions"
           placeholder="Select region"
           emptyText="No regions available"
       />
       <Row
           part="province_code"
           label="Province"
           options={lists.provinces.map((p) => ({
               value: p.code,
               label: p.name,
               hint: [PROVINCE_LABEL[p.kind], p.region_name].filter(Boolean).join(" · "),
           }))}
           loadingLevel="provinces"
           placeholder="Select province"
           waitingFor={region ? null : "region"}  // CHANGE: add this
           emptyText="No provinces available"
       />
       {/* ... rest unchanged */}
   </div>
   ```

#### 5.6: Update Component Documentation
1. Update the component JSDoc comment to reflect Region is now included:
   ```jsx
   /**
    * Region → Province → Municipality/City → Barangay → Street.
    *
    * Each list is fetched only once its parent has been chosen...
    * ...
    * The four values live in the form's own state under `${prefix}_region`
    * ... `${prefix}_street`, so they post with the rest of the form.
    */
   ```

### Verification
- Component renders with Region dropdown as first field
- Region dropdown loads 17 options
- Selecting region loads provinces for that region only
- Province dropdown shows "Select region first" when region is empty
- Selecting province loads municipalities correctly
- Changing region clears province, city, and barangay selections
- All validations work (red asterisk, error messages)

---

## Task 6: Update Forms to Include Region Fields
**Priority**: HIGH  
**Estimated effort**: 1 hour  
**Depends on**: Task 5

### Description
Update all forms that use PhilippineAddressFields to include region in their state and submission.

### Steps

#### 6.1: Update Registration Form
1. Open registration form file (likely `resources/js/Pages/Auth/Register.jsx` or similar)
2. Add region fields to initial state:
   ```jsx
   const [formData, setFormData] = useState({
       // ... existing fields
       applicant_region: '',
       corporation_region: '',
       representative_region: '',
   });
   ```
3. Verify PhilippineAddressFields receives region in values prop:
   ```jsx
   <PhilippineAddressFields
       prefix="applicant"
       values={formData}
       onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
       errors={errors}
       legend="Applicant Address"
       required={true}
   />
   ```
4. Check form submission includes region fields

#### 6.2: Update Application Form
1. Open application form (likely in `resources/js/Pages/Applicant/` or `resources/js/Components/`)
2. Add project_location_region to form state:
   ```jsx
   const [formData, setFormData] = useState({
       // ... existing fields
       project_location_region: '',
   });
   ```
3. Verify PhilippineAddressFields for project location includes region
4. Check form submission includes region field

#### 6.3: Update Any Other Forms
1. Search for all usages of PhilippineAddressFields:
   ```bash
   grep -r "PhilippineAddressFields" resources/js/
   ```
2. For each usage, ensure:
   - Form state includes `${prefix}_region` field
   - Field is initialized to empty string
   - Field is passed to component in values prop
   - Field is submitted with form

### Verification
- Registration form includes applicant_region field
- Registration form includes corporation_region field (if corporation section shown)
- Registration form includes representative_region field (if representative section shown)
- Application form includes project_location_region field
- All forms submit successfully with region data
- Form validation shows errors for missing region

---

## Task 7: Test Complete Region Field Implementation
**Priority**: HIGH  
**Estimated effort**: 1 hour  
**Depends on**: Task 6

### Description
End-to-end testing of region field across all forms and application lifecycle.

### Test Cases

#### TC1: Registration with Region
1. Navigate to registration page
2. Fill out applicant information
3. In Applicant Address section:
   - Select Region (e.g., "Region II - Cagayan Valley")
   - Verify Province dropdown enables
   - Select Province (e.g., "Isabela")
   - Select Municipality (e.g., "Ilagan City")
   - Select Barangay
   - Enter Street address
4. Submit registration form
5. Verify account created successfully
6. Check database: verify applicant_region is saved

#### TC2: Application with Project Location Region
1. Log in as applicant
2. Start new application
3. Fill out application form
4. In Project Location section:
   - Select Region
   - Select Province
   - Select Municipality
   - Select Barangay
   - Enter Street
5. Submit application
6. Verify submission successful
7. Check database: verify project_location_region is saved

#### TC3: View Application with Region
1. View submitted application details
2. Verify Project Location displays region
3. Verify Applicant Address displays region

#### TC4: Region Cascading Behavior
1. In any address form:
   - Select Region A
   - Select Province X (from Region A)
   - Select Municipality Y
   - Change Region to Region B
   - Verify Province X is cleared (because it's not in Region B)
   - Verify Municipality Y is cleared
   - Select new Province from Region B
   - Verify municipalities load for new province

#### TC5: Validation
1. Try to submit form without selecting Region
2. Verify error message: "The applicant region field is required"
3. Select Region
4. Try to submit without Province
5. Verify error message: "The applicant province code field is required"

#### TC6: Backward Compatibility
1. View an existing application created before region field was added
2. Verify it displays without errors
3. Verify region shows as empty or "(Not recorded)" if null

### Verification
- All test cases pass
- No JavaScript console errors
- Region data is saved and displayed correctly
- Cascading selection works smoothly
- Validation errors are clear and helpful

---

## Task 8: Run Build and Deploy
**Priority**: MEDIUM  
**Estimated effort**: 15 minutes  
**Depends on**: All previous tasks

### Description
Build frontend assets and verify application is ready for deployment.

### Steps
1. Run production build:
   ```bash
   npm run build
   ```
2. Verify build completes successfully with no errors
3. Check build output for:
   - No warnings about missing dependencies
   - Proper code splitting
   - Asset size is reasonable
4. Test application in production mode:
   ```bash
   php artisan serve
   ```
5. Navigate through all modified pages:
   - Applications table (test dropdown)
   - Application Details (test requirements numbering)
   - Registration form (test region field)
   - Application form (test region field)
6. Verify everything works as expected

### Verification
- `npm run build` completes with exit code 0
- No console errors in browser
- All features work in production build
- Application is ready for deployment

---

## Summary

**Total Tasks**: 8  
**Estimated Total Time**: 5.5 - 6 hours

**Task Breakdown**:
- Task 1: 5 min (Critical fix)
- Task 2: 15 min (Test dropdown)
- Task 3: 30 min (Requirements numbering)
- Task 4: 1 hour (Backend API)
- Task 5: 1.5 hours (Frontend component)
- Task 6: 1 hour (Update forms)
- Task 7: 1 hour (E2E testing)
- Task 8: 15 min (Build & deploy)

**Dependencies**:
```
Task 1 (Fix duplicate attribute)
  ↓
Task 2 (Test dropdown) → Task 3 (Requirements) → Task 8 (Build)
                                                   ↑
Task 4 (Backend) → Task 5 (Frontend) → Task 6 (Forms) → Task 7 (Testing)
```

**Critical Path**: Tasks 1, 4, 5, 6, 7, 8 (Region field implementation)
**Quick Wins**: Tasks 1, 2, 3 (Can be completed in < 1 hour)
