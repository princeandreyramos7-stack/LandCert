import React, { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

/**
 * A one-time notice about the cookies this system sets.
 *
 * Deliberately not a consent banner, because there is nothing here to
 * consent to. The system sets four cookies: the session, the CSRF token,
 * the optional "remember me", and whether you left the sidebar open. All of
 * them are either strictly necessary to sign in or a preference you set
 * yourself by using the page. There is no analytics service, no advertising
 * cookie, and no third-party tracker - so a banner demanding agreement
 * before the site will work would be asking for permission the office does
 * not need and training people to click through such things without reading.
 *
 * What is owed instead is disclosure, which is what this is: it says what is
 * set, links to the full policy, and goes away. If analytics or any tracking
 * embed is ever added, this has to become a real consent gate that blocks
 * those scripts until the visitor agrees - see the Cookie Policy, which says
 * so in as many words.
 *
 * Dismissal is remembered in localStorage rather than in a cookie, so
 * acknowledging the notice does not itself add to what is stored.
 */

const SEEN_KEY = "cpdo:cookie-notice";
// Bumped when the Cookie Policy changes in substance, so the notice is shown
// again rather than staying dismissed against text nobody has seen.
const NOTICE_VERSION = "1.0";

export default function CookieNotice() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Private browsing, blocked site data, an embedded webview: any of
        // these can make storage throw rather than simply return null. A
        // notice is not worth a crashed page, so a failure means show it.
        let seen = null;
        try {
            seen = window.localStorage.getItem(SEEN_KEY);
        } catch {
            seen = null;
        }

        if (seen !== NOTICE_VERSION) {
            // A beat, so it does not fight the page for attention as it loads.
            const timer = setTimeout(() => setShow(true), 900);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        setShow(false);
        try {
            window.localStorage.setItem(SEEN_KEY, NOTICE_VERSION);
        } catch {
            // Nowhere to remember it. It will show again next visit, which is
            // a smaller problem than failing to render.
        }
    };

    if (!show) return null;

    return (
        <div
            role="region"
            aria-label="Cookie notice"
            className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl print:hidden sm:inset-x-4 sm:bottom-4"
        >
            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                <div className="mt-0.5 shrink-0 rounded-lg bg-[#0d1f5c]/5 p-2">
                    <Cookie className="h-4 w-4 text-[#0d1f5c]" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0d1f5c]">
                        About cookies on this site
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
                        This system uses only the cookies needed to sign you in, keep your
                        session secure, and remember whether you left the menu open. There is
                        no advertising, no analytics service and no third-party tracking, so
                        there is nothing here to opt out of.{" "}
                        <a
                            href="/legal/cookies"
                            className="font-semibold text-[#0d1f5c] underline underline-offset-2 hover:text-[#d4a017]"
                        >
                            Read the Cookie Policy
                        </a>
                        .
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={dismiss}
                            className="rounded-lg bg-[#0d1f5c] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#1a3a8f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a017]"
                        >
                            Got it
                        </button>
                        <a
                            href="/legal/privacy"
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#0d1f5c]"
                        >
                            Privacy Policy
                        </a>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Dismiss this notice"
                    className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1f5c]/40"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
