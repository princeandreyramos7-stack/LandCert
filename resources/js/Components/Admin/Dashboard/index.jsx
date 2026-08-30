import React, { useState } from "react";
import { Button } from "@/Components/ui/button";
import { BarChart3, Clock, FileText, CheckCircle2 } from "lucide-react";

import { AnalyticsDashboard } from "@/Components/Admin/Analytics";

export function AdminDashboard({ analytics = null, stats = {}, applications = [] }) {
    const [showAnalytics, setShowAnalytics] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleToggle = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setShowAnalytics(!showAnalytics);
            setIsTransitioning(false);
        }, 150);
    };

    const total = stats.total ?? applications.length ?? 0;
    const pending = stats.pending ?? 0;
    const approved = stats.approved ?? 0;

    return (
        <div className="space-y-6">
            {/* Header banner */}
            <div
                className="relative overflow-hidden rounded-2xl text-white"
                style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}
            >
                <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="adg" width="48" height="48" patternUnits="userSpaceOnUse">
                            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#93c5fd" strokeWidth="0.7" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#adg)" />
                </svg>
                <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: "radial-gradient(circle,#d4a017,transparent 70%)" }} />

                <div className="relative z-10 flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-[#d4a017]/50 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                            <img src="/images/ilagan1.png" alt="City of Ilagan" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1 h-4 rounded-full bg-[#d4a017]" />
                                <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">
                                    CPDO Zoning Officer
                                </p>
                            </div>
                            <h2 className="text-2xl font-black text-white">Dashboard Overview</h2>
                            <p className="text-blue-200/70 text-sm mt-0.5">
                                Comprehensive analytics and insights
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleToggle}
                        disabled={isTransitioning}
                        className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all rounded-xl"
                    >
                        <BarChart3 className={`h-4 w-4 transition-transform duration-300 ${isTransitioning ? "rotate-180" : ""}`} />
                        {showAnalytics ? "Hide" : "Show"} Analytics
                    </Button>
                </div>
            </div>

            {/* Analytics */}
            {showAnalytics && analytics && (
                <div className="animate-in fade-in slide-in-from-bottom duration-500">
                    <AnalyticsDashboard analytics={analytics} />
                </div>
            )}

            {/* Summary panel when analytics are hidden */}
            {!showAnalytics && (
                <div className={`transition-all duration-500 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        <div className="p-6 sm:p-10">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Seal */}
                                <div className="w-32 h-32 rounded-full border-4 border-[#d4a017]/30 overflow-hidden shrink-0 shadow-lg">
                                    <img src="/images/ilagan1.png" alt="City of Ilagan" className="w-full h-full object-cover" />
                                </div>

                                {/* Copy */}
                                <div className="flex-1 text-center md:text-left space-y-3">
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <div className="w-1 h-4 rounded-full bg-[#d4a017]" />
                                        <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">
                                            Zoning Officer — CPDO Ilagan City
                                        </p>
                                    </div>
                                    <h3 className="text-2xl font-black text-[#0d1f5c]">Welcome back</h3>
                                    <p className="text-gray-500 text-sm max-w-xl mx-auto md:mx-0">
                                        Analytics are hidden. Turn them back on for
                                        <span className="font-semibold text-[#0d1f5c]"> submissions</span>,
                                        payments, certificates and processing-time insights.
                                    </p>

                                    {/* Quick facts */}
                                    <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
                                        {[
                                            { icon: Clock,        text: `${pending} pending`,             cls: "text-yellow-700 bg-yellow-50 border-yellow-200" },
                                            { icon: FileText,      text: `${total} total applications`,    cls: "text-blue-700 bg-blue-50 border-blue-200" },
                                            { icon: CheckCircle2,  text: `${approved} approved`,           cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                                        ].map((f, i) => (
                                            <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${f.cls}`}>
                                                <f.icon className="w-3.5 h-3.5" />
                                                {f.text}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="pt-2">
                                        <Button onClick={handleToggle} disabled={isTransitioning}
                                            className="gap-2 bg-[#0d1f5c] hover:bg-[#0d1f5c]/90 text-white rounded-xl">
                                            <BarChart3 className="h-4 w-4" />
                                            Show Analytics
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
