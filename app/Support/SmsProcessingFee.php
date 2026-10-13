<?php

namespace App\Support;

/**
 * The SMS automated processing fee: a fixed amount added to every
 * application's payment, on top of the Schedule of Fees (ZoningFeeSchedule),
 * for the text messages the system sends the applicant along the way.
 *
 * Added once, on the server, when the Zoning Officer marks an application
 * reviewed (AdminController::reviewApplication): the officer sets the
 * Treasury fee, and reports.payment_amount stores that fee plus this one,
 * with reports.sms_fee keeping this part so documents can show the
 * breakdown. Everything that charges, checks or prints the amount due reads
 * payment_amount, so it is included everywhere without being added twice.
 *
 * The amount is SMS_PROCESSING_FEE in .env (default P10).
 */
final class SmsProcessingFee
{
    public static function amount(): float
    {
        return round((float) config('services.sms.processing_fee', 10), 2);
    }

    /** The fee and the total for a Treasury fee, as the review stores them. */
    public static function addTo(float $treasuryFee): array
    {
        $fee = self::amount();

        return ['sms_fee' => $fee, 'payment_amount' => round($treasuryFee + $fee, 2)];
    }

    /**
     * The Treasury fee inside a stored total - what the officer set, which is
     * what their form opens on again.
     */
    public static function treasuryFee($paymentAmount, $smsFee): ?float
    {
        if ($paymentAmount === null || $paymentAmount === '') {
            return null;
        }

        return round((float) $paymentAmount - (float) ($smsFee ?? 0), 2);
    }
}
