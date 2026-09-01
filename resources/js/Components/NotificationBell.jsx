import React, { useCallback, useEffect, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

/**
 * Unread-notification bell for the staff top bars.
 *
 * The unread count is polled rather than pushed: the project has no broadcast
 * driver configured, so a socket feed would need a long-running process that
 * silently takes the feature down whenever it is not running (same reasoning as
 * useLiveData). Polling pauses while the tab is hidden so a dashboard left open
 * in a background tab stops hitting the database.
 *
 * The full list is only fetched when the menu is opened — the badge alone needs
 * nothing more than a COUNT.
 */

const POLL_INTERVAL = 20000;

/** "just now", "5m ago", "3h ago", "2d ago" — full date beyond a week. */
function timeAgo(value) {
    if (!value) return "";

    const then = new Date(value);
    const seconds = Math.floor((Date.now() - then.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationBell({ className = "" }) {
    const { auth } = usePage().props;
    const [count, setCount] = useState(0);
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Guards against overlapping polls on a slow connection.
    const inFlight = useRef(false);

    // Determine the notification page URL based on user role
    const getNotificationPageUrl = () => {
        const role = auth?.user?.role;
        if (role === 'admin') return '/admin/dashboard';
        if (role === 'super_admin') return '/super-admin/dashboard';
        return '/notifications'; // applicant route
    };

    const fetchCount = useCallback(async () => {
        if (inFlight.current || document.hidden) return;

        inFlight.current = true;
        try {
            const { data } = await axios.get("/notifications/unread-count");
            setCount(data?.count ?? 0);
        } catch {
            // A failed poll is not worth interrupting the user over — the next
            // tick will pick the count back up.
        } finally {
            inFlight.current = false;
        }
    }, []);

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/notifications/list");
            setItems(Array.isArray(data) ? data.slice(0, 8) : []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCount();

        const timer = setInterval(fetchCount, POLL_INTERVAL);
        // Coming back to the tab should feel current straight away rather than
        // waiting out the rest of the interval.
        const onVisible = () => !document.hidden && fetchCount();
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [fetchCount]);

    const handleOpenChange = (next) => {
        setOpen(next);
        if (next) fetchList();
    };

    const openNotification = async (notification) => {
        setOpen(false);

        if (!notification.read) {
            try {
                await axios.post("/notifications/mark-read", { id: notification.id });
                setCount((c) => Math.max(0, c - 1));
            } catch {
                // Navigating still matters more than the read flag.
            }
        }

        if (notification.link) {
            router.visit(notification.link);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post("/notifications/mark-all-read");
            setCount(0);
            setItems((list) => list.map((n) => ({ ...n, read: true })));
        } catch {
            // Leave the badge as it is; the next poll reports the truth.
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full text-[#0d1f5c] transition-colors hover:bg-[#0d1f5c]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1f5c]/30 ${className}`}
                >
                    <Bell className="h-[18px] w-[18px]" />
                    {count > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                            {count > 99 ? "99+" : count}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[22rem] p-0">
                <div className="flex items-center justify-between border-b px-3 py-2">
                    <span className="text-sm font-bold text-[#0d1f5c]">
                        Notifications
                        {count > 0 && (
                            <span className="ml-1.5 font-medium text-gray-500">({count} unread)</span>
                        )}
                    </span>
                    {count > 0 && (
                        <button
                            type="button"
                            onClick={markAllRead}
                            className="flex items-center gap-1 text-xs font-medium text-[#0d1f5c] hover:underline"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                        </button>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading…
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-500">
                            You&apos;re all caught up.
                        </div>
                    ) : (
                        items.map((notification) => (
                            <button
                                key={notification.id}
                                type="button"
                                onClick={() => openNotification(notification)}
                                className={`flex w-full gap-2.5 border-b border-gray-50 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-gray-50 ${
                                    notification.read ? "" : "bg-blue-50/40"
                                }`}
                            >
                                <span
                                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                                        notification.read ? "bg-transparent" : "bg-blue-600"
                                    }`}
                                />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-[#0d1f5c]">
                                        {notification.title}
                                    </span>
                                    <span className="mt-0.5 line-clamp-2 block text-xs text-gray-600">
                                        {notification.message}
                                    </span>
                                    <span className="mt-1 block text-[11px] text-gray-400">
                                        {timeAgo(notification.created_at)}
                                    </span>
                                </span>
                            </button>
                        ))
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setOpen(false);
                        router.visit(getNotificationPageUrl());
                    }}
                    className="block w-full border-t px-3 py-2 text-center text-xs font-semibold text-[#0d1f5c] hover:bg-gray-50"
                >
                    View all notifications
                </button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
