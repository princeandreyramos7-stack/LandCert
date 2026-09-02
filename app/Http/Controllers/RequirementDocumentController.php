<?php

namespace App\Http\Controllers;

use App\Constants\ApplicationRequirements;
use App\Models\Request as RequestModel;
use App\Models\RequirementDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RequirementDocumentController extends Controller
{
    /**
     * Show the upload requirements page
     */
    public function index($requestId): Response
    {
        $request = RequestModel::with([
            'applicant',
            'project',
        ])->findOrFail($requestId);

        // Security: applicants can only upload for their own requests
        $currentUser = auth()->user();
        if ($currentUser->user_type === 'applicant' && $request->user_id !== $currentUser->id) {
            abort(403, 'You are not authorized to upload documents for this application.');
        }

        // Get requirements based on project type
        $requirements = ApplicationRequirements::getRequirements($request->project?->project_type ?? 'ZONING CLEARANCE');

        // Get already uploaded documents
        $uploadedDocuments = RequirementDocument::where('request_id', $requestId)
            ->get();

        $applicationData = [
            'id' => $request->id,
            'applicant_name' => $request->applicant?->applicant_name ?? '',
            'project_type' => $request->project?->project_type ?? '',
            'project_nature' => $request->project?->project_nature ?? '',
        ];

        return Inertia::render('UploadRequirements', [
            'application' => $applicationData,
            'requirements' => $requirements,
            'uploadedDocuments' => $uploadedDocuments,
        ]);
    }

    /**
     * Upload requirement documents
     */
    public function upload(Request $request)
    {
        $request->validate([
            'application_id' => 'required|exists:requests,id',
            'documents.*.*' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max per file
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
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $this->assertApplicantMayUpload(RequestModel::findOrFail($id));

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

        $status = strtolower((string) $requestModel->status);

        if (!in_array($status, ['in_applicant', 'rejected'], true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'document' => 'Your documents are locked while the office reviews your application. You can upload again once the office returns the application to you.',
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
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $requestModel = RequestModel::findOrFail($id);

        // Applicants may only upload against their own application.
        $currentUser = auth()->user();
        if (!in_array($currentUser->user_type, ['admin', 'super_admin'])
            && $requestModel->user_id !== $currentUser->id) {
            abort(403, 'You are not authorized to upload documents for this application.');
        }

        $file = $request->file('document');
        $filename = 'requirement_' . $requestModel->id . '_' . $requirementId . '_' . time() . '_' . uniqid()
            . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs('requirement_documents', $filename, 'local');

        RequirementDocument::create([
            'request_id' => $requestModel->id,
            'requirement_id' => $requirementId,
            'requirement_name' => $requirementName,
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
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

        // Try both public and local disks
        if (Storage::disk('public')->exists($document->file_path)) {
            return Storage::disk('public')->response(
                $document->file_path,
                $document->original_filename
            );
        } elseif (Storage::disk('local')->exists($document->file_path)) {
            return Storage::disk('local')->response(
                $document->file_path,
                $document->original_filename
            );
        }

        abort(404, 'File not found.');
    }
}
