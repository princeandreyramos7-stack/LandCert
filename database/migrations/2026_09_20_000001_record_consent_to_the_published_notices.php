<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Records that a person agreed to the notices, and which edition of them.
 *
 * Saying "the applicant consented" is worth very little on its own; the Data
 * Privacy Act expects the office to be able to show what was consented to
 * and when. The text is versioned in App\Support\LegalDocuments, so storing
 * the version alongside the timestamp makes the record specific: this person
 * agreed to version 1.0 of the notices at this moment, and version 1.0 can
 * still be produced.
 *
 * Nullable on purpose. Accounts that existed before this migration never
 * gave the tick, and back-dating one for them would be inventing a record.
 * They are left null, which is the truthful state: consent unknown.
 *
 * NOT YET BUILT: nothing yet asks an existing account to consent. Until
 * something does, a null here means the office cannot show that this user
 * agreed to anything. The intended fix is a one-screen prompt after sign-in
 * when consented_at is null or consent_version is behind
 * LegalDocuments::VERSION.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('consented_at')->nullable()->after('email_verified_at');
            $table->string('consent_version', 16)->nullable()->after('consented_at');
            // The address the tick came from. Part of showing that the
            // consent was actually given rather than assumed.
            $table->string('consent_ip', 45)->nullable()->after('consent_version');
        });

        Schema::table('requests', function (Blueprint $table) {
            // The declaration made when an application is filed is a separate
            // act from the account-level consent: it is the applicant
            // certifying that what they have just submitted is true.
            $table->timestamp('declared_at')->nullable()->after('created_at');
            $table->string('declaration_version', 16)->nullable()->after('declared_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['consented_at', 'consent_version', 'consent_ip']);
        });

        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn(['declared_at', 'declaration_version']);
        });
    }
};
