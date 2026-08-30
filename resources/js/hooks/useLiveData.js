import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";

/**
 * Keeps Inertia page props fresh without a manual browser refresh.
 *
 * This is deliberately polling rather than WebSockets: the project has no
 * broadcast driver configured (BROADCAST_CONNECTION=log) and no Echo/Reverb
 * client, so a socket-based feed would need a long-running server process that
 * silently takes the feature down whenever it is not running. A partial Inertia
 * reload asks only for the props named in `only`, so each poll is one small
 * query rather than a full page render.
 *
 * Polling pauses while the tab is hidden, so a dashboard left open in a
 * background tab stops hitting the database until the user returns to it.
 *
 * @param {object}   options
 * @param {string[]} options.only      Inertia props to refresh (required — never reload everything).
 * @param {number}   options.interval  Milliseconds between polls. Default 15s.
 * @param {boolean}  options.enabled   Set false to suspend polling.
 * @returns {{ lastUpdated: Date|null, isRefreshing: boolean, refreshNow: function }}
 */
export function useLiveData({ only, interval = 15000, enabled = true } = {}) {
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Guard against overlapping polls on a slow connection.
    const inFlight = useRef(false);

    const refreshNow = useCallback(() => {
        if (inFlight.current || !only?.length) return;

        inFlight.current = true;
        setIsRefreshing(true);

        router.reload({
            only,
            // Keep the user exactly where they are: no scroll jump, no lost
            // filter/search/dialog state while they are working.
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setLastUpdated(new Date()),
            onFinish: () => {
                inFlight.current = false;
                setIsRefreshing(false);
            },
        });
    }, [only]);

    useEffect(() => {
        if (!enabled || !only?.length) return undefined;

        let timer = null;

        const start = () => {
            stop();
            timer = setInterval(() => {
                if (document.visibilityState === "visible") refreshNow();
            }, interval);
        };

        const stop = () => {
            if (timer) clearInterval(timer);
            timer = null;
        };

        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                // Catch up immediately on return, then resume the cadence.
                refreshNow();
                start();
            } else {
                stop();
            }
        };

        start();
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            stop();
            document.removeEventListener("visibilitychange", handleVisibility);
        };
        // `only` is a stable literal at every call site; refreshNow closes over it.
    }, [enabled, interval, refreshNow]);

    return { lastUpdated, isRefreshing, refreshNow };
}

/**
 * Counts how many items appeared since the list was first rendered, so the UI
 * can surface "3 new applications" instead of silently swapping rows.
 *
 * @param {Array} items      Current list (paginated `.data` or a plain array).
 * @param {string} idKey     Unique key on each item. Default "id".
 */
export function useNewItemCount(items = [], idKey = "id") {
    const list = Array.isArray(items) ? items : (items?.data ?? []);

    // Ids present on first render — anything beyond this is "new".
    const seen = useRef(null);
    const [newIds, setNewIds] = useState([]);

    useEffect(() => {
        const ids = list.map((item) => item?.[idKey]).filter((v) => v !== undefined);

        if (seen.current === null) {
            seen.current = new Set(ids);
            return;
        }

        const fresh = ids.filter((id) => !seen.current.has(id));
        if (fresh.length) {
            setNewIds((prev) => Array.from(new Set([...prev, ...fresh])));
        }
    }, [list, idKey]);

    const acknowledge = useCallback(() => {
        const ids = list.map((item) => item?.[idKey]).filter((v) => v !== undefined);
        seen.current = new Set(ids);
        setNewIds([]);
    }, [list, idKey]);

    return { newCount: newIds.length, newIds, acknowledge };
}
