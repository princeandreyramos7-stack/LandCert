<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * The office's own accounts: the Zoning Administrator and the Zoning
 * Officers, with the names, numbers and signatures printed on documents.
 *
 * No password lives in this file. This repository was public with the
 * accounts' passwords written here, and every run of `db:seed` reset them
 * back to those values. Now:
 *
 *  - an account that already exists keeps its password - re-seeding only
 *    refreshes its profile (name, role, contact, signature);
 *  - a new account gets the password from SEED_PASSWORD_<KEY> in .env
 *    (e.g. SEED_PASSWORD_CRISANTA) if one is set, otherwise a random one,
 *    printed once here for handing over. Change it at first sign-in.
 */
class AdminUserSeeder extends Seeder
{
    private const SUPER_ADMIN_EMAIL = 'crisanta@cpdo.com';

    /** key => [email, attributes]. The key names the SEED_PASSWORD_<KEY> variable. */
    private function accounts(): array
    {
        return [
            'CRISANTA' => [self::SUPER_ADMIN_EMAIL, [
                'name' => 'Crisanta D. Concepcion',
                'user_type' => 'super_admin',
                'contact_number' => '09707112132',
                'address' => 'CPDO Office, City of Ilagan',
                // Signature printed on certificates and clearances.
                'signature_path' => 'images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png',
            ]],
            // Zoning Officer - Jeffrey C. Pauig
            'JEFF' => ['jeff@cpdo.com', [
                'name' => 'Jeffrey C. Pauig',
                'user_type' => 'admin',
                'contact_number' => '09707112132',
                'address' => 'CPDO Office, City of Ilagan',
                // Signature printed on certificates and clearances he evaluated.
                'signature_path' => 'images/E-signitures/JeffreyPauig.png',
            ]],
            // Zoning Officer - Kay B. Aggarao
            'KAY' => ['kay@cpdo.com', [
                'name' => 'Kay B. Aggarao',
                'user_type' => 'admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, City of Ilagan',
            ]],
            // Zoning Officer - April V. Cuntapay
            'APRIL' => ['april@cpdo.com', [
                'name' => 'April V. Cuntapay',
                'user_type' => 'admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, City of Ilagan',
            ]],
            'MARYJANE' => ['maryjane@cpdo.com', [
                'name' => 'Mary Jane P. Bulauan',
                'user_type' => 'admin',
                'contact_number' => '09123456789',
                'address' => 'CPDO Office, City of Ilagan',
            ]],
        ];
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role if it doesn't exist
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'super_admin']);

        // The Zoning Administrator was previously seeded as superadmin@cpdo.com.
        // Carry that account over to the real identity rather than leaving a
        // duplicate super admin behind.
        $legacySuperAdmin = User::where('email', 'superadmin@cpdo.com')->first();
        if ($legacySuperAdmin && !User::where('email', self::SUPER_ADMIN_EMAIL)->exists()) {
            $legacySuperAdmin->update(['email' => self::SUPER_ADMIN_EMAIL]);
        }

        // Note: the Spatie roles are assigned automatically via User::booted(),
        // which keeps roles in sync with the user_type column.
        $created = [];
        foreach ($this->accounts() as $key => [$email, $attributes]) {
            $user = User::firstOrNew(['email' => $email]);
            $user->fill($attributes);

            if (!$user->exists) {
                $fromEnv = env("SEED_PASSWORD_{$key}");
                $password = is_string($fromEnv) && $fromEnv !== '' ? $fromEnv : Str::password(16);
                $user->password = Hash::make($password);
                $user->email_verified_at = now();
                $created[] = [$attributes['name'], $email, $fromEnv ? "(SEED_PASSWORD_{$key})" : $password];
            }

            $user->save();
        }

        $this->command->info('Office accounts are in place. Existing accounts kept their passwords.');
        if ($created) {
            $this->command->warn('New accounts - hand these over privately and change them at first sign-in:');
            $this->command->table(['Name', 'Email', 'Password'], $created);
        }
    }
}
