import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { BarChart3, Sparkles } from "lucide-react";

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
        <div
            className="space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
            style={{
                backgroundImage: `
             radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
           `,
            }}
        >
            {/* Toggle Analytics View */}
            <div className="flex justify-between items-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 animate-in slide-in-from-top duration-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        Dashboard Overview
                    </h2>
                </div>
                <Button
                    variant="outline"
                    onClick={handleToggle}
                    disabled={isTransitioning}
                    className="gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg rounded-xl"
                >
                    <BarChart3
                        className={`h-4 w-4 transition-transform duration-300 ${
                            isTransitioning ? "rotate-180" : ""
                        }`}
                    />
                    <span className="font-medium">
                        {showAnalytics ? "Hide" : "Show"} Analytics
                    </span>
                </Button>
            </div>

            {/* Analytics Section */}
            {showAnalytics && analytics && (
                <div className="animate-in fade-in slide-in-from-bottom duration-500">
                    <AnalyticsDashboard analytics={analytics} />
                </div>
            )}

            {/* CDRRMO Logo Display - Always show when analytics is disabled */}
            {!showAnalytics && (
                <div
                    className={`transition-all duration-500 ${
                        isTransitioning
                            ? "opacity-0 scale-95"
                            : "opacity-100 scale-100"
                    }`}
                >
                    <Card className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-700">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center min-h-[450px] space-y-8">
                                <div className="relative group">
                                    {/* Animated background rings */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 opacity-20 animate-pulse"></div>
                                    <div className="absolute inset-2 rounded-full bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-600 opacity-30 animate-pulse delay-75"></div>
                                    <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600 opacity-40 animate-pulse delay-150"></div>

                                    {/* Logo container */}
                                    <div className="relative w-80 h-80 mx-auto group-hover:scale-110 transition-transform duration-700 ease-out">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 rounded-full shadow-2xl backdrop-blur-sm"></div>
                                        <div className="absolute inset-4 rounded-full overflow-hidden shadow-xl">
                                            <img
                                                src="/images/ilagan.png"
                                                alt="CDRRMO Logo"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Floating particles */}
                                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-300"></div>
                                        <div className="absolute top-1/4 -right-6 w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-500"></div>
                                        <div className="absolute bottom-1/3 -left-6 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-700"></div>
                                    </div>
                                </div>

                                {/* Animated gradient line */}
                                <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full animate-pulse"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
