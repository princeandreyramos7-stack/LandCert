import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { calculateApprovalRate, calculateVerificationRate } from './utils';

export function PerformanceTab({ avg_processing_time, certificate_stats, statusData, payment_stats }) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Processing Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-700 mb-2">
                            {avg_processing_time}
                        </div>
                        <p className="text-sm text-gray-600">Average days</p>
                        <p className="text-xs text-gray-500 mt-2">From submission to approval</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Certificate Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm">Total Issued</span>
                        <Badge>{certificate_stats.total_issued}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm">Sent</span>
                        <Badge variant="outline">{certificate_stats.sent}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm">Collected</span>
                        <Badge variant="outline">{certificate_stats.collected}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm">This Month</span>
                        <Badge variant="outline">{certificate_stats.issued_this_month}</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Efficiency Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-xs">Approval Rate</span>
                            <span className="text-xs font-medium">
                                {calculateApprovalRate(statusData)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${calculateApprovalRate(statusData)}%` }}
                            ></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-xs">Payment Verification</span>
                            <span className="text-xs font-medium">
                                {calculateVerificationRate(payment_stats)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${calculateVerificationRate(payment_stats)}%` }}
                            ></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
