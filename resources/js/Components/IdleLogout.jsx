import * as React from "react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Clock } from "lucide-react";

/**
 * Signs the user out after a period with no activity.
 *
 * This has to be driven from the browser rather than left to the session
 * lifetime. Every page polls — the notification bell every 20 seconds, the live
 * refresh every 15 — and each poll is a request that resets the session's idle
 * clock. A tab left open on an empty desk therefore keeps its session alive
 * indefinitely, no matter how short SESSION_LIFETIME is set.
 *
 * Only real input counts as activity. Polling deliberately does not, which is
 * the entire point.
 *
 * Idleness is shared between tabs through localStorage, so working in one tab
 * does not get you signed out of another.
 */

const IDLE_LIMIT_MS = 10 * 60 * 1000; // 10 minutes
const WARN_BEFORE_MS = 60 * 1000; // final minute is a countdown
const TICK_MS = 1000;

// Writing on every mousemove would hammer localStorage; once every few seconds
// is more than precise enough for a ten-minute timer.
const SHARE_THROTTLE_MS = 5000;

/**
 * How often a *still-active* user pings the server.
 *
 * Filling in the application form sends no requests at all — the applicant
 * layout has no notification bell polling on its behalf — so someone typing
 * carefully for a quarter of an hour would have their session expire underneath
 * them and lose the lot on submit. This keeps the server's idle clock in step
 * with actual use, which is what makes a short SESSION_LIFETIME safe.
 */
const KEEPALIVE_MS = 4 * 60 * 1000;

const ACTIVITY_KEY = "cpdo:last-activity";
const ACTIVITY_EVENTS = [
    "mousedown",
    "mousemove",
    "keydown",
    "touchstart",
    "scroll",
    "wheel",
    "click",
];

function readSharedActivity() {
    try {
        const value = Number(window.localStorage.getItem(ACTIVITY_KEY));
        return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
        // Private browsing and blocked site data both throw here. Falling back
        // to this tab's own timer is correct — it just is not shared.
        return 0;
    }
}

function writeSharedActivity(timestamp) {
    try {
        window.localStorage.setItem(ACTIVITY_KEY, String(timestamp));
    } catch {
        /* see readSharedActivity */
    }
}

export default function IdleLogout({
    idleLimitMs = IDLE_LIMIT_MS,
    warnBeforeMs = WARN_BEFORE_MS,
}) {
    const [msRemaining, setMsRemaining] = React.useState(null);
    const lastActivityRef = React.useRef(Date.now());
    const lastSharedWriteRef = React.useRef(0);
    const lastKeepaliveRef = React.useRef(Date.now());
    const signingOutRef = React.useRef(false);

    const markActive = React.useCallback((options = {}) => {
        const now = Date.now();
        lastActivityRef.current = now;

        if (options.force || now - lastSharedWriteRef.current > SHARE_THROTTLE_MS) {
            lastSharedWriteRef.current = now;
            writeSharedActivity(now);
        }

        setMsRemaining((current) => (current === null ? current : null));
    }, []);

    const signOut = React.useCallback(() => {
        if (signingOutRef.current) return;
        signingOutRef.current = true;

        // Go through /logout so the session is destroyed server-side, not just
        // abandoned in this tab.
        router.post(
            "/logout",
            {},
            {
                onFinish: () => {
                    window.location.href = "/login";
                },
            }
        );
    }, []);

    React.useEffect(() => {
        markActive({ force: true });

        const onActivity = () => markActive();
        ACTIVITY_EVENTS.forEach((event) =>
            window.addEventListener(event, onActivity, { passive: true })
        );

        // Activity in a sibling tab counts here too.
        const onStorage = (event) => {
            if (event.key !== ACTIVITY_KEY) return;
            const shared = Number(event.newValue);
            if (Number.isFinite(shared) && shared > lastActivityRef.current) {
                lastActivityRef.current = shared;
                setMsRemaining(null);
            }
        };
        window.addEventListener("storage", onStorage);

        const timer = setInterval(() => {
            const shared = readSharedActivity();
            const lastActivity = Math.max(lastActivityRef.current, shared);
            const now = Date.now();
            const idleFor = now - lastActivity;
            const remaining = idleLimitMs - idleFor;

            if (remaining <= 0) {
                signOut();
                return;
            }

            // Only while genuinely in use — an idle tab must be allowed to let
            // its session lapse, which is the whole point.
            if (idleFor < KEEPALIVE_MS && now - lastKeepaliveRef.current > KEEPALIVE_MS) {
                lastKeepaliveRef.current = now;
                fetch("/csrf-token", {
                    headers: { Accept: "application/json" },
                    credentials: "same-origin",
                    cache: "no-store",
                }).catch(() => {
                    /* offline is not a reason to sign anyone out */
                });
            }

            setMsRemaining(remaining <= warnBeforeMs ? remaining : null);
        }, TICK_MS);

        return () => {
            ACTIVITY_EVENTS.forEach((event) =>
                window.removeEventListener(event, onActivity)
            );
            window.removeEventListener("storage", onStorage);
            clearInterval(timer);
        };
    }, [idleLimitMs, warnBeforeMs, markActive, signOut]);

    const secondsLeft = msRemaining === null ? 0 : Math.ceil(msRemaining / 1000);

    return (
        <Dialog open={msRemaining !== null}>
            {/* Not dismissable by Escape or an outside click: those are exactly
                the stray interactions that would silently extend the session. */}
            <DialogContent
                className="max-w-md"
                onEscapeKeyDown={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#0d1f5c]">
                        <Clock className="h-5 w-5 text-amber-500" />
                        Still there?
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-gray-600">
                    You have been inactive for a while. For your security you will
                    be signed out in{" "}
                    <span className="font-bold tabular-nums text-[#0d1f5c]">
                        {secondsLeft}
                    </span>{" "}
                    second{secondsLeft === 1 ? "" : "s"}.
                </p>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={signOut}>
                        Log out now
                    </Button>
                    <Button
                        className="bg-[#0d1f5c] hover:bg-[#1a3a8f]"
                        onClick={() => markActive({ force: true })}
                    >
                        Stay signed in
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
