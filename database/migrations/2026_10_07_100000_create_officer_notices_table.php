<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * What the Zoning Administrator has sent the Zoning Officers (page
 * /officer-notices). Each officer's copy is an ordinary in-app notification
 * (type "administrator_notice"); this keeps the sent message itself, for her
 * history of what went to whom.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('officer_notices', function (Blueprint $table) {
            $table->id();
            // users.id is INT UNSIGNED, not BIGINT.
            $table->unsignedInteger('sent_by')->nullable();
            $table->foreign('sent_by')->references('id')->on('users')->nullOnDelete();
            $table->string('title', 160);
            $table->text('message');
            $table->boolean('is_important')->default(false);
            // Names at the time of sending, so the history still reads right
            // after an officer's account is renamed or removed.
            $table->json('recipients');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('officer_notices');
    }
};
