<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role if it doesn't exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin']);
        
        // Create or update super admin user
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@cpdo.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('superadmin123'),
                'user_type' => 'super_admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, Ilagan City',
                'email_verified_at' => now(),
            ]
        );

        // Note: the 'super_admin' Spatie role is assigned automatically via
        // User::booted(), which keeps roles in sync with the user_type column.

        // Create or update admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@cpdo.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'user_type' => 'admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, Ilagan City',
                'email_verified_at' => now(),
            ]
        );

        // Note: the 'admin' Spatie role is assigned automatically via User::booted().

        $this->command->info('==============================================');
        $this->command->info('Super Admin user created/updated successfully!');
        $this->command->info('Email: superadmin@cpdo.com');
        $this->command->info('Password: superadmin123');
        $this->command->info('User Type: ' . $superAdmin->user_type);
        $this->command->info('==============================================');
        $this->command->info('Admin user created/updated successfully!');
        $this->command->info('Email: admin@cpdo.com');
        $this->command->info('Password: admin123');
        $this->command->info('User Type: ' . $admin->user_type);
        $this->command->info('==============================================');
        $this->command->warn('⚠️  Please change the passwords after first login!');
    }
}
