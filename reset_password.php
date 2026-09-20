<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\User::where('email', 'prince1@gmail.com')->first();
if ($user) {
    $user->password = bcrypt('password');
    $user->save();
    echo "✓ Password reset for: {$user->email}\n";
    echo "  New password: password\n";
} else {
    echo "✗ User not found\n";
}
