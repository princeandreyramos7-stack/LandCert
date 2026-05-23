import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Sparkles, Shield, TrendingUp } from "lucide-react";

import { AnalyticsDashboard } from "@/Components/Admin/Analytics";

export function SuperAdminDashboard({ analytics = null, systemStats = {} }) {
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
        <div
            className="space-y-6 min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50"
            style={{
                backgroundImage: `
             radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
           `,
            }}
        >
            {/* Enhanced Header with Pure Blue Background */}
            <div className="flex justify-between items-center p-6 bg-blue-600 rounded-2xl shadow-2xl border border-blue-700 animate-in slide-in-from-top duration-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                            Super Admin Dashboard
                            <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                        </h2>
                        <p className="text-blue-100 text-sm">Advanced analytics and system monitoring</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={handleToggle}
                    disabled={isTransitioning}
                    className="gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm border-2 border-white/50 hover:border-white hover:bg-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-xl text-gray-900 font-semibold"
                >
                    <BarChart3
                        className={`h-5 w-5 transition-transform duration-300 ${
                            isTransitioning ? "rotate-180" : ""
                        }`}
                    />
                    <span>
                        {showAnalytics ? "Hide" : "Show"} Analytics
                    </span>
                </Button>
            </div>

            {/* System Overview Cards - Always Visible */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom duration-500">
                <Card className="border-l-4 border-l-purple-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-700">{systemStats.total_users || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {systemStats.total_applicants || 0} applicants • {systemStats.total_admins || 0} admins
                        </p>
                        <div className="mt-2 h-1 bg-purple-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-indigo-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-700">{systemStats.total_admins || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            System administrators
                        </p>
                        <div className="mt-2 h-1 bg-indigo-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700">{systemStats.total_requests || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All time submissions
                        </p>
                        <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-700">{systemStats.pending_requests || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting action
                        </p>
                        <div className="mt-2 h-1 bg-amber-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse" style={{ width: '45%' }}></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Section */}
            {showAnalytics && analytics && (
                <div className="animate-in fade-in slide-in-from-bottom duration-500">
                    <AnalyticsDashboard analytics={analytics} />
                </div>
            )}

            {/* Enhanced Logo Display - When analytics is hidden */}
            {!showAnalytics && (
                <div
                    className={`transition-all duration-500 ${
                        isTransitioning
                            ? "opacity-0 scale-95"
                            : "opacity-100 scale-100"
                    }`}
                >
                    <Card className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-700">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center min-h-[450px] space-y-8">
                                <div className="relative group">
                                    {/* Animated background rings with purple theme */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600 opacity-20 animate-pulse"></div>
                                    <div className="absolute inset-2 rounded-full bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-600 opacity-30 animate-pulse delay-75"></div>
                                    <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 opacity-40 animate-pulse delay-150"></div>

                                    {/* Logo container */}
                                    <div className="relative w-80 h-80 mx-auto group-hover:scale-110 transition-transform duration-700 ease-out">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 rounded-full shadow-2xl backdrop-blur-sm"></div>
                                        <div className="absolute inset-4 rounded-full overflow-hidden shadow-xl">
                                            <img
                                                src="/images/ilagan.png"
                                                alt="CPDO Logo"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Floating particles with purple theme */}
                                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
                                        <div className="absolute top-1/4 -right-6 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-500"></div>
                                        <div className="absolute bottom-1/3 -left-6 w-2 h-2 bg-purple-300 rounded-full animate-bounce delay-700"></div>
                                    </div>
                                </div>

                                {/* Animated gradient line with purple theme */}
                                <div className="w-32 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full animate-pulse"></div>
                                
                                {/* Super Admin Badge */}
                                <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg">
                                    <Shield className="h-5 w-5 text-white" />
                                    <span className="text-white font-semibold">Super Administrator</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
