<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\Log;

/**
 * Readiness scaffolding only - no provider is wired in yet. The City
 * Treasury has not confirmed which online channel this office will use, so
 * every method here declines and logs rather than calling out to anything.
 * Once a provider is chosen, its real request/response handling replaces
 * the body of initiate()/handleWebhook() - the config keys
 * (services.payment_gateway.*, see config/services.php), the payments table
 * columns (payment_channel, gateway_provider, gateway_reference,
 * gateway_status, gateway_paid_at, gateway_response - added by the
 * 2026_10_01_102404 migration), and the routes in PaymentGatewayController
 * are the intended integration point, so that work won't also need a schema
 * or route change at the same time. While PAYMENT_GATEWAY_ENABLED stays
 * false (the default), nothing here is reachable from the UI and the
 * existing manual pay-at-counter/upload-receipt flow is unaffected.
 */
class PaymentGatewayService
{
    protected bool $enabled;
    protected ?string $provider;

    public function __construct()
    {
        $this->enabled = (bool) config('services.payment_gateway.enabled', false);
        $this->provider = config('services.payment_gateway.provider');
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    /**
     * Start an online payment for the given amount. Returns null while the
     * gateway is disabled or no provider is implemented yet - callers
     * should fall back to the existing manual flow in that case.
     *
     * @return array{redirect_url: string, gateway_reference: string}|null
     */
    public function initiate(Payment $payment, float $amount): ?array
    {
        if (!$this->enabled) {
            Log::info('[PaymentGateway] Online payment disabled - skipped', ['payment_id' => $payment->id]);
            return null;
        }

        Log::error('[PaymentGateway] Enabled but no provider implemented yet', [
            'provider' => $this->provider,
            'payment_id' => $payment->id,
        ]);
        return null;
    }

    /**
     * Verify and record an inbound webhook call from the gateway. Returns
     * false while disabled, unconfigured, or if the payload's signature
     * does not check out once a provider is wired in.
     */
    public function handleWebhook(array $payload, ?string $signature): bool
    {
        if (!$this->enabled) {
            Log::info('[PaymentGateway] Webhook received while disabled - ignored');
            return false;
        }

        Log::error('[PaymentGateway] Enabled but no provider implemented yet - webhook ignored', [
            'provider' => $this->provider,
        ]);
        return false;
    }
}
