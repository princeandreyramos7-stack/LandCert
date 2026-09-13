import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { TablePagination } from "@/Components/ui/table-pagination";
import SealWatermark from "@/Components/SealWatermark";
import FitToWidth from "@/Components/FitToWidth";
import OrderOfPaymentSheet from "@/Components/OrderOfPaymentSheet";
import CertificateSheet from "@/Components/CertificateSheet";
import ClearanceSheet from "@/Components/ClearanceSheet";
import ApplicationFormSheet from "@/Components/ApplicationFormSheet";
import {
    FileBarChart, User, CalendarDays, UserCheck,
    FileDown, FileSpreadsheet, Search, Printer, Eye, Loader2,
    FileText, Receipt, Banknote, Paperclip, Award, X, FolderOpen,
    ArrowUpRight, ChevronDown, ChevronUp,
} from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const REPORTS = [
    {
        key: "applicant",
        title: "By Applicant",
        blurb: "Every transaction on file for one applicant — form, order of payment, receipt and requirements.",
        icon: User,
        accent: "text-[#0d1f5c]",
        ring: "bg-[#0d1f5c]/10 border-[#0d1f5c]/20",
    },
    {
        key: "period",
        title: "By Month & Year",
        blurb: "Everything filed in a given month — or across a whole year.",
        icon: CalendarDays,
        accent: "text-[#d4a017]",
        ring: "bg-[#d4a017]/10 border-[#d4a017]/20",
    },
    {
        key: "officer",
        title: "By Zoning Officer",
        blurb: "Applications a Zoning Officer has reviewed or processed.",
        icon: UserCheck,
        accent: "text-emerald-700",
        ring: "bg-emerald-500/10 border-emerald-500/20",
    },
];

const REPORT_KEYS = REPORTS.map((r) => r.key);

const peso = (value) =>
    value === null || value === undefined || value === ""
        ? null
        : new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value));

const date = (value, withTime = false) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-PH", {
        year: "numeric", month: "short", day: "numeric",
        ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    });
};

const titleCase = (value) =>
    value ? String(value).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;

/**
 * Resolves once every picture in the printed pack under `root` has either
 * loaded or given up — or after `timeoutMs`, so a single stuck download cannot
 * hold the printer hostage. A picture that fails is printed as the browser's
 * broken-image box, which is honest about what happened; a picture that has
 * not finished yet would print as nothing at all.
 *
 * Only the pack's pictures: the on-screen previews load lazily as they scroll
 * into view, and one that never has would be waited on forever.
 */
async function waitForImages(root, timeoutMs = 30000) {
    if (!root) return;
    const images = Array.from(root.querySelectorAll(".pack-page img")).filter((img) => img.loading !== "lazy");
    const broken = (img) => img.complete && img.naturalWidth === 0;
    const settle = (img) =>
        new Promise((resolve) => {
            const done = () => resolve();
            if (img.complete && img.naturalWidth > 0) {
                // Loaded, but possibly not decoded; decoding it now means the
                // printer does not have to.
                (img.decode ? img.decode() : Promise.resolve()).then(done, done);
                return;
            }
            if (img.complete) return done(); // failed
            img.addEventListener("load", () => (img.decode ? img.decode() : Promise.resolve()).then(done, done), { once: true });
            img.addEventListener("error", done, { once: true });
        });
    const deadline = new Promise((resolve) => setTimeout(resolve, timeoutMs));

    await Promise.race([Promise.all(images.map(settle)), deadline]);

    // A download the browser abandoned part-way — it does that when the same
    // scan is asked for by several pictures at once — leaves a broken image.
    // One more try, alone this time, usually brings it in.
    const retry = images.filter(broken);
    if (retry.length) {
        retry.forEach((img) => {
            const src = img.getAttribute("src");
            img.removeAttribute("src");
            img.setAttribute("src", src);
        });
        await Promise.race([Promise.all(retry.map(settle)), deadline]);
    }
}

/* ── Small shared pieces ──────────────────────────────────────────────────── */

function StatusPill({ status }) {
    const tone = status?.includes("Denied")
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : status?.includes("Approved (paid)")
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : status?.includes("Returned")
        ? "bg-orange-50 text-orange-700 border-orange-200"
        : status?.includes("Payment")
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-blue-50 text-blue-700 border-blue-200";

    return (
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>
            {status}
        </span>
    );
}

/** A labelled value. Stacks on phones, two columns from sm up. */
function Field({ label, children }) {
    if (children === null || children === undefined || children === "") return null;
    return (
        <div className="grid gap-0.5 sm:grid-cols-[11rem_1fr] sm:gap-3 py-1">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="text-sm text-gray-900 break-words">{children}</dd>
        </div>
    );
}

function Section({ icon: Icon, title, count, action, children }) {
    return (
        <section className="rounded-lg border border-gray-200 bg-white">
            <header className="flex flex-col gap-2 border-b border-gray-100 px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#0d1f5c]">
                    <Icon className="h-4 w-4 shrink-0 text-[#d4a017]" />
                    {title}
                    {count !== undefined && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                            {count}
                        </span>
                    )}
                </h4>
                {action}
            </header>
            <div className="px-3 py-2.5 sm:px-4 sm:py-3">{children}</div>
        </section>
    );
}

/**
 * Opens an existing CPDO document. Hidden when printing.
 *
 * Same tab, not a new one: these are pages of the same system, and a new tab
 * per document leaves a trail of them to close. The browser's Back button
 * returns to the report.
 */
function DocLink({ href, children }) {
    if (!href) return null;
    return (
        <a
            href={href}
            className="print:hidden inline-flex w-full items-center justify-center gap-1 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-[#0d1f5c] transition-colors hover:border-[#d4a017] hover:text-[#d4a017] sm:w-auto sm:justify-start sm:px-2.5 sm:py-1"
        >
            {children}
            <ArrowUpRight className="h-3 w-3" />
        </a>
    );
}

function Empty({ children }) {
    return <p className="text-sm italic text-gray-400">{children}</p>;
}

/**
 * The document itself, not a link to it.
 *
 * Both document endpoints stream the file with its own Content-Type, so an
 * image goes straight into an <img> and a PDF into a frame. PDF frames are
 * dropped when printing — browsers will not render a nested PDF onto paper, so
 * a frame there prints as a blank box; a labelled placeholder is honest about
 * what the printed copy does and does not contain.
 */
function DocPreview({ kind, url, label, onZoom, className = "h-48" }) {
    if (!url) return null;

    if (kind === "image") {
        return (
            <button
                type="button"
                onClick={() => onZoom?.({ url, label })}
                title="Click to enlarge"
                className={`block w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50 ${className} print:cursor-default`}
            >
                <img
                    src={url}
                    alt={label}
                    loading="lazy"
                    className="h-full w-full object-contain"
                />
            </button>
        );
    }

    if (kind === "pdf") {
        return (
            <>
                <iframe
                    src={`${url}#toolbar=0&navpanes=0`}
                    title={label}
                    className={`w-full rounded-md border border-gray-200 bg-gray-50 ${className} print:hidden`}
                />
                <div className="hidden items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-600 print:flex">
                    <FileText className="h-4 w-4" />
                    PDF document — {label} (not reproduced in print)
                </div>
            </>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center gap-1 rounded-md border border-gray-200 bg-gray-50 text-gray-400 ${className}`}>
            <Paperclip className="h-6 w-6" />
            <span className="px-2 text-center text-[11px]">{label}</span>
        </div>
    );
}

/**
 * Full-size view of a document — a scan, or one of the drawn sheets.
 *
 * Rendered onto <body>: the report sits inside the layout's main pane, which
 * is a stacking context of its own, and a fixed overlay opened in there slides
 * under the sidebar and header instead of over them.
 */
function Lightbox({ item, onClose }) {
    if (!item) return null;
    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={item.label}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 print:hidden"
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
                <X className="h-5 w-5" />
            </button>
            <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                {item.render ? (
                    <div className="max-h-[85vh] w-[min(92vw,60rem)] overflow-auto rounded-lg bg-gray-200 p-2">
                        <div>
                            <FitToWidth>{item.render()}</FitToWidth>
                        </div>
                    </div>
                ) : (
                    <img src={item.url} alt={item.label} className="max-h-[80vh] w-auto rounded-lg bg-white object-contain" />
                )}
                <figcaption className="mt-2 text-center text-sm text-white/80">{item.label}</figcaption>
            </figure>
        </div>,
        document.body
    );
}

/**
 * One of the drawn documents, small, beside its particulars — the same place
 * and size the receipt scan gets, so every section reads the same way. Click
 * to see it full size. Screen only: the printed pack draws it at full size.
 */
function SheetThumb({ label, onZoom, full, children }) {
    // `full` is what the enlarged view shows when the thumbnail is only part
    // of the document — the form's first sheet standing in for both.
    const open = () => onZoom?.({ label, render: () => full ?? children });
    return (
        <figure className="m-0 print:hidden">
            <div
                role="button"
                tabIndex={0}
                title="Click to enlarge"
                onClick={open}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
                className="block w-full cursor-zoom-in overflow-hidden rounded-md border border-gray-200 bg-gray-100 p-2 focus:outline-none focus:ring-2 focus:ring-[#d4a017]"
            >
                {/* FitToWidth sizes itself to its parent's clientWidth, padding
                    included, so it gets an unpadded parent of its own. */}
                <div>
                    <FitToWidth>{children}</FitToWidth>
                </div>
            </div>
            <figcaption className="mt-1 text-center text-[11px] text-gray-400">{label}</figcaption>
        </figure>
    );
}

/* ── The drawn documents ──────────────────────────────────────────────────── */

/**
 * The certificate or clearance this application is for, drawn from the same
 * data and the same sheet as its own page. ZC is issued a certificate; every
 * other category a clearance — the rule the Certificates page applies.
 */
function IssuedDocumentSheet({ document }) {
    const s = document?.sheet;
    if (!s) return null;

    return document.type === "ZC" ? (
        <CertificateSheet
            compact
            application={s.application}
            payment={s.payment}
            zoningAdministrator={s.zoning_administrator}
        />
    ) : (
        <ClearanceSheet
            compact
            application={s.application}
            payment={s.payment}
            reviewer={s.reviewer}
            zoningAdministrator={s.zoning_administrator}
        />
    );
}

function OrderSheet({ order }) {
    const s = order?.sheet;
    if (!s) return null;
    return (
        <OrderOfPaymentSheet
            compact
            application={s.application}
            payment={s.payment}
            paymentAmount={s.payment_amount}
            reviewer={s.reviewer}
            zoningAdministrator={s.zoning_administrator}
        />
    );
}

/** Particulars on the left, the document on the right — the receipt's layout. */
function WithSheet({ sheet, children }) {
    if (!sheet) return children;
    return (
        <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
            <div className="min-w-0">{children}</div>
            {sheet}
        </div>
    );
}

/* ── One application, as a step in the applicant's history ────────────────── */

/**
 * A Zoning Certification (ZC) is requested on its requirements alone — there
 * is no application form to file for one — so the form is left out of its
 * file, on screen and on paper.
 */
const filesApplicationForm = (app) => app.document?.type !== "ZC";

/** The notarized application form the applicant handed in, if they have. */
const notarizedForm = (app) => app.requirements.find((d) => d.is_application_form);

function ApplicationDetail({ app, total, onZoom }) {
    const { form, order_of_payment: order, payment, requirements, certificate, document } = app;
    const hasForm = filesApplicationForm(app);
    const notarized = hasForm ? notarizedForm(app) : null;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#0d1f5c] px-3 py-2.5 text-white sm:px-4">
                <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-blue-200">
                        Application {app.step} of {total}
                        {date(app.filed_on) ? ` · Filed ${date(app.filed_on)}` : ""}
                    </p>
                    <p className="truncate text-base font-black">{app.application_number}</p>
                </div>
                <StatusPill status={app.status} />
            </div>

            {/* The document this application is for, first — it is what the
                whole file exists to produce. One document, named for what was
                applied for, rather than a certificate and a clearance offered
                side by side when only one of them ever applies. */}
            <Section
                icon={Award}
                title={document?.label ?? "Issued Document"}
                action={document?.available ? <DocLink href={document.url}>Open document</DocLink> : null}
            >
                {document?.available ? (
                    <WithSheet
                        sheet={document.sheet && (
                            <SheetThumb label={document.label} onZoom={onZoom}>
                                <IssuedDocumentSheet document={document} />
                            </SheetThumb>
                        )}
                    >
                        {certificate ? (
                            <dl className="divide-y divide-gray-50">
                                <Field label="Certificate No.">{certificate.number}</Field>
                                <Field label="Status">{titleCase(certificate.status)}</Field>
                                <Field label="Issued">{date(certificate.issued_at)}</Field>
                                <Field label="Released">{date(certificate.released_at)}</Field>
                            </dl>
                        ) : (
                            <Empty>No certificate recorded yet — the {document.label} is generated from this application.</Empty>
                        )}
                    </WithSheet>
                ) : (
                    <Empty>{document?.note}</Empty>
                )}
            </Section>

            {/* The form as filed: the notarized copy the applicant handed in
                where there is one, the system's own drawing of it otherwise.
                A ZC has no form, so its section is the particulars alone. */}
            <Section
                icon={FileText}
                title={hasForm ? "Application Form" : "Application Details"}
                action={hasForm ? <DocLink href={form.print_url}>Open form</DocLink> : null}
            >
                <WithSheet
                    sheet={
                        !hasForm ? null : notarized ? (
                            <figure className="m-0 print:hidden">
                                <DocPreview
                                    kind={notarized.kind}
                                    url={notarized.url}
                                    label="Notarized application form"
                                    onZoom={onZoom}
                                    className="h-72"
                                />
                                <figcaption className="mt-1 text-center text-[11px] text-gray-400">
                                    Notarized application form
                                </figcaption>
                            </figure>
                        ) : form.sheet ? (
                            <SheetThumb label="Application form (system copy)" onZoom={onZoom}>
                                <ApplicationFormSheet
                                    compact
                                    application={form.sheet}
                                    wrap={(page, key) => (key === "form" ? page : null)}
                                />
                            </SheetThumb>
                        ) : null
                    }
                >
                    <dl className="divide-y divide-gray-50">
                        <Field label="Application No.">{app.application_number}</Field>
                        <Field label="Applicant">
                            {form.applicant_name}
                            {form.applicant_type ? ` (${titleCase(form.applicant_type)})` : ""}
                        </Field>
                        <Field label="Address">{form.address}</Field>
                        <Field label="Contact">{form.contact}</Field>
                        <Field label="Locational Clearance">
                            {form.project_type}
                            {form.project_nature ? ` — ${form.project_nature}` : ""}
                            {app.decision_number && (
                                <span className="block text-xs text-gray-500">Decision No. {app.decision_number}</span>
                            )}
                        </Field>
                        <Field label="Project Location">{form.location}</Field>
                        <Field label="Lot Area">
                            {form.lot_area_sqm ? `${Number(form.lot_area_sqm).toLocaleString()} sqm` : null}
                        </Field>
                        <Field label="Right Over Land">{form.right_over_land}</Field>
                        <Field label="Existing Land Use">{form.existing_land_use}</Field>
                        <Field label="Reviewed By">
                            {form.reviewed_by
                                ? `${form.reviewed_by}${date(form.date_reviewed) ? ` · ${date(form.date_reviewed)}` : ""}`
                                : null}
                        </Field>
                    </dl>
                </WithSheet>
            </Section>

            <Section
                icon={Receipt}
                title="Order of Payment"
                action={order.available ? <DocLink href={order.url}>Open order</DocLink> : null}
            >
                {order.available ? (
                    <WithSheet
                        sheet={order.sheet && (
                            <SheetThumb label="Order of payment" onZoom={onZoom}>
                                <OrderSheet order={order} />
                            </SheetThumb>
                        )}
                    >
                        <dl className="divide-y divide-gray-50">
                            <Field label="Amount Due">{peso(order.amount) ?? "Not set"}</Field>
                            <Field label="Applicant">{order.sheet?.application?.applicant_name}</Field>
                            <Field label="For">
                                {order.sheet?.application?.project_type}
                                {order.sheet?.application?.project_nature ? ` — ${order.sheet.application.project_nature}` : ""}
                            </Field>
                            <Field label="Prepared By">{order.sheet?.reviewer?.name}</Field>
                            <Field label="Approved By">{order.sheet?.zoning_administrator?.name}</Field>
                        </dl>
                    </WithSheet>
                ) : (
                    <Empty>{order.note}</Empty>
                )}
            </Section>

            <Section
                icon={Banknote}
                title="Payment Receipt"
                action={payment?.receipt_url ? <DocLink href={payment.receipt_url}>View receipt</DocLink> : null}
            >
                {payment ? (
                    <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
                        <dl className="divide-y divide-gray-50">
                            <Field label="O.R. Number">{payment.receipt_number}</Field>
                            <Field label="Amount Paid">{peso(payment.amount)}</Field>
                            <Field label="Method">{titleCase(payment.method)}</Field>
                            <Field label="Date Paid">{date(payment.date)}</Field>
                            <Field label="Status">{titleCase(payment.status)}</Field>
                        </dl>
                        {payment.receipt_url && (
                            <figure className="m-0">
                                <DocPreview
                                    kind={payment.receipt_kind}
                                    url={payment.receipt_url}
                                    label={`Receipt ${payment.receipt_number || ""}`.trim()}
                                    onZoom={onZoom}
                                    className="h-56"
                                />
                                <figcaption className="mt-1 text-center text-[11px] text-gray-400">
                                    Official receipt
                                </figcaption>
                            </figure>
                        )}
                    </div>
                ) : (
                    <Empty>No payment recorded.</Empty>
                )}
            </Section>

            <Section icon={Paperclip} title="Submitted Requirements" count={requirements.length}>
                {requirements.length === 0 ? (
                    <Empty>No requirements submitted.</Empty>
                ) : (
                    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {requirements.map((doc, i) => (
                            <li
                                key={doc.id}
                                className="rounded-lg border border-gray-200 p-2"
                                style={{ breakInside: "avoid" }}
                            >
                                <DocPreview
                                    kind={doc.kind}
                                    url={doc.url}
                                    label={doc.name || doc.filename || `Requirement ${i + 1}`}
                                    onZoom={onZoom}
                                />
                                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-900">
                                            <span className="mr-1 text-gray-400">{i + 1}.</span>
                                            {doc.name || "Unnamed requirement"}
                                        </p>
                                        <p className="truncate text-[11px] text-gray-500" title={doc.filename}>
                                            {doc.filename}
                                            {date(doc.uploaded_at) ? ` · ${date(doc.uploaded_at)}` : ""}
                                        </p>
                                    </div>
                                    <DocLink href={doc.url}>Open</DocLink>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>

        </div>
    );
}

/* ── The printed pack (applicant report) ──────────────────────────────────── */

/**
 * The file, as it would be pulled from the cabinet: a cover, the certificate
 * or clearance, the application form, the order of payment, the receipt, then
 * every submitted requirement — one to a page, all of them pictures.
 *
 * The certificate, clearance, form and order of payment are the same sheets
 * their own pages draw, at the same size, zoomed to fit inside the report's
 * page margins. The receipt and the requirements are the scans on file.
 */
function PrintPage({ icon: Icon, title, subtitle, mode, children }) {
    return (
        <section
            className={mode === "capture"
                ? "pack-page flex min-h-[9in] flex-col"
                : "pack-page hidden print:flex print:min-h-[9in] print:flex-col"}
            style={{ breakAfter: "page", breakInside: "avoid" }}
        >
            <header className="mb-3 border-b-2 border-[#0d1f5c] pb-2">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#0d1f5c]">
                    <Icon className="h-4 w-4" />
                    {title}
                </p>
                {subtitle && <p className="mt-0.5 text-[11px] text-gray-500">{subtitle}</p>}
            </header>
            <div className="flex flex-1 flex-col">{children}</div>
        </section>
    );
}

/**
 * A drawn sheet on its own page. No strip above it — the letterhead says what
 * it is. The zoom that fits an A4 sheet inside the page margins is in the
 * print stylesheet, on .print-sheet.
 */
function PrintSheet({ mode, children }) {
    return (
        <section
            className={mode === "capture" ? "pack-page print-sheet block" : "pack-page print-sheet hidden print:block"}
            style={{ breakAfter: "page" }}
        >
            {children}
        </section>
    );
}

/** The report's first page: who, what for, and when. */
function PrintCover({ app, total, generatedOn, mode }) {
    const { form, document } = app;
    return (
        <section
            className={mode === "capture"
                ? "pack-page flex min-h-[9.5in] flex-col items-center justify-center text-center"
                : "pack-page hidden print:flex print:min-h-[9.5in] print:flex-col print:items-center print:justify-center text-center"}
            style={{ breakAfter: "page" }}
        >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-600">Republic of the Philippines</p>
            <p className="mt-1 text-3xl font-black text-[#0d1f5c]">City of Ilagan, Isabela</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-widest text-[#d4a017]">City Planning &amp; Development Office</p>

            <img
                src="/images/ilagan1logo.png"
                alt="Seal of the City of Ilagan"
                className="my-10 h-64 w-64 object-contain"
            />

            <h2 className="text-2xl font-black uppercase tracking-wide text-[#0d1f5c]">Applicant Transaction Summary</h2>

            <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-left text-base">
                <dt className="font-semibold text-gray-500">Applicant</dt>
                <dd className="font-bold text-gray-900">{form.applicant_name || "—"}</dd>
                <dt className="font-semibold text-gray-500">Locational Clearance</dt>
                <dd className="font-bold text-gray-900">
                    {document?.label || form.project_type}
                    {document?.type ? ` (${document.type})` : ""}
                </dd>
                <dt className="font-semibold text-gray-500">Date Applied</dt>
                <dd className="font-bold text-gray-900">{date(app.filed_on) || "—"}</dd>
            </dl>

            <p className="mt-12 text-[11px] text-gray-400">
                Application {app.step} of {total} · {app.application_number}
                {generatedOn ? ` · Generated ${generatedOn}` : ""}
            </p>
        </section>
    );
}

/** A scan filling its page, captioned. */
function PrintScan({ doc }) {
    if (doc.kind === "image") {
        return (
            <figure className="m-0 flex flex-1 flex-col">
                <img
                    src={doc.url}
                    alt={doc.name || doc.filename}
                    loading="eager"
                    decoding="sync"
                    className="max-h-[8in] w-full flex-1 object-contain"
                />
                <figcaption className="mt-2 text-center text-[10px] text-gray-500">
                    {doc.filename}
                </figcaption>
            </figure>
        );
    }

    return (
        <p className="text-[11px] italic text-gray-500">
            {doc.filename} — {doc.kind === "pdf" ? "PDF document, held on file" : "file held on file"}.
            Not reproduced here.
        </p>
    );
}

function PrintPack({ app, total, generatedOn, mode = "print" }) {
    const { form, order_of_payment: order, payment, requirements, document } = app;
    const who = `${app.application_number} · ${form.applicant_name || ""}`.trim();

    // The form page is the notarized copy the applicant handed in, so it is
    // not repeated among the requirements below. A ZC has no form page.
    const hasForm = filesApplicationForm(app);
    const notarized = hasForm ? notarizedForm(app) : null;
    const attachments = notarized ? requirements.filter((d) => d !== notarized) : requirements;

    return (
        <div className={mode === "capture" ? "block" : "hidden print:block"}>
            {/* 1 — Cover */}
            <PrintCover app={app} total={total} generatedOn={generatedOn} mode={mode} />

            {/* 2 — Certificate or clearance */}
            {document?.sheet ? (
                <PrintSheet mode={mode}>
                    <IssuedDocumentSheet document={document} />
                </PrintSheet>
            ) : (
                <PrintPage icon={Award} title={document?.label || "Issued Document"} subtitle={who} mode={mode}>
                    <p className="text-[11px] italic text-gray-500">{document?.note || "Not yet issued."}</p>
                </PrintPage>
            )}

            {/* 3 — Application form: the notarized copy the applicant filed.
                Failing that, the system's own drawing of the form (its first
                sheet only — the requirements checklist is not part of the
                record). Nothing at all for a ZC. */}
            {hasForm && notarized && (
                <PrintPage icon={FileText} title="Application Form — notarized copy as filed" subtitle={who} mode={mode}>
                    <PrintScan doc={notarized} />
                </PrintPage>
            )}
            {hasForm && !notarized && form.sheet && (
                <ApplicationFormSheet
                    compact
                    application={form.sheet}
                    wrap={(page, key) => (key === "form" ? <PrintSheet key={key} mode={mode}>{page}</PrintSheet> : null)}
                />
            )}

            {/* 4 — Order of payment */}
            {order.sheet ? (
                <PrintSheet mode={mode}>
                    <OrderSheet order={order} />
                </PrintSheet>
            ) : (
                <PrintPage icon={Receipt} title="Order of Payment" subtitle={who} mode={mode}>
                    <p className="text-[11px] italic text-gray-500">{order.note || "Not yet issued."}</p>
                </PrintPage>
            )}

            {/* 5 — Receipt, where one was recorded */}
            {payment && (
                <PrintPage icon={Banknote} title="Official Receipt" subtitle={who} mode={mode}>
                    <dl className="mb-3 text-[12px]">
                        <Field label="O.R. Number">{payment.receipt_number}</Field>
                        <Field label="Amount Paid">{peso(payment.amount)}</Field>
                        <Field label="Date Paid">{date(payment.date)}</Field>
                        <Field label="Status">{titleCase(payment.status)}</Field>
                    </dl>
                    {payment.receipt_url && (
                        <PrintScan
                            doc={{
                                kind: payment.receipt_kind,
                                url: payment.receipt_url,
                                name: "Official receipt",
                                filename: `Official receipt ${payment.receipt_number || ""}`.trim(),
                            }}
                        />
                    )}
                </PrintPage>
            )}

            {/* 6 onwards — one requirement to a page */}
            {attachments.map((doc, i) => (
                <PrintPage
                    key={doc.id}
                    icon={Paperclip}
                    title={`Requirement ${i + 1} of ${attachments.length} — ${doc.name || "Attachment"}`}
                    subtitle={who}
                    mode={mode}
                >
                    <PrintScan doc={doc} />
                </PrintPage>
            ))}
        </div>
    );
}

/* ── Table reports (period / officer) ─────────────────────────────────────── */

/**
 * Jumps from a row to the full transaction file of whoever filed it.
 *
 * Nothing to show for an application with no applicant name on it, so the
 * button is withheld rather than opening an empty report.
 */
function SeeApplicationButton({ row, onSeeApplicant, className = "" }) {
    if (!onSeeApplicant || !row.applicant_name || row.applicant_name === "N/A") return null;

    return (
        <button
            type="button"
            onClick={() => onSeeApplicant(row.applicant_name)}
            title={`Open the transaction file for ${row.applicant_name}`}
            className={`print:hidden inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-[#0d1f5c] transition-colors hover:border-[#d4a017] hover:bg-[#d4a017]/5 hover:text-[#d4a017] ${className}`}
        >
            <FolderOpen className="h-3.5 w-3.5" />
            See Application
        </button>
    );
}

const PER_PAGE_CHOICES = [25, 50, 100];

function RowsTable({ rows, onSeeApplicant }) {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(PER_PAGE_CHOICES[0]);

    // A new report is a new list; staying on page 7 of the last one would show
    // an empty table for a report that has results.
    useEffect(() => {
        setPage(1);
    }, [rows]);

    const pageCount = Math.max(1, Math.ceil(rows.length / perPage));
    const safePage = Math.min(page, pageCount);
    const visible = rows.slice((safePage - 1) * perPage, safePage * perPage);

    if (rows.length === 0) return <Empty>No applications match this report.</Empty>;

    return (
        <>
            {/* Paging is for reading on screen only. Printing and the PDF/Excel
                downloads carry every record — a report that quietly stopped at
                page one would not be a report of the period at all. */}
            <div className="hidden print:block">
                <PrintRows rows={rows} />
            </div>

            <div className="print:hidden">
            {/* Phones get stacked cards; a nine-column table is unreadable there. */}
            <ul className="space-y-2 md:hidden">
                {visible.map((row) => (
                    <li key={row.application_number} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-[#0d1f5c]">{row.application_number}</span>
                            <StatusPill status={row.status} />
                        </div>
                        <dl className="mt-2">
                            <Field label="Applicant">{row.applicant_name}</Field>
                            <Field label="Clearance">{row.project_type}</Field>
                            <Field label="Location">{row.location}</Field>
                            <Field label="Reviewed By">{row.reviewed_by}</Field>
                            <Field label="Fee">{peso(row.payment_amount)}</Field>
                            <Field label="Filed">{date(row.filed_on)}</Field>
                        </dl>
                        <SeeApplicationButton row={row} onSeeApplicant={onSeeApplicant} className="mt-2 w-full" />
                    </li>
                ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[54rem] border-collapse text-sm">
                    <thead>
                        <tr className="bg-[#0d1f5c] text-left text-[11px] uppercase tracking-wide text-white">
                            <th className="px-3 py-2">Application No.</th>
                            <th className="px-3 py-2">Applicant</th>
                            <th className="px-3 py-2">Clearance</th>
                            <th className="px-3 py-2">Location</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Reviewed By</th>
                            <th className="px-3 py-2 text-right">Fee</th>
                            <th className="px-3 py-2">Filed</th>
                            <th className="px-3 py-2 print:hidden"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((row, i) => (
                            <tr key={row.application_number} className={i % 2 ? "bg-[#fafbff]" : ""}>
                                <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#0d1f5c]">
                                    {row.application_number}
                                </td>
                                <td className="px-3 py-2">{row.applicant_name}</td>
                                <td className="px-3 py-2">
                                    {row.project_type}
                                    {row.project_nature && (
                                        <span className="block text-xs text-gray-500">{row.project_nature}</span>
                                    )}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-600">{row.location}</td>
                                <td className="px-3 py-2"><StatusPill status={row.status} /></td>
                                <td className="px-3 py-2">{row.reviewed_by || "—"}</td>
                                <td className="whitespace-nowrap px-3 py-2 text-right">{peso(row.payment_amount) || "—"}</td>
                                <td className="whitespace-nowrap px-3 py-2 text-xs">{date(row.filed_on) || "—"}</td>
                                <td className="px-3 py-2 print:hidden">
                                    <SeeApplicationButton row={row} onSeeApplicant={onSeeApplicant} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Rows-per-page sits beside the pager; TablePagination hides itself
                when everything fits on one page, so the choice would strand
                without its own guard. */}
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {rows.length > PER_PAGE_CHOICES[0] ? (
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        Rows per page
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setPage(1);
                            }}
                            className="rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-[#d4a017] focus:ring-1 focus:ring-[#d4a017]"
                        >
                            {PER_PAGE_CHOICES.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </label>
                ) : (
                    <p className="text-sm text-gray-500">
                        {rows.length} application{rows.length === 1 ? "" : "s"}
                    </p>
                )}

                <TablePagination
                    currentPage={safePage}
                    totalItems={rows.length}
                    perPage={perPage}
                    onPageChange={setPage}
                    label="applications"
                />
            </div>
            </div>
        </>
    );
}

/**
 * Every row, unpaged and unstyled for paper. Only rendered inside a print:block
 * wrapper, so it costs nothing on screen.
 */
function PrintRows({ rows }) {
    return (
        <table className="w-full border-collapse text-[11px]">
            <thead>
                <tr className="text-left">
                    <th className="border-b border-gray-400 px-1 py-1">Application No.</th>
                    <th className="border-b border-gray-400 px-1 py-1">Applicant</th>
                    <th className="border-b border-gray-400 px-1 py-1">Clearance</th>
                    <th className="border-b border-gray-400 px-1 py-1">Location</th>
                    <th className="border-b border-gray-400 px-1 py-1">Status</th>
                    <th className="border-b border-gray-400 px-1 py-1">Reviewed By</th>
                    <th className="border-b border-gray-400 px-1 py-1 text-right">Fee</th>
                    <th className="border-b border-gray-400 px-1 py-1">Filed</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.application_number} style={{ breakInside: "avoid" }}>
                        <td className="border-b border-gray-200 px-1 py-1">{row.application_number}</td>
                        <td className="border-b border-gray-200 px-1 py-1">{row.applicant_name}</td>
                        <td className="border-b border-gray-200 px-1 py-1">{row.project_type}</td>
                        <td className="border-b border-gray-200 px-1 py-1">{row.location}</td>
                        <td className="border-b border-gray-200 px-1 py-1">{row.status}</td>
                        <td className="border-b border-gray-200 px-1 py-1">{row.reviewed_by || "—"}</td>
                        <td className="border-b border-gray-200 px-1 py-1 text-right">{peso(row.payment_amount) || "—"}</td>
                        <td className="border-b border-gray-200 px-1 py-1">{date(row.filed_on) || "—"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

/**
 * The report screen, shared by the Zoning Administrator and the Zoning Officer.
 *
 * The two differ only in which reports they may run and which route prefix
 * their documents hang off, both of which the server decides - so the screen
 * takes them as props rather than knowing about roles itself.
 */
export default function ReportsWorkspace({
    applicants = [],
    officers = [],
    years = [],
    currentYear,
    currentMonth,
    reportTypes = ["applicant", "period", "officer"],
    routePrefix = "super-admin",
}) {
    const [active, setActive] = useState(reportTypes[0] ?? "applicant");

    // Whole-year reports are a separate act from picking a month, so the scope
    // is its own control rather than a magic entry in the month list.
    const [periodScope, setPeriodScope] = useState("month");

    const [applicant, setApplicant] = useState("");
    const [applicantSearch, setApplicantSearch] = useState("");
    const [year, setYear] = useState(String(years[0] ?? currentYear));
    const [month, setMonth] = useState(String(currentMonth ?? 1));
    const [officer, setOfficer] = useState("all");

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(0);
    const [zoom, setZoom] = useState(null);
    // "print" while the pictures are being readied for the printer, "pdf"
    // while the pack is being photographed page by page.
    const [busy, setBusy] = useState(null);
    const [progress, setProgress] = useState({ done: 0, total: 0 });
    const panelRef = useRef(null);
    const captureRef = useRef(null);

    // The picker is a tall list and its job is done once a report is on screen,
    // so it folds away and leaves the room to the report. Reopening it is one
    // click, and changing the subject opens it again on its own.
    const [filtersOpen, setFiltersOpen] = useState(true);

    const filteredApplicants = useMemo(() => {
        const q = applicantSearch.trim().toLowerCase();
        if (!q) return applicants;
        return applicants.filter((a) => a.name.toLowerCase().includes(q));
    }, [applicantSearch, applicants]);

    // Overrides let a caller build a report for a subject that is not yet in
    // state — "See Application" needs the request to go out with the applicant
    // it was clicked for, not the one a re-render has not applied yet.
    const params = (override = {}) => {
        // Only a real report key is accepted as an override. Wiring this to a
        // handler as onClick={runPreview} hands React's click event in as the
        // override, and an event's `type` is "click" — which then went out as
        // the report type and came back a 422.
        const type = REPORT_KEYS.includes(override?.type) ? override.type : active;
        const p = new URLSearchParams({ type });
        if (type === "applicant") p.set("applicant", override.applicant ?? applicant);
        if (type === "period") {
            p.set("year", year);
            // A whole-year report is every month of it.
            p.set("month", periodScope === "year" ? "all" : month);
        }
        if (type === "officer") p.set("officer", officer);
        return p;
    };

    const ready = active !== "applicant" || !!applicant;

    const runPreview = async (override = {}) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(
                `${route(`${routePrefix}.reports.preview`)}?${params(override)}`
            );
            setReport(data);
            setStep(0);
            setFiltersOpen(false);
        } catch (e) {
            setError(e.response?.data?.message || "Could not build the report. Please try again.");
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    /** From a row in a list to that applicant's full transaction file. */
    const seeApplicant = (name) => {
        setActive("applicant");
        setApplicant(name);
        setApplicantSearch("");
        runPreview({ type: "applicant", applicant: name });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // A download is a file, not a page, so it leaves through a plain navigation
    // rather than an Inertia visit.
    const download = (format) => {
        const p = params();
        p.set("format", format);
        // Same tab: the browser hands the file to its download manager and the
        // report is still on screen behind it.
        window.location.href = `${route(`${routePrefix}.reports.generate`)}?${p}`;
    };

    // The print dialog photographs the page the instant it opens. A scan that
    // is still downloading comes out as a blank box, so the pictures are
    // waited for first.
    const printReport = async () => {
        setBusy("print");
        try {
            await waitForImages(panelRef.current);
        } finally {
            setBusy(null);
        }
        window.print();
    };

    // The applicant file as a PDF: the same pack the printer gets, photographed
    // one page at a time and laid onto A4 sheets. Built here rather than on the
    // server because the certificate, clearance, form and order of payment are
    // drawn by the browser — there is no copy of them anywhere else.
    const savePack = async () => {
        setBusy("pdf");
        setProgress({ done: 0, total: 0 });
        try {
            // The capture pack is rendered only while this runs.
            await new Promise((resolve) => setTimeout(resolve, 50));
            const root = captureRef.current;
            if (!root) return;
            await waitForImages(root);

            const pages = Array.from(root.querySelectorAll(".pack-page"));
            setProgress({ done: 0, total: pages.length });

            const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
            const margin = 12;
            const maxW = 210 - margin * 2;
            const maxH = 297 - margin * 2;

            for (let i = 0; i < pages.length; i++) {
                const target = pages[i];
                // Brought to the top of the layer first: html2canvas reads the
                // page's place on screen, and a page scrolled out of the layer
                // has none worth reading.
                target.scrollIntoView({ block: "start" });
                const canvas = await html2canvas(target, {
                    scale: 1.5,
                    logging: false,
                    backgroundColor: "#ffffff",
                    // html2canvas photographs by cloning the whole document,
                    // and this document holds every scan two or three times
                    // over. Everything that is neither this page, nor on the
                    // way to it, nor a stylesheet in <head> is left out of the
                    // clone, which turns a ten-second page into a one-second one.
                    ignoreElements: (el) =>
                        !(el.contains(target) || target.contains(el) || el.ownerDocument.head?.contains(el)),
                });
                // Fit the photographed page inside the margins, keeping its shape.
                const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
                const w = canvas.width * ratio;
                const h = canvas.height * ratio;
                if (i > 0) pdf.addPage();
                pdf.addImage(canvas.toDataURL("image/jpeg", 0.9), "JPEG", margin, margin, w, h);
                setProgress({ done: i + 1, total: pages.length });
            }

            const who = (report?.subtitle || "applicant").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
            pdf.save(`cpdo-applicant-${who}.pdf`);
        } finally {
            setBusy(null);
        }
    };

    // Changing the subject invalidates what is on screen — showing last
    // report's rows under a new heading would be worse than showing nothing.
    const choose = (setter) => (value) => {
        setter(value);
        setReport(null);
        setError(null);
        setFiltersOpen(true);
    };

    const switchType = (key) => {
        setActive(key);
        setReport(null);
        setError(null);
        setFiltersOpen(true);
    };

    const applications = report?.applications ?? [];
    const current = applications[step];

    return (
        <>
            {/* Print only the report panel: the sidebar, filters and links are
                screen furniture and have no place on a printed record. */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #report-panel, #report-panel * { visibility: visible !important; }

                    /* Both SidebarInset (a relative <main>) and the layout's page
                       body are positioned ancestors, so without these the panel
                       would anchor beside the sidebar rather than at the top-left
                       of the sheet. */
                    main, [data-page-body] { position: static !important; }
                    [data-sidebar="sidebar"] { display: none !important; }

                    #report-panel {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        border: 0 !important;
                        box-shadow: none !important;
                    }

                    /* The drawn documents are true A4 sheets. Zoomed to 0.86 they
                       sit inside the 12mm page margins with room to spare, and
                       zoom — unlike transform — shrinks the box the page
                       reserves for them, so nothing spills onto a blank sheet. */
                    .print-sheet { zoom: 0.86; }
                    .print-sheet > * { break-inside: avoid; }

                    /* Letterhead gradients, the yellow title highlights and the
                       seal must print as shown. */
                    #report-panel, #report-panel * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    @page { margin: 12mm; }
                }
            `}</style>

                {/* Header */}
                <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-[#d4a017]/20 bg-[#d4a017]/10 p-2.5">
                            <FileBarChart className="h-6 w-6 text-[#d4a017]" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base font-black text-[#0d1f5c] sm:text-lg">
                                Reports &amp; Document Management
                            </h1>
                            <p className="mt-0.5 text-xs text-gray-400">
                                Review a report on screen, then print or download it
                            </p>
                        </div>
                    </div>
                </div>

                {/* Report chooser */}
                <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
                    {REPORTS.filter((r) => reportTypes.includes(r.key)).map((r) => {
                        const Icon = r.icon;
                        const selected = active === r.key;
                        return (
                            <button
                                key={r.key}
                                type="button"
                                onClick={() => switchType(r.key)}
                                aria-pressed={selected}
                                className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                                    selected
                                        ? "border-[#0d1f5c] bg-white shadow-md"
                                        : "border-gray-100 bg-white/70 hover:border-gray-200 hover:shadow-sm"
                                }`}
                            >
                                <div className={`mb-2 inline-flex rounded-lg border p-2 ${r.ring}`}>
                                    <Icon className={`h-5 w-5 ${r.accent}`} />
                                </div>
                                <h2 className="text-sm font-bold text-[#0d1f5c]">{r.title}</h2>
                                <p className="mt-1 text-xs leading-relaxed text-gray-500">{r.blurb}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Filters */}
                <Card className="mb-4 border-gray-100 shadow-sm print:hidden">
                    {/* Collapsed once a report is showing, so the tall applicant
                        list stops competing with it for the screen. */}
                    {!filtersOpen && (
                        <button
                            type="button"
                            onClick={() => setFiltersOpen(true)}
                            aria-expanded={false}
                            className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-gray-50 sm:p-5"
                        >
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold text-[#0d1f5c]">
                                    {REPORTS.find((r) => r.key === active)?.title ?? "Report"}
                                </span>
                                <span className="block truncate text-xs text-gray-400">
                                    {report?.subtitle || "Change what this report covers"}
                                </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0d1f5c]">
                                Change
                                <ChevronDown className="h-4 w-4" />
                            </span>
                        </button>
                    )}

                    <CardContent className={`p-4 sm:p-5 ${filtersOpen ? "" : "hidden"}`}>
                        {report && (
                            <div className="mb-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setFiltersOpen(false)}
                                    aria-expanded
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 transition-colors hover:text-[#0d1f5c]"
                                >
                                    Hide
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {active === "applicant" && (
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#0d1f5c]">
                                    Choose an applicant
                                </label>
                                {applicants.length === 0 ? (
                                    <Empty>No applications on record yet.</Empty>
                                ) : (
                                    <>
                                        <div className="relative mb-3 max-w-md">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                value={applicantSearch}
                                                onChange={(e) => setApplicantSearch(e.target.value)}
                                                placeholder="Search applicants…"
                                                className="pl-9"
                                            />
                                        </div>
                                        <div className="max-h-64 divide-y overflow-y-auto rounded-lg border border-gray-200">
                                            {filteredApplicants.length === 0 ? (
                                                <p className="p-4 text-center text-sm text-gray-500">
                                                    No applicant matches “{applicantSearch}”
                                                </p>
                                            ) : (
                                                filteredApplicants.map((a) => (
                                                    <label
                                                        key={a.name}
                                                        className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 transition-colors sm:px-4 ${
                                                            applicant === a.name ? "bg-[#0d1f5c]/5" : "hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <span className="flex min-w-0 items-center gap-3">
                                                            <input
                                                                type="radio"
                                                                name="applicant"
                                                                value={a.name}
                                                                checked={applicant === a.name}
                                                                onChange={(e) => choose(setApplicant)(e.target.value)}
                                                                className="h-4 w-4 shrink-0 text-[#0d1f5c]"
                                                            />
                                                            <span className="truncate text-sm text-gray-800">{a.name}</span>
                                                        </span>
                                                        <span className="shrink-0 text-xs text-gray-400">
                                                            {a.applications} app{a.applications === 1 ? "" : "s"}
                                                        </span>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {active === "period" && (
                            <div className="max-w-lg space-y-4">
                                {/* Month or whole year — two different reports, so
                                    the choice is explicit rather than an option
                                    buried in the month list. */}
                                <div
                                    role="radiogroup"
                                    aria-label="Report scope"
                                    className="inline-flex rounded-lg border border-gray-200 p-1"
                                >
                                    {[
                                        { key: "month", label: "A single month" },
                                        { key: "year", label: "Whole year" },
                                    ].map((option) => (
                                        <button
                                            key={option.key}
                                            type="button"
                                            role="radio"
                                            aria-checked={periodScope === option.key}
                                            onClick={() => choose(setPeriodScope)(option.key)}
                                            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                                                periodScope === option.key
                                                    ? "bg-[#0d1f5c] text-white"
                                                    : "text-gray-600 hover:text-[#0d1f5c]"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {periodScope === "month" && (
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-[#0d1f5c]">Month</label>
                                            <select
                                                value={month}
                                                onChange={(e) => choose(setMonth)(e.target.value)}
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#d4a017] focus:ring-1 focus:ring-[#d4a017]"
                                            >
                                                {MONTHS.map((name, i) => (
                                                    <option key={name} value={String(i + 1)}>{name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[#0d1f5c]">Year</label>
                                        <select
                                            value={year}
                                            onChange={(e) => choose(setYear)(e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#d4a017] focus:ring-1 focus:ring-[#d4a017]"
                                        >
                                            {years.map((y) => (
                                                <option key={y} value={String(y)}>{y}</option>
                                            ))}
                                        </select>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {periodScope === "year"
                                                ? `Every application filed in ${year}.`
                                                : "Only years with applications are listed."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {active === "officer" && (
                            <div className="max-w-lg">
                                <label className="mb-2 block text-sm font-semibold text-[#0d1f5c]">
                                    Zoning Officer
                                </label>
                                <select
                                    value={officer}
                                    onChange={(e) => choose(setOfficer)(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#d4a017] focus:ring-1 focus:ring-[#d4a017]"
                                >
                                    <option value="all">All Zoning Officers</option>
                                    {officers.map((o) => (
                                        <option key={o.id} value={String(o.id)}>{o.name}</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-400">
                                    Covers applications with a completed review, attributed to the officer
                                    who carried it out.
                                </p>
                            </div>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                            <Button
                                onClick={() => runPreview()}
                                disabled={!ready || loading}
                                className="gap-2 bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                {loading ? "Building…" : "View Report"}
                            </Button>
                            {active === "applicant" && !applicant && (
                                <span className="text-xs text-gray-400">Pick an applicant first.</span>
                            )}
                        </div>

                        {error && (
                            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                {error}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* The report itself */}
                {report && (
                    <div id="report-panel" ref={panelRef} className="relative isolate rounded-xl border border-gray-100 bg-white shadow-sm">
                        {/* Printed only. On screen the layout's watermark already
                            shows behind the page, and a second seal inside the
                            panel read as a duplicate; on paper everything outside
                            #report-panel is hidden, so the panel carries its own. */}
                        <SealWatermark className="rounded-xl hidden print:flex" />

                        {/* Letterhead — printed as well as shown, except on the
                            applicant file, which opens with its own cover page. */}
                        <div className={`border-b-2 border-[#0d1f5c] px-4 py-4 text-center sm:px-6 ${report.type === "applicant" ? "print:hidden" : ""}`}>
                            {/* The seal and the Ilagan 2030 mark either side of the
                                office's lines — the letterhead every download carries. */}
                            <div className="flex items-center justify-center gap-3 sm:gap-5">
                                <img src="/images/ilagan1logo.png" alt="Seal of the City of Ilagan" className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                        Republic of the Philippines
                                    </p>
                                    <p className="text-base font-black text-[#0d1f5c] sm:text-lg">
                                        City of Ilagan, Isabela
                                    </p>
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#d4a017]">
                                        City Planning &amp; Development Office
                                    </p>
                                </div>
                                <img src="/images/Ilagan Logo2.png" alt="Ilagan 2030" className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14" />
                            </div>
                            <h2 className="mt-3 text-base font-black text-[#0d1f5c] sm:text-lg">{report.title}</h2>
                            <p className="text-sm font-bold text-[#d4a017]">{report.subtitle}</p>
                            <p className="mt-1 text-[11px] text-gray-400">Generated {report.generated_on}</p>
                        </div>

                        {/* Actions — screen only */}
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-100 px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:px-6 print:hidden">
                            <Button onClick={printReport} disabled={busy !== null} className="col-span-2 gap-2 bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90 sm:col-span-1">
                                {busy === "print" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                                {busy === "print" ? "Preparing…" : "Print"}
                            </Button>
                            <Button
                                onClick={() => (report.type === "applicant" ? savePack() : download("pdf"))}
                                disabled={busy !== null}
                                variant="outline"
                                className="gap-2 border-gray-200"
                            >
                                {busy === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                                <span className="truncate">{busy === "pdf" ? `Page ${progress.done} of ${progress.total}` : "PDF"}</span>
                            </Button>
                            <Button onClick={() => download("xlsx")} disabled={busy !== null} variant="outline" className="gap-2 border-gray-200">
                                <FileSpreadsheet className="h-4 w-4" />
                                Excel
                            </Button>
                        </div>

                        {/* Summary */}
                        <div className={`flex flex-wrap gap-x-4 gap-y-1 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs sm:px-6 ${report.type === "applicant" ? "print:hidden" : ""}`}>
                            <span>
                                <b className="text-[#0d1f5c]">{report.summary.applications}</b> application
                                {report.summary.applications === 1 ? "" : "s"}
                            </span>
                            {Object.entries(report.summary.status_counts || {}).map(([label, count]) => (
                                <span key={label} className="text-gray-600">
                                    {label}: <b className="text-[#0d1f5c]">{count}</b>
                                </span>
                            ))}
                        </div>

                        <div className="p-4 sm:p-6">
                            {report.type === "applicant" ? (
                                applications.length === 0 ? (
                                    <Empty>No applications on record for this applicant.</Empty>
                                ) : (
                                    <>
                                        {/* Stepper. One step per application; scrolls sideways on
                                            phones rather than wrapping into an unreadable stack. */}
                                        {applications.length > 1 && (
                                            <nav
                                                aria-label="Applications"
                                                className="mb-4 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 print:hidden"
                                            >
                                                <ol className="flex min-w-max items-center gap-2">
                                                    {applications.map((a, i) => {
                                                        const on = i === step;
                                                        return (
                                                            <li key={a.id} className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setStep(i)}
                                                                    aria-current={on ? "step" : undefined}
                                                                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                                                                        on
                                                                            ? "border-[#0d1f5c] bg-[#0d1f5c] text-white shadow"
                                                                            : "border-gray-200 bg-white text-gray-600 hover:border-[#d4a017] hover:text-[#0d1f5c]"
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${
                                                                            on ? "bg-[#d4a017] text-white" : "bg-gray-100 text-gray-600"
                                                                        }`}
                                                                    >
                                                                        {a.step}
                                                                    </span>
                                                                    <span className="whitespace-nowrap">{a.application_number}</span>
                                                                </button>
                                                                {i < applications.length - 1 && (
                                                                    <span className="h-px w-4 shrink-0 bg-gray-200" aria-hidden="true" />
                                                                )}
                                                            </li>
                                                        );
                                                    })}
                                                </ol>
                                            </nav>
                                        )}

                                        {/* On screen, one application at a time. On paper, all of
                                            them — a printed file with one of three transactions
                                            would be an incomplete record. */}
                                        <div className="print:hidden">
                                            {current && <ApplicationDetail app={current} total={applications.length} onZoom={setZoom} />}
                                        </div>
                                        {/* On paper the file becomes a pack of the submitted
                                            requirements, one to a page — for every application,
                                            not only the one on screen. */}
                                        {applications.map((a) => (
                                            <PrintPack key={a.id} app={a} total={applications.length} generatedOn={report.generated_on} />
                                        ))}

                                        {applications.length > 1 && (
                                            <div className="mt-4 flex items-center justify-between gap-2 print:hidden">
                                                <Button
                                                    variant="outline"
                                                    className="border-gray-200"
                                                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                                                    disabled={step === 0}
                                                >
                                                    Previous
                                                </Button>
                                                <span className="text-xs text-gray-400">
                                                    Application {step + 1} of {applications.length}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    className="border-gray-200"
                                                    onClick={() => setStep((s) => Math.min(applications.length - 1, s + 1))}
                                                    disabled={step === applications.length - 1}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )
                            ) : (
                                <>
                                    {report.truncated && (
                                        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 print:hidden">
                                            Showing the first {report.row_limit.toLocaleString()} of{" "}
                                            {report.summary.applications.toLocaleString()} applications on screen.
                                            The counts above cover all of them, and the PDF and Excel downloads
                                            include every row — or narrow the period to see them all here.
                                        </p>
                                    )}
                                    <RowsTable rows={report.rows ?? []} onSeeApplicant={seeApplicant} />
                                </>
                            )}
                        </div>
                    </div>
                )}
                <Lightbox item={zoom} onClose={() => setZoom(null)} />

                {/* While a PDF is being built: the pack, shown at its true size
                    so it can be photographed, under a curtain that says what is
                    happening. Gone again the moment the file is saved.

                    Both go straight onto <body>, in a layer pinned to the
                    viewport. html2canvas crops each photograph by where the
                    page sat in the live document, and it is asked to leave
                    everything but that page out of its clone — which shifts
                    anything laid out in flow. A pinned layer does not move. */}
                {busy === "pdf" && report?.type === "applicant" && createPortal(
                    <>
                        <div className="fixed inset-0 z-40 overflow-auto bg-white print:hidden" aria-hidden="true">
                            <div ref={captureRef} className="w-[210mm] bg-white">
                                {applications.map((a) => (
                                    <PrintPack key={a.id} app={a} total={applications.length} generatedOn={report.generated_on} mode="capture" />
                                ))}
                            </div>
                        </div>
                        <div
                            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/70 text-white print:hidden"
                            role="status"
                            aria-live="polite"
                        >
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="text-sm font-semibold">Building the PDF…</p>
                            <p className="text-xs text-white/70">
                                {progress.total ? `Page ${progress.done} of ${progress.total}` : "Readying the pictures"}
                            </p>
                        </div>
                    </>,
                    document.body
                )}
        </>
    );
}
