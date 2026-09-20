<?php

namespace App\Http\Controllers;

use App\Support\LegalDocuments;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * The published notices: privacy, terms, cookies, refunds.
 *
 * Public on purpose. Someone deciding whether to create an account has to be
 * able to read what they are agreeing to before they agree to it, and a
 * privacy notice locked behind a sign-in is not a notice at all.
 */
class LegalController extends Controller
{
    /** One notice. */
    public function show(Request $request, string $document): Response
    {
        $doc = LegalDocuments::get($document);

        if ($doc === null) {
            throw new NotFoundHttpException('No such notice.');
        }

        return Inertia::render('Legal/Show', [
            'doc' => $doc,
            // The other three, for the links along the top of the page.
            'documents' => LegalDocuments::index(),
        ]);
    }
}
