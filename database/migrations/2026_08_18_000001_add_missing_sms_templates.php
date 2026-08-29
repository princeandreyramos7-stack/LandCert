<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $templates = [
            [
                'event_key'   => 'application_reviewed',
                'event_label' => 'Application Reviewed (Pending Super Admin Approval)',
                'message'     => 'Hi {name}! Application #{request_id} has been reviewed by admin and is now pending final approval. You will be notified once it is fully approved. - CPDO LandCert',
                'enabled'     => true,
                'variables'   => json_encode(['{name}', '{request_id}']),
            ],
            [
                'event_key'   => 'application_approved_next_steps',
                'event_label' => 'Application Approved — Next Steps (Payment Instructions)',
                'message'     => 'Hi {name}! Application #{request_id} is APPROVED. Next step: Pay PHP {amount} at the City Treasury Office and bring your Official Receipt to the CPDO office. - CPDO LandCert',
                'enabled'     => true,
                'variables'   => json_encode(['{name}', '{request_id}', '{amount}']),
            ],
            [
                'event_key'   => 'certificate_released',
                'event_label' => 'Certificate Released / Collected',
                'message'     => 'Hi {name}! Your certificate #{cert_number} has been officially released. Thank you for using CPDO LandCert. Contact us at the CPDO office if you need assistance. - CPDO LandCert',
                'enabled'     => true,
                'variables'   => json_encode(['{name}', '{cert_number}']),
            ],
        ];

        foreach ($templates as $tpl) {
            // Only insert if not already present
            if (!DB::table('sms_templates')->where('event_key', $tpl['event_key'])->exists()) {
                DB::table('sms_templates')->insert(array_merge($tpl, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }

        // Update the existing application_approved template for consistency
        DB::table('sms_templates')
            ->where('event_key', 'application_approved')
            ->update([
                'message'   => 'Good news {name}! Application #{request_id} is APPROVED. Please visit the CPDO office for the next steps. Check your email for payment details. - CPDO LandCert',
                'updated_at'=> now(),
            ]);
    }

    public function down(): void
    {
        DB::table('sms_templates')->whereIn('event_key', [
            'application_reviewed',
            'application_approved_next_steps',
            'certificate_released',
        ])->delete();
    }
};
