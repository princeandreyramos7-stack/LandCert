<?php

namespace App\Http\Requests\Auth;

use App\Services\AuditLogService;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    /** Wrong passwords allowed from one address before the sign-in is locked. */
    public const MAX_ATTEMPTS = 5;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Sign-in stays lenient: fold only the domain, never the name half.
     *
     * Registration keeps the name half exactly as typed, so lowercasing the
     * whole address here would stop "JuanDelaCruz@gmail.com" matching its own
     * stored row under a case-sensitive collation. Folding the domain lets
     * someone who types "GMAIL.COM" still get in, since that half is
     * case-insensitive by definition.
     */
    protected function prepareForValidation(): void
    {
        $email = $this->input('email');

        if (!is_string($email)) {
            return;
        }

        $email = trim($email);
        $atPosition = mb_strrpos($email, '@');

        if ($atPosition !== false) {
            $email = mb_substr($email, 0, $atPosition + 1)
                . mb_strtolower(mb_substr($email, $atPosition + 1));
        }

        $this->merge(['email' => $email]);
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            // The audit trail says which try this was and why it failed; the
            // form only ever says "these credentials do not match".
            $account = \App\Models\User::where('email', $this->string('email'))->first();
            AuditLogService::logFailedLogin(
                $this->string('email'),
                RateLimiter::attempts($this->throttleKey()),
                self::MAX_ATTEMPTS,
                $account ? 'wrong_password' : 'unknown_email',
                $account?->id
            );

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());

        AuditLogService::logLogin();
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), self::MAX_ATTEMPTS)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        // Logged once, when the lock falls, so the audit trail shows the
        // string of wrong passwords ending in a lockout - not a line for
        // every refused try while it lasts.
        $lockKey = 'login-locked:' . $this->throttleKey();
        if (! Cache::has($lockKey)) {
            Cache::put($lockKey, true, now()->addSeconds(max(1, $seconds)));
            AuditLogService::logLoginLocked(
                $this->string('email'),
                RateLimiter::attempts($this->throttleKey()),
                $seconds,
                \App\Models\User::where('email', $this->string('email'))->value('id')
            );
        }

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
