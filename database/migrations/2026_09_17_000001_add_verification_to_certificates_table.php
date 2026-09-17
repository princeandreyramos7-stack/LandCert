<?php

use App\Models\Certificate;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Public verification of issued documents.
 *
 * Every certificate carries a random code, printed as a QR on the sheet, that
 * opens /verify/{code} - so another office or a bank can confirm a document
 * is genuine and still in force without calling CPDO. A certificate the office
 * withdraws is marked revoked rather than deleted, so the page can say so.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->string('verification_code', 16)->nullable()->unique()->after('certificate_number');
            $table->timestamp('revoked_at')->nullable()->after('valid_until');
            $table->unsignedInteger('revoked_by')->nullable()->after('revoked_at');
            $table->text('revocation_reason')->nullable()->after('revoked_by');

            $table->foreign('revoked_by')->references('id')->on('users')->onDelete('set null');
        });

        // Documents already issued get a code too, so a reprint carries a QR.
        DB::table('certificates')->whereNull('verification_code')->orderBy('id')
            ->each(function ($row) {
                DB::table('certificates')->where('id', $row->id)
                    ->update(['verification_code' => Certificate::newVerificationCode()]);
            });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropForeign(['revoked_by']);
            $table->dropUnique(['verification_code']);
            $table->dropColumn(['verification_code', 'revoked_at', 'revoked_by', 'revocation_reason']);
        });
    }
};
