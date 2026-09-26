<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A New Application in progress, saved on request so an applicant can close
 * the browser and pick it back up later - on this device or another one,
 * any time they are signed in. One per account: like the wizard itself,
 * there is only ever one "New Application" in progress at a time.
 *
 * Attached files are not part of this - only the typed answers and which
 * step the applicant was on. A file exists only as long as the browser tab
 * that picked it holds a reference to it; keeping one across devices would
 * mean actually uploading it to the server as part of saving the draft, not
 * just remembering it existed. See resources/js/lib/requestDraft.js for the
 * same-device, refresh-only counterpart, which does keep files (via
 * IndexedDB, entirely in the browser).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('application_drafts', function (Blueprint $table) {
            $table->id();
            // users.id is a plain INT (Blueprint::increments), not Laravel's
            // modern BIGINT - foreignId()->constrained() would mismatch it
            // and MySQL refuses the foreign key (errno 150).
            $table->unsignedInteger('user_id')->unique();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->json('data');
            $table->unsignedTinyInteger('current_step')->default(1);
            $table->json('completed_steps')->nullable();
            $table->boolean('has_representative')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_drafts');
    }
};
