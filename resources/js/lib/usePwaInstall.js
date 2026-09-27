import { useCallback, useEffect, useReducer } from "react";

/**
 * Wraps the browser's install-prompt lifecycle for an "Install App" button.
 *
 * Chrome/Edge/Android fire `beforeinstallprompt` exactly once per page
 * load, not once per component mount - it is a real `window` event tied to
 * the actual document, never replayed for an Inertia client-side
 * navigation. Capturing it into component state (via useState) meant the
 * captured event was lost every time the Welcome page unmounted - browser
 * Back/Forward through Inertia's history, not a real reload - since a
 * fresh `usePwaInstall()` call started from an empty state with no event
 * left to receive. A real refresh "fixed" it only because that reloads the
 * document and lets the browser fire the event again from scratch.
 *
 * The fix: the captured event and a tiny pub/sub live at module scope,
 * registered once when this module first loads (see the side-effect
 * import in app.jsx) rather than once per component instance. Module
 * scope survives every Inertia navigation for the life of the tab, so the
 * one-time event is never lost after the first page that captures it.
 */
let deferredPrompt = null;
let installed = false;
const listeners = new Set();

function notify() {
    listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
    installed =
        window.matchMedia?.("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        notify();
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        installed = true;
        notify();
    });
}

export function usePwaInstall() {
    const [, forceUpdate] = useReducer((c) => c + 1, 0);

    useEffect(() => {
        listeners.add(forceUpdate);
        return () => listeners.delete(forceUpdate);
    }, []);

    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;

    /** @returns {Promise<'accepted'|'dismissed'|null>} */
    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return null;

        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        // Single-use either way, accepted or dismissed - Chrome only ever
        // fires beforeinstallprompt again after a fresh page load.
        deferredPrompt = null;
        notify();

        return choice.outcome;
    }, []);

    return {
        installed,
        canPromptInstall: Boolean(deferredPrompt),
        isIOS,
        promptInstall,
    };
}
