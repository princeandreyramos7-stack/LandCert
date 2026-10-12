<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ResetAdminPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:reset-password
                            {email=admin@cpdo.com : The account to reset}
                            {--password= : The new password (a random one is generated when left out)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset a staff account password (random unless --password is given)';

    /**
     * Execute the console command.
     *
     * It used to reset to a fixed default written in this file - a password
     * anyone reading the repository knew. Now the new password is either the
     * one given with --password or a random one, shown once here.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $this->info("Resetting the password for {$email}...");

        $admin = User::where('email', $email)->first();

        if (!$admin) {
            $this->error('Account not found!');
            $this->info('Running admin seeder...');
            $this->call('db:seed', ['--class' => 'Database\\Seeders\\AdminUserSeeder']);
            return 0;
        }

        $password = $this->option('password') ?: Str::password(16);
        $admin->password = Hash::make($password);
        $admin->save();

        $this->info('✓ Password reset successfully!');
        $this->newLine();
        $this->info('Login Credentials:');
        $this->info('Email: ' . $email);
        $this->info('Password: ' . ($this->option('password') ? '(the one you gave)' : $password));
        $this->newLine();
        $this->warn('⚠️  Please change the password after login!');

        return 0;
    }
}
