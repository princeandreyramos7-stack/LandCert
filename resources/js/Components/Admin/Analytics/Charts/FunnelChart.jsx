import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * FunnelChart Component
 * Displays process flow with conversion rates
 */
export function FunnelChart({ data, height = 400 }) {
    const maxValue = Math.max(...data.map(d => d.value));
    
    const getColor = (index) => {
        const colors = ['#0d1f5c', '#1a3a8f', '#2563eb', '#3b82f6', '#60a5fa'];
        return colors[index % colors.length];
    };

    const calculateConversion = (index) => {
        if (index === 0) return 100;
        const previousValue = data[index - 1].value;
        const currentValue = data[index].value;
        return previousValue > 0 ? ((currentValue / previousValue) * 100).toFixed(1) : 0;
    };

    return (
        <div className="relative space-y-2" style={{ minHeight: height }}>
            {data.map((item, index) => {
                const widthPercent = (item.value / maxValue) * 100;
                const conversion = calculateConversion(index);
                
                return (
                    <div key={index} className="relative">
                        {/* Funnel segment */}
                        <div className="flex items-center justify-center">
                            <div
                                className="relative rounded-lg transition-all hover:shadow-lg cursor-pointer"
                                style={{
                                    width: `${widthPercent}%`,
                                    minWidth: '200px',
                                    backgroundColor: getColor(index),
                                    padding: '20px',
                                }}
                            >
                                <div className="text-white text-center">
                                    <div className="font-bold text-lg">{item.name}</div>
                                    <div className="text-2xl font-black mt-1">{item.value.toLocaleString()}</div>
                                    {item.description && (
                                        <div className="text-xs mt-1 opacity-90">{item.description}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Conversion rate indicator */}
                        {index > 0 && (
                            <div className="flex items-center justify-center my-1">
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-700">
                                        {conversion}% conversion
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
