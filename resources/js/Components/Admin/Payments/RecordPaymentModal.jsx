import React, { useState, useEffect, useRef } from "react";
import { csrfHeaders } from "@/lib/csrf";
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
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { useToast } from "@/Components/ui/use-toast";
import { router } from "@inertiajs/react";
import {
    Receipt,
    Upload,
    X,
    AlertCircle,
    FileText,
    Calendar,
    DollarSign,
    User,
    AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

export function RecordPaymentModal({ isOpen, onClose, requestData }) {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);

    // Refs for focus management
    const firstInputRef = useRef(null);
    const previousActiveElement = useRef(null);

    // Form data
    const [formData, setFormData] = useState({
        request_id: null,
        receipt_number: "",
        amount: 0,
        payment_date: format(new Date(), "yyyy-MM-dd"),
        payment_method: "cash",
        check_number: "",
        reference_number: "",
        notes: "",
        receipt_file: null,
    });

    // Warnings
    const [warnings, setWarnings] = useState({
        duplicateOR: false,
        duplicateDetails: null,
        amountMismatch: false,
        oldPaymentDate: false,
    });

    // Receipt file preview
    const [receiptPreview, setReceiptPreview] = useState(null);

    // Initialize form when requestData changes
    useEffect(() => {
        console.log("Initialization useEffect triggered", { requestData, isOpen });
        console.log("Full requestData object:", JSON.stringify(requestData, null, 2));
        if (requestData && isOpen) {
            // Use request_id from requestData (not id)
            const requestId = requestData.request_id || requestData.id;
            console.log("Setting request_id to:", requestId);
            console.log("Setting amount to:", requestData.expected_amount);
            setFormData((prev) => ({
                ...prev,
                request_id: requestId,
                amount: requestData.expected_amount || 0,
            }));
        }
    }, [requestData, isOpen]);

    // Focus management - save and restore focus
    useEffect(() => {
        if (isOpen) {
            // Save the currently focused element
            previousActiveElement.current = document.activeElement;
            
            // Set focus to first input after modal renders
            setTimeout(() => {
                firstInputRef.current?.focus();
            }, 100);
        } else {
            // Restore focus when modal closes
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        }
    }, [isOpen]);

    // Keyboard event handler for Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                e.preventDefault();
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            request_id: null,
            receipt_number: "",
            amount: 0,
            payment_date: format(new Date(), "yyyy-MM-dd"),
            payment_method: "cash",
            check_number: "",
            reference_number: "",
            notes: "",
            receipt_file: null,
        });
        setWarnings({
            duplicateOR: false,
            duplicateDetails: null,
            amountMismatch: false,
            oldPaymentDate: false,
        });
        setReceiptPreview(null);
    };

    // Check for duplicate OR number
    const checkDuplicateOR = async (receiptNumber) => {
        if (!receiptNumber || receiptNumber.length < 3) {
            setWarnings((prev) => ({
                ...prev,
                duplicateOR: false,
                duplicateDetails: null,
            }));
            return;
        }

        setIsDuplicateChecking(true);

        try {
            const response = await fetch(
                route("admin.payments.check-duplicate"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...csrfHeaders(),
                    },
                    body: JSON.stringify({ receipt_number: receiptNumber }),
                }
            );

            const data = await response.json();

            setWarnings((prev) => ({
                ...prev,
                duplicateOR: data.exists,
                duplicateDetails: data.payment || null,
            }));
        } catch (error) {
            console.error("Error checking duplicate OR:", error);
        } finally {
            setIsDuplicateChecking(false);
        }
    };

    // Handle form field changes
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Check amount mismatch
        if (field === "amount") {
            const expectedAmount = requestData?.expected_amount || 0;
            setWarnings((prev) => ({
                ...prev,
                amountMismatch:
                    parseFloat(value) !== parseFloat(expectedAmount),
            }));
        }

        // Check old payment date
        if (field === "payment_date") {
            const paymentDate = new Date(value);
            const today = new Date();
            const daysDiff = Math.floor(
                (today - paymentDate) / (1000 * 60 * 60 * 24)
            );
            setWarnings((prev) => ({
                ...prev,
                oldPaymentDate: daysDiff > 30,
            }));
        }
    };

    // Handle OR number blur event
    const handleORBlur = () => {
        checkDuplicateOR(formData.receipt_number);
    };

    // Handle file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "application/pdf",
            ];
            if (!validTypes.includes(file.type)) {
                toast({
                    variant: "destructive",
                    title: "Invalid File Type",
                    description:
                        "Please upload a JPG, PNG, or PDF file.",
                });
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast({
                    variant: "destructive",
                    title: "File Too Large",
                    description: "File size must be less than 2MB.",
                });
                return;
            }

            setFormData((prev) => ({
                ...prev,
                receipt_file: file,
            }));

            // Create preview for images
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setReceiptPreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setReceiptPreview("pdf");
            }
        }
    };

    // Remove uploaded file
    const handleRemoveFile = () => {
        setFormData((prev) => ({
            ...prev,
            receipt_file: null,
        }));
        setReceiptPreview(null);
    };

    // Validate form
    const validateForm = () => {
        console.log("Validating form with data:", formData);
        
        if (!formData.request_id) {
            console.log("Validation failed: missing request_id");
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Request ID is missing. Please close and reopen the modal.",
            });
            return false;
        }
        
        if (!formData.receipt_number.trim()) {
            console.log("Validation failed: missing receipt_number");
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Official Receipt Number is required.",
            });
            return false;
        }

        console.log("Amount check:", formData.amount, "<=", 0, "?", formData.amount <= 0);
        if (formData.amount <= 0) {
            console.log("Validation failed: amount <= 0");
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Payment amount must be greater than zero.",
            });
            return false;
        }

        if (!formData.payment_date) {
            console.log("Validation failed: missing payment_date");
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Payment date is required.",
            });
            return false;
        }

        // Check future date
        const paymentDate = new Date(formData.payment_date);
        paymentDate.setHours(0, 0, 0, 0); // Set to midnight for fair comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log("Date check:", paymentDate, ">", today, "?", paymentDate > today);
        if (paymentDate > today) {
            console.log("Validation failed: future date");
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Payment date cannot be in the future.",
            });
            return false;
        }

        // Payment method is now always cash - no conditional validation needed
        console.log("Validation passed!");
        return true;
    };

    // Handle form submission - submit directly
    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);

        const submitData = new FormData();
        submitData.append("request_id", formData.request_id);
        submitData.append("receipt_number", formData.receipt_number);
        submitData.append("amount", formData.amount);
        submitData.append("payment_date", formData.payment_date);
        submitData.append("payment_method", formData.payment_method);

        if (formData.notes) {
            submitData.append("notes", formData.notes);
        }
        if (formData.receipt_file) {
            submitData.append("receipt_file", formData.receipt_file);
        }

        router.post(route("admin.payments.record"), submitData, {
            onSuccess: () => {
                toast({
                    title: "Payment Recorded Successfully!",
                    description: `Payment for Request #${requestData.request_id || requestData.id} has been verified and recorded.`,
                });
                setIsProcessing(false);
                onClose();
                resetForm();
            },
            onError: (errors) => {
                console.error("Error recording payment:", errors);
                setIsProcessing(false);
                toast({
                    variant: "destructive",
                    title: "Failed to Record Payment",
                    description:
                        errors.message ||
                        "An error occurred while recording the payment.",
                });
            },
        });
    };

    if (!requestData) return null;

    return (
        <>
            {/* Main Record Payment Modal */}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Receipt className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle>
                                    Record Payment - Request #{requestData.id}
                                </DialogTitle>
                                <DialogDescription>
                                    Verify and record payment received from the Treasury Office
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Request Summary Card */}
                        <Card className="bg-gray-50 border-gray-200">
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Applicant Name
                                            </p>
                                            <p className="font-semibold text-gray-900">
                                                {requestData.applicant_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Request ID
                                            </p>
                                            <p className="font-semibold text-gray-900">
                                                #{requestData.id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Expected Amount
                                            </p>
                                            <p className="font-semibold text-gray-900">
                                                ₱{requestData.expected_amount?.toFixed(2) || "0.00"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Approval Date
                                            </p>
                                            <p className="font-semibold text-gray-900">
                                                {requestData.approved_at
                                                    ? format(
                                                          new Date(requestData.approved_at),
                                                          "MMM dd, yyyy"
                                                      )
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Form */}
                        <div className="space-y-4">
                            {/* Official Receipt Number */}
                            <div>
                                <Label htmlFor="receipt_number">
                                    Official Receipt Number{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="receipt_number"
                                    value={formData.receipt_number}
                                    onChange={(e) =>
                                        handleInputChange("receipt_number", e.target.value)
                                    }
                                    onBlur={handleORBlur}
                                    placeholder="e.g., OR-2026-12345"
                                    className="mt-1"
                                    aria-describedby="receipt_number_help"
                                />
                                <p id="receipt_number_help" className="text-xs text-gray-500 mt-1">
                                    Enter the Official Receipt number from the Treasury Office
                                </p>
                                {isDuplicateChecking && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                        <span>Checking for duplicate OR numbers...</span>
                                    </div>
                                )}
                                {warnings.duplicateOR && warnings.duplicateDetails && (
                                    <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-md">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-yellow-900">
                                                ⚠️ Duplicate OR Number Detected
                                            </p>
                                            <p className="text-yellow-800 mt-1">
                                                This OR number was already used for Request #
                                                {warnings.duplicateDetails.request_id} by{" "}
                                                {warnings.duplicateDetails.applicant_name} on{" "}
                                                {format(
                                                    new Date(warnings.duplicateDetails.payment_date),
                                                    "MMM dd, yyyy"
                                                )}
                                            </p>
                                            <p className="text-yellow-700 mt-1 font-medium">
                                                Action: Verify the OR number is correct before proceeding
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Amount */}
                            <div>
                                <Label htmlFor="amount">
                                    Payment Amount <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative mt-1">
                                    <span className="absolute left-3 top-3 text-gray-500">
                                        ₱
                                    </span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) =>
                                            handleInputChange("amount", e.target.value)
                                        }
                                        placeholder="0.00"
                                        className="pl-8"
                                        aria-describedby="amount_help"
                                    />
                                </div>
                                <p id="amount_help" className="text-xs text-gray-500 mt-1">
                                    Expected amount: ₱{requestData?.expected_amount?.toFixed(2) || "0.00"}
                                </p>
                                {warnings.amountMismatch && (
                                    <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-md">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-yellow-900">
                                                ⚠️ Amount Mismatch
                                            </p>
                                            <p className="text-yellow-800 mt-1">
                                                Payment amount (₱{parseFloat(formData.amount).toFixed(2)}) differs from expected amount (₱{requestData?.expected_amount?.toFixed(2)}).
                                            </p>
                                            <p className="text-yellow-700 mt-1 font-medium">
                                                Action: Verify the amount is correct and add a note explaining the difference
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Date */}
                            <div>
                                <Label htmlFor="payment_date">
                                    Payment Date <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="payment_date"
                                    type="date"
                                    value={formData.payment_date}
                                    onChange={(e) =>
                                        handleInputChange("payment_date", e.target.value)
                                    }
                                    max={format(new Date(), "yyyy-MM-dd")}
                                    className="mt-1"
                                    aria-describedby="payment_date_help"
                                />
                                <p id="payment_date_help" className="text-xs text-gray-500 mt-1">
                                    Date when payment was received at Treasury Office (cannot be in the future)
                                </p>
                                {warnings.oldPaymentDate && (
                                    <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-md">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-yellow-900">
                                                ⚠️ Old Payment Date
                                            </p>
                                            <p className="text-yellow-800 mt-1">
                                                Payment date is more than 30 days ago ({format(new Date(formData.payment_date), "MMM dd, yyyy")}).
                                            </p>
                                            <p className="text-yellow-700 mt-1 font-medium">
                                                Action: Verify the date is correct before proceeding
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div>
                                <Label htmlFor="payment_method">
                                    Payment Method <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.payment_method}
                                    onValueChange={(value) =>
                                        handleInputChange("payment_method", value)
                                    }
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Notes */}
                            <div>
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        handleInputChange("notes", e.target.value)
                                    }
                                    placeholder="Add any additional notes about this payment..."
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            {/* Receipt Upload */}
                            <div>
                                <Label htmlFor="receipt_file">
                                    Upload Receipt (Optional)
                                </Label>
                                {!formData.receipt_file ? (
                                    <div className="mt-1">
                                        <label
                                            htmlFor="receipt_file"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">
                                                        Click to upload
                                                    </span>{" "}
                                                    or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, or PDF (max 2MB)
                                                </p>
                                            </div>
                                            <input
                                                id="receipt_file"
                                                type="file"
                                                className="hidden"
                                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="mt-1 p-4 border border-gray-300 rounded-lg bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {receiptPreview &&
                                                receiptPreview !== "pdf" ? (
                                                    <img
                                                        src={receiptPreview}
                                                        alt="Receipt preview"
                                                        className="h-16 w-16 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 bg-red-100 rounded flex items-center justify-center">
                                                        <FileText className="h-8 w-8 text-red-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {formData.receipt_file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(
                                                            formData.receipt_file.size /
                                                            1024
                                                        ).toFixed(2)}{" "}
                                                        KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemoveFile}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing..." : "Confirm Payment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    );
}
