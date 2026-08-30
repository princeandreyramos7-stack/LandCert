import React, { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Users, CheckCircle, XCircle, Clock, TrendingUp, Award, Activity, Search, ArrowRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { HeatMap } from '@/Components/Admin/Analytics/Charts';

// Colour the action chip by verb so scanning the log is fast.
const actionBadgeClass = (action = '') => {
    const a = String(action).toLowerCase();
    if (a.includes('create') || a.includes('approve') || a.includes('verify') || a.includes('login')) return 'bg-green-100 text-green-700 border-green-300';
    if (a.includes('delete') || a.includes('reject') || a.includes('fail')) return 'bg-red-100 text-red-700 border-red-300';
    if (a.includes('update') || a.includes('edit')) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (a.includes('export') || a.includes('view')) return 'bg-amber-100 text-amber-700 border-amber-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
};

/**
 * AdminWorkflowTab Component
 * Displays admin activity, performance, and workflow metrics for Super Admin
 */
export function AdminWorkflowTab({ adminActivity = {} }) {
    const {
        admin_performance = [],
        recent_actions = [],
        recent_actions_total = 0,
        activity_by_hour = [],
        activity_by_day = [],
        review_trend = [],
        certificates_by_admin = [],
        response_metrics = {},
    } = adminActivity;

    // Client-side search over the loaded slice — never navigates away from the tab.
    const [auditSearch, setAuditSearch] = useState('');
    const filteredActions = useMemo(() => {
        const q = auditSearch.trim().toLowerCase();
        if (!q) return recent_actions;
        return recent_actions.filter((a) =>
            [a.admin_name, a.admin_email, a.action, a.model_type, a.reference, a.description, a.ip_address]
                .filter(Boolean)
                .some((f) => String(f).toLowerCase().includes(q))
        );
    }, [auditSearch, recent_actions]);

    const COLORS = ['#0d1f5c', '#2563eb', '#10b981', '#f59e0b', '#ef4444'];

    // Prepare review trend data for composed chart
    const reviewTrendData = review_trend.map(item => ({
        month: item.month,
        Approved: item.approved || 0,
        Denied: item.rejected || 0,
        Pending: item.pending || 0,
    }));

    // Prepare admin performance for bar chart
    const adminPerfChartData = admin_performance.slice(0, 10).map(admin => ({
        name: admin.admin_name?.split(' ')[0] || 'Unknown',
        Reviews: admin.total_reviews,
        'Approval %': admin.approval_rate,
    }));

    // Prepare heatmap data for admin activity
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const heatMapData = daysOfWeek.map((day, dayIdx) => {
        return hours.map(hour => {
            const hourData = activity_by_hour.find(h => h.hour === hour);
            const dayData = activity_by_day.find(d => d.day === dayIdx + 1);
            return hourData && dayData ? Math.round((hourData.count + dayData.count) / 5) : 0;
        });
    });

    const maxHeatValue = Math.max(...heatMapData.flat());

    // Response time metrics cards
    const responseCards = [
        {
            title: 'Fastest Review',
            value: `${response_metrics.fastest_review || 0} days`,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Average Review',
            value: `${parseFloat(response_metrics.avg_review || 0).toFixed(1)} days`,
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Slowest Review',
            value: `${response_metrics.slowest_review || 0} days`,
            icon: Activity,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Admin Audit Log — Zoning Officer actions across the system */}
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Admin Audit Log
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Every action performed by the Zoning Officer
                                {recent_actions_total > 0 && (
                                    <> — showing the latest {recent_actions.length.toLocaleString()} of {recent_actions_total.toLocaleString()}</>
                                )}
                            </p>
                        </div>
                        <Link
                            href={route('super-admin.audit-logs')}
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            View complete audit log
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={auditSearch}
                            onChange={(e) => setAuditSearch(e.target.value)}
                            placeholder="Filter by officer, action, record or IP…"
                            className="pl-9"
                        />
                    </div>

                    <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                        {recent_actions.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">No Zoning Officer actions recorded yet</p>
                        ) : filteredActions.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">No actions match “{auditSearch}”</p>
                        ) : (
                            filteredActions.map((action) => (
                                <div key={action.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex-shrink-0">
                                        {(action.admin_name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium text-sm">{action.admin_name}</p>
                                            <Badge variant="outline" className={`text-xs ${actionBadgeClass(action.action)}`}>
                                                {action.action}
                                            </Badge>
                                            {(action.reference || action.model_type) && (
                                                <span className="text-xs text-gray-500">
                                                    {action.reference
                                                        || `${action.model_type}${action.model_id ? ` #${action.model_id}` : ''}`}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1 break-words">{action.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(action.created_at).toLocaleString()}
                                            {action.ip_address ? ` · ${action.ip_address}` : ''}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Response Time Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                {responseCards.map((card, index) => (
                    <Card key={index}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                    <p className="text-3xl font-bold mt-2">{card.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                                    <card.icon className={`h-8 w-8 ${card.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Admin Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Admin Performance Metrics
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Review statistics and approval rates by admin
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Admin</th>
                                    <th className="text-center p-3 text-sm font-semibold text-gray-700">Total Reviews</th>
                                    <th className="text-center p-3 text-sm font-semibold text-gray-700">Approved</th>
                                    <th className="text-center p-3 text-sm font-semibold text-gray-700">Denied</th>
                                    <th className="text-center p-3 text-sm font-semibold text-gray-700">Pending</th>
                                    <th className="text-center p-3 text-sm font-semibold text-gray-700">Avg Time</th>
                                    <th className="text-center p-3 text-sm font-semibold text-gray-700">Approval Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admin_performance.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8 text-gray-500">
                                            No admin performance data available
                                        </td>
                                    </tr>
                                ) : (
                                    admin_performance.map((admin, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium text-sm">{admin.admin_name}</p>
                                                    <p className="text-xs text-gray-500">{admin.admin_email}</p>
                                                </div>
                                            </td>
                                            <td className="text-center p-3">
                                                <Badge variant="outline">{admin.total_reviews}</Badge>
                                            </td>
                                            <td className="text-center p-3">
                                                <Badge className="bg-green-100 text-green-700 border-green-300">
                                                    {admin.approved}
                                                </Badge>
                                            </td>
                                            <td className="text-center p-3">
                                                <Badge className="bg-red-100 text-red-700 border-red-300">
                                                    {admin.rejected}
                                                </Badge>
                                            </td>
                                            <td className="text-center p-3">
                                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                                    {admin.pending}
                                                </Badge>
                                            </td>
                                            <td className="text-center p-3 text-sm">
                                                {admin.avg_review_time} days
                                            </td>
                                            <td className="text-center p-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full"
                                                            style={{ width: `${admin.approval_rate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">{admin.approval_rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Admin Performance Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-blue-600" />
                            Admin Review Volume & Approval Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {adminPerfChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={adminPerfChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '8px' 
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="Reviews" fill="#0d1f5c" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Approval %" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No performance data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Review Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Review Trend (Last 6 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {reviewTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={reviewTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '8px' 
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="Approved" stroke="#10b981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Denied" stroke="#ef4444" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Pending" stroke="#f59e0b" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No trend data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Admin Activity Heatmap */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Admin Activity Pattern
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Admin actions intensity by day and hour
                    </p>
                </CardHeader>
                <CardContent>
                    <HeatMap 
                        data={heatMapData}
                        maxValue={maxHeatValue}
                        labels={{
                            x: ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', 
                                '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'],
                            y: daysOfWeek
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
