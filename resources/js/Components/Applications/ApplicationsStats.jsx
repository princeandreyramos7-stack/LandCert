import React from "react";
import { matchesStatusFilter } from "@/lib/applicationStatus";
import { FileText, FileCheck, Hourglass, Wallet, Award, XCircle, RotateCcw } from "lucide-react";

/**
 * The six counts across the top of All Applications, each one a filter for the
 * table below. The keys are STATUS_FILTERS values so a tile and the status
 * dropdown always mean the same thing, and the counts use the same matcher
 * the table does.
 */
const ALL_TILES = [
    { key: "all",                  label: "All",                 sub: "every application",       icon: FileText,  tone: "text-[#0d1f5c]",  ring: "ring-[#0d1f5c]",  wash: "bg-[#0d1f5c]/5",  chip: "bg-[#0d1f5c] text-white", roles: ["admin", "super_admin"] },
    { key: "pending",              label: "For Verification",    sub: "documents to check",      icon: FileCheck, tone: "text-sky-800",    ring: "ring-sky-500",    wash: "bg-sky-50",       chip: "bg-sky-500 text-white", roles: ["admin"] },
    { key: "reviewed",             label: "For Approval",        sub: "with the administrator",  icon: Hourglass, tone: "text-amber-800",  ring: "ring-amber-500",  wash: "bg-amber-50",     chip: "bg-amber-500 text-white", roles: ["admin", "super_admin"] },
    { key: "approved",             label: "For Payment",         sub: "approved, fee unpaid",    icon: Wallet,    tone: "text-violet-800", ring: "ring-violet-500", wash: "bg-violet-50",    chip: "bg-violet-500 text-white", roles: ["admin", "super_admin"] },
    { key: "application_approved", label: "Approved",            sub: "paid, certificate stage", icon: Award,     tone: "text-emerald-800", ring: "ring-emerald-500", wash: "bg-emerald-50", chip: "bg-emerald-500 text-white", roles: ["admin", "super_admin"] },
    { key: "in_applicant",         label: "Returned",            sub: "back to applicant",       icon: RotateCcw, tone: "text-orange-800", ring: "ring-orange-500", wash: "bg-orange-50",    chip: "bg-orange-500 text-white", roles: ["super_admin"] },
    { key: "rejected",             label: "Denied",              sub: "not approved",            icon: XCircle,   tone: "text-rose-800",   ring: "ring-rose-500",   wash: "bg-rose-50",      chip: "bg-rose-500 text-white", roles: ["admin", "super_admin"] },
];

function getTilesForRole(role) {
    return ALL_TILES.filter((tile) => tile.roles.includes(role)).map((tile) =>
        // The administrator's board holds only what the officer has reviewed,
        // so its "All" is all of those, not every application on file.
        tile.key === "all" && role === "super_admin"
            ? { ...tile, label: "All reviewed", sub: "reviewed by the officer" }
            : tile,
    );
}

export function countByFilter(requests, key) {
    if (key === "all") return requests.length;
    return requests.filter((r) => matchesStatusFilter(r.status, key)).length;
}

export function ApplicationsStats({ requests, active = "all", onSelect, role = "admin" }) {
    const TILES = getTilesForRole(role);
    
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-6">
            {TILES.map((t) => {
                const selected = active === t.key;
                return (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => onSelect(t.key)}
                        aria-pressed={selected}
                        className={`group flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 text-left transition-all hover:-translate-y-px hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${t.ring} ${selected ? `border-transparent ring-2 ${t.wash}` : "border-gray-100 shadow-sm"}`}
                    >
                        <span className={`shrink-0 rounded-lg p-2 ${selected ? t.chip : `${t.wash} ${t.tone}`}`}>
                            <t.icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                            <span className={`block text-[10px] font-bold uppercase tracking-wide ${t.tone} opacity-80`}>{t.label}</span>
                            <span className="block text-xl font-black leading-tight text-gray-900">{countByFilter(requests, t.key)}</span>
                            <span className="hidden truncate text-[11px] text-gray-400 sm:block">{t.sub}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
