<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Zoning Rules Table
        Schema::create('zoning_rules', function (Blueprint $table) {
            $table->id();
            $table->string('zone_code')->unique();
            $table->string('zone_name');
            $table->enum('zone_type', ['residential', 'commercial', 'industrial', 'agricultural', 'mixed']);
            $table->text('description')->nullable();
            $table->json('allowed_uses'); // ['single_family', 'multi_family', etc.]
            $table->decimal('min_lot_area', 10, 2)->nullable();
            $table->decimal('max_lot_area', 10, 2)->nullable();
            $table->decimal('max_building_height', 8, 2)->nullable();
            $table->decimal('max_floor_area_ratio', 5, 2)->nullable();
            $table->decimal('min_setback_front', 8, 2)->nullable();
            $table->decimal('min_setback_rear', 8, 2)->nullable();
            $table->decimal('min_setback_side', 8, 2)->nullable();
            $table->json('distance_restrictions')->nullable(); // {school: 100, highway: 50}
            $table->json('environmental_restrictions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Property Locations Table
        Schema::create('property_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained()->onDelete('cascade');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('address');
            $table->string('barangay')->nullable();
            $table->string('district')->nullable();
            $table->foreignId('zoning_rule_id')->nullable()->constrained();
            $table->decimal('lot_area', 10, 2);
            $table->string('lot_number')->nullable();
            $table->string('title_number')->nullable();
            $table->json('boundaries')->nullable(); // polygon coordinates
            $table->timestamps();
        });

        // DSS Evaluations Table
        Schema::create('dss_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained()->onDelete('cascade');
            $table->foreignId('property_location_id')->constrained();
            $table->enum('recommendation', ['approve', 'deny', 'review_required']);
            $table->integer('compliance_score')->default(0); // 0-100
            $table->integer('risk_score')->default(0); // 0-100
            $table->json('validation_results'); // detailed check results
            $table->json('violations')->nullable();
            $table->json('warnings')->nullable();
            $table->text('ai_suggestion')->nullable();
            $table->unsignedBigInteger('evaluated_by')->nullable()->index();
            $table->timestamp('evaluated_at')->nullable();
            $table->timestamps();
        });

        // Risk Factors Table
        Schema::create('risk_factors', function (Blueprint $table) {
            $table->id();
            $table->string('factor_name');
            $table->enum('category', ['environmental', 'safety', 'land_use', 'infrastructure']);
            $table->text('description');
            $table->integer('weight')->default(1); // 1-10
            $table->json('criteria'); // conditions to check
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Evaluation Risk Assessments (junction table)
        Schema::create('evaluation_risk_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dss_evaluation_id')->constrained()->onDelete('cascade');
            $table->foreignId('risk_factor_id')->constrained();
            $table->boolean('is_present')->default(false);
            $table->integer('severity')->default(0); // 0-10
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_risk_assessments');
        Schema::dropIfExists('risk_factors');
        Schema::dropIfExists('dss_evaluations');
        Schema::dropIfExists('property_locations');
        Schema::dropIfExists('zoning_rules');
    }
};
