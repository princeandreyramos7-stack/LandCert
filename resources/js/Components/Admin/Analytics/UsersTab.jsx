import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Users, BarChart3, UserPlus, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function UsersTab({ top_users = [], user_activity_metrics = {} }) {
    const calculateAveragePerUser = () => {
        if (!top_users.length) return 0;
        const total = top_users.reduce((sum, user) => sum + user.count, 0);
        return (total / top_users.length).toFixed(1);
    };

    // Prepare bar chart data
    const chartData = top_users.map((user, index) => ({
        name: user.name.split(' ')[0], // First name only for brevity
        Submissions: user.count,
    }));

    return (
        <div className="space-y-6">
            {/* User Activity Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Active Users</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {user_activity_metrics?.total_active_users || 0}
                                </p>
                            </div>
                            <Users className="h-12 w-12 text-blue-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">New This Month</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {user_activity_metrics?.new_users_this_month || 0}
                                </p>
                            </div>
                            <UserPlus className="h-12 w-12 text-green-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Active This Month</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {user_activity_metrics?.active_users_this_month || 0}
                                </p>
                            </div>
                            <Activity className="h-12 w-12 text-purple-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Avg per User</p>
                                <p className="text-3xl font-bold text-orange-600">
                                    {calculateAveragePerUser()}
                                </p>
                            </div>
                            <BarChart3 className="h-12 w-12 text-orange-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {/* Top Users List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Top Users by Submissions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {top_users.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                            ) : (
                                top_users.map((user, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-purple-700 border-purple-300 font-semibold">
                                            {user.count}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Users Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            Submissions Comparison
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fill: '#6b7280', fontSize: 11 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '8px' 
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="Submissions" fill="#0d1f5c" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No user data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
