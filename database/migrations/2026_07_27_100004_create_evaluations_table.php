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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id('evaluation_id');
            $table->unsignedInteger('application_id');
            $table->unsignedInteger('staff_id')->nullable();
            $table->enum('recommendation', ['approve', 'reject', 'revise'])->default('approve');
            $table->text('remarks')->nullable();
            $table->timestamp('evaluation_date')->useCurrent();
            $table->timestamps();

            $table->foreign('application_id')->references('id')->on('applications')->onDelete('cascade');
            $table->foreign('staff_id')->references('id')->on('users')->onDelete('set null');

            $table->index('application_id');
            $table->index('staff_id');
            $table->index('evaluation_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
