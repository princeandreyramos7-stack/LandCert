<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Notification System...\n\n";

// Find an applicant user
$user = App\Models\User::where('user_type', 'applicant')->first();

if (!$user) {
    echo "Error: No applicant user found\n";
    exit(1);
}

echo "Found user: {$user->id} - {$user->name} ({$user->email})\n";

// Create a test notification
try {
    $notification = App\Models\Notification::createForUser(
        $user->id,
        'test',
        'Test Notification',
        'This is a test notification to verify the system is working',
        '/dashboard'
    );
    
    echo "✓ Notification created successfully!\n";
    echo "  ID: {$notification->id}\n";
    echo "  Title: {$notification->title}\n";
    echo "  Message: {$notification->message}\n";
    
    // Count total notifications
    $count = App\Models\Notification::count();
    echo "\nTotal notifications in database: {$count}\n";
    
    // Find a request from this user
    echo "\n--- Testing with actual Request ---\n";
    $request = App\Models\Request::where('user_id', $user->id)->first();
    
    if ($request) {
        echo "Found request: {$request->id} - {$request->applicant_name}\n";
        
        // Test the NotificationService
        App\Services\NotificationService::applicationReviewed($request, 'approved', auth()->user() ?? $user);
        
        echo "✓ Application reviewed notification created!\n";
    } else {
        echo "No request found for this user\n";
    }
    
} catch (\Exception $e) {
    echo "✗ Error creating notification: {$e->getMessage()}\n";
    echo "Stack trace:\n{$e->getTraceAsString()}\n";
}
