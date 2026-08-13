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

        // Monthly revenue (last 6 months)
        $monthlyRevenue = \App\Models\Payment::select(
            DB::raw('DATE_FORMAT(verified_at, "%Y-%m") as month'),
            DB::raw('SUM(amount) as total')
        )
        ->where('payment_status', 'verified')
        ->whereNotNull('verified_at')
        ->where('verified_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // Payment stats (real-time)
        $paymentStats = [
            'total_revenue'    => \App\Models\Payment::where('payment_status', 'verified')->sum('amount'),
            'pending_payments' => \App\Models\Payment::where('payment_status', 'pending')->count(),
            'verified_payments'=> \App\Models\Payment::where('payment_status', 'verified')->count(),
            'rejected_payments'=> \App\Models\Payment::where('payment_status', 'rejected')->count(),
            'this_month_revenue'=> \App\Models\Payment::where('payment_status', 'verified')
                ->whereMonth('verified_at', now()->month)
                ->whereYear('verified_at', now()->year)
                ->sum('amount'),
        ];

        // Payment method breakdown
        $paymentMethods = \App\Models\Payment::where('payment_status', 'verified')
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->groupBy('payment_method')
            ->get();

        // Certificate stats (real-time)
        $certificateStats = [
            'total_issued'       => \App\Models\Certificate::count(),
            'issued_this_month'  => \App\Models\Certificate::whereMonth('issued_at', now()->month)
                ->whereYear('issued_at', now()->year)->count(),
            'preparing'          => \App\Models\Certificate::where('status', 'preparing')->count(),
            'ready_for_pickup'   => \App\Models\Certificate::where('status', 'ready_for_pickup')->count(),
            'collected'          => \App\Models\Certificate::where('status', 'released')->count(),
        ];
        
        return [
            'monthly_submissions' => $monthlyData,
            'monthly_revenue'     => $monthlyRevenue,
            'status_breakdown'    => $statusBreakdown,
            'avg_processing_time' => round($avgProcessingTime ?? 0, 1),
            'project_types'       => $projectTypes,
            'top_users'           => $topUsers,
            'weekly_activity'     => $weeklyActivity,
            'payment_stats'       => $paymentStats,
            'payment_methods'     => $paymentMethods,
            'certificate_stats'   => $certificateStats,
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
