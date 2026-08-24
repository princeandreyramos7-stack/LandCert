# Requirement Document Upload Feature

## Overview
This feature allows applicants to upload multiple softcopy documents (images/PDFs) for each requirement field in their application. Each requirement field can accept up to 5 or more document files.

## Implementation Status: ✅ COMPLETED

---

## Features

### 1. **Multiple File Upload Per Requirement**
- Each requirement field allows uploading multiple documents (not limited to 5)
- Example: "Accomplished and notarized APPLICATION FORM" can have 5 separate scanned pages uploaded
- Supports both images (JPG, PNG) and PDF files
- Maximum file size: 5MB per file

### 2. **User-Friendly Interface**
- Visual preview of images before upload
- PDF files show a file icon with filename
- Remove individual files from pending uploads before submission
- "Add More" button to add additional files to a requirement
- Shows count of files ready to upload in the submit button

### 3. **Document Management**
- View previously uploaded documents with upload dates
- Multiple documents per requirement are preserved (not overwritten)
- Each document is stored with unique filename to prevent conflicts
- View uploaded documents in new tab

### 4. **Progress Tracking**
- Shows count of required documents uploaded vs total required
- Visual indicators for uploaded requirements (green background)
- Badge showing "X / Y Required Documents"
- Alert when required documents are missing

### 5. **Security**
- Applicants can only upload documents for their own applications
- File type validation (only JPG, PNG, PDF allowed)
- File size validation (max 5MB per file)
- Secure file storage in Laravel storage

---

## File Structure

### Backend Files

#### 1. **Controller**: `app/Http/Controllers/RequirementDocumentController.php`
- `index($requestId)` - Show upload page with requirements list
- `upload(Request $request)` - Handle multiple file uploads per requirement
- `destroy($id)` - Delete a document

**Key Implementation Details:**
```php
// Handles array of files per requirement
$files = $request->file($fileKey);
if (!is_array($files)) {
    $files = [$files];
}

// Process each file individually
foreach ($files as $file) {
    $filename = 'requirement_' . $applicationId . '_' . $requirementId . '_' . time() . '_' . uniqid() . '.' . $extension;
    $path = $file->storeAs('requirement_documents', $filename, 'public');
    
    RequirementDocument::create([...]);
    $uploadedCount++;
}
```

#### 2. **Model**: `app/Models/RequirementDocument.php`
- Stores document metadata
- Relationship to Request model

#### 3. **Migration**: `database/migrations/2026_08_20_110643_create_requirement_documents_table.php`
Schema:
- `request_id` - Foreign key to requests table
- `requirement_id` - Requirement identifier
- `requirement_name` - Name of requirement
- `file_path` - Storage path
- `original_filename` - Original filename from user
- `mime_type` - File MIME type
- `file_size` - File size in bytes

#### 4. **Constants**: `app/Constants/ApplicationRequirements.php`
Official requirements from HLURB memorandum Circular No. 01 series of 1998, ANNEX B:
- `COMMON_REQUIREMENTS` - Base requirements for all applications
- `SUP_REQUIREMENTS` - Special Use Permit requirements
- `TUP_REQUIREMENTS` - Temporary Use Permit requirements
- `ZONING_CLEARANCE_REQUIREMENTS` - Zoning Clearance requirements

### Frontend Files

#### 1. **Upload Page**: `resources/js/Pages/UploadRequirements.jsx`

**Key Features:**
- Multiple file selection with `multiple` attribute
- File validation (type and size)
- Preview generation for images
- Individual file removal before upload
- Batch submission of all selected files

**State Management:**
```javascript
const [uploads, setUploads] = useState({});     // Stores File objects by requirement
const [previews, setPreviews] = useState({});   // Stores preview URLs by requirement
```

**Multiple File Handling:**
```javascript
const handleFileSelect = (requirementId, event) => {
    const files = Array.from(event.target.files);
    // Validate files
    // Combine with existing files
    const existingFiles = uploads[requirementId] || [];
    const allFiles = [...existingFiles, ...validFiles];
    setUploads(prev => ({ ...prev, [requirementId]: allFiles }));
};
```

**FormData Submission:**
```javascript
Object.entries(uploads).forEach(([requirementId, files]) => {
    files.forEach((file, index) => {
        formData.append(`documents[${requirementId}][]`, file);
    });
    formData.append(`requirement_ids[]`, requirementId);
});
```

#### 2. **My Applications List**: `resources/js/Components/MyApplications/MyApplicationsList.jsx`
- Added "Upload Requirements" button for each application
- Button redirects to upload page

### Routes

**File**: `routes/web.php`
```php
Route::middleware('auth')->group(function () {
    // Upload requirements page
    Route::get('/upload-requirements/{requestId}', [RequirementDocumentController::class, 'index'])
        ->name('requirements.index');
    
    // Submit uploaded documents
    Route::post('/upload-requirements', [RequirementDocumentController::class, 'upload'])
        ->name('requirements.upload');
    
    // Delete a document
    Route::delete('/requirement-documents/{id}', [RequirementDocumentController::class, 'destroy'])
        ->name('requirements.destroy');
});
```

---

## How It Works

### Upload Flow

1. **Applicant navigates to "My Applications"**
   - Sees list of submitted applications
   - Clicks "Upload Requirements" button

2. **Upload Requirements Page Loads**
   - Fetches application details
   - Loads appropriate requirements based on project type
   - Shows already uploaded documents

3. **User Selects Files**
   - Clicks "Choose Files" button for a requirement
   - Selects one or multiple files from device
   - Files are validated (type and size)
   - Preview is generated for images
   - Can select more files by clicking "Add More"

4. **User Reviews Selection**
   - Sees previews of all pending uploads
   - Can remove individual files before submission
   - Submit button shows total file count: "Upload X File(s)"

5. **User Submits Upload**
   - All files are sent via FormData
   - Backend processes each file individually
   - Files stored with unique names
   - Database records created
   - Success message shown
   - Page refreshes to show uploaded documents

6. **View Uploaded Documents**
   - Previously uploaded documents appear under each requirement
   - Shows filename and upload date
   - Eye icon button to view document in new tab

---

## Data Flow

### Frontend to Backend
```javascript
// FormData structure sent to backend
FormData {
    'application_id': 123,
    'documents[1][]': File1,
    'documents[1][]': File2,
    'documents[1][]': File3,
    'documents[3][]': File4,
    'documents[3][]': File5,
    'requirement_ids[]': 1,
    'requirement_ids[]': 3
}
```

### Backend Processing
```php
// Laravel receives:
[
    'application_id' => 123,
    'documents' => [
        1 => [File1, File2, File3],
        3 => [File4, File5]
    ],
    'requirement_ids' => [1, 3]
]

// Processes each file:
foreach ($requirementIds as $requirementId) {
    $files = $request->file("documents.{$requirementId}");
    foreach ($files as $file) {
        // Store file
        // Create database record
    }
}
```

---

## Requirements (ANNEX B - HLURB)

### Zoning Clearance / Locational Clearance
1. ✅ Accomplished and notarized APPLICATION FORM (Required)
2. ✅ Proof of Right Over Land - Tax Declaration/Certificate of Title (Required)
3. ✅ VICINITY MAP showing existing land uses within prescribed radius (Required)
4. ✅ SITE DEVELOPMENT PLAN showing project site, lot area boundaries & dimension (Required)
5. ✅ ESTIMATED PROJECT COST / BILL OF MATERIALS (Required)
6. ✅ Barangay Clearance (Required)
7. AFFIDAVIT OF NO OBJECTION (Optional)
8. ENVIRONMENTAL COMPLIANCE CERTIFICATE (ECC) / CNC (Optional)
9. Certification of road right of way from DPWH (if within National Road) (Optional)

### Special Use Permit (SUP)
1. Accomplished and notarized APPLICATION FORM
2. Proof of Right Over Land
3. VICINITY MAP showing existing land uses
4. SITE DEVELOPMENT PLAN
5. ESTIMATED PROJECT COST / BILL OF MATERIALS
6. Barangay Clearance
7. Environmental Compliance Certificate (ECC)
8. Other supporting documents

### Temporary Use Permit (TUP)
1. Accomplished and notarized APPLICATION FORM
2. Valid Government-Issued ID
3. Location Sketch / Vicinity Map
4. Barangay Clearance
5. Business Permit (if commercial)
6. Other supporting documents

---

## Testing Checklist

### ✅ Frontend Tests
- [x] Multiple file selection works
- [x] File type validation (only JPG, PNG, PDF)
- [x] File size validation (max 5MB)
- [x] Image preview generation
- [x] PDF file icon display
- [x] Individual file removal
- [x] Add more files to same requirement
- [x] Submit button shows correct file count
- [x] Upload progress indicator
- [x] Success message after upload
- [x] Previously uploaded documents display
- [x] View uploaded document in new tab

### ✅ Backend Tests
- [x] Multiple files per requirement accepted
- [x] Files stored with unique names
- [x] Database records created correctly
- [x] Security check (user can only upload for own applications)
- [x] File validation on server side
- [x] Old documents preserved (not deleted)
- [x] Correct file path storage
- [x] Success response with count

### ✅ Integration Tests
- [x] Upload 5 files to one requirement
- [x] Upload files to multiple requirements
- [x] Upload mix of images and PDFs
- [x] Page refresh shows uploaded documents
- [x] Previously uploaded documents persist
- [x] Add more files after initial upload

---

## File Storage

### Storage Location
```
storage/app/public/requirement_documents/
```

### Filename Format
```
requirement_{applicationId}_{requirementId}_{timestamp}_{uniqid}.{extension}
```

Example:
```
requirement_123_1_1724154000_64f2b8c9d1234.jpg
requirement_123_1_1724154001_64f2b8c9d5678.pdf
requirement_123_3_1724154002_64f2b8c9d9abc.png
```

### Public Access
Files are accessible via:
```
/storage/requirement_documents/{filename}
```

Laravel's symbolic link from `public/storage` to `storage/app/public` must be created:
```bash
php artisan storage:link
```

---

## Security Features

1. **Authentication Required**
   - Only logged-in users can access upload page
   - Middleware: `auth`

2. **Authorization Check**
   - Applicants can only upload for their own applications
   - Check: `$request->user_id === auth()->user()->id`

3. **File Validation**
   - Server-side: Laravel validation rules
   - Client-side: HTML5 accept attribute + JavaScript validation
   - Allowed types: `jpg, jpeg, png, pdf`
   - Max size: 5MB per file

4. **Unique Filenames**
   - Prevents filename collisions
   - Uses timestamp + uniqid()
   - Prevents overwriting existing files

5. **Secure Storage**
   - Files stored outside public directory
   - Accessed via Laravel's storage system
   - Can add additional access control if needed

---

## Future Enhancements (Optional)

1. **Document Viewer**
   - In-page PDF viewer
   - Image lightbox gallery

2. **Admin Review Interface**
   - Admin can view all uploaded documents
   - Mark documents as verified/rejected
   - Request re-upload with comments

3. **Document Status**
   - Pending review
   - Approved
   - Rejected with reason
   - Needs re-submission

4. **Notifications**
   - Email when documents are uploaded
   - SMS reminder for missing documents
   - Notify when documents are reviewed

5. **Bulk Operations**
   - Delete multiple documents at once
   - Download all documents as ZIP
   - Bulk approve/reject

6. **Document Versioning**
   - Keep history of replaced documents
   - Version numbers
   - Audit trail

---

## Known Limitations

1. **File Size**: 5MB per file (configurable in validation)
2. **File Types**: Only images and PDFs (configurable in validation)
3. **No Progress Bar**: For individual large file uploads
4. **No Drag & Drop**: File selection is via file picker only
5. **No Compression**: Large images uploaded as-is

---

## Configuration

### Laravel File Upload Settings

**File**: `php.ini` or `.htaccess`
```ini
upload_max_filesize = 10M
post_max_size = 50M
max_file_uploads = 50
```

### Storage Disk Configuration

**File**: `config/filesystems.php`
```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

---

## Troubleshooting

### Issue: Files not uploading
**Solution**: 
- Check PHP upload limits
- Verify storage directory is writable
- Check browser console for JavaScript errors

### Issue: Uploaded files not visible
**Solution**:
- Run `php artisan storage:link`
- Check file permissions
- Verify APP_URL in .env

### Issue: "File too large" error
**Solution**:
- Increase PHP upload_max_filesize
- Increase post_max_size
- Increase Laravel validation rule max size

### Issue: Multiple files not working
**Solution**:
- Ensure `multiple` attribute on file input
- Check FormData is using array syntax: `documents[{id}][]`
- Verify backend expects array: `documents.*.*`

---

## Success Criteria ✅

- [x] Applicants can upload multiple documents per requirement field
- [x] Example: 5 documents for "Accomplished and notarized APPLICATION FORM"
- [x] Both images and PDFs are supported
- [x] File validation works on client and server
- [x] Preview shows before upload
- [x] Individual file removal works
- [x] Submit button shows accurate file count
- [x] Previously uploaded documents are preserved
- [x] Documents can be viewed after upload
- [x] Security checks prevent unauthorized uploads
- [x] Official HLURB requirements implemented

---

## Documentation Date
August 20, 2026

## Feature Status
✅ **FULLY IMPLEMENTED AND TESTED**
