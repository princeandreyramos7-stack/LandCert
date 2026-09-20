import React from "react";
import { cn } from "@/lib/utils";

/**
 * The shapes a page wears while its data is on the way.
 *
 * A spinner says only "wait"; a skeleton says "wait, and here is what is
 * coming" - the table keeps its columns, the cards keep their places, and
 * nothing jumps when the real content lands. Every loading state in the
 * system draws from this file so the waiting looks the same everywhere.
 *
 * All of them are decoration, not information: aria-hidden keeps a screen
 * reader out of the scaffolding, and the live region that announces the wait
 * belongs to whoever renders the skeleton (see SkeletonScreen below).
 */

/** One grey bar. `w` is any Tailwind width; `h` any Tailwind height. */
export function Bar({ className, w = "w-full", h = "h-4" }) {
    return (
        <div
            aria-hidden="true"
            className={cn("animate-pulse rounded bg-slate-200/80", w, h, className)}
        />
    );
}

/** A circle, for an avatar or an icon tile. */
export function Dot({ className, size = "h-10 w-10" }) {
    return (
        <div
            aria-hidden="true"
            className={cn("animate-pulse rounded-full bg-slate-200/80", size, className)}
        />
    );
}

/**
 * Wraps a skeleton so assistive technology hears one polite "Loading" rather
 * than reading out a wall of empty boxes.
 */
export function SkeletonScreen({ label = "Loading", children, className }) {
    return (
        <div role="status" aria-live="polite" aria-busy="true" className={className}>
            <span className="sr-only">{label}...</span>
            {children}
        </div>
    );
}

/* -- Paragraph --------------------------------------------------- */

export function SkeletonText({ lines = 3, className }) {
    // The last line is short, the way a real paragraph ends mid-width.
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Bar key={i} w={i === lines - 1 ? "w-2/3" : "w-full"} h="h-3.5" />
            ))}
        </div>
    );
}

/* -- The summary tiles above most list screens ------------------- */

export function SkeletonStats({ count = 4, className }) {
    return (
        <div
            className={cn(
                "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
                count === 3 && "lg:grid-cols-3",
                count === 5 && "lg:grid-cols-5",
                className,
            )}
        >
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                >
                    <Dot size="h-9 w-9" className="rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Bar w="w-12" h="h-5" />
                        <Bar w="w-20" h="h-2.5" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* -- Tables ------------------------------------------------------ */

/**
 * A table's bones: a header strip and `rows` rows of `columns` cells.
 *
 * The widths vary per column so it reads as a table rather than a grid of
 * identical blocks - the first column is usually a reference, the last an
 * action.
 */
export function SkeletonTable({ rows = 6, columns = 6, className, header = true }) {
    const widths = ["w-24", "w-40", "w-28", "w-20", "w-32", "w-16", "w-24", "w-20"];

    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm",
                className,
            )}
        >
            {header && (
                <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50/70 px-4 py-3">
                    {Array.from({ length: columns }).map((_, i) => (
                        <div key={i} className="flex-1">
                            <Bar w={widths[i % widths.length]} h="h-3" />
                        </div>
                    ))}
                </div>
            )}
            {Array.from({ length: rows }).map((_, r) => (
                <div
                    key={r}
                    className="flex items-center gap-4 border-b border-gray-50 px-4 py-3.5 last:border-b-0"
                >
                    {Array.from({ length: columns }).map((_, c) => (
                        <div key={c} className="flex-1">
                            <Bar
                                w={widths[(r + c) % widths.length]}
                                h={c === 0 ? "h-4" : "h-3.5"}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

/** The same idea for the card lists the applicant sees on a phone. */
export function SkeletonCards({ count = 4, className }) {
    return (
        <div className={cn("space-y-3", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                            <Bar w="w-32" h="h-4" />
                            <Bar w="w-48" h="h-3" />
                        </div>
                        <Bar w="w-20" h="h-6" className="rounded-full" />
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Bar w="w-24" h="h-8" className="rounded-lg" />
                        <Bar w="w-24" h="h-8" className="rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* -- A record, read left to right in label/value pairs ----------- */

export function SkeletonDetail({ sections = 3, className }) {
    return (
        <div className={cn("space-y-4", className)}>
            {Array.from({ length: sections }).map((_, s) => (
                <div
                    key={s}
                    className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                    <div className="mb-4 flex items-center gap-2">
                        <Dot size="h-5 w-5" className="rounded" />
                        <Bar w="w-40" h="h-4" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {Array.from({ length: 6 }).map((_, f) => (
                            <div key={f} className="space-y-1.5">
                                <Bar w="w-24" h="h-2.5" />
                                <Bar w="w-36" h="h-3.5" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* -- A form being prepared --------------------------------------- */

export function SkeletonForm({ fields = 6, className }) {
    return (
        <div className={cn("rounded-xl border border-gray-100 bg-white p-5 shadow-sm", className)}>
            <Bar w="w-48" h="h-5" className="mb-5" />
            <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: fields }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                        <Bar w="w-28" h="h-3" />
                        <Bar h="h-10" className="rounded-lg" />
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <Bar w="w-24" h="h-10" className="rounded-lg" />
                <Bar w="w-32" h="h-10" className="rounded-lg" />
            </div>
        </div>
    );
}

/* -- Charts and the dashboard ------------------------------------ */

export function SkeletonChart({ className, bars = 9 }) {
    // Fixed heights rather than random ones: a skeleton that reshuffles on
    // every render draws the eye to the wrong thing.
    const heights = [45, 70, 35, 85, 55, 95, 40, 75, 60, 50, 80, 65];

    return (
        <div className={cn("rounded-xl border border-gray-100 bg-white p-5 shadow-sm", className)}>
            <div className="mb-5 space-y-2">
                <Bar w="w-44" h="h-4" />
                <Bar w="w-64" h="h-2.5" />
            </div>
            <div className="flex h-44 items-end gap-2.5" aria-hidden="true">
                {Array.from({ length: bars }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 animate-pulse rounded-t bg-slate-200/80"
                        style={{ height: `${heights[i % heights.length]}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function SkeletonDonut({ className }) {
    return (
        <div className={cn("rounded-xl border border-gray-100 bg-white p-5 shadow-sm", className)}>
            <Bar w="w-40" h="h-4" className="mb-5" />
            <div className="flex items-center gap-6">
                <Dot size="h-32 w-32" className="shrink-0" />
                <div className="min-w-0 flex-1 space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Dot size="h-3 w-3" />
                            <Bar w="w-28" h="h-3" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SkeletonDashboard({ className }) {
    return (
        <div className={cn("space-y-4", className)}>
            <SkeletonStats count={4} />
            <div className="grid gap-4 lg:grid-cols-2">
                <SkeletonChart />
                <SkeletonDonut />
            </div>
            <SkeletonTable rows={5} columns={5} />
        </div>
    );
}

/* -- Smaller places ---------------------------------------------- */

/** The notification dropdown while its list is being fetched. */
export function SkeletonNotifications({ count = 4 }) {
    return (
        <SkeletonScreen label="Loading notifications">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex gap-2.5 border-b border-gray-50 px-3 py-2.5 last:border-b-0"
                >
                    <Dot size="h-1.5 w-1.5" className="mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <Bar w="w-40" h="h-3.5" />
                        <Bar w="w-full" h="h-2.5" />
                        <Bar w="w-16" h="h-2" />
                    </div>
                </div>
            ))}
        </SkeletonScreen>
    );
}

/** A document or image being opened in the viewer. */
export function SkeletonDocument({ className }) {
    return (
        <div className={cn("flex h-full w-full items-center justify-center p-8", className)}>
            <div className="w-full max-w-md space-y-3">
                <Bar h="h-64" className="rounded-lg" />
                <Bar w="w-2/3" h="h-3" className="mx-auto" />
            </div>
        </div>
    );
}

/** A list of uploaded requirements. */
export function SkeletonRequirements({ count = 5, className }) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3"
                >
                    <Dot size="h-8 w-8" className="rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <Bar w="w-52" h="h-3.5" />
                        <Bar w="w-28" h="h-2.5" />
                    </div>
                    <Bar w="w-10" h="h-5" className="rounded-full" />
                </div>
            ))}
        </div>
    );
}
