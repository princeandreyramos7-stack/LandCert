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
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->unique()->constrained('requests')->onDelete('cascade');
            
            $table->string('street_address', 500);
            $table->string('barangay');
            $table->string('city_municipality');
            $table->string('province');
            $table->string('postal_code', 20)->nullable();
            $table->string('district')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('barangay');
            $table->index('city_municipality');
            $table->index('province');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
