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
        Schema::create('normalized_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->unique()->constrained('requests')->onDelete('cascade');
            
            $table->string('project_type');
            $table->string('project_nature');
            $table->enum('project_nature_duration', ['Permanent', 'Temporary'])->nullable();
            $table->integer('project_nature_years')->nullable();
            $table->decimal('project_cost', 15, 2)->nullable();
            $table->text('project_description')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('project_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('normalized_projects');
    }
};
