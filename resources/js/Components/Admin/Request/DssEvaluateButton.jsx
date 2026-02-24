import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Brain, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function DssEvaluateButton({ request, propertyLocation }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleEvaluate = () => {
        if (!propertyLocation) {
            toast({
                title: 'Property Location Required',
                description: 'Please add property location data before running DSS evaluation.',
                variant: 'destructive',
            });
            return;
        }

        if (!propertyLocation.zoning_rule_id) {
            toast({
                title: 'Zoning Rule Required',
                description: 'Please assign a zoning rule to the property location.',
                variant: 'destructive',
            });
            return;
        }

        setOpen(true);
    };

    const confirmEvaluate = () => {
        setLoading(true);
        
        router.post(
            route('admin.requests.evaluate', request.id),
            {},
            {
                onSuccess: (page) => {
                    setOpen(false);
                    toast({
                        title: 'Evaluation Complete',
                        description: 'DSS evaluation has been completed successfully.',
                    });
                    
                    // Redirect to evaluation page if available
                    if (page.props.evaluation) {
                        router.visit(route('admin.dss-evaluation.show', page.props.evaluation.id));
                    }
                },
                onError: (errors) => {
                    toast({
                        title: 'Evaluation Failed',
                        description: errors.message || 'An error occurred during evaluation.',
                        variant: 'destructive',
                    });
                },
                onFinish: () => {
                    setLoading(false);
                },
            }
        );
    };

    return (
        <>
            <Button
                onClick={handleEvaluate}
                variant="outline"
                className="gap-2"
            >
                <Brain className="w-4 h-4" />
                Run DSS Evaluation
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5" />
                            Run DSS Evaluation
                        </DialogTitle>
                        <DialogDescription>
                            The Decision Support System will analyze this request for zoning compliance,
                            risk factors, and provide recommendations.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-sm mb-2">Evaluation will check:</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>✓ Lot area compliance</li>
                                <li>✓ Land use compatibility</li>
                                <li>✓ Building height restrictions</li>
                                <li>✓ Distance requirements</li>
                                <li>✓ Environmental factors</li>
                                <li>✓ Risk assessment</li>
                            </ul>
                        </div>

                        {propertyLocation && (
                            <div className="text-sm">
                                <p className="font-medium mb-1">Property Details:</p>
                                <p className="text-muted-foreground">
                                    {propertyLocation.address}
                                </p>
                                <p className="text-muted-foreground">
                                    Zone: {propertyLocation.zoning_rule?.zone_name || 'Not assigned'}
                                </p>
                                <p className="text-muted-foreground">
                                    Lot Area: {propertyLocation.lot_area} sqm
                                </p>
                            </div>
                        )}

                        <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>
                                This evaluation is automated and should be reviewed by a planning officer
                                before making final decisions.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmEvaluate}
                            disabled={loading}
                        >
                            {loading ? 'Evaluating...' : 'Run Evaluation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
