<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class FixSignaturePaths extends Command
{
    protected $signature = 'signatures:fix';
    protected $description = 'Fix signature URL paths for all users to use correct format';

    public function handle()
    {
        $this->info('Checking and fixing signature paths...');
        $this->info('');

        // Define correct signature mappings
        $signatureMappings = [
            'crisanta@cpdo.com' => '/images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png',
            'jeff@cpdo.com' => '/images/E-signitures/Jeffrey Paguig.png',
            'kay@cpdo.com' => '/images/E-signitures/Kay B. Aggarao.png',
            'april@cpdo.com' => '/images/E-signitures/April U. Cuntapay.png',
            'admin@cpdo.com' => '/images/E-signitures/Mary Jane P. Bulauan.png',
        ];

        $updated = 0;
        $skipped = 0;

        foreach ($signatureMappings as $email => $signaturePath) {
            $user = User::where('email', $email)->first();

            if (!$user) {
                $this->warn("User not found: {$email}");
                $skipped++;
                continue;
            }

            $oldPath = $user->signature_url;
            
            // Check if signature file exists
            $fullPath = public_path($signaturePath);
            if (!file_exists($fullPath)) {
                $this->error("Signature file not found: {$signaturePath}");
                $skipped++;
                continue;
            }

            // Update if different
            if ($oldPath !== $signaturePath) {
                $user->signature_url = $signaturePath;
                $user->save();
                
                $this->info("✓ Updated {$user->name}");
                $this->line("  Old: " . ($oldPath ?: '(none)'));
                $this->line("  New: {$signaturePath}");
                $this->line('');
                $updated++;
            } else {
                $this->comment("• {$user->name} - already correct");
                $skipped++;
            }
        }

        $this->info('');
        $this->info("==============================================");
        $this->info("Updated: {$updated} users");
        $this->info("Skipped: {$skipped} users");
        $this->info("==============================================");
        
        // Show current signature URLs
        $this->info('');
        $this->info('Current signature URLs:');
        $this->info('');
        
        $users = User::whereIn('email', array_keys($signatureMappings))->get();
        foreach ($users as $user) {
            $this->line("{$user->name} ({$user->email}):");
            $this->line("  → " . ($user->signature_url ?: '(no signature)'));
        }

        return 0;
    }
}
