import React from "react";
import { Button } from "@/Components/ui/button";
import { RefreshCw, Bell } from "lucide-react";

/**
 * Small status strip for auto-refreshing lists: shows that the page is live,
 * when it last checked, and a click-to-review badge when new rows arrive.
 */
export function LiveIndicator({
    isRefreshing = false,
    lastUpdated = null,
    newCount = 0,
    onAcknowledge = () => {},
    onRefreshNow = () => {},
    label = "items",
    className = "",
}) {
    const time = lastUpdated
        ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : null;

    return (
        <div className={`flex flex-wrap items-center gap-3 ${className}`}>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${isRefreshing ? "animate-ping" : ""}`} />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Live
                {time && <span className="text-gray-400">· updated {time}</span>}
            </span>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRefreshNow}
                disabled={isRefreshing}
                className="h-7 px-2 text-xs text-gray-500 hover:text-[#0d1f5c]"
                title="Check for updates now"
            >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>

            {newCount > 0 && (
                <button
                    type="button"
                    onClick={onAcknowledge}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors animate-in fade-in"
                >
                    <Bell className="h-3.5 w-3.5" />
                    {newCount} new {newCount === 1 ? label.replace(/s$/, "") : label}
                </button>
            )}
        </div>
    );
}
