<?php

namespace App\Console\Commands;

use App\Models\Request as RequestModel;
use App\Support\ProcessingSla;
use App\Support\Settings;
use Illuminate\Console\Command;

/**
 * Move applications off the live board, into the archive, on two rules.
 * Nothing is deleted: an archived application still opens, prints and
 * appears under the board's "Archived" filter (and the same filter on
 * Payments and Certificates, since those list rows tied to a request).
 *
 * 1. Closed - released or denied - and untouched for N years
 *    (archive_after_years setting).
 * 2. Approved by the Zoning Administrator but never paid, sitting for M
 *    days (archive_unpaid_after_days setting). This is the same 'approved'
 *    status the Payments page calls "awaiting payment" - an application
 *    stuck here never became payment_confirmed, so it is presumed
 *    abandoned once it has sat long enough.
 *
 * Runs daily (see routes/console.php): rule 1 rarely finds a new candidate
 * on any given day, but checking costs nothing, and rule 2 needs the
 * shorter cadence to archive within a day of crossing its threshold.
 */
class ArchiveApplications extends Command
{
    protected $signature = 'applications:archive
        {--years= : Archive closed applications older than this many years (default: the archive_after_years setting)}
        {--unpaid-days= : Archive approved-and-unpaid applications older than this many days (default: the archive_unpaid_after_days setting)}
        {--dry-run : Only report what would be archived}';

    protected $description = 'Archive closed applications older than N years, and approved-but-unpaid applications older than M days';

    public function handle(): int
    {
        $years = (int) ($this->option('years') ?: Settings::get('archive_after_years', 2));
        $unpaidDays = (int) ($this->option('unpaid-days') ?: Settings::get('archive_unpaid_after_days', 30));

        if ($years < 1) {
            $this->error('The archive age must be at least one year.');
            return self::FAILURE;
        }
        if ($unpaidDays < 1) {
            $this->error('The unpaid archive age must be at least one day.');
            return self::FAILURE;
        }

        $closedCutoff = now()->subYears($years);
        $unpaidCutoff = now()->subDays($unpaidDays);
        $closed = array_keys(array_filter(ProcessingSla::STAGES, fn ($stage) => $stage === 'closed'));

        // Closed on the status the office sees: released and the like on the
        // request itself, or a denial on the report.
        $closedCandidates = RequestModel::query()
            ->whereNull('archived_at')
            ->where('updated_at', '<', $closedCutoff)
            ->where(function ($q) use ($closed) {
                $q->whereIn('status', $closed)
                  ->orWhereHas('report', fn ($r) => $r->where('evaluation', 'rejected'));
            })
            ->orderBy('id')
            ->get(['id', 'application_number', 'status', 'updated_at']);

        // stage_since is when the request last entered its current status
        // (App\Support\ProcessingSla::record) - precisely how long it has
        // sat approved-and-unpaid, unlike updated_at which any unrelated
        // edit would also move.
        $unpaidCandidates = RequestModel::query()
            ->whereNull('archived_at')
            ->where('status', 'approved')
            ->where('stage_since', '<', $unpaidCutoff)
            ->orderBy('id')
            ->get(['id', 'application_number', 'status', 'stage_since']);

        $candidates = $closedCandidates->concat($unpaidCandidates)->unique('id');

        if ($candidates->isEmpty()) {
            $this->info("Nothing to archive: no closed application older than {$years} year(s), and none approved-and-unpaid for over {$unpaidDays} day(s).");
            return self::SUCCESS;
        }

        foreach ($closedCandidates as $request) {
            $this->line(sprintf('%s  %-14s last updated %s', $request->application_number ?? "#{$request->id}", $request->status, $request->updated_at?->toDateString()));
        }
        foreach ($unpaidCandidates as $request) {
            $this->line(sprintf('%s  %-14s approved since %s', $request->application_number ?? "#{$request->id}", $request->status, $request->stage_since?->toDateString()));
        }

        if ($this->option('dry-run')) {
            $this->info("{$candidates->count()} application(s) would be archived ({$closedCandidates->count()} closed, {$unpaidCandidates->count()} approved-and-unpaid).");
            return self::SUCCESS;
        }

        RequestModel::whereIn('id', $candidates->pluck('id'))->update(['archived_at' => now(), 'archived_by' => null]);
        $this->info("Archived {$candidates->count()} application(s): {$closedCandidates->count()} closed more than {$years} year(s) ago, {$unpaidCandidates->count()} approved-and-unpaid for more than {$unpaidDays} day(s).");

        return self::SUCCESS;
    }
}
