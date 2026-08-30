<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\ApplicationRejected;
use App\Models\Application;
use App\Models\User;

class TestEmail extends Command
{
    protected $signature = 'test:email {email}';
    protected $description = 'Test email functionality';

    public function handle()
    {
        $email = $this->argument('email');
        
        try {
            // Create a dummy application for testing
            $dummyApplication = new Application();
            $dummyApplication->applicant_name = 'Test Applicant';
            
            Mail::to($email)->send(
                new ApplicationRejected(
                    $dummyApplication,
                    'Test Applicant',
                    '12345',
                    'This is a test denial email'
                )
            );
            
            $this->info("Test email sent successfully to: {$email}");
            
        } catch (\Exception $e) {
            $this->error("Failed to send email: " . $e->getMessage());
        }
    }
}