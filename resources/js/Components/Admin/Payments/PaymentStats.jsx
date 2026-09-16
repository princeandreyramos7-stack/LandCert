import React from "react";
import { DollarSign, Clock, CheckCircle2, XCircle, Wallet, Plus } from "lucide-react";
import { PAYMENT_STATUS } from "./utils.jsx";

/**
 * The counts above the payments list, as filters.
 *
 * Each tile is one status of the list below and clicking it shows just those
 * rows, so "3 need verification" is one click from the three receipts to
 * check. The fifth tile is different in kind: approved applications that have
 * no payment yet are not payment records at all, so it cannot filter the
 * list - for the Zoning Officer it opens "Add Payment" on one of them
 * instead, and for the Administrator it just reports the number.
 */
export function PaymentStats({ payments = [], awaiting = 0, active = "all", onSelect, onRecordPayment }) {
    const count = (status) => payments.filter((p) => p.payment_status === status).length;

    const tiles = [
        { key: "all",      label: "Total payments",  value: payments.length,   sub: "all records",      icon: DollarSign,   tone: "text-[#0d1f5c]",   wash: "bg-[#0d1f5c]/5",  chip: "bg-[#0d1f5c] text-white",   ring: "ring-[#0d1f5c]" },
        { key: "pending",  label: PAYMENT_STATUS.pending.label,  value: count("pending"),  sub: "receipts to check", icon: Clock,        tone: "text-amber-800",   wash: "bg-amber-50",     chip: "bg-amber-500 text-white",   ring: "ring-amber-500" },
        { key: "verified", label: PAYMENT_STATUS.verified.label, value: count("verified"), sub: "confirmed",        icon: CheckCircle2, tone: "text-emerald-800", wash: "bg-emerald-50",   chip: "bg-emerald-500 text-white", ring: "ring-emerald-500" },
        { key: "rejected", label: PAYMENT_STATUS.rejected.label, value: count("rejected"), sub: "declined",         icon: XCircle,      tone: "text-rose-800",    wash: "bg-rose-50",      chip: "bg-rose-500 text-white",    ring: "ring-rose-500" },
    ];

    return (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {tiles.map((t) => {
                const selected = active === t.key;
                return (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => onSelect?.(selected ? "all" : t.key)}
                        aria-pressed={selected}
                        className={`group flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-all hover:-translate-y-px hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${t.ring} ${
                            selected ? `border-transparent ring-2 ${t.wash}` : "border-gray-100 shadow-sm"
                        }`}
                    >
                        <span className={`shrink-0 rounded-lg p-2 ${selected ? t.chip : `${t.wash} ${t.tone}`}`}>
                            <t.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                            <span className={`block text-[10px] font-bold uppercase tracking-wide ${t.tone} opacity-80`}>{t.label}</span>
                            <span className="block text-2xl font-black leading-tight text-gray-900">{t.value}</span>
                            <span className="hidden truncate text-[11px] text-gray-400 sm:block">{t.sub}</span>
                        </span>
                    </button>
                );
            })}

            {/* Approved, nothing paid yet: not a row in the list. */}
            {onRecordPayment ? (
                <button
                    type="button"
                    onClick={onRecordPayment}
                    className="group flex items-center gap-3 rounded-xl border border-dashed border-violet-300 bg-violet-50/60 px-4 py-3 text-left transition-all hover:-translate-y-px hover:border-violet-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                    <span className="shrink-0 rounded-lg bg-violet-100 p-2 text-violet-700"><Wallet className="h-4 w-4" /></span>
                    <span className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-violet-800 opacity-80">Awaiting payment</span>
                        <span className="block text-2xl font-black leading-tight text-gray-900">{awaiting}</span>
                        <span className="hidden items-center gap-1 text-[11px] font-semibold text-violet-700 sm:flex"><Plus className="h-3 w-3" /> Record a payment</span>
                    </span>
                </button>
            ) : (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <span className="shrink-0 rounded-lg bg-violet-50 p-2 text-violet-700"><Wallet className="h-4 w-4" /></span>
                    <span className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-violet-800 opacity-80">Awaiting payment</span>
                        <span className="block text-2xl font-black leading-tight text-gray-900">{awaiting}</span>
                        <span className="hidden truncate text-[11px] text-gray-400 sm:block">approved, unpaid</span>
                    </span>
                </div>
            )}
        </div>
    );
}
