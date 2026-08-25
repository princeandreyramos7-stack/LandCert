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
        ]);

        $applicationId = $request->input('application_id');
        $requirementIds = $request->input('requirement_ids');
        
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

        foreach ($requirementIds as $requirementId) {
            $fileKey = "documents.{$requirementId}";
            
            if (!$request->hasFile($fileKey)) {
                continue;
            }

            // Get array of files for this requirement
            $files = $request->file($fileKey);
            
            // Ensure files is an array
            if (!is_array($files)) {
                $files = [$files];
            }

            $requirement = $requirementsMap->get($requirementId);

            if (!$requirement) {
                continue;
            }

            // Process each file
            foreach ($files as $file) {
                // Generate unique filename with microtime for uniqueness
                $extension = $file->getClientOriginalExtension();
                $filename = 'requirement_' . $applicationId . '_' . $requirementId . '_' . time() . '_' . uniqid() . '.' . $extension;
                
                // Store file on the private disk (not publicly web-accessible)
                $path = $file->storeAs('requirement_documents', $filename, 'local');

                // Create new document record (don't delete old ones - allow multiple documents per requirement)
                RequirementDocument::create([
                    'request_id' => $applicationId,
                    'requirement_id' => $requirementId,
                    'requirement_name' => $requirement['name'],
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
                        $requestModel->id
                    );
                }
            } catch (\Exception $e) {
                \Log::error('Failed to send requirements submitted SMS: ' . $e->getMessage());
            }
        }

        return redirect()->back()->with('success', "Successfully uploaded {$uploadedCount} document(s).");
    }

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

        if (!Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('local')->response(
            $document->file_path,
            $document->original_filename
        );
    }
}
