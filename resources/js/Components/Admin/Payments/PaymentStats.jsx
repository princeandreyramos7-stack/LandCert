import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { DollarSign, Clock, CheckCircle2, XCircle } from "lucide-react";

export function PaymentStats({ stats, onFilterChange }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card
                className="cursor-pointer bg-purple-50 border-0"
                onClick={() => onFilterChange("all")}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-purple-700 font-medium mb-1">
                                Total Payments
                            </p>
                            <p className="text-2xl font-bold text-purple-900">
                                {stats.total}
                            </p>
                            <p className="text-xs text-purple-600 mt-0.5">
                                All submissions
                            </p>
                        </div>
                        <div className="p-2 bg-purple-500 rounded-lg">
                            <DollarSign className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card
                className="cursor-pointer bg-yellow-50 border-0"
                onClick={() => onFilterChange("pending")}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-yellow-700 font-medium mb-1">
                                Pending
                            </p>
                            <p className="text-2xl font-bold text-yellow-900">
                                {stats.pending}
                            </p>
                            <p className="text-xs text-yellow-600 mt-0.5">
                                Awaiting verification
                            </p>
                        </div>
                        <div className="p-2 bg-yellow-500 rounded-lg">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card
                className="cursor-pointer bg-green-50 border-0"
                onClick={() => onFilterChange("verified")}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-green-700 font-medium mb-1">
                                Verified
                            </p>
                            <p className="text-2xl font-bold text-green-900">
                                {stats.verified}
                            </p>
                            <p className="text-xs text-green-600 mt-0.5">
                                Successfully processed
                            </p>
                        </div>
                        <div className="p-2 bg-green-500 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card
                className="cursor-pointer bg-red-50 border-0"
                onClick={() => onFilterChange("rejected")}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-red-700 font-medium mb-1">
                                Rejected
                            </p>
                            <p className="text-2xl font-bold text-red-900">
                                {stats.rejected}
                            </p>
                            <p className="text-xs text-red-600 mt-0.5">
                                Needs attention
                            </p>
                        </div>
                        <div className="p-2 bg-red-500 rounded-lg">
                            <XCircle className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
