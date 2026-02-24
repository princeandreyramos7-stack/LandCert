import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import EvaluationCard from '@/Components/DSS/EvaluationCard';
import ValidationResults from '@/Components/DSS/ValidationResults';
import RiskAssessment from '@/Components/DSS/RiskAssessment';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function DssEvaluation({ auth, evaluation }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="DSS Evaluation" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link href={route('admin.requests')}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Requests
                                </Button>
                            </Link>
                            <h2 className="text-2xl font-bold mt-2">DSS Evaluation Report</h2>
                            <p className="text-muted-foreground">
                                Request ID: {evaluation.request_id}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <EvaluationCard evaluation={evaluation} />
                            
                            <ValidationResults validationResults={evaluation.validation_results} />
                            
                            {evaluation.risk_factors && evaluation.risk_factors.length > 0 && (
                                <RiskAssessment riskFactors={evaluation.risk_factors} />
                            )}
                        </div>

                        <div className="space-y-6">
                            <Card className="p-4">
                                <h3 className="font-semibold mb-4">Property Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="font-medium">{evaluation.property_location.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Zone</p>
                                        <Badge variant="outline">
                                            {evaluation.property_location.zoning_rule?.zone_name || 'Unzoned'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lot Area</p>
                                        <p className="font-medium">{evaluation.property_location.lot_area} sqm</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Coordinates</p>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <p className="text-sm font-mono">
                                                {evaluation.property_location.latitude}, {evaluation.property_location.longitude}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <h3 className="font-semibold mb-4">Zoning Rules</h3>
                                {evaluation.property_location.zoning_rule ? (
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Zone Code</p>
                                            <p className="font-medium">{evaluation.property_location.zoning_rule.zone_code}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Min Lot Area</p>
                                            <p className="font-medium">
                                                {evaluation.property_location.zoning_rule.min_lot_area || 'N/A'} sqm
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Max Building Height</p>
                                            <p className="font-medium">
                                                {evaluation.property_location.zoning_rule.max_building_height || 'N/A'} m
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No zoning rule assigned</p>
                                )}
                            </Card>

                            {evaluation.evaluated_by && (
                                <Card className="p-4">
                                    <h3 className="font-semibold mb-2">Evaluated By</h3>
                                    <p className="text-sm">{evaluation.evaluated_by.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(evaluation.evaluated_at).toLocaleString()}
                                    </p>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
