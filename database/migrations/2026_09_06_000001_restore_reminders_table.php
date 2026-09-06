<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bring back the reminders table.
 *
 * 2026_05_08_212945_remove_payment_gateway_features dropped it as part of
 * clearing out the online-payment work, but scheduled reminders were never part
 * of that feature: the Reminder model, ReminderService, the three reminder
 * mailables and the hourly `reminders:send` schedule all survived, and approval
 * still calls schedulePaymentReminder() from three places. Every one of those
 * calls has been failing into a try/catch log line ever since, so applicants
 * stopped being reminded to pay without anything surfacing.
 *
 * The shape here matches what the model actually expects (its $fillable and the
 * metadata reads in ReminderService), which is the original create_reminders
 * schema rather than the different one that migration's own down() would build.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('reminders')) {
            return;
        }

        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            // users.id is an unsignedInteger, so this has to match for the FK.
            $table->unsignedInteger('user_id');
            $table->string('type'); // payment_due, document_pending, certificate_expiry
            $table->unsignedBigInteger('related_id'); // request id, certificate id, ...
            $table->string('related_type'); // Request, Payment, Certificate
            $table->timestamp('scheduled_at');
            $table->timestamp('sent_at')->nullable();
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->text('message');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // sendPendingReminders() scans on exactly this pair every hour.
            $table->index(['status', 'scheduled_at']);
            $table->index(['user_id', 'type']);
            $table->index(['related_type', 'related_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};
