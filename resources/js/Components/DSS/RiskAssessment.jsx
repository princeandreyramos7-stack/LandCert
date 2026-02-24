import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function RiskAssessment({ riskFactors }) {
    const getCategoryColor = (category) => {
        const colors = {
            environmental: 'bg-green-100 text-green-800',
            safety: 'bg-red-100 text-red-800',
            land_use: 'bg-blue-100 text-blue-800',
            infrastructure: 'bg-purple-100 text-purple-800',
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const getSeverityColor = (severity) => {
        if (severity >= 8) return 'bg-red-500';
        if (severity >= 5) return 'bg-orange-500';
        if (severity >= 3) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    const presentRisks = riskFactors.filter(rf => rf.pivot.is_present);
    const totalSeverity = presentRisks.reduce((sum, rf) => sum + rf.pivot.severity, 0);

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Risk Assessment</h3>
                {presentRisks.length > 0 && (
                    <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {presentRisks.length} Risk{presentRisks.length !== 1 ? 's' : ''} Detected
                    </Badge>
                )}
            </div>

            {presentRisks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No significant risks detected</p>
            ) : (
                <div className="space-y-4">
                    {presentRisks.map((riskFactor) => (
                        <div key={riskFactor.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="font-semibold">{riskFactor.factor_name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {riskFactor.description}
                                    </p>
                                </div>
                                <Badge className={getCategoryColor(riskFactor.category)}>
                                    {riskFactor.category}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground mb-1">Severity</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getSeverityColor(riskFactor.pivot.severity)}`}
                                                style={{ width: `${(riskFactor.pivot.severity / 10) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold">
                                            {riskFactor.pivot.severity}/10
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {riskFactor.pivot.notes && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                    {riskFactor.pivot.notes}
                                </p>
                            )}
                        </div>
                    ))}

                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Risk Severity</span>
                            <span className="text-2xl font-bold text-red-600">
                                {totalSeverity}/{presentRisks.length * 10}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
