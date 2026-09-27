<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Request as RequestModel;
use App\Services\AuditLogService;
use App\Support\ProcessingSla;
use Illuminate\Http\Request;

/**
 * Shared by SuperAdminController and AdminController so the Zoning
 * Administrator and the Zoning Officer archive by the same rule, from the
 * same one place - a controller assumes $this->cacheService is set (both
 * constructors inject DashboardCacheService the same way).
 */
trait BatchArchivesRequests
{
    /**
     * Batch-archive every closed application filed in a date range. Same
     * "closed" eligibility rule as archiveRequest()/ArchiveApplications
     * (App\Console\Commands) - a still-pending application in the range is
     * skipped, not archived - applied to created_at instead of an age
     * cutoff, and done as one bulk update with one summary audit log entry
     * instead of one row/log at a time.
     *
     * dry_run=1 returns the count and a short preview without writing
     * anything, mirroring the console command's own --dry-run flag.
     */
    public function batchArchiveRequests(Request $request)
    {
        $validated = $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'dry_run' => 'nullable|boolean',
        ]);

        $from = $validated['date_from'];
        $to = $validated['date_to'] . ' 23:59:59';
        $closed = array_keys(array_filter(ProcessingSla::STAGES, fn ($stage) => $stage === 'closed'));

        $candidates = RequestModel::query()
            ->whereNull('archived_at')
            ->whereBetween('created_at', [$from, $to])
            ->where(function ($q) use ($closed) {
                $q->whereIn('status', $closed)
                  ->orWhereHas('report', fn ($r) => $r->where('evaluation', 'rejected'));
            })
            ->orderBy('id')
            ->get(['id', 'application_number', 'status', 'created_at']);

        if ($request->boolean('dry_run')) {
            return response()->json([
                'count' => $candidates->count(),
                'sample' => $candidates->take(10)->map(fn ($r) => [
                    'application_number' => $r->application_number ?? "#{$r->id}",
                    'status' => $r->status,
                    'created_at' => $r->created_at?->toDateString(),
                ]),
            ]);
        }

        if ($candidates->isEmpty()) {
            return back()->with('error', 'No closed applications were filed in that date range.');
        }

        $ids = $candidates->pluck('id');
        RequestModel::whereIn('id', $ids)->update([
            'archived_at' => now(),
            'archived_by' => auth()->id(),
        ]);

        AuditLogService::log(
            'updated',
            "Batch-archived {$candidates->count()} application(s) filed {$validated['date_from']} to {$validated['date_to']}",
            'Request',
            null,
            null,
            ['archived_at' => now()->toDateTimeString()],
            ['request_ids' => $ids->values()->all(), 'date_from' => $validated['date_from'], 'date_to' => $validated['date_to']]
        );

        $this->cacheService->clearCache();

        return back()->with('success', "Archived {$candidates->count()} application(s) filed {$validated['date_from']} to {$validated['date_to']}.");
    }
}
