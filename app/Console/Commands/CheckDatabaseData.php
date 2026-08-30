<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Request as RequestModel;
use Illuminate\Support\Facades\DB;

class CheckDatabaseData extends Command
{
    protected $signature = 'db:check-data';
    protected $description = 'Check database connection and data';

    public function handle()
    {
        $this->info('=== Database Connection Check ===');
        $this->newLine();
        
        // Check database connection
        try {
            DB::connection()->getPdo();
            $this->info('✓ Database connection: SUCCESS');
            $this->info('Database: ' . DB::connection()->getDatabaseName());
            $this->info('Host: ' . config('database.connections.mysql.host'));
        } catch (\Exception $e) {
            $this->error('✗ Database connection: FAILED');
            $this->error($e->getMessage());
            return 1;
        }
        
        $this->newLine();
        $this->info('=== Data Statistics ===');
        $this->newLine();
        
        // Count records
        $totalRequests = RequestModel::count();
        $pendingCount = RequestModel::where('status', 'pending')->count();
        $approvedCount = RequestModel::where('status', 'approved')->count();
        $rejectedCount = RequestModel::where('status', 'rejected')->count();
        
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Requests', $totalRequests],
                ['Pending', $pendingCount],
                ['Approved', $approvedCount],
                ['Denied', $rejectedCount],
            ]
        );
        
        $this->newLine();
        $this->info('=== Latest 5 Requests ===');
        $this->newLine();
        
        $latestRequests = RequestModel::orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'applicant_name', 'project_type', 'status', 'created_at']);
        
        $this->table(
            ['ID', 'Applicant', 'Project Type', 'Status', 'Created At'],
            $latestRequests->map(function($request) {
                return [
                    $request->id,
                    $request->applicant_name,
                    $request->project_type,
                    $request->status,
                    $request->created_at->format('Y-m-d H:i:s'),
                ];
            })->toArray()
        );
        
        $this->newLine();
        $this->info('✓ Database is working correctly with ' . $totalRequests . ' requests');
        
        return 0;
    }
}
