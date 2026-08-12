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
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'application_submitted',
            'Application Submitted Successfully',
            "Your application #{$request->id} for {$projectType} has been submitted successfully and is now pending review.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'project_type' => $projectType,
                'applicant_name' => $applicantName,
            ]
        );

        // Notify all admins
        $admins = User::where('user_type', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::createForUser(
                $admin->id,
                'new_application',
                'New Application Received',
                "A new {$projectType} application #{$request->id} from {$applicantName} has been submitted and requires review.",
                "/admin/applications/{$request->id}",
                [
                    'application_id' => $request->id,
                    'project_type' => $projectType,
                    'applicant_name' => $applicantName,
                ]
            );
        }
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
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'application_reviewed',
            'Application Reviewed',
            "Your application #{$request->id} has been reviewed by {$reviewerName}. Status: {$evaluation}",
            "/my-applications",
            [
                'application_id' => $request->id,
                'evaluation' => $evaluation,
                'reviewed_by' => $reviewerName,
            ]
        );

        // Notify super admins if evaluation is approved
        if ($evaluation === 'approved') {
            $superAdmins = User::where('user_type', 'admin')->get();
            foreach ($superAdmins as $superAdmin) {
                Notification::createForUser(
                    $superAdmin->id,
                    'application_awaiting_approval',
                    'Application Awaiting Final Approval',
                    "Application #{$request->id} from {$applicantName} has been reviewed and approved by {$reviewerName}. Awaiting your final approval.",
                    "/super-admin/applications/{$request->id}",
                    [
                        'application_id' => $request->id,
                        'project_type' => $projectType,
                        'applicant_name' => $applicantName,
                        'reviewed_by' => $reviewerName,
                    ]
                );
            }
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
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'application_approved',
            'Application Approved! 🎉',
            "Congratulations! Your application #{$request->id} has been approved by {$approverName}. You can now proceed to payment.",
            "/my-applications",
            [
                'application_id' => $request->id,
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
                "Application #{$request->id} from {$applicantName} has been finally approved by {$approverName}.",
                "/admin/applications/{$request->id}",
                [
                    'application_id' => $request->id,
                    'applicant_name' => $applicantName,
                    'approved_by' => $approverName,
                ]
            );
        }
    }

    /**
     * Create notification when application is rejected
     */
    public static function applicationRejected(RequestModel $request, string $reason, ?User $rejectedBy = null)
    {
        $rejectorName = $rejectedBy ? $rejectedBy->name : 'Admin';
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'application_rejected',
            'Application Rejected',
            "Your application #{$request->id} has been rejected by {$rejectorName}. Reason: {$reason}",
            "/my-applications",
            [
                'application_id' => $request->id,
                'reason' => $reason,
                'rejected_by' => $rejectorName,
            ]
        );
    }

    /**
     * Create notification when appointment is set
     */
    public static function appointmentSet(RequestModel $request, string $appointmentDate, string $appointmentTime)
    {
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'appointment_set',
            'Appointment Scheduled 📅',
            "An appointment has been scheduled for your application #{$request->id} on {$appointmentDate} at {$appointmentTime}. Please bring all required documents.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'appointment_date' => $appointmentDate,
                'appointment_time' => $appointmentTime,
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
        
        // Notify admins
        $admins = User::where('user_type', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::createForUser(
                $admin->id,
                'payment_receipt_uploaded',
                'Payment Receipt Uploaded',
                "Payment receipt has been uploaded for application #{$request->id} from {$applicantName}. Please verify.",
                "/admin/payments",
                [
                    'application_id' => $request->id,
                    'payment_id' => $payment->id,
                    'applicant_name' => $applicantName,
                ]
            );
        }

        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'payment_receipt_submitted',
            'Payment Receipt Submitted',
            "Your payment receipt for application #{$request->id} has been submitted successfully and is awaiting verification.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'payment_id' => $payment->id,
            ]
        );
    }

    /**
     * Create notification when payment is verified
     */
    public static function paymentVerified(RequestModel $request, $payment, ?User $verifiedBy = null)
    {
        $verifierName = $verifiedBy ? $verifiedBy->name : 'Admin';
        
        // Format payment details for the message (FR8.2: OR Number, Amount, Date, Next steps)
        $receiptNumber = $payment->receipt_number ?? 'N/A';
        $amount = number_format($payment->amount, 2);
        $paymentDate = $payment->payment_date ?? date('Y-m-d');
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'payment_verified',
            'Payment Confirmed ✓',
            "Your payment for application #{$request->id} has been confirmed by {$verifierName}. OR: {$receiptNumber}, Amount: ₱{$amount}, Date: {$paymentDate}. Your certificate will be processed next.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'payment_id' => $payment->id,
                'receipt_number' => $receiptNumber,
                'amount' => $payment->amount,
                'payment_date' => $paymentDate,
                'verified_by' => $verifierName,
            ]
        );
    }

    /**
     * Create notification when payment is rejected
     */
    public static function paymentRejected(RequestModel $request, $payment, string $reason, ?User $rejectedBy = null)
    {
        $rejectorName = $rejectedBy ? $rejectedBy->name : 'Admin';
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'payment_rejected',
            'Payment Receipt Rejected',
            "Your payment receipt for application #{$request->id} has been rejected by {$rejectorName}. Reason: {$reason}. Please upload a new receipt.",
            "/my-applications",
            [
                'application_id' => $request->id,
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
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'certificate_issued',
            'Certificate Issued! 🎊',
            "Great news! Your certificate for application #{$request->id} has been issued and is ready for release.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'certificate_id' => $certificate->id,
            ]
        );
    }

    /**
     * Create notification when certificate is released
     */
    public static function certificateReleased(RequestModel $request, $certificate, $release)
    {
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'certificate_released',
            'Certificate Released 📄',
            "Your certificate for application #{$request->id} has been released via {$release->release_mode}. Thank you for using our services!",
            "/my-applications",
            [
                'application_id' => $request->id,
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
        
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'documents_incomplete',
            'Documents Required',
            "Your application #{$request->id} is missing some documents: {$documentsList}. Please submit them as soon as possible.",
            "/my-applications",
            [
                'application_id' => $request->id,
                'missing_documents' => $missingDocuments,
            ]
        );
    }

    /**
     * Create reminder notification for pending action
     */
    public static function pendingActionReminder(RequestModel $request, string $action)
    {
        // Notify the applicant
        Notification::createForUser(
            $request->user_id,
            'pending_action_reminder',
            'Action Required ⏰',
            "Reminder: Your application #{$request->id} requires action - {$action}.",
            "/my-applications",
            [
                'application_id' => $request->id,
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
            if ($smsService->isEnabled() && $user && $user->phone) {
                $message = "Your certificate {$certificate->certificate_number} is ready for pickup at CPDO office. Bring valid ID. Contact: 078-123-4567";
                $smsService->send($user->phone, $message);
                \Log::info("Certificate ready SMS sent", [
                    'certificate_id' => $certificate->id,
                    'recipient' => $user->phone
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
