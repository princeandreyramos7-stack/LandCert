<?php

namespace App\Console\Commands;

use App\Mail\UserRegistrationWelcome;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class TestRegistrationEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:registration-email {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the complete registration flow with email sending';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info("Testing registration flow for: {$email}");
        
        // Create a test user (similar to registration)
        try {
            $user = User::create([
                'name' => 'Test Registration User',
                'email' => $email,
                'address' => 'Test Address',
                'contact_number' => '09123456789',
                'password' => Hash::make(\Illuminate\Support\Str::password(16)),
            ]);
            
            $this->info("User created successfully with ID: {$user->id}");
            
            // Send welcome email (same as in controller)
            Mail::to($user->email)->send(new UserRegistrationWelcome($user));
            
            $this->info("Welcome email sent successfully!");
            
            // Clean up - delete the test user
            $user->delete();
            $this->info("Test user cleaned up.");
            
            return 0;
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return 1;
        }
    }
}