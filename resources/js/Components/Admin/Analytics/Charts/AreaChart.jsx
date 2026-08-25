import React from 'react';
import { Area, AreaChart as RechartsAreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

/**
 * AreaChart Component
 * Displays area chart for trend analysis
 */
export function AreaChart({ data, dataKeys = [], height = 300, colors = [] }) {
    const defaultColors = ['#0d1f5c', '#1a3a8f', '#2563eb', '#3b82f6', '#60a5fa'];
    const chartColors = colors.length > 0 ? colors : defaultColors;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsAreaChart data={data}>
                <defs>
                    {dataKeys.map((key, idx) => (
                        <linearGradient key={key.key} id={`gradient-${key.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors[idx % chartColors.length]} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={chartColors[idx % chartColors.length]} stopOpacity={0.1} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                    dataKey={dataKeys[0]?.xKey || 'name'} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    stroke="#9ca3af"
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                {dataKeys.map((key, idx) => (
                    <Area
                        key={key.key}
                        type="monotone"
                        dataKey={key.key}
                        name={key.name}
                        stroke={chartColors[idx % chartColors.length]}
                        fill={`url(#gradient-${key.key})`}
                        strokeWidth={2}
                    />
                ))}
            </RechartsAreaChart>
        </ResponsiveContainer>
    );
}
