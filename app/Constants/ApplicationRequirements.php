<?php

namespace App\Constants;

class ApplicationRequirements
{
    /**
     * Requirements for Zoning Clearance / Certificate of Zoning Compliance
     * Based on ANNEX B of HLURB Memorandum Circular No. 03 Series of 1998
     *
     * Split into two sections:
     * - 'main': the 5 core requirements every applicant must submit
     * - 'additional': situational requirements (only some apply), each with
     *   its own upload slot since they are separate documents
     */
    public const ZONING_CLEARANCE_REQUIREMENTS = [
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
            'description' => "a. Photocopy of Certificate of Title registered in applicant's name & latest Tax Declaration\nb. If title is NOT in applicant's name, submit:\n   - Certified true copy of latest Tax Declaration\n   - Pro forma affidavit stating:\n      • Applicant is the owner of the property\n      • Reason why property is not yet titled\n      • Property is within alienable and disposable land\n      • Property is free from liens and encumbrances\n      • Property is not tenanted (for rice/corn lands)\nc. For unregistered properties, submit deed of sale, donation, lease, or authorization to use land plus owner's title or tax declaration and affidavit per item b"
        ],
        [
            'id' => 3,
            'name' => '3. VICINITY MAP',
            'required' => true,
            'section' => 'main',
            'description' => "Showing existing land uses within prescribed radius:\na. Local significance projects: minimum 100 meters radius (may be drawn not to scale)\nb. National significance projects: minimum 1 kilometer radius (must be drawn to scale)"
        ],
        [
            'id' => 4,
            'name' => '4. SITE DEVELOPMENT PLAN',
            'required' => true,
            'section' => 'main',
            'description' => "Showing project site, lot area boundaries & dimension of proposed improvements\n- For local significance projects: need not be drawn to scale"
        ],
        [
            'id' => 5,
            'name' => '5. ESTIMATED PROJECT COST / BILL OF MATERIALS',
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
            'description' => "For manufacturing projects, describe:\n1. Type and volume of raw materials used\n2. Products manufactured or stored\n3. Average daily output/capacity per day/week/month\n4. Industrial waste & pollution control plans\n5. Description of manufacturing processes"
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
        [
            'id' => 12,
            'name' => 'Barangay Clearance',
            'required' => false,
            'section' => 'additional',
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
            'id' => 6,
            'name' => 'Zoning clearance or locational clearance request',
            'required' => true,
            'section' => 'additional',
            'description' => ''
        ],
        [
            'id' => 7,
            'name' => 'Barangay clearance / endorsement',
            'required' => true,
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
            'name' => 'Barangay clearance',
            'required' => true,
            'section' => 'additional',
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
        ];
    }
}
