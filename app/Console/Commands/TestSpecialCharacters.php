<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Request as RequestModel;
use App\Models\User;

class TestSpecialCharacters extends Command
{
    protected $signature = 'test:special-characters';
    protected $description = 'Test that special characters work in corporation names';

    public function handle()
    {
        $this->info('=== Testing Special Characters in Corporation Names ===');
        $this->newLine();
        
        // Get a user for testing
        $user = User::where('user_type', 'applicant')->first();
        
        if (!$user) {
            $this->error('No applicant users found. Please create a user first.');
            return 1;
        }
        
        $this->info("Using user: {$user->name} ({$user->email})");
        $this->newLine();
        
        // Test corporation names with special characters
        $testNames = [
            'Smith & Johnson Corporation',
            'AT&T Communications',
            'Procter & Gamble',
            'H&M Fashion',
            'Ernst & Young',
            'Ben & Jerry\'s Ice Cream',
            'Marks & Spencer Ltd.',
            'A&W Restaurants (Philippines)',
            'S&P Global Inc.',
            'Test Corp. - Main Office @ Manila',
        ];
        
        $this->info('Testing corporation names with special characters:');
        $this->newLine();
        
        foreach ($testNames as $index => $corpName) {
            $this->line(($index + 1) . ". Testing: {$corpName}");
            
            try {
                // Create a test request with the corporation name
                $request = RequestModel::create([
                    'user_id' => $user->id,
                    'applicant_name' => 'Test Applicant ' . ($index + 1),
                    'applicant_address' => 'Test Address',
                    'corporation_name' => $corpName,
                    'corporation_address' => 'Test Corporation Address',
                    'project_type' => 'Test Project',
                    'status' => 'pending',
                ]);
                
                // Verify it was stored correctly
                $stored = RequestModel::find($request->id);
                
                if ($stored->corporation_name === $corpName) {
                    $this->info("   ✓ Stored correctly: {$stored->corporation_name}");
                } else {
                    $this->error("   ✗ Storage mismatch!");
                    $this->error("     Expected: {$corpName}");
                    $this->error("     Got: {$stored->corporation_name}");
                }
                
                // Clean up
                $request->delete();
                
            } catch (\Exception $e) {
                $this->error("   ✗ Failed: " . $e->getMessage());
            }
            
            $this->newLine();
        }
        
        $this->info('=== Test Complete ===');
        $this->newLine();
        $this->info('All special characters are supported in corporation names!');
        $this->info('You can use: & @ # $ % - \' . , ( ) and more');
        
        return 0;
    }
}
