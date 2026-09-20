import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/Components/ui/use-toast";

/**
 * Show the result now; put it right if the server disagrees.
 *
 * The office works down a checklist of a dozen requirements, ticking each
 * one. Waiting for a round trip between ticks turns a ten-second job into a
 * minute of watching spinners, and on the counter's connection it is worse.
 * These hooks paint the change immediately, send the request behind it, and
 * roll back with an explanation if it fails - so the only time anyone waits
 * is the time something actually went wrong.
 *
 * Rolling back matters as much as the speed. A tick that silently did not
 * save is worse than one that was slow: the clerk moves on believing the
 * document is verified. Every failure here restores the old value on screen
 * and says so out loud.
 */

/** Pull a sentence out of whatever the server or the network handed back. */
function reasonFrom(error, fallback) {
    const status = error?.response?.status;

    if (status === 419) return "Your session expired. Reload the page and sign in again.";
    if (status === 403) return "You are not allowed to do that.";
    if (status === 422) {
        const errors = error?.response?.data?.errors;
        const first = errors && Object.values(errors)[0];
        return (Array.isArray(first) ? first[0] : first) || "That change was rejected.";
    }
    if (status === 429) return "Too many changes at once. Wait a moment and try again.";
    if (status >= 500) return "The server could not save that. Please try again.";
    if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
        return "No connection. The change was not saved.";
    }

    return error?.response?.data?.message || fallback;
}

/**
 * One value that the screen may run ahead of.
 *
 * @param {*} serverValue   what the server last told us
 * @param {object} options
 * @param {string} options.label  what is being changed, for the failure notice
 * @returns {[*, function, boolean]} the value to render, a commit function, and
 *          whether a request is still in flight
 */
export function useOptimisticValue(serverValue, { label = "change" } = {}) {
    // null means "nothing pending, trust the server".
    const [draft, setDraft] = useState(null);
    const [saving, setSaving] = useState(false);
    const inFlight = useRef(0);

    // A reload, a live refresh, or another user's edit arriving: once the
    // server speaks with no request of ours outstanding, it wins.
    useEffect(() => {
        if (inFlight.current === 0) setDraft(null);
    }, [serverValue]);

    const commit = useCallback(
        async (next, send) => {
            const previous = serverValue;

            setDraft(next);
            setSaving(true);
            inFlight.current += 1;

            try {
                const result = await send(next);
                // Success: let the server's own value take over again.
                setDraft(null);
                return result;
            } catch (error) {
                setDraft(previous);
                toast({
                    variant: "destructive",
                    title: `Could not save the ${label}`,
                    description: reasonFrom(error, "The change was put back."),
                });
                // Nothing is pending any more, so the next server value wins.
                setDraft(null);
                throw error;
            } finally {
                inFlight.current -= 1;
                if (inFlight.current === 0) setSaving(false);
            }
        },
        [serverValue, label],
    );

    return [draft === null ? serverValue : draft, commit, saving];
}

/**
 * A list the screen may run ahead of: mark one row read, remove another.
 *
 * `key` names the identifying field, so a row that comes back from the server
 * renumbered is still recognised as the same row.
 */
export function useOptimisticList(serverList, { key = "id", label = "change" } = {}) {
    const [overrides, setOverrides] = useState(() => new Map());
    const [removed, setRemoved] = useState(() => new Set());
    const inFlight = useRef(0);

    useEffect(() => {
        if (inFlight.current !== 0) return;
        setOverrides(new Map());
        setRemoved(new Set());
    }, [serverList]);

    const list = (Array.isArray(serverList) ? serverList : [])
        .filter((row) => !removed.has(row?.[key]))
        .map((row) => {
            const patch = overrides.get(row?.[key]);
            return patch ? { ...row, ...patch } : row;
        });

    const run = useCallback(
        async (send, undo) => {
            inFlight.current += 1;
            try {
                return await send();
            } catch (error) {
                undo();
                toast({
                    variant: "destructive",
                    title: `Could not save the ${label}`,
                    description: reasonFrom(error, "The list was put back."),
                });
                throw error;
            } finally {
                inFlight.current -= 1;
            }
        },
        [label],
    );

    /** Merge `patch` into the row with this id, then send. */
    const patchRow = useCallback(
        (id, patch, send) => {
            setOverrides((map) => new Map(map).set(id, { ...map.get(id), ...patch }));

            return run(send, () =>
                setOverrides((map) => {
                    const next = new Map(map);
                    next.delete(id);
                    return next;
                }),
            );
        },
        [run],
    );

    /** Take the row off the screen, then send. */
    const removeRow = useCallback(
        (id, send) => {
            setRemoved((set) => new Set(set).add(id));

            return run(send, () =>
                setRemoved((set) => {
                    const next = new Set(set);
                    next.delete(id);
                    return next;
                }),
            );
        },
        [run],
    );

    /** Apply the same patch to every row, then send. Used by "mark all read". */
    const patchAll = useCallback(
        (patch, send) => {
            const ids = (Array.isArray(serverList) ? serverList : []).map((r) => r?.[key]);
            setOverrides((map) => {
                const next = new Map(map);
                ids.forEach((id) => next.set(id, { ...next.get(id), ...patch }));
                return next;
            });

            return run(send, () => setOverrides(new Map()));
        },
        [run, serverList, key],
    );

    return { list, patchRow, removeRow, patchAll };
}
