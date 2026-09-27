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
        Schema::table('requirement_documents', function (Blueprint $table) {
            $table->string('file_hash', 64)->nullable()->after('file_size')->index();
            $table->foreignId('duplicate_of_id')->nullable()->after('file_hash')
                ->constrained('requirement_documents')->nullOnDelete();
            $table->boolean('possible_editing_flag')->default(false)->after('duplicate_of_id');
            $table->string('possible_editing_reason')->nullable()->after('possible_editing_flag');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requirement_documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('duplicate_of_id');
            $table->dropColumn(['file_hash', 'possible_editing_flag', 'possible_editing_reason']);
        });
    }
};
