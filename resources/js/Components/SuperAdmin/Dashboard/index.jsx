import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { BarChart3, Shield, Users, FileText, Clock, Activity } from "lucide-react";
import { AnalyticsDashboard } from "@/Components/Admin/Analytics";
import { AdminWorkflowTab } from "./AdminWorkflowTab";

export function SuperAdminDashboard({ analytics = null, systemStats = {}, adminActivity = {} }) {
    const [showAnalytics, setShowAnalytics] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleToggle = () => {
        setIsTransitioning(true);
        setTimeout(() => { setShowAnalytics(v => !v); setIsTransitioning(false); }, 150);
    };

    const statCards = [
        { label: "Total Users",        sub: `${systemStats.total_applicants||0} applicants · ${systemStats.total_admins||0} admins`, value: systemStats.total_users||0,     icon: Users,    border: "border-l-[#0d1f5c]", iconBg: "bg-[#0d1f5c]/10", iconColor: "text-[#0d1f5c]" },
        { label: "Admin Users",        sub: "System administrators",                                                                    value: systemStats.total_admins||0,    icon: Shield,   border: "border-l-[#d4a017]",  iconBg: "bg-[#d4a017]/10",  iconColor: "text-[#d4a017]" },
        { label: "Total Applications", sub: "All time submissions",                                                                     value: systemStats.total_requests||0,  icon: FileText, border: "border-l-blue-500",   iconBg: "bg-blue-50",       iconColor: "text-blue-600"  },
        { label: "Pending Applications", sub: "Awaiting action",                                                                        value: systemStats.pending_requests||0, icon: Clock,   border: "border-l-yellow-500", iconBg: "bg-yellow-50",     iconColor: "text-yellow-600" },
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
                <div className="relative z-10 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="w-14 h-14 rounded-full border-2 border-[#d4a017]/40 bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
                            <img src="/images/ilagan1.png" alt="City of Ilagan" className="w-full h-full object-cover"/>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1 h-4 rounded-full bg-[#d4a017]"/>
                                <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">CPDO Zoning Administrator</p>
                            </div>
                            <h2 className="truncate text-xl font-black text-white sm:text-2xl">Dashboard Overview</h2>
                            <p className="text-blue-200/70 text-sm mt-0.5">Advanced analytics, system monitoring & admin workflow</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleToggle} disabled={isTransitioning}
                        className="w-full shrink-0 justify-center gap-2 rounded-xl border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 hover:text-white sm:w-auto">
                        <BarChart3 className={`h-4 w-4 transition-transform duration-300 ${isTransitioning ? "rotate-180" : ""}`}/>
                        {showAnalytics ? "Hide" : "Show"} Analytics
                    </Button>
                </div>
            </div>

            {/* System stat cards — only alongside the analytics view */}
            {showAnalytics && (
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
            )}

            {/* Analytics and Admin Workflow Tabs */}
            {showAnalytics && (
                <div className="animate-in fade-in slide-in-from-bottom duration-500">
                    <Tabs defaultValue="analytics" className="space-y-4">
                        <TabsList className="flex h-auto w-full max-w-md justify-start gap-1 overflow-x-auto sm:grid sm:h-10 sm:grid-cols-2">
                            <TabsTrigger value="analytics" className="shrink-0 gap-2">
                                <BarChart3 className="h-4 w-4" />
                                System Analytics
                            </TabsTrigger>
                            <TabsTrigger value="workflow" className="shrink-0 gap-2">
                                <Activity className="h-4 w-4" />
                                Admin Workflow
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="analytics" className="space-y-4">
                            {analytics && <AnalyticsDashboard analytics={analytics}/>}
                        </TabsContent>

                        <TabsContent value="workflow" className="space-y-4">
                            <AdminWorkflowTab adminActivity={adminActivity} />
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            {/* Summary panel when analytics are hidden */}
            {!showAnalytics && (
                <div className={`transition-all duration-500 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                    <Card className="border border-gray-100 shadow-sm overflow-hidden">
                        <CardContent className="p-6 sm:p-10">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Seal */}
                                <div className="w-32 h-32 rounded-full border-4 border-[#d4a017]/30 overflow-hidden shrink-0 shadow-lg">
                                    <img src="/images/ilagan1.png" alt="City of Ilagan" className="w-full h-full object-cover"/>
                                </div>

                                {/* Copy */}
                                <div className="flex-1 text-center md:text-left space-y-3">
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <div className="w-1 h-4 rounded-full bg-[#d4a017]"/>
                                        <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">
                                            Zoning Administrator — CPDO Ilagan City
                                        </p>
                                    </div>
                                    <h3 className="text-2xl font-black text-[#0d1f5c]">Welcome back</h3>
                                    <p className="text-gray-500 text-sm max-w-xl mx-auto md:mx-0">
                                        Analytics are hidden. Turn them back on for
                                        <span className="font-semibold text-[#0d1f5c]"> system charts</span>,
                                        geographic breakdowns and the admin workflow log.
                                    </p>

                                    {/* Quick facts */}
                                    <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
                                        {[
                                            { icon: Clock,    text: `${systemStats.pending_requests || 0} pending`,       cls: "text-yellow-700 bg-yellow-50 border-yellow-200" },
                                            { icon: FileText, text: `${systemStats.total_requests || 0} total applications`, cls: "text-blue-700 bg-blue-50 border-blue-200" },
                                            { icon: Users,    text: `${systemStats.total_users || 0} users`,               cls: "text-[#0d1f5c] bg-[#0d1f5c]/5 border-[#0d1f5c]/15" },
                                        ].map((f, i) => (
                                            <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${f.cls}`}>
                                                <f.icon className="w-3.5 h-3.5"/>
                                                {f.text}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="pt-2">
                                        <Button onClick={handleToggle} disabled={isTransitioning}
                                            className="gap-2 bg-[#0d1f5c] hover:bg-[#0d1f5c]/90 text-white rounded-xl">
                                            <BarChart3 className="h-4 w-4"/>
                                            Show Analytics
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
