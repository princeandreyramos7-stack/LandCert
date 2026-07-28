<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration drops all DSS and GIS related tables if they exist.
     */
    public function up(): void
    {
        // Drop tables in reverse order of foreign key dependencies
        Schema::dropIfExists('evaluation_risk_assessments');
        Schema::dropIfExists('risk_factors');
        Schema::dropIfExists('dss_evaluations');
        Schema::dropIfExists('property_locations');
        Schema::dropIfExists('zoning_rules');
    }

    /**
     * Reverse the migrations.
     * 
     * Note: We cannot recreate these tables as the original migration
     * and models have been deleted. This migration is one-way only.
     */
    public function down(): void
    {
        // Cannot reverse - original migration and models have been deleted
        throw new \Exception('Cannot reverse this migration. DSS/GIS tables and models have been permanently removed from the codebase.');
    }
};
