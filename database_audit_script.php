<?php
/**
 * Database Audit Script
 * Analyzes database structure for:
 * - Missing indexes
 * - Normalization issues
 * - Missing foreign keys
 * - Potential improvements
 * - Data integrity issues
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=================================================\n";
echo "      CPDO LC DATABASE AUDIT REPORT\n";
echo "=================================================\n\n";

// Get all tables
$tables = DB::select('SHOW TABLES');
$databaseName = env('DB_DATABASE');
$tableKey = "Tables_in_{$databaseName}";

$allTables = array_map(fn($t) => $t->$tableKey, $tables);

echo "Found " . count($allTables) . " tables\n\n";

// ==================================================
// SECTION 1: TABLE ANALYSIS
// ==================================================
echo "=== SECTION 1: TABLE STRUCTURE ANALYSIS ===\n\n";

$issues = [];
$recommendations = [];

foreach ($allTables as $table) {
    echo "Analyzing table: {$table}\n";
    
    // Get columns
    $columns = DB::select("SHOW COLUMNS FROM {$table}");
    
    // Get indexes
    $indexes = DB::select("SHOW INDEXES FROM {$table}");
    
    // Get foreign keys
    $foreignKeys = DB::select("
        SELECT 
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
    ", [$databaseName, $table]);
    
    // Check for potential issues
    
    // 1. Check for columns without indexes that should have them
    $indexedColumns = array_unique(array_map(fn($i) => $i->Column_name, $indexes));
    
    foreach ($columns as $col) {
        $columnName = $col->Field;
        
        // Foreign key columns should be indexed
        if (str_ends_with($columnName, '_id') && !in_array($columnName, $indexedColumns)) {
            $issues[] = "❌ {$table}.{$columnName} - Foreign key column not indexed";
        }
        
        // Status/enum columns should be indexed for filtering
        if (in_array($columnName, ['status', 'evaluation', 'payment_status']) && !in_array($columnName, $indexedColumns)) {
            $issues[] = "⚠️  {$table}.{$columnName} - Status column not indexed";
        }
        
        // Date columns used in queries should be indexed
        if (in_array($columnName, ['created_at', 'updated_at', 'payment_date', 'issued_at', 'released_at']) && 
            !in_array($columnName, $indexedColumns) && 
            !in_array($table, ['audit_logs', 'notifications'])) { // Skip log tables
            $recommendations[] = "💡 {$table}.{$columnName} - Consider indexing date column";
        }
    }
    
    // 2. Check for TEXT columns that might benefit from fulltext index
    foreach ($columns as $col) {
        if (str_contains($col->Type, 'text') && 
            in_array($col->Field, ['project_description', 'message', 'rejection_reason'])) {
            $recommendations[] = "💡 {$table}.{$col->Field} - Consider FULLTEXT index for search";
        }
    }
}

echo "\n";

// ==================================================
// SECTION 2: NORMALIZATION ANALYSIS
// ==================================================
echo "=== SECTION 2: NORMALIZATION ANALYSIS ===\n\n";

// Check requests table for denormalized data
if (in_array('requests', $allTables)) {
    $requestColumns = array_map(fn($c) => $c->Field, DB::select("SHOW COLUMNS FROM requests"));
    
    // Check if old denormalized columns still exist
    $denormalizedColumns = [
        'applicant_name', 'applicant_address', 'corporation_name', 'corporation_address',
        'project_location_number', 'project_location_street', 'project_location_barangay'
    ];
    
    $stillDenormalized = array_intersect($denormalizedColumns, $requestColumns);
    
    if (count($stillDenormalized) > 0) {
        echo "⚠️  Requests table still contains denormalized columns:\n";
        foreach ($stillDenormalized as $col) {
            echo "   - {$col}\n";
        }
        echo "   These columns should exist only in normalized tables\n";
        $recommendations[] = "📊 Consider removing old denormalized columns from requests table after data migration verification";
    } else {
        echo "✅ Requests table properly normalized\n";
    }
}

echo "\n";

// ==================================================
// SECTION 3: FOREIGN KEY ANALYSIS
// ==================================================
echo "=== SECTION 3: FOREIGN KEY INTEGRITY ===\n\n";

// Check for orphaned records
$orphanChecks = [
    ['table' => 'payments', 'fk' => 'request_id', 'ref_table' => 'requests', 'ref_col' => 'id'],
    ['table' => 'certificates', 'fk' => 'request_id', 'ref_table' => 'requests', 'ref_col' => 'id'],
    ['table' => 'certificates', 'fk' => 'payment_id', 'ref_table' => 'payments', 'ref_col' => 'id'],
    ['table' => 'reports', 'fk' => 'request_id', 'ref_table' => 'requests', 'ref_col' => 'id'],
    ['table' => 'notifications', 'fk' => 'user_id', 'ref_table' => 'users', 'ref_col' => 'id'],
    ['table' => 'normalized_projects', 'fk' => 'request_id', 'ref_table' => 'requests', 'ref_col' => 'id'],
    ['table' => 'properties', 'fk' => 'request_id', 'ref_table' => 'requests', 'ref_col' => 'id'],
    ['table' => 'locations', 'fk' => 'request_id', 'ref_table' => 'requests', 'ref_col' => 'id'],
];

foreach ($orphanChecks as $check) {
    if (in_array($check['table'], $allTables) && in_array($check['ref_table'], $allTables)) {
        $orphans = DB::select("
            SELECT COUNT(*) as count 
            FROM {$check['table']} t 
            LEFT JOIN {$check['ref_table']} r ON t.{$check['fk']} = r.{$check['ref_col']} 
            WHERE t.{$check['fk']} IS NOT NULL AND r.{$check['ref_col']} IS NULL
        ");
        
        if ($orphans[0]->count > 0) {
            $issues[] = "❌ {$check['table']} has {$orphans[0]->count} orphaned records (invalid {$check['fk']})";
        }
    }
}

echo "✅ Foreign key integrity checks complete\n\n";

// ==================================================
// SECTION 4: DATA TYPE ANALYSIS
// ==================================================
echo "=== SECTION 4: DATA TYPE RECOMMENDATIONS ===\n\n";

// Check for potential data type improvements
foreach ($allTables as $table) {
    $columns = DB::select("SHOW COLUMNS FROM {$table}");
    
    foreach ($columns as $col) {
        // Check for VARCHAR that might be too large
        if (preg_match('/varchar\((\d+)\)/', $col->Type, $matches)) {
            $length = (int)$matches[1];
            if ($length > 500 && !str_contains($col->Field, 'address') && !str_contains($col->Field, 'description')) {
                $recommendations[] = "💡 {$table}.{$col->Field} - VARCHAR({$length}) might be excessive, consider TEXT or smaller VARCHAR";
            }
        }
        
        // Check for INT columns storing phone numbers or IDs
        if (str_contains($col->Type, 'int') && 
            (str_contains($col->Field, 'phone') || str_contains($col->Field, 'contact') || str_contains($col->Field, 'mobile'))) {
            $recommendations[] = "⚠️  {$table}.{$col->Field} - Phone number stored as INT, should be VARCHAR";
        }
    }
}

echo "✅ Data type analysis complete\n\n";

// ==================================================
// SECTION 5: MISSING FEATURES ANALYSIS
// ==================================================
echo "=== SECTION 5: POTENTIAL FEATURE ADDITIONS ===\n\n";

$featureSuggestions = [];

// Check if audit_logs table exists
if (in_array('audit_logs', $allTables)) {
    echo "✅ Audit logging enabled\n";
} else {
    $featureSuggestions[] = "📝 Add audit_logs table for tracking system changes";
}

// Check if notifications table has read_at timestamp
if (in_array('notifications', $allTables)) {
    $notifColumns = array_map(fn($c) => $c->Field, DB::select("SHOW COLUMNS FROM notifications"));
    if (!in_array('read_at', $notifColumns)) {
        $featureSuggestions[] = "📝 Add read_at timestamp to notifications table";
    }
}

// Check for soft deletes
foreach (['requests', 'payments', 'certificates'] as $table) {
    if (in_array($table, $allTables)) {
        $columns = array_map(fn($c) => $c->Field, DB::select("SHOW COLUMNS FROM {$table}"));
        if (!in_array('deleted_at', $columns)) {
            $recommendations[] = "💡 Consider adding soft deletes (deleted_at) to {$table} table";
        }
    }
}

// Check for versioning/history
if (!in_array('request_history', $allTables) && !in_array('status_history', $allTables)) {
    $featureSuggestions[] = "📝 Consider adding status_history table to track all status changes";
} else {
    echo "✅ Status history tracking enabled\n";
}

// Check for backup/archive strategy
$featureSuggestions[] = "💾 Consider implementing archived_requests table for old/completed applications";
$featureSuggestions[] = "🔐 Consider adding encryption for sensitive fields (contact numbers, addresses)";
$featureSuggestions[] = "📊 Consider adding analytics/reporting tables for dashboard performance";

echo "\n";

// ==================================================
// SECTION 6: PERFORMANCE OPTIMIZATIONS
// ==================================================
echo "=== SECTION 6: PERFORMANCE OPTIMIZATION SUGGESTIONS ===\n\n";

// Check for composite indexes opportunities
$compositeIndexSuggestions = [
    ['table' => 'requests', 'columns' => ['user_id', 'status'], 'reason' => 'User\'s applications filtered by status'],
    ['table' => 'requests', 'columns' => ['status', 'created_at'], 'reason' => 'Status filtering with date sorting'],
    ['table' => 'payments', 'columns' => ['request_id', 'payment_status'], 'reason' => 'Payment lookup by status'],
    ['table' => 'certificates', 'columns' => ['status', 'issued_at'], 'reason' => 'Certificate filtering with date'],
    ['table' => 'notifications', 'columns' => ['user_id', 'read'], 'reason' => 'Unread notifications per user'],
];

foreach ($compositeIndexSuggestions as $suggestion) {
    if (in_array($suggestion['table'], $allTables)) {
        $indexName = $suggestion['table'] . '_' . implode('_', $suggestion['columns']) . '_composite';
        $indexes = DB::select("SHOW INDEXES FROM {$suggestion['table']} WHERE Key_name = ?", [$indexName]);
        
        if (empty($indexes)) {
            $recommendations[] = "🚀 Add composite index on {$suggestion['table']} (" . implode(', ', $suggestion['columns']) . ") - {$suggestion['reason']}";
        }
    }
}

echo "\n";

// ==================================================
// SECTION 7: TABLE SIZE ANALYSIS
// ==================================================
echo "=== SECTION 7: TABLE SIZE ANALYSIS ===\n\n";

$tableSizes = DB::select("
    SELECT 
        table_name AS 'table',
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb',
        table_rows AS 'rows'
    FROM information_schema.TABLES
    WHERE table_schema = ?
    ORDER BY (data_length + index_length) DESC
", [$databaseName]);

echo "Largest tables:\n";
$count = 0;
foreach ($tableSizes as $size) {
    if ($count++ < 10) {
        echo sprintf("   %-30s %10s MB  %10s rows\n", $size->table, $size->size_mb, number_format($size->rows));
    }
}

// Check for tables that might need partitioning
foreach ($tableSizes as $size) {
    if ($size->rows > 100000) {
        $recommendations[] = "💡 {$size->table} has " . number_format($size->rows) . " rows - consider partitioning by date";
    }
}

echo "\n";

// ==================================================
// SUMMARY
// ==================================================
echo "=================================================\n";
echo "                 SUMMARY\n";
echo "=================================================\n\n";

echo "CRITICAL ISSUES (" . count($issues) . "):\n";
if (empty($issues)) {
    echo "   ✅ No critical issues found!\n";
} else {
    foreach ($issues as $issue) {
        echo "   {$issue}\n";
    }
}

echo "\n";

echo "RECOMMENDATIONS (" . count($recommendations) . "):\n";
if (empty($recommendations)) {
    echo "   ✅ Database is well optimized!\n";
} else {
    foreach ($recommendations as $rec) {
        echo "   {$rec}\n";
    }
}

echo "\n";

echo "FEATURE SUGGESTIONS (" . count($featureSuggestions) . "):\n";
foreach ($featureSuggestions as $feature) {
    echo "   {$feature}\n";
}

echo "\n";
echo "=================================================\n";
echo "              AUDIT COMPLETE\n";
echo "=================================================\n";
