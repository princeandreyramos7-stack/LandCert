// Push and notification-click handling for the service worker.
//
// Not written into vite.config.js's VitePWA block directly: that plugin runs
// in "generateSW" mode, which generates sw.js from a Workbox recipe rather
// than bundling a source file of ours, so there is no place there to put
// arbitrary event-listener code. `workbox.importScripts` in that config
// tells the generated sw.js to `importScripts()` this file at startup
// instead - it runs in the same service worker global scope, so
// self.addEventListener here attaches exactly as if it were inline.
//
// Kept deliberately plain (no bundler, no imports) since nothing here
// processes it before it reaches the browser.

self.addEventListener("push", (event) => {
    if (!event.data) return;

    let payload = {};
    try {
        payload = event.data.json();
    } catch {
        payload = { title: "CPDO Ilagan", body: event.data.text() };
    }

    const title = payload.title || "CPDO Ilagan";
    const url = typeof payload.data === "string" ? payload.data : "/";

    event.waitUntil(
        self.registration.showNotification(title, {
            body: payload.body || "",
            icon: payload.icon || "/icons/icon-192.png",
            badge: payload.badge || "/icons/icon-192.png",
            tag: payload.tag,
            data: { url },
        })
    );
});

// Focuses an already-open tab on the notification's target page rather than
// always opening a new one - an applicant with the app already open should
// land back on it, not accumulate tabs every time a status update arrives.
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "/";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.endsWith(url) && "focus" in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});
