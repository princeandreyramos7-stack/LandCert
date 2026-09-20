<?php

/**
 * Add PSGC Address Codes to Test User
 * This allows address pre-fill to work
 * Run: php add_address_to_user.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Adding PSGC Address to amelita@gmail.com ===\n\n";

$user = \App\Models\User::where('email', 'amelita@gmail.com')->first();

if (!$user) {
    echo "✗ User not found!\n";
    exit(1);
}

echo "Current address:\n";
echo "- Text: " . ($user->address ?: 'NULL') . "\n";
echo "- Barangay Code: " . ($user->address_barangay_code ?: 'NULL') . "\n\n";

// Add PSGC codes for: Osmena, City of Ilagan, Isabela, Region II
$user->address_region_code = '02';  // Region II (Cagayan Valley)
$user->address_province_code = '0231';  // Isabela
$user->address_city_code = '023108';  // City of Ilagan
$user->address_barangay_code = '023108029';  // Osmena
$user->address_street = 'Sample Street';
$user->address = 'Osmena, City of Ilagan, Isabela';
$user->save();

echo "✓ Address codes added!\n\n";
echo "Updated address:\n";
echo "- Region: " . $user->address_region_code . " (Region II)\n";
echo "- Province: " . $user->address_province_code . " (Isabela)\n";
echo "- City: " . $user->address_city_code . " (City of Ilagan)\n";
echo "- Barangay: " . $user->address_barangay_code . " (Osmena)\n";
echo "- Street: " . $user->address_street . "\n";
echo "- Full: " . $user->address . "\n\n";

echo "✓ Done! Now when you create a new application:\n";
echo "  - Address fields will be PRE-FILLED\n";
echo "  - Blue info box will show\n";
echo "  - User can edit if needed\n";
