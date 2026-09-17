import { Head, Link, useForm } from "@inertiajs/react";
import {
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    SearchX,
    Clock,
    QrCode,
    Search,
} from "lucide-react";

/**
 * The public verification page - what the QR on a printed certificate or
 * clearance opens (/verify/{code}), and the form for typing a code in
 * (/verify).
 *
 * Written for someone holding the paper at another counter: one verdict,
 * large, then the facts on the sheet to compare against. No sign-in, no
 * layout chrome - it should read as clearly on a phone as on a desk.
 */

const VERDICTS = {
    valid: {
        Icon: ShieldCheck,
        label: "VALID",
        headline: "This document is genuine and in force.",
        detail: "It was issued by the City Planning and Development Office and has not been revoked.",
        tone: "bg-emerald-600",
        ring: "ring-emerald-200",
    },
    expired: {
        Icon: Clock,
        label: "EXPIRED",
        headline: "This document is genuine but its validity period has ended.",
        detail: "The holder needs to apply for a renewal at the CPDO.",
        tone: "bg-amber-500",
        ring: "ring-amber-200",
    },
    revoked: {
        Icon: ShieldX,
        label: "REVOKED",
        headline: "This document has been revoked by the CPDO.",
        detail: "It is no longer valid for any purpose, even if the paper copy looks in order.",
        tone: "bg-red-600",
        ring: "ring-red-200",
    },
    cancelled: {
        Icon: ShieldAlert,
        label: "CANCELLED",
        headline: "This document was cancelled before it was released.",
        detail: "Any copy in circulation is not an issued document.",
        tone: "bg-red-600",
        ring: "ring-red-200",
    },
    not_found: {
        Icon: SearchX,
        label: "NOT FOUND",
        headline: "No document matches this code.",
        detail: "Check the code against the paper. If it still does not match, the document was not issued by this office.",
        tone: "bg-slate-600",
        ring: "ring-slate-200",
    },
};

function longDate(value) {
    if (!value) return "—";
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function Row({ label, value, mono = false }) {
    return (
        <div className="grid grid-cols-1 gap-0.5 py-2.5 sm:grid-cols-[180px_1fr] sm:gap-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className={`text-sm text-slate-900 ${mono ? "font-mono" : ""}`}>{value || "—"}</dd>
        </div>
    );
}

function LookupForm({ initial = "" }) {
    const { data, setData, post, processing, errors } = useForm({ code: initial });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                post(route("verify.lookup"));
            }}
            className="flex flex-col gap-2 sm:flex-row"
        >
            <div className="flex-1">
                <label htmlFor="code" className="sr-only">Verification code</label>
                <input
                    id="code"
                    name="code"
                    value={data.code}
                    onChange={(e) => setData("code", e.target.value.toUpperCase())}
                    placeholder="Code printed under the QR, e.g. QFJK8DU36NQD"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    maxLength={32}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-base uppercase tracking-widest text-slate-900 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#1a3a8f] focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/30"
                />
                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            </div>
            <button
                type="submit"
                disabled={processing || !data.code.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a3a8f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#15307a] disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Search className="h-4 w-4" />
                Verify
            </button>
        </form>
    );
}

export default function Certificate({ code, result }) {
    const verdict = result ? VERDICTS[result.status] || VERDICTS.not_found : null;
    const found = result && result.status !== "not_found";

    return (
        <div className="min-h-screen bg-[#f0f4ff] text-slate-900">
            <Head title={verdict ? `${verdict.label} — Document Verification` : "Document Verification"} />

            {/* Header */}
            <header className="bg-gradient-to-br from-[#0a1848] via-[#0d1f5c] to-[#112068] text-white">
                <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-5 sm:px-6">
                    <img src="/images/ilagan1logo.png" alt="City of Ilagan" className="h-14 w-14 shrink-0 object-contain" />
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                            Republic of the Philippines · City of Ilagan, Isabela
                        </p>
                        <h1 className="text-lg font-black leading-tight sm:text-xl">
                            City Planning &amp; Development Office
                        </h1>
                        <p className="text-sm text-blue-100">Zoning document verification</p>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                {/* Verdict */}
                {verdict && (
                    <section
                        className={`rounded-2xl ${verdict.tone} p-6 text-white shadow-lg ring-8 ${verdict.ring} sm:p-8`}
                        role="status"
                        aria-live="polite"
                    >
                        <div className="flex items-start gap-4">
                            <verdict.Icon className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" strokeWidth={2.25} />
                            <div className="min-w-0">
                                <p className="text-3xl font-black tracking-wide sm:text-4xl">{verdict.label}</p>
                                <p className="mt-2 text-base font-semibold sm:text-lg">{verdict.headline}</p>
                                <p className="mt-1 text-sm text-white/85">{verdict.detail}</p>
                                {result?.status === "revoked" && result.revocation_reason && (
                                    <p className="mt-3 rounded-lg bg-black/20 px-3 py-2 text-sm">
                                        <span className="font-semibold">Reason:</span> {result.revocation_reason}
                                        {result.revoked_at && <> · {longDate(result.revoked_at)}</>}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Facts on the sheet */}
                {found && (
                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-[#1a3a8f]">
                            Compare with the paper
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Every line below should match what is printed on the document you are holding.
                        </p>
                        <dl className="mt-4 divide-y divide-slate-100">
                            <Row label="Document" value={result.document} />
                            <Row label="Certificate No." value={result.certificate_number} mono />
                            <Row label="Application No." value={result.application_number} mono />
                            {result.decision_number && <Row label="Decision No." value={result.decision_number} mono />}
                            <Row label="Issued to" value={result.issued_to} />
                            <Row
                                label="Project"
                                value={result.project_nature
                                    ? `${result.project_nature}${result.project_type ? ` (${result.project_type})` : ""}`
                                    : result.project_type}
                            />
                            <Row
                                label="Location"
                                value={[result.barangay ? `Brgy. ${result.barangay}` : null, result.municipality].filter(Boolean).join(", ")}
                            />
                            <Row label="Date issued" value={longDate(result.issued_at)} />
                            <Row label="Valid until" value={longDate(result.valid_until)} />
                            <Row label="Verification code" value={code} mono />
                        </dl>
                        <p className="mt-4 text-xs text-slate-400">
                            Checked {new Date(result.checked_at).toLocaleString("en-PH")}. If the paper says something
                            different from this page, the paper has been altered — trust this page.
                        </p>
                    </section>
                )}

                {/* Lookup */}
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-[#1a3a8f]" />
                        <h2 className="text-sm font-bold uppercase tracking-wide text-[#1a3a8f]">
                            {verdict ? "Verify another document" : "Verify a document"}
                        </h2>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                        Scan the QR code on the certificate or clearance, or type the code printed beneath it.
                    </p>
                    <div className="mt-4">
                        <LookupForm initial={verdict && !found ? code || "" : ""} />
                    </div>
                </section>

                <footer className="mt-8 text-center text-xs text-slate-500">
                    <p>
                        This page is the official verification service of the City Planning &amp; Development Office,
                        City of Ilagan. For questions, visit the office or{" "}
                        <Link href="/" className="font-semibold text-[#1a3a8f] hover:underline">go to the home page</Link>.
                    </p>
                </footer>
            </main>
        </div>
    );
}
