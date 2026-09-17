import React from "react";
import { formatDate, formatCurrency, PaymentStatusBadge } from "./utils.jsx";
import { ExternalLink } from "lucide-react";

/**
 * One payment, laid out plainly: the amount and its status at the top, then
 * the facts as a two-column list, then what the office said about it. White,
 * thin rules, nothing boxed inside boxes - the same shape as the audit entry.
 */

function Row({ label, children, mono = false }) {
    return (
        <div className="grid grid-cols-[130px_1fr] gap-x-4 py-2.5 sm:grid-cols-[170px_1fr]">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
            <dd className={`min-w-0 break-words text-sm text-gray-800 ${mono ? "font-mono text-[13px]" : ""}`}>
                {children === null || children === undefined || children === "" ? <span className="text-gray-300">—</span> : children}
            </dd>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className="mt-5">
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">{title}</h3>
            <dl className="divide-y divide-gray-100 border-t border-gray-100">{children}</dl>
        </section>
    );
}

function Note({ title, children, tone = "text-gray-800" }) {
    return (
        <section className="mt-5">
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">{title}</h3>
            <p className={`whitespace-pre-wrap border-t border-gray-100 pt-2.5 text-sm leading-relaxed ${tone}`}>{children}</p>
        </section>
    );
}

function formatPaymentMethod(method) {
    if (!method) return null;
    return method.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatDateTime(value) {
    if (!value) return null;
    return new Date(value).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function PaymentDetailsCard({ payment }) {
    if (!payment) {
        return <p className="py-6 text-center text-sm text-gray-400">No payment data available</p>;
    }

    const request = payment.request || {};
    const applicant = payment.applicant_name || request.applicant?.applicant_name || request.applicant?.name || null;
    const applicationNo = payment.application_number || request.application_number || (payment.request_id ? `#${payment.request_id}` : null);
    const verifier = payment.verified_by_user?.name
        || (payment.verified_by_name && payment.verified_by_name !== "N/A" ? payment.verified_by_name : null)
        || (payment.verified_by ? `User #${payment.verified_by}` : null);

    return (
        <div className="bg-white">
            {/* The amount, and where it stands */}
            <div className="flex flex-wrap items-end justify-between gap-3 pb-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Amount paid</p>
                    <p className="mt-0.5 text-3xl font-semibold tracking-tight text-gray-900">{formatCurrency(payment.amount)}</p>
                    <p className="mt-1 text-sm text-gray-500">
                        {applicant || "Applicant"}{applicationNo ? <> · <span className="font-mono text-[13px]">{applicationNo}</span></> : null}
                    </p>
                </div>
                <PaymentStatusBadge status={payment.payment_status} />
            </div>

            <Section title="Receipt">
                <Row label="O.R. number" mono>{payment.receipt_number}</Row>
                <Row label="Payment date">{formatDate(payment.payment_date)}</Row>
                <Row label="Method">{formatPaymentMethod(payment.payment_method)}</Row>
                {payment.check_number && <Row label="Check number" mono>{payment.check_number}</Row>}
                {payment.reference_number && <Row label="Reference number" mono>{payment.reference_number}</Row>}
                <Row label="Receipt copy">
                    {payment.receipt_file_path ? (
                        <a
                            href={`/payments/${payment.id}/receipt`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-[#0d1f5c] underline-offset-2 hover:underline"
                        >
                            Open scanned receipt <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    ) : (
                        <span className="text-gray-400">None attached</span>
                    )}
                </Row>
            </Section>

            <Section title="Application">
                <Row label="Application No." mono>{applicationNo}</Row>
                <Row label="Decision No." mono>{payment.decision_number || request.decision_number}</Row>
                <Row label="Applicant">{applicant}</Row>
                <Row label="Type">{payment.project_type || request.project_type}</Row>
                {(payment.user_name || request.user?.name) && (
                    <Row label="Account">
                        {payment.user_name || request.user?.name}
                        {(payment.user_email || request.user?.email) && (
                            <span className="text-gray-400"> · {payment.user_email || request.user?.email}</span>
                        )}
                    </Row>
                )}
                {request.status && <Row label="Application status"><span className="capitalize">{String(request.status).replace(/_/g, " ")}</span></Row>}
            </Section>

            <Section title="Record">
                <Row label="Submitted">{formatDateTime(payment.created_at)}</Row>
                {(verifier || payment.verified_at) && (
                    <Row label="Verified">
                        {formatDateTime(payment.verified_at)}
                        {verifier && <span className="text-gray-400"> · by {verifier}</span>}
                    </Row>
                )}
                {payment.updated_at && payment.updated_at !== payment.created_at && (
                    <Row label="Last updated">{formatDateTime(payment.updated_at)}</Row>
                )}
            </Section>

            {payment.notes && <Note title="Notes">{payment.notes}</Note>}
            {payment.rejection_reason && <Note title="Why it was not accepted" tone="text-rose-700">{payment.rejection_reason}</Note>}

            {payment.audit_trail && payment.audit_trail.length > 0 && (
                <section className="mt-5">
                    <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">History</h3>
                    <ol className="divide-y divide-gray-100 border-t border-gray-100">
                        {payment.audit_trail.map((entry, index) => (
                            <li key={index} className="py-2.5 text-sm">
                                <span className="font-medium text-gray-800">{entry.action}</span>
                                <span className="text-gray-400"> · {entry.user} · {formatDateTime(entry.timestamp)}</span>
                                {entry.details && <p className="mt-0.5 text-xs text-gray-500">{entry.details}</p>}
                            </li>
                        ))}
                    </ol>
                </section>
            )}
        </div>
    );
}
