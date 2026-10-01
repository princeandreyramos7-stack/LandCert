<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\PaymentGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Readiness scaffolding only - see PaymentGatewayService for why. Both
 * endpoints answer 503 while PAYMENT_GATEWAY_ENABLED is false (the
 * default), which is the only state this office is in today; they exist now
 * so wiring in a real provider later is a service-class change, not a new
 * route + schema change on top of whatever is already under deadline then.
 */
class PaymentGatewayController extends Controller
{
    public function __construct(protected PaymentGatewayService $gateway)
    {
    }

    public function initiate(Request $request, Payment $payment): JsonResponse
    {
        if ($payment->user_id !== $request->user()->id) {
            abort(403);
        }

        if (!$this->gateway->isEnabled()) {
            return response()->json([
                'message' => 'Online payment is not available yet. Please pay at the City Treasury counter and upload your receipt.',
            ], 503);
        }

        $result = $this->gateway->initiate($payment, (float) $payment->amount);

        if (!$result) {
            return response()->json([
                'message' => 'Online payment could not be started. Please pay at the City Treasury counter and upload your receipt.',
            ], 503);
        }

        return response()->json($result);
    }

    public function webhook(Request $request): JsonResponse
    {
        if (!$this->gateway->isEnabled()) {
            return response()->json(['message' => 'Online payment is not available yet.'], 503);
        }

        $this->gateway->handleWebhook($request->all(), $request->header('X-Gateway-Signature'));

        return response()->json(['received' => true]);
    }
}
