<?php

namespace App\Constants;

class ApplicationRequirements
{
    /**
     * Requirements for Certificate of Zoning Compliance (CZC)
     * Based on ANNEX B of HLURB Memorandum Circular No. 03 Series of 1998
     *
     * Split into two sections:
     * - 'main': the 5 core requirements every applicant must submit
     * - 'additional': situational requirements (only some apply), each with
     *   its own upload slot since they are separate documents
     */
    public const CZC_REQUIREMENTS = [
        [
            'id' => 1,
            'name' => '1. Accomplished and notarized APPLICATION FORM',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 2,
            'name' => '2. Right Over Land Documentation',
            'required' => true,
            'section' => 'main',
            'is_group' => true,
            'description' => 'Submit all three documents below.'
        ],
        [
            'id' => 13,
            'name' => 'Title',
            'required' => true,
            'section' => 'main',
            'parent_id' => 2,
            'description' => ''
        ],
        [
            'id' => 14,
            'name' => 'Tax Declaration',
            'required' => true,
            'section' => 'main',
            'parent_id' => 2,
            'description' => ''
        ],
        [
            'id' => 15,
            'name' => 'Tax Receipt',
            'required' => true,
            'section' => 'main',
            'parent_id' => 2,
            'description' => ''
        ],
        [
            'id' => 3,
            'name' => '3. VICINITY MAP',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 4,
            'name' => '4. SITE DEVELOPMENT PLAN',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 5,
            'name' => '5. ESTIMATED PROJECT COST / BILL OF MATERIALS',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 12,
            'name' => '6. Barangay Clearance',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 6,
            'name' => 'Endorsement/recommendation from Department of Agrarian Reform',
            'required' => false,
            'section' => 'additional',
            'description' => 'Required only for projects situated in tenanted rice and/or corn lands.'
        ],
        [
            'id' => 7,
            'name' => 'Description of Industry (Manufacturing Projects)',
            'required' => false,
            'section' => 'additional',
            'description' => ''
        ],
        [
            'id' => 8,
            'name' => 'Sworn Special Power of Attorney',
            'required' => false,
            'section' => 'additional',
            'description' => 'Required if the application is filed by an authorized representative.'
        ],
        [
            'id' => 9,
            'name' => 'Affidavit of No Objection',
            'required' => false,
            'section' => 'additional',
            'description' => ''
        ],
        [
            'id' => 10,
            'name' => 'Environmental Compliance Certificate (ECC) / Certificate of Non-Coverage (CNC)',
            'required' => false,
            'section' => 'additional',
            'description' => ''
        ],
        [
            'id' => 11,
            'name' => 'Certification of road right-of-way from DPWH',
            'required' => false,
            'section' => 'additional',
            'description' => 'Required if the project is located within a National Road.'
        ],
    ];

    /**
     * Requirements for Zoning Certification (ZC)
     *
     * A standalone category with its own short document set — nothing else is
     * asked for, so there are no "additional" requirements here.
     */
    public const ZC_REQUIREMENTS = [
        [
            'id' => 1,
            'name' => '1. Title',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 2,
            'name' => '2. Tax Declaration',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 3,
            'name' => '3. VICINITY MAP',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 4,
            'name' => '4. Latest Tax Receipt',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 5,
            'name' => '5. Sketch Plan with signature of Geodetic Engr.',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
    ];

    /**
     * Requirements for Special Use Permit (SUP)
     */
    public const SUP_REQUIREMENTS = [
        [
            'id' => 1,
            'name' => '1. Accomplished application form',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 2,
            'name' => '2. Letter request describing proposed special use',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 3,
            'name' => '3. Valid ID of applicant',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 4,
            'name' => '4. Land title / tax declaration / lease contract',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 5,
            'name' => '5. Site development plan / lot plan',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 7,
            'name' => '6. Barangay clearance / endorsement',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 6,
            'name' => 'Certificate of Zoning Compliance (CZC) or locational clearance request',
            'required' => false,
            'section' => 'additional',
            'description' => ''
        ],
        [
            'id' => 8,
            'name' => 'Environmental or safety clearances',
            'required' => false,
            'section' => 'additional',
            'description' => 'If needed for the proposed special use.'
        ],
        [
            'id' => 9,
            'name' => 'Business documents',
            'required' => false,
            'section' => 'additional',
            'description' => 'If the applicant is a company or business entity.'
        ],
        [
            'id' => 10,
            'name' => 'Payment of fees',
            'required' => true,
            'section' => 'additional',
            'description' => ''
        ],
    ];

    /**
     * Requirements for Temporary Use Permit (TUP)
     */
    public const TUP_REQUIREMENTS = [
        [
            'id' => 1,
            'name' => '1. Accomplished application form',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 2,
            'name' => '2. Letter request stating temporary use/purpose',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 3,
            'name' => '3. Valid ID of applicant',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 4,
            'name' => '4. Proof of ownership / authorization from owner',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 5,
            'name' => '5. Sketch plan / vicinity map',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 6,
            'name' => '6. Barangay clearance',
            'required' => true,
            'section' => 'main',
            'description' => ''
        ],
        [
            'id' => 7,
            'name' => 'Business permit',
            'required' => false,
            'section' => 'additional',
            'description' => 'If the activity is commercial.'
        ],
        [
            'id' => 8,
            'name' => 'Photos of site/location',
            'required' => false,
            'section' => 'additional',
            'description' => 'If required.'
        ],
        [
            'id' => 9,
            'name' => 'Payment of processing fees',
            'required' => true,
            'section' => 'additional',
            'description' => ''
        ],
    ];

    /**
     * Get requirements based on project type
     */
    public static function getRequirements(string $projectType): array
    {
        return match (strtoupper($projectType)) {
            'ZC', 'ZONING CERTIFICATION' => self::ZC_REQUIREMENTS,
            'SUP', 'SPECIAL USE PERMIT' => self::SUP_REQUIREMENTS,
            'TUP', 'TEMPORARY USE PERMIT' => self::TUP_REQUIREMENTS,
            'CZC', 'CERTIFICATE OF ZONING COMPLIANCE', 'LOCATIONAL CLEARANCE', 'ZONING', 'ZONING CLEARANCE' => self::CZC_REQUIREMENTS,
            default => self::CZC_REQUIREMENTS, // Default to CZC
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
            'CZC' => self::CZC_REQUIREMENTS,
            'ZC' => self::ZC_REQUIREMENTS,
        ];
    }
}
