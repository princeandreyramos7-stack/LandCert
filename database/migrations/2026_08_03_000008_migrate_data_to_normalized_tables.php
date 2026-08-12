<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate data from requests to applicants
        // Create one applicant per unique applicant name/address combination
        DB::statement("
            INSERT INTO applicants (applicant_name, applicant_address, applicant_contact, applicant_type, created_at, updated_at)
            SELECT DISTINCT
                applicant_name,
                applicant_address,
                NULL as applicant_contact,
                CASE 
                    WHEN MAX(corporation_name) IS NOT NULL THEN 'corporate'
                    ELSE 'individual'
                END as applicant_type,
                MIN(created_at) as created_at,
                MAX(updated_at) as updated_at
            FROM requests
            GROUP BY applicant_name, applicant_address
        ");

        // Migrate corporations data
        DB::statement("
            INSERT INTO normalized_corporations (applicant_id, corporation_name, corporation_address, created_at, updated_at)
            SELECT DISTINCT
                a.id as applicant_id,
                r.corporation_name,
                r.corporation_address,
                MIN(r.created_at) as created_at,
                MAX(r.updated_at) as updated_at
            FROM requests r
            INNER JOIN applicants a ON a.applicant_name = r.applicant_name AND a.applicant_address = r.applicant_address
            WHERE r.corporation_name IS NOT NULL
            GROUP BY a.id, r.corporation_name, r.corporation_address
            HAVING NOT EXISTS (SELECT 1 FROM normalized_corporations WHERE normalized_corporations.applicant_id = a.id)
        ");

        // Migrate representatives data
        DB::statement("
            INSERT INTO representatives (applicant_id, representative_name, representative_address, representative_email, is_primary, created_at, updated_at)
            SELECT DISTINCT
                a.id as applicant_id,
                r.authorized_representative_name,
                r.authorized_representative_address,
                r.authorized_representative_email,
                TRUE as is_primary,
                MIN(r.created_at) as created_at,
                MAX(r.updated_at) as updated_at
            FROM requests r
            INNER JOIN applicants a ON a.applicant_name = r.applicant_name AND a.applicant_address = r.applicant_address
            WHERE r.authorized_representative_name IS NOT NULL
            GROUP BY a.id, r.authorized_representative_name, r.authorized_representative_address, r.authorized_representative_email
        ");

        // Update requests with applicant_id first
        DB::statement("
            UPDATE requests r
            INNER JOIN applicants a ON a.applicant_name = r.applicant_name AND a.applicant_address = r.applicant_address
            SET r.applicant_id = a.id
            WHERE r.applicant_id IS NULL
        ");

        // Migrate projects data
        DB::statement("
            INSERT INTO normalized_projects (request_id, project_type, project_nature, project_nature_duration, project_nature_years, project_cost, created_at, updated_at)
            SELECT 
                id as request_id,
                project_type,
                project_nature,
                project_nature_duration,
                project_nature_years,
                CASE 
                    WHEN project_cost REGEXP '^[0-9]+(\\.[0-9]+)?$' THEN CAST(project_cost AS DECIMAL(15,2))
                    ELSE NULL
                END as project_cost,
                created_at,
                updated_at
            FROM requests
            WHERE NOT EXISTS (SELECT 1 FROM normalized_projects WHERE normalized_projects.request_id = requests.id)
        ");

        // Migrate properties data
        DB::statement("
            INSERT INTO properties (request_id, lot_area_sqm, bldg_improvement_sqm, right_over_land, existing_land_use, created_at, updated_at)
            SELECT 
                id as request_id,
                lot_area_sqm,
                bldg_improvement_sqm,
                right_over_land,
                existing_land_use,
                created_at,
                updated_at
            FROM requests
            WHERE NOT EXISTS (SELECT 1 FROM properties WHERE properties.request_id = requests.id)
        ");

        // Migrate locations data
        DB::statement("
            INSERT INTO locations (request_id, street_address, barangay, city_municipality, province, created_at, updated_at)
            SELECT 
                id as request_id,
                COALESCE(project_location_street, '') as street_address,
                COALESCE(project_location_barangay, 'Unknown') as barangay,
                COALESCE(project_location_city, project_location_municipality, 'Unknown') as city_municipality,
                COALESCE(project_location_province, 'Unknown') as province,
                created_at,
                updated_at
            FROM requests
            WHERE NOT EXISTS (SELECT 1 FROM locations WHERE locations.request_id = requests.id)
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear normalized tables
        DB::table('locations')->truncate();
        DB::table('properties')->truncate();
        DB::table('normalized_projects')->truncate();
        DB::table('representatives')->truncate();
        DB::table('normalized_corporations')->truncate();
        DB::table('applicants')->truncate();
        
        // Clear applicant_id from requests
        DB::statement("UPDATE requests SET applicant_id = NULL");
    }
};
