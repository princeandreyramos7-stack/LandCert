import React from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";

export function UploadDialog({
    isOpen,
    onOpenChange,
    selectedRequest,
    formData,
    setFormData,
    onSubmit,
    isSubmitting,
    onFileChange,
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl bg-white border border-gray-200 rounded-lg">
                {/* Modal Header with Blue Background */}
                <div className="bg-blue-600 text-white p-4 -m-6 mb-4 rounded-t-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Upload Payment Receipt
                        </DialogTitle>
                        <DialogDescription className="text-white text-sm">
                            Request #{selectedRequest?.id} -{" "}
                            {selectedRequest?.applicant_name}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Scrollable Form Content */}
                <div className="overflow-y-auto max-h-[calc(85vh-200px)] pr-2">
                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Amount & Payment Method */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="amount"
                                    className="text-sm font-semibold text-gray-700"
                                >
                                    Amount Paid *
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                                        ₱
                                    </span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.amount}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                amount: e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                        className="pl-8 pr-3 py-2 border border-gray-300 rounded bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="payment_method"
                                    className="text-sm font-semibold text-gray-700"
                                >
                                    Payment Method *
                                </Label>
                                <Select
                                    value={formData.payment_method}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            payment_method: value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="p-2 border border-gray-300 rounded bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">
                                            💵 Cash
                                        </SelectItem>
                                        <SelectItem value="bank_transfer">
                                            🏦 Bank Transfer
                                        </SelectItem>
                                        <SelectItem value="gcash">
                                            📱 GCash
                                        </SelectItem>
                                        <SelectItem value="paymaya">
                                            💳 PayMaya
                                        </SelectItem>
                                        <SelectItem value="check">
                                            📝 Check
                                        </SelectItem>
                                        <SelectItem value="other">
                                            ➕ Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Receipt Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="receipt_number"
                                    className="text-sm font-semibold text-gray-700"
                                >
                                    Receipt/Reference Number{" "}
                                    {formData.payment_method !== "cash" && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </Label>
                                <Input
                                    id="receipt_number"
                                    value={formData.receipt_number}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            receipt_number: e.target.value,
                                        })
                                    }
                                    placeholder={
                                        formData.payment_method === "cash"
                                            ? "Optional"
                                            : "Required"
                                    }
                                    required={
                                        formData.payment_method !== "cash"
                                    }
                                    className="p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                                {formData.payment_method === "cash" && (
                                    <p className="text-xs text-gray-600">
                                        Optional for cash payments
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="payment_date"
                                    className="text-sm font-semibold text-gray-700"
                                >
                                    Payment Date *
                                </Label>
                                <Input
                                    id="payment_date"
                                    type="date"
                                    required
                                    value={formData.payment_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            payment_date: e.target.value,
                                        })
                                    }
                                    className="p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                            </div>
                        </div>

                        {/* Other Payment Method Specification */}
                        {formData.payment_method === "other" && (
                            <div className="space-y-2">
                                <Label
                                    htmlFor="other_method"
                                    className="text-sm font-semibold text-gray-700"
                                >
                                    Please Specify Payment Method *
                                </Label>
                                <Input
                                    id="other_method"
                                    value={formData.other_method}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            other_method: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Credit Card, Debit Card, etc."
                                    required
                                    className="p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                            </div>
                        )}

                        {/* File Upload */}
                        <div className="space-y-3">
                            <Label
                                htmlFor="receipt_file"
                                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                            >
                                <Upload className="h-4 w-4 text-blue-600" />
                                Receipt Document (PDF, JPG, PNG) *
                            </Label>

                            {/* Custom File Upload Button */}
                            <div className="relative">
                                <input
                                    id="receipt_file"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    required
                                    onChange={onFileChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="receipt_file"
                                    className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded bg-white hover:bg-gray-50 cursor-pointer transition-all hover:border-blue-500 group"
                                >
                                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        <Upload className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                            {formData.receipt_file
                                                ? "Change File"
                                                : "Choose File"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Click to browse or drag and drop
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Selected File Display */}
                            {formData.receipt_file && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formData.receipt_file.name}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {(
                                                        formData.receipt_file
                                                            .size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </p>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-600">
                                Maximum file size: 5MB • Accepted formats: PDF,
                                JPG, PNG
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="notes"
                                className="text-sm font-semibold text-gray-700"
                            >
                                Notes (Optional)
                            </Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        notes: e.target.value,
                                    })
                                }
                                placeholder="Any additional information about your payment..."
                                rows={3}
                                className="p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer with Action Buttons */}
                <DialogFooter className="border-t pt-4 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={onSubmit}
                        className="px-6 bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Submit Receipt
                            </span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
