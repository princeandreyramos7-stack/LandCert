<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and admin user
        $this->call([
            RoleSeeder::class,
            AdminUserSeeder::class,
            // The reference list the address pickers read and the server
            // validates against. Safe to re-run.
            PsgcSeeder::class,
            // DocumentTypeSeeder::class, // REMOVED: document_types table no longer exists (dropped in migration)
            // RequestSeeder::class, // Uncomment to seed 100 test requests
            // DemoSeeder::class, // Uncomment for realistic demo applications across every status/type - or run `php artisan db:seed --class=DemoSeeder` on its own. Local/demo databases only.
        ]);
    }
}
