<?php

namespace Database\Seeders;

use App\Constants\ApplicationRequirements;
use App\Models\Applicant;
use App\Models\Certificate;
use App\Models\Location;
use App\Models\NormalizedProject;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Report;
use App\Models\Request as RequestModel;
use App\Models\RequirementDocument;
use App\Models\User;
use App\Services\CertificateService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * A realistic, fully-wired set of demo applications: every clearance type,
 * every stage of the lifecycle (pending through released, plus returned and
 * denied), spread across the last few months so the dashboards, the "By
 * Month & Year/Day" report and its charts, Payments and Certificates all
 * have something worth looking at.
 *
 * Each application is built the way the real workflow builds one - filed,
 * then (for most) reviewed, approved, paid, certified and released, each
 * step timestamped in sequence via Carbon::setTestNow() so the models' own
 * hooks (Request/Report booted(), see App\Support\ProcessingSla) write a
 * genuine status history and stage_since, not a single instantaneous jump.
 * Two applications are deliberately left stale - one approved-and-unpaid for
 * over a month, one released for over two years - and the real
 * `applications:archive` command is run at the end, so the demo also shows
 * what an archived application looks like, not just how one gets there.
 *
 * Idempotent-ish: demo applicant accounts are found-or-created by a fixed
 * email, so running this again does not fail on a duplicate account - it
 * simply reuses them and adds another batch of applications. Meant for a
 * local or demo database only; never run this against production.
 */
class DemoSeeder extends Seeder
{
    private const DEMO_PASSWORD = 'demo1234';

    private const BARANGAYS = [
        'Alibagu', 'Alinguigan 1st', 'Alinguigan 2nd', 'Osmena',
        'Cabannungan 1st', 'Baligatan', 'San Vicente', 'Calamagui 1st',
    ];

    private const PROJECT_NATURES = [
        'New Residential House', 'Sari-sari Store', 'Warehouse',
        'Commercial Building', 'Poultry Farm', 'Junk Shop', 'Piggery',
    ];

    private const ZONE_CLASSIFICATIONS = ['Residential', 'Commercial', 'Agricultural', 'Institutional'];

    /** @var User[] */
    private array $officers = [];
    private User $administrator;
    private CertificateService $certificateService;

    /** One Applicant (and its User) per demo name, reused across their applications. */
    private array $applicantsByName = [];

    public function run(): void
    {
        $this->certificateService = app(CertificateService::class);

        $this->officers = User::where('user_type', 'admin')->get()->all();
        if (empty($this->officers)) {
            $this->officers = User::factory()->count(2)->create(['user_type' => 'admin'])->all();
        }

        $this->administrator = User::where('user_type', 'super_admin')->first()
            ?? User::factory()->create(['user_type' => 'super_admin']);

        $scenarios = $this->scenarios();

        foreach ($scenarios as $scenario) {
            $this->buildApplication($scenario);
        }

        // Sweep the deliberately-stale applications above into the archive
        // with the real command, exactly as the daily schedule would.
        Artisan::call('applications:archive', ['--years' => 2, '--unpaid-days' => 30]);

        $this->command->info('==============================================');
        $this->command->info(count($scenarios) . ' demo applications seeded across every status and clearance type.');
        $this->command->info('Sign in as any demo applicant (see their email above) with password: ' . self::DEMO_PASSWORD);
        $this->command->info('==============================================');
    }

    /**
     * The cast of applications this seeder files. `days_ago` is when it was
     * filed; everything after that plays out relative to it, a few days at a
     * time, ending at `target`.
     */
    private function scenarios(): array
    {
        return [
            ['applicant' => 'Juan Dela Cruz',      'type' => 'CZC', 'days_ago' => 1,    'target' => 'pending'],
            ['applicant' => 'Juan Dela Cruz',       'type' => 'SUP', 'days_ago' => 0,    'target' => 'approved'],
            ['applicant' => 'Maria Santos',         'type' => 'SUP', 'days_ago' => 5,    'target' => 'reviewed'],
            ['applicant' => 'Pedro Reyes',          'type' => 'CZC', 'days_ago' => 10,   'target' => 'in_applicant'],
            ['applicant' => 'Ana Cruz',             'type' => 'ZC',  'days_ago' => 20,   'target' => 'rejected'],
            ['applicant' => 'Jose Bautista',        'type' => 'CZC', 'days_ago' => 3,    'target' => 'approved'],
            // Approved and never paid for well over a month - an
            // archive:applications candidate on the "unpaid" rule.
            ['applicant' => 'Rosa Garcia',          'type' => 'TUP', 'days_ago' => 40,   'target' => 'approved'],
            ['applicant' => 'Isabel Lopez',         'type' => 'ZC',  'days_ago' => 36,   'target' => 'approved'],
            ['applicant' => 'Carlos Mendoza',       'type' => 'SUP', 'days_ago' => 15,   'target' => 'payment_confirmed'],
            ['applicant' => 'Elena Torres',         'type' => 'CZC', 'days_ago' => 25,   'target' => 'certificate_ready'],
            ['applicant' => 'Francisco Sanchez',    'type' => 'SUP', 'days_ago' => 12,   'target' => 'certificate_ready'],
            ['applicant' => 'Teresa Gomez',         'type' => 'TUP', 'days_ago' => 8,    'target' => 'payment_confirmed'],
            ['applicant' => 'Miguel Flores',        'type' => 'ZC',  'days_ago' => 70,   'target' => 'released'],
            ['applicant' => 'Patricia Ramirez',     'type' => 'CZC', 'days_ago' => 6,    'target' => 'released'],
            ['applicant' => 'Ricardo Castillo',     'type' => 'ZC',  'days_ago' => 50,   'target' => 'released'],
            // Released well over two years ago - an archive:applications
            // candidate on the "closed" rule.
            ['applicant' => 'Sofia Rivera',         'type' => 'CZC', 'days_ago' => 1100, 'target' => 'released'],
            ['applicant' => 'Luis Gonzales',        'type' => 'TUP', 'days_ago' => 0,    'target' => 'pending'],
            ['applicant' => 'Carmen Ramos',         'type' => 'SUP', 'days_ago' => 0,    'target' => 'pending'],
            ['applicant' => 'Antonio Fernandez',    'type' => 'CZC', 'days_ago' => 1,    'target' => 'reviewed'],
            ['applicant' => 'Manuel Perez',         'type' => 'CZC', 'days_ago' => 45,   'target' => 'rejected'],
            ['applicant' => 'Laura Morales',        'type' => 'CZC', 'days_ago' => 18,   'target' => 'in_applicant'],
        ];
    }

    private function buildApplication(array $scenario): void
    {
        $timeline = $this->timelineFor($scenario['target']);

        // A target's timeline needs that many days to play out; filing it any
        // more recently would land its last step in the future.
        $minDaysAgo = empty($timeline) ? 0 : max(array_column($timeline, 'day'));
        $daysAgo = max($scenario['days_ago'], $minDaysAgo);

        $filedAt = now()->subDays($daysAgo)->setTime(rand(8, 16), rand(0, 59));

        Carbon::setTestNow($filedAt);
        try {
            $applicant = $this->applicantFor($scenario['applicant']);
            $type = $scenario['type'];

            $request = RequestModel::factory()->numbered()->create([
                'user_id' => $applicant->user_id,
                'applicant_id' => $applicant->id,
                'status' => 'pending',
                'preferred_release_mode' => 'pickup',
            ]);

            $duration = $type === 'TUP' ? 'Temporary' : 'Permanent';
            $years = $type === 'TUP' ? 1 : null;

            NormalizedProject::create([
                'request_id' => $request->id,
                'project_type' => $type,
                'project_nature' => self::PROJECT_NATURES[array_rand(self::PROJECT_NATURES)],
                'project_nature_duration' => $duration,
                'project_nature_years' => $years,
                'project_cost' => rand(50, 5000) * 1000,
            ]);

            Location::create([
                'request_id' => $request->id,
                'house_number' => (string) rand(1, 999),
                'street_address' => 'Purok ' . rand(1, 7),
                'barangay' => self::BARANGAYS[array_rand(self::BARANGAYS)],
                'city_municipality' => 'City of Ilagan',
                'province' => 'Isabela',
                'postal_code' => '3300',
            ]);

            Property::create([
                'request_id' => $request->id,
                'lot_area_sqm' => rand(80, 2000),
                'lot_number' => 'LOT-' . $request->id,
                'tax_declaration_no' => 'TD-' . now()->format('Y') . '-' . str_pad((string) $request->id, 4, '0', STR_PAD_LEFT),
                'zone_classification' => self::ZONE_CLASSIFICATIONS[array_rand(self::ZONE_CLASSIFICATIONS)],
                'right_over_land' => 'Owner',
                'existing_land_use' => self::ZONE_CLASSIFICATIONS[array_rand(self::ZONE_CLASSIFICATIONS)],
            ]);

            $officer = $this->officers[array_rand($this->officers)];

            $report = Report::create([
                'request_id' => $request->id,
                'evaluation' => 'pending',
                'date_reported' => $filedAt,
                'issued_by' => $officer->name,
                'reviewed_by' => $officer->id,
                'payment_amount' => 0,
            ]);

            $this->attachRequirementDocuments($request, $type);

            $payment = null;
            $certificate = null;

            foreach ($timeline as $step) {
                Carbon::setTestNow($filedAt->copy()->addDays($step['day'])->setTime(rand(8, 16), rand(0, 59)));

                $request->status = $step['status'];
                if (array_key_exists('evaluation', $step)) {
                    $report->evaluation = $step['evaluation'];
                }
                if ($step['status'] === 'approved') {
                    $report->approved_by = $this->administrator->name;
                    $report->approved_at = now();
                    $request->decision_number = RequestModel::generateDecisionNumber($type, $filedAt);
                }
                if ($step['status'] === 'released') {
                    $request->released_to_applicant_at = now();
                    $request->released_by = $officer->id;
                }

                $report->save();
                $request->save();

                if ($step['status'] === 'payment_confirmed') {
                    $payment = Payment::create([
                        'request_id' => $request->id,
                        'user_id' => $applicant->user_id,
                        'amount' => rand(500, 5000),
                        'payment_method' => 'cash',
                        'receipt_number' => 'OR-' . now()->format('Ymd') . '-' . $request->id,
                        'payment_date' => now()->toDateString(),
                        'payment_status' => 'verified',
                        'verified_by' => $officer->id,
                        'verified_at' => now(),
                    ]);
                }

                // A certificate needs a verified payment to appear on the
                // Certificates page at all (CertificateService::getAllCertificates
                // only lists ones whose payment relation is verified).
                if ($step['status'] === 'certificate_ready' && $payment) {
                    $certificate = $this->issueCertificate($request, $officer, $payment, ready: true);
                }

                if ($step['status'] === 'released' && $payment) {
                    $certificate ??= $this->issueCertificate($request, $officer, $payment, ready: true);
                    $certificate->update([
                        'status' => 'released',
                        'released_at' => now(),
                        'released_by' => $officer->id,
                        'released_to_name' => $applicant->applicant_name,
                        'released_to_id_type' => "Driver's License",
                        'released_to_id_number' => 'DL-' . rand(1000000, 9999999),
                    ]);
                }
            }
        } finally {
            Carbon::setTestNow();
        }
    }

    /**
     * The steps to play, in order, to bring a freshly-filed ('pending')
     * application to the given target status. Each step's 'evaluation' key
     * is present only when the report's evaluation actually changes at that
     * step - once a request enters the payment/certificate lifecycle,
     * reports.evaluation stays frozen at 'approved' (see
     * Request::CERT_LIFECYCLE_STATUSES), so those steps omit it.
     */
    private function timelineFor(string $target): array
    {
        $reviewed = ['day' => 2, 'status' => 'reviewed', 'evaluation' => 'reviewed'];
        $approved = ['day' => 4, 'status' => 'approved', 'evaluation' => 'approved'];

        return match ($target) {
            'pending' => [],
            'reviewed' => [$reviewed],
            'in_applicant' => [['day' => 3, 'status' => 'in_applicant', 'evaluation' => null]],
            'rejected' => [$reviewed, ['day' => 4, 'status' => 'rejected', 'evaluation' => 'rejected']],
            'approved' => [$reviewed, $approved],
            'payment_confirmed' => [$reviewed, $approved, ['day' => 6, 'status' => 'payment_confirmed']],
            'certificate_ready' => [$reviewed, $approved, ['day' => 6, 'status' => 'payment_confirmed'], ['day' => 7, 'status' => 'certificate_ready']],
            'released' => [$reviewed, $approved, ['day' => 6, 'status' => 'payment_confirmed'], ['day' => 7, 'status' => 'certificate_ready'], ['day' => 10, 'status' => 'released']],
            default => [],
        };
    }

    /** Find-or-create the demo account and applicant record for this name. */
    private function applicantFor(string $name): Applicant
    {
        if (isset($this->applicantsByName[$name])) {
            return $this->applicantsByName[$name];
        }

        $email = Str::slug($name, '.') . '@example.com';

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'user_type' => 'applicant',
                'password' => bcrypt(self::DEMO_PASSWORD),
                'contact_number' => '09' . rand(100000000, 999999999),
                'email_verified_at' => now(),
            ]
        );

        $applicant = Applicant::firstOrCreate(
            ['user_id' => $user->id],
            [
                'applicant_name' => $name,
                'applicant_address' => 'Purok ' . rand(1, 7) . ', ' . self::BARANGAYS[array_rand(self::BARANGAYS)] . ', City of Ilagan, Isabela',
                'applicant_contact' => $user->contact_number,
                'applicant_type' => 'individual',
            ]
        );

        return $this->applicantsByName[$name] = $applicant;
    }

    /**
     * A tiny (1x1 PNG) scan for every main requirement slot the project type
     * asks for - enough that Document Verification and Application Details
     * show a filled checklist instead of an empty one, without shipping real
     * asset files for demo data.
     */
    private function attachRequirementDocuments(RequestModel $request, string $type): void
    {
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');

        foreach (ApplicationRequirements::getRequirements($type) as $requirement) {
            if (($requirement['section'] ?? 'main') !== 'main' || !empty($requirement['is_group'])) {
                continue;
            }

            $path = "requirement_documents/demo_{$request->id}_{$requirement['id']}.png";
            Storage::disk('local')->put($path, $png);

            RequirementDocument::create([
                'request_id' => $request->id,
                'requirement_id' => $requirement['id'],
                'requirement_name' => $requirement['name'],
                'file_path' => $path,
                'original_filename' => Str::slug($requirement['name']) . '.png',
                'mime_type' => 'image/png',
                'file_size' => strlen($png),
            ]);
        }
    }

    private function issueCertificate(RequestModel $request, User $officer, Payment $payment, bool $ready): Certificate
    {
        return Certificate::create([
            'request_id' => $request->id,
            'payment_id' => $payment->id,
            'user_id' => $request->user_id,
            'certificate_number' => $this->certificateService->generateCertificateNumber(),
            'issued_by' => $officer->id,
            'issued_at' => now(),
            'valid_until' => now()->addMonths(CertificateService::validityMonths() ?: 12),
            'status' => $ready ? 'ready_for_pickup' : 'preparing',
            'ready_at' => $ready ? now() : null,
            'notes' => 'Demo data',
        ]);
    }
}
