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
    /**
     * Wait for the transaction. A submission is written inside one, and an
     * attempt that is rolled back (a repeated application number, retried)
     * must not log, notify or mail anyone about an application that was
     * never filed.
     */
    public bool $afterCommit = true;

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

        // No decision notices from here. The two places that move a request to
        // approved or rejected — SuperAdminController::approveRequest and the
        // officer's denial in AdminController::reviewApplication — tell the
        // applicant themselves, with the Treasury fee or the actual reason.
        // Doing it here as well sent every applicant a second notice, and the
        // denial one always read "did not meet the requirements" because the
        // reason lives on the report, not on this row.
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
