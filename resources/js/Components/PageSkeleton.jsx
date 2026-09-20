import React from "react";
import { usePageLoading } from "@/hooks/usePageLoading";
import {
    SkeletonCards,
    SkeletonDashboard,
    SkeletonDetail,
    SkeletonForm,
    SkeletonRequirements,
    SkeletonScreen,
    SkeletonStats,
    SkeletonTable,
    SkeletonText,
} from "@/Components/ui/skeletons";

/**
 * Stands in for the page while the next one is being fetched.
 *
 * The layout cannot know what is coming, but the address can: every page in
 * the system is served from a clean slug (see CleanPageController), so the
 * destination names the shape. A list gets a table, a record gets its
 * label/value cards, the dashboard gets its charts. Anything unrecognised
 * falls back to a neutral page shape rather than nothing.
 *
 * Nothing renders at all on a fast navigation - usePageLoading holds the flag
 * down for the first fifth of a second, which covers almost every visit on
 * the office network. It is the applicant on mobile data who sees this, and
 * for them the alternative was a page that sat still with no explanation.
 */

/* Longest prefix wins, so /payments/history beats /payments. */
const SHAPES = [
    [["/dashboard-panel", "/dashboard"], "dashboard"],
    [["/reports"], "reports"],
    [["/applications", "/my-applications", "/certificates", "/payments", "/users", "/audit-logs", "/notifications"], "table"],
    [["/view-application", "/application-details", "/review-application"], "detail"],
    [["/document-verification"], "requirements"],
    [["/request", "/edit-application", "/profile", "/sms-broadcast"], "form"],
    [["/generate-certificate", "/generate-clearance", "/order-of-payment", "/print-form", "/receipt", "/payment-details"], "document"],
];

export function shapeFor(path) {
    if (!path) return "page";

    let best = "page";
    let bestLength = -1;

    for (const [prefixes, shape] of SHAPES) {
        for (const prefix of prefixes) {
            const matches = path === prefix || path.startsWith(prefix + "/");
            if (matches && prefix.length > bestLength) {
                best = shape;
                bestLength = prefix.length;
            }
        }
    }

    return best;
}

function Shape({ name }) {
    switch (name) {
        case "dashboard":
            return <SkeletonDashboard />;

        case "reports":
            return (
                <div className="space-y-4">
                    <SkeletonStats count={4} />
                    <SkeletonForm fields={4} />
                    <SkeletonTable rows={6} columns={6} />
                </div>
            );

        case "table":
            return (
                <div className="space-y-4">
                    <SkeletonStats count={4} />
                    {/* Both, because the table is hidden on a phone and the
                        cards are hidden above it - the same as the real page. */}
                    <div className="hidden md:block">
                        <SkeletonTable rows={7} columns={6} />
                    </div>
                    <div className="md:hidden">
                        <SkeletonCards count={4} />
                    </div>
                </div>
            );

        case "detail":
            return (
                <div className="space-y-4">
                    <SkeletonStats count={3} />
                    <SkeletonDetail sections={3} />
                </div>
            );

        case "requirements":
            return (
                <div className="space-y-4">
                    <SkeletonStats count={3} />
                    <SkeletonRequirements count={7} />
                </div>
            );

        case "form":
            return (
                <div className="space-y-4">
                    <SkeletonForm fields={8} />
                </div>
            );

        case "document":
            return (
                <div className="mx-auto max-w-4xl space-y-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
                        <SkeletonText lines={2} className="mb-8" />
                        <SkeletonText lines={12} />
                    </div>
                </div>
            );

        default:
            return (
                <div className="space-y-4">
                    <SkeletonStats count={3} />
                    <SkeletonText lines={6} />
                    <SkeletonTable rows={4} columns={4} />
                </div>
            );
    }
}

/**
 * Renders `children`, or the skeleton for wherever we are heading.
 *
 * Wrapped around the page body in each layout. The sidebar and top bar stay
 * put: they are the same on the next page, and swapping them for grey boxes
 * would be a step backwards.
 */
export default function PageSkeleton({ children }) {
    const { loading, url } = usePageLoading();

    if (!loading) return children;

    return (
        <SkeletonScreen label="Loading page">
            <Shape name={shapeFor(url)} />
        </SkeletonScreen>
    );
}
