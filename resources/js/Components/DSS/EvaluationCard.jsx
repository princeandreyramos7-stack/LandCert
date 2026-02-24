import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export default function EvaluationCard({ evaluation }) {
    const getRecommendationBadge = (recommendation) => {
        const variants = {
            approve: { variant: 'default', className: 'bg-green-500', icon: CheckCircle },
            deny: { variant: 'destructive', icon: AlertCircle },
            review_required: { variant: 'warning', className: 'bg-yellow-500', icon: AlertTriangle },
        };

        const config = variants[recommendation] || variants.review_required;
        const Icon = config.icon;

        return (
            <Badge className={config.className}>
                <Icon className="w-3 h-3 mr-1" />
                {recommendation.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <Card className="p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">DSS Evaluation Results</h3>
                    {getRecommendationBadge(evaluation.recommendation)}
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Compliance Score</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-bold ${getScoreColor(evaluation.compliance_score)}`}>
                                {evaluation.compliance_score}
                            </span>
                            <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full ${
                                    evaluation.compliance_score >= 80 ? 'bg-green-500' :
                                    evaluation.compliance_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${evaluation.compliance_score}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Risk Score</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-bold ${getScoreColor(100 - evaluation.risk_score)}`}>
                                {evaluation.risk_score}
                            </span>
                            <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full ${
                                    evaluation.risk_score <= 30 ? 'bg-green-500' :
                                    evaluation.risk_score <= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${evaluation.risk_score}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Violations */}
                {evaluation.violations && evaluation.violations.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Violations ({evaluation.violations.length})
                        </h4>
                        <ul className="space-y-1">
                            {evaluation.violations.map((violation, index) => (
                                <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>{violation.message}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Warnings */}
                {evaluation.warnings && evaluation.warnings.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-yellow-600 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Warnings ({evaluation.warnings.length})
                        </h4>
                        <ul className="space-y-1">
                            {evaluation.warnings.map((warning, index) => (
                                <li key={index} className="text-sm text-yellow-600 flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>{warning.message}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* AI Suggestion */}
                {evaluation.ai_suggestion && (
                    <div className="space-y-2 border-t pt-4">
                        <h4 className="font-semibold">AI Recommendation</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {evaluation.ai_suggestion}
                        </p>
                    </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-muted-foreground border-t pt-4">
                    Evaluated on {new Date(evaluation.evaluated_at).toLocaleString()}
                </div>
            </div>
        </Card>
    );
}
