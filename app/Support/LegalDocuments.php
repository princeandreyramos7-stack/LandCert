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
    /** The edition of the notices currently published. */
    public const VERSION = '1.0';

    /** The day this edition took effect. */
    public const EFFECTIVE = '2026-09-20';

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
        'unit' => 'Zoning Administration Division',
        'address' => 'City Hall, City of Ilagan, Isabela 3300, Philippines',
        'email' => 'cpdo@ilagan.gov.ph',
        'phone' => '(078) 622-XXXX',
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
            'summary' => 'What personal information this system collects, why, who can see it, and how long it is kept.',
            'intro' => 'The City Planning and Development Office of the City of Ilagan collects personal information through this system in order to receive, evaluate and act on applications for zoning and land use certification. This notice explains what is collected and what is done with it, as required by Republic Act No. 10173, the Data Privacy Act of 2012.',
            'sections' => [
                self::section(
                    'Who is responsible for your information',
                    self::p(
                        'The personal information controller is the City Planning and Development Office (CPDO) of the City Government of Ilagan, Isabela. The CPDO decides what is collected through this system and how it is used.',
                        'Questions about this notice, and requests to exercise any of the rights described below, should be addressed to the office using the contact details at the end of this page.',
                    ),
                ),

                self::section(
                    'What is collected',
                    self::p('The system holds only what is needed to process an application and to keep a lawful record of what the office did.'),
                    self::table(
                        ['Category', 'Details', 'Why it is needed'],
                        [
                            ['Account details', 'Full name, email address, mobile number, home address (region, province, city, barangay and street), profile photograph if you upload one', 'To create and secure your account, to identify you as the applicant, and to reach you about your application'],
                            ['Application details', 'Type of certification sought, project name and nature, project location, project cost, lot and property particulars, right over the property', 'To evaluate the application against the zoning ordinance and applicable land use rules'],
                            ['Representative details', 'Name, address and contact details of an authorised representative, and the authorisation letter, where one is appointed', 'To confirm that a person filing on your behalf is entitled to do so'],
                            ['Supporting documents', 'Scanned requirements such as titles, tax declarations, plans, sketches, clearances and photographs that you upload', 'These are the evidence the evaluation is based on'],
                            ['Payment records', 'Order of Payment details, official receipt number, date, amount and the receipt image you upload', 'To confirm that the prescribed fees were paid before a certificate is released'],
                            ['Issued documents', 'Certificates, clearances and their verification codes', 'To issue the document and to allow a third party holding the paper to check that it is genuine'],
                            ['Activity records', 'Sign-in and sign-out times, failed sign-in attempts, pages visited, actions taken on applications, and the IP address and browser used', 'To keep the audit trail that a government record system is expected to keep, and to detect misuse of accounts'],
                            ['Signatures', 'The specimen signature and position of the signing officer or administrator, for staff accounts only', 'To place the correct signatory on the documents the office issues'],
                        ],
                    ),
                    self::note('This system does not ask for, and should not be given, information about health, religion, political affiliation, genetic or biometric data, or any criminal record. Do not upload documents containing such information unless the office has specifically asked for them.'),
                ),

                self::section(
                    'Why it may lawfully be processed',
                    self::p('Under Sections 12 and 13 of the Data Privacy Act, the office processes this information on the following bases:'),
                    self::ul([
                        'It is necessary to fulfil a function of a public authority - the City Planning and Development Office is mandated to administer zoning and land use regulation within the City of Ilagan.',
                        'It is necessary to comply with a legal obligation, including Republic Act No. 11032 (Ease of Doing Business and Efficient Government Service Delivery Act of 2018), the Local Government Code, and the records and audit requirements that apply to local government units.',
                        'It is necessary to take steps at your request before, and in the course of, acting on your application.',
                        'Where none of the above applies, it is processed on the basis of the consent you give when you create an account or submit an application - which you may withdraw, subject to the limits described below.',
                    ]),
                ),

                self::section(
                    'Who can see it',
                    self::p('Access follows the role a person holds in the office, and nothing more.'),
                    self::table(
                        ['Who', 'What they can see'],
                        [
                            ['You', 'Your own account, your own applications, your own uploaded documents, your own payments and the documents issued to you. You cannot see another applicant\'s records.'],
                            ['Zoning Officer', 'Applications assigned for evaluation, their supporting documents and payments, in order to review them.'],
                            ['Zoning Administrator', 'Applications forwarded for approval, and the office-wide reports and audit trail.'],
                            ['City Treasurer\'s Office', 'Payment information, to the extent needed to confirm collection of the prescribed fees.'],
                            ['Holder of a printed certificate', 'Only what is already printed on the paper - the name, project, dates and whether the document is still valid - reached by scanning the QR code or entering the verification code. No other information is shown, and no account is needed.'],
                        ],
                    ),
                    self::p(
                        'Your information is not sold, rented, or shared for advertising. It is not transferred outside the Philippines.',
                        'It may be disclosed to another government agency, to the Commission on Audit, or to a court or other body with authority to require it, where the law requires the office to do so.',
                    ),
                ),

                self::section(
                    'Where it is kept and how it is protected',
                    self::p('The system and its database are hosted on servers operated by the office\'s hosting provider. The following measures apply:'),
                    self::ul([
                        'All traffic between your browser and the system is encrypted (HTTPS).',
                        'Passwords are stored as one-way hashes and cannot be read by anyone, including office staff.',
                        'Uploaded documents are stored outside the public web directory and are served only to a signed-in user who is entitled to see that particular file.',
                        'Every significant action - a submission, an approval, a denial, a payment, a release - is written to an audit trail with the account that performed it and the time it happened.',
                        'Sessions end automatically after a period of inactivity, and signing out clears the session.',
                        'Failed sign-in attempts are recorded and repeated failures are rate-limited.',
                    ]),
                ),

                self::section(
                    'How long it is kept',
                    self::p('Records are retained for as long as the office is required to keep them, and no longer than is useful for the purpose they were collected for.'),
                    self::table(
                        ['Record', 'Retention'],
                        [
                            ['Applications and their supporting documents', 'Retained while active, then archived. Archived applications remain retrievable for the period set by the National Archives of the Philippines general records disposition schedule for local government records.'],
                            ['Issued certificates and clearances', 'Retained permanently as a record of what the office issued, so that a document presented years later can still be verified.'],
                            ['Payment records', 'Retained for the period required by audit rules.'],
                            ['Audit and sign-in records', 'Retained as the record of who did what, in line with the same schedule.'],
                            ['Account details', 'Retained while the account exists. If you ask for your account to be closed, the account is deactivated; applications already filed remain on record, because they are part of the office\'s official file.'],
                        ],
                    ),
                ),

                self::section(
                    'Your rights',
                    self::p('The Data Privacy Act gives you the following rights over your personal information. To exercise any of them, write to the office using the details below.'),
                    self::ul([
                        'To be informed of how your information is collected and used - this notice.',
                        'To access the information the office holds about you, and to be given a copy of it.',
                        'To have inaccurate or incomplete information corrected. Much of it you can correct yourself from your profile; where an application has already been submitted, ask the office.',
                        'To object to processing, and to withdraw consent where consent was the basis for it.',
                        'To erasure or blocking of information that is incomplete, outdated, false, unlawfully obtained, or no longer necessary - subject to the office\'s duty to keep its official records.',
                        'To damages, if you suffer loss because your rights under the Act were violated.',
                        'To lodge a complaint with the National Privacy Commission (privacy.gov.ph) if you believe your rights have not been respected.',
                        'To data portability - to obtain the information you supplied in a structured, commonly used electronic format.',
                    ]),
                    self::note('Withdrawing consent or asking for erasure while an application is in progress will usually mean the office cannot continue to process that application, because the information withdrawn is the information the evaluation depends on.'),
                ),

                self::section(
                    'Children',
                    self::p('This system is intended for use by adults transacting with the City Planning and Development Office. Accounts should not be created by persons below eighteen years of age. Where a minor has an interest in a property, the application should be filed by a parent, guardian or authorised representative.'),
                ),

                self::section(
                    'Changes to this notice',
                    self::p('If this notice changes in substance, the version number and effective date at the top of this page change with it, and you will be asked to acknowledge the new version the next time you sign in. Past versions remain available on request.'),
                ),
            ],
        ];
    }

    /* ── Terms and Conditions ─────────────────────────────────────── */

    private static function docTerms(): array
    {
        return [
            'title' => 'Terms and Conditions',
            'summary' => 'The rules for using this system, what the office undertakes to do, and what is expected of you.',
            'intro' => 'These terms govern your use of the online land certification system of the City Planning and Development Office, City of Ilagan, Isabela. By creating an account or submitting an application, you agree to them.',
            'sections' => [
                self::section(
                    'What this system is',
                    self::p(
                        'This is the official channel through which the City Planning and Development Office receives applications for zoning and land use certification, evaluates them, and issues the resulting documents. It exists to let you file, track and receive these documents without repeated trips to City Hall.',
                        'It is a means of transacting with the office. It is not, in itself, a decision-maker. Every certificate, clearance and denial is the act of the responsible officer or the Zoning Administrator.',
                    ),
                ),

                self::section(
                    'Your account',
                    self::ul([
                        'One person, one account. Register with your own true and complete name, email address and contact number.',
                        'You are responsible for everything done through your account. Keep your password to yourself, and choose one you do not use elsewhere.',
                        'Tell the office at once if you believe someone else has used your account.',
                        'An account found to have been created with a false identity, or used to file on behalf of another person without authority, may be suspended and the applications filed through it set aside.',
                        'Staff accounts are created by the office. They are tied to a named officer and may not be shared.',
                    ]),
                ),

                self::section(
                    'Filing an application',
                    self::p('When you submit an application through this system you are making a formal representation to a government office. The following applies:'),
                    self::ul([
                        'Everything you state must be true, and every document you upload must be genuine and current.',
                        'Uploading a falsified, altered or forged public or private document is a criminal offence under the Revised Penal Code. The office will refer such cases for prosecution and the application will be denied.',
                        'Where you file on behalf of someone else, you must upload a signed authorisation letter, and the office may require the original.',
                        'Submitting an application does not create any right to the certificate applied for. It begins an evaluation.',
                        'The office may require you to produce original documents, to submit additional requirements, or to allow an inspection of the site, before it decides.',
                    ]),
                ),

                self::section(
                    'Processing times',
                    self::p(
                        'The office processes applications within the periods set out in its Citizen\'s Charter, as required by Republic Act No. 11032. The system records the time an application spends at each stage and shows it to you, so that the office can be held to those periods.',
                        'A period runs in working days and is counted from the point at which the application is complete. Time spent waiting for a requirement you have not yet supplied, or for a fee you have not yet paid, does not count against the office.',
                    ),
                ),

                self::section(
                    'Fees',
                    self::p(
                        'Fees are those prescribed by the applicable city ordinance and revenue code. The system issues an Order of Payment stating the amount due. Payment is made to the City Treasurer\'s Office; this system does not accept card or online payment and will never ask you for card details.',
                        'A certificate is released only after payment has been confirmed against an official receipt. See the Refund Policy for what happens if you have paid and the application does not proceed.',
                    ),
                ),

                self::section(
                    'Documents the office issues',
                    self::p(
                        'A certificate or clearance issued through this system carries a verification code and a QR code. Any person holding the printed document may check it at the public verification page, which will confirm whether the document is genuine, who it was issued to, and whether it is still valid.',
                        'An electronic document generated by this system, and the electronic signature it carries, are given legal recognition by Republic Act No. 8792, the Electronic Commerce Act of 2000.',
                        'The office may revoke a document that was issued on the basis of false information, or that was issued in error. A revoked document shows as revoked on the verification page.',
                    ),
                ),

                self::section(
                    'What you must not do',
                    self::ul([
                        'Attempt to reach another person\'s account, application or documents.',
                        'Probe, scan or test the system\'s security, or attempt to bypass any access control or rate limit.',
                        'Upload anything containing malicious code.',
                        'Use automated means to submit applications, to harvest information, or to guess verification codes.',
                        'Interfere with the system\'s operation, or with another person\'s use of it.',
                        'Reproduce, imitate or alter a document issued by the office.',
                    ]),
                    self::note('The system records the account, address and time of every action. Conduct of this kind is logged and may be referred to the proper authorities.'),
                ),

                self::section(
                    'Availability',
                    self::p(
                        'The office aims to keep the system available at all times, but it cannot guarantee uninterrupted service. It may be taken down for maintenance, and may be unavailable through circumstances outside the office\'s control.',
                        'Where the system is unavailable, applications may still be filed over the counter at the City Planning and Development Office during office hours. Unavailability of the system does not extend a period fixed by law or ordinance, but the office will not count against you time during which it was not possible to file.',
                    ),
                ),

                self::section(
                    'Limits',
                    self::p(
                        'The office provides this system in good faith and takes reasonable care over its accuracy. It does not warrant that the system will be free of error.',
                        'Nothing shown in this system - including any indicative fee, any estimated period, or any status - overrides the certificate, clearance, order of payment or official receipt actually issued on paper. Where the two differ, the issued document governs.',
                        'The office is not liable for loss arising from your own failure to keep your account secure, from information you supplied that was incorrect, or from your reliance on a document that the verification page shows to be revoked or invalid.',
                    ),
                ),

                self::section(
                    'Suspension',
                    self::p('The office may suspend or close an account that is used in breach of these terms, that is used to submit falsified documents, or that is used to attack the system. Where an account is suspended, applications already filed continue to be dealt with under the law.'),
                ),

                self::section(
                    'Governing law',
                    self::p('These terms are governed by the laws of the Republic of the Philippines. Any dispute arising from them falls to the proper courts of the City of Ilagan, Province of Isabela.'),
                ),

                self::section(
                    'Changes to these terms',
                    self::p('The office may revise these terms. When it does, the version number and effective date at the top of this page change, and you will be asked to acknowledge the new version the next time you sign in. Continuing to use the system after that point means you accept the revised terms.'),
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

    /* ── Refund Policy ────────────────────────────────────────────── */

    private static function docRefund(): array
    {
        return [
            'title' => 'Refund Policy',
            'summary' => 'When a fee paid to the City Treasurer can be refunded, when it cannot, and how to ask.',
            'intro' => 'Fees for zoning and land use certification are government revenue, collected under the city\'s revenue code and accounted for to the Commission on Audit. They are not commercial charges, and refunding them is governed by government accounting rules rather than by a merchant\'s discretion. This page sets out how the office applies those rules.',
            'sections' => [
                self::section(
                    'How payment works',
                    self::p(
                        'This system does not collect money. It issues an Order of Payment stating what is due; you pay that amount at the City Treasurer\'s Office and are given an official receipt; you then record the receipt in the system so that the office can confirm payment and proceed.',
                        'The office will never ask you for a card number, a bank login, or an online transfer to a personal account. If anyone claiming to be from the CPDO asks for this, it is not the office - report it.',
                    ),
                    self::note('Because no payment is taken through this system, there is no card charge here to reverse. Every refund described below is a refund by the City Treasurer of money actually received at the counter.'),
                ),

                self::section(
                    'When a refund may be claimed',
                    self::p('A refund may be claimed where the money should not have been collected, or was collected in excess. In practice this means:'),
                    self::table(
                        ['Situation', 'Refundable?'],
                        [
                            ['You were assessed and paid more than the correct fee', 'Yes - the excess is refundable'],
                            ['You paid twice for the same application', 'Yes - the duplicate is refundable'],
                            ['The office assessed a fee for a certification that does not apply to your project', 'Yes'],
                            ['You paid, and the office is unable to act on the application through its own error', 'Yes'],
                            ['You withdraw the application before the office has begun evaluating it', 'Yes, at the office\'s determination, less any filing fee already earned'],
                            ['You withdraw after evaluation or inspection has been carried out', 'Generally no - the service the fee pays for has been performed'],
                            ['The application is denied after evaluation', 'No - the fee pays for the evaluation, not for a favourable result'],
                            ['The certificate was issued and you no longer need it', 'No'],
                            ['The certificate lapsed because you did not act on it within its validity', 'No'],
                            ['You supplied false information and the application was denied or the document revoked', 'No'],
                        ],
                    ),
                ),

                self::section(
                    'A denial is not a refund',
                    self::p(
                        'This is the point most often misunderstood, so it is stated plainly. The fee is for the evaluation of your application against the zoning ordinance - the officer\'s time, the checking of documents, and where required the inspection of the site. That work is done whether the answer is yes or no.',
                        'If your application is denied you will be given the reason in writing. You may correct what was wrong and apply again, and you may appeal the decision through the channels stated in the notice of denial. What you may not do is recover the fee for the evaluation that produced the decision.',
                    ),
                ),

                self::section(
                    'How to ask for a refund',
                    self::ul([
                        'Write to the City Planning and Development Office, stating the application number, the amount, the date of payment and the reason you believe a refund is due.',
                        'Attach the original official receipt. A refund cannot be processed without it.',
                        'Bring a valid government-issued identification document. If you are claiming on behalf of the payer, bring a notarised authorisation and your own identification.',
                        'Lodge the claim within two years of the date of payment. Claims made after that are barred by the general rule on claims against government funds.',
                    ]),
                ),

                self::section(
                    'What happens next',
                    self::p('The office acknowledges the claim and evaluates it within the period set in its Citizen\'s Charter. Where the claim is found to be proper, it is endorsed to the City Treasurer\'s Office and to the City Accountant for processing.'),
                    self::ul([
                        'A refund of government funds is disbursed by the City Treasurer, not by this office, and follows the city\'s ordinary disbursement procedure.',
                        'It is paid to the person named on the official receipt.',
                        'Processing typically takes fifteen to thirty working days from approval of the claim, depending on the city\'s disbursement schedule.',
                        'You will be told in writing if the claim is refused, and why.',
                    ]),
                    self::note('These periods are indicative. The disbursement of public funds is subject to the rules of the Commission on Audit and to the availability of the appropriate fund, and the office cannot guarantee a date.'),
                ),

                self::section(
                    'If you disagree',
                    self::p('If your claim is refused and you believe it should not have been, you may raise the matter with the City Administrator, and thereafter with the Commission on Audit, which has jurisdiction over money claims against a local government unit.'),
                ),
            ],
        ];
    }
}
