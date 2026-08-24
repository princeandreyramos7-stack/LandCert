# PART 1: Admin Review Request Changes - Implementation Plan

## Files to Modify
1. `resources/js/Pages/Admin/ReviewRequest.jsx` (PRIMARY)
2. `resources/js/Pages/SuperAdmin/ReviewRequest.jsx` (MIRROR CHANGES)
3. `resources/js/Pages/Admin/RequestDetails.jsx`

## Changes to Implement

### Change 1: Display Control Number Instead of Request ID
**Location:** Multiple places in the file
**Find:** `Request #{request.id}`
**Replace with:** `{request.control_number || `CPDO-${request.id}`}`

**Affected Lines:**
- Line ~195: `<Head title=...`
- Line ~245: `<BreadcrumbPage>`
- Line ~265: `<CardTitle>`

### Change 2: Make Project Type Editable in Step2Content
**Location:** Step2Content function (around line 916)
**Current:** Display-only InfoField
**New:** Editable dropdown with save functionality

```jsx
// Add state for editing
const [editingProjectType, setEditingProjectType] = useState(false);
const [projectType, setProjectType] = useState(request.project_type);

// Add update function
const handleProjectTypeUpdate = async () => {
    try {
        await axios.post(`/admin/update-project-type/${request.id}`, {
            project_type: projectType
        });
        toast({ title: "Success", description: "Project type updated" });
        setEditingProjectType(false);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to update" });
    }
};
```

### Change 3: Remove Appointment Details Section
**Location:** Inside `{action === 'reviewed' && ...}` block
**Lines to Remove:** ~380-420
**Section starts with:** `{/* Appointment Details */}`
**Section ends before:** `{/* Payment Amount */}`

### Change 4: Remove Payment Information Section  
**Location:** Inside `{action === 'reviewed' && ...}` block  
**Lines to Remove:** ~440-470
**Section starts with:** `{/* Payment Amount */}`
**Section ends before:** `{/* Requirements */}`

### Change 5: Remove Requirements Checklist Section
**Location:** Inside `{action === 'reviewed' && ...}` block
**Lines to Remove:** ~480-580
**Section starts with:** `{/* Requirements */}`
**Includes:** All the checkbox loading and mapping logic

### Change 6: Remove Additional Notes Section
**Location:** Later in the form
**Look for:** textarea with `admin_notes` or character counter "0/1000 characters"

### Change 7: Simplify Form Submission
**Update:** Remove fields from formData state that are no longer needed:
- `appointment_date`
- `appointment_time`  
- `payment_amount`
- `requirements`
- `admin_notes`
- `other_requirement_text`

**Keep only:**
- `rejection_reason` (for rejected status)

## Implementation Order
1. ✅ Change Request ID to Control Number (3 locations)
2. ✅ Remove unwanted sections (cleanest, least risky)
3. ✅ Simplify formData state
4. ✅ Make Project Type editable (requires new component logic)
5. ✅ Test and verify

## Status
- [ ] Started
- [ ] In Progress
- [ ] Completed
- [ ] Tested
