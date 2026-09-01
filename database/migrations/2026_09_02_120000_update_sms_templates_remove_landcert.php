<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Update all SMS templates to remove "LandCert" references and use "CPDO LC"
     * to match the current system branding.
     */
    public function up(): void
    {
        $templates = [
            'application_submitted' => [
                'message' => 'Hi {name}! Your application #{application_number} has been submitted. We will review it and notify you of the result. - CPDO LC',
            ],
            'application_reviewed' => [
                'message' => 'Hi {name}! Application #{application_number} has been reviewed by admin and is now pending final approval. You will be notified once fully approved. - CPDO LC',
            ],
            'requirements_submitted' => [
                'message' => 'Hi {name}! Your requirements for application #{application_number} were submitted successfully. Please wait while our staff reviews your application. - CPDO LC',
            ],
            'application_approved' => [
                'message' => 'Good news {name}! Application #{application_number} is APPROVED. Please visit the CPDO office for the next steps. Check your email for payment details. - CPDO LC',
            ],
            'application_approved_next_steps' => [
                'message' => 'Hi {name}! Application #{application_number} is APPROVED. Next step: Pay PHP {amount} at the City Treasury Office and bring your Official Receipt to the CPDO office. - CPDO LC',
            ],
            'application_rejected' => [
                'message' => '{name}, application #{application_number} was REJECTED. Reason: {reason}. Contact CPDO office for details. - CPDO LC',
            ],
            'payment_verified' => [
                'message' => '{name}, payment of PHP {amount} for application #{application_number} is VERIFIED. Your certificate will be prepared. - CPDO LC',
            ],
            'payment_rejected' => [
                'message' => '{name}, your payment for application #{application_number} was REJECTED. Reason: {reason}. Please resubmit or contact CPDO. - CPDO LC',
            ],
            'payment_reminder' => [
                'message' => 'Reminder: {name}, payment for application #{application_number} is due. Visit CPDO office to complete payment. - CPDO LC',
            ],
            'certificate_preparing' => [
                'message' => '{name}, certificate #{cert_number} is being prepared. You will be notified when it is ready for pickup at CPDO. - CPDO LC',
            ],
            'certificate_ready' => [
                'message' => '{name}, certificate #{cert_number} for application #{application_number} is READY for pickup at CPDO office. Bring a valid ID. - CPDO LC',
            ],
            'certificate_released' => [
                'message' => 'Hi {name}! Your certificate #{cert_number} has been officially released. Thank you for using CPDO LC services. Contact us if you need assistance. - CPDO LC',
            ],
        ];

        foreach ($templates as $eventKey => $data) {
            DB::table('sms_templates')
                ->where('event_key', $eventKey)
                ->update([
                    'message' => $data['message'],
                    'updated_at' => now(),
                ]);
        }
    }

    /**
     * Reverse the migrations (restore LandCert references).
     */
    public function down(): void
    {
        $templates = [
            'application_submitted' => [
                'message' => 'Hi {name}! Your application #{application_number} has been submitted. We will review it and notify you of the result. - CPDO LandCert',
            ],
            'application_reviewed' => [
                'message' => 'Hi {name}! Application #{application_number} has been reviewed by admin and is now pending final approval. You will be notified once it is fully approved. - CPDO LandCert',
            ],
            'requirements_submitted' => [
                'message' => 'Hi {name}! Your requirements for application #{application_number} were submitted successfully. Please wait while our staff reviews your application. Once reviewed, you will be notified of your scheduled payment. - CPDO LandCert',
            ],
            'application_approved' => [
                'message' => 'Good news {name}! Application #{application_number} is APPROVED. Please visit the CPDO office for the next steps. Check your email for payment details. - CPDO LandCert',
            ],
            'application_approved_next_steps' => [
                'message' => 'Hi {name}! Application #{application_number} is APPROVED. Next step: Pay PHP {amount} at the City Treasury Office and bring your Official Receipt to the CPDO office. - CPDO LandCert',
            ],
            'application_rejected' => [
                'message' => '{name}, application #{application_number} was REJECTED. Reason: {reason}. Contact CPDO office for details. - CPDO LandCert',
            ],
            'payment_verified' => [
                'message' => '{name}, payment of PHP {amount} for application #{application_number} is VERIFIED. Your certificate will be prepared. - CPDO LandCert',
            ],
            'payment_rejected' => [
                'message' => '{name}, your payment for application #{application_number} was REJECTED. Reason: {reason}. Please resubmit or contact CPDO. - CPDO LandCert',
            ],
            'payment_reminder' => [
                'message' => 'Reminder: {name}, payment for application #{application_number} is due. Visit CPDO office to complete payment. - CPDO LandCert',
            ],
            'certificate_preparing' => [
                'message' => '{name}, certificate #{cert_number} is being prepared. You will be notified when it is ready for pickup at CPDO. - CPDO LandCert',
            ],
            'certificate_ready' => [
                'message' => '{name}, certificate #{cert_number} for application #{application_number} is READY for pickup at CPDO office. Bring a valid ID. - CPDO LandCert',
            ],
            'certificate_released' => [
                'message' => 'Hi {name}! Your certificate #{cert_number} has been officially released. Thank you for using CPDO LandCert. Contact us at the CPDO office if you need assistance. - CPDO LandCert',
            ],
        ];

        foreach ($templates as $eventKey => $data) {
            DB::table('sms_templates')
                ->where('event_key', $eventKey)
                ->update([
                    'message' => $data['message'],
                    'updated_at' => now(),
                ]);
        }
    }
};
