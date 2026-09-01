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
     * Kept as constants so the credentials this seeder prints can never drift
     * from the ones it actually creates.
     */
    private const SUPER_ADMIN_EMAIL = 'crisanta@cpdo.com';
    private const SUPER_ADMIN_PASSWORD = 'crisanta123';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role if it doesn't exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin']);
        
        // The Zoning Administrator was previously seeded as superadmin@cpdo.com.
        // Carry that account over to the real identity rather than leaving a
        // duplicate super admin behind.
        $legacySuperAdmin = User::where('email', 'superadmin@cpdo.com')->first();
        if ($legacySuperAdmin && !User::where('email', self::SUPER_ADMIN_EMAIL)->exists()) {
            $legacySuperAdmin->update(['email' => self::SUPER_ADMIN_EMAIL]);
        }

        // Create or update super admin user (Zoning Administrator)
        $superAdmin = User::updateOrCreate(
            ['email' => self::SUPER_ADMIN_EMAIL],
            [
                'name' => 'Crisanta D. Concepcion',
                'password' => Hash::make(self::SUPER_ADMIN_PASSWORD),
                'user_type' => 'super_admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, City of Ilagan',
                'email_verified_at' => now(),
                // Signature printed on certificates and clearances.
                'signature_path' => 'images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png',
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
                // Signature printed on certificates and clearances he evaluated.
                'signature_path' => 'images/E-signitures/JeffreyPauig.png',
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
                'password' => Hash::make('maryjane123'),
                'user_type' => 'admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, City of Ilagan',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('==============================================');
        $this->command->info('Super Admin user created/updated successfully!');
        $this->command->info('Name: ' . $superAdmin->name);
        $this->command->info('Email: ' . self::SUPER_ADMIN_EMAIL);
        $this->command->info('Password: ' . self::SUPER_ADMIN_PASSWORD);
        $this->command->info('User Type: ' . $superAdmin->user_type);
        $this->command->info('==============================================');
        $this->command->info('Zoning Officers created/updated successfully!');
        $this->command->info('');
        $this->command->info('1. Email: admin@cpdo.com | Password: admin123');
        $this->command->info('2. Email: jeff@cpdo.com | Password: jeff123 (Jeffrey C. Pauig)');
        $this->command->info('3. Email: kay@cpdo.com | Password: kay123 (Kay B. Aggarao)');
        $this->command->info('4. Email: april@cpdo.com | Password: april123 (April V. Cuntapay)');
        $this->command->info('5. Email: maryjane@cpdo.com | Password: maryjane123 (Mary Jane P. Bulauan)');
        $this->command->info('==============================================');
        $this->command->warn('⚠️  Please change the passwords after first login!');
    }
}
