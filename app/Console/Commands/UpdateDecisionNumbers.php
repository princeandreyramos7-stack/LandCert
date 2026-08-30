<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Request;

class UpdateDecisionNumbers extends Command
{
    protected $signature = 'requests:update-decision-numbers';
    protected $description = 'Update decision numbers to use project type prefix';

    public function handle()
    {
        // Update all approved applications that don't have a decision number yet
        $requests = Request::with('project')
            ->whereIn('status', ['approved', 'reviewed'])
            ->where(function($query) {
                $query->whereNull('decision_number')
                      ->orWhere('decision_number', '')
                      ->orWhere('decision_number', 'like', 'CPDO-%');
            })
            ->get();

        $this->info("Found {$requests->count()} requests needing decision number update.");

        foreach ($requests as $request) {
            $projectType = $request->project->project_type ?? 'CZC';
            
            // Generate new decision number, dated from when the application was
            // created so MM-YY matches its application number.
            $newDecisionNumber = $request->generateDecisionNumber($projectType, $request->created_at);
            
            $oldNumber = $request->decision_number ?? 'NULL';
            $request->decision_number = $newDecisionNumber;
            $request->save();
            
            $this->info("Updated App #{$request->application_number}: {$oldNumber} -> {$newDecisionNumber} (Type: {$projectType})");
        }

        $this->info('Done!');
        return 0;
    }
}
