import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    Building2,
    Clock,
    Info,
    Mail,
    MapPin,
    Phone,
    Printer,
} from "lucide-react";
import { IconButton } from "@/Components/ui/icon-button";

/**
 * Renders any one of the published notices.
 *
 * One page for all four: the text lives in App\Support\LegalDocuments so
 * that the sign-up consent, the footer and these pages cannot drift apart.
 * Reachable without signing in - a person deciding whether to register has
 * to be able to read what they would be agreeing to.
 */

/* ── The blocks a section can be built from ───────────────────────── */

function Block({ block }) {
    switch (block.type) {
        case "p":
            return (
                <p className="text-[15px] leading-relaxed text-gray-700">{block.text}</p>
            );

        case "ul":
            return (
                <ul className="space-y-2">
                    {block.items.map((item, i) => (
                        <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-gray-700">
                            <span
                                aria-hidden="true"
                                className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4a017]"
                            />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            );

        case "table":
            return (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {block.head.map((h) => (
                                    <th
                                        key={h}
                                        scope="col"
                                        className="border-b border-gray-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[#0d1f5c]"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {block.rows.map((row, r) => (
                                <tr key={r} className="align-top even:bg-gray-50/50">
                                    {row.map((cell, c) => (
                                        <td
                                            key={c}
                                            className={`border-b border-gray-100 px-4 py-3 leading-relaxed text-gray-700 ${
                                                c === 0 ? "font-semibold text-[#0d1f5c]" : ""
                                            }`}
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

        case "note":
            return (
                <div className="flex gap-3 rounded-lg border-l-4 border-[#d4a017] bg-[#d4a017]/5 px-4 py-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a017]" aria-hidden="true" />
                    <p className="text-sm leading-relaxed text-gray-700">{block.text}</p>
                </div>
            );

        default:
            return null;
    }
}

/* ── Page ─────────────────────────────────────────────────────────── */

/** "2026-09-20" as "20 September 2026". */
function longDate(value) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-PH", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

/** "Who is responsible" -> "who-is-responsible", for the contents links. */
function slug(heading) {
    return heading
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export default function LegalShow({ doc, documents }) {
    const { auth } = usePage().props;
    const backTo = auth?.user ? "/dashboard" : "/";

    return (
        <>
            <Head title={`${doc.title} — CPDO Land Certification`} />

            <div className="min-h-screen bg-[#f5f7ff]">
                {/* Masthead */}
                <header
                    className="print:hidden"
                    style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}
                >
                    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <Link
                                href={backTo}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 transition-colors hover:text-[#d4a017]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {auth?.user ? "Back to the system" : "Back to the home page"}
                            </Link>

                            <IconButton
                                label="Print this notice"
                                hint="Opens your browser's print dialog"
                                icon={Printer}
                                onClick={() => window.print()}
                                className="text-blue-200 hover:bg-white/10 hover:text-white"
                            />
                        </div>

                        <div className="mt-5 flex items-start gap-3">
                            <img
                                src="/images/Ilagan-64.png"
                                alt=""
                                aria-hidden="true"
                                className="h-11 w-11 shrink-0 object-contain"
                            />
                            <div className="min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d4a017]">
                                    City Planning and Development Office
                                </p>
                                <h1 className="mt-0.5 text-2xl font-black text-white sm:text-3xl">
                                    {doc.title}
                                </h1>
                                <p className="mt-1 text-sm text-blue-200">
                                    City of Ilagan, Isabela · Land Certification System
                                </p>
                            </div>
                        </div>

                        {/* The other notices */}
                        <nav aria-label="Notices" className="mt-5 flex flex-wrap gap-2">
                            {documents.map((other) => {
                                const current = other.key === doc.key;
                                return (
                                    <Link
                                        key={other.key}
                                        href={other.url}
                                        aria-current={current ? "page" : undefined}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                                            current
                                                ? "bg-[#d4a017] text-white"
                                                : "bg-white/10 text-blue-100 hover:bg-white/20"
                                        }`}
                                    >
                                        {other.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                    {/* Version line */}
                    <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border border-gray-100 bg-white px-5 py-3.5 text-sm shadow-sm">
                        <span className="text-gray-500">
                            Version{" "}
                            <span className="font-bold text-[#0d1f5c]">{doc.version}</span>
                        </span>
                        <span className="text-gray-500">
                            In effect from{" "}
                            <span className="font-bold text-[#0d1f5c]">
                                {longDate(doc.effective)}
                            </span>
                        </span>
                    </div>

                    {/* Opening paragraph */}
                    <p className="mb-8 border-l-4 border-[#0d1f5c]/20 pl-5 text-base leading-relaxed text-gray-800">
                        {doc.intro}
                    </p>

                    {/* Contents */}
                    <nav
                        aria-label="Contents"
                        className="mb-8 rounded-xl border border-gray-100 bg-white p-5 shadow-sm print:hidden"
                    >
                        <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-gray-400">
                            On this page
                        </h2>
                        <ol className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                            {doc.sections.map((section, i) => (
                                <li key={section.heading} className="flex gap-2 text-sm">
                                    <span className="font-bold text-[#d4a017]">{i + 1}.</span>
                                    <a
                                        href={`#${slug(section.heading)}`}
                                        className="text-gray-600 underline-offset-2 hover:text-[#0d1f5c] hover:underline"
                                    >
                                        {section.heading}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>

                    {/* Body */}
                    <article className="space-y-8">
                        {doc.sections.map((section, i) => (
                            <section
                                key={section.heading}
                                id={slug(section.heading)}
                                className="scroll-mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                            >
                                <h2 className="mb-4 flex items-baseline gap-3 text-lg font-black text-[#0d1f5c]">
                                    <span className="text-sm font-black text-[#d4a017]">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    {section.heading}
                                </h2>
                                <div className="space-y-4">
                                    {section.content.map((block, b) => (
                                        <Block key={b} block={block} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </article>

                    {/* Who to write to */}
                    <section
                        id="contact"
                        className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                    >
                        <h2 className="mb-4 text-lg font-black text-[#0d1f5c]">
                            Getting in touch
                        </h2>
                        <p className="mb-4 text-[15px] leading-relaxed text-gray-700">
                            Questions about this notice, and requests to exercise any right
                            described in it, should be addressed to:
                        </p>
                        <dl className="grid gap-3 sm:grid-cols-2">
                            {[
                                [Building2, "Office", `${doc.contact.office} — ${doc.contact.unit}`],
                                [MapPin, "Address", doc.contact.address],
                                [Mail, "Email", doc.contact.email],
                                [Phone, "Telephone", doc.contact.phone],
                                [Clock, "Office hours", doc.contact.hours],
                            ].map(([Icon, label, value]) => (
                                <div key={label} className="flex gap-3">
                                    <Icon
                                        className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a017]"
                                        aria-hidden="true"
                                    />
                                    <div className="min-w-0">
                                        <dt className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                            {label}
                                        </dt>
                                        <dd className="text-sm text-gray-700">{value}</dd>
                                    </div>
                                </div>
                            ))}
                        </dl>
                        <p className="mt-5 border-t border-gray-100 pt-4 text-sm text-gray-500">
                            You may also complain to the National Privacy Commission at{" "}
                            <a
                                href="https://privacy.gov.ph"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-[#0d1f5c] underline underline-offset-2"
                            >
                                privacy.gov.ph
                            </a>{" "}
                            if you believe your rights under the Data Privacy Act have not been
                            respected.
                        </p>
                    </section>

                    <p className="mt-8 text-center text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} City Planning and Development Office,
                        City of Ilagan, Isabela. {doc.title}, version {doc.version}.
                    </p>
                </main>
            </div>
        </>
    );
}
