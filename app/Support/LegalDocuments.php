<?php

namespace App\Support;

/**
 * The published notices: privacy, terms, cookies, refunds.
 *
 * They live here rather than in four React pages because three separate
 * things have to agree about them. The pages render them, the consent tick
 * at sign-up records which version was agreed to, and the footer lists them.
 * Keeping one copy means a correction cannot be made in one place and missed
 * in the others, and the version a person actually consented to stays
 * knowable after the text has moved on.
 *
 * Bump VERSION whenever the substance changes - not for a typo. Everyone who
 * signed up under an older version is then visibly on an older version,
 * which is the record the Data Privacy Act expects the office to be able to
 * produce.
 */
class LegalDocuments
{
    /**
     * The edition of the notices currently published. 2.0 is the LocClear
     * Privacy Policy, Terms and Conditions, and Payment and Refund Policy
     * supplied by the office; accounts and applications filed under 1.0
     * keep their recorded 1.0.
     */
    public const VERSION = '2.0';

    /** The day this edition took effect. */
    public const EFFECTIVE = '2026-10-04';

    /**
     * Who to write to about any of this.
     *
     * The Data Privacy Act requires a named contact point, and a notice that
     * gives no way to exercise the rights it describes is not compliant. If
     * the office appoints a different Data Protection Officer, change it
     * here and it changes on every page at once.
     */
    public const CONTACT = [
        'office' => 'City Planning and Development Office (CPDO)',
        'unit' => 'City Government of Ilagan',
        'address' => 'Ground Floor, City Hall Building, City of Ilagan, Isabela',
        'email' => 'cpdo@cityofilagan.gov.ph',
        'phone' => '624-0009',
        'hours' => 'Monday to Friday, 8:00 AM - 5:00 PM (excluding public holidays)',
    ];

    /** The four keys that have a published notice. */
    public static function keys(): array
    {
        return ['privacy', 'terms', 'cookies', 'refund'];
    }

    /** Every notice, in the order the footer lists them. */
    public static function all(): array
    {
        return array_map(fn ($key) => self::get($key), self::keys());
    }

    /** One notice by key, or null if there is no such notice. */
    public static function get(string $key): ?array
    {
        $method = 'doc' . ucfirst($key);

        if (! in_array($key, self::keys(), true) || ! method_exists(self::class, $method)) {
            return null;
        }

        return array_merge([
            'key' => $key,
            'version' => self::VERSION,
            'effective' => self::EFFECTIVE,
            'contact' => self::CONTACT,
        ], self::$method());
    }

    /** Title, slug and blurb for each - for the footer and the index. */
    public static function index(): array
    {
        return array_map(fn ($doc) => [
            'key' => $doc['key'],
            'title' => $doc['title'],
            'summary' => $doc['summary'],
            'url' => '/legal/' . $doc['key'],
        ], self::all());
    }

    /* ── Helpers that keep the document bodies readable ───────────── */

    private static function p(string ...$text): array
    {
        return array_map(fn ($t) => ['type' => 'p', 'text' => $t], $text);
    }

    private static function ul(array $items): array
    {
        return [['type' => 'ul', 'items' => $items]];
    }

    private static function table(array $head, array $rows): array
    {
        return [['type' => 'table', 'head' => $head, 'rows' => $rows]];
    }

    private static function note(string $text): array
    {
        return [['type' => 'note', 'text' => $text]];
    }

    private static function section(string $heading, array ...$blocks): array
    {
        return ['heading' => $heading, 'content' => array_merge(...$blocks)];
    }

    /* ── Privacy Policy ───────────────────────────────────────────── */

    private static function docPrivacy(): array
    {
        return [
            'title' => 'Privacy Policy',
            'summary' => 'What personal information LocClear collects, how it is used and shared, and your rights under the Data Privacy Act.',
            'intro' => "LocClear is a web-based application processing and record management system developed for the City Planning and Development Office (CPDO) of the City of Ilagan to facilitate the submission, processing, monitoring, and management of Locational Clearance applications.\n\nThe system is intended to support government service delivery and does not replace the authority of the City Government of Ilagan or its authorized offices.",
            'sections' => [
                self::section(
                    'Information We Collect',
                    self::p('LocClear may collect:'),
                    self::ul([
                        'Full name',
                        'Address',
                        'Contact number',
                        'Email address',
                        'Applicant type',
                        'Property information',
                        'Project/activity information',
                        'Tax Declaration information',
                        'Title information',
                        'Application details',
                        'Uploaded supporting documents',
                        'Proof of payment, when applicable',
                        'Application status and transaction history',
                        'Account credentials and authentication information',
                        'System activity/log information',
                    ]),
                    self::p('Only information necessary for application processing, verification, monitoring, record management, communication, and other legitimate government functions should be collected.'),
                ),

                self::section(
                    'Use of Information',
                    self::p('Personal information may be processed for:'),
                    self::ul([
                        'Processing Locational Clearance applications;',
                        'Verifying submitted information and documents;',
                        'Communicating application status;',
                        'Generating application and transaction records;',
                        'Verifying payment records;',
                        'Maintaining government records;',
                        'Generating administrative reports;',
                        'Responding to legitimate requests and inquiries;',
                        'Maintaining system security; and',
                        'Complying with applicable laws, ordinances, regulations, and government requirements.',
                    ]),
                ),

                self::section(
                    'Sharing of Information',
                    self::p(
                        'Information may be accessed by authorized personnel of the City Government of Ilagan when necessary to perform their official functions.',
                        'Information may also be disclosed when required or authorized by applicable law, regulation, court order, or competent government authority.',
                    ),
                ),

                self::section(
                    'Data Security',
                    self::p('LocClear shall implement reasonable organizational, physical, and technical safeguards designed to protect personal information against unauthorized access, alteration, disclosure, loss, destruction, or other unlawful processing.'),
                ),

                self::section(
                    'Data Retention',
                    self::p('Records shall be retained only for as long as necessary to fulfill legitimate government, administrative, legal, auditing, and records-management requirements, subject to applicable laws and City Government policies.'),
                ),

                self::section(
                    'Applicant Rights',
                    self::p('Data subjects may exercise applicable rights under the Data Privacy Act of 2012 (RA 10173) and its implementing rules and regulations, subject to applicable legal limitations.'),
                ),

                self::section(
                    'Privacy Contact',
                    self::p('For privacy-related concerns, applicants may contact the appropriate Data Protection/Privacy Officer or authorized City Government office.'),
                ),
            ],
        ];
    }

    /* ── Terms and Conditions ─────────────────────────────────────── */

    private static function docTerms(): array
    {
        return [
            'title' => 'Terms and Conditions',
            'summary' => 'The rules for using LocClear: your responsibilities, how applications, documents and fees are handled, and what is not allowed.',
            'intro' => "These Terms and Conditions govern the use of LocClear, a web-based application processing and record management system intended to support the processing of Locational Clearance services of the City Planning and Development Office (CPDO) of the City of Ilagan.\n\nBy creating an account, submitting an application, or using the system, the applicant acknowledges and agrees to these Terms and Conditions.",
            'sections' => [
                self::section(
                    'Purpose of the System',
                    self::p(
                        'LocClear provides an electronic platform for submitting, monitoring, processing, and managing Locational Clearance applications and related records.',
                        'The system is intended to improve accessibility, transaction monitoring, document management, and service delivery.',
                    ),
                ),

                self::section(
                    'Applicant Responsibility',
                    self::p(
                        'Applicants are responsible for ensuring that all information and documents submitted through LocClear are true, accurate, complete, current, and authentic.',
                        'Applicants must not knowingly submit false, misleading, fraudulent, altered, or unauthorized documents.',
                        'The City Government of Ilagan may require additional documents or clarification when necessary to evaluate an application.',
                    ),
                ),

                self::section(
                    'Application Submission',
                    self::p(
                        'Submission of an application through LocClear does not constitute automatic approval.',
                        'An application remains subject to evaluation, verification, applicable zoning and development regulations, documentary requirements, and approval by authorized City Government personnel.',
                        'The CPDO and other authorized offices retain their respective governmental authority to approve, deny, return, or require additional information regarding an application.',
                    ),
                ),

                self::section(
                    'Supporting Documents',
                    self::p(
                        'Applicants must upload clear and readable copies of required documents.',
                        'The City may request the presentation of original documents or certified copies when necessary for verification.',
                        'Submitting a document electronically does not automatically establish its authenticity or validity.',
                    ),
                ),

                self::section(
                    'Application Status',
                    self::p(
                        'LocClear may provide electronic status updates to help applicants monitor their transactions.',
                        'A status displayed by the system represents the current recorded processing stage and does not by itself constitute a final governmental decision unless issued or approved by the authorized office.',
                    ),
                ),

                self::section(
                    'Fees and Payment',
                    self::p(
                        'Applicable fees and charges shall be based on the prevailing laws, ordinances, revenue regulations, and official fee schedules of the City Government of Ilagan.',
                        'Payment of applicable fees shall be made through the authorized payment process of the City Government.',
                        'LocClear may record or facilitate the monitoring of payment information, but the City Treasurer\'s Office remains the authorized office responsible for the collection and official receipt of applicable government fees.',
                        'An application is not considered paid merely because an applicant has uploaded a payment-related document unless the payment has been verified by the authorized City Government personnel.',
                    ),
                ),

                self::section(
                    'Refunds and Credits',
                    self::p(
                        'Requests for refund or credit of government fees shall be governed by applicable City ordinances, revenue regulations, and other applicable laws.',
                        'Where required, the applicant shall submit a written claim to the City Treasurer\'s Office or other authorized office.',
                        'LocClear does not independently authorize refunds of government fees.',
                    ),
                ),

                self::section(
                    'Account Security',
                    self::p(
                        'Applicants are responsible for maintaining the confidentiality of their account credentials.',
                        'Applicants must immediately report suspected unauthorized access or account compromise to the appropriate system administrator or authorized City Government personnel.',
                    ),
                ),

                self::section(
                    'Prohibited Activities',
                    self::p('Users shall not:'),
                    self::ul([
                        'Submit fraudulent information or documents;',
                        'Impersonate another person;',
                        'Access another user\'s account;',
                        'Attempt to bypass system security;',
                        'Introduce malicious software or code;',
                        'Interfere with system availability;',
                        'Access restricted administrative functions without authorization;',
                        'Manipulate application records;',
                        'Use the system for unlawful purposes; or',
                        'Attempt to obtain information that they are not authorized to access.',
                    ]),
                ),

                self::section(
                    'System Availability',
                    self::p(
                        'The City Government may temporarily suspend or restrict access to LocClear for maintenance, security updates, system improvements, technical problems, emergencies, or other legitimate governmental purposes.',
                        'The City shall endeavor to restore services as reasonably practicable.',
                    ),
                ),

                self::section(
                    'Electronic Communications',
                    self::p(
                        'Applicants may receive application-related notifications through the contact information provided during registration or application submission.',
                        'Applicants are responsible for ensuring that their contact information remains accurate and accessible.',
                    ),
                ),

                self::section(
                    'Government Authority',
                    self::p('Nothing in these Terms and Conditions limits the authority of the City Government of Ilagan, CPDO, City Treasurer\'s Office, or other authorized government offices to perform their functions under applicable laws, ordinances, regulations, and official policies.'),
                ),

                self::section(
                    'Changes to These Terms',
                    self::p(
                        'These Terms and Conditions may be updated when necessary to reflect changes in applicable laws, ordinances, government procedures, security requirements, or system functionality.',
                        'The updated version shall indicate its effective or updated date.',
                    ),
                ),

                self::section(
                    'Acceptance',
                    self::p(
                        'By using LocClear, the applicant acknowledges that they have read, understood, and agreed to these Terms and Conditions.',
                        'If the applicant does not agree with these Terms and Conditions, they should not use the system.',
                    ),
                ),
            ],
        ];
    }

    /* ── Cookie Policy ────────────────────────────────────────────── */

    private static function docCookies(): array
    {
        return [
            'title' => 'Cookie Policy',
            'summary' => 'The small number of cookies this system sets, all of them necessary to sign in and stay signed in.',
            'intro' => 'A cookie is a small file a website asks your browser to keep. This system sets four, and every one of them is needed for it to work. There is no advertising cookie, no analytics cookie, and no tracker belonging to anyone else.',
            'sections' => [
                self::section(
                    'The cookies this system sets',
                    self::table(
                        ['Name', 'What it does', 'How long it lasts', 'Type'],
                        [
                            ['laravel_session', 'Identifies your browsing session so that the system knows you are the person who signed in. Without it you would be signed out on every page.', 'Until you sign out, or 30 minutes of inactivity, or when you close the browser - whichever comes first', 'Strictly necessary'],
                            ['XSRF-TOKEN', 'Protects every form in the system against cross-site request forgery - an attack in which another site tries to make your browser submit something in your name.', 'Same as the session', 'Strictly necessary'],
                            ['remember_web_*', 'Set only if you tick "Remember me" when signing in, so that you are not asked for your password on every visit from that device.', 'Up to 5 years, or until you sign out', 'Strictly necessary (set only at your request)'],
                            ['sidebar_state', 'Remembers whether you left the menu expanded or collapsed, so the screen looks the way you left it.', '7 days', 'Functional preference'],
                        ],
                    ),
                ),

                self::section(
                    'What this system does not do',
                    self::ul([
                        'It sets no advertising or marketing cookie.',
                        'It runs no analytics service - there is no Google Analytics, no Tag Manager, no Meta pixel, and no comparable script. The office measures usage from its own audit records, which are described in the Privacy Policy, not from cookies placed in your browser.',
                        'It does not track you across other websites, and it does not build a profile of you.',
                        'It does not share cookie information with any third party.',
                    ]),
                ),

                self::section(
                    'Resources loaded from elsewhere',
                    self::p('Two things on these pages are fetched from an address outside the office\'s own server. Neither sets a cookie, and neither is used to identify you, but they are listed here because your browser does contact them.'),
                    self::table(
                        ['Resource', 'Served from', 'What it is for', 'Cookies'],
                        [
                            ['Figtree web font', 'fonts.bunny.net', 'The typeface the pages are set in. This service is used specifically because it is a privacy-respecting substitute for Google Fonts: it logs no personal data and sets no cookie.', 'None'],
                        ],
                    ),
                    self::p('Everything else - every script, stylesheet, image and document - is served from the office\'s own address.'),
                ),

                self::section(
                    'Is your consent needed?',
                    self::p(
                        'No, and this is why. Consent is required for cookies that are not necessary to provide the service you asked for - chiefly advertising and analytics cookies. All the cookies above are either strictly necessary to sign you in and keep your session safe, or, in the case of the menu preference, set as a direct result of something you did on the page and holding nothing that identifies you.',
                        'Because the system sets no analytics or advertising cookie and embeds no third-party tracker, there is nothing here for a consent banner to obtain consent for. The office has chosen to publish this page and show a short one-time notice instead, so that you can see exactly what is set rather than being asked to agree to something unspecified.',
                        'If the office ever adds analytics or any third-party embed that tracks visitors, this page will say so and your consent will be asked for before it loads.',
                    ),
                ),

                self::section(
                    'Controlling cookies yourself',
                    self::p(
                        'Every browser lets you see the cookies a site has set, delete them, and refuse new ones. Look for "Cookies and site data" under privacy settings.',
                        'Be aware that refusing the session cookie will make it impossible to sign in to this system at all, since there would be no way for the server to recognise you between one page and the next. Deleting cookies while signed in will sign you out.',
                    ),
                ),
            ],
        ];
    }

    /* ── Payment and Refund Policy ────────────────────────────────── */

    private static function docRefund(): array
    {
        return [
            'title' => 'Payment and Refund Policy',
            'summary' => 'How fees are paid and verified, and how a refund or credit of a government fee may be requested.',
            'intro' => null,
            'sections' => [
                self::section(
                    'Purpose',
                    self::p('This Payment and Refund Policy explains how fees associated with Locational Clearance applications are recorded and how requests concerning erroneous or otherwise refundable government payments may be handled.'),
                ),

                self::section(
                    'Government Fees',
                    self::p(
                        'Fees for Locational Clearance and related services shall be based on the prevailing City of Ilagan ordinances, revenue regulations, and official fee schedules.',
                        'The City Treasurer\'s Office is responsible for the collection and official recording of applicable government fees.',
                    ),
                ),

                self::section(
                    'Payment Verification',
                    self::p(
                        'Where payment information or proof of payment is submitted through LocClear, the submission may be reviewed and verified by authorized City Government personnel.',
                        'Uploading proof of payment does not by itself constitute confirmation that the payment has been accepted.',
                        'The application shall proceed according to the City\'s prescribed processing procedure after payment has been appropriately verified.',
                    ),
                ),

                self::section(
                    'Refund or Credit Requests',
                    self::p(
                        'Applicants who believe that a government fee has been erroneously or illegally collected may submit a written claim for refund or credit to the appropriate City Government office, particularly the City Treasurer\'s Office, in accordance with applicable laws and City ordinances.',
                        'Refund or credit requests shall be evaluated by the appropriate authorized government office.',
                        'LocClear does not independently approve or issue refunds.',
                    ),
                ),

                self::section(
                    'Supporting Documents',
                    self::p('An applicant requesting a refund or credit may be required to provide supporting documents, which may include:'),
                    self::ul([
                        'Official Receipt;',
                        'Application or transaction reference number;',
                        'Proof of payment;',
                        'Valid identification;',
                        'Written explanation of the refund or credit request; and',
                        'Other documents required by the City Treasurer\'s Office.',
                    ]),
                ),

                self::section(
                    'Review and Decision',
                    self::p('Refund or credit requests shall be reviewed and decided by the authorized City Government office in accordance with applicable laws, ordinances, revenue regulations, and accounting and auditing requirements.'),
                ),

                self::section(
                    'No Automatic Refund',
                    self::p(
                        'Cancellation, withdrawal, rejection, or non-completion of an application does not automatically establish a right to a refund.',
                        'Any refund or credit shall be subject to applicable government rules and the determination of the authorized office.',
                    ),
                ),

                self::section(
                    'Governing Rules',
                    self::p(
                        'This Policy shall be interpreted together with the applicable City of Ilagan Revenue Code, ordinances, Citizen\'s Charter, and other applicable laws and regulations.',
                        'Where a conflict exists, the applicable law, ordinance, or official government regulation shall prevail.',
                    ),
                ),
            ],
        ];
    }
}
