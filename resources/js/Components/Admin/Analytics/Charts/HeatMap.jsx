import React from 'react';
import { Tooltip } from '@/Components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';

/**
 * HeatMap Component
 * Displays activity intensity as a heat map grid
 */
export function HeatMap({ data, maxValue, labels = { x: [], y: [] } }) {
    const getColor = (value) => {
        if (!value) return 'bg-gray-100';
        const intensity = value / maxValue;
        
        if (intensity >= 0.8) return 'bg-blue-600';
        if (intensity >= 0.6) return 'bg-blue-500';
        if (intensity >= 0.4) return 'bg-blue-400';
        if (intensity >= 0.2) return 'bg-blue-300';
        return 'bg-blue-200';
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="w-16" /> {/* Spacer for y-axis labels */}
                <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${labels.x.length}, minmax(0, 1fr))` }}>
                    {labels.x.map((label, idx) => (
                        <div key={idx} className="text-xs text-gray-500 text-center font-medium">
                            {label}
                        </div>
                    ))}
                </div>
            </div>
            
            {data.map((row, yIdx) => (
                <div key={yIdx} className="flex gap-2 items-center">
                    <div className="w-16 text-xs text-gray-500 font-medium text-right">
                        {labels.y[yIdx]}
                    </div>
                    <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
                        {row.map((value, xIdx) => (
                            <TooltipProvider key={xIdx}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`h-10 rounded ${getColor(value)} cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all`}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">
                                            {labels.y[yIdx]} - {labels.x[xIdx]}: <span className="font-bold">{value || 0}</span>
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>
            ))}
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 pt-4">
                <span className="text-xs text-gray-500">Less</span>
                <div className="flex gap-1">
                    {['bg-gray-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600'].map((color, idx) => (
                        <div key={idx} className={`w-4 h-4 rounded ${color}`} />
                    ))}
                </div>
                <span className="text-xs text-gray-500">More</span>
            </div>
        </div>
    );
}
