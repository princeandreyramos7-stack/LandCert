import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Award,
    TrendingUp,
} from "lucide-react";

export function DashboardStats({ stats, onFilterChange }) {
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 w-full">
            <Card
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
                onClick={() => onFilterChange("all")}
            >
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700 mb-1">
                                Total
                            </p>
                            <p className="text-3xl font-bold text-blue-900">
                                {stats.total}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                All requests
                            </p>
                        </div>
                        <div className="p-3 bg-blue-200 rounded-full group-hover:bg-blue-300 transition-colors">
                            <FileText className="h-6 w-6 text-blue-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-0 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200"
                onClick={() => onFilterChange("pending")}
            >
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-700 mb-1">
                                Pending
                            </p>
                            <p className="text-3xl font-bold text-amber-900">
                                {stats.pending}
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                                Under review
                            </p>
                        </div>
                        <div className="p-3 bg-amber-200 rounded-full group-hover:bg-amber-300 transition-colors">
                            <Clock className="h-6 w-6 text-amber-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200"
                onClick={() => onFilterChange("approved")}
            >
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-700 mb-1">
                                Approved
                            </p>
                            <p className="text-3xl font-bold text-emerald-900">
                                {stats.approved}
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">
                                Completed
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-200 rounded-full group-hover:bg-emerald-300 transition-colors">
                            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-0 bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200"
                onClick={() => onFilterChange("rejected")}
            >
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-rose-700 mb-1">
                                Rejected
                            </p>
                            <p className="text-3xl font-bold text-rose-900">
                                {stats.rejected}
                            </p>
                            <p className="text-xs text-rose-600 mt-1">
                                Need action
                            </p>
                        </div>
                        <div className="p-3 bg-rose-200 rounded-full group-hover:bg-rose-300 transition-colors">
                            <XCircle className="h-6 w-6 text-rose-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-700 mb-1">
                                Certificates
                            </p>
                            <p className="text-3xl font-bold text-purple-900">
                                {stats.withCertificates}
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                                Ready
                            </p>
                        </div>
                        <div className="p-3 bg-purple-200 rounded-full group-hover:bg-purple-300 transition-colors">
                            <Award className="h-6 w-6 text-purple-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-indigo-700 mb-1">
                                Recent
                            </p>
                            <p className="text-3xl font-bold text-indigo-900">
                                {stats.recentRequests}
                            </p>
                            <p className="text-xs text-indigo-600 mt-1">
                                Last 30 days
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-200 rounded-full group-hover:bg-indigo-300 transition-colors">
                            <TrendingUp className="h-6 w-6 text-indigo-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
