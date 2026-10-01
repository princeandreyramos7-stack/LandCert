<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The 3rd-denial notice sent alongside the regular application_rejected
     * SMS - see App\Services\SmsService::sendApplicationPermanentlyDenied()
     * and App\Models\Request::MAX_DENIALS.
     */
    public function up(): void
    {
        DB::table('sms_templates')->insert([
            'event_key'   => 'application_locked',
            'event_label' => 'Application Permanently Denied',
            'message'     => '{name}, application #{application_number} has been denied {max} times and can no longer be resubmitted online. Please visit the CPDO office in person. - CPDO LC',
            'enabled'     => true,
            'variables'   => json_encode(['{name}', '{application_number}', '{max}']),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('sms_templates')->where('event_key', 'application_locked')->delete();
    }
};
