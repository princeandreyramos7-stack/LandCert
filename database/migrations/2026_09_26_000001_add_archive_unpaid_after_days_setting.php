<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Second archiving rule, alongside archive_after_years (see
 * 2026_09_17_000002_add_processing_time_tracking.php): an application the
 * Zoning Administrator approved but that never got paid is archived once it
 * has sat that way for this many days. See App\Console\Commands\ArchiveApplications.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('system_settings')->updateOrInsert(['key' => 'archive_unpaid_after_days'], [
            'category' => 'General',
            'label' => 'Archive approved-and-unpaid applications after (days)',
            'description' => 'An application approved by the Zoning Administrator but never paid is moved to the archive, off the applications board, after this many days.',
            'value' => '30',
            'type' => 'number',
            'is_public' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('system_settings')->where('key', 'archive_unpaid_after_days')->delete();
    }
};
