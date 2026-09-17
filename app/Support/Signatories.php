<?php

namespace App\Support;

use App\Models\SignatureVersion;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Who signs the office's documents, and as what, on a given day.
 *
 * A staff member's e-signature and printed position are kept as dated
 * versions (signature_versions). A document is signed with the version in
 * force on its issue date, so what was printed stays printed: a certificate
 * issued when the officer was "Zoning Officer III" still says so after their
 * promotion, and one signed by the previous Administrator keeps that
 * signature after the new one takes over.
 *
 * users.signature_path and users.position hold the version in force today,
 * for everything that only needs the current answer.
 */
class Signatories
{
    /** The printed title when none has been set for the account. */
    public const DEFAULT_POSITIONS = [
        'admin' => 'Zoning Officer IV',
        'super_admin' => 'City Planning & Development Coordinator / Zoning Administrator',
    ];

    /** Where uploaded signature images go, relative to public/. */
    public const UPLOAD_DIRECTORY = 'images/E-signitures/uploads';

    public static function defaultPosition(?string $userType): ?string
    {
        return self::DEFAULT_POSITIONS[$userType] ?? null;
    }

    /**
     * The version of a staff member's signature in force at a moment: the
     * latest one dated on or before it. A document older than the first
     * version gets the first version - that is the signature the account
     * had when it was set up.
     */
    public static function versionAsOf(int $userId, ?CarbonInterface $at = null): ?SignatureVersion
    {
        $at ??= now();

        return SignatureVersion::where('user_id', $userId)
            ->where('effective_from', '<=', $at)
            ->orderByDesc('effective_from')
            ->orderByDesc('id')
            ->first()
            ?? SignatureVersion::where('user_id', $userId)->orderBy('effective_from')->orderBy('id')->first();
    }

    /**
     * A signer as the documents print them: name, signature and position, as
     * of the document's date. Accepts the bare name object Report::resolveReviewer
     * falls back to (no account: name only).
     */
    public static function signer(?object $user, ?CarbonInterface $at = null): ?array
    {
        if (!$user) {
            return null;
        }

        $version = isset($user->id) ? self::versionAsOf((int) $user->id, $at) : null;

        return [
            'name' => $user->name ?? null,
            'signature_url' => $version?->signatureUrl() ?? $user->signature_url ?? null,
            'position' => $version?->position
                ?? ($user->position ?? null)
                ?? self::defaultPosition($user->user_type ?? null),
        ];
    }

    /**
     * The Zoning Administrator who signs as of a moment: the administrator
     * account whose signature version was most recently put in force by then.
     * With one administrator this is simply them; when the post changes hands
     * the new one's version starts on the handover date and older documents
     * keep the previous signature.
     */
    public static function zoningAdministrator(?CarbonInterface $at = null): ?User
    {
        $at ??= now();

        $version = SignatureVersion::query()
            ->join('users', 'users.id', '=', 'signature_versions.user_id')
            ->where('users.user_type', 'super_admin')
            ->whereNull('users.deleted_at')
            ->where('signature_versions.effective_from', '<=', $at)
            ->whereNotNull('signature_versions.signature_path')
            ->orderByDesc('signature_versions.effective_from')
            ->orderByDesc('signature_versions.id')
            ->first(['signature_versions.user_id']);

        if ($version) {
            return User::find($version->user_id);
        }

        return User::where('user_type', 'super_admin')->whereNotNull('signature_path')->first()
            ?? User::where('user_type', 'super_admin')->first();
    }

    /**
     * Put a new signature and/or position in force for a staff account from a
     * date. Either may be left out to keep what the previous version had.
     */
    public static function set(User $user, ?UploadedFile $signature, ?string $position, CarbonInterface $effectiveFrom, ?int $setBy = null, ?string $note = null): SignatureVersion
    {
        $previous = self::versionAsOf($user->id, $effectiveFrom);

        $path = $previous?->signature_path ?: $user->signature_path;
        if ($signature) {
            $directory = public_path(self::UPLOAD_DIRECTORY);
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }
            $name = sprintf('user-%d-%s.%s', $user->id, now()->format('Ymd-His'), strtolower($signature->getClientOriginalExtension() ?: 'png'));
            $signature->move($directory, $name);
            $path = self::UPLOAD_DIRECTORY . '/' . $name;
        }

        $position = $position !== null && trim($position) !== '' ? trim($position) : ($previous?->position ?: $user->position);

        return DB::transaction(function () use ($user, $path, $position, $effectiveFrom, $setBy, $note) {
            $version = SignatureVersion::create([
                'user_id' => $user->id,
                'signature_path' => $path,
                'position' => $position,
                'effective_from' => $effectiveFrom,
                'set_by' => $setBy,
                'note' => $note,
                'created_at' => now(),
            ]);

            // The account carries whatever is in force today.
            $current = self::versionAsOf($user->id);
            $user->forceFill([
                'signature_path' => $current?->signature_path,
                'position' => $current?->position,
            ])->save();

            return $version;
        });
    }

    /**
     * The first version for an account that has none: what it has today,
     * dated far enough back to cover every document already issued.
     */
    public static function backfill(User $user): void
    {
        if (SignatureVersion::where('user_id', $user->id)->exists()) {
            return;
        }

        $path = $user->signature_path;
        if (empty($path) || !file_exists(public_path($path))) {
            $path = SignatureLocator::forName($user->name);
        }
        $position = $user->position ?: self::defaultPosition($user->user_type);

        SignatureVersion::create([
            'user_id' => $user->id,
            'signature_path' => $path,
            'position' => $position,
            'effective_from' => '2000-01-01 00:00:00',
            'set_by' => null,
            'note' => 'On file when signature history began',
            'created_at' => now(),
        ]);

        $user->forceFill(['signature_path' => $path, 'position' => $position])->save();
    }
}
