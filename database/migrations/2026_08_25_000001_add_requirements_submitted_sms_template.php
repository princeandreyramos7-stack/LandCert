<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $template = [
            'event_key'   => 'requirements_submitted',
            'event_label' => 'Requirements Submitted (Awaiting Review)',
            'message'     => 'Hi {name}! Your requirements for application #{request_id} were submitted successfully. Please wait while our staff reviews your application. Once reviewed, you will be notified of your scheduled payment. - CPDO LandCert',
            'enabled'     => true,
            'variables'   => json_encode(['{name}', '{request_id}']),
        ];

        if (!DB::table('sms_templates')->where('event_key', $template['event_key'])->exists()) {
            DB::table('sms_templates')->insert(array_merge($template, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        DB::table('sms_templates')->where('event_key', 'requirements_submitted')->delete();
    }
};
