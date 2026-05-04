import React from 'react';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function ValidationResults({ validationResults }) {
    const renderCheckIcon = (passed) => {
        if (passed) {
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        }
        return <XCircle className="w-5 h-5 text-red-500" />;
    };

    const getSeverityBadge = (severity) => {
        const variants = {
            critical: { className: 'bg-red-500', label: 'Critical' },
            high: { className: 'bg-orange-500', label: 'High' },
            medium: { className: 'bg-yellow-500', label: 'Medium' },
            low: { className: 'bg-blue-500', label: 'Low' },
        };

        const config = variants[severity] || variants.medium;
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const renderCheck = (key, check) => {
        if (check.checks) {
            // Nested checks (like distance_restrictions)
            return (
                <div key={key} className="space-y-2">
                    <div className="flex items-center gap-2">
                        {renderCheckIcon(check.passed)}
                        <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                        {check.severity && getSeverityBadge(check.severity)}
                    </div>
                    <div className="ml-8 space-y-1">
                        {Object.entries(check.checks).map(([subKey, subCheck]) => (
                            <div key={subKey} className="flex items-start gap-2 text-sm">
                                {renderCheckIcon(subCheck.passed)}
                                <div>
                                    <p className="font-medium capitalize">{subKey.replace('_', ' ')}</p>
                                    <p className="text-muted-foreground">{subCheck.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Simple check
        return (
            <div key={key} className="flex items-start gap-3">
                {renderCheckIcon(check.passed)}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                        {check.severity && getSeverityBadge(check.severity)}
                    </div>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                </div>
            </div>
        );
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Validation Checks</h3>
            <div className="space-y-4">
                {Object.entries(validationResults).map(([key, check]) => renderCheck(key, check))}
            </div>
        </Card>
    );
}
