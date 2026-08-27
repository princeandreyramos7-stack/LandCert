<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update all SMS templates to use {control_number} instead of {request_id}
        DB::table('sms_templates')->update([
            'message' => DB::raw("REPLACE(message, '{request_id}', '{control_number}')"),
            'variables' => DB::raw("REPLACE(variables, '{request_id}', '{control_number}')"),
            'updated_at' => now()
        ]);
    }

    public function down(): void
    {
        // Rollback: Replace {control_number} back to {request_id}
        DB::table('sms_templates')->update([
            'message' => DB::raw("REPLACE(message, '{control_number}', '{request_id}')"),
            'variables' => DB::raw("REPLACE(variables, '{control_number}', '{request_id}')"),
            'updated_at' => now()
        ]);
    }
};
