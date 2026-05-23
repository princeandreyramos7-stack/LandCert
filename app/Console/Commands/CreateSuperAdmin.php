<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-super-admin 
                            {--name= : The name of the super admin}
                            {--email= : The email of the super admin}
                            {--password= : The password of the super admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new Super Admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating Super Admin User...');
        $this->newLine();

        // Get user input
        $name = $this->option('name') ?: $this->ask('Enter super admin name');
        $email = $this->option('email') ?: $this->ask('Enter super admin email');
        $password = $this->option('password') ?: $this->secret('Enter super admin password');

        // Validate input
        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            $this->error('Validation failed:');
            foreach ($validator->errors()->all() as $error) {
                $this->error('  - ' . $error);
            }
            return 1;
        }

        // Create the super admin user
        try {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'user_type' => 'super_admin',
                'email_verified_at' => now(),
            ]);

            $this->newLine();
            $this->info('✓ Super Admin user created successfully!');
            $this->newLine();
            $this->table(
                ['Field', 'Value'],
                [
                    ['ID', $user->id],
                    ['Name', $user->name],
                    ['Email', $user->email],
                    ['User Type', $user->user_type],
                    ['Created At', $user->created_at],
                ]
            );

            return 0;
        } catch (\Exception $e) {
            $this->error('Failed to create super admin user: ' . $e->getMessage());
            return 1;
        }
    }
}
