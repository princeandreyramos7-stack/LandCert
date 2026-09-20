import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

/**
 * Is a page navigation in flight, and where is it going?
 *
 * Inertia leaves the page you are on standing until the next one arrives, so
 * on a fast connection there is nothing to show and nothing to wait for.
 * Covering that with a skeleton every time would make the system feel slower
 * than it is. So the answer only turns true once a visit has been running
 * longer than `delay` - by which point the wait is real and the applicant
 * deserves to be told - and the destination comes back with it so the caller
 * can draw the shape of the page that is coming.
 *
 * A partial reload (the live-refresh poll, a filter fetching only its list)
 * is deliberately excluded: those repaint a corner of the screen and must
 * never blank the page out from under someone who is reading it.
 */

const DEFAULT_DELAY = 220;

export function usePageLoading({ delay = DEFAULT_DELAY } = {}) {
    const [state, setState] = useState({ loading: false, url: null });

    useEffect(() => {
        let timer = null;

        const clear = () => {
            if (timer) clearTimeout(timer);
            timer = null;
        };

        const onStart = (event) => {
            const visit = event.detail?.visit;

            // `only` marks a partial reload; the live poll sets it.
            if (visit?.only?.length) return;
            // A download leaves the page where it is.
            if (visit?.method && visit.method.toLowerCase() !== "get") return;

            const url = visit?.url?.pathname ?? null;

            clear();
            timer = setTimeout(() => setState({ loading: true, url }), delay);
        };

        const onDone = () => {
            clear();
            setState((prev) => (prev.loading ? { loading: false, url: null } : prev));
        };

        const off = [
            router.on("start", onStart),
            router.on("finish", onDone),
            // `finish` covers success, failure and cancellation, but an
            // invalid or expired session answers with a hard redirect that
            // never reaches it. Unloading the document clears it too.
            router.on("invalid", onDone),
            router.on("exception", onDone),
        ];

        return () => {
            clear();
            off.forEach((stop) => typeof stop === "function" && stop());
        };
    }, [delay]);

    return state;
}

/**
 * True while `promise`-style work runs, but only after `delay`.
 *
 * The same reasoning as above for the small waits inside a page: a save that
 * comes back in 80ms should not flash a skeleton, and one that takes two
 * seconds should not look frozen. Pass the raw boolean in, render the
 * skeleton on what comes out.
 */
export function useDelayedFlag(active, delay = DEFAULT_DELAY) {
    const [shown, setShown] = useState(false);

    useEffect(() => {
        if (!active) {
            setShown(false);
            return;
        }

        const timer = setTimeout(() => setShown(true), delay);
        return () => clearTimeout(timer);
    }, [active, delay]);

    return shown;
}
