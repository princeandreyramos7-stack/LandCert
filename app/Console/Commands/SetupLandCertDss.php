<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SetupLandCertDss extends Command
{
    protected $signature = 'landcert:setup-dss';
    protected $description = 'Setup LandCert Decision Support System';

    public function handle()
    {
        $this->info('========================================');
        $this->info('LandCert DSS Setup');
        $this->info('========================================');
        $this->newLine();

        // Run migrations
        $this->info('Running migrations...');
        Artisan::call('migrate', [], $this->output);
        $this->newLine();

        // Seed zoning rules
        $this->info('Seeding zoning rules...');
        Artisan::call('db:seed', ['--class' => 'ZoningRuleSeeder'], $this->output);
        $this->newLine();

        // Seed risk factors
        $this->info('Seeding risk factors...');
        Artisan::call('db:seed', ['--class' => 'RiskFactorSeeder'], $this->output);
        $this->newLine();

        // Clear cache
        $this->info('Clearing cache...');
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        $this->newLine();

        $this->info('========================================');
        $this->info('Setup Complete!');
        $this->info('========================================');
        $this->newLine();

        $this->comment('Next steps:');
        $this->line('1. Add GOOGLE_MAPS_API_KEY to your .env file');
        $this->line('2. Add Google Maps script to resources/views/app.blade.php');
        $this->line('3. Run: npm run build');
        $this->line('4. Visit /admin/zoning-map to view the GIS map');
        $this->line('5. Create property locations for requests');
        $this->line('6. Run DSS evaluations on requests');
        $this->newLine();

        $this->warn('See LANDCERT_DSS_IMPLEMENTATION.md for detailed documentation');
        $this->newLine();

        return Command::SUCCESS;
    }
}
