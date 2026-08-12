<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            // Add applicant_id foreign key
            $table->foreignId('applicant_id')->nullable()->after('user_id')->constrained('applicants')->onDelete('cascade');
            
            // Drop columns that are now in other tables
            // We'll keep them for now to maintain backward compatibility
            // You can uncomment these after data migration
            
            /*
            $table->dropColumn([
                'applicant_name',
                'applicant_address',
                'corporation_name',
                'corporation_address',
                'authorized_representative_name',
                'authorized_representative_address',
                'authorized_representative_email',
                'project_type',
                'project_nature',
                'project_nature_duration',
                'project_nature_years',
                'project_cost',
                'project_location_number',
                'project_location_street',
                'project_location_barangay',
                'project_location_city',
                'project_location_municipality',
                'project_location_province',
                'project_area_sqm',
                'lot_area_sqm',
                'bldg_improvement_sqm',
                'right_over_land',
                'existing_land_use'
            ]);
            */
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropForeign(['applicant_id']);
            $table->dropColumn('applicant_id');
            
            // Re-add dropped columns if needed
        });
    }
};
