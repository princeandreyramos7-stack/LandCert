import { fetchWithCsrf } from "@/lib/csrf";

/**
 * Keeps a New Application in progress across an accidental refresh - every
 * step's typed answers, which step it was on, and every attached file, not
 * just the current step's.
 *
 * Typed answers go to sessionStorage: small, and gone once the tab closes -
 * a work-in-progress form has no business outliving that. Attached files go
 * to IndexedDB instead: sessionStorage's ~5MB quota is shared across
 * everything on the origin and would not survive more than one or two
 * attachments at this app's own per-file limits.
 *
 * Scoped per signed-in account (never shared across accounts on the same
 * browser) and expires after 24 hours, so an abandoned draft does not sit
 * around forever.
 *
 * This is the same-device, refresh-only layer. For closing the browser
 * entirely or switching devices, see the fetchServerDraft/saveServerDraft/
 * clearServerDraft functions below, which keep the typed answers (not the
 * files - see ApplicationDraftController) on the account itself.
 */

const TTL_MS = 24 * 60 * 60 * 1000;
const DB_VERSION = 1;
const STORE = 'files';

function metaKey(userId) {
    return `cpdo.request-draft.${userId}`;
}

function dbName(userId) {
    return `cpdo-request-draft-${userId}`;
}

/** Everything except the attached files: the typed form, the step, etc. */
export function saveDraftMeta(userId, meta) {
    if (!userId) return;
    try {
        sessionStorage.setItem(metaKey(userId), JSON.stringify({ ...meta, savedAt: Date.now() }));
    } catch (_) {
        // Storage full, disabled, or unavailable (private browsing, etc.) -
        // the draft simply is not saved; nothing else depends on it existing.
    }
}

/** Returns the saved meta, or null if there is none or it has expired. */
export function loadDraftMeta(userId) {
    if (!userId) return null;
    try {
        const raw = sessionStorage.getItem(metaKey(userId));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
            sessionStorage.removeItem(metaKey(userId));
            return null;
        }
        return parsed;
    } catch (_) {
        return null;
    }
}

export function clearDraftMeta(userId) {
    if (!userId) return;
    try { sessionStorage.removeItem(metaKey(userId)); } catch (_) { /* nothing to clear */ }
}

function openFilesDb(userId) {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) { reject(new Error('IndexedDB unavailable')); return; }
        const request = indexedDB.open(dbName(userId), DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, { keyPath: 'key' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getRecord(db, key) {
    return new Promise((resolve, reject) => {
        const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Every attached file, in one write: the whole requirementFiles object (its
 * File objects included - IndexedDB's structured clone stores a File
 * natively, name/type/content and all, unlike sessionStorage's JSON) plus
 * the authorization letter, if any.
 */
export async function saveDraftFiles(userId, requirementFiles, authorizationLetter) {
    if (!userId) return;
    try {
        const db = await openFilesDb(userId);
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            const store = tx.objectStore(STORE);
            store.put({ key: 'requirementFiles', value: requirementFiles });
            store.put({ key: 'authorizationLetter', value: authorizationLetter || null });
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
        db.close();
    } catch (_) {
        // Best effort only, same as saveDraftMeta.
    }
}

/** Returns { requirementFiles, authorizationLetter }, empty if there is nothing on file. */
export async function loadDraftFiles(userId) {
    if (!userId) return { requirementFiles: {}, authorizationLetter: null };
    try {
        const db = await openFilesDb(userId);
        const [requirementFiles, authorizationLetter] = await Promise.all([
            getRecord(db, 'requirementFiles'),
            getRecord(db, 'authorizationLetter'),
        ]);
        db.close();
        return {
            requirementFiles: requirementFiles?.value || {},
            authorizationLetter: authorizationLetter?.value || null,
        };
    } catch (_) {
        return { requirementFiles: {}, authorizationLetter: null };
    }
}

export function clearDraftFiles(userId) {
    if (!userId || !('indexedDB' in window)) return;
    try {
        // Fire-and-forget: nothing downstream needs to wait for this, and a
        // blocked delete (another tab with the same draft still open) is not
        // worth surfacing - it will be retried the next time this is called.
        const request = indexedDB.deleteDatabase(dbName(userId));
        request.onerror = () => {};
    } catch (_) { /* nothing to clear */ }
}

/** Everything about this account's in-progress draft, gone - filed, abandoned, or expired. */
export function clearDraft(userId) {
    clearDraftMeta(userId);
    clearDraftFiles(userId);
}

/**
 * The account-tied draft - typed answers and step only, no files (see the
 * application_drafts migration). Returns null if there is none, same as
 * loadDraftMeta. Best effort throughout: a signed-in applicant with no
 * connection right now still gets to use the form, just without this layer.
 */
export async function fetchServerDraft() {
    try {
        const response = await fetch(route('request.draft.show'), {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        });
        if (!response.ok) return null;
        const body = await response.json();
        return body?.draft ?? null;
    } catch (_) {
        return null;
    }
}

export async function saveServerDraft({ data, currentStep, completedSteps, hasRepresentative }) {
    try {
        await fetchWithCsrf(route('request.draft.store'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                data,
                current_step: currentStep,
                completed_steps: completedSteps,
                has_representative: hasRepresentative,
            }),
        });
    } catch (_) {
        // Same as saveDraftMeta: the browser-side copy still has this covered.
    }
}

export function clearServerDraft() {
    try {
        fetchWithCsrf(route('request.draft.destroy'), { method: 'DELETE', headers: { Accept: 'application/json' } });
    } catch (_) { /* nothing to clear */ }
}
