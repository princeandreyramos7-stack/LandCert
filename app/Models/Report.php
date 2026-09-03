<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    protected $primaryKey = 'report_id';

    protected $fillable = [
        'request_id',
        'description',
        'date_certified',
        'amount',
        'evaluation',
        'date_reported',
        'issued_by',
        'reviewed_by',
        'payment_amount',
        'requirements',
        'admin_notes',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'date_certified' => 'date',
        'date_reported' => 'datetime',
        'amount' => 'decimal:2',
        'requirements' => 'array',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the request that owns the report (using normalized structure).
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class, 'request_id', 'id');
    }

    /**
     * The staff account that reviewed/evaluated this application. This is what
     * decides whose e-signature is stamped on the certificate and clearance.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Resolve the reviewing officer for signing purposes.
     *
     * Prefers the reviewed_by FK. Falls back to matching the legacy issued_by
     * name against a staff account (older reports predate the FK), and finally
     * to a bare name object so the document still prints a name — just without
     * a signature.
     */
    public function resolveReviewer(): ?object
    {
        if ($this->reviewed_by && ($user = User::find($this->reviewed_by))) {
            return $user;
        }

        $name = trim((string) $this->issued_by);
        if ($name === '') {
            return null;
        }

        $match = User::whereIn('user_type', ['admin', 'super_admin'])
            ->whereRaw('LOWER(TRIM(name)) = ?', [mb_strtolower($name)])
            ->first();

        return $match
            ?: $this->matchStaffLoosely($name)
            ?: (object) ['name' => $name, 'signature_url' => null];
    }

    /**
     * Find the staff account a legacy issued_by name refers to, allowing for the
     * ways the same person gets written down.
     *
     * The exact comparison above only survives an identical string. "Kay B
     * Aggarao" without the full stop, "Engr. Kay B. Aggarao" with the title, or
     * "Kay Aggarao" without the middle initial all failed it — and the failure
     * is quiet and misleading, because the certificate still prints the name and
     * simply omits the signature, so the document looks unsigned rather than
     * broken.
     *
     * Only an unambiguous match counts: signing a certificate as the wrong
     * officer is far worse than leaving it unsigned.
     */
    private function matchStaffLoosely(string $name): ?User
    {
        $letters = fn (string $value) => preg_replace('/[^a-z]/', '', mb_strtolower($value));

        // Honorifics attach to the name in some records but never in the
        // accounts, so they cannot help identify anyone.
        $stripTitles = fn (string $value) => trim(preg_replace(
            '/\b(engr|arch|atty|hon|mr|mrs|ms|dr|enp)\b\.?/iu',
            '',
            $value
        ));

        // Comparing without middle initials lets "Kay Aggarao" reach
        // "Kay B. Aggarao" without letting two different people collide.
        $collapse = function (string $value) use ($letters, $stripTitles) {
            $parts = preg_split('/\s+/', trim($stripTitles($value))) ?: [];
            $kept = array_filter($parts, fn ($part) => mb_strlen($letters($part)) > 1);

            return $letters(implode('', $kept));
        };

        $target = $collapse($name);
        if ($target === '') {
            return null;
        }

        $candidates = User::whereIn('user_type', ['admin', 'super_admin'])
            ->get()
            ->filter(fn (User $user) => $collapse($user->name) === $target);

        return $candidates->count() === 1 ? $candidates->first() : null;
    }

    /**
     * Alias for request() relationship for compatibility.
     */
    public function requestModel(): BelongsTo
    {
        return $this->belongsTo(Request::class, 'request_id', 'id');
    }
}
