import { fetchWithCsrf } from "@/lib/csrf";

/**
 * A bounded retry for a smaller, one-shot write - a document upload, a
 * payment recorded at the counter - where indefinitely retrying like
 * fetchUntilOnline (built for the one big Submit on the application form)
 * would be the wrong shape: these calls run inline in a table row or a
 * modal with no cancel affordance of their own, so a few quick attempts and
 * then handing the failure back to the caller is more honest than hanging
 * forever.
 *
 * Only retries when the request never reached the server (a thrown network
 * error) - axios and fetch both signal that distinctly from an HTTP error
 * response, which resolves/returns normally and is never retried here: the
 * server already answered that one, and resending risks whatever the
 * caller's own duplicate-submission story does not already cover.
 */
export async function withNetworkRetry(fn, { retries = 2, delayMs = 1200 } = {}) {
    let attempt = 0;

    for (;;) {
        try {
            return await fn();
        } catch (error) {
            if (attempt >= retries || !isNetworkError(error)) {
                throw error;
            }
            attempt += 1;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
}

function isNetworkError(error) {
    // axios: set on every error it throws; true only when no response ever
    // came back (a timeout, a dropped connection, offline).
    if (error?.isAxiosError) return !error.response;
    // fetch(): rejects with a TypeError for a network failure; any HTTP
    // status, even 4xx/5xx, resolves instead of rejecting.
    return error instanceof TypeError;
}

/**
 * Wraps fetchWithCsrf so a dropped connection during Submit doesn't lose the
 * application.
 *
 * Only a genuinely failed request - the browser could not even reach the
 * server (offline, DNS dropped, connection reset) - is retried; fetch()
 * throws for that instead of resolving. A request that DID reach the
 * server, even with a 4xx or 5xx answer, resolves normally and is returned
 * as-is without a retry: the server already answered, and resending that
 * without asking risks a duplicate submission. Retrying the network failure
 * itself is safe - the same FormData, files included, can be sent again
 * unchanged; nothing about a failed send consumes or corrupts it.
 *
 * Retries until it succeeds or `signal` is aborted. `onStateChange` is told
 * 'waiting' the moment a network failure is hit and 'retrying' right before
 * each attempt after the first, so the UI can show what is happening
 * instead of looking stuck.
 */
export async function fetchUntilOnline(url, options, { signal, onStateChange } = {}) {
    let attempt = 0;

    for (;;) {
        if (signal?.aborted) {
            throw new DOMException('Submission cancelled', 'AbortError');
        }

        try {
            const response = await fetchWithCsrf(url, options);
            if (attempt > 0) {
                onStateChange?.('recovered', { attempt });
            }
            return response;
        } catch (error) {
            attempt += 1;
            onStateChange?.('waiting', { attempt, error });

            await waitBeforeRetry(signal);

            if (signal?.aborted) {
                throw new DOMException('Submission cancelled', 'AbortError');
            }
            onStateChange?.('retrying', { attempt });
        }
    }
}

/**
 * Resolves on whichever comes first: the browser's 'online' event, a fixed
 * backstop delay, or cancellation. 'online' only means the network
 * interface came back - not that the server itself is reachable again, and
 * it does not fire reliably in every browser - so the backstop keeps this
 * retrying on a steady cadence even without it.
 */
function waitBeforeRetry(signal) {
    return new Promise((resolve) => {
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            window.removeEventListener('online', finish);
            signal?.removeEventListener('abort', finish);
            clearTimeout(timer);
            resolve();
        };

        window.addEventListener('online', finish);
        signal?.addEventListener('abort', finish);
        const timer = setTimeout(finish, 4000);
    });
}
