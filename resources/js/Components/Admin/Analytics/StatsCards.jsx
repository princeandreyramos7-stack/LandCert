import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { FileText, CheckCircle, TrendingUp, Award, Clock, Users, Activity } from 'lucide-react';

export function StatsCards({ 
    certificate_stats = {}, 
    completion_rate = 0, 
    approval_rate = 0, 
    avg_documents = 0,
    user_activity_metrics = {},
    processing_time_by_status = []
}) {
    // Calculate average processing time across all statuses
    const avgProcessingTime = processing_time_by_status.length > 0
        ? (processing_time_by_status.reduce((sum, item) => sum + parseFloat(item.avg_days || 0), 0) / processing_time_by_status.length).toFixed(1)
        : 0;

    const stats = [
        {
            title: 'For Verification',
            value: (certificate_stats?.total_issued || 0) + ((user_activity_metrics?.total_active_users || 0) * 2),
            description: 'Pending document check',
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Verified Applications',
            value: `${approval_rate || 0}%`,
            description: 'Documents verified',
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Forwarded to Review',
            value: certificate_stats?.total_issued || 0,
            description: `${certificate_stats?.issued_this_month || 0} this month`,
            icon: Award,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Avg Verification Time',
            value: `${avgProcessingTime} days`,
            description: 'Per application',
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Active Applicants',
            value: user_activity_metrics?.active_users_this_month || 0,
            description: `${user_activity_metrics?.new_users_this_month || 0} new this month`,
            icon: Users,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
        },
        {
            title: 'Avg Documents',
            value: avg_documents || 0,
            description: 'Per application',
            icon: Activity,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
