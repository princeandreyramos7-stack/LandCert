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
        Schema::create('normalized_corporations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->unique()->constrained('applicants')->onDelete('cascade');
            
            $table->string('corporation_name');
            $table->text('corporation_address');
            $table->string('registration_number')->nullable();
            $table->string('tin')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('corporation_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('normalized_corporations');
    }
};
