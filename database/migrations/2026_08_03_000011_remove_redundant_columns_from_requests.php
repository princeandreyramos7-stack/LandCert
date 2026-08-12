<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Removes redundant columns from requests table that are now stored in normalized tables:
     * - Applicant info → applicants table
     * - Corporation info → normalized_corporations table
     * - Representative info → representatives table
     * - Project info → normalized_projects table
     * - Property info → properties table
     * - Location info → locations table
     */
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            // Drop applicant redundant columns (moved to applicants table)
            $table->dropColumn([
                'applicant_name',
                'applicant_address',
            ]);
            
            // Drop corporation redundant columns (moved to normalized_corporations table)
            $table->dropColumn([
                'corporation_name',
                'corporation_address',
            ]);
            
            // Drop representative redundant columns (moved to representatives table)
            $table->dropColumn([
                'authorized_representative_name',
                'authorized_representative_address',
                'authorized_representative_email',
            ]);
            
            // Drop project redundant columns (moved to normalized_projects table)
            $table->dropColumn([
                'project_type',
                'project_nature',
                'project_nature_duration',
                'project_nature_years',
                'project_cost',
            ]);
            
            // Drop location redundant columns (moved to locations table)
            $table->dropColumn([
                'project_location_number',
                'project_location_street',
                'project_location_barangay',
                'project_location_city',
                'project_location_municipality',
                'project_location_province',
            ]);
            
            // Drop property redundant columns (moved to properties table)
            $table->dropColumn([
                'project_area_sqm',
                'lot_area_sqm',
                'bldg_improvement_sqm',
                'right_over_land',
                'existing_land_use',
            ]);
        });
        
        // Add control_number column for better tracking
        Schema::table('requests', function (Blueprint $table) {
            $table->string('control_number')->unique()->nullable()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove control_number
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn('control_number');
        });
        
        // Restore all dropped columns
        Schema::table('requests', function (Blueprint $table) {
            // Restore applicant columns
            $table->string('applicant_name')->nullable();
            $table->text('applicant_address')->nullable();
            
            // Restore corporation columns
            $table->string('corporation_name')->nullable();
            $table->text('corporation_address')->nullable();
            
            // Restore representative columns
            $table->string('authorized_representative_name')->nullable();
            $table->text('authorized_representative_address')->nullable();
            $table->string('authorized_representative_email')->nullable();
            
            // Restore project columns
            $table->string('project_type')->nullable();
            $table->string('project_nature')->nullable();
            $table->enum('project_nature_duration', ['Permanent', 'Temporary'])->nullable();
            $table->integer('project_nature_years')->nullable();
            $table->text('project_cost')->nullable();
            
            // Restore location columns
            $table->string('project_location_number')->nullable();
            $table->string('project_location_street')->nullable();
            $table->string('project_location_barangay')->nullable();
            $table->string('project_location_city')->nullable();
            $table->string('project_location_municipality')->nullable();
            $table->string('project_location_province')->nullable();
            
            // Restore property columns
            $table->decimal('project_area_sqm', 10, 2)->nullable();
            $table->decimal('lot_area_sqm', 10, 2)->nullable();
            $table->decimal('bldg_improvement_sqm', 10, 2)->nullable();
            $table->enum('right_over_land', ['Owner', 'Lessee'])->nullable();
            $table->enum('existing_land_use', [
                'Residential', 'Institutional', 'Commercial', 'Industrial', 
                'Tenanted', 'Vacant', 'Agricultural', 'Not Tenanted'
            ])->nullable();
        });
    }
};
