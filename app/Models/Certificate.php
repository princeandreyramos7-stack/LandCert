<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Certificate extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'request_id',
        'payment_id',
        'user_id',
        'certificate_number',
        'verification_code',
        'certificate_file_path',
        'issued_by',
        'issued_at',
        'valid_until',
        'revoked_at',
        'revoked_by',
        'revocation_reason',
        'status',
        'notes',
        'ready_at',
        'released_at',
        'released_by',
        'released_to_name',
        'released_to_id_type',
        'released_to_id_number',
        'release_signature_path',
        'collection_notes',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'valid_until' => 'date',
        'revoked_at' => 'datetime',
        'ready_at' => 'datetime',
        'released_at' => 'datetime',
    ];

    protected $appends = [
        'has_verified_payment',
    ];

    /* ── Public verification ──────────────────────────────────────────────
       Every certificate carries a code, printed as a QR on the sheet, that
       opens the public /verify/{code} page. */

    public const VERIFICATION_VALID = 'valid';
    public const VERIFICATION_EXPIRED = 'expired';
    public const VERIFICATION_REVOKED = 'revoked';
    public const VERIFICATION_CANCELLED = 'cancelled';

    /** Letters and digits that do not get misread when typed off paper. */
    private const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    protected static function booted(): void
    {
        static::creating(function (Certificate $certificate) {
            if (empty($certificate->verification_code)) {
                $certificate->verification_code = static::newVerificationCode();
            }
        });
    }

    /**
     * Run $work while holding a database-wide lock on certificate issuance,
     * so two near-simultaneous calls (a double-clicked "Verify Payment", or
     * FixStuckCertificates overlapping a manual verification) cannot both
     * read "no certificate yet for this request" and both create one, nor
     * both read the same highest certificate_number. Mirrors
     * Request::underNumberLock, which protects application/decision numbers
     * the same way.
     */
    public static function underIssuanceLock(callable $work)
    {
        $connection = \Illuminate\Support\Facades\DB::connection();
        if (!in_array($connection->getDriverName(), ['mysql', 'mariadb'], true)) {
            return $work();
        }

        $name = 'cpdo.certificate_issuance';
        $connection->selectOne('SELECT GET_LOCK(?, 10) AS got', [$name]);
        try {
            return $work();
        } finally {
            $connection->selectOne('SELECT RELEASE_LOCK(?) AS released', [$name]);
        }
    }

    /**
     * A fresh, unused code: 12 characters from the safe alphabet, about 60
     * bits, so it cannot be guessed and one cannot be turned into another.
     */
    public static function newVerificationCode(): string
    {
        do {
            $code = '';
            for ($i = 0; $i < 12; $i++) {
                $code .= self::CODE_ALPHABET[random_int(0, strlen(self::CODE_ALPHABET) - 1)];
            }
        } while (static::withTrashed()->where('verification_code', $code)->exists());

        return $code;
    }

    /** The address the QR on the printed sheet opens. */
    public function verificationUrl(): ?string
    {
        return $this->verification_code ? route('verify.show', $this->verification_code) : null;
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    public function isExpired(): bool
    {
        return $this->valid_until !== null && $this->valid_until->lt(Carbon::today());
    }

    /**
     * What the public page says about the document: valid, expired, revoked,
     * or cancelled (the office voided the record before it was ever released).
     */
    public function verificationStatus(): string
    {
        if ($this->isRevoked()) {
            return self::VERIFICATION_REVOKED;
        }
        if ($this->status === 'cancelled') {
            return self::VERIFICATION_CANCELLED;
        }
        if ($this->isExpired()) {
            return self::VERIFICATION_EXPIRED;
        }
        return self::VERIFICATION_VALID;
    }

    /**
     * Check if the certificate has a verified payment.
     */
    public function getHasVerifiedPaymentAttribute(): bool
    {
        if (!$this->relationLoaded('payment')) {
            $this->load('payment');
        }
        return $this->payment && $this->payment->payment_status === 'verified';
    }

    /**
     * Get the user who owns this certificate (applicant).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the request that owns the certificate.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }

    /**
     * Get the payment associated with the certificate.
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Get the user who issued the certificate.
     */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * Get the user who released the certificate.
     */
    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    /** The staff member who revoked the certificate. */
    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

}
