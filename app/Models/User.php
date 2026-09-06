<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Support\SignatureLocator;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, SoftDeletes;

    /**
     * Boot the model.
     *
     * The application uses `user_type` as the single source of truth for
     * authorization. Spatie's role/permission tables are kept in sync
     * automatically here so the two systems can never drift apart.
     */
    protected static function booted(): void
    {
        static::saved(function (User $user) {
            if ($user->user_type) {
                \Spatie\Permission\Models\Role::firstOrCreate([
                    'name' => $user->user_type,
                    'guard_name' => 'web',
                ]);
                $user->syncRoles([$user->user_type]);
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'contact_number',
        'address',
        'user_type',
        'signature_path',
        'avatar_path',
    ];

    /**
     * Expose the computed avatar URL on every serialized user (it is read from
     * `auth.user.avatar_url` throughout the front end).
     *
     * @var list<string>
     */
    protected $appends = ['avatar_url'];

    /**
     * Public URL of this user's e-signature, or null when none is on file.
     * Stored as a path relative to public/ (e.g. "images/E-signitures/x.png").
     */
    public function getSignatureUrlAttribute(): ?string
    {
        // The stored path is the fast answer, but only while it still points at
        // a real file. An account whose path signatures:sync never set — or that
        // points at a file since renamed — would otherwise print an unsigned
        // certificate with the image sitting right there on disk, and fixing it
        // would mean shell access to every environment.
        if (!empty($this->signature_path) && file_exists(public_path($this->signature_path))) {
            return '/' . ltrim($this->signature_path, '/');
        }

        $located = SignatureLocator::forName($this->name);

        return $located ? '/' . $located : null;
    }

    /**
     * Public URL of this user's profile picture, or null when none is set.
     * Stored on the "public" disk (e.g. "avatars/x.jpg").
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (empty($this->avatar_path)) {
            return null;
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->avatar_path);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
