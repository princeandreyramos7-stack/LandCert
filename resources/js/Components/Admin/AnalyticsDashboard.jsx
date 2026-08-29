import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
    TrendingUp,
    DollarSign,
    Award,
    Activity,
    ArrowUp,
    Users,
    Clock,
    BarChart3
} from 'lucide-react';
import {
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    ComposedChart
} from 'recharts';

export function AnalyticsDashboard({ analytics }) {
    if (!analytics) return null;

    const {
        monthly_submissions = [],
        monthly_revenue = [],
        payment_stats = {},
        payment_methods = [],
        certificate_stats = {},
        status_breakdown = [],
        avg_processing_time = 0,
        project_types = [],
        top_users = []
    } = analytics;

    // Format monthly data for chart
    const monthlyChartData = monthly_submissions.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        submissions: item.count
    }));

    // Format monthly revenue data
    const revenueChartData = monthly_revenue.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue: parseFloat(item.revenue || 0),
        count: item.count
    }));

    // Payment methods data
    const paymentMethodData = payment_methods.map(item => ({
        name: item.payment_method.replace('_', ' ').toUpperCase(),
        value: item.count
    }));

    // Status breakdown data
    const statusData = status_breakdown.map(item => ({
        name: item.evaluation.charAt(0).toUpperCase() + item.evaluation.slice(1),
        value: item.count
    }));

    // Project types for pie chart
    const projectTypeData = project_types.map(item => ({
        name: item.project_type || 'Other',
        value: item.count
    }));

    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount || 0);
    };

    return (
        <div className="space-y-6">
            {/* Enhanced Stats Cards Row 1 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">
                            {formatCurrency(payment_stats.total_revenue)}
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
                            {payment_stats.pending_payments || 0}
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
                            {certificate_stats.total_issued || 0}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                            <ArrowUp className="h-3 w-3 text-green-600" />
                            {certificate_stats.issued_this_month || 0} this month
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
                            {certificate_stats.total_issued > 0
                                ? Math.round((certificate_stats.collected / certificate_stats.total_issued) * 100)
                                : 0}%
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            {certificate_stats.collected || 0} collected
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

            {/* Tabbed Analytics Section */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Monthly Submissions Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Submissions Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={monthlyChartData}>
                                        <defs>
                                            <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="submissions"
                                            stroke="#8b5cf6"
                                            fillOpacity={1}
                                            fill="url(#colorSubmissions)"
                                            name="Submissions"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Status Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Application Status Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {statusData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Project Types Distribution */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Project Types Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={projectTypeData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#8b5cf6" name="Count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="space-y-4">
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
                                            {paymentMethodData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-4">
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
                                <CardTitle className="text-base">Efficiency Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs">Approval Rate</span>
                                        <span className="text-xs font-medium">
                                            {statusData.length > 0
                                                ? Math.round((statusData.find(s => s.name === 'Approved')?.value || 0) / statusData.reduce((sum, s) => sum + s.value, 0) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${statusData.length > 0 ? Math.round((statusData.find(s => s.name === 'Approved')?.value || 0) / statusData.reduce((sum, s) => sum + s.value, 0) * 100) : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs">Payment Verification</span>
                                        <span className="text-xs font-medium">
                                            {payment_stats.verified_payments + payment_stats.pending_payments > 0
                                                ? Math.round((payment_stats.verified_payments / (payment_stats.verified_payments + payment_stats.pending_payments)) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${payment_stats.verified_payments + payment_stats.pending_payments > 0 ? Math.round((payment_stats.verified_payments / (payment_stats.verified_payments + payment_stats.pending_payments)) * 100) : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Users by Submissions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {top_users.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                                    ) : (
                                        top_users.map((user, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-purple-700 border-purple-300">
                                                    {user.count} submissions
                                                </Badge>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>User Activity Insights</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <span className="font-semibold text-blue-900">Active Users</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700">{top_users.length}</p>
                                    <p className="text-xs text-blue-600 mt-1">Users with submissions</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                        <span className="font-semibold text-purple-900">Avg per User</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-700">
                                        {top_users.length > 0
                                            ? (top_users.reduce((sum, u) => sum + u.count, 0) / top_users.length).toFixed(1)
                                            : 0}
                                    </p>
                                    <p className="text-xs text-purple-600 mt-1">Submissions per user</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
