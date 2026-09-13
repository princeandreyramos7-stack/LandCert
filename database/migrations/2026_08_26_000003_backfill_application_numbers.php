<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Request as RequestModel;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration backfills application_number for existing requests
     * before we drop the control_number column.
     */
    public function up(): void
    {
        // On a fresh database there is nothing to backfill - and the model
        // below cannot be used yet: its soft-delete scope asks for a
        // deleted_at column that a later migration adds. The query builder
        // has no scope, so it is what decides whether to go on.
        if (DB::table('requests')->whereNull('application_number')->count() === 0) {
            return;
        }

        // Get all requests that don't have an application_number yet
        $requests = RequestModel::whereNull('application_number')
            ->with('applicant')
            ->orderBy('id')
            ->get();

        foreach ($requests as $request) {
            if ($request->applicant_id) {
                try {
                    $applicationNumber = RequestModel::generateApplicationNumber($request->applicant_id);
                    $request->update(['application_number' => $applicationNumber]);
                    
                    echo "Generated application number {$applicationNumber} for request #{$request->id}\n";
                } catch (\Exception $e) {
                    echo "Error generating application number for request #{$request->id}: {$e->getMessage()}\n";
                }
            } else {
                echo "Skipping request #{$request->id} - no applicant_id\n";
            }
        }
        
        echo "Backfill complete!\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Set all application_numbers back to null
        DB::table('requests')->update(['application_number' => null]);
    }
};
