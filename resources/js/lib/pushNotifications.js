import { fetchWithCsrf } from "@/lib/csrf";

/**
 * The browser Push API wants the VAPID key as a Uint8Array, but the server
 * hands it over base64url-encoded (Web Push's own convention, not standard
 * base64) since that is what fits safely in a URL and a database column.
 */
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/**
 * Push notifications need three things to be possible at all: the API
 * itself, a registered service worker to receive the push event, and a key
 * to subscribe with. All three are already true in production once the PWA
 * is installed - this only fails in an environment that never registered
 * the service worker (e.g. a browser lacking the API, or the key missing
 * because VAPID was never generated on this deployment).
 */
export function isPushSupported() {
    return (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
}

export async function getExistingPushSubscription() {
    if (!isPushSupported()) return null;
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
}

/**
 * Asks the browser for notification permission (a user gesture is required
 * for this prompt to appear at all, so this must be called from a click
 * handler, not on mount) and, once granted, opens a PushManager subscription
 * and hands it to the server to store against the signed-in applicant.
 *
 * Returns the subscription on success, or throws with a message fit to show
 * the applicant directly (permission denied, unsupported browser, etc).
 */
export async function subscribeToPush(vapidPublicKey) {
    if (!isPushSupported()) {
        throw new Error("This browser does not support push notifications.");
    }
    if (!vapidPublicKey) {
        throw new Error("Push notifications are not configured on this server.");
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        throw new Error("Notification permission was not granted.");
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const { endpoint, keys } = subscription.toJSON();
    const response = await fetchWithCsrf("/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ endpoint, keys }),
    });

    if (!response.ok) {
        // The subscription was opened in the browser but the server never
        // learned about it - undo it rather than leave a dangling
        // subscription nothing will ever deliver to.
        await subscription.unsubscribe().catch(() => {});
        throw new Error("Could not save the subscription. Please try again.");
    }

    return subscription;
}

/**
 * Tears down both halves of a subscription: the browser's own (so the
 * device stops being asked to relay pushes) and the server's record of it.
 * Safe to call when there is nothing to unsubscribe from.
 */
export async function unsubscribeFromPush() {
    const subscription = await getExistingPushSubscription();
    if (!subscription) return;

    const { endpoint } = subscription.toJSON();
    await subscription.unsubscribe().catch(() => {});

    await fetchWithCsrf("/push-subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ endpoint }),
    }).catch(() => {});
}
