import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Switch } from "@/Components/ui/switch";
import { useToast } from "@/Components/ui/use-toast";
import {
    getExistingPushSubscription,
    isPushSupported,
    subscribeToPush,
    unsubscribeFromPush,
} from "@/lib/pushNotifications";

/**
 * A deliberate opt-in, not something turned on for the applicant: push asks
 * the OS for a permanent permission grant and, once on, can wake the device
 * at any time. Reflects the state the browser itself holds (an existing
 * PushManager subscription) rather than anything stored server-side as a
 * "preference" - the subscription itself is the only source of truth.
 */
export default function PushNotificationToggle() {
    const { vapidPublicKey } = usePage().props;
    const { toast } = useToast();

    const [supported, setSupported] = useState(true);
    const [enabled, setEnabled] = useState(false);
    const [busy, setBusy] = useState(false);
    const [checking, setChecking] = useState(true);
    const [blocked, setBlocked] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!isPushSupported()) {
                if (!cancelled) {
                    setSupported(false);
                    setChecking(false);
                }
                return;
            }

            setBlocked(Notification.permission === "denied");

            const subscription = await getExistingPushSubscription().catch(() => null);
            if (!cancelled) {
                setEnabled(Boolean(subscription));
                setChecking(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleToggle = async (next) => {
        setBusy(true);
        try {
            if (next) {
                await subscribeToPush(vapidPublicKey);
                setEnabled(true);
                toast({
                    title: "Push notifications on",
                    description: "This device will now get alerts for application updates.",
                });
            } else {
                await unsubscribeFromPush();
                setEnabled(false);
                toast({
                    title: "Push notifications off",
                    description: "This device will no longer get push alerts.",
                });
            }
        } catch (error) {
            setBlocked(typeof Notification !== "undefined" && Notification.permission === "denied");
            toast({
                title: "Couldn't update push notifications",
                description: error?.message || "Please try again.",
                variant: "destructive",
            });
        } finally {
            setBusy(false);
        }
    };

    if (!supported) return null;

    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(13,31,92,0.06)" }}
                >
                    {enabled ? (
                        <BellRing className="w-5 h-5 text-[#0d1f5c]" />
                    ) : (
                        <Bell className="w-5 h-5 text-[#0d1f5c]" />
                    )}
                </div>
                <div>
                    <p className="text-sm font-semibold text-[#0d1f5c]">Push notifications</p>
                    <p className="text-xs text-gray-400 max-w-sm">
                        Get an alert on this device when your application status changes -
                        on top of the email and text messages you already receive.
                    </p>
                    {blocked && !enabled && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-600">
                            <BellOff className="w-3.5 h-3.5" />
                            Blocked in your browser. Allow notifications for this site to turn it back on.
                        </p>
                    )}
                </div>
            </div>
            <Switch
                checked={enabled}
                disabled={busy || checking || blocked}
                onCheckedChange={handleToggle}
                aria-label="Toggle push notifications"
            />
        </div>
    );
}
