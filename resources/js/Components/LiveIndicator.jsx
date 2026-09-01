import React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/Components/ui/button";
import { RefreshCw, Bell } from "lucide-react";
import { useHeaderSlot } from "@/Components/HeaderSlot";

/**
 * Small status strip for auto-refreshing lists: shows that the page is live,
 * when it last checked, and a click-to-review badge when new rows arrive.
 *
 * Inside a layout it renders into the top bar's header slot, next to the role
 * badge in the top-right corner, so every page reports its live status in the
 * same place. Without a layout (a bare print view, say) it renders in place.
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
    const headerSlot = useHeaderSlot();

    const time = lastUpdated
        ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : null;

    const strip = (
        <div
            className={
                headerSlot
                    ? "flex items-center gap-1"
                    : `flex flex-wrap items-center gap-3 ${className}`
            }
        >
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${isRefreshing ? "animate-ping" : ""}`} />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Live
                {/* In the top bar the timestamp is dropped — the row has to stay
                    narrow enough to sit beside the role badge. */}
                {time && !headerSlot && <span className="text-gray-400">· updated {time}</span>}
            </span>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRefreshNow}
                disabled={isRefreshing}
                className="h-7 px-2 text-xs text-gray-500 hover:text-[#0d1f5c]"
                title={time ? `Last updated ${time} — check for updates now` : "Check for updates now"}
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

    return headerSlot ? createPortal(strip, headerSlot) : strip;
}
