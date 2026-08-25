import React from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart as RechartsRadarChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * RadarChart Component
 * Displays multi-dimensional data in radar format
 */
export function RadarChart({ data, dataKeys = [], height = 350, colors = [] }) {
    const defaultColors = ['#0d1f5c', '#d4a017', '#2563eb', '#10b981', '#f59e0b'];
    const chartColors = colors.length > 0 ? colors : defaultColors;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsRadarChart data={data}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                {dataKeys.map((key, idx) => (
                    <Radar
                        key={key.key}
                        name={key.name}
                        dataKey={key.key}
                        stroke={chartColors[idx % chartColors.length]}
                        fill={chartColors[idx % chartColors.length]}
                        fillOpacity={0.6}
                    />
                ))}
            </RechartsRadarChart>
        </ResponsiveContainer>
    );
}
