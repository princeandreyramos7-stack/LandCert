import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { StatsCards } from './StatsCards';
import { OverviewTab } from './OverviewTab';
import { PerformanceTab } from './PerformanceTab';
import { UsersTab } from './UsersTab';
import { GeographicTab } from './GeographicTab';
import { TrendsTab } from './TrendsTab';
import { DocumentsTab } from './DocumentsTab';
import {
    formatMonthlyData,
    formatStatusData,
    formatProjectTypeData,
} from './utils';

export function AnalyticsDashboard({ analytics }) {
    if (!analytics) return null;

    const {
        monthly_submissions = [],
        daily_submissions = [],
        hourly_pattern = [],
        day_of_week_pattern = [],
        status_breakdown = [],
        processing_time_by_status = [],
        processing_time_trend = [],
        certificate_stats = {},
        project_types = [],
        project_natures = [],
        barangay_distribution = [],
        top_users = [],
        user_activity_metrics = {},
        weekly_activity = [],
        avg_documents_per_request = 0,
        completion_rate = 0,
        approval_rate = 0,
    } = analytics;

    // Format data for charts
    const monthlyChartData = formatMonthlyData(monthly_submissions);
    const statusData = formatStatusData(status_breakdown);
    const projectTypeData = formatProjectTypeData(project_types);

    return (
        <div className="space-y-6">
            <StatsCards
                certificate_stats={certificate_stats}
                completion_rate={completion_rate}
                approval_rate={approval_rate}
                avg_documents={avg_documents_per_request}
                user_activity_metrics={user_activity_metrics}
                processing_time_by_status={processing_time_by_status}
            />

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto sm:grid sm:h-10 sm:grid-cols-6">
                    <TabsTrigger value="overview" className="shrink-0">Overview</TabsTrigger>
                    <TabsTrigger value="trends" className="shrink-0">Trends</TabsTrigger>
                    <TabsTrigger value="geographic" className="shrink-0">Geographic</TabsTrigger>
                    <TabsTrigger value="documents" className="shrink-0">Documents</TabsTrigger>
                    <TabsTrigger value="performance" className="shrink-0">Performance</TabsTrigger>
                    <TabsTrigger value="users" className="shrink-0">Users</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <OverviewTab
                        monthlyChartData={monthlyChartData}
                        statusData={statusData}
                        projectTypeData={projectTypeData}
                    />
                </TabsContent>

                <TabsContent value="trends" className="space-y-4">
                    <TrendsTab
                        monthlySubmissions={monthly_submissions}
                        dailySubmissions={daily_submissions}
                        weeklyActivity={weekly_activity}
                        processingTimeTrend={processing_time_trend}
                        hourlyPattern={hourly_pattern}
                        dayOfWeekPattern={day_of_week_pattern}
                    />
                </TabsContent>

                <TabsContent value="geographic" className="space-y-4">
                    <GeographicTab
                        barangayDistribution={barangay_distribution}
                    />
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                    <DocumentsTab
                        statusBreakdown={status_breakdown}
                        projectTypes={project_types}
                        projectNatures={project_natures}
                        avgDocumentsPerRequest={avg_documents_per_request}
                        completionRate={completion_rate}
                        approvalRate={approval_rate}
                    />
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <PerformanceTab
                        processing_time_by_status={processing_time_by_status}
                        certificate_stats={certificate_stats}
                        statusData={statusData}
                    />
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <UsersTab 
                        top_users={top_users} 
                        user_activity_metrics={user_activity_metrics}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
