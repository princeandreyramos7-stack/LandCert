<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Serves the pages that used to carry a role prefix and an application id from
 * plain URLs: "/super-admin/requests/4/generate-clearance" reads simply
 * "/generate-clearance", and "/admin/requests/4/view-application" reads
 * "/view-application".
 *
 * The id still has to come from somewhere, so it comes from the session. The
 * id-bearing routes remain the way in — each records which record is being
 * opened and forwards to the clean address — and this controller then hands off
 * to whichever controller already builds that page for the signed-in role, so
 * every page keeps one implementation rather than gaining a second.
 *
 * The trade, which is inherent to an address with no identifier in it: two of
 * the same kind of page open in two tabs share one session slot, so refreshing
 * the older tab shows the newer record, and a copied link resolves to whatever
 * the recipient last opened. Each kind of page keeps its own key so different
 * pages do not collide with each other.
 *
 * File responses — downloads, previews, the authorization letter — are
 * deliberately left on their id-bearing routes. They are fetched rather than
 * browsed, several can be in flight at once, and a single session slot would
 * make them collide.
 */
class CleanPageController extends Controller
{
    private const SESSION_PREFIX = 'clean_page.';

    /**
     * slug => [method, controller per role].
     *
     * "*" is the fallback controller for any role without its own entry, which
     * is how the applicant-facing pages and the shared ones are covered.
     */
    private const PAGES = [
        'generate-clearance' => [
            'method' => 'generateClearance',
            'controllers' => ['super_admin' => SuperAdminController::class, '*' => AdminController::class],
        ],
        'generate-certificate' => [
            'method' => 'generateCertificate',
            'controllers' => ['super_admin' => SuperAdminController::class, '*' => AdminController::class],
        ],
        'order-of-payment' => [
            'method' => 'generateOrderOfPayment',
            'controllers' => [
                'super_admin' => SuperAdminController::class,
                'admin' => AdminController::class,
                '*' => RequestController::class,
            ],
        ],
        'print-form' => [
            'method' => 'printForm',
            'controllers' => ['*' => AdminController::class],
        ],
        'view-application' => [
            'method' => 'viewApplication',
            'controllers' => ['super_admin' => SuperAdminController::class, '*' => AdminController::class],
        ],
        'review-application' => [
            'method' => 'reviewRequest',
            'controllers' => ['super_admin' => SuperAdminController::class, '*' => AdminController::class],
        ],
        'document-verification' => [
            'method' => 'documentVerification',
            'controllers' => ['super_admin' => SuperAdminController::class, '*' => AdminController::class],
        ],
        'application-details' => [
            'method' => 'showApplication',
            'controllers' => ['*' => RequestController::class],
        ],
        'edit-application' => [
            'method' => 'edit',
            'controllers' => ['*' => RequestController::class],
        ],
        'payment-details' => [
            'method' => 'show',
            'controllers' => ['*' => PaymentController::class],
        ],
        'certificate-details' => [
            'method' => 'show',
            'controllers' => ['*' => CertificateController::class],
        ],
        'edit-user' => [
            'method' => 'editUser',
            'controllers' => ['*' => SuperAdminController::class],
        ],
        'upload-receipt' => [
            'method' => 'uploadReceiptPage',
            'controllers' => ['*' => PaymentController::class],
        ],
    ];

    /**
     * Pages with no record id — the list and section screens. Same idea, but
     * nothing to remember: the slug alone identifies the page, and the role
     * decides which controller builds it.
     */
    private const SECTIONS = [
        'dashboard-panel' => ['method' => 'dashboard', 'controllers' => ['super_admin' => SuperAdminController::class, 'admin' => AdminController::class]],
        'applications'    => ['method' => 'requests',  'controllers' => ['super_admin' => SuperAdminController::class, 'admin' => AdminController::class]],
        'payments'        => ['method' => 'payments',  'controllers' => ['super_admin' => SuperAdminController::class, 'admin' => AdminController::class]],
        'certificates'    => ['method' => 'index',     'controllers' => ['*' => CertificateController::class]],
        'users'           => ['method' => 'users',     'controllers' => ['super_admin' => SuperAdminController::class, 'admin' => AdminController::class]],
        'audit-logs'      => ['method' => 'auditLogs', 'controllers' => ['super_admin' => SuperAdminController::class, 'admin' => AdminController::class]],
        'sms-broadcast'   => ['method' => 'index',     'controllers' => ['*' => SmsController::class]],
    ];

    /** Slugs for the section pages. */
    public static function sectionSlugs(): array
    {
        return array_keys(self::SECTIONS);
    }

    /** Render a section page for whoever is signed in. */
    public function section(Request $request, string $slug)
    {
        $section = self::SECTIONS[$slug] ?? null;

        if (!$section) {
            abort(404);
        }

        $role = $request->user()?->user_type;
        $controller = $section['controllers'][$role] ?? ($section['controllers']['*'] ?? null);

        // A role with no entry on this page has no business on it.
        if (!$controller) {
            abort(403);
        }

        return app($controller)->{$section['method']}($request);
    }

    /** Every clean slug, for route registration. */
    public static function slugs(): array
    {
        return array_keys(self::PAGES);
    }

    /**
     * Record which record a page is for, and return the clean URL to send the
     * browser to. Called by the id-bearing entry routes.
     */
    public static function remember(Request $request, string $slug, $id): string
    {
        $request->session()->put(self::SESSION_PREFIX . $slug, $id);

        return '/' . $slug;
    }

    public function show(Request $request, string $slug)
    {
        $page = self::PAGES[$slug] ?? null;

        if (!$page) {
            abort(404);
        }

        $id = $request->session()->get(self::SESSION_PREFIX . $slug);

        if (!$id) {
            return redirect($this->homeFor($request))
                ->with('error', 'Open that page from the list so the system knows which record you mean.');
        }

        $role = $request->user()?->user_type;
        $controller = $page['controllers'][$role] ?? $page['controllers']['*'];

        return app($controller)->{$page['method']}($id);
    }

    /** Where to send someone who arrives without a record in their session. */
    private function homeFor(Request $request): string
    {
        return match ($request->user()?->user_type) {
            'super_admin', 'admin' => '/applications',
            default => '/my-applications',
        };
    }
}
