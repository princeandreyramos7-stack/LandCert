<?php

namespace App\Constants;

class ApplicationRequirements
{
    /**
     * Requirements for Special Use Permit (SUP)
     */
    public const SUP_REQUIREMENTS = [
        ['id' => 1, 'name' => 'Barangay Clearance', 'required' => true],
        ['id' => 2, 'name' => 'Tax Declaration', 'required' => true],
        ['id' => 3, 'name' => 'Vicinity Map', 'required' => true],
        ['id' => 4, 'name' => 'Site Development Plan', 'required' => true],
        ['id' => 5, 'name' => 'Environmental Compliance Certificate', 'required' => false],
        ['id' => 6, 'name' => 'Building Permit (if applicable)', 'required' => false],
        ['id' => 7, 'name' => 'Business Permit (if commercial)', 'required' => false],
        ['id' => 8, 'name' => 'Other (specify)', 'required' => false],
    ];

    /**
     * Requirements for Temporary Use Permit (TUP)
     */
    public const TUP_REQUIREMENTS = [
        ['id' => 1, 'name' => 'Barangay Clearance', 'required' => true],
        ['id' => 2, 'name' => 'Valid Government-Issued ID', 'required' => true],
        ['id' => 3, 'name' => 'Location Sketch', 'required' => true],
        ['id' => 4, 'name' => 'Business Permit (if commercial)', 'required' => false],
        ['id' => 5, 'name' => 'Event Permit (if applicable)', 'required' => false],
        ['id' => 6, 'name' => 'Other (specify)', 'required' => false],
    ];

    /**
     * Requirements for Zoning Clearance
     */
    public const ZONING_CLEARANCE_REQUIREMENTS = [
        ['id' => 1, 'name' => 'Barangay Clearance', 'required' => true],
        ['id' => 2, 'name' => 'Tax Declaration', 'required' => true],
        ['id' => 3, 'name' => 'Title or Proof of Ownership', 'required' => true],
        ['id' => 4, 'name' => 'Location Plan', 'required' => true],
        ['id' => 5, 'name' => 'Architectural Plan (if building)', 'required' => false],
        ['id' => 6, 'name' => 'Structural Plan (if building)', 'required' => false],
        ['id' => 7, 'name' => 'Other (specify)', 'required' => false],
    ];

    /**
     * Get requirements based on project type
     */
    public static function getRequirements(string $projectType): array
    {
        return match (strtoupper($projectType)) {
            'SUP' => self::SUP_REQUIREMENTS,
            'TUP' => self::TUP_REQUIREMENTS,
            'ZONING CLEARANCE' => self::ZONING_CLEARANCE_REQUIREMENTS,
            default => [],
        };
    }

    /**
     * Get all requirements as associative array
     */
    public static function getAllRequirements(): array
    {
        return [
            'SUP' => self::SUP_REQUIREMENTS,
            'TUP' => self::TUP_REQUIREMENTS,
            'ZONING CLEARANCE' => self::ZONING_CLEARANCE_REQUIREMENTS,
        ];
    }
}
