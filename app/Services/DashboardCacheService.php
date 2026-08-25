<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use App\Models\Request as RequestModel;
use App\Models\Report;
use Illuminate\Support\Facades\DB;

class DashboardCacheService
{
    const CACHE_TTL = 0; // No cache — always fresh data

    /**
     * Get dashboard analytics (always fresh)
     */
    public function getAnalytics()
    {
        if (self::CACHE_TTL === 0) {
            return $this->calculateAnalytics();
        }
        return Cache::remember('dashboard.analytics', self::CACHE_TTL, function () {
            return $this->calculateAnalytics();
        });
    }

    /**
     * Get statistics (always fresh)
     */
    public function getStats()
    {
        if (self::CACHE_TTL === 0) {
            return $this->calculateStats();
        }
        return Cache::remember('dashboard.stats', self::CACHE_TTL, function () {
            return $this->calculateStats();
        });
    }

    /**
     * Get evaluation distribution (always fresh)
     */
    public function getEvaluationDistribution()
    {
        if (self::CACHE_TTL === 0) {
            return $this->calculateEvaluationDistribution();
        }
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
        // Monthly submissions trend (last 12 months)
        $monthlyData = RequestModel::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subMonths(12))
        ->groupBy('month')
        ->orderBy('month')
        ->get();
        
        // Daily submissions (last 30 days)
        $dailySubmissions = RequestModel::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // Hourly pattern analysis (all time)
        $hourlyPattern = RequestModel::select(
            DB::raw('HOUR(created_at) as hour'),
            DB::raw('COUNT(*) as count')
        )
        ->groupBy('hour')
        ->orderBy('hour')
        ->get();

        // Day of week pattern
        $dayOfWeekPattern = RequestModel::select(
            DB::raw('DAYOFWEEK(created_at) as day'),
            DB::raw('COUNT(*) as count')
        )
        ->groupBy('day')
        ->orderBy('day')
        ->get();
        
        // Application status breakdown
        $statusBreakdown = Report::select('evaluation', DB::raw('COUNT(*) as count'))
            ->groupBy('evaluation')
            ->get();
        
        // Average processing time by status
        $processingTimeByStatus = Report::whereNotNull('date_reported')
            ->join('requests', 'reports.request_id', '=', 'requests.id')
            ->select(
                'reports.evaluation',
                DB::raw('AVG(DATEDIFF(reports.date_reported, requests.created_at)) as avg_days'),
                DB::raw('MIN(DATEDIFF(reports.date_reported, requests.created_at)) as min_days'),
                DB::raw('MAX(DATEDIFF(reports.date_reported, requests.created_at)) as max_days')
            )
            ->groupBy('reports.evaluation')
            ->get();

        // Processing time trend (last 6 months)
        $processingTimeTrend = Report::whereNotNull('date_reported')
            ->where('date_reported', '>=', now()->subMonths(6))
            ->join('requests', 'reports.request_id', '=', 'requests.id')
            ->select(
                DB::raw('DATE_FORMAT(reports.date_reported, "%Y-%m") as month'),
                DB::raw('AVG(DATEDIFF(reports.date_reported, requests.created_at)) as avg_days')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
        
        // Project type distribution with cost analysis
        $projectTypes = RequestModel::join('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->select(
                'normalized_projects.project_type',
                DB::raw('COUNT(*) as count'),
                DB::raw('AVG(CAST(normalized_projects.project_cost AS DECIMAL(15,2))) as avg_cost'),
                DB::raw('SUM(CAST(normalized_projects.project_cost AS DECIMAL(15,2))) as total_cost')
            )
            ->whereNotNull('normalized_projects.project_type')
            ->groupBy('normalized_projects.project_type')
            ->get();

        // Project nature distribution
        $projectNatures = RequestModel::join('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->select('normalized_projects.project_nature', DB::raw('COUNT(*) as count'))
            ->whereNotNull('normalized_projects.project_nature')
            ->groupBy('normalized_projects.project_nature')
            ->get();

        // Geographic distribution by barangay
        $barangayDistribution = RequestModel::join('locations', 'requests.id', '=', 'locations.request_id')
            ->select('locations.barangay', DB::raw('COUNT(*) as count'))
            ->whereNotNull('locations.barangay')
            ->groupBy('locations.barangay')
            ->orderByDesc('count')
            ->take(15)
            ->get();

        // Province distribution
        $provinceDistribution = RequestModel::join('locations', 'requests.id', '=', 'locations.request_id')
            ->select('locations.province', DB::raw('COUNT(*) as count'))
            ->whereNotNull('locations.province')
            ->groupBy('locations.province')
            ->orderByDesc('count')
            ->get();
        
        // Top users by submissions
        $topUsers = RequestModel::select('user_id', DB::raw('COUNT(*) as count'))
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->orderByDesc('count')
            ->take(10)
            ->with('user')
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->user?->name ?? 'Unknown',
                    'email' => $item->user?->email ?? '',
                    'count' => $item->count,
                ];
            });

        // User activity metrics
        $userActivityMetrics = [
            'total_active_users' => RequestModel::distinct('user_id')->count('user_id'),
            'new_users_this_month' => \App\Models\User::where('user_type', 'applicant')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'active_users_this_month' => RequestModel::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->distinct('user_id')
                ->count('user_id'),
        ];
        
        // Weekly activity (last 12 weeks)
        $weeklyActivity = RequestModel::select(
            DB::raw('YEARWEEK(created_at) as week'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subWeeks(12))
        ->groupBy('week')
        ->orderBy('week')
        ->get();

        // Certificate stats
        $certificateStats = [
            'total_issued'       => \App\Models\Certificate::count(),
            'issued_this_month'  => \App\Models\Certificate::whereMonth('issued_at', now()->month)
                ->whereYear('issued_at', now()->year)->count(),
            'preparing'          => \App\Models\Certificate::where('status', 'preparing')->count(),
            'ready_for_pickup'   => \App\Models\Certificate::where('status', 'ready_for_pickup')->count(),
            'collected'          => \App\Models\Certificate::where('status', 'released')->count(),
        ];

        // Document completion analysis
        $documentCompletion = RequestModel::leftJoin('requirement_documents', 'requests.id', '=', 'requirement_documents.request_id')
            ->select(
                'requests.id',
                DB::raw('COUNT(requirement_documents.id) as doc_count')
            )
            ->groupBy('requests.id')
            ->havingRaw('doc_count > 0')
            ->get();

        $avgDocumentsPerRequest = $documentCompletion->avg('doc_count');
        
        // Application completion rate (requests with reports vs total)
        $totalRequests = RequestModel::count();
        $requestsWithReports = Report::distinct('request_id')->count('request_id');
        $completionRate = $totalRequests > 0 ? ($requestsWithReports / $totalRequests) * 100 : 0;

        // Approval rate
        $approvedCount = Report::where('evaluation', 'approved')->count();
        $approvalRate = $requestsWithReports > 0 ? ($approvedCount / $requestsWithReports) * 100 : 0;
        
        return [
            'monthly_submissions' => $monthlyData,
            'daily_submissions' => $dailySubmissions,
            'hourly_pattern' => $hourlyPattern,
            'day_of_week_pattern' => $dayOfWeekPattern,
            'status_breakdown' => $statusBreakdown,
            'processing_time_by_status' => $processingTimeByStatus,
            'processing_time_trend' => $processingTimeTrend,
            'project_types' => $projectTypes,
            'project_natures' => $projectNatures,
            'barangay_distribution' => $barangayDistribution,
            'province_distribution' => $provinceDistribution,
            'top_users' => $topUsers,
            'user_activity_metrics' => $userActivityMetrics,
            'weekly_activity' => $weeklyActivity,
            'certificate_stats' => $certificateStats,
            'avg_documents_per_request' => round($avgDocumentsPerRequest ?? 0, 1),
            'completion_rate' => round($completionRate, 1),
            'approval_rate' => round($approvalRate, 1),
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
