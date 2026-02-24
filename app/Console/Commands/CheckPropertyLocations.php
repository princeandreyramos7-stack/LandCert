<?php

namespace App\Console\Commands;

use App\Models\PropertyLocation;
use Illuminate\Console\Command;

class CheckPropertyLocations extends Command
{
    protected $signature = 'check:properties';
    protected $description = 'Check property locations in the database';

    public function handle()
    {
        $properties = PropertyLocation::with('zoningRule')->get();

        $this->info("Total Properties: " . $properties->count());
        $this->newLine();

        $this->table(
            ['ID', 'Address', 'Barangay', 'Zone', 'Lat', 'Lng', 'Lot Area'],
            $properties->map(function ($property) {
                return [
                    $property->id,
                    $property->address,
                    $property->barangay,
                    $property->zoningRule?->zone_name ?? 'No Zone',
                    $property->latitude,
                    $property->longitude,
                    $property->lot_area . ' sqm',
                ];
            })
        );

        return 0;
    }
}
