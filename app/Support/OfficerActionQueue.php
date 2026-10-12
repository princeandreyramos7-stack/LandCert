<?php

namespace App\Support;

use App\Models\Request as RequestModel;
use Carbon\CarbonInterface;

/**
 * "Needs Immediate Officer Action" on the Zoning Officer's dashboard: every
 * application waiting on the officer, ordered by its Citizen's Charter
 * deadline.
 *
 * The officer is answerable for two steps (see ProcessingSla):
 *   verification  checking the application and its documents
 *   release       preparing and handing over the certificate once paid
 * Each step's deadline is the moment the application entered it
 * (requests.stage_since) plus that step's working-day limit. Nothing here
 * is estimated: no step, no deadline - an application with no recorded
 * stage falls back to when it was last updated.
 */
class OfficerActionQueue
{
    /** Due within this many hours (or overdue) counts as critical. */
    public const CRITICAL_HOURS = 24;

    /** Most items sent to the dashboard; the total is still counted over all. */
    public const LIMIT = 20;

    private const OFFICER_STAGES = ['verification', 'release'];

    private const TYPE_LABELS = [
        'CZC' => 'Certificate of Zoning Compliance',
        'ZONING' => 'Certificate of Zoning Compliance',
        'ZC' => 'Zoning Certification',
        'TUP' => 'Temporary Use Permit',
        'SUP' => 'Special Use Permit',
    ];

    /**
     * @return array{items: list<array<string,mixed>>, total: int, critical: int, critical_hours: int}
     */
    public static function build(?CarbonInterface $now = null): array
    {
        $now ??= now();
        $limits = ProcessingSla::limits();

        $requests = RequestModel::query()
            ->whereNull('archived_at')
            ->whereNotIn('status', ['released', 'rejected', 'collected', 'completed'])
            ->with([
                'report',
                'project:id,request_id,project_type,project_nature,project_description',
                'location:id,request_id,barangay',
                'property:id,request_id,lot_number,zone_classification',
                'applicant:id,applicant_name',
                'applicant.corporation:id,applicant_id,corporation_name',
            ])
            ->get(['id', 'application_number', 'status', 'applicant_id', 'stage_since', 'created_at', 'updated_at']);

        $items = [];
        foreach ($requests as $request) {
            $status = RequestModel::deriveStatus($request->status, $request->report?->evaluation);
            $stage = ProcessingSla::stageOf($status);
            if (!in_array($stage, self::OFFICER_STAGES, true)) {
                continue;
            }

            $since = $request->stage_since ?? $request->updated_at ?? $request->created_at;
            $due = ProcessingSla::addWorkingDays($since, (int) $limits[$stage]);
            $returned = $stage === 'verification' && $request->report?->returnedReason() !== null;
            $type = strtoupper(trim((string) $request->project?->project_type));

            $items[] = [
                'id' => $request->id,
                'application_number' => $request->application_number,
                'type' => $type ?: null,
                'type_label' => self::TYPE_LABELS[$type] ?? null,
                'zone' => $request->property?->zone_classification ?: null,
                'title' => $request->project?->project_nature
                    ?: ($request->project?->project_description ?: (self::TYPE_LABELS[$type] ?? 'Application')),
                'barangay' => $request->location?->barangay,
                'lot_number' => $request->property?->lot_number,
                'applicant' => $request->applicant?->applicant_name ?: $request->applicant?->corporation?->corporation_name,
                'filed_at' => $request->created_at?->toIso8601String(),
                'stage' => $stage,
                'status' => $status,
                'returned' => $returned,
                'due_at' => $due->toIso8601String(),
                'action' => self::action($stage, $status, $returned, $request->id),
            ];
        }

        usort($items, fn ($a, $b) => strcmp($a['due_at'], $b['due_at']));

        $criticalBefore = $now->copy()->addHours(self::CRITICAL_HOURS);
        $critical = count(array_filter(
            $items,
            fn ($item) => \Illuminate\Support\Carbon::parse($item['due_at'])->lessThanOrEqualTo($criticalBefore)
        ));

        return [
            'items' => array_slice($items, 0, self::LIMIT),
            'total' => count($items),
            'critical' => $critical,
            'critical_hours' => self::CRITICAL_HOURS,
        ];
    }

    /** What the officer does next, and where. @return array{label: string, href: string} */
    private static function action(string $stage, ?string $status, bool $returned, int $id): array
    {
        if ($stage === 'release') {
            return $status === 'certificate_ready'
                ? ['label' => 'Release Certificate', 'href' => '/certificates']
                : ['label' => 'Prepare Certificate', 'href' => '/certificates'];
        }

        return [
            'label' => $returned ? 'Address Return' : 'Review Application',
            'href' => "/admin/requests/{$id}/view-application",
        ];
    }
}
