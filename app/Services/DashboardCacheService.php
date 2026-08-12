<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use App\Models\Request as RequestModel;
use App\Models\Report;
use Illuminate\Support\Facades\DB;

class DashboardCacheService
{
    const CACHE_TTL = 300; // 5 minutes cache

    /**
     * Get cached dashboard analytics
     */
    public function getAnalytics()
    {
        return Cache::remember('dashboard.analytics', self::CACHE_TTL, function () {
            return $this->calculateAnalytics();
        });
    }

    /**
     * Get cached statistics
     */
    public function getStats()
    {
        return Cache::remember('dashboard.stats', self::CACHE_TTL, function () {
            return $this->calculateStats();
        });
    }

    /**
     * Get cached evaluation distribution
     */
    public function getEvaluationDistribution()
    {
        return Cache::remember('dashboard.evaluation_distribution', self::CACHE_TTL, function () {
            return $this->calculateEvaluationDistribution();
        });
    }

    /**
     * Clear all dashboard caches
     */
    public function clearCache()
    {
        Cache::forget('dashboard.analytics');
        Cache::forget('dashboard.stats');
        Cache::forget('dashboard.evaluation_distribution');
    }

    /**
     * Calculate analytics data
     */
    private function calculateAnalytics()
    {
        // Monthly submissions trend (last 6 months)
        $monthlyData = RequestModel::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();
        
        // Application status breakdown
        $statusBreakdown = Report::select('evaluation', DB::raw('COUNT(*) as count'))
            ->groupBy('evaluation')
            ->get();
        
        // Average processing time (reports now link directly to requests)
        $avgProcessingTime = Report::where('evaluation', 'approved')
            ->whereNotNull('date_reported')
            ->join('requests', 'reports.request_id', '=', 'requests.id')
            ->selectRaw('AVG(DATEDIFF(reports.date_reported, requests.created_at)) as avg_days')
            ->value('avg_days');
        
        // Project type distribution
        $projectTypes = RequestModel::join('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->select('normalized_projects.project_type', DB::raw('COUNT(*) as count'))
            ->whereNotNull('normalized_projects.project_type')
            ->groupBy('normalized_projects.project_type')
            ->get();
        
        // Top users by submissions (limited to 5)
        $topUsers = RequestModel::select('user_id', DB::raw('COUNT(*) as count'))
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->orderByDesc('count')
            ->take(5)
            ->with('user')
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->user?->name ?? 'Unknown',
                    'email' => $item->user?->email ?? '',
                    'count' => $item->count,
                ];
            });
        
        // Weekly activity (last 4 weeks)
        $weeklyActivity = RequestModel::select(
            DB::raw('YEARWEEK(created_at) as week'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subWeeks(4))
        ->groupBy('week')
        ->orderBy('week')
        ->get();
        
        return [
            'monthly_submissions' => $monthlyData,
            'status_breakdown' => $statusBreakdown,
            'avg_processing_time' => round($avgProcessingTime ?? 0, 1),
            'project_types' => $projectTypes,
            'top_users' => $topUsers,
            'weekly_activity' => $weeklyActivity,
        ];
    }

    /**
     * Calculate statistics (using normalized structure)
     */
    private function calculateStats()
    {
        $allRequests = RequestModel::with(['user', 'reports'])->get();

        $statusCounts = ['pending' => 0, 'approved' => 0, 'rejected' => 0];
        
        foreach ($allRequests as $request) {
            // Get the latest report for this request
            $report = $request->reports->first();
            $status = $report?->evaluation ?? $request->status;
            
            if (isset($statusCounts[$status])) {
                $statusCounts[$status]++;
            }
        }
        
        return [
            'total' => $allRequests->count(),
            'pending' => $statusCounts['pending'],
            'approved' => $statusCounts['approved'],
            'rejected' => $statusCounts['rejected'],
        ];
    }

    /**
     * Calculate evaluation distribution
     */
    private function calculateEvaluationDistribution()
    {
        return Report::select('evaluation', DB::raw('COUNT(*) as count'))
            ->groupBy('evaluation')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->evaluation => $item->count];
            });
    }
}
