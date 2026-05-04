import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    ComposedChart,
    Bar,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency, CHART_COLORS } from './utils';

export function PaymentsTab({ revenueChartData, paymentMethodData, payment_stats }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Monthly Revenue Trend */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Monthly Revenue & Payment Count</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip formatter={(value, name) => {
                                if (name === 'Revenue') return formatCurrency(value);
                                return value;
                            }} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue" />
                            <Line yAxisId="right" type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Payment Count" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={paymentMethodData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {paymentMethodData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Payment Stats Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">Total Revenue</span>
                        <span className="text-lg font-bold text-green-700">
                            {formatCurrency(payment_stats.total_revenue)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">Average Payment</span>
                        <span className="text-lg font-bold text-blue-700">
                            {formatCurrency(payment_stats.average_payment)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                        <span className="text-sm font-medium">Pending</span>
                        <Badge variant="outline" className="text-amber-700 border-amber-300">
                            {payment_stats.pending_payments}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                        <span className="text-sm font-medium">Verified</span>
                        <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                            {payment_stats.verified_payments}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
                        <span className="text-sm font-medium">Rejected</span>
                        <Badge variant="outline" className="text-rose-700 border-rose-300">
                            {payment_stats.rejected_payments}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
