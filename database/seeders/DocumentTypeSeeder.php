<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $documentTypes = [
            [
                'document_name' => 'Authorization Letter',
                'description' => 'Letter authorizing a representative to act on behalf of the applicant',
                'is_required' => true,
                'max_file_size' => 5120,
                'allowed_extensions' => 'pdf,jpg,jpeg,png',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'document_name' => 'Proof of Ownership',
                'description' => 'Land title, deed of sale, or other ownership documents',
                'is_required' => true,
                'max_file_size' => 10240,
                'allowed_extensions' => 'pdf,jpg,jpeg,png',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'document_name' => 'Site Plan',
                'description' => 'Detailed plan of the project site',
                'is_required' => false,
                'max_file_size' => 10240,
                'allowed_extensions' => 'pdf,jpg,jpeg,png,dwg',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'document_name' => 'Tax Declaration',
                'description' => 'Property tax declaration',
                'is_required' => true,
                'max_file_size' => 5120,
                'allowed_extensions' => 'pdf,jpg,jpeg,png',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'document_name' => 'Building Permit',
                'description' => 'Existing building permit (if applicable)',
                'is_required' => false,
                'max_file_size' => 5120,
                'allowed_extensions' => 'pdf,jpg,jpeg,png',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'document_name' => 'Environmental Clearance',
                'description' => 'Environmental compliance certificate',
                'is_required' => false,
                'max_file_size' => 5120,
                'allowed_extensions' => 'pdf,jpg,jpeg,png',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'document_name' => 'Barangay Clearance',
                'description' => 'Clearance from local barangay',
                'is_required' => false,
                'max_file_size' => 5120,
                'allowed_extensions' => 'pdf,jpg,jpeg,png',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'document_name' => 'Location Plan',
                'description' => 'Map showing project location',
                'is_required' => false,
                'max_file_size' => 10240,
                'allowed_extensions' => 'pdf,jpg,jpeg,png',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'document_name' => 'Business Permit',
                'description' => 'Valid business permit (for commercial applications)',
                'is_required' => false,
                'max_file_size' => 5120,
                'allowed_extensions' => 'pdf,jpg,jpeg,png',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'document_name' => 'Valid ID',
                'description' => 'Valid government-issued ID of the applicant',
                'is_required' => true,
                'max_file_size' => 5120,
                'allowed_extensions' => 'pdf,jpg,jpeg,png',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('document_types')->insert($documentTypes);

        $this->command->info('Document types seeded successfully!');
    }
}
