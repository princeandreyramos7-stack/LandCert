import React, { useMemo, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { journeyOf, bucketOf, TONES } from "@/lib/applicantJourney";
import { JourneyTrack, followAction } from "@/Components/Applicant/JourneyPanel";
import {
    Search, MapPin, Calendar, Printer, Eye, ArrowRight, FilePlus, Inbox, AlertCircle, ExternalLink,
} from "lucide-react";

const fmtDate = (ds) => (ds ? new Date(ds).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—");
const peso = (n) => (n == null || n === "" ? null : `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`);

const TYPE_NAMES = { CZC: "Certificate of Zoning Compliance", SUP: "Special Use Permit", TUP: "Temporary Use Permit", ZC: "Zoning Certification" };

const FILTERS = [
    { key: "all", label: "All" },
    { key: "action", label: "Needs my action" },
    { key: "progress", label: "In progress" },
    { key: "done", label: "Ready" },
    { key: "denied", label: "Denied" },
];

const go = followAction;

function ApplicationCard({ app }) {
    const journey = journeyOf(app);
    const tone = TONES[journey.tone];
    const type = String(app.project_type || "").toUpperCase();
    const details = route("my-applications.show", app.id);
    const location = [app.project_location_barangay, app.project_location_city || "City of Ilagan"].filter(Boolean).join(", ");

    return (
        <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${journey.needsAction ? "border-[#d4a017]/50" : "border-gray-100"}`}>
            {journey.needsAction && (
                <div className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold ${tone.soft} ${tone.text}`}>
                    <AlertCircle className="h-3.5 w-3.5" /> Action needed
                </div>
            )}
            <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-[#0d1f5c] px-2 py-0.5 font-mono text-[11px] font-bold text-white">{app.application_number || `#${app.id}`}</span>
                            {type && <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700" title={TYPE_NAMES[type]}>{type}</span>}
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${tone.badge}`}>{journey.label}</span>
                        </div>
                        <Link href={details} className="mt-2 block truncate text-base font-black text-[#0d1f5c] hover:underline">
                            {app.project_nature || TYPE_NAMES[type] || "Application"}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            {location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-gray-400" />{location}</span>}
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-gray-400" />Filed {fmtDate(app.created_at)}</span>
                            {peso(app.report_amount) && journey.stage >= 3 && <span className="font-semibold text-gray-700">Fee {peso(app.report_amount)}</span>}
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <button type="button" onClick={() => window.open(route("my-applications.print", app.id), "_blank")} title="Print application form" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-[#0d1f5c]">
                            <Printer className="h-4 w-4" />
                        </button>
                        <Link href={details} title="View details" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-[#0d1f5c]">
                            <Eye className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="mt-4">
                    <JourneyTrack journey={journey} />
                </div>

                <div className={`mt-4 flex flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center ${journey.needsAction ? tone.soft : "bg-gray-50"}`}>
                    <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold ${journey.needsAction ? tone.text : "text-gray-800"}`}>{journey.headline}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{journey.note}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                        {journey.secondary && (
                            <Button variant="outline" size="sm" onClick={() => go(journey.secondary, app)} className="h-9 gap-1.5 border-gray-200 bg-white text-xs font-semibold">
                                <Printer className="h-3.5 w-3.5" /> {journey.secondary.label}
                            </Button>
                        )}
                        {journey.action && (
                            <Button size="sm" onClick={() => go(journey.action, app)} className={`h-9 gap-1.5 text-xs font-bold ${journey.needsAction ? "bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90" : "border border-gray-200 bg-white text-[#0d1f5c] hover:bg-gray-50"}`}>
                                {journey.action.label}
                                {journey.action.newTab ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

/**
 * The applicant's applications: each one a card with how far it has come,
 * what happens next, and the one button that matters right now.
 */
export function MyApplicationsList({ applications }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const paged = applications?.data ? applications : { data: applications || [], total: applications?.length || 0 };
    const list = paged.data || [];
    const currentPage = paged.current_page || 1;
    const lastPage = paged.last_page || 1;

    const counts = useMemo(() => {
        const c = { all: list.length, action: 0, progress: 0, done: 0, denied: 0 };
        for (const app of list) {
            if (journeyOf(app).failed) c.denied++;
            else c[bucketOf(app)]++;
        }
        return c;
    }, [list]);

    const shown = useMemo(() => {
        const term = search.trim().toLowerCase();
        return list.filter((app) => {
            if (filter === "denied" && !journeyOf(app).failed) return false;
            if (["action", "progress", "done"].includes(filter) && (journeyOf(app).failed || bucketOf(app) !== filter)) return false;
            if (!term) return true;
            return [app.application_number, app.project_nature, app.project_type, app.project_location_barangay, app.project_location_city]
                .some((f) => String(f ?? "").toLowerCase().includes(term));
        });
    }, [list, filter, search]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-black text-[#0d1f5c]">My Applications</h1>
                    <p className="mt-0.5 text-sm text-gray-500">
                        {counts.action > 0
                            ? <><span className="font-bold text-[#d4a017]">{counts.action}</span> {counts.action === 1 ? "needs" : "need"} something from you.</>
                            : list.length ? "Nothing needs your attention right now." : "You have not filed an application yet."}
                    </p>
                </div>
                <Link href="/request" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#d4a017] px-4 py-2.5 text-sm font-bold text-[#0d1f5c] shadow hover:bg-[#b8880d] hover:text-white">
                    <FilePlus className="h-4 w-4" /> New Application
                </Link>
            </div>

            {/* Filters */}
            {list.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setFilter(f.key)}
                                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${filter === f.key ? "bg-[#0d1f5c] text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}`}
                            >
                                {f.label} <span className={`ml-1 ${filter === f.key ? "text-white/70" : "text-gray-400"}`}>{counts[f.key]}</span>
                            </button>
                        ))}
                    </div>
                    <div className="relative sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search number, project, barangay"
                            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-[#0d1f5c] focus:outline-none focus:ring-2 focus:ring-[#0d1f5c]/20"
                        />
                    </div>
                </div>
            )}

            {/* Cards */}
            {shown.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d1f5c]/5 text-[#0d1f5c]/40"><Inbox className="h-7 w-7" /></span>
                    <h3 className="mt-3 text-base font-bold text-gray-800">{list.length ? "Nothing here" : "No applications yet"}</h3>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                        {list.length ? "Try another filter or search term." : "Start your first application — it takes about ten minutes and you can print the form for notarization right after."}
                    </p>
                    {!list.length && (
                        <Link href="/request" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0d1f5c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0d1f5c]/90">
                            <FilePlus className="h-4 w-4" /> Start an application
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {shown.map((app) => <ApplicationCard key={app.id} app={app} />)}
                </div>
            )}

            {/* Pages */}
            {lastPage > 1 && (
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm">
                    <span className="text-gray-500">Page {currentPage} of {lastPage}</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => router.get(route("my-applications"), { page: currentPage - 1 }, { preserveState: true })}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={currentPage >= lastPage} onClick={() => router.get(route("my-applications"), { page: currentPage + 1 }, { preserveState: true })}>Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
