import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { BarChart3, LayoutDashboard } from "lucide-react";

import { AnalyticsDashboard } from "@/Components/Admin/Analytics";

export function AdminDashboard({ analytics = null }) {
    const [showAnalytics, setShowAnalytics] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleToggle = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setShowAnalytics(!showAnalytics);
            setIsTransitioning(false);
        }, 150);
    };

    return (
        <div className="space-y-6">
            {/* Dashboard header bar */}
            <div className="relative overflow-hidden rounded-2xl text-white"
                style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}>
                <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs><pattern id="adg" width="48" height="48" patternUnits="userSpaceOnUse">
                        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#93c5fd" strokeWidth="0.7"/>
                    </pattern></defs>
                    <rect width="100%" height="100%" fill="url(#adg)"/>
                </svg>
                <div className="relative z-10 flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#d4a017]/20 border border-[#d4a017]/30 rounded-xl">
                            <LayoutDashboard className="h-7 w-7 text-[#d4a017]"/>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1 h-4 rounded-full bg-[#d4a017]"/>
                                <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">CPDO Admin</p>
                            </div>
                            <h2 className="text-2xl font-black text-white">Dashboard Overview</h2>
                            <p className="text-blue-200/70 text-sm mt-0.5">Comprehensive analytics and insights</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleToggle}
                        disabled={isTransitioning}
                        className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all rounded-xl"
                    >
                        <BarChart3 className={`h-4 w-4 transition-transform duration-300 ${isTransitioning ? "rotate-180" : ""}`}/>
                        {showAnalytics ? "Hide" : "Show"} Analytics
                    </Button>
                </div>
            </div>

            {/* Analytics Section */}
            {showAnalytics && analytics && (
                <div className="animate-in fade-in slide-in-from-bottom duration-500">
                    <AnalyticsDashboard analytics={analytics}/>
                </div>
            )}

            {/* Logo splash when analytics hidden */}
            {!showAnalytics && (
                <div className={`transition-all duration-500 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                    <Card className="border border-gray-100 shadow-sm overflow-hidden">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
                                <div className="w-40 h-40 rounded-full border-4 border-[#d4a017]/30 bg-[#0d1f5c]/5 flex items-center justify-center">
                                    <img src="/images/ilagan.png" alt="CPDO Logo" className="w-28 h-28 object-contain"/>
                                </div>
                                <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#d4a017]/30 bg-[#0d1f5c]/5">
                                    <div className="w-2 h-2 rounded-full bg-[#d4a017] animate-pulse"/>
                                    <span className="text-[#0d1f5c] font-bold text-sm">CPDO — City Planning & Development Office</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
