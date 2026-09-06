<?php

namespace App\Observers;

use App\Models\Request;
use App\Services\DashboardCacheService;
use App\Services\AuditLogService;
use App\Services\NotificationService;
use App\Mail\ApplicationSubmitted;
use Illuminate\Support\Facades\Mail;

class RequestObserver
{
    protected $cacheService;

    public function __construct(DashboardCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Handle the Request "created" event.
     */
    public function created(Request $request): void
    {
        $this->cacheService->clearCache();
        
        // Load relationships to access normalized data
        $request->load(['applicant.corporation', 'applicant.primaryRepresentative', 'project', 'location', 'property', 'user']);
        
        $applicantName = $request->applicant->applicant_name ?? 'Applicant';
        
        AuditLogService::logCreate(
            'Request',
            $request->id,
            $request->toArray(),
            "Created new request for {$applicantName}"
        );
        
        // Create notifications for application submission
        NotificationService::applicationSubmitted($request);
        
        // Send email notification to the user
        if ($request->user && $request->user->email) {
            try {
                Mail::to($request->user->email)->send(
                    new ApplicationSubmitted(
                        (object)[
                            'id' => $request->id,
                            'applicant_name' => $applicantName,
                            'applicant_address' => $request->applicant->applicant_address ?? 'N/A',
                            'project_type' => $request->project->project_type ?? 'N/A',
                            'project_nature' => $request->project->project_nature ?? 'N/A',
                            // The template prints a submission date; without
                            // this the email rendered with a warning and no date.
                            'created_at' => $request->created_at ?? now(),
                        ],
                        $request->user->name
                    )
                );
                \Log::info('Application submitted email sent to: ' . $request->user->email . ' for request ID: ' . $request->id);
            } catch (\Exception $e) {
                \Log::error('Failed to send application submitted email: ' . $e->getMessage());
            }
        }
    }

    /**
     * Handle the Request "updated" event.
     */
    public function updated(Request $request): void
    {
        $this->cacheService->clearCache();
        
        // Load relationships to access normalized data
        $request->load(['applicant']);
        $applicantName = $request->applicant->applicant_name ?? 'Applicant';
        
        AuditLogService::logUpdate(
            'Request',
            $request->id,
            $request->getOriginal(),
            $request->getChanges(),
            "Updated request for {$applicantName}"
        );
        
        // Check if status changed to create appropriate notifications
        if ($request->isDirty('status')) {
            $newStatus = $request->status;
            $oldStatus = $request->getOriginal('status');
            
            if ($newStatus === 'approved' && $oldStatus !== 'approved') {
                NotificationService::applicationApproved($request, auth()->user());
            } elseif ($newStatus === 'rejected' && $oldStatus !== 'rejected') {
                $reason = $request->rejection_reason ?? 'Application did not meet the requirements';
                NotificationService::applicationRejected($request, $reason, auth()->user());
            }
        }
    }

    /**
     * Handle the Request "deleted" event.
     */
    public function deleted(Request $request): void
    {
        $this->cacheService->clearCache();
        
        // Load relationships to access normalized data
        $request->load(['applicant']);
        $applicantName = $request->applicant->applicant_name ?? 'Applicant';
        
        AuditLogService::logDelete(
            'Request',
            $request->id,
            $request->toArray(),
            "Deleted request for {$applicantName}"
        );
    }
}
