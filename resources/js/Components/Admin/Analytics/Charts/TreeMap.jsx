import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';

/**
 * TreeMap Component
 * Displays hierarchical data as nested rectangles
 */
export function TreeMap({ data, height = 400 }) {
    const COLORS = [
        '#0d1f5c', '#1a3a8f', '#2563eb', '#3b82f6', '#60a5fa',
        '#93c5fd', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6'
    ];

    const CustomContent = ({ x, y, width, height, index, name, value }) => {
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: COLORS[index % COLORS.length],
                        stroke: '#fff',
                        strokeWidth: 2,
                    }}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                />
                {width > 60 && height > 30 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                        fontWeight="bold"
                    >
                        {name}
                    </text>
                )}
                {width > 60 && height > 50 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 16}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={11}
                    >
                        {value}
                    </text>
                )}
            </g>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <Treemap
                data={data}
                dataKey="size"
                stroke="#fff"
                fill="#0d1f5c"
                content={<CustomContent />}
            >
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                />
            </Treemap>
        </ResponsiveContainer>
    );
}
