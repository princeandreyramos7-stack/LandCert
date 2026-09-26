<?php

namespace App\Http\Controllers;

use App\Constants\ApplicationRequirements;
use App\Models\Request as RequestModel;
use App\Models\RequirementDocument;
use App\Rules\ReadableDocument;
use App\Support\UploadLimits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RequirementDocumentController extends Controller
{
    /**
     * Upload requirement documents
     */
    public function upload(Request $request)
    {
        $request->validate([
            'application_id' => 'required|exists:requests,id',
            'documents.*.*' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:' . UploadLimits::MAX_FILE_KB],
            'requirement_ids' => 'required|array',
            'requirement_ui_ids' => 'nullable|array',
            'requirement_names' => 'nullable|array',
        ]);

        $applicationId = $request->input('application_id');
        $requirementIds = $request->input('requirement_ids');
        $requirementUiIds = $request->input('requirement_ui_ids', []);
        $requirementNames = $request->input('requirement_names', []);
        
        // Security check
        $requestModel = RequestModel::findOrFail($applicationId);
        $currentUser = auth()->user();
        if ($currentUser->user_type === 'applicant' && $requestModel->user_id !== $currentUser->id) {
            abort(403, 'You are not authorized to upload documents for this application.');
        }

        // Get requirements list
        $requirements = ApplicationRequirements::getRequirements($requestModel->project?->project_type ?? 'ZONING CLEARANCE');
        $requirementsMap = collect($requirements)->keyBy('id');

        $uploadedCount = 0;

        // Process each UI ID (which may be compound like '2-a' or simple like 1)
        foreach ($requirementUiIds as $index => $uiId) {
            $fileKey = "documents.{$uiId}";
            
            if (!$request->hasFile($fileKey)) {
                continue;
            }

            // Get the database ID (might be same as UI ID or different for compound IDs)
            $dbId = $requirementIds[$index] ?? $uiId;
            
            // Get requirement name - either from mapping or from requirements list
            $requirementName = $requirementNames[$uiId] ?? null;
            if (!$requirementName) {
                $requirement = $requirementsMap->get($dbId);
                $requirementName = $requirement ? $requirement['name'] : "Requirement #{$dbId}";
            }

            // Get array of files for this requirement
            $files = $request->file($fileKey);
            
            // Ensure files is an array
            if (!is_array($files)) {
                $files = [$files];
            }

            // Process each file
            foreach ($files as $file) {
                // Generate unique filename with microtime for uniqueness
                $extension = $file->getClientOriginalExtension();
                $filename = 'requirement_' . $applicationId . '_' . $dbId . '_' . time() . '_' . uniqid() . '.' . $extension;
                
                // Store file on the private disk (not publicly web-accessible)
                $path = $file->storeAs('requirement_documents', $filename, 'local');

                // Create new document record (don't delete old ones - allow multiple documents per requirement)
                RequirementDocument::create([
                    'request_id' => $applicationId,
                    'requirement_id' => $dbId,
                    'requirement_name' => $requirementName,
                    'file_path' => $path,
                    'original_filename' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);

                $uploadedCount++;
            }
        }

        // Notify the applicant via SMS that their requirements were submitted
        // and that they should wait for staff review + a scheduled payment.
        if ($uploadedCount > 0) {
            try {
                $requestModel->loadMissing('user');
                $phone = $requestModel->user?->contact_number;
                $name = $requestModel->user?->name ?? $requestModel->applicant?->applicant_name ?? 'Applicant';

                if ($phone) {
                    app(\App\Services\SmsService::class)->sendRequirementsSubmitted(
                        $phone,
                        $name,
                        $requestModel->application_number ?? 'TPZ-' . date('m-y') . '-' . str_pad($requestModel->id, 4, '0', STR_PAD_LEFT)
                    );
                }
            } catch (\Exception $e) {
                \Log::error('Failed to send requirements submitted SMS: ' . $e->getMessage());
            }
        }

        return redirect()->back()->with('success', "Successfully uploaded {$uploadedCount} document(s).");
    }

    /**
     * A no-save check of one file against the same readability rule the
     * wizard's final submission enforces. Step 4 collects every file in the
     * browser and only posts them all at the end (there is no application
     * row yet to attach a real upload to), so without this a bad scan was
     * not caught until Submit was pressed on the whole form. This runs the
     * identical rule immediately when the file is attached - nothing here
     * is written to disk or the database; the file exists only for the
     * length of this request.
     *
     * The size limit matches RequestController::store()'s
     * requirement_uploads.*.* rule exactly (5MB, not the 20MB a live
     * application's re-upload allows) - a file that passes this check must
     * also pass the one at final submission.
     */
    public function checkReadability(Request $request)
    {
        $request->validate([
            'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:' . UploadLimits::MAX_FILE_KB, new ReadableDocument],
        ]);

        return response()->json(['ok' => true]);
    }

    /**
     * Upload the notarized application form (requirement #1) after submission.
     *
     * This requirement is deliberately not collected during the application wizard:
     * the applicant can only produce it by printing the submitted form and having
     * it notarized, so it is uploaded afterwards from My Applications.
     */
    public function uploadNotarizedForm(Request $request, $id)
    {
        $this->assertApplicantMayUpload(RequestModel::findOrFail($id));

        return $this->storeApplicantRequirement(
            $request,
            $id,
            self::NOTARIZED_APPLICATION_FORM_ID,
            '1. Accomplished and notarized APPLICATION FORM',
            'Notarized application form uploaded successfully.'
        );
    }

    /**
     * Applicant uploads a document against any single requirement of their own
     * application, from the Application Details page. Same storage rules as the
     * notarized-form upload — just parameterised by requirement.
     *
     * Once submitted, every requirement is frozen — missing ones included. The
     * applicant can only upload again after the office hands the application
     * back or denies it.
     */
    public function uploadApplicantRequirement(Request $request, $id)
    {
        $validated = $request->validate([
            'requirement_id' => 'required',
            'requirement_name' => 'nullable|string|max:255',
            'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:' . UploadLimits::MAX_FILE_KB],
        ]);

        $requestModel = RequestModel::findOrFail($id);
        
        // Check if this is the notarized application form (requirement #1)
        $isNotarizedForm = $validated['requirement_id'] == self::NOTARIZED_APPLICATION_FORM_ID;
        
        // Allow notarized form upload regardless of status, but check status for other requirements
        if (!$isNotarizedForm) {
            $this->assertApplicantMayUpload($requestModel);
        } else {
            // For notarized form, only check ownership
            $currentUser = auth()->user();
            if (!in_array($currentUser->user_type, ['admin', 'super_admin'])
                && $requestModel->user_id !== $currentUser->id) {
                abort(403, 'You are not authorized to upload documents for this application.');
            }
        }

        return $this->storeApplicantRequirement(
            $request,
            $id,
            $validated['requirement_id'],
            $validated['requirement_name'] ?? ('Requirement #' . $validated['requirement_id']),
            'Document uploaded successfully.'
        );
    }

    /**
     * A submitted application is read-only to its applicant. Uploading reopens
     * only when the office returns it for correction ('in_applicant') or denies
     * it ('rejected'); staff are never blocked, since they upload on the
     * applicant's behalf at the counter.
     */
    private function assertApplicantMayUpload(RequestModel $requestModel): void
    {
        if (in_array(auth()->user()->user_type, ['admin', 'super_admin'], true)) {
            return;
        }

        // Whose application it is comes before what state it is in: someone
        // else's applicant gets a refusal, not a note about why *their*
        // documents are locked - which would tell them the application is
        // under review.
        if ($requestModel->user_id !== auth()->id()) {
            abort(403, 'You are not authorized to upload documents for this application.');
        }

        $status = strtolower((string) $requestModel->status);

        if (!in_array($status, RequestModel::APPLICANT_EDITABLE_STATUSES, true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'document' => 'Your documents are locked: this application has already been decided, so its requirements are now part of that decision and cannot be changed.',
            ]);
        }
    }

    /**
     * Shared implementation: ownership check, private-disk storage, and marking
     * the requirement as supplied on the request's verified_requirements map.
     */
    private function storeApplicantRequirement(Request $request, $id, $requirementId, string $requirementName, string $successMessage)
    {
        $request->validate([
            'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:' . UploadLimits::MAX_FILE_KB, new ReadableDocument],
        ]);

        $requestModel = RequestModel::findOrFail($id);

        // Applicants may only upload against their own application.
        $currentUser = auth()->user();
        if (!in_array($currentUser->user_type, ['admin', 'super_admin'])
            && $requestModel->user_id !== $currentUser->id) {
            abort(403, 'You are not authorized to upload documents for this application.');
        }

        $file = $request->file('document');

        // This endpoint is the "Upload"/"Replace" action for a single
        // requirement slot: the page offers one file input, so whatever is
        // already on file for this requirement is what the applicant means
        // to replace, not add to. Clear it before storing the new one -
        // otherwise a "Replace" upload was silently kept alongside the old
        // file (or, for a second raw image, rejected outright even though
        // there was never a way to attach two images in the same request
        // through this endpoint to begin with).
        $existingDocuments = RequirementDocument::where('request_id', $requestModel->id)
            ->where('requirement_id', $requirementId)
            ->get();

        foreach ($existingDocuments as $existingDocument) {
            Storage::disk('local')->delete($existingDocument->file_path);
            $existingDocument->delete();
        }

        $filename = 'requirement_' . $requestModel->id . '_' . $requirementId . '_' . time() . '_' . uniqid()
            . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs('requirement_documents', $filename, 'local');

        // Ensure MIME type is correctly detected, especially for PDFs
        $mimeType = $file->getMimeType();
        $extension = strtolower($file->getClientOriginalExtension());
        
        // Override MIME type if extension is PDF but detected as something else
        if ($extension === 'pdf' && $mimeType !== 'application/pdf') {
            $mimeType = 'application/pdf';
        }

        RequirementDocument::create([
            'request_id' => $requestModel->id,
            'requirement_id' => $requirementId,
            'requirement_name' => $requirementName,
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $mimeType,
            'file_size' => $file->getSize(),
        ]);

        // NOTE: uploading a document does NOT verify the requirement. The Zoning
        // Officer reviews the file and turns on "Mark as Verified" themselves.

        \App\Services\AuditLogService::log(
            'requirement_uploaded',
            "{$requirementName} uploaded for request #{$requestModel->id}",
            'Request',
            $requestModel->id
        );

        // Staff uploading on the applicant's behalf are already looking at the
        // application — only an applicant's own upload is news to the office.
        if (!in_array($currentUser->user_type, ['admin', 'super_admin'], true)) {
            try {
                \App\Services\NotificationService::requirementUploaded($requestModel, $requirementName);
            } catch (\Exception $e) {
                \Log::error('Failed to notify staff of requirement upload: ' . $e->getMessage());
            }
        }

        return redirect()->back()->with('success', $successMessage);
    }

    /**
     * Requirement id of the notarized application form, as defined in the
     * application wizard's requirement list.
     */
    private const NOTARIZED_APPLICATION_FORM_ID = 1;

    /**
     * Delete a requirement document
     */
    public function destroy($id)
    {
        $document = RequirementDocument::findOrFail($id);

        // Security check
        $currentUser = auth()->user();
        $requestModel = $document->request;
        if ($currentUser->user_type === 'applicant' && $requestModel->user_id !== $currentUser->id) {
            abort(403, 'You are not authorized to delete this document.');
        }

        // A submitted application is frozen: without this, an applicant could
        // delete a document mid-review, which the upload lock exists to prevent.
        $this->assertApplicantMayUpload($requestModel);

        // Delete file from storage
        Storage::disk('local')->delete($document->file_path);

        // Delete database record
        $document->delete();

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }

    /**
     * Stream/download a requirement document.
     * Only the owning applicant or admin/super_admin/staff may access the file.
     */
    public function view($id)
    {
        $document = RequirementDocument::findOrFail($id);
        $requestModel = $document->request;

        $currentUser = auth()->user();
        if ($currentUser->user_type === 'applicant' && $requestModel->user_id !== $currentUser->id) {
            abort(403, 'You are not authorized to view this document.');
        }

        // Try both public and local disks. The file is scanned once and then
        // shown in several places at once - the report's preview, its printed
        // pack and its PDF all draw the same scan - so the browser is told it
        // may keep its copy for a short while rather than fetch it again for
        // each, and given an ETag so a later check is answered without the
        // bytes. Private: it is one applicant's document, for this viewer.
        foreach (['public', 'local'] as $disk) {
            if (Storage::disk($disk)->exists($document->file_path)) {
                $response = \App\Support\CachedFileResponse::make(
                    Storage::disk($disk),
                    $document->file_path,
                    $document->original_filename
                );
                
                // Override content type with the stored MIME type to ensure correct rendering
                if ($document->mime_type) {
                    $response->headers->set('Content-Type', $document->mime_type);
                }
                
                return $response;
            }
        }

        abort(404, 'File not found.');
    }
}
