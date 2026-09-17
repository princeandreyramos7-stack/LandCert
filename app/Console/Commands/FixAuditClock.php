<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Shift audit entries that were stamped by the database's clock instead of
 * the application's (AuditLog::booted explains). On a host whose MySQL runs
 * on UTC while the app runs on Asia/Manila, every entry written before the
 * fix is eight hours early: this adds the hours back, once, to the entries
 * from before the fix was deployed.
 *
 *   php artisan audit:fix-clock --hours=8 --before="2026-09-17 21:00" --dry-run
 */
class FixAuditClock extends Command
{
    protected $signature = 'audit:fix-clock
        {--hours=8 : Hours to add to each affected entry (negative to subtract)}
        {--before= : Only entries created before this app-time moment (the deploy of the fix); default: now}
        {--dry-run : Report what would change without saving}';

    protected $description = 'Add the app/database time-zone difference to audit entries stamped by the database clock';

    public function handle(): int
    {
        $hours = (int) $this->option('hours');
        if ($hours === 0) {
            $this->error('Give the number of hours to add, e.g. --hours=8 for a UTC database under an Asia/Manila app.');
            return self::FAILURE;
        }

        $before = $this->option('before') ? Carbon::parse($this->option('before')) : now();
        $query = AuditLog::where('created_at', '<', $before);
        $count = $query->count();

        $this->line(sprintf('%d entr%s before %s would move by %+d hour(s).', $count, $count === 1 ? 'y' : 'ies', $before->toDateTimeString(), $hours));

        if ($count === 0 || $this->option('dry-run')) {
            return self::SUCCESS;
        }

        if (!$this->confirm('Shift them now? This cannot be told apart from real times afterwards, so run it only once.', false)) {
            $this->info('Nothing changed.');
            return self::SUCCESS;
        }

        $sign = $hours > 0 ? '+' : '-';
        $updated = DB::table('audit_logs')
            ->where('created_at', '<', $before)
            ->update(['created_at' => DB::raw("DATE_ADD(created_at, INTERVAL {$sign}" . abs($hours) . " HOUR)")]);

        $this->info("Shifted {$updated} entries by {$sign}" . abs($hours) . " hour(s).");

        return self::SUCCESS;
    }
}
