<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * A Temporary Use Permit runs for one year. The form and the controller now
 * fix the tenure of a TUP at "Temporary", 1 year; this brings the TUP
 * applications filed before that rule into line with it.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('normalized_projects')
            ->where('project_type', 'TUP')
            ->update(['project_nature_duration' => 'Temporary', 'project_nature_years' => 1]);
    }

    public function down(): void
    {
        // The values these rows held before were not the rule; nothing to restore.
    }
};
