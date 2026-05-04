import React from "react";
import { Button } from "@/Components/ui/button";
import { FileText, Eye, Activity } from "lucide-react";

export function DashboardHeader({ showStatistics, onToggleStatistics }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        My Applications
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Track and manage your land certification requests
                    </p>
                </div>
            </div>

            {/* Toggle Statistics Button */}
            <div>
                <Button
                    onClick={onToggleStatistics}
                    variant="outline"
                    className="gap-2 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    {showStatistics ? (
                        <>
                            <Eye className="h-4 w-4" />
                            Hide Statistics
                        </>
                    ) : (
                        <>
                            <Activity className="h-4 w-4" />
                            Show Statistics
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
