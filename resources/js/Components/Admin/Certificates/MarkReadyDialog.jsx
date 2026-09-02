import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Checkbox } from "@/Components/ui/checkbox";
import { Label } from "@/Components/ui/label";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

export function MarkReadyDialog({ certificate, open, onOpenChange, routePrefix = 'admin' }) {
    const [confirmed, setConfirmed] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        notes: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!confirmed) {
            return;
        }

        post(route(`${routePrefix}.certificates.mark-ready`, certificate?.id), {
            onSuccess: () => {
                reset();
                setConfirmed(false);
                onOpenChange(false);
            },
        });
    };

    const handleCancel = () => {
        reset();
        setConfirmed(false);
        onOpenChange(false);
    };

    if (!certificate) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <CheckCircle className="h-5 w-5" />
                        Mark Certificate Ready for Pickup
                    </DialogTitle>
                    <DialogDescription>
                        Confirm that the certificate has been signed and is ready for the applicant to collect.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Certificate Details */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Certificate Number:</span>
                            <span className="text-sm font-mono font-semibold text-blue-600">
                                {certificate.certificate_number}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Applicant:</span>
                            <span className="text-sm font-medium text-slate-800">
                                {certificate.request?.applicant?.applicant_name || "Unknown"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Request ID:</span>
                            <span className="text-sm font-mono text-slate-700">
                                #{certificate.request_id}
                            </span>
                        </div>
                    </div>

                    {/* Confirmation Checkbox */}
                    <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <Checkbox
                            id="confirm-signed"
                            checked={confirmed}
                            onCheckedChange={setConfirmed}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <Label
                                htmlFor="confirm-signed"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                I confirm that this certificate has been signed by all required officials
                            </Label>
                            <p className="text-xs text-slate-600 mt-1">
                                The applicant will be notified via email, SMS, and in-app notification.
                            </p>
                        </div>
                    </div>

                    {/* Optional Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
                            Notes (Optional)
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any additional notes about this certificate..."
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                        {errors.notes && (
                            <p className="text-xs text-red-600">{errors.notes}</p>
                        )}
                    </div>

                    {/* Warning Alert */}
                    {!confirmed && (
                        <Alert className="border-amber-200 bg-amber-50">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-sm text-amber-800">
                                Please confirm that the certificate has been signed before proceeding.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Notification Info */}
                    <Alert className="border-blue-200 bg-blue-50">
                        <AlertDescription className="text-sm text-blue-800">
                            <strong>Notifications will be sent to:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                                <li>Email notification with pickup instructions</li>
                                <li>SMS notification (if phone number is available)</li>
                                <li>In-app notification on dashboard</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!confirmed || processing}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Marking Ready...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Ready & Notify
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
