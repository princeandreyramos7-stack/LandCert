<?php

namespace App\Console\Commands;

use App\Models\Request;
use Illuminate\Console\Command;

class VerifyApprovedApplications extends Command
{
    protected $signature = 'app:verify-approved';
    protected $description = 'Verify approved/reviewed applications have proper decision numbers and project types';

    public function handle()
    {
        $requests = Request::with('project')
            ->whereIn('status', ['approved', 'reviewed'])
            ->get();
        
        $this->info("Found {$requests->count()} approved/reviewed applications\n");
        
        foreach ($requests as $request) {
            $projectType = $request->project->project_type ?? 'NONE';
            $decisionNo = $request->decision_number ?? 'NONE';
            
            $this->line("App #{$request->application_number}:");
            $this->line("  Status: {$request->status}");
            $this->line("  Project Type: {$projectType}");
            $this->line("  Decision No: {$decisionNo}");
            $this->line("");
        }
        
        return 0;
    }
}
