<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Serves the printable documents from a plain URL.
 *
 * The office asked that these pages not expose the route structure or the
 * application's id, so "/super-admin/requests/4/generate-clearance" reads simply
 * "/generate-clearance". The id has to live somewhere, so it lives in the
 * session: the list page links to the id-bearing entry route, which records
 * which application is being opened and forwards to the clean address.
 *
 * A refresh still works, because the session outlives the navigation. What this
 * cannot support is two documents of the same kind open in two tabs — the second
 * overwrites the first, so refreshing the older tab shows the newer document —
 * or a link pasted to somebody else, which will resolve to whatever they last
 * opened rather than to the document that was shared. That is the trade for a
 * bare URL, and each kind of document keeps its own key so a clearance and a
 * certificate at least do not collide with each other.
 */
class DocumentPageController extends Controller
{
    /** Session key prefix, one slot per kind of document. */
    private const SESSION_PREFIX = 'document_page.';

    /**
     * Record which application a document page is for, then send the browser to
     * the clean URL. Called by the id-bearing entry routes.
     */
    public static function remember(Request $request, string $document, $id): string
    {
        $request->session()->put(self::SESSION_PREFIX . $document, $id);

        return '/' . $document;
    }

    public function clearance(Request $request)
    {
        return $this->render($request, 'generate-clearance', 'generateClearance');
    }

    public function certificate(Request $request)
    {
        return $this->render($request, 'generate-certificate', 'generateCertificate');
    }

    public function orderOfPayment(Request $request)
    {
        return $this->render($request, 'order-of-payment', 'generateOrderOfPayment');
    }

    public function printForm(Request $request)
    {
        return $this->render($request, 'print-form', 'printForm');
    }

    /**
     * Hand off to whichever controller already builds this page for the signed-in
     * role, so the documents keep exactly one implementation each.
     */
    private function render(Request $request, string $document, string $method)
    {
        $id = $request->session()->get(self::SESSION_PREFIX . $document);

        if (!$id) {
            return redirect($this->listUrlFor($request))
                ->with('error', 'Open the document from the application list.');
        }

        $controller = match ($request->user()?->user_type) {
            'super_admin' => SuperAdminController::class,
            'admin' => AdminController::class,
            default => $method === 'generateOrderOfPayment'
                ? RequestController::class
                : AdminController::class,
        };

        // printForm lives on AdminController for every role.
        if ($method === 'printForm') {
            $controller = AdminController::class;
        }

        return app($controller)->{$method}($id);
    }

    /** Where to send someone who arrives without a document in their session. */
    private function listUrlFor(Request $request): string
    {
        return match ($request->user()?->user_type) {
            'super_admin' => '/super-admin/requests',
            'admin' => '/admin/requests',
            default => '/my-applications',
        };
    }
}
