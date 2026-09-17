<?php

use App\Models\User;
use App\Support\Signatories;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Dated e-signatures and positions for the staff who sign documents (see
 * App\Support\Signatories). Every staff account starts with one version:
 * what it has today, dated 2000 so it covers every document already issued.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('position', 150)->nullable()->after('user_type');
        });

        Schema::create('signature_versions', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id');
            $table->string('signature_path')->nullable();
            $table->string('position', 150)->nullable();
            $table->timestamp('effective_from');
            $table->unsignedInteger('set_by')->nullable();
            $table->string('note')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('set_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['user_id', 'effective_from']);
        });

        User::whereIn('user_type', ['admin', 'super_admin'])->orderBy('id')->each(fn ($user) => Signatories::backfill($user));
    }

    public function down(): void
    {
        Schema::dropIfExists('signature_versions');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};
