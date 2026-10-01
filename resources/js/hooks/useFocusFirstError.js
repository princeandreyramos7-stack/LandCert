import { useEffect } from "react";

/**
 * Moves keyboard focus to the first invalid field (falling back to an
 * error-summary element marked with data-error-summary) whenever a new set
 * of Inertia validation errors appears, and scrolls it into view. Without
 * this, a failed submit can render its errors off-screen with nothing
 * telling the applicant, sighted or not, where to look.
 *
 * Generalizes the two divergent one-off patterns already in this codebase
 * (Profile/Edit.jsx's manual useRef + onError, and Request_form/index.jsx's
 * local scrollToFirstError) into one shared hook for pages that didn't have
 * either.
 */
export function useFocusFirstError(errors) {
    useEffect(() => {
        const firstKey = Object.keys(errors || {})[0];
        if (!firstKey) return;

        // Prefer id over name: at least one form in this app (Login) gives its
        // inputs a decoy `name` to defeat browser autofill, while `id` always
        // matches the useForm key the error is reported under.
        let field = null;
        try {
            field = document.getElementById(firstKey) || document.querySelector(`[name="${firstKey}"]`);
        } catch {
            // A key with characters CSS can't use as a plain id/name selector
            // (e.g. "requirement_uploads.3") - fall through to the summary.
        }
        const target = field || document.querySelector("[data-error-summary]");
        if (!target) return;

        target.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof target.focus === "function") {
            target.focus({ preventScroll: true });
        }
    }, [errors]);
}
