<?php

namespace App\Console\Commands;

use App\Models\PropertyLocation;
use App\Models\ZoningRule;
use Illuminate\Console\Command;

class UpdatePropertyZones extends Command
{
    protected $signature = 'update:property-zones';
    protected $description = 'Update property locations with correct zoning rules';

    public function handle()
    {
        $residential = ZoningRule::where('zone_code', 'R1')->first();
        $commercial = ZoningRule::where('zone_code', 'C1')->first();
        $industrial = ZoningRule::where('zone_code', 'I1')->first();
        $agricultural = ZoningRule::where('zone_code', 'A1')->first();
        $mixedUse = ZoningRule::where('zone_code', 'MX1')->first();

        // Update properties by ID
        $updates = [
            'residential' => [[1, 2, 3, 14, 15], $residential],
            'commercial' => [[4, 5], $commercial],
            'industrial' => [[6, 7], $industrial],
            'agricultural' => [[8, 9], $agricultural],
            'mixed' => [[10, 11, 12, 13], $mixedUse],
        ];

        $count = 0;
        foreach ($updates as $type => [$ids, $zone]) {
            if ($zone) {
                PropertyLocation::whereIn('id', $ids)->update(['zoning_rule_id' => $zone->id]);
                $count += count($ids);
                $this->info("Updated " . count($ids) . " properties to " . $zone->zone_name);
            }
        }

        $this->info("\nTotal updated: $count properties");
        return 0;
    }
}
