import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export function OverviewTab({ monthlyChartData, applicationStatusData = [], projectTypeData }) {
    // Only statuses that actually have applications get a slice; the legend below
    // still names every status, so an empty one reads as "none right now" rather
    // than going missing.
    const slices = applicationStatusData.filter((entry) => entry.value > 0);
    const total = applicationStatusData.reduce((sum, entry) => sum + entry.value, 0);

    return (
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
                    <p className="text-sm text-gray-500 mt-1">
                        {total.toLocaleString()} application{total === 1 ? '' : 's'} across every stage
                    </p>
                </CardHeader>
                <CardContent>
                    {slices.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={slices}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ percent }) => (percent >= 0.05 ? `${(percent * 100).toFixed(0)}%` : '')}
                                        outerRadius={85}
                                        innerRadius={45}
                                        dataKey="value"
                                    >
                                        {slices.map((entry) => (
                                            <Cell key={entry.key} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${value} application${value === 1 ? '' : 's'}`, name]} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* The full status list, so a stage sitting at zero is
                                visibly zero instead of simply absent. */}
                            <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                                {applicationStatusData.map((entry) => (
                                    <li key={entry.key} className="flex items-center justify-between gap-2 text-xs">
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className={`truncate ${entry.value > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                                                {entry.name}
                                            </span>
                                        </span>
                                        <span className={`font-semibold tabular-nums ${entry.value > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                                            {entry.value}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <div className="flex h-[300px] items-center justify-center text-gray-500">
                            No applications yet
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Locational Clearance Distribution */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Locational Clearance Distribution</CardTitle>
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
    );
}
