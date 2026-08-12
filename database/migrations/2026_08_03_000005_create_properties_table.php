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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->unique()->constrained('requests')->onDelete('cascade');
            
            $table->decimal('lot_area_sqm', 10, 2)->nullable();
            $table->decimal('bldg_improvement_sqm', 10, 2)->nullable();
            $table->string('lot_number')->nullable();
            $table->string('title_number')->nullable();
            $table->enum('right_over_land', ['Owner', 'Lessee'])->nullable();
            $table->enum('existing_land_use', [
                'Residential', 'Institutional', 'Commercial', 'Industrial', 
                'Tenanted', 'Vacant', 'Agricultural', 'Not Tenanted'
            ])->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('existing_land_use');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
