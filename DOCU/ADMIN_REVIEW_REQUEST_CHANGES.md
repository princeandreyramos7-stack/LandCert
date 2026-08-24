# Admin Review Request Changes

## Summary of Required Changes

### 1. Change "Request #18" to "CPDO Control Number"
**Files to update:**
- `resources/js/Pages/Admin/ReviewRequest.jsx`
- `resources/js/Pages/SuperAdmin/ReviewRequest.jsx`
- `resources/js/Pages/Admin/RequestDetails.jsx`
- All components showing request ID

**Change:**
- From: `Request #{request.id}`
- To: `{request.control_number}` or `CPDO-{request.control_number}`

### 2. Make Project Type Editable in Step2Content
**Files to update:**
- `resources/js/Pages/Admin/ReviewRequest.jsx` - Step2Content function
- `resources/js/Pages/SuperAdmin/ReviewRequest.jsx` - Step2Content function

**Change:**
- Convert Project Type from readonly text to dropdown
- Options: N/A, TUP, SUP, Zoning (Zoning Clearance)
- Add state management to handle changes
- Add backend API call to update project_type

### 3. Show Uploaded Requirements in Review & Decision Section
**Files to update:**
- `resources/js/Pages/Admin/ReviewRequest.jsx`
- `resources/js/Pages/SuperAdmin/ReviewRequest.jsx`

**Change:**
- Fetch and display all requirement documents uploaded by applicant
- Show document names, file sizes, upload dates
- Add download/view buttons for each requirement
- Display in a table or card grid format

### 4. Remove Appointment Details Section
**Files to update:**
- `resources/js/Pages/Admin/ReviewRequest.jsx` (lines ~380-420)
- `resources/js/Pages/SuperAdmin/ReviewRequest.jsx` (similar section)

**Remove:**
```jsx
{/* Appointment Details */}
<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
    // Date and Time picker fields
</div>
```

### 5. Remove Payment Information Section  
**Files to update:**
- `resources/js/Pages/Admin/ReviewRequest.jsx` (lines ~440-470)
- `resources/js/Pages/SuperAdmin/ReviewRequest.jsx` (similar section)

**Remove:**
```jsx
{/* Payment Amount */}
<div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
    // Payment amount field
</div>
```

### 6. Remove Requirements Checklist Section
**Files to update:**
- `resources/js/Pages/Admin/ReviewRequest.jsx` (lines ~480-550)
- `resources/js/Pages/SuperAdmin/ReviewRequest.jsx` (similar section)

**Remove:**
```jsx
{/* Requirements */}
<div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
    // Requirements checklist with checkboxes
</div>
```

### 7. Remove Additional Notes Section
**Files to update:**
- `resources/js/Pages/Admin/ReviewRequest.jsx`
- `resources/js/Pages/SuperAdmin/ReviewRequest.jsx`

**Remove:**
```jsx
{/* Additional Notes */}
<textarea ... >
```

## Implementation Order

1. ✅ Change Request # to Control Number (easiest, most visible)
2. ✅ Make Project Type editable (moderate complexity)
3. ✅ Remove unwanted sections (Appointment, Payment, Requirements Checklist, Notes)
4. ✅ Add uploaded requirements display (most complex, requires backend integration)

## Backend Changes Needed

### Update Project Type
- Route: `POST /admin/update-project-type`
- Controller: `AdminController@updateProjectType`
- Validation: project_type in [N/A, TUP, SUP, Zoning]

### Fetch Uploaded Requirements  
- Route: `GET /admin/request/{id}/uploaded-requirements`
- Controller: `AdminController@getUploadedRequirements`
- Returns: Array of requirement documents with metadata

## Status
- [ ] Task 1: Control Number Display
- [ ] Task 2: Editable Project Type
- [ ] Task 3: Remove Sections
- [ ] Task 4: Show Uploaded Requirements
