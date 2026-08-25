import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { FileText, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { FunnelChart, RadarChart } from './Charts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * DocumentsTab Component
 * Displays document and application completion analytics
 */
export function DocumentsTab({ 
    statusBreakdown = [],
    projectTypes = [],
    projectNatures = [],
    avgDocumentsPerRequest = 0,
    completionRate = 0,
    approvalRate = 0
}) {
    const COLORS = ['#0d1f5c', '#2563eb', '#10b981', '#f59e0b', '#ef4444'];

    // Prepare funnel data for application process
    const totalApplications = statusBreakdown.reduce((sum, item) => sum + item.count, 0);
    const approvedCount = statusBreakdown.find(s => s.evaluation === 'approved')?.count || 0;
    const rejectedCount = statusBreakdown.find(s => s.evaluation === 'rejected')?.count || 0;
    const pendingCount = statusBreakdown.find(s => s.evaluation === 'pending')?.count || 0;

    const funnelData = [
        { name: 'Total Submissions', value: totalApplications, description: 'All applications submitted' },
        { name: 'Under Review', value: pendingCount + approvedCount + rejectedCount, description: 'Being processed' },
        { name: 'Completed Review', value: approvedCount + rejectedCount, description: 'Review finished' },
        { name: 'Approved', value: approvedCount, description: 'Successfully approved' },
    ];

    // Prepare radar chart data for project types
    const radarData = projectTypes.slice(0, 6).map(item => ({
        category: item.project_type || 'Unknown',
        Count: item.count,
        'Avg Cost (₱M)': (parseFloat(item.avg_cost) / 1000000) || 0,
    }));

    const radarKeys = [
        { key: 'Count', name: 'Applications' },
        { key: 'Avg Cost (₱M)', name: 'Avg Cost (₱M)' },
    ];

    // Prepare pie chart for project natures
    const natureData = projectNatures.map(item => ({
        name: item.project_nature || 'Unknown',
        value: item.count,
    }));

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        if (percent < 0.05) return null;

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                                <p className="text-3xl font-bold text-blue-600">{completionRate}%</p>
                                <p className="text-xs text-gray-400 mt-1">Applications with reports</p>
                            </div>
                            <CheckCircle className="h-12 w-12 text-blue-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Approval Rate</p>
                                <p className="text-3xl font-bold text-green-600">{approvalRate}%</p>
                                <p className="text-xs text-gray-400 mt-1">Of reviewed applications</p>
                            </div>
                            <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Avg Documents</p>
                                <p className="text-3xl font-bold text-purple-600">{avgDocumentsPerRequest}</p>
                                <p className="text-xs text-gray-400 mt-1">Per application</p>
                            </div>
                            <FileText className="h-12 w-12 text-purple-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Application Process Funnel */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Application Process Flow
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Conversion rates through the application process
                    </p>
                </CardHeader>
                <CardContent>
                    {funnelData.length > 0 ? (
                        <FunnelChart data={funnelData} height={450} />
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            No funnel data available
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {/* Project Type Analysis - Radar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Project Type Analysis
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            Multi-dimensional view of project types
                        </p>
                    </CardHeader>
                    <CardContent>
                        {radarData.length > 0 ? (
                            <RadarChart 
                                data={radarData}
                                dataKeys={radarKeys}
                                height={350}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No project type data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Project Nature Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600" />
                            Project Nature Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {natureData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={natureData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {natureData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No nature data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
