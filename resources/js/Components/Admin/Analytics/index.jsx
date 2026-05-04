import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { StatsCards } from './StatsCards';
import { OverviewTab } from './OverviewTab';
import { PaymentsTab } from './PaymentsTab';
import { PerformanceTab } from './PerformanceTab';
import { UsersTab } from './UsersTab';
import {
    formatMonthlyData,
    formatRevenueData,
    formatPaymentMethodData,
    formatStatusData,
    formatProjectTypeData,
} from './utils';

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
        top_users = [],
    } = analytics;

    // Format data for charts
    const monthlyChartData = formatMonthlyData(monthly_submissions);
    const revenueChartData = formatRevenueData(monthly_revenue);
    const paymentMethodData = formatPaymentMethodData(payment_methods);
    const statusData = formatStatusData(status_breakdown);
    const projectTypeData = formatProjectTypeData(project_types);

    return (
        <div className="space-y-6">
            <StatsCards
                payment_stats={payment_stats}
                certificate_stats={certificate_stats}
                avg_processing_time={avg_processing_time}
            />

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <OverviewTab
                        monthlyChartData={monthlyChartData}
                        statusData={statusData}
                        projectTypeData={projectTypeData}
                    />
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <PaymentsTab
                        revenueChartData={revenueChartData}
                        paymentMethodData={paymentMethodData}
                        payment_stats={payment_stats}
                    />
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <PerformanceTab
                        avg_processing_time={avg_processing_time}
                        certificate_stats={certificate_stats}
                        statusData={statusData}
                        payment_stats={payment_stats}
                    />
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <UsersTab top_users={top_users} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
