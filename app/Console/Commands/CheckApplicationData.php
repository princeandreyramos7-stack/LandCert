<?php

namespace App\Console\Commands;

use App\Models\Request;
use App\Models\Project;
use Illuminate\Console\Command;

class CheckApplicationData extends Command
{
    protected $signature = 'app:check-data {application_number}';
    protected $description = 'Check application data and fix project_type if missing';

    public function handle()
    {
        $appNumber = $this->argument('application_number');
        
        $request = Request::where('application_number', $appNumber)->first();
        
        if (!$request) {
            $this->error("Application {$appNumber} not found!");
            return 1;
        }
        
        $this->info("Application: {$request->application_number}");
        $this->info("Project Type: " . ($request->project_type ?? 'NULL'));
        $this->info("Status: {$request->status}");
        $this->info("Decision Number: " . ($request->decision_number ?? 'NULL'));
        $this->info("Project ID: " . ($request->project_id ?? 'NULL'));
        
        // Check if project exists
        if ($request->project_id) {
            $project = Project::find($request->project_id);
            if ($project) {
                $this->info("Project Found:");
                $this->info("  - Type: {$project->type}");
                $this->info("  - Name: {$project->name}");
                
                // Fix if project_type is missing
                if (empty($request->project_type) && !empty($project->type)) {
                    $request->project_type = $project->type;
                    $request->save();
                    $this->info("✓ Fixed: Updated project_type to '{$project->type}'");
                }
            } else {
                $this->warn("Project ID {$request->project_id} not found in projects table!");
            }
        } else {
            $this->warn("No project_id linked to this request!");
        }
        
        return 0;
    }
}
