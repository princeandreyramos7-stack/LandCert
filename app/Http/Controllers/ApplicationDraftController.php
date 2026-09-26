<?php

namespace App\Http\Controllers;

use App\Models\ApplicationDraft;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * An applicant's one in-progress New Application, saved on the server so it
 * survives closing the browser or switching devices - not just a refresh
 * (see resources/js/lib/requestDraft.js for that, which also keeps
 * attached files, entirely in the browser). This keeps the typed answers
 * and which step the applicant was on - not the files themselves; see the
 * migration for why.
 */
class ApplicationDraftController extends Controller
{
    /** Whatever this account has saved, or null if it never has. */
    public function show(Request $request)
    {
        $draft = ApplicationDraft::where('user_id', $request->user()->id)->first();

        // Wrapped, not a bare null/object, since response()->json(null)
        // does not reliably serialize as JSON null across Laravel/Symfony
        // versions - this way "no draft" is never ambiguous with one.
        if (!$draft) {
            return response()->json(['draft' => null]);
        }

        return response()->json(['draft' => [
            'data' => $draft->data,
            'current_step' => $draft->current_step,
            'completed_steps' => $draft->completed_steps ?? [],
            'has_representative' => $draft->has_representative,
            'saved_at' => $draft->updated_at?->toIso8601String(),
        ]]);
    }

    /**
     * Save or replace this account's draft. Called on a debounce as the
     * applicant fills the form in, not on every keystroke - see the
     * front-end's own debounce in Request_form/index.jsx.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'data' => 'required|array',
            'current_step' => 'required|integer|min:1|max:4',
            'completed_steps' => 'nullable|array',
            'has_representative' => 'nullable|boolean',
        ]);

        // A cap on the payload itself, not any one field: this is typed
        // answers, not a place to smuggle in something the size of a file
        // (those are rejected by their own upload rules and never reach here).
        if (strlen(json_encode($validated['data'])) > 200_000) {
            throw ValidationException::withMessages([
                'data' => 'That is too much to save as a draft.',
            ]);
        }

        ApplicationDraft::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'data' => $validated['data'],
                'current_step' => $validated['current_step'],
                'completed_steps' => $validated['completed_steps'] ?? [],
                'has_representative' => $validated['has_representative'] ?? false,
            ]
        );

        return response()->json(['ok' => true]);
    }

    /** Filed, or the applicant chose to discard it - either way, gone. */
    public function destroy(Request $request)
    {
        ApplicationDraft::where('user_id', $request->user()->id)->delete();

        return response()->json(['ok' => true]);
    }
}
