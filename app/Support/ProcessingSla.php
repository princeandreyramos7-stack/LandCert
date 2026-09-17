<?php

namespace App\Support;

use App\Models\Report;
use App\Models\Request as RequestModel;
use App\Models\RequestStatusHistory;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Processing time, the way the Ease of Doing Business Act (ARTA) asks an LGU
 * to account for it: how long each application sat at each step, against the
 * number of working days the Citizen's Charter promises for that step.
 *
 * Every change of the status the office sees (Request::deriveStatus) is
 * written to request_status_history as it happens - from the model hooks in
 * Request and Report, so no controller has to remember - and the request
 * keeps `stage_since`, when it entered its current step, for the board.
 *
 * A step is one of:
 *   verification  the Zoning Officer checking the documents
 *   approval      the Zoning Administrator's decision
 *   applicant     waiting on the applicant (corrections, or the fee)
 *   release       paid; the office issues and hands over the document
 *   closed        released, or denied
 * The office is answerable for verification, approval and release; the
 * applicant's own time is tracked but never counted against the office.
 */
class ProcessingSla
{
    public const STAGES = [
        'pending' => 'verification',
        'for_verification' => 'verification',
        'reviewed' => 'approval',
        'pending_superadmin_approval' => 'approval',
        'in_applicant' => 'applicant',
        'returned' => 'applicant',
        'approved' => 'applicant',
        'for_payment' => 'applicant',
        'pending_payment' => 'applicant',
        'payment_confirmed' => 'release',
        'certificate_preparing' => 'release',
        'certificate_ready' => 'release',
        'released' => 'closed',
        'collected' => 'closed',
        'completed' => 'closed',
        'rejected' => 'closed',
    ];

    /** Working days allowed per office step, and the settings key each reads. */
    public const LIMIT_SETTINGS = [
        'verification' => ['sla_days_verification', 3],
        'approval' => ['sla_days_approval', 2],
        'release' => ['sla_days_release', 3],
    ];

    /** The step a (derived) status belongs to. */
    public static function stageOf(?string $status): string
    {
        return self::STAGES[strtolower((string) $status)] ?? 'verification';
    }

    /**
     * Working days allowed per office step: from the Citizen's Charter
     * settings, or the defaults above. Cached briefly - read on every board.
     */
    public static function limits(): array
    {
        return Cache::remember('processing.sla.limits', now()->addMinutes(5), function () {
            $limits = [];
            foreach (self::LIMIT_SETTINGS as $stage => [$key, $default]) {
                $value = (int) Settings::get($key, $default);
                $limits[$stage] = $value > 0 ? $value : $default;
            }
            return $limits;
        });
    }

    /** Whole working days (Monday to Friday) between two moments. */
    public static function workingDaysBetween(CarbonInterface $from, CarbonInterface $to): int
    {
        if ($to->lessThanOrEqualTo($from)) {
            return 0;
        }
        $days = 0;
        $cursor = $from->copy()->startOfDay();
        $end = $to->copy()->startOfDay();
        while ($cursor->lessThan($end)) {
            $cursor->addDay();
            if ($cursor->isWeekday()) {
                $days++;
            }
        }
        return $days;
    }

    /** The status the office sees for a request, read fresh. */
    public static function derivedStatus(RequestModel $request): ?string
    {
        $evaluation = Report::where('request_id', $request->id)->orderByDesc('report_id')->value('evaluation');

        return RequestModel::deriveStatus($request->status, $evaluation);
    }

    /**
     * Note a change of status, if there is one. Called after a Request or its
     * Report is saved; writes nothing when the status the office sees is the
     * same as the last one on record.
     */
    public static function record(RequestModel $request, ?int $changedBy = null, ?CarbonInterface $at = null): ?RequestStatusHistory
    {
        $status = self::derivedStatus($request);
        if ($status === null) {
            return null;
        }

        $last = RequestStatusHistory::where('request_id', $request->id)->orderByDesc('changed_at')->orderByDesc('id')->first();
        if ($last && $last->status === $status) {
            return null;
        }

        $at ??= now();
        $row = RequestStatusHistory::create([
            'request_id' => $request->id,
            'status' => $status,
            'previous_status' => $last?->status,
            'changed_by' => $changedBy,
            'changed_at' => $at,
        ]);

        // Straight to the table: an Eloquent save here would fire the hook
        // that called us.
        DB::table('requests')->where('id', $request->id)->update(['stage_since' => $at]);

        return $row;
    }

    /**
     * History for an application filed before this was recorded: filed at
     * created_at, then whatever status changes the audit log kept, then the
     * status it is at now as of its last update. Only for a request with no
     * history yet.
     */
    public static function backfill(RequestModel $request): void
    {
        if (RequestStatusHistory::where('request_id', $request->id)->exists()) {
            return;
        }

        $rows = [[
            'status' => 'pending',
            'changed_at' => $request->created_at ?? now(),
            'changed_by' => null,
        ]];

        // The audit log records status / evaluation edits with their new
        // values; each is a transition at that moment.
        $logs = DB::table('audit_logs')
            ->where(function ($q) use ($request) {
                $q->where(fn ($r) => $r->where('model_type', 'Request')->where('model_id', $request->id))
                  ->orWhere(fn ($r) => $r->where('model_type', 'Report')->whereIn('model_id', Report::where('request_id', $request->id)->pluck('report_id')));
            })
            ->whereNotNull('new_values')
            ->orderBy('created_at')
            ->get(['model_type', 'new_values', 'created_at', 'user_id']);

        foreach ($logs as $log) {
            $values = json_decode($log->new_values, true) ?: [];
            $status = $log->model_type === 'Report' ? ($values['evaluation'] ?? null) : ($values['status'] ?? null);
            if (is_string($status) && isset(self::STAGES[strtolower($status)])) {
                $rows[] = ['status' => strtolower($status), 'changed_at' => Carbon::parse($log->created_at), 'changed_by' => $log->user_id];
            }
        }

        $current = self::derivedStatus($request);
        if ($current && end($rows)['status'] !== $current) {
            $rows[] = ['status' => $current, 'changed_at' => $request->updated_at ?? now(), 'changed_by' => null];
        }

        $previous = null;
        $last = null;
        foreach ($rows as $row) {
            if ($row['status'] === $previous) {
                continue;
            }
            RequestStatusHistory::create([
                'request_id' => $request->id,
                'status' => $row['status'],
                'previous_status' => $previous,
                'changed_by' => $row['changed_by'],
                'changed_at' => $row['changed_at'],
            ]);
            $previous = $row['status'];
            $last = $row['changed_at'];
        }

        DB::table('requests')->where('id', $request->id)->update(['stage_since' => $last]);
    }

    /**
     * Processing-time figures for the reports page, over applications filed
     * since $since: average turnaround (filed to released), the average the
     * office took at each of its steps, and how many closed applications the
     * office finished every step of within the Charter's limits.
     */
    public static function statistics(CarbonInterface $since): array
    {
        $limits = self::limits();

        $history = RequestStatusHistory::query()
            ->join('requests', 'requests.id', '=', 'request_status_history.request_id')
            ->where('requests.created_at', '>=', $since)
            ->whereNull('requests.deleted_at')
            ->orderBy('request_status_history.request_id')
            ->orderBy('request_status_history.changed_at')
            ->orderBy('request_status_history.id')
            ->get(['request_status_history.request_id', 'request_status_history.status', 'request_status_history.changed_at'])
            ->groupBy('request_id');

        $turnarounds = [];
        $stageDays = ['verification' => [], 'approval' => [], 'release' => []];
        $closed = 0;
        $onTime = 0;

        foreach ($history as $rows) {
            $rows = $rows->values();
            $filed = $rows[0]->changed_at;
            $releasedAt = null;
            $perStage = ['verification' => 0, 'approval' => 0, 'release' => 0];

            for ($i = 0; $i < $rows->count(); $i++) {
                $stage = self::stageOf($rows[$i]->status);
                $from = $rows[$i]->changed_at;
                $to = $i + 1 < $rows->count() ? $rows[$i + 1]->changed_at : now();
                if (isset($perStage[$stage])) {
                    $perStage[$stage] += self::workingDaysBetween($from, $to);
                }
                if ($rows[$i]->status === 'released' && !$releasedAt) {
                    $releasedAt = $rows[$i]->changed_at;
                }
            }

            if ($releasedAt) {
                $turnarounds[] = self::workingDaysBetween($filed, $releasedAt);
                $closed++;
                $within = true;
                foreach ($perStage as $stage => $days) {
                    if ($days > $limits[$stage]) {
                        $within = false;
                    }
                    $stageDays[$stage][] = $days;
                }
                if ($within) {
                    $onTime++;
                }
            }
        }

        $avg = fn (array $values) => count($values) ? round(array_sum($values) / count($values), 1) : null;

        return [
            'since' => $since->toDateString(),
            'applications' => $history->count(),
            'released' => $closed,
            'average_turnaround_days' => $avg($turnarounds),
            'average_stage_days' => array_map($avg, $stageDays),
            'on_time_percent' => $closed ? (int) round($onTime / $closed * 100) : null,
            'limits' => $limits,
        ];
    }
}
