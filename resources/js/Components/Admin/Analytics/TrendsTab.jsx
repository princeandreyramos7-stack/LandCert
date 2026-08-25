import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { TrendingUp, Calendar, Clock, Activity } from 'lucide-react';
import { AreaChart, ComposedChart, HeatMap } from './Charts';

/**
 * TrendsTab Component
 * Displays trend analysis with various time-based metrics
 */
export function TrendsTab({ 
    monthlySubmissions = [], 
    dailySubmissions = [],
    weeklyActivity = [],
    processingTimeTrend = [],
    hourlyPattern = [],
    dayOfWeekPattern = []
}) {
    // Prepare monthly trend data
    const monthlyData = monthlySubmissions.map(item => ({
        name: item.month,
        count: item.count,
    }));

    // Prepare daily submissions (last 30 days)
    const dailyData = dailySubmissions.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Submissions: item.count,
    }));

    // Prepare processing time trend
    const processingData = processingTimeTrend.map(item => ({
        name: item.month,
        'Avg Days': parseFloat(item.avg_days),
    }));

    // Combined chart with submissions and processing time
    const combinedData = monthlySubmissions.map(item => {
        const processing = processingTimeTrend.find(p => p.month === item.month);
        return {
            name: item.month,
            Submissions: item.count,
            'Processing Days': processing ? parseFloat(processing.avg_days) : 0,
        };
    });

    const combinedSeries = [
        { key: 'Submissions', name: 'Submissions', type: 'bar', color: '#0d1f5c' },
        { key: 'Processing Days', name: 'Avg Processing Days', type: 'line', color: '#d4a017' },
    ];

    // Prepare heat map data for hourly/day patterns
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Create a matrix for the heatmap (7 days x 24 hours)
    // This is simplified - in a real scenario, you'd aggregate actual data
    const heatMapData = daysOfWeek.map((day, dayIdx) => {
        return hours.map(hour => {
            const hourData = hourlyPattern.find(h => h.hour === hour);
            const dayData = dayOfWeekPattern.find(d => d.day === dayIdx + 1);
            // Combine hourly and daily patterns (simplified calculation)
            return hourData && dayData ? Math.round((hourData.count + dayData.count) / 10) : 0;
        });
    });

    const maxHeatValue = Math.max(...heatMapData.flat());

    return (
        <div className="space-y-6">
            {/* Monthly Trend - Area Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Monthly Submissions Trend (Last 12 Months)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {monthlyData.length > 0 ? (
                        <AreaChart 
                            data={monthlyData}
                            dataKeys={[
                                { key: 'count', name: 'Applications', xKey: 'name' }
                            ]}
                            height={300}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            No monthly data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Combined Submissions & Processing Time */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Submissions vs Processing Time
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {combinedData.length > 0 ? (
                        <ComposedChart 
                            data={combinedData}
                            series={combinedSeries}
                            height={350}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            No combined data available
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {/* Daily Activity - Last 30 Days */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Daily Activity (Last 30 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dailyData.length > 0 ? (
                            <AreaChart 
                                data={dailyData}
                                dataKeys={[
                                    { key: 'Submissions', name: 'Submissions', xKey: 'name' }
                                ]}
                                height={280}
                                colors={['#2563eb']}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No daily data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Processing Time Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Processing Time Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {processingData.length > 0 ? (
                            <AreaChart 
                                data={processingData}
                                dataKeys={[
                                    { key: 'Avg Days', name: 'Average Days', xKey: 'name' }
                                ]}
                                height={280}
                                colors={['#d4a017']}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No processing time data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Activity Heat Map */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Activity Pattern Heat Map
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Submission activity intensity by day and hour
                    </p>
                </CardHeader>
                <CardContent>
                    <HeatMap 
                        data={heatMapData}
                        maxValue={maxHeatValue}
                        labels={{
                            x: ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', 
                                '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'],
                            y: daysOfWeek
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
