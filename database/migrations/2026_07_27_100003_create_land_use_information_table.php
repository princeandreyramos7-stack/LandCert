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
        Schema::create('land_use_information', function (Blueprint $table) {
            $table->id('land_use_id');
            $table->unsignedInteger('application_id');
            $table->enum('existing_land_use', [
                'Residential',
                'Institutional',
                'Commercial',
                'Industrial',
                'Tenanted',
                'Vacant',
                'Agricultural',
                'Not Tenanted'
            ])->nullable();
            $table->enum('written_notice', ['yes', 'no'])->nullable();
            $table->string('notice_officer_name', 255)->nullable();
            $table->date('notice_dates')->nullable();
            $table->enum('similar_application', ['yes', 'no'])->nullable();
            $table->text('similar_application_offices')->nullable();
            $table->date('similar_application_dates')->nullable();
            $table->timestamps();

            $table->foreign('application_id')->references('id')->on('applications')->onDelete('cascade');
            $table->index('application_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('land_use_information');
    }
};
