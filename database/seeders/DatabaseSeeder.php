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
            // DocumentTypeSeeder::class, // REMOVED: document_types table no longer exists (dropped in migration)
            // RequestSeeder::class, // Uncomment to seed 100 test requests
        ]);
    }
}
