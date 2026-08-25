import React from 'react';
import { 
    ComposedChart as RechartsComposedChart, 
    Line, 
    Bar, 
    Area,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';

/**
 * ComposedChart Component
 * Combines multiple chart types (bar, line, area) in one visualization
 */
export function ComposedChart({ data, series = [], height = 350 }) {
    const defaultColors = ['#0d1f5c', '#d4a017', '#2563eb', '#10b981', '#f59e0b'];

    const renderSeries = (item, index) => {
        const color = item.color || defaultColors[index % defaultColors.length];
        
        switch (item.type) {
            case 'bar':
                return (
                    <Bar
                        key={item.key}
                        dataKey={item.key}
                        name={item.name}
                        fill={color}
                        radius={[8, 8, 0, 0]}
                    />
                );
            case 'line':
                return (
                    <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.name}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                );
            case 'area':
                return (
                    <Area
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.name}
                        fill={color}
                        stroke={color}
                        fillOpacity={0.3}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsComposedChart data={data}>
                <defs>
                    {series.filter(s => s.type === 'area').map((item, idx) => (
                        <linearGradient key={item.key} id={`gradient-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={item.color || defaultColors[idx]} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={item.color || defaultColors[idx]} stopOpacity={0.1} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                    dataKey="name" 
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
                {series.map((item, index) => renderSeries(item, index))}
            </RechartsComposedChart>
        </ResponsiveContainer>
    );
}
