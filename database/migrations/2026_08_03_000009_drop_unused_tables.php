<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop unused tables after normalization:
     * - applications (old table, replaced by applicants)
     * - corporations (old table, replaced by normalized_corporations)
     * - projects (old table, replaced by normalized_projects)
     * - document_types (unused)
     * - uploaded_documents (unused)
     * - land_use_information (unused)
     * - evaluations (unused, we use reports)
     * - certificate_releases (unused)
     */
    public function up(): void
    {
        // Disable foreign key checks temporarily
        Schema::disableForeignKeyConstraints();
        
        // Drop old tables that were replaced by normalized versions
        Schema::dropIfExists('applications');
        Schema::dropIfExists('corporations');
        Schema::dropIfExists('projects');
        
        // Drop unused tables
        Schema::dropIfExists('document_types');
        Schema::dropIfExists('uploaded_documents');
        Schema::dropIfExists('land_use_information');
        Schema::dropIfExists('evaluations');
        Schema::dropIfExists('certificate_releases');
        
        // Re-enable foreign key checks
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate tables if needed (basic structure only)
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('applicant_name');
            $table->text('applicant_address');
            $table->timestamps();
        });

        Schema::create('corporations', function (Blueprint $table) {
            $table->id();
            $table->string('corporation_name');
            $table->text('corporation_address');
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_type');
            $table->timestamps();
        });

        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('uploaded_documents', function (Blueprint $table) {
            $table->id();
            $table->string('file_path');
            $table->timestamps();
        });

        Schema::create('land_use_information', function (Blueprint $table) {
            $table->id();
            $table->string('land_use');
            $table->timestamps();
        });

        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->text('evaluation');
            $table->timestamps();
        });

        Schema::create('certificate_releases', function (Blueprint $table) {
            $table->id();
            $table->timestamp('released_at')->nullable();
            $table->timestamps();
        });
    }
};
