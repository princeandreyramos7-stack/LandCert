import React from "react";
import { useLiveData, useNewItemCount } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/Components/LiveIndicator";

/**
 * One-line drop-in that keeps a page's data current without a browser refresh.
 *
 *   <LiveRefresh only={["requests"]} items={requests} label="applications" />
 *
 * `only` names the Inertia props to re-fetch — always name them, so the poll is
 * a small partial reload rather than a full page render. Pass `items` (a list or
 * a paginator) to also show a "N new" badge when rows arrive; omit it on pages
 * where counting new rows is not meaningful (dashboards, settings).
 */
export function LiveRefresh({
    only,
    items = null,
    label = "items",
    interval = 15000,
    enabled = true,
    className = "justify-end",
}) {
    const { lastUpdated, isRefreshing, refreshNow } = useLiveData({ only, interval, enabled });
    const list = items?.data ?? items ?? [];
    const { newCount, acknowledge } = useNewItemCount(Array.isArray(list) ? list : []);

    return (
        <LiveIndicator
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
            newCount={items ? newCount : 0}
            onAcknowledge={acknowledge}
            onRefreshNow={refreshNow}
            label={label}
            className={className}
        />
    );
}
