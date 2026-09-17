import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { actionTone, toneClasses, formatDate, formatActionLabel, roleLabel, initialsOf } from "./utils";

/**
 * One audit entry, laid out plainly: who, what, when at the top; the facts
 * as a two-column list; the before/after of an edit as a table. White, one
 * accent (the action's tone), thin rules - nothing boxed inside boxes.
 */

/** One label/value row of the fact list. */
function Row({ label, children, mono = false, wrap = false }) {
    return (
        <div className="grid grid-cols-[120px_1fr] gap-x-4 py-2.5 sm:grid-cols-[150px_1fr]">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
            <dd className={`min-w-0 text-sm text-gray-800 ${mono ? "font-mono text-[13px]" : ""} ${wrap ? "break-all" : "truncate"}`}>
                {children ?? <span className="text-gray-300">—</span>}
            </dd>
        </div>
    );
}

/** A value that may be long: shown on one line until "Show all". */
function Expandable({ text, mono = false }) {
    const [open, setOpen] = useState(false);
    if (!text) return <span className="text-gray-300">—</span>;
    const long = String(text).length > 80;
    return (
        <span className={`${mono ? "font-mono text-[13px]" : ""} ${open ? "break-all whitespace-normal" : ""}`}>
            {open || !long ? text : `${String(text).slice(0, 80)}…`}
            {long && (
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="ml-2 text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
                >
                    {open ? "Show less" : "Show all"}
                </button>
            )}
        </span>
    );
}

/** A stored value as text - objects and arrays as JSON, blanks as "(empty)". */
function valueText(value) {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

function Cell({ value }) {
    const text = valueText(value);
    return text === null
        ? <span className="italic text-gray-300">(empty)</span>
        : <span className="break-words">{text}</span>;
}

const humanKey = (key) => String(key).replace(/_/g, " ");

export function DetailsDialog({ isOpen, onOpenChange, selectedLog }) {
    if (!selectedLog) return null;

    const log = selectedLog;
    const tone = toneClasses[actionTone(log.action)] || toneClasses.neutral;
    const isSystem = !log.user_name && !log.user_email;
    const role = log.user?.user_type ? roleLabel(log.user.user_type) : null;

    // The fields the edit touched. Read off what was written afterwards: a
    // field only in the "before" snapshot (an id, a timestamp) was not sent
    // back, not cleared. A deletion has no "after" at all, so then every
    // field of the record that was removed is listed.
    const before = log.old_values || {};
    const after = log.new_values || {};
    const changed = (Object.keys(after).length ? Object.keys(after) : Object.keys(before))
        .filter((key) => valueText(before[key]) !== valueText(after[key]));

    // Anything the entry recorded besides the fixed columns - minus the email,
    // which is already in the header.
    const metadata = log.metadata && typeof log.metadata === "object"
        ? Object.entries(log.metadata).filter(([key]) => key !== "email")
        : [];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden bg-white p-0 sm:rounded-2xl">
                {/* Header: who did what, when */}
                <DialogHeader className="space-y-0 border-b border-gray-100 px-6 pb-4 pt-6 text-left">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                            {isSystem ? "SYS" : initialsOf(log.user_name || log.user_email)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="truncate text-base font-semibold text-gray-900">
                                {isSystem ? "System" : log.user_name || log.user_email}
                            </DialogTitle>
                            <DialogDescription className="truncate text-sm text-gray-500">
                                {[role, log.user_email].filter(Boolean).join(" · ") || "Automated action"}
                            </DialogDescription>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}>
                                    {formatActionLabel(log.action)}
                                </span>
                                <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="max-h-[calc(90vh-120px)] overflow-y-auto px-6 py-2">
                    {/* What happened */}
                    <p className="py-4 text-sm leading-relaxed text-gray-800">{log.description}</p>

                    {/* The facts */}
                    <dl className="divide-y divide-gray-100 border-t border-gray-100">
                        {log.model_type && (
                            <Row label="Record">
                                {log.model_type}{log.model_id ? ` #${log.model_id}` : ""}
                            </Row>
                        )}
                        <Row label="IP address" mono>{log.ip_address}</Row>
                        <Row label="Request" wrap>
                            {log.method && <span className="mr-2 font-mono text-[13px] text-gray-500">{log.method}</span>}
                            <Expandable text={log.url} mono />
                        </Row>
                        <Row label="Browser" wrap>
                            <Expandable text={log.user_agent} />
                        </Row>
                        {metadata.map(([key, value]) => (
                            <Row key={key} label={humanKey(key)} wrap>
                                <Cell value={value} />
                            </Row>
                        ))}
                    </dl>

                    {/* Before / after */}
                    {changed.length > 0 && (
                        <div className="mt-6 mb-4">
                            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                                Changes · {changed.length}
                            </h3>
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                        <tr>
                                            <th className="px-3 py-2 font-medium">Field</th>
                                            <th className="px-3 py-2 font-medium">Before</th>
                                            <th className="px-3 py-2 font-medium">After</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {changed.map((key) => (
                                            <tr key={key} className="align-top">
                                                <td className="w-1/4 px-3 py-2 font-medium capitalize text-gray-700">{humanKey(key)}</td>
                                                <td className="w-[37%] px-3 py-2 text-gray-500 line-through decoration-gray-300"><Cell value={before[key]} /></td>
                                                <td className="w-[37%] px-3 py-2 text-gray-900"><Cell value={after[key]} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
