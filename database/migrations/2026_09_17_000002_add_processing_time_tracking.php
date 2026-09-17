<?php

use App\Models\Request as RequestModel;
use App\Support\ProcessingSla;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Processing-time tracking (ARTA) and archiving.
 *
 * request_status_history keeps every change of status with who and when;
 * requests.stage_since says when the application entered its current step,
 * for the board's "days in stage". requests.archived_at takes closed
 * applications off the board after a number of years without deleting them.
 * The limits and the archive age are Citizen's Charter settings.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_status_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('request_id');
            $table->string('status', 50);
            $table->string('previous_status', 50)->nullable();
            $table->unsignedInteger('changed_by')->nullable();
            $table->timestamp('changed_at');

            $table->foreign('request_id')->references('id')->on('requests')->onDelete('cascade');
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['request_id', 'changed_at']);
            $table->index('changed_at');
        });

        Schema::table('requests', function (Blueprint $table) {
            $table->timestamp('stage_since')->nullable()->after('status');
            $table->timestamp('archived_at')->nullable()->after('released_by');
            $table->unsignedInteger('archived_by')->nullable()->after('archived_at');

            $table->foreign('archived_by')->references('id')->on('users')->onDelete('set null');
            $table->index('archived_at');
        });

        foreach ([
            ['sla_days_verification', 'Certificates', 'Document verification limit (working days)', 'Working days the Zoning Officer has to verify an application\'s documents, per the Citizen\'s Charter.', '3'],
            ['sla_days_approval', 'Certificates', 'Approval limit (working days)', 'Working days the Zoning Administrator has to decide a reviewed application.', '2'],
            ['sla_days_release', 'Certificates', 'Issuance limit (working days)', 'Working days from a recorded payment to the document being released.', '3'],
            ['archive_after_years', 'General', 'Archive closed applications after (years)', 'Released or denied applications untouched for this many years are moved to the archive, off the applications board.', '2'],
        ] as [$key, $category, $label, $description, $value]) {
            DB::table('system_settings')->updateOrInsert(['key' => $key], [
                'category' => $category,
                'label' => $label,
                'description' => $description,
                'value' => $value,
                'type' => 'number',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Applications already on file get a history: filed, what the audit
        // log kept, and where they are now.
        RequestModel::withTrashed()->orderBy('id')->each(fn ($request) => ProcessingSla::backfill($request));
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropForeign(['archived_by']);
            $table->dropIndex(['archived_at']);
            $table->dropColumn(['stage_since', 'archived_at', 'archived_by']);
        });
        Schema::dropIfExists('request_status_history');
        DB::table('system_settings')->whereIn('key', ['sla_days_verification', 'sla_days_approval', 'sla_days_release', 'archive_after_years'])->delete();
    }
};
