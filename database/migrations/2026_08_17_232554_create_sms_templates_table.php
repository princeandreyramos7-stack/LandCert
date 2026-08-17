<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_templates', function (Blueprint $table) {
            $table->id();
            $table->string('event_key')->unique();   // e.g. application_submitted
            $table->string('event_label');            // Human-readable label
            $table->text('message');                  // SMS message body
            $table->boolean('enabled')->default(true);
            $table->text('variables')->nullable();    // JSON list of available variables
            $table->timestamps();
        });

        // Seed default templates
        $templates = [
            [
                'event_key'   => 'application_submitted',
                'event_label' => 'Application Submitted',
                'message'     => 'Hi {name}! Your application #{request_id} has been submitted. We will review it and notify you of the result. - CPDO LandCert',
                'enabled'     => true,
                'variables'   => json_encode(['{name}', '{request_id}', '{email}']),
            ],
            [
                'event_key'   => 'application_approved',
                'event_label' => 'Application Approved',
                'message'     => 'Good news {name}! Application #{request_id} is APPROVED. Please visit the CPDO office to process payment and submit documents. - CPDO LandCert',
                'enabled'     => true,
                'variables'   => json_encode(['{name}', '{request_id}']),
            ],
            [
                'event_key'   => 'application_rejected',
                'event_label' => 'Application Rejected',
                'message'     => '{name}, application #{request_id} was REJECTED. Reason: {reason}. Contact CPDO office for details. - CPDO LandCert',
                'enabled'     => true,
                'variables'   => json_encode(['{name}', '{request_id}', '{reason}']),
            ],
            [
                'event_key'   => 'payment_verified',
                'event_label' => 'Payment Verified',
                'message'     => '{name}, payment of PHP {amount} for application #{request_id} is VERIFIED. Your certificate will be prepared. - CPDO LandCert',
                'enabled'     => true,
                'variables'   => json_encode(['{name}', '{request_id}', '{amount}']),
            ],
            [
                'event_key'   => 'payment_rejected',
                'event_label' => 'Payment Rejected',
                'message'     => '{name}, your payment for application #{request_id} was REJECTED. Reason: {reason}. Please resubmit or contact CPDO. - CPDO LandCert',
                'enabled'     => true,
                'variables'   => json_encode(['{name}', '{request_id}', '{reason}']),
            ],
            [
                'event_key'   => 'certificate_preparing',
                'event_label' => 'Certificate Being Prepared',
                'message'     => '{name}, certificate #{cert_number} is being prepared. You will be notified when it is ready for pickup at CPDO. - CPDO LandCert',
                'enabled'     => true,
                'variables'   => json_encode(['{name}', '{cert_number}']),
            ],
            [
                'event_key'   => 'certificate_ready',
                'event_label' => 'Certificate Ready for Pickup',
                'message'     => '{name}, certificate #{cert_number} for application #{request_id} is READY for pickup at CPDO office. Bring a valid ID. - CPDO LandCert',
                'enabled'     => true,
                'variables'   => json_encode(['{name}', '{request_id}', '{cert_number}']),
            ],
            [
                'event_key'   => 'payment_reminder',
                'event_label' => 'Payment Reminder',
                'message'     => 'Reminder: {name}, payment for application #{request_id} is due. Visit CPDO office to complete payment. - CPDO LandCert',
                'enabled'     => true,
                'variables'   => json_encode(['{name}', '{request_id}', '{days_remaining}']),
            ],
        ];

        foreach ($templates as $tpl) {
            DB::table('sms_templates')->insert(array_merge($tpl, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_templates');
    }
};
