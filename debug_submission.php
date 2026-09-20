<?php

/**
 * Debug Application Submission
 * Run: php debug_submission.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== APPLICATION SUBMISSION DEBUG ===\n\n";

// 1. Check test user
echo "1. Checking Test User (amelita@gmail.com):\n";
$user = \App\Models\User::where('email', 'amelita@gmail.com')->first();

if (!$user) {
    echo "   ✗ User not found!\n";
    exit(1);
}

echo "   ✓ User found\n";
echo "   - ID: {$user->id}\n";
echo "   - Name: {$user->name}\n";
echo "   - Email: {$user->email}\n";
echo "   - User Type: {$user->user_type}\n";
echo "   - Has Address: " . ($user->address ? 'YES' : 'NO') . "\n";
echo "   - Address: " . ($user->address ?: 'NULL') . "\n";
echo "   - Barangay Code: " . ($user->address_barangay_code ?: 'NULL') . "\n\n";

// 2. Check recent applications
echo "2. Recent Applications (Last 5):\n";
$recentApps = \App\Models\Request::where('user_id', $user->id)
    ->orderBy('created_at', 'desc')
    ->take(5)
    ->get(['id', 'application_number', 'status', 'created_at']);

if ($recentApps->isEmpty()) {
    echo "   - No applications found\n\n";
} else {
    foreach ($recentApps as $app) {
        echo "   - #{$app->id}: {$app->application_number} [{$app->status}] at {$app->created_at}\n";
    }
    echo "\n";
}

// 3. Check duplicate detection
echo "3. Duplicate Detection (Last 5 minutes):\n";
$recentDuplicates = \App\Models\Request::where('user_id', $user->id)
    ->where('created_at', '>=', now()->subMinutes(5))
    ->count();
echo "   - Applications in last 5 min: {$recentDuplicates}\n";
echo "   - Would block submission: " . ($recentDuplicates > 0 ? 'YES' : 'NO') . "\n\n";

// 4. Check database tables
echo "4. Database Tables Check:\n";
$tables = [
    'users' => \App\Models\User::count(),
    'requests' => \App\Models\Request::count(),
    'applicants' => \App\Models\Applicant::count(),
    'normalized_projects' => \App\Models\NormalizedProject::count(),
    'locations' => \App\Models\Location::count(),
    'properties' => \App\Models\Property::count(),
    'reports' => \App\Models\Report::count(),
];

foreach ($tables as $table => $count) {
    echo "   - {$table}: {$count} records\n";
}
echo "\n";

// 5. Check latest application details
echo "5. Latest Application Details:\n";
$latest = \App\Models\Request::where('user_id', $user->id)
    ->with(['applicant', 'project', 'location', 'property'])
    ->orderBy('created_at', 'desc')
    ->first();

if (!$latest) {
    echo "   - No applications to show\n\n";
} else {
    echo "   Application #{$latest->id}:\n";
    echo "   - Number: {$latest->application_number}\n";
    echo "   - Status: {$latest->status}\n";
    echo "   - Created: {$latest->created_at}\n";
    
    if ($latest->applicant) {
        echo "   - Applicant: {$latest->applicant->applicant_name}\n";
        echo "   - Applicant Address: {$latest->applicant->applicant_address}\n";
    }
    
    if ($latest->project) {
        echo "   - Project Type: {$latest->project->project_type}\n";
        echo "   - Project Nature: {$latest->project->project_nature}\n";
    }
    
    if ($latest->location) {
        echo "   - Location: {$latest->location->barangay}, {$latest->location->city_municipality}\n";
    }
    echo "\n";
}

// 6. Test validation rules
echo "6. Testing Validation Requirements:\n";
$testData = [
    'declaration' => 'accepted',
    'applicant_name' => $user->name,
    'applicant_address_region_code' => '02',
    'applicant_address_province_code' => '0231',
    'applicant_address_city_code' => '023108',
    'applicant_address_barangay_code' => '023108001',
    'applicant_address_street' => 'Test Street',
];

$validator = \Illuminate\Support\Facades\Validator::make($testData, [
    'declaration' => ['accepted'],
    'applicant_name' => 'required|string|max:255',
]);

if ($validator->fails()) {
    echo "   ✗ Basic validation would fail:\n";
    foreach ($validator->errors()->all() as $error) {
        echo "     - {$error}\n";
    }
} else {
    echo "   ✓ Basic validation would pass\n";
}
echo "\n";

// 7. Check application number generation
echo "7. Application Number Generation:\n";
try {
    $testApplicant = new \App\Models\Applicant(['id' => 999]);
    $testDate = now();
    $testNumber = \App\Models\Request::generateApplicationNumber(999, $testDate);
    echo "   ✓ Can generate application numbers\n";
    echo "   - Example: {$testNumber}\n";
} catch (\Exception $e) {
    echo "   ✗ Error generating number: {$e->getMessage()}\n";
}
echo "\n";

// 8. Check environment settings
echo "8. Environment Settings:\n";
echo "   - APP_DEBUG: " . (config('app.debug') ? 'true' : 'false') . "\n";
echo "   - APP_ENV: " . config('app.env') . "\n";
echo "   - DB_CONNECTION: " . config('database.default') . "\n";
echo "   - LOG_CHANNEL: " . config('logging.default') . "\n";
echo "   - LOG_LEVEL: " . config('logging.channels.single.level', 'debug') . "\n\n";

// 9. Test database connection
echo "9. Database Connection Test:\n";
try {
    \Illuminate\Support\Facades\DB::connection()->getPdo();
    echo "   ✓ Database connection OK\n";
    echo "   - Database: " . \Illuminate\Support\Facades\DB::connection()->getDatabaseName() . "\n";
} catch (\Exception $e) {
    echo "   ✗ Database connection failed: {$e->getMessage()}\n";
}
echo "\n";

// 10. Recommendations
echo "10. Recommendations:\n";

if (!$user->address_barangay_code) {
    echo "   ⚠ User has no address on account\n";
    echo "     → Address fields will be empty in form (this is OK, user can fill manually)\n";
}

if ($recentDuplicates > 0) {
    echo "   ⚠ Recent application exists\n";
    echo "     → New submission with same location would be blocked\n";
    echo "     → Try different project location or wait 5 minutes\n";
}

if ($recentApps->isEmpty()) {
    echo "   ℹ No applications found for this user\n";
    echo "     → Submit a test application to verify submission works\n";
}

echo "\n=== DEBUG COMPLETE ===\n";
