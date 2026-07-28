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
        Schema::create('uploaded_documents', function (Blueprint $table) {
            $table->id('document_id');
            $table->unsignedInteger('application_id');
            $table->unsignedBigInteger('document_type_id');
            $table->string('file_path', 500);
            $table->string('file_name', 255);
            $table->unsignedInteger('file_size')->nullable()->comment('File size in bytes');
            $table->string('mime_type', 100)->nullable();
            $table->unsignedInteger('uploaded_by')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps();

            $table->foreign('application_id')->references('id')->on('applications')->onDelete('cascade');
            $table->foreign('document_type_id')->references('document_type_id')->on('document_types')->onDelete('restrict');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');

            $table->index('application_id');
            $table->index('document_type_id');
            $table->index('uploaded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uploaded_documents');
    }
};
