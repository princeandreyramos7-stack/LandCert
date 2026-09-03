import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

const CARDS = [
    { key: "all",      label: "Total Requests",          sub: "All submissions",         bg: "bg-[#0d1f5c]/5", text: "text-[#0d1f5c]", icon: FileText,     iconBg: "bg-[#0d1f5c]" },
    { key: "pending",  label: "For Verification",        sub: "Awaiting document check", bg: "bg-yellow-50",   text: "text-yellow-900", icon: Clock,        iconBg: "bg-yellow-500" },
    { key: "approved", label: "Application Approved",    sub: "Successfully processed",  bg: "bg-green-50",    text: "text-green-900",  icon: CheckCircle2, iconBg: "bg-green-500"  },
    { key: "rejected", label: "Application Denied",    sub: "Needs attention",         bg: "bg-red-50",      text: "text-red-900",    icon: XCircle,      iconBg: "bg-red-500"    },
];

export function RequestStats({ stats, onFilterChange }) {
    const values = { all: stats.total, pending: stats.pending, approved: stats.approved, rejected: stats.rejected };
    return (
        // Two across on a phone rather than one: these are four short counts,
        // and a single column pushed the table below the fold on every load.
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {CARDS.map(c => (
                <Card
                    key={c.key}
                    role="button"
                    tabIndex={0}
                    aria-label={`Filter by ${c.label}`}
                    className={`cursor-pointer ${c.bg} border-0 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1f5c] focus-visible:ring-offset-2`}
                    onClick={() => onFilterChange(c.key)}
                    onKeyDown={(e) => {
                        // The card filters the table, so it has to be reachable
                        // without a mouse.
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onFilterChange(c.key);
                        }
                    }}
                >
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className={`mb-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${c.text} opacity-70`}>
                                    {c.label}
                                </p>
                                <p className={`text-xl font-black sm:text-2xl ${c.text}`}>{values[c.key]}</p>
                                <p className={`mt-0.5 hidden text-xs sm:block ${c.text} opacity-60`}>{c.sub}</p>
                            </div>
                            <div className={`shrink-0 rounded-lg p-1.5 sm:p-2 ${c.iconBg}`}>
                                <c.icon className="h-4 w-4 text-white sm:h-5 sm:w-5"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
