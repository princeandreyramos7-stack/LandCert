/**
 * Which sidebar entry owns the page on screen.
 *
 * Every staff page is served from a clean address - /applications rather
 * than /admin/requests, /dashboard-panel rather than /admin/dashboard (see
 * App\Http\Controllers\CleanPageController) - so comparing the address bar
 * with the role-prefixed link in the sidebar never matched and nothing was
 * ever highlighted. The entries now carry the address they actually land
 * on, plus the detail pages that belong under them: viewing an application
 * keeps "Applications" lit, generating a certificate keeps "Certificates".
 *
 * The longest match wins, so a detail page under one section cannot be
 * claimed by a shorter address in another.
 */

/** Does `path` sit at or under `candidate`? */
function covers(path, candidate) {
    if (!candidate) return false;
    const base = candidate.endsWith("/") ? candidate.slice(0, -1) : candidate;
    return path === base || path.startsWith(base + "/");
}

/**
 * The `url` of the entry that owns this path, or null when none does.
 *
 * @param {Array<{items: Array<{url?: string, matches?: string[]}>}>} groups
 * @param {string} path  window.location.pathname
 */
export function activeNavUrl(groups, path) {
    let best = null;
    let bestLength = -1;

    for (const group of groups) {
        for (const item of group.items || []) {
            for (const candidate of [item.url, ...(item.matches || [])]) {
                if (covers(path, candidate) && candidate.length > bestLength) {
                    best = item.url;
                    bestLength = candidate.length;
                }
            }
        }
    }

    return best;
}
