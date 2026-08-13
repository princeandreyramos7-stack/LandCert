import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    TrendingUp,
    DollarSign,
    Award,
    Activity,
    ArrowUp,
    Clock,
} from 'lucide-react';
import { formatCurrency, calculateCollectionRate } from './utils';

export function StatsCards({ payment_stats = {}, certificate_stats = {}, avg_processing_time = 0 }) {
    const totalRevenue      = payment_stats?.total_revenue ?? 0;
    const pendingPayments   = payment_stats?.pending_payments ?? 0;
    const totalIssued       = certificate_stats?.total_issued ?? 0;
    const issuedThisMonth   = certificate_stats?.issued_this_month ?? 0;
    const collected         = certificate_stats?.collected ?? 0;
    const collectionRate    = calculateCollectionRate(certificate_stats);
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-700">
                        {formatCurrency(totalRevenue)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                        From verified payments
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    <Activity className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-700">
                        {pendingPayments}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                        Awaiting verification
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
                    <Award className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-700">
                        {totalIssued}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <ArrowUp className="h-3 w-3 text-green-600" />
                        {issuedThisMonth} this month
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-700">
                        {collectionRate}%
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                        {collected} collected
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
                    <Clock className="h-5 w-5 text-indigo-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-indigo-700">
                        {avg_processing_time} days
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                        Submission to approval
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
