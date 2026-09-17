<?php

namespace App\Console\Commands;

use App\Models\Request as RequestModel;
use App\Support\ProcessingSla;
use App\Support\Settings;
use Illuminate\Console\Command;

/**
 * Move closed applications - released or denied - that have not been touched
 * for N years off the applications board, into the archive. Nothing is
 * deleted: an archived application still opens, prints and appears under
 * the board's "Archived" filter. N is the archive_after_years setting.
 */
class ArchiveApplications extends Command
{
    protected $signature = 'applications:archive
        {--years= : Archive closed applications older than this many years (default: the archive_after_years setting)}
        {--dry-run : Only report what would be archived}';

    protected $description = 'Archive released or denied applications older than the configured number of years';

    public function handle(): int
    {
        $years = (int) ($this->option('years') ?: Settings::get('archive_after_years', 2));
        if ($years < 1) {
            $this->error('The archive age must be at least one year.');
            return self::FAILURE;
        }

        $cutoff = now()->subYears($years);
        $closed = array_keys(array_filter(ProcessingSla::STAGES, fn ($stage) => $stage === 'closed'));

        // Closed on the status the office sees: released and the like on the
        // request itself, or a denial on the report.
        $candidates = RequestModel::query()
            ->whereNull('archived_at')
            ->where('updated_at', '<', $cutoff)
            ->where(function ($q) use ($closed) {
                $q->whereIn('status', $closed)
                  ->orWhereHas('report', fn ($r) => $r->where('evaluation', 'rejected'));
            })
            ->orderBy('id')
            ->get(['id', 'application_number', 'status', 'updated_at']);

        if ($candidates->isEmpty()) {
            $this->info("Nothing to archive: no closed application older than {$years} year(s).");
            return self::SUCCESS;
        }

        foreach ($candidates as $request) {
            $this->line(sprintf('%s  %-14s last updated %s', $request->application_number ?? "#{$request->id}", $request->status, $request->updated_at?->toDateString()));
        }

        if ($this->option('dry-run')) {
            $this->info("{$candidates->count()} application(s) would be archived.");
            return self::SUCCESS;
        }

        RequestModel::whereIn('id', $candidates->pluck('id'))->update(['archived_at' => now(), 'archived_by' => null]);
        $this->info("Archived {$candidates->count()} application(s) closed more than {$years} year(s) ago.");

        return self::SUCCESS;
    }
}
