import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { MapPin, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TreeMap } from './Charts';

/**
 * GeographicTab Component
 * Displays geographic distribution analytics
 */
export function GeographicTab({ barangayDistribution = [], provinceDistribution = [] }) {
    const COLORS = ['#0d1f5c', '#1a3a8f', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

    // Prepare data for TreeMap
    const barangayTreeMapData = barangayDistribution.map((item, idx) => ({
        name: item.barangay || 'Unknown',
        size: item.count,
        value: `${item.count} requests`,
    }));

    // Prepare data for province pie chart
    const provinceData = provinceDistribution.map(item => ({
        name: item.province || 'Unknown',
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
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* Barangay Distribution - TreeMap */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        Applications by Barangay (Top 15)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {barangayTreeMapData.length > 0 ? (
                        <TreeMap data={barangayTreeMapData} height={400} />
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            No barangay data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Barangay Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Top Barangays by Volume
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {barangayDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart 
                                data={barangayDistribution.slice(0, 10)} 
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                <YAxis 
                                    type="category" 
                                    dataKey="barangay" 
                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                    width={90}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '8px' 
                                    }}
                                />
                                <Bar dataKey="count" fill="#0d1f5c" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            No data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Province Distribution - Pie Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        Distribution by Province
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {provinceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={provinceData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {provinceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            No province data available
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
