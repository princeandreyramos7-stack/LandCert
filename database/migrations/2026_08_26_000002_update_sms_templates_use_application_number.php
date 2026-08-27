<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update all SMS templates to use {application_number} instead of {control_number}
        DB::table('sms_templates')->update([
            'message' => DB::raw("REPLACE(REPLACE(message, '{control_number}', '{application_number}'), '{request_id}', '{application_number}')"),
            'variables' => DB::raw("REPLACE(REPLACE(variables, '{control_number}', '{application_number}'), '{request_id}', '{application_number}')"),
            'updated_at' => now()
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback: Replace {application_number} back to {control_number}
        DB::table('sms_templates')->update([
            'message' => DB::raw("REPLACE(message, '{application_number}', '{control_number}')"),
            'variables' => DB::raw("REPLACE(variables, '{application_number}', '{control_number}')"),
            'updated_at' => now()
        ]);
    }
};
