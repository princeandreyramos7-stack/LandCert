/**
 * CSRF credentials for hand-rolled fetch() calls.
 *
 * Anything going through Inertia's router already handles this: axios reads the
 * XSRF-TOKEN cookie on every request. Code that calls fetch() directly has to
 * do it itself, and the obvious source — <meta name="csrf-token"> — is a trap.
 *
 * Blade renders that meta tag once, when the HTML shell loads. This is an
 * Inertia SPA, so the shell is never re-rendered on a client-side navigation,
 * while Laravel *rotates* the CSRF token whenever the session is regenerated —
 * which it does on login. After signing in, the meta tag therefore still holds
 * the pre-login token, and posting with it fails as "419 CSRF token mismatch".
 *
 * The XSRF-TOKEN cookie does not have that problem: Laravel rewrites it on
 * every response, so it always carries the current token.
 */

function cookieToken() {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="));

    return match
        ? decodeURIComponent(match.slice("XSRF-TOKEN=".length))
        : null;
}

function metaToken() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || null
    );
}

/**
 * Headers to merge into a fetch() call.
 *
 * The two tokens travel in different headers: the cookie holds the *encrypted*
 * token, which Laravel decrypts from X-XSRF-TOKEN, while the meta tag holds the
 * raw session token, read from X-CSRF-TOKEN. Sending the wrong one in the wrong
 * header fails the check.
 */
export function csrfHeaders() {
    const cookie = cookieToken();
    if (cookie) return { "X-XSRF-TOKEN": cookie };

    const meta = metaToken();
    return meta ? { "X-CSRF-TOKEN": meta } : {};
}

/**
 * True when a token could be found at all. A request with neither is going to
 * be rejected, so callers can fail early with a "refresh the page" message
 * instead of surfacing a raw 419.
 */
export function hasCsrfToken() {
    return Boolean(cookieToken() || metaToken());
}

/**
 * Asks the server for a fresh token. Responding also rewrites the XSRF-TOKEN
 * cookie, so the next csrfHeaders() picks the new value up on its own.
 */
async function refreshCsrfToken() {
    try {
        const response = await fetch("/csrf-token", {
            headers: { Accept: "application/json" },
            credentials: "same-origin",
            cache: "no-store",
        });
        if (!response.ok) return null;

        const body = await response.json();
        return body?.token || null;
    } catch {
        return null;
    }
}

/**
 * fetch() with the CSRF check handled, including one automatic retry.
 *
 * A form left open long enough can outlive its token — the session gets
 * regenerated or expires underneath it — and the request comes back 419. That
 * used to mean the applicant pressed Submit, saw nothing happen, and pressed it
 * again. Here the token is refreshed and the request replayed once, so the
 * first press is the only one needed.
 *
 * Retrying is safe: a 419 is rejected by middleware before it reaches a
 * controller, so nothing was written the first time round.
 */
export async function fetchWithCsrf(url, options = {}) {
    const send = () =>
        fetch(url, {
            ...options,
            credentials: "same-origin",
            headers: { ...(options.headers || {}), ...csrfHeaders() },
        });

    const response = await send();
    if (response.status !== 419) return response;

    const refreshed = await refreshCsrfToken();
    if (!refreshed) return response;

    // A `_token` field in the body outranks every header, so a stale one left
    // over from the first attempt would defeat the retry.
    if (options.body instanceof FormData && options.body.has("_token")) {
        options.body.set("_token", refreshed);
    }

    return send();
}

/**
 * Laravel reads `_token` from the request body *before* it looks at any header,
 * so a stale `_token` field silently overrides a correct header. Only the raw
 * session token is valid there — the cookie's value is encrypted — so when the
 * meta tag is all we have, use it; otherwise leave the field off entirely and
 * let the X-XSRF-TOKEN header carry the check.
 */
export function appendCsrfField(formData) {
    const meta = metaToken();
    if (meta && !cookieToken()) formData.append("_token", meta);
    return formData;
}
