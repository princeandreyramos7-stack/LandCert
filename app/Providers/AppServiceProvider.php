<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\Request as RequestModel;
use App\Models\Report;
use App\Observers\RequestObserver;
use App\Observers\ReportObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Set timezone for Carbon
        \Carbon\Carbon::setLocale('en');
        date_default_timezone_set('Asia/Manila');
        
        // Register observers for cache invalidation
        RequestModel::observe(RequestObserver::class);
        Report::observe(ReportObserver::class);
    }
}
