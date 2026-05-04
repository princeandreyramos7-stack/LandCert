import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Users, BarChart3 } from 'lucide-react';
import { calculateAveragePerUser } from './utils';

export function UsersTab({ top_users }) {
    return (
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
                            {calculateAveragePerUser(top_users)}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">Submissions per user</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
