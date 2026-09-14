<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Loads the Philippine Standard Geographic Code into the psgc_* tables.
 *
 * The list is shipped with the project (database/data/psgc.json.gz, about
 * 300 KB) rather than fetched when this runs: the server this deploys to has
 * no business reaching out to a third-party API during a deploy, and a
 * reference list the whole address form depends on should not be able to go
 * missing because someone else's site is down.
 *
 * Re-running is safe. Each table is refilled from the file, so an updated
 * file brings the tables up to date without leaving the old rows behind.
 */
class PsgcSeeder extends Seeder
{
    /** Rows per INSERT. 42,000 barangays in one statement exceeds max_allowed_packet. */
    private const CHUNK = 1000;

    public function run(): void
    {
        $path = database_path('data/psgc.json.gz');

        if (!is_file($path)) {
            $this->command?->error("PSGC data file missing: {$path}");

            return;
        }

        $data = json_decode(gzdecode(file_get_contents($path)), true);

        if (!$data || !isset($data['barangays'])) {
            $this->command?->error('PSGC data file could not be read.');

            return;
        }

        // Children first, so nothing is left pointing at a parent that has
        // been deleted while this runs.
        Schema::disableForeignKeyConstraints();
        foreach (['psgc_barangays', 'psgc_cities_municipalities', 'psgc_provinces', 'psgc_regions'] as $table) {
            DB::table($table)->delete();
        }

        $this->fill('psgc_regions', $data['regions'], fn ($r) => [
            'code' => $r[0], 'name' => $r[1], 'short_name' => $r[2] ?: null,
        ]);

        $this->fill('psgc_provinces', $data['provinces'], fn ($r) => [
            'code' => $r[0], 'name' => $r[1], 'region_code' => $r[2], 'kind' => $r[3],
        ]);

        $this->fill('psgc_cities_municipalities', $data['cities'], fn ($r) => [
            'code' => $r[0], 'name' => $r[1], 'province_code' => $r[2], 'is_city' => (bool) $r[3],
        ]);

        $this->fill('psgc_barangays', $data['barangays'], fn ($r) => [
            'code' => $r[0], 'name' => $r[1], 'city_code' => $r[2],
        ]);
        Schema::enableForeignKeyConstraints();

        $this->command?->info(sprintf(
            'PSGC loaded: %d regions, %d provinces, %d cities/municipalities, %d barangays.',
            count($data['regions']),
            count($data['provinces']),
            count($data['cities']),
            count($data['barangays'])
        ));
    }

    private function fill(string $table, array $rows, callable $shape): void
    {
        foreach (array_chunk($rows, self::CHUNK) as $chunk) {
            DB::table($table)->insert(array_map($shape, $chunk));
        }
    }
}
