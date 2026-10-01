<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Fired the moment a sign-in's verification code is generated - carrying
 * the plaintext code, which is about to be hashed away and is otherwise
 * never written anywhere. Nothing in the application listens for this; it
 * exists so a test can read the code the way a person would read it off
 * their phone, without weakening how the code itself is stored.
 *
 * $user is null for a brand-new registration: no row exists yet at this
 * point (see TwoFactorAuthService::beginRegistration), only the email this
 * code is meant to unlock. It is a real, already-persisted account for
 * every other case (TwoFactorAuthService::issue) - an existing applicant
 * whose phone was never verified, signing in again.
 */
class TwoFactorCodeIssued
{
    use Dispatchable;

    public function __construct(
        public readonly ?User $user,
        public readonly string $code,
        public readonly string $email,
    ) {
    }
}
