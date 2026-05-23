<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            // New fields for physical collection workflow
            $table->string('physical_certificate_number')->nullable()->after('certificate_number');
            $table->timestamp('ready_for_collection_at')->nullable()->after('physical_certificate_number');
            $table->unsignedInteger('ready_for_collection_by')->nullable()->after('ready_for_collection_at');
            $table->timestamp('collected_at')->nullable()->after('ready_for_collection_by');
            $table->unsignedInteger('collected_by_staff')->nullable()->after('collected_at');
            $table->text('collection_notes')->nullable()->after('collected_by_staff');
            $table->boolean('is_legacy_certificate')->default(false)->after('collection_notes');
            
            // Add foreign key constraints
            $table->foreign('ready_for_collection_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('collected_by_staff')->references('id')->on('users')->onDelete('set null');
            
            // Add indexes for performance
            $table->index('physical_certificate_number');
            $table->index('ready_for_collection_at');
            $table->index('collected_at');
        });

        // Mark existing records as legacy
        DB::table('certificates')->update(['is_legacy_certificate' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['physical_certificate_number']);
            $table->dropIndex(['ready_for_collection_at']);
            $table->dropIndex(['collected_at']);
            
            // Drop foreign key constraints
            $table->dropForeign(['ready_for_collection_by']);
            $table->dropForeign(['collected_by_staff']);
            
            // Drop columns
            $table->dropColumn([
                'physical_certificate_number',
                'ready_for_collection_at',
                'ready_for_collection_by',
                'collected_at',
                'collected_by_staff',
                'collection_notes',
                'is_legacy_certificate'
            ]);
        });
    }
};
