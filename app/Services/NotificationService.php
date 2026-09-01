<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Request as RequestModel;
use App\Models\User;

class NotificationService
{
    /**
     * Helper method to ensure request has necessary relationships loaded
     */
    private static function ensureRelationshipsLoaded(RequestModel $request)
    {
        if (!$request->relationLoaded('applicant')) {
            $request->load(['applicant.corporation', 'applicant.primaryRepresentative', 'project', 'location', 'property']);
        }
        return $request;
    }

    /**
     * Helper method to safely get applicant name
     */
    private static function getApplicantName(RequestModel $request): string
    {
        self::ensureRelationshipsLoaded($request);
        return $request->applicant->applicant_name ?? 'Applicant';
    }

    /**
     * Send the same notification to every staff account holding one of the
     * given roles.
     *
     * @param  string[]  $roles  user_type values, e.g. ['admin', 'super_admin']
     */
    private static function notifyRoles(array $roles, string $type, string $title, string $message, ?string $link = null, ?array $data = null): void
    {
        foreach (User::whereIn('user_type', $roles)->get() as $staff) {
            Notification::createForUser($staff->id, $type, $title, $message, $link, $data);
        }
    }

    /**
     * Helper method to safely get project type
     */
    private static function getProjectType(RequestModel $request): string
    {
        self::ensureRelationshipsLoaded($request);
        return $request->project->project_type ?? 'application';
    }

    /**
     * Create notification when application is submitted
     */
    public static function applicationSubmitted(RequestModel $request)
    {
        self::ensureRelationshipsLoaded($request);
        $applicantName = self::getApplicantName($request);
        $projectType = self::getProjectType($request);
        $applicationNumber = $request->application_number ?? "#" . $request->id;
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'application_submitted',
            'Application Submitted Successfully',
            "Your application {$applicationNumber} for {$projectType} has been submitted successfully and is now pending review.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'project_type' => $projectType,
                'applicant_name' => $applicantName,
            ]
        );

        // The officer has to act on it; the administrator wants to see the
        // queue building up.
        self::notifyRoles(
            ['admin', 'super_admin'],
            'new_application',
            'New Application Received',
            "A new {$projectType} application {$applicationNumber} from {$applicantName} has been submitted and requires review.",
            "/admin/requests/{$request->id}",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'project_type' => $projectType,
                'applicant_name' => $applicantName,
            ]
        );
    }

    /**
     * Create notification when admin reviews application
     */
    public static function applicationReviewed(RequestModel $request, string $evaluation, ?User $reviewedBy = null)
    {
        self::ensureRelationshipsLoaded($request);
        $applicantName = self::getApplicantName($request);
        $projectType = self::getProjectType($request);
        $reviewerName = $reviewedBy ? $reviewedBy->name : 'Admin';
        $applicationNumber = $request->application_number ?? "#" . $request->id;
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'application_reviewed',
            'Application Reviewed',
            "Your application {$applicationNumber} has been reviewed by {$reviewerName}. Status: {$evaluation}",
            "/my-applications",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'evaluation' => $evaluation,
                'reviewed_by' => $reviewerName,
            ]
        );

        // Waiting on the Zoning Administrator's decision — and only theirs.
        if ($evaluation === 'approved') {
            self::notifyRoles(
                ['super_admin'],
                'application_awaiting_approval',
                'Application Awaiting Final Approval',
                "Application {$applicationNumber} from {$applicantName} has been reviewed and approved by {$reviewerName}. Awaiting your final approval.",
                "/super-admin/requests/{$request->id}/review",
                [
                    'application_id' => $request->id,
                    'application_number' => $applicationNumber,
                    'project_type' => $projectType,
                    'applicant_name' => $applicantName,
                    'reviewed_by' => $reviewerName,
                ]
            );
        }
    }

    /**
     * Create notification when super admin approves application
     */
    public static function applicationApproved(RequestModel $request, ?User $approvedBy = null)
    {
        self::ensureRelationshipsLoaded($request);
        $applicantName = self::getApplicantName($request);
        $approverName = $approvedBy ? $approvedBy->name : 'Super Admin';
        $applicationNumber = $request->application_number ?? "#" . $request->id;
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'application_approved',
            'Application Approved! 🎉',
            "Congratulations! Your application {$applicationNumber} has been approved by {$approverName}. You can now proceed to payment.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'approved_by' => $approverName,
            ]
        );

        // Notify admins who reviewed
        $admins = User::where('user_type', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::createForUser(
                $admin->id,
                'application_final_approved',
                'Application Finally Approved',
                "Application {$applicationNumber} from {$applicantName} has been finally approved by {$approverName}.",
                "/admin/requests/{$request->id}",
                [
                    'application_id' => $request->id,
                    'application_number' => $applicationNumber,
                    'applicant_name' => $applicantName,
                    'approved_by' => $approverName,
                ]
            );
        }
    }

    /**
     * Create notification when application is denied
     */
    public static function applicationRejected(RequestModel $request, string $reason, ?User $rejectedBy = null)
    {
        $rejectorName = $rejectedBy ? $rejectedBy->name : 'Admin';
        $applicationNumber = $request->application_number ?? "#" . $request->id;
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'application_rejected',
            'Application Denied',
            "Your application {$applicationNumber} has been denied by {$rejectorName}. Reason: {$reason}",
            "/my-applications",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'reason' => $reason,
                'rejected_by' => $rejectorName,
            ]
        );
    }

    /**
     * Create notification when the Zoning Administrator returns a reviewed
     * application to the Zoning Officer instead of approving it.
     *
     * This is not a denial the applicant is told about — the office has not
     * finished with the application, it has just gone back a step — so only
     * the Zoning Officer's queue (every admin account) is notified.
     */
    public static function applicationReturnedToAdmin(RequestModel $request, string $reason, ?User $returnedBy = null)
    {
        self::ensureRelationshipsLoaded($request);
        $applicantName = self::getApplicantName($request);
        $returnerName = $returnedBy ? $returnedBy->name : 'Zoning Administrator';
        $applicationNumber = $request->application_number ?? "#" . $request->id;

        self::notifyRoles(
            ['admin'],
            'application_returned',
            'Application Returned for Review',
            "Application {$applicationNumber} from {$applicantName} was returned by {$returnerName}. Reason: {$reason}",
            "/admin/requests/{$request->id}/document-verification",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'applicant_name' => $applicantName,
                'reason' => $reason,
                'returned_by' => $returnerName,
            ]
        );
    }

    /**
     * Create notification when payment receipt is uploaded
     */
    public static function paymentReceiptUploaded(RequestModel $request, $payment)
    {
        self::ensureRelationshipsLoaded($request);
        $applicantName = self::getApplicantName($request);
        $applicationNumber = $request->application_number ?? "#" . $request->id;
        
        self::notifyRoles(
            ['admin', 'super_admin'],
            'payment_receipt_uploaded',
            'Payment Receipt Uploaded',
            "Payment receipt has been uploaded for application {$applicationNumber} from {$applicantName}. Please verify.",
            "/admin/payments",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'payment_id' => $payment->id,
                'applicant_name' => $applicantName,
            ]
        );

        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'payment_receipt_submitted',
            'Payment Receipt Submitted',
            "Your payment receipt for application {$applicationNumber} has been submitted successfully and is awaiting verification.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'payment_id' => $payment->id,
            ]
        );
    }

    /**
     * Create notification when the applicant uploads a requirement document.
     *
     * Nothing used to be raised for this at all — a document could sit
     * unnoticed until somebody happened to open the application.
     */
    public static function requirementUploaded(RequestModel $request, string $requirementName)
    {
        self::ensureRelationshipsLoaded($request);
        $applicantName = self::getApplicantName($request);
        $applicationNumber = $request->application_number ?? "#" . $request->id;

        self::notifyRoles(
            ['admin', 'super_admin'],
            'requirement_uploaded',
            'Requirement Document Uploaded',
            "{$applicantName} uploaded \"{$requirementName}\" for application {$applicationNumber}. Please verify.",
            "/admin/requests/{$request->id}/document-verification",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'applicant_name' => $applicantName,
                'requirement_name' => $requirementName,
            ]
        );
    }

    /**
     * Create notification when payment is verified
     */
    public static function paymentVerified(RequestModel $request, $payment, ?User $verifiedBy = null)
    {
        $verifierName = $verifiedBy ? $verifiedBy->name : 'Admin';
        $applicationNumber = $request->application_number ?? "#" . $request->id;
        
        // Format payment details for the message (FR8.2: OR Number, Amount, Date, Next steps)
        $receiptNumber = $payment->receipt_number ?? 'N/A';
        $amount = number_format($payment->amount, 2);
        $paymentDate = $payment->payment_date ?? date('Y-m-d');
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'payment_verified',
            'Payment Confirmed ✓',
            "Your payment for application {$applicationNumber} has been confirmed by {$verifierName}. OR: {$receiptNumber}, Amount: ₱{$amount}, Date: {$paymentDate}. Your certificate will be processed next.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'payment_id' => $payment->id,
                'receipt_number' => $receiptNumber,
                'amount' => $payment->amount,
                'payment_date' => $paymentDate,
                'verified_by' => $verifierName,
            ]
        );
    }

    /**
     * Create notification when payment is denied
     */
    public static function paymentRejected(RequestModel $request, $payment, string $reason, ?User $rejectedBy = null)
    {
        $rejectorName = $rejectedBy ? $rejectedBy->name : 'Admin';
        $applicationNumber = $request->application_number ?? "#" . $request->id;
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'payment_rejected',
            'Payment Receipt Denied',
            "Your payment receipt for application {$applicationNumber} has been denied by {$rejectorName}. Reason: {$reason}. Please upload a new receipt.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'payment_id' => $payment->id,
                'reason' => $reason,
                'rejected_by' => $rejectorName,
            ]
        );
    }

    /**
     * Create notification when certificate is issued
     */
    public static function certificateIssued(RequestModel $request, $certificate)
    {
        $applicationNumber = $request->application_number ?? "#" . $request->id;
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'certificate_issued',
            'Certificate Issued! 🎊',
            "Great news! Your certificate for application {$applicationNumber} has been issued and is ready for release.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'certificate_id' => $certificate->id,
            ]
        );
    }

    /**
     * Create notification when certificate is released
     */
    public static function certificateReleased(RequestModel $request, $certificate, $release)
    {
        $applicationNumber = $request->application_number ?? "#" . $request->id;
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'certificate_released',
            'Certificate Released 📄',
            "Your certificate for application {$applicationNumber} has been released via {$release->release_mode}. Thank you for using our services!",
            "/my-applications",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'certificate_id' => $certificate->id,
                'release_id' => $release->id,
                'release_mode' => $release->release_mode,
            ]
        );
    }

    /**
     * Create notification for document missing/incomplete
     */
    public static function documentsIncomplete(RequestModel $request, array $missingDocuments)
    {
        $documentsList = implode(', ', $missingDocuments);
        $applicationNumber = $request->application_number ?? "#" . $request->id;
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'documents_incomplete',
            'Documents Required',
            "Your application {$applicationNumber} is missing some documents: {$documentsList}. Please submit them as soon as possible.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'missing_documents' => $missingDocuments,
            ]
        );
    }

    /**
     * Create reminder notification for pending action
     */
    public static function pendingActionReminder(RequestModel $request, string $action)
    {
        $applicationNumber = $request->application_number ?? "#" . $request->id;
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'pending_action_reminder',
            'Action Required ⏰',
            "Reminder: Your application {$applicationNumber} requires action - {$action}.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'application_number' => $applicationNumber,
                'action_required' => $action,
            ]
        );
    }

    /**
     * Create notification when certificate is generated (using Request model)
     */
    public static function certificateGenerated($request, $certificate)
    {
        // Handle both Application and Request models
        $userId = is_object($request) && property_exists($request, 'user_id') ? $request->user_id : null;
        $requestId = is_object($request) && property_exists($request, 'id') ? $request->id : null;
        
        if (!$userId || !$requestId) {
            \Log::warning('Certificate generated notification failed: Invalid request object');
            return;
        }
        
        // Notify the applicant
        Notification::createForUser(
            $userId,
            'certificate_generated',
            'Certificate Being Prepared 📝',
            "Your certificate (#{$certificate->certificate_number}) for application #{$requestId} is being prepared. You will be notified when it's ready for pickup at our office.",
            "/my-applications",
            [
                'request_id' => $requestId,
                'certificate_id' => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
            ]
        );
    }

    /**
     * Notify when certificate is ready for pickup
     */
    public static function certificateReady(RequestModel $request, $certificate)
    {
        self::ensureRelationshipsLoaded($request);
        $applicantName = self::getApplicantName($request);
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'certificate_ready',
            'Certificate Ready for Pickup',
            "Your certificate {$certificate->certificate_number} is now ready for pickup at the CPDO office. Please bring a valid ID.",
            "/my-applications/{$request->id}",
            [
                'request_id' => $request->id,
                'certificate_id' => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
            ]
        );

        // Send email notification
        try {
            $user = $request->user;
            if ($user && $user->email) {
                \Mail::to($user->email)->send(
                    new \App\Mail\CertificateReady($certificate, $request)
                );
                \Log::info("Certificate ready email sent", [
                    'certificate_id' => $certificate->id,
                    'recipient' => $user->email
                ]);
            }
        } catch (\Exception $e) {
            \Log::error("Failed to send certificate ready email", [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);
        }

        // Send SMS notification if enabled
        try {
            $smsService = app(SmsService::class);
            $user = $request->user;
            $phone = $smsService->resolvePhone($user);
            if ($smsService->isEnabled() && $user && $phone) {
                $smsService->sendCertificateReady(
                    $phone,
                    $user->name ?? 'Applicant',
                    $request->id,
                    $certificate->certificate_number
                );
                \Log::info("Certificate ready SMS sent", [
                    'certificate_id' => $certificate->id,
                    'recipient' => $phone
                ]);
            }
        } catch (\Exception $e) {
            \Log::error("Failed to send certificate ready SMS", [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);
        }

        // Notify admins about the certificate being ready
        $admins = User::where('user_type', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::createForUser(
                $admin->id,
                'certificate_marked_ready',
                'Certificate Marked Ready',
                "Certificate {$certificate->certificate_number} for {$applicantName} has been marked ready for pickup.",
                "/admin/certificates",
                [
                    'request_id' => $request->id,
                    'certificate_id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                ]
            );
        }
    }
}
