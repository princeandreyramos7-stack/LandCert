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
                'name' => 'Zoning Administrator',
                'password' => Hash::make('superadmin123'),
                'user_type' => 'super_admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, City of Ilagan',
                'email_verified_at' => now(),
            ]
        );

        // Note: the 'super_admin' Spatie role is assigned automatically via
        // User::booted(), which keeps roles in sync with the user_type column.

        // Create or update admin user (default)
        $admin = User::updateOrCreate(
            ['email' => 'admin@cpdo.com'],
            [
                'name' => 'Zoning Officer',
                'password' => Hash::make('admin123'),
                'user_type' => 'admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, City of Ilagan',
                'email_verified_at' => now(),
            ]
        );

        // Create Zoning Officer - Jeffrey C. Pauig
        $jeff = User::updateOrCreate(
            ['email' => 'jeff@cpdo.com'],
            [
                'name' => 'Jeffrey C. Pauig',
                'password' => Hash::make('jeff123'),
                'user_type' => 'admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, City of Ilagan',
                'email_verified_at' => now(),
            ]
        );

        // Create Zoning Officer - Kay B. Aggarao
        $kay = User::updateOrCreate(
            ['email' => 'kay@cpdo.com'],
            [
                'name' => 'Kay B. Aggarao',
                'password' => Hash::make('kay123'),
                'user_type' => 'admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, City of Ilagan',
                'email_verified_at' => now(),
            ]
        );

        // Create Zoning Officer - April V. Cuntapay
        $april = User::updateOrCreate(
            ['email' => 'april@cpdo.com'],
            [
                'name' => 'April V. Cuntapay',
                'password' => Hash::make('april123'),
                'user_type' => 'admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, City of Ilagan',
                'email_verified_at' => now(),
            ]
        );

        $maryjane = User::updateOrCreate(
            ['email' => 'maryjane@cpdo.com'],
            [
                'name' => 'Mary Jane P. Bulauan',
                'password' => Hash::make('admin123'),
                'user_type' => 'admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, City of Ilagan',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('==============================================');
        $this->command->info('Super Admin user created/updated successfully!');
        $this->command->info('Email: zoningadministrator@cpdo.com');
        $this->command->info('Password: zoningadmin123');
        $this->command->info('User Type: ' . $superAdmin->user_type);
        $this->command->info('==============================================');
        $this->command->info('Zoning Officers created/updated successfully!');
        $this->command->info('');
        $this->command->info('1. Email: admin@cpdo.com | Password: admin123');
        $this->command->info('2. Email: jeff@cpdo.com | Password: jeff123 (Jeffrey C. Pauig)');
        $this->command->info('3. Email: kay@cpdo.com | Password: kay123 (Kay B. Aggarao)');
        $this->command->info('4. Email: april@cpdo.com | Password: april123 (April V. Cuntapay)');
        $this->command->info('5. Email: maryjane@cpdo.com | Password: admin123 (Mary Jane P. Bulauan)');
        $this->command->info('==============================================');
        $this->command->warn('⚠️  Please change the passwords after first login!');
    }
}
