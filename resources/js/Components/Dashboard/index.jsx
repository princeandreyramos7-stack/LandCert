import React, { useEffect, useMemo, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { journeyOf, bucketOf, TONES, STAGES } from "@/lib/applicantJourney";
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    FilePlus,
    FileText,
    MapPin,
    Sparkles,
    XCircle,
} from "lucide-react";

/*
 * The applicant's dashboard: a landmark photo banner, "your next step" for
 * the application that most needs them, the counts, and their applications
 * with a progress track each. Statuses, counts and actions all come from
 * journeyOf() (lib/applicantJourney) - the same as My Applications.
 */

const PHOTOS = [
    { src: "/images/hero/ilagan-butaka.jpg", place: "World's Largest Butaka", focus: "50% 60%" },
    { src: "/images/hero/ilagan-capital-arena.jpg", place: "The Capital Arena", focus: "50% 45%" },
    { src: "/images/hero/ilagan-city-hall.jpg", place: "City of Ilagan City Hall", focus: "50% 35%" },
    { src: "/images/hero/ilagan-city-arch.jpg", place: "City of Ilagan Welcome Arch", focus: "50% 40%" },
];

/* ── shared data + pieces ───────────────────────────────────────────── */

function useDashboard(requests) {
    const { auth } = usePage().props;
    const name = auth?.user?.name || "User";
    const data = requests?.data || requests || [];

    const stats = useMemo(() => {
        const c = { total: data.length, action: 0, progress: 0, done: 0, denied: 0 };
        for (const r of data) {
            if (journeyOf(r).failed) c.denied++;
            else c[bucketOf(r)]++;
        }
        return c;
    }, [data]);

    // Anything that needs the applicant first, then the newest (as today).
    const sorted = useMemo(() => {
        const rank = (r) => (journeyOf(r).needsAction ? 0 : 1);
        return [...data].sort((a, b) => rank(a) - rank(b));
    }, [data]);

    return { firstName: name.split(" ")[0], data, stats, recent: sorted.slice(0, 5), next: sorted.find((r) => journeyOf(r).needsAction) };
}

function greeting() {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function formatDate(ds) {
    if (!ds) return "—";
    return new Date(ds).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

function go(app, action) {
    const url = route(action.route, app.id);
    action.newTab ? window.open(url, "_blank") : router.visit(url);
}

function ActionButton({ app, journey, solid, className = "" }) {
    if (!journey.action) return null;
    return (
        <button
            type="button"
            onClick={() => go(app, journey.action)}
            className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                solid ?? journey.needsAction ? "bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90" : "text-[#0d1f5c] hover:bg-[#0d1f5c]/5"
            } ${className}`}
        >
            {journey.action.label}
            <ArrowRight className="h-3.5 w-3.5" />
        </button>
    );
}

function StatusBadge({ journey }) {
    const tone = TONES[journey.tone];
    return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${tone.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${tone.bar}`} />
            {journey.label}
        </span>
    );
}


/** The five-step track (Submitted → Certificate) for one application. */
function Track({ journey, compact = false, dark = false }) {
    const done = journey.stage >= 5;
    return (
        <ol className="flex items-center gap-1" aria-label={`Step ${Math.min(journey.stage + 1, 5)} of 5`}>
            {STAGES.map((label, i) => {
                const passed = done || i < journey.stage;
                const current = !done && i === journey.stage;
                const color = journey.failed && current
                    ? "bg-rose-500"
                    : passed
                      ? "bg-emerald-500"
                      : current
                        ? TONES[journey.tone].bar
                        : dark ? "bg-white/20" : "bg-gray-200";
                return (
                    <li key={label} className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className={`h-1.5 rounded-full ${color}`} />
                        {!compact && (
                            <span className={`truncate text-[10px] font-semibold ${current ? (dark ? "text-white" : "text-gray-900") : dark ? "text-white/50" : "text-gray-400"}`}>
                                {label}
                            </span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

function OfficeNote({ app, className = "" }) {
    if (!app.office_note) return null;
    return (
        <p className={`text-xs text-gray-600 ${className}`} title={app.office_note}>
            <span className="font-semibold text-[#0d1f5c]">Note from the Zoning Office: </span>
            {app.office_note}
        </p>
    );
}


function EmptyState({ dark = false }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${dark ? "bg-white/10" : "bg-[#0d1f5c]/5"}`}>
                <FileText className={`h-8 w-8 ${dark ? "text-white/60" : "text-[#0d1f5c]/30"}`} />
            </div>
            <h3 className={`mb-1 text-base font-bold ${dark ? "text-white" : "text-gray-700"}`}>No Applications Yet</h3>
            <p className={`mb-5 max-w-xs text-sm ${dark ? "text-blue-100/70" : "text-gray-400"}`}>Start by submitting your first land use permit application.</p>
            <Link href="/request" className="flex items-center gap-2 rounded-lg bg-[#d4a017] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#b8880d]">
                <FilePlus className="h-4 w-4" /> Start New Application
            </Link>
        </div>
    );
}

const STAT_DEFS = (s) => [
    { key: "total", label: "Total Applications", value: s.total, icon: FileText, desc: "All you have filed", tone: "text-[#0d1f5c]", soft: "bg-[#0d1f5c]/10" },
    { key: "action", label: "Needs My Action", value: s.action, icon: AlertCircle, desc: s.action ? "Something to do below" : "Nothing waiting on you", tone: "text-[#b8880d]", soft: "bg-[#d4a017]/15" },
    { key: "progress", label: "With the Office", value: s.progress, icon: Clock, desc: "Being verified, approved or prepared", tone: "text-blue-600", soft: "bg-blue-50" },
    { key: "done", label: "Ready", value: s.done, icon: CheckCircle, desc: "Document ready to download", tone: "text-emerald-600", soft: "bg-emerald-50" },
    { key: "denied", label: "Denied", value: s.denied, icon: XCircle, desc: "Can be corrected and resubmitted", tone: "text-rose-500", soft: "bg-rose-50" },
];

export function Dashboard({ requests }) {
    const { firstName, stats, recent, next } = useDashboard(requests);
    const [slide, setSlide] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setSlide((i) => (i + 1) % PHOTOS.length), 7000);
        return () => clearInterval(t);
    }, []);
    const nextJourney = next && journeyOf(next);

    return (
        <div className="space-y-6">
            <section className="relative isolate overflow-hidden rounded-3xl text-white">
                {PHOTOS.map((p, i) => (
                    <img key={p.src} src={p.src} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-[1500ms]" style={{ opacity: i === slide ? 1 : 0, objectPosition: p.focus }} />
                ))}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0d1f5c] via-[#0d1f5c]/85 to-[#0d1f5c]/40" />
                <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between lg:p-10">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5c842]">CPDO · City of Ilagan</p>
                        <h1 className="mt-2 text-3xl font-black lg:text-4xl">{greeting()}, {firstName}!</h1>
                        <p className="mt-1 text-sm text-blue-100/85">Track and manage your land use permit applications in one place.</p>
                    </div>
                    <Link href="/request" className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-[#d4a017] px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-[#b8880d] sm:self-auto">
                        <FilePlus className="h-4 w-4" /> New Application
                    </Link>
                </div>
                <p className="absolute bottom-3 right-5 hidden items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-white/60 sm:flex">
                    <MapPin className="h-3 w-3" /> {PHOTOS[slide].place}
                </p>
            </section>

            {next && (
                <section className={`rounded-2xl border-2 bg-white p-5 shadow-sm sm:p-6 ${nextJourney.failed ? "border-rose-200" : "border-[#d4a017]/50"}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <div className="flex items-center gap-3 lg:w-64 lg:shrink-0">
                            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONES[nextJourney.tone].soft}`}>
                                <Sparkles className={`h-5 w-5 ${TONES[nextJourney.tone].text}`} />
                            </span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#d4a017]">Your next step</p>
                                <p className="font-mono text-xs font-bold text-[#0d1f5c]">{next.application_number || `#${next.id}`}</p>
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900">{nextJourney.headline}</p>
                            <p className="mt-0.5 text-sm text-gray-600">{nextJourney.note}</p>
                            <div className="mt-3 max-w-xl"><Track journey={nextJourney} /></div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {nextJourney.secondary && (
                                <button type="button" onClick={() => go(next, nextJourney.secondary)} className="rounded-lg border border-[#0d1f5c]/20 px-3 py-2 text-xs font-bold text-[#0d1f5c] hover:bg-[#0d1f5c]/5">
                                    {nextJourney.secondary.label}
                                </button>
                            )}
                            <ActionButton app={next} journey={nextJourney} solid className="px-4 py-2" />
                        </div>
                    </div>
                </section>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {STAT_DEFS(stats).map((s) => (
                    <div key={s.key} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{s.label}</p>
                            <s.icon className={`h-4 w-4 ${s.tone}`} />
                        </div>
                        <p className={`mt-2 text-3xl font-black ${s.tone}`}>{s.value}</p>
                        <p className="mt-0.5 text-[11px] text-gray-400">{s.desc}</p>
                    </div>
                ))}
            </div>

            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <header className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
                    <div>
                        <h2 className="text-base font-black text-[#0d1f5c]">Your Applications</h2>
                        <p className="mt-0.5 text-xs text-gray-400">{stats.action ? `${stats.action} waiting on you - shown first` : "Newest first"}</p>
                    </div>
                    <Link href="/my-applications" className="flex items-center gap-1.5 text-xs font-bold text-[#0d1f5c] hover:text-[#d4a017]">
                        View All <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </header>
                {recent.length === 0 ? <EmptyState /> : (
                    <ul className="divide-y divide-gray-50">
                        {recent.map((app) => {
                            const j = journeyOf(app);
                            return (
                                <li key={app.id} className="grid gap-3 px-6 py-4 hover:bg-gray-50/60 lg:grid-cols-[1.4fr_1fr_auto] lg:items-center">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link href={route("my-applications.show", app.id)} className="font-mono text-xs font-bold text-[#0d1f5c] hover:underline">
                                                {app.application_number || `#${app.id}`}
                                            </Link>
                                            <span className="rounded bg-[#0d1f5c]/5 px-1.5 py-0.5 text-[10px] font-black text-[#0d1f5c]">{String(app.project_type || "APP").toUpperCase()}</span>
                                            <span className="flex items-center gap-1 text-[11px] text-gray-400"><Calendar className="h-3 w-3" />{formatDate(app.created_at)}</span>
                                        </div>
                                        <p className="mt-1 truncate text-sm font-bold text-gray-900">{app.project_nature || "Application"}</p>
                                        <p className={`truncate text-xs ${j.needsAction ? `font-semibold ${TONES[j.tone].text}` : "text-gray-500"}`}>{j.headline}</p>
                                        <OfficeNote app={app} className="mt-0.5 truncate" />
                                    </div>
                                    <Track journey={j} />
                                    <div className="flex items-center justify-between gap-2 lg:justify-end">
                                        <StatusBadge journey={j} />
                                        <ActionButton app={app} journey={j} />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
