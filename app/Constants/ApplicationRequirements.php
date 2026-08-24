<?php

namespace App\Constants;

class ApplicationRequirements
{
    /**
     * Common base requirements for Locational Clearance / Certificate of Zoning Compliance
     * Based on ANNEX B of HLURB memorandum Circular No. 01 series of 1998
     */
    public const COMMON_REQUIREMENTS = [
        ['id' => 1, 'name' => 'Accomplished and notarized APPLICATION FORM', 'required' => true],
        ['id' => 2, 'name' => 'Proof of Right Over Land (Tax Declaration/Certificate of Title)', 'required' => true],
        ['id' => 3, 'name' => 'VICINITY MAP showing existing land uses within prescribed radius', 'required' => true],
        ['id' => 4, 'name' => 'SITE DEVELOPMENT PLAN showing project site, lot area boundaries & dimension', 'required' => true],
        ['id' => 5, 'name' => 'ESTIMATED PROJECT COST / BILL OF MATERIALS', 'required' => true],
        ['id' => 6, 'name' => 'Barangay Clearance', 'required' => true],
    ];

    /**
     * Additional requirements for projects in Tenanted Rice/Corn lands
     */
    public const TENANTED_LAND_REQUIREMENTS = [
        ['id' => 7, 'name' => 'Endorsement/recommendation from Department of Agrarian Reform (for conversion)', 'required' => false],
    ];

    /**
     * Manufacturing project specific requirements
     */
    public const MANUFACTURING_REQUIREMENTS = [
        ['id' => 8, 'name' => 'DESCRIPTION OF INDUSTRY - Type and volume of raw materials used', 'required' => false],
        ['id' => 9, 'name' => 'Products manufactured or stored', 'required' => false],
        ['id' => 10, 'name' => 'Expected production output/capacity per day/week/month', 'required' => false],
        ['id' => 11, 'name' => 'Industrial waste & plans for pollution control', 'required' => false],
        ['id' => 12, 'name' => 'Description and flow of manufacturing processes', 'required' => false],
    ];

    /**
     * Other supplementary requirements
     */
    public const SUPPLEMENTARY_REQUIREMENTS = [
        ['id' => 13, 'name' => 'SWORN SPECIAL POWER OF ATTORNEY (if filed by authorized representative)', 'required' => false],
        ['id' => 14, 'name' => 'AFFIDAVIT OF NO OBJECTION', 'required' => false],
        ['id' => 15, 'name' => 'ENVIRONMENTAL COMPLIANCE CERTIFICATE (ECC) / CERTIFICATE OF NON-COVERAGE (CNC)', 'required' => false],
        ['id' => 16, 'name' => 'Certification of road right of way from DPWH (if project is within National Road)', 'required' => false],
    ];

    /**
     * Requirements for Special Use Permit (SUP)
     */
    public const SUP_REQUIREMENTS = [
        ['id' => 1, 'name' => 'Accomplished and notarized APPLICATION FORM', 'required' => true],
        ['id' => 2, 'name' => 'Proof of Right Over Land (Tax Declaration/Certificate of Title)', 'required' => true],
        ['id' => 3, 'name' => 'VICINITY MAP showing existing land uses', 'required' => true],
        ['id' => 4, 'name' => 'SITE DEVELOPMENT PLAN', 'required' => true],
        ['id' => 5, 'name' => 'ESTIMATED PROJECT COST / BILL OF MATERIALS', 'required' => true],
        ['id' => 6, 'name' => 'Barangay Clearance', 'required' => true],
        ['id' => 7, 'name' => 'Environmental Compliance Certificate (ECC)', 'required' => false],
        ['id' => 8, 'name' => 'Other supporting documents (specify)', 'required' => false],
    ];

    /**
     * Requirements for Temporary Use Permit (TUP)
     */
    public const TUP_REQUIREMENTS = [
        ['id' => 1, 'name' => 'Accomplished and notarized APPLICATION FORM', 'required' => true],
        ['id' => 2, 'name' => 'Valid Government-Issued ID', 'required' => true],
        ['id' => 3, 'name' => 'Location Sketch / Vicinity Map', 'required' => true],
        ['id' => 4, 'name' => 'Barangay Clearance', 'required' => true],
        ['id' => 5, 'name' => 'Business Permit (if commercial)', 'required' => false],
        ['id' => 6, 'name' => 'Other supporting documents (specify)', 'required' => false],
    ];

    /**
     * Requirements for Zoning Clearance / Certificate of Zoning Compliance
     */
    public const ZONING_CLEARANCE_REQUIREMENTS = [
        ['id' => 1, 'name' => 'Accomplished and notarized APPLICATION FORM', 'required' => true],
        ['id' => 2, 'name' => 'Proof of Right Over Land (Tax Declaration/Certificate of Title)', 'required' => true],
        ['id' => 3, 'name' => 'VICINITY MAP showing existing land uses within prescribed radius', 'required' => true],
        ['id' => 4, 'name' => 'SITE DEVELOPMENT PLAN showing project site, lot area boundaries & dimension', 'required' => true],
        ['id' => 5, 'name' => 'ESTIMATED PROJECT COST / BILL OF MATERIALS', 'required' => true],
        ['id' => 6, 'name' => 'Barangay Clearance', 'required' => true],
        ['id' => 7, 'name' => 'AFFIDAVIT OF NO OBJECTION', 'required' => false],
        ['id' => 8, 'name' => 'ENVIRONMENTAL COMPLIANCE CERTIFICATE (ECC) / CNC', 'required' => false],
        ['id' => 9, 'name' => 'Certification of road right of way from DPWH (if within National Road)', 'required' => false],
    ];

    /**
     * Get requirements based on project type
     */
    public static function getRequirements(string $projectType): array
    {
        return match (strtoupper($projectType)) {
            'SUP', 'SPECIAL USE PERMIT' => self::SUP_REQUIREMENTS,
            'TUP', 'TEMPORARY USE PERMIT' => self::TUP_REQUIREMENTS,
            'ZONING CLEARANCE', 'CERTIFICATE OF ZONING COMPLIANCE', 'LOCATIONAL CLEARANCE' => self::ZONING_CLEARANCE_REQUIREMENTS,
            default => self::ZONING_CLEARANCE_REQUIREMENTS, // Default to zoning clearance
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
            'COMMON' => self::COMMON_REQUIREMENTS,
            'MANUFACTURING' => self::MANUFACTURING_REQUIREMENTS,
            'SUPPLEMENTARY' => self::SUPPLEMENTARY_REQUIREMENTS,
        ];
    }

    /**
     * Get formatted requirement description
     */
    public static function getRequirementDescription(string $requirementName): string
    {
        $descriptions = [
            'VICINITY MAP' => 'For local projects: minimum 100 meters radius. For national projects: minimum 1 kilometer radius.',
            'SITE DEVELOPMENT PLAN' => 'Should show project site, lot area boundaries & dimension of proposed improvements.',
            'Proof of Right Over Land' => 'Latest Tax Declaration or Certificate of Title in the name of applicant.',
            'ENVIRONMENTAL COMPLIANCE CERTIFICATE' => 'ECC or Certificate of Non-Coverage (CNC) from appropriate authority.',
        ];

        return $descriptions[$requirementName] ?? '';
    }
}
