<?php

namespace App\Console\Commands;

use App\Models\Request as RequestModel;
use App\Services\DashboardCacheService;
use App\Support\ProcessingSla;
use Illuminate\Console\Command;

/**
 * Set the status of applications whose documents were handed to the
 * applicant before the release began recording it.
 *
 * Releasing used only to stamp released_to_applicant_at and leave the status
 * at payment_confirmed, so the boards and the analytics counted a released
 * certificate as still being prepared - "Released to applicant: 0" on a
 * dashboard where several had gone out. The release sets the status now;
 * this brings the older ones into line.
 */
class HealReleasedStatuses extends Command
{
    protected $signature = 'applications:heal-released {--dry-run : Report what would change without saving}';

    protected $description = 'Mark applications released to the applicant as released, where an older release left the status behind';

    /** Statuses a released application may still be sitting at. */
    private const BEHIND = ['payment_confirmed', 'certificate_preparing', 'certificate_ready', 'approved'];

    public function handle(): int
    {
        $behind = RequestModel::whereNotNull('released_to_applicant_at')
            ->whereIn('status', self::BEHIND)
            ->orderBy('id')
            ->get(['id', 'application_number', 'status', 'released_to_applicant_at']);

        if ($behind->isEmpty()) {
            $this->info('Nothing to heal: every released application already says so.');
            return self::SUCCESS;
        }

        foreach ($behind as $request) {
            $this->line(sprintf(
                '%s  %-22s released %s',
                $request->application_number ?? "#{$request->id}",
                $request->status,
                $request->released_to_applicant_at?->toDateString()
            ));
        }

        if ($this->option('dry-run')) {
            $this->info("{$behind->count()} application(s) would be marked released.");
            return self::SUCCESS;
        }

        foreach ($behind as $row) {
            $request = RequestModel::find($row->id);
            // Saved one at a time, through the model, so the status history
            // records the change with the rest (App\Support\ProcessingSla).
            $request->update(['status' => 'released']);
            ProcessingSla::record($request, null, $request->released_to_applicant_at);
        }

        DashboardCacheService::flush();
        $this->info("Marked {$behind->count()} application(s) as released.");

        return self::SUCCESS;
    }
}
