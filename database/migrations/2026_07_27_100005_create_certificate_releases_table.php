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
        Schema::create('certificate_releases', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('certificate_id');
            $table->unsignedInteger('released_by')->nullable(); // Staff who released the certificate - matches users.id type
            $table->string('collected_by_name'); // Name of person who collected
            $table->date('release_date');
            $table->time('release_time');
            $table->string('valid_id_type', 100)->nullable(); // Type of ID presented (e.g., Driver's License, National ID)
            $table->string('valid_id_number', 100)->nullable(); // ID number
            $table->string('relationship_to_applicant', 100)->default('applicant'); // Changed from enum to string for flexibility
            $table->text('remarks')->nullable(); // Any notes about the release
            $table->timestamps();

            // Add indexes first
            $table->index('certificate_id');
            $table->index('released_by');
        });

        // Add foreign keys separately to avoid engine issues
        Schema::table('certificate_releases', function (Blueprint $table) {
            $table->foreign('certificate_id')->references('id')->on('certificates')->onDelete('cascade');
            $table->foreign('released_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificate_releases');
    }
};
