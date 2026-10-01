<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * A safety net, not the main defence: a brand-new registration no longer
 * writes a row until its SMS code is confirmed at all (see
 * TwoFactorAuthService::beginRegistration and RegisteredUserController::store),
 * so an abandoned attempt leaves nothing here to find in the first place.
 * This exists for whatever this doesn't cover - a row from before that
 * change, or any other path that ever creates an applicant account without
 * going through it. Runs daily (see routes/console.php).
 */
class PruneUnverifiedUsers extends Command
{
    protected $signature = 'users:prune-unverified
        {--hours=24 : Delete accounts still unverified after this many hours}
        {--dry-run : Only report what would be deleted}';

    protected $description = 'Delete accounts that never completed SMS verification after registering';

    public function handle(): int
    {
        $hours = (int) $this->option('hours');

        if ($hours < 1) {
            $this->error('The age must be at least one hour.');
            return self::FAILURE;
        }

        $cutoff = now()->subHours($hours);

        // withTrashed(): a row already soft-deleted some other way still
        // occupies a row and should be swept up too.
        $candidates = User::withTrashed()
            ->whereNull('phone_verified_at')
            ->where('created_at', '<', $cutoff)
            ->orderBy('id')
            ->get(['id', 'name', 'email', 'created_at']);

        if ($candidates->isEmpty()) {
            $this->info("Nothing to prune: no account has been unverified for over {$hours} hour(s).");
            return self::SUCCESS;
        }

        foreach ($candidates as $user) {
            $this->line(sprintf('%s  %-30s registered %s', "#{$user->id}", $user->email, $user->created_at?->toDateTimeString()));
        }

        if ($this->option('dry-run')) {
            $this->info("{$candidates->count()} account(s) would be deleted.");
            return self::SUCCESS;
        }

        foreach ($candidates as $user) {
            // forceDelete, not delete: User is SoftDeletes, and merely
            // hiding the row would still leave the table growing forever -
            // the exact thing this command exists to prevent.
            $user->forceDelete();
        }

        $this->info("Deleted {$candidates->count()} account(s) unverified for more than {$hours} hour(s).");

        return self::SUCCESS;
    }
}
