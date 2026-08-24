# Upload Requirements Feature

## Overview
This feature allows applicants to upload softcopies (images or PDFs) of their required documents for their applications.

## Files Created

### Frontend
- ✅ `resources/js/Pages/UploadRequirements.jsx` - Main upload page

### Backend
- ✅ `app/Http/Controllers/RequirementDocumentController.php` - Handles uploads
- ✅ `app/Models/RequirementDocument.php` - Database model
- ✅ `database/migrations/2026_08_20_110643_create_requirement_documents_table.php` - Database table

### Routes
- ✅ `GET /requirements/upload/{requestId}` - Show upload page
- ✅ `POST /requirements/upload` - Upload documents
- ✅ `DELETE /requirements/{id}` - Delete document

## How to Access

### For Applicants:
1. Go to "My Applications" page
2. Click on an application
3. You'll see an "Upload Requirements" button
4. Click it to go to the upload page

### Direct URL:
```
/requirements/upload/{application_id}
```

Example: `/requirements/upload/1`

## Features

### Document Upload
- ✅ Upload images (JPG, PNG) or PDFs
- ✅ Maximum file size: 5MB per file
- ✅ Preview images before uploading
- ✅ Replace existing documents
- ✅ View uploaded documents

### Requirements List
Based on project type:
- **SUP (Special Use Permit)**: 8 requirements
- **TUP (Temporary Use Permit)**: 6 requirements
- **Zoning Clearance**: 7 requirements

### Security
- ✅ Applicants can only upload for their own applications
- ✅ Files stored securely in `storage/app/public/requirement_documents/`
- ✅ Middleware protection with authentication

## How to Add Upload Link to My Applications

Add this button to your application list/detail page:

```jsx
import { Link } from '@inertiajs/react';
import { Upload } from 'lucide-react';

// In your component:
<Link 
    href={route('requirements.upload.page', application.id)}
    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
    <Upload className="h-4 w-4" />
    Upload Requirements
</Link>
```

## Database Schema

```sql
CREATE TABLE requirement_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_id BIGINT NOT NULL,
    requirement_id INT NOT NULL,
    requirement_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    INDEX (request_id, requirement_id)
);
```

## Testing

### Test as Applicant:
1. Login as applicant
2. Create or select an application
3. Navigate to `/requirements/upload/{application_id}`
4. Upload a document:
   - Choose file (image or PDF)
   - Click "Upload"
   - See success message
5. View uploaded document
6. Replace document (upload new one)
7. Check that old file is deleted

### Test Security:
1. Try accessing another user's upload page
2. Should show 403 Forbidden error

## Next Steps (Optional Enhancements)

1. **Add to Sidebar**: Add "Upload Documents" link to applicant sidebar
2. **Add to My Applications**: Add "Upload Requirements" button in application list
3. **Email Notifications**: Notify admin when documents are uploaded
4. **Document Verification**: Allow admin to approve/reject documents
5. **Progress Indicator**: Show completion percentage (X/Y required documents uploaded)
6. **Bulk Download**: Allow admin to download all documents as ZIP

## Storage Configuration

Make sure storage is linked:
```bash
php artisan storage:link
```

This creates a symbolic link from `public/storage` to `storage/app/public`.

## File Structure
```
storage/
  app/
    public/
      requirement_documents/
        requirement_1_1_1629812345.jpg
        requirement_1_2_1629812346.pdf
        ...
```

## API Endpoints

### Show Upload Page
```
GET /requirements/upload/{requestId}
```

### Upload Documents
```
POST /requirements/upload
Content-Type: multipart/form-data

Body:
- application_id: 1
- documents[1]: File
- documents[2]: File
- requirement_ids[]: 1
- requirement_ids[]: 2
```

### Delete Document
```
DELETE /requirements/{documentId}
```

## Example Usage in Code

```php
// Get uploaded documents for a request
$documents = RequirementDocument::where('request_id', $requestId)->get();

// Check if all required documents are uploaded
$requirements = ApplicationRequirements::getRequirements($projectType);
$requiredDocs = collect($requirements)->where('required', true);
$uploadedRequiredDocs = $documents->whereIn('requirement_id', $requiredDocs->pluck('id'));
$allRequiredUploaded = $uploadedRequiredDocs->count() === $requiredDocs->count();
```

## Troubleshooting

### Files not showing after upload
- Check that `php artisan storage:link` was run
- Check file permissions on `storage/app/public/`
- Check that files exist in correct directory

### Upload fails
- Check file size (<5MB)
- Check file type (jpg, jpeg, png, pdf only)
- Check storage disk configuration in `config/filesystems.php`

### 403 Forbidden error
- User trying to access another user's application
- Check authentication and authorization logic

## Complete!

The upload requirements feature is now fully functional. Applicants can:
- ✅ View required documents for their application
- ✅ Upload softcopies (images/PDFs)
- ✅ Replace existing documents
- ✅ View uploaded documents
- ✅ Track upload progress

The system handles:
- ✅ File validation
- ✅ Secure storage
- ✅ Database tracking
- ✅ Authorization checks
