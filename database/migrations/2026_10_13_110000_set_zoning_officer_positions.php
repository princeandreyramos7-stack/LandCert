<?php

use App\Models\SignatureVersion;
use App\Models\User;
use App\Support\Signatories;
use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;

/**
 * The Zoning Officers' printed positions, as the office gave them on
 * 2026-10-13. Until then none had been set, so every officer printed the
 * placeholder "Zoning Officer IV" (Signatories::DEFAULT_POSITIONS).
 *
 * Recorded through Signatories::set, like a change made under User
 * Management -> Signatory settings, so the signatory history stays whole.
 * Because the old title was only the placeholder, the correction is dated
 * from the start of that history and a reprint of an older document shows
 * the right title too - unless the office has already recorded a dated
 * change for that officer, in which case that history stands and the new
 * title applies from today.
 *
 * An officer is found by e-mail, or failing that by surname among the
 * Zoning Officer accounts; one that is not on this database is skipped.
 */
return new class extends Migration
{
    private const NOTE = 'Position as given by the office, 2026-10-13';

    private const POSITIONS = [
        ['april@cpdo.com', 'Cuntapay', 'Bookbinder I'],
        ['maryjane@cpdo.com', 'Bulauan', 'Zoning Officer IV'],
        ['kay@cpdo.com', 'Aggarao', 'Zoning Officer I'],
        ['jeff@cpdo.com', 'Pauig', 'Zoning Officer III'],
    ];

    public function up(): void
    {
        $start = Carbon::parse('2000-01-01 00:00:00');

        foreach (self::POSITIONS as [$email, $surname, $position]) {
            $officer = User::where('email', $email)->first()
                ?? User::where('user_type', 'admin')->where('name', 'like', "%{$surname}%")->first();

            if (! $officer) {
                continue;
            }

            $hasDatedHistory = SignatureVersion::where('user_id', $officer->id)
                ->where('effective_from', '>', $start)
                ->exists();

            Signatories::set($officer, null, $position, $hasDatedHistory ? now() : $start, null, self::NOTE);
        }
    }

    public function down(): void
    {
        $userIds = SignatureVersion::where('note', self::NOTE)->pluck('user_id')->unique();
        SignatureVersion::where('note', self::NOTE)->delete();

        foreach (User::whereIn('id', $userIds)->get() as $officer) {
            $current = Signatories::versionAsOf($officer->id);
            $officer->forceFill([
                'signature_path' => $current?->signature_path ?? $officer->signature_path,
                'position' => $current?->position,
            ])->save();
        }
    }
};
