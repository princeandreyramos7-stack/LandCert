<?php

/**
 * Quick diagnostic script to check database columns
 * Run with: php check-database.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "\n";
echo "=======================================================================\n";
echo "  CPDO Database Diagnostic Tool\n";
echo "=======================================================================\n";
echo "\n";

try {
    // Test database connection
    echo "Testing database connection...\n";
    DB::connection()->getPdo();
    echo "✓ Database connection successful\n\n";

    // Check if requests table exists
    echo "Checking 'requests' table...\n";
    if (!Schema::hasTable('requests')) {
        echo "✗ ERROR: 'requests' table does not exist!\n";
        exit(1);
    }
    echo "✓ 'requests' table exists\n\n";

    // Check critical columns
    echo "Checking critical columns in 'requests' table:\n";
    echo "-----------------------------------------------------------------------\n";
    
    $criticalColumns = [
        'id' => 'Primary key',
        'user_id' => 'User reference',
        'application_number' => 'Application number',
        'permit_type' => 'Permit type',
        'status' => 'Application status',
        'declared_at' => '⚠️  Declaration timestamp (CRITICAL)',
        'declaration_version' => '⚠️  Declaration version (CRITICAL)',
        'created_at' => 'Creation timestamp',
        'updated_at' => 'Update timestamp',
    ];

    $missingColumns = [];
    
    foreach ($criticalColumns as $column => $description) {
        $exists = Schema::hasColumn('requests', $column);
        $status = $exists ? '✓' : '✗';
        $indicator = $exists ? 'EXISTS' : 'MISSING';
        
        printf("  [%s] %-25s %s - %s\n", $status, $column, $indicator, $description);
        
        if (!$exists) {
            $missingColumns[] = $column;
        }
    }

    echo "-----------------------------------------------------------------------\n\n";

    // Summary
    if (empty($missingColumns)) {
        echo "✓ All critical columns present!\n";
        echo "✓ Database structure is correct.\n";
        echo "✓ Application submissions should work normally.\n\n";
        
        // Check if any applications have been submitted
        $recentCount = DB::table('requests')
            ->where('created_at', '>=', now()->subDays(1))
            ->count();
        
        echo "Recent applications (last 24 hours): {$recentCount}\n\n";
        
        // Check if any have declared_at set
        $declaredCount = DB::table('requests')
            ->whereNotNull('declared_at')
            ->count();
        
        echo "Applications with declaration timestamp: {$declaredCount}\n\n";
        
        exit(0);
    } else {
        echo "✗ CRITICAL: Missing columns detected!\n\n";
        echo "Missing columns:\n";
        foreach ($missingColumns as $column) {
            echo "  - {$column}\n";
        }
        echo "\n";
        echo "⚠️  ACTION REQUIRED:\n";
        echo "   Run the fix migration to add missing columns:\n";
        echo "   php artisan migrate --path=database/migrations/2026_09_21_fix_declared_at_column.php\n\n";
        
        echo "   Or add columns manually via MySQL:\n";
        echo "   ALTER TABLE requests ADD COLUMN declared_at TIMESTAMP NULL AFTER created_at;\n";
        echo "   ALTER TABLE requests ADD COLUMN declaration_version VARCHAR(16) NULL AFTER declared_at;\n\n";
        
        exit(1);
    }

} catch (\Exception $e) {
    echo "\n";
    echo "✗ ERROR: " . $e->getMessage() . "\n\n";
    
    if (str_contains($e->getMessage(), 'Connection refused') || str_contains($e->getMessage(), '2002')) {
        echo "⚠️  MySQL server is not running!\n";
        echo "   Start XAMPP Control Panel and click 'Start' for MySQL.\n\n";
    } elseif (str_contains($e->getMessage(), 'Access denied')) {
        echo "⚠️  Database credentials are incorrect!\n";
        echo "   Check your .env file settings:\n";
        echo "   DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD\n\n";
    } elseif (str_contains($e->getMessage(), 'Unknown database')) {
        echo "⚠️  Database does not exist!\n";
        echo "   Create the database or check your DB_DATABASE setting in .env\n\n";
    }
    
    exit(1);
}
