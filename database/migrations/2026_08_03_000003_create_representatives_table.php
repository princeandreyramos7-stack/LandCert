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
        Schema::create('representatives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained('applicants')->onDelete('cascade');
            
            $table->string('representative_name');
            $table->text('representative_address');
            $table->string('representative_email')->nullable();
            $table->string('representative_contact')->nullable();
            $table->string('authorization_letter_path')->nullable();
            $table->string('relationship')->nullable();
            $table->boolean('is_primary')->default(true);
            
            $table->timestamps();
            
            // Indexes
            $table->index('applicant_id');
            $table->index('is_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('representatives');
    }
};
