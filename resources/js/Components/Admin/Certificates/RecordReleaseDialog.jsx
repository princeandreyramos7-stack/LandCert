import React from "react";
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
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { FileText, Loader2, AlertCircle } from "lucide-react";

export function RecordReleaseDialog({ certificate, open, onOpenChange, routePrefix = 'admin' }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        released_to_name: "",
        released_to_id_type: "",
        released_to_id_number: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route(`${routePrefix}.certificates.record-release`, certificate?.id), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    const handleCancel = () => {
        reset();
        onOpenChange(false);
    };

    if (!certificate) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-purple-600">
                        <FileText className="h-5 w-5" />
                        Record Certificate Release
                    </DialogTitle>
                    <DialogDescription>
                        Record the details of the person collecting the certificate.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Certificate Details */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">
                                Certificate Number:
                            </span>
                            <span className="text-sm font-mono font-semibold text-blue-600">
                                {certificate.certificate_number}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">
                                Applicant:
                            </span>
                            <span className="text-sm font-medium text-slate-800">
                                {certificate.request?.applicant?.applicant_name ||
                                    "Unknown"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">
                                Request ID:
                            </span>
                            <span className="text-sm font-mono text-slate-700">
                                #{certificate.request_id}
                            </span>
                        </div>
                    </div>

                    {/* Collector Information */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="released_to_name">
                                Full Name of Person Collecting{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="released_to_name"
                                placeholder="e.g., Juan Dela Cruz"
                                value={data.released_to_name}
                                onChange={(e) =>
                                    setData("released_to_name", e.target.value)
                                }
                                className={
                                    errors.released_to_name
                                        ? "border-red-500"
                                        : ""
                                }
                            />
                            {errors.released_to_name && (
                                <p className="text-xs text-red-600">
                                    {errors.released_to_name}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="released_to_id_type">
                                    ID Type
                                </Label>
                                <Select
                                    value={data.released_to_id_type}
                                    onValueChange={(value) =>
                                        setData("released_to_id_type", value)
                                    }
                                >
                                    <SelectTrigger
                                        className={
                                            errors.released_to_id_type
                                                ? "border-red-500"
                                                : ""
                                        }
                                    >
                                        <SelectValue placeholder="Select ID type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="drivers_license">
                                            Driver's License
                                        </SelectItem>
                                        <SelectItem value="passport">
                                            Passport
                                        </SelectItem>
                                        <SelectItem value="umid">
                                            UMID
                                        </SelectItem>
                                        <SelectItem value="sss">
                                            SSS ID
                                        </SelectItem>
                                        <SelectItem value="philhealth">
                                            PhilHealth ID
                                        </SelectItem>
                                        <SelectItem value="voters_id">
                                            Voter's ID
                                        </SelectItem>
                                        <SelectItem value="prc_id">
                                            PRC ID
                                        </SelectItem>
                                        <SelectItem value="postal_id">
                                            Postal ID
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other Government ID
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.released_to_id_type && (
                                    <p className="text-xs text-red-600">
                                        {errors.released_to_id_type}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="released_to_id_number">
                                    ID Number
                                </Label>
                                <Input
                                    id="released_to_id_number"
                                    placeholder="e.g., N01-12-345678"
                                    value={data.released_to_id_number}
                                    onChange={(e) =>
                                        setData(
                                            "released_to_id_number",
                                            e.target.value
                                        )
                                    }
                                    className={
                                        errors.released_to_id_number
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.released_to_id_number && (
                                    <p className="text-xs text-red-600">
                                        {errors.released_to_id_number}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Warning Alert */}
                    <Alert className="border-amber-200 bg-amber-50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-sm text-amber-800">
                            <strong>Important:</strong> Please verify the
                            collector's ID before releasing the certificate.
                            This action will mark the certificate as released
                            and complete the request.
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
                            disabled={processing}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Record Release
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
