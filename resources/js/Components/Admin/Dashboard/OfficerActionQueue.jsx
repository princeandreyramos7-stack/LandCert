import React, { useEffect, useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import {
    AlarmClock,
    ArrowRight,
    Award,
    CalendarClock,
    ChevronRight,
    Hourglass,
    ListFilter,
    MapPin,
    Undo2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

const HOUR = 3600 * 1000;

const FILTERS = {
    all: { label: "All due times", test: () => true },
    overdue: { label: "Overdue", test: (ms) => ms < 0 },
    day: { label: "Due within 24 hours", test: (ms) => ms < 24 * HOUR },
    three: { label: "Due within 3 days", test: (ms) => ms < 72 * HOUR },
};

const SHOWN = 4;

const time = (date) => date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
const sameDay = (a, b) => a.toDateString() === b.toDateString();

/** "Due in 4 hrs", "Due tomorrow, 11:00 AM", "Overdue by 2 days"... and how loud to say it. */
function dueLabel(dueIso, now) {
    const due = new Date(dueIso);
    const ms = due - now;

    if (ms < 0) {
        const hours = -ms / HOUR;
        const text =
            hours < 24
                ? `Overdue by ${Math.max(1, Math.round(hours))} hr${Math.round(hours) === 1 ? "" : "s"}`
                : `Overdue by ${Math.round(hours / 24)} day${Math.round(hours / 24) === 1 ? "" : "s"}`;
        return { text, tone: "bg-red-600 text-white", level: "overdue" };
    }

    const hours = ms / HOUR;
    if (hours < 24) {
        const rounded = Math.max(1, Math.round(hours));
        return {
            text: `Due in ${rounded} hr${rounded === 1 ? "" : "s"}`,
            tone: hours < 12 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800",
            level: hours < 12 ? "critical" : "soon",
        };
    }

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const when = sameDay(due, tomorrow)
        ? `tomorrow, ${time(due)}`
        : `${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time(due)}`;

    return { text: `Due ${when}`, tone: "bg-slate-100 text-slate-700", level: "later" };
}

/** "Today, 05:40 AM", "Yesterday, 03:15 PM", "Sep 30, 2026". */
function filedLabel(iso, now) {
    if (!iso) return null;
    const filed = new Date(iso);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (sameDay(filed, now)) return `Today, ${time(filed)}`;
    if (sameDay(filed, yesterday)) return `Yesterday, ${time(filed)}`;
    return filed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const ICONS = {
    overdue: { Icon: AlarmClock, tile: "bg-red-100 text-red-600" },
    critical: { Icon: AlarmClock, tile: "bg-red-50 text-red-600" },
    soon: { Icon: Hourglass, tile: "bg-amber-50 text-amber-700" },
    later: { Icon: CalendarClock, tile: "bg-blue-50 text-[#1a3a8f]" },
};

/**
 * "Needs Immediate Officer Action" (App\Support\OfficerActionQueue): every
 * application waiting on the Zoning Officer, soonest Citizen's Charter
 * deadline first.
 */
export default function OfficerActionQueue({ queue, className = "" }) {
    const [now, setNow] = useState(() => new Date());
    const [filter, setFilter] = useState("all");
    const [expanded, setExpanded] = useState(false);

    // Keep "Due in 4 hrs" true while the page stays open.
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60 * 1000);
        return () => clearInterval(timer);
    }, []);

    const items = queue?.items ?? [];
    const total = queue?.total ?? 0;
    const critical = queue?.critical ?? 0;

    const filtered = useMemo(
        () => items.filter((item) => FILTERS[filter].test(new Date(item.due_at) - now)),
        [items, filter, now],
    );
    const shown = expanded ? filtered : filtered.slice(0, SHOWN);

    return (
        <section className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}>
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-[#0d1f5c]/[0.04] px-3 py-2.5 sm:px-4">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-[#0d1f5c]">Needs Immediate Officer Action</h2>
                        {critical > 0 && (
                            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                                {critical} Critical
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                        Citizen&apos;s Charter deadlines on applications waiting for you
                    </p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-[#0d1f5c] hover:bg-blue-100"
                        >
                            <ListFilter className="h-3.5 w-3.5" />
                            {filter === "all" ? "Filter by Due Time" : FILTERS[filter].label}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Show</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={filter} onValueChange={(value) => { setFilter(value); setExpanded(false); }}>
                            {Object.entries(FILTERS).map(([key, { label }]) => (
                                <DropdownMenuRadioItem key={key} value={key}>
                                    {label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {shown.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                    {total === 0
                        ? "Nothing is waiting on you right now."
                        : "No applications match this due-time filter."}
                </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {shown.map((item, index) => {
                        const due = dueLabel(item.due_at, now);
                        const isRelease = item.stage === "release";
                        const { Icon, tile } = isRelease
                            ? { Icon: Award, tile: "bg-emerald-50 text-emerald-700" }
                            : ICONS[due.level];
                        const filed = filedLabel(item.filed_at, now);
                        // "Lot 4522-F", but not "Lot LOT-53" when the number already says so.
                        const lot = item.lot_number && (/^lot\b/i.test(item.lot_number) ? item.lot_number : `Lot ${item.lot_number}`);
                        const location = [item.barangay && `Brgy. ${item.barangay}`, lot]
                            .filter(Boolean)
                            .join(", ");
                        // The most pressing review gets the filled button, as on the
                        // board; releases are green; the rest stay quiet.
                        const buttonClass = isRelease
                            ? "bg-emerald-700 text-white hover:bg-emerald-800"
                            : index === 0 && due.level !== "later"
                              ? "bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90"
                              : "border border-blue-100 bg-blue-50 text-[#0d1f5c] hover:bg-blue-100";

                        return (
                            <li key={item.id} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:px-4">
                                <div className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:flex ${tile}`}>
                                    <Icon className="h-4 w-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900">
                                            {item.application_number || `Application #${item.id}`}
                                        </span>
                                        <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${due.tone}`}>{due.text}</span>
                                        {(item.zone || item.type_label) && (
                                            <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-800">
                                                {item.zone || item.type_label}
                                            </span>
                                        )}
                                        {item.returned && (
                                            <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[11px] font-semibold text-orange-800">
                                                <Undo2 className="h-3 w-3" /> Returned by Administrator
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 truncate text-sm font-semibold text-[#0d1f5c]" title={item.title}>{item.title}</p>
                                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-600">
                                        {location && (
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="h-3 w-3 shrink-0" /> {location}
                                            </span>
                                        )}
                                        {item.applicant && (
                                            <span>
                                                {location && <span className="mr-2 text-gray-300">•</span>}
                                                Applicant: <span className="font-semibold text-gray-800">{item.applicant}</span>
                                            </span>
                                        )}
                                        {filed && (
                                            <span>
                                                <span className="mr-2 text-gray-300">•</span>
                                                Filed: {filed}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <Link
                                    href={item.action.href}
                                    className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${buttonClass}`}
                                >
                                    {item.action.label}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-[#0d1f5c]/[0.03] px-3 py-2 text-xs sm:px-4">
                <span className="text-gray-600">
                    Showing {shown.length} of {filtered.length} application{filtered.length === 1 ? "" : "s"} waiting on you
                    {filtered.length > SHOWN && (
                        <button
                            type="button"
                            onClick={() => setExpanded((open) => !open)}
                            className="ml-2 font-semibold text-[#1a3a8f] underline-offset-2 hover:underline"
                        >
                            {expanded ? "Show fewer" : "Show all"}
                        </button>
                    )}
                </span>
                <Link href="/applications" className="inline-flex items-center gap-1 font-semibold text-[#0d1f5c] hover:underline">
                    Open All {total} Active Review{total === 1 ? "" : "s"}
                    <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </footer>
        </section>
    );
}
