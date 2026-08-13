import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { BarChart3, Shield, Users, FileText, Clock } from "lucide-react";
import { AnalyticsDashboard } from "@/Components/Admin/Analytics";

export function SuperAdminDashboard({ analytics = null, systemStats = {} }) {
    const [showAnalytics, setShowAnalytics] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleToggle = () => {
        setIsTransitioning(true);
        setTimeout(() => { setShowAnalytics(v => !v); setIsTransitioning(false); }, 150);
    };

    const statCards = [
        { label: "Total Users",      sub: `${systemStats.total_applicants||0} applicants · ${systemStats.total_admins||0} admins`, value: systemStats.total_users||0,     icon: Users,    border: "border-l-[#0d1f5c]", iconBg: "bg-[#0d1f5c]/10", iconColor: "text-[#0d1f5c]" },
        { label: "Admin Users",      sub: "System administrators",                                                                    value: systemStats.total_admins||0,    icon: Shield,   border: "border-l-[#d4a017]",  iconBg: "bg-[#d4a017]/10",  iconColor: "text-[#d4a017]" },
        { label: "Total Requests",   sub: "All time submissions",                                                                     value: systemStats.total_requests||0,  icon: FileText, border: "border-l-blue-500",   iconBg: "bg-blue-50",       iconColor: "text-blue-600"  },
        { label: "Pending Requests", sub: "Awaiting action",                                                                          value: systemStats.pending_requests||0, icon: Clock,   border: "border-l-yellow-500", iconBg: "bg-yellow-50",     iconColor: "text-yellow-600" },
    ];

    return (
        <div className="space-y-6">
            {/* Header banner */}
            <div className="relative overflow-hidden rounded-2xl text-white"
                style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}>
                <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs><pattern id="sadg" width="48" height="48" patternUnits="userSpaceOnUse">
                        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#93c5fd" strokeWidth="0.7"/>
                    </pattern></defs>
                    <rect width="100%" height="100%" fill="url(#sadg)"/>
                </svg>
                <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: "radial-gradient(circle,#d4a017,transparent 70%)" }}/>
                <div className="relative z-10 flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#d4a017]/20 border border-[#d4a017]/30 rounded-xl">
                            <Shield className="h-7 w-7 text-[#d4a017]"/>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1 h-4 rounded-full bg-[#d4a017]"/>
                                <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">CPDO Super Admin</p>
                            </div>
                            <h2 className="text-2xl font-black text-white">Dashboard Overview</h2>
                            <p className="text-blue-200/70 text-sm mt-0.5">Advanced analytics and system monitoring</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleToggle} disabled={isTransitioning}
                        className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all rounded-xl">
                        <BarChart3 className={`h-4 w-4 transition-transform duration-300 ${isTransitioning ? "rotate-180" : ""}`}/>
                        {showAnalytics ? "Hide" : "Show"} Analytics
                    </Button>
                </div>
            </div>

            {/* System stat cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((s, i) => (
                    <Card key={i} className={`border-l-4 ${s.border} bg-white shadow-sm hover:shadow-md transition-shadow`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wide">{s.label}</CardTitle>
                            <div className={`h-8 w-8 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                                <s.icon className={`h-4 w-4 ${s.iconColor}`}/>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-[#0d1f5c]">{s.value}</div>
                            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Analytics section */}
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
                            <div className="flex flex-col items-center justify-center min-h-[280px] space-y-6">
                                <div className="w-40 h-40 rounded-full border-4 border-[#d4a017]/30 bg-[#0d1f5c]/5 flex items-center justify-center">
                                    <img src="/images/ilagan.png" alt="CPDO Logo" className="w-28 h-28 object-contain"/>
                                </div>
                                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#d4a017]/30 bg-[#0d1f5c]/5">
                                    <Shield className="w-4 h-4 text-[#0d1f5c]"/>
                                    <span className="text-[#0d1f5c] font-bold text-sm">Super Administrator — CPDO Ilagan City</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
