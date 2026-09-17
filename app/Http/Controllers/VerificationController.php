<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * The public verification page - what the QR on a printed certificate or
 * clearance opens.
 *
 * Anyone holding the paper (BPLO, the Engineering Office, a bank) can confirm
 * it is genuine and still in force without calling CPDO. No sign-in: the code
 * on the sheet is the credential, and it is unguessable. The page shows only
 * what is printed on the document itself - the applicant's name, the project,
 * the barangay, the dates - never an address, a phone number or a receipt.
 */
class VerificationController extends Controller
{
    /** The lookup form, for a code typed off the paper. */
    public function index()
    {
        return Inertia::render('Verify/Certificate', [
            'code' => null,
            'result' => null,
        ]);
    }

    /** A typed code goes to the same address the QR does. */
    public function lookup(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:32',
        ]);

        return redirect()->route('verify.show', self::normalize($validated['code']));
    }

    public function show(string $code)
    {
        $code = self::normalize($code);

        $certificate = Certificate::with(['request.applicant', 'request.project', 'request.location'])
            ->where('verification_code', $code)
            ->first();

        return Inertia::render('Verify/Certificate', [
            'code' => $code,
            'result' => $certificate ? self::publicView($certificate) : ['status' => 'not_found'],
        ]);
    }

    /** Codes are printed in capitals; accept them typed in any case, with stray spaces or dashes. */
    public static function normalize(string $code): string
    {
        return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $code));
    }

    /** The certificate as the public may see it. */
    public static function publicView(Certificate $certificate): array
    {
        $request = $certificate->request;
        $type = strtoupper((string) $request?->project?->project_type);

        return [
            'status' => $certificate->verificationStatus(),
            'document' => match ($type) {
                'CZC', 'ZC' => 'Zoning Certification / Certificate of Zoning Compliance',
                'SUP' => 'Decision on Zoning - Special Use Permit',
                'TUP' => 'Temporary Use Permit',
                default => 'Zoning Certificate',
            },
            'certificate_number' => $certificate->certificate_number,
            'application_number' => $request?->application_number,
            'decision_number' => $request?->decision_number,
            'issued_to' => $request?->applicant?->applicant_name,
            'project_type' => $type ?: null,
            'project_nature' => $request?->project?->project_nature,
            'barangay' => $request?->location?->barangay,
            'municipality' => $request?->location?->city_municipality ?: 'City of Ilagan, Isabela',
            'issued_at' => $certificate->issued_at?->toDateString(),
            'valid_until' => $certificate->valid_until?->toDateString(),
            'revoked_at' => $certificate->revoked_at?->toDateString(),
            'revocation_reason' => $certificate->isRevoked() ? $certificate->revocation_reason : null,
            'checked_at' => now()->toIso8601String(),
        ];
    }
}
