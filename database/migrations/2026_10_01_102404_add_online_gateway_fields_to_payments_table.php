<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Readiness only - nothing here is wired to a live gateway yet. The office
 * is coordinating the actual channel with the City Treasury; once that is
 * settled, PaymentGatewayService gets a real implementation and these
 * columns are what it writes to, instead of a schema change at that point
 * holding up the integration itself. Every column is nullable and
 * `payment_channel` defaults to 'manual' - the existing counter-and-receipt
 * flow (PaymentController, OfficerDecision's "Amount to Pay") is completely
 * unaffected until a row is actually created with channel = 'online'.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('payment_channel', 20)->default('manual')->after('payment_method');
            // Which gateway processed it - left blank until the Treasury
            // decides (PayMaya, GCash, a City Hall e-payment portal, ...).
            $table->string('gateway_provider', 50)->nullable()->after('payment_channel');
            // The gateway's own transaction/reference id - how a webhook or
            // a manual reconciliation finds its way back to this row.
            $table->string('gateway_reference')->nullable()->after('gateway_provider');
            // The gateway's own status word (e.g. "paid", "failed"), kept
            // separate from payment_status - that column is the OFFICE's
            // verification state, not the gateway's.
            $table->string('gateway_status', 30)->nullable()->after('gateway_reference');
            // The moment the gateway itself confirmed payment, distinct from
            // verified_at (when staff confirmed it on this end).
            $table->timestamp('gateway_paid_at')->nullable()->after('gateway_status');
            // Raw payload for audit/debugging - never shown to the applicant.
            $table->json('gateway_response')->nullable()->after('gateway_paid_at');

            $table->index('gateway_reference');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['gateway_reference']);
            $table->dropColumn([
                'payment_channel',
                'gateway_provider',
                'gateway_reference',
                'gateway_status',
                'gateway_paid_at',
                'gateway_response',
            ]);
        });
    }
};
