import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { TrendingUp, Award, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function PerformanceTab({ processing_time_by_status = [], certificate_stats = {}, statusData = [] }) {
    const COLORS = ['#0d1f5c', '#2563eb', '#10b981', '#f59e0b', '#ef4444'];

    // Calculate average processing time across all statuses
    const avgProcessingTime = processing_time_by_status.length > 0
        ? (processing_time_by_status.reduce((sum, item) => sum + parseFloat(item.avg_days || 0), 0) / processing_time_by_status.length).toFixed(1)
        : 0;

    // Get approved processing time specifically
    const approvedProcessing = processing_time_by_status.find(item => item.evaluation === 'approved');

    const certificateStatusData = [
        { name: 'Preparing', value: certificate_stats?.preparing || 0 },
        { name: 'Ready', value: certificate_stats?.ready_for_pickup || 0 },
        { name: 'Collected', value: certificate_stats?.collected || 0 },
    ].filter(item => item.value > 0);

    // Prepare processing time comparison data
    const processingTimeData = processing_time_by_status.map(item => ({
        status: item.evaluation?.charAt(0).toUpperCase() + item.evaluation?.slice(1) || 'Unknown',
        'Avg Days': parseFloat(item.avg_days || 0),
        'Min Days': parseFloat(item.min_days || 0),
        'Max Days': parseFloat(item.max_days || 0),
    }));

    const performanceMetrics = [
        {
            title: 'Avg Processing Time',
            value: `${avgProcessingTime} days`,
            description: 'All applications',
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Approved Processing',
            value: `${approvedProcessing?.avg_days || 0} days`,
            description: `${approvedProcessing?.min_days || 0}-${approvedProcessing?.max_days || 0} days range`,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Certificates Issued',
            value: certificate_stats?.total_issued || 0,
            description: `${certificate_stats?.issued_this_month || 0} this month`,
            icon: Award,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Ready for Pickup',
            value: certificate_stats?.ready_for_pickup || 0,
            description: 'Awaiting collection',
            icon: AlertCircle,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Performance Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {performanceMetrics.map((metric, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {metric.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Processing Time by Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Processing Time by Status
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Average, minimum, and maximum processing days
                    </p>
                </CardHeader>
                <CardContent>
                    {processingTimeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={processingTimeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="status" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '8px' 
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="Min Days" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Avg Days" fill="#0d1f5c" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Max Days" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            No processing time data available
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Application Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Application Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No status data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Certificate Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Certificate Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {certificateStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={certificateStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {certificateStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No certificate data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
