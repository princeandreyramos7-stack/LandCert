import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

const CARDS = [
    { key: "all",      label: "Total Requests",          sub: "All submissions",         bg: "bg-[#0d1f5c]/5", text: "text-[#0d1f5c]", icon: FileText,     iconBg: "bg-[#0d1f5c]" },
    { key: "pending",  label: "For Verification",        sub: "Awaiting document check", bg: "bg-yellow-50",   text: "text-yellow-900", icon: Clock,        iconBg: "bg-yellow-500" },
    { key: "approved", label: "Application Approved",    sub: "Successfully processed",  bg: "bg-green-50",    text: "text-green-900",  icon: CheckCircle2, iconBg: "bg-green-500"  },
    { key: "rejected", label: "Application Rejected",    sub: "Needs attention",         bg: "bg-red-50",      text: "text-red-900",    icon: XCircle,      iconBg: "bg-red-500"    },
];

export function RequestStats({ stats, onFilterChange }) {
    const values = { all: stats.total, pending: stats.pending, approved: stats.approved, rejected: stats.rejected };
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CARDS.map(c => (
                <Card key={c.key} className={`cursor-pointer ${c.bg} border-0 hover:shadow-md transition-shadow`}
                    onClick={() => onFilterChange(c.key)}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-xs font-bold mb-1 ${c.text} opacity-70 uppercase tracking-wide`}>{c.label}</p>
                                <p className={`text-2xl font-black ${c.text}`}>{values[c.key]}</p>
                                <p className={`text-xs mt-0.5 ${c.text} opacity-60`}>{c.sub}</p>
                            </div>
                            <div className={`p-2 ${c.iconBg} rounded-lg`}>
                                <c.icon className="h-5 w-5 text-white"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
