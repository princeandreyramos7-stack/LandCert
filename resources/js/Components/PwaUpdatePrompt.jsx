import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useToast } from "@/Components/ui/use-toast";
import { ToastAction } from "@/Components/ui/toast";

/**
 * Registers the service worker (vite-plugin-pwa's own auto-inject is
 * switched off in vite.config.js, on purpose) and, when a new build has been
 * deployed, offers to reload rather than swapping the running code out from
 * under whatever the person is doing - an applicant mid-way through the
 * application form should decide when that happens, not have it forced on
 * them the moment the new service worker installs.
 *
 * Mounted once, at the root (see app.jsx) - not per-page, so it survives
 * every Inertia navigation and never re-registers.
 */
export default function PwaUpdatePrompt() {
    const { toast } = useToast();

    const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
        onRegisterError(error) {
            // Never block the app over this - an applicant who cannot
            // install the service worker can still use every feature online.
            console.error("Service worker registration failed:", error);
        },
    });

    useEffect(() => {
        if (!needRefresh) return;

        toast({
            title: "Update available",
            description: "A newer version of this app is ready. Your drafts are safe either way.",
            action: (
                <ToastAction altText="Reload now" onClick={() => updateServiceWorker(true)}>
                    Reload
                </ToastAction>
            ),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needRefresh]);

    return null;
}
