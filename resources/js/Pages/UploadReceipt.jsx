import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppSidebar } from '@/Components/app-sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/Components/ui/breadcrumb';
import { Separator } from '@/Components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/Components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { 
    Upload, 
    FileText, 
    CheckCircle2, 
    Loader2,
    AlertCircle,
    DollarSign,
    X,
    Eye,
    Receipt
} from 'lucide-react';
import { Alert, AlertDescription } from '@/Components/ui/alert';

export default function UploadReceipt({ application, existingPayment }) {
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(application.report_amount || '');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Please upload only images (JPG, PNG) or PDF files');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large. File size must be less than 5MB');
            return;
        }

        setReceiptFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setReceiptPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Remove file
    const handleRemoveFile = () => {
        setReceiptFile(null);
        setReceiptPreview(null);
    };

    // Submit upload
    const handleSubmit = async () => {
        if (!receiptFile) {
            alert('Please select a receipt file to upload');
            return;
        }

        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append('receipt', receiptFile);
        formData.append('request_id', application.id);
        formData.append('amount', paymentAmount);
        formData.append('payment_method', 'cash');
        formData.append('payment_date', paymentDate);

        try {
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page.');
            }

            const response = await fetch('/payments', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData,
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Success
                alert(data.message || 'Receipt uploaded successfully! Payment is pending verification.');
                router.visit(route('my-applications'));
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert(error.message || 'Failed to upload receipt. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    // Get payment status badge
    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'Pending Verification', className: 'bg-amber-50 text-amber-700 border-amber-300' },
            verified: { label: 'Verified', className: 'bg-green-50 text-green-700 border-green-300' },
            rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-300' },
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <Badge className={`${config.className} border-2`}>
                {config.label}
            </Badge>
        );
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Head title="Upload Payment Receipt" />

                {/* Header */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Upload Payment Receipt</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                {/* Main Content - Responsive padding */}
                <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-3 sm:p-4">
                    {/* Application Info - Responsive */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                                    <span className="text-sm sm:text-base">
                                        Application {application.control_number}
                                        <span className="hidden sm:inline"> - Payment Receipt</span>
                                    </span>
                                </div>
                                {existingPayment && getPaymentStatusBadge(existingPayment.payment_status)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                <div>
                                    <p className="text-gray-500">Control Number</p>
                                    <p className="font-semibold">{application.control_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Applicant Name</p>
                                    <p className="font-semibold">{application.applicant_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Project Type</p>
                                    <p className="font-semibold">{application.project_type}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Application Status</p>
                                    <Badge variant="secondary">{application.status}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Warning if not approved */}
                    {application.status?.toLowerCase() !== 'approved' && (
                        <Alert className="border-amber-200 bg-amber-50">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                <strong>Payment Receipt Upload Not Available</strong>
                                <p className="mt-2 text-sm">
                                    You can only upload payment receipts after your application has been approved by the admin.
                                    Current status: <strong>{application.status}</strong>
                                </p>
                                <p className="mt-2 text-sm">
                                    Please wait for your application to be reviewed and approved before uploading your payment receipt.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Existing Payment Info */}
                    {existingPayment && (
                        <Alert className="border-blue-200 bg-blue-50">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                <strong>Payment Already Submitted</strong>
                                <div className="mt-2 space-y-1 text-sm">
                                    <p>• Receipt Number: <strong>{existingPayment.receipt_number}</strong></p>
                                    <p>• Amount: <strong>{formatCurrency(existingPayment.amount)}</strong></p>
                                    <p>• Status: <strong>{existingPayment.payment_status}</strong></p>
                                    <p>• Submitted: <strong>{new Date(existingPayment.created_at).toLocaleDateString()}</strong></p>
                                    {existingPayment.payment_status === 'rejected' && existingPayment.rejection_reason && (
                                        <p className="text-red-700">• Rejection Reason: <strong>{existingPayment.rejection_reason}</strong></p>
                                    )}
                                </div>
                                {existingPayment.payment_status === 'pending' && (
                                    <p className="mt-2 text-xs">Your payment receipt is pending verification by the admin. You will be notified once it's reviewed.</p>
                                )}
                                {existingPayment.payment_status === 'verified' && (
                                    <p className="mt-2 text-xs">Your payment has been verified! Your certificate will be prepared soon.</p>
                                )}
                                {existingPayment.payment_status === 'rejected' && (
                                    <p className="mt-2 text-xs">Your payment was rejected. You can upload a new receipt below.</p>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Upload Instructions */}
                    {application.status?.toLowerCase() === 'approved' && (!existingPayment || existingPayment.payment_status === 'rejected') && (
                        <Alert>
                            <DollarSign className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Instructions:</strong>
                                <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                                    <li>Upload a clear photo or scan of your official receipt</li>
                                    <li>Make sure the receipt number, date, and amount are visible</li>
                                    <li>Accepted formats: JPG, PNG, or PDF (max 5MB)</li>
                                    <li>Your payment will be verified by an admin within 1-2 business days</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Upload Form */}
                    {application.status?.toLowerCase() === 'approved' && (!existingPayment || existingPayment.payment_status === 'rejected') && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Payment Receipt</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Payment Amount */}
                                <div className="space-y-2">
                                    <Label htmlFor="amount" className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-blue-600" />
                                        Payment Amount <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="Enter amount paid"
                                        className="max-w-xs"
                                    />
                                    {application.report_amount && (
                                        <p className="text-sm text-gray-600">
                                            Recommended amount: {formatCurrency(application.report_amount)}
                                        </p>
                                    )}
                                </div>

                                {/* Payment Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="payment_date" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        Payment Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="payment_date"
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="max-w-xs"
                                    />
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Receipt className="h-4 w-4 text-blue-600" />
                                        Receipt File <span className="text-red-500">*</span>
                                    </Label>
                                    
                                    {!receiptFile ? (
                                        <label className="block">
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-24 sm:h-32 w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg text-blue-600 flex flex-col items-center justify-center gap-1.5 sm:gap-2"
                                                asChild
                                            >
                                                <span>
                                                    <Upload className="h-6 w-6 sm:h-8 sm:w-8" />
                                                    <span className="text-xs sm:text-sm font-semibold">Click to upload receipt</span>
                                                    <span className="text-[10px] sm:text-xs text-gray-500">JPG, PNG or PDF (max 5MB)</span>
                                                </span>
                                            </Button>
                                        </label>
                                    ) : (
                                        <div className="relative group">
                                            {receiptPreview && !receiptFile.type.includes('pdf') ? (
                                                <div className="relative">
                                                    <img
                                                        src={receiptPreview}
                                                        alt="Receipt preview"
                                                        className="w-full max-w-md h-64 object-contain rounded border border-gray-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveFile}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 sm:p-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                                                        title="Remove file"
                                                    >
                                                        <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative flex items-center gap-3 p-4 bg-gray-100 rounded border border-gray-300 max-w-md">
                                                    <FileText className="h-10 w-10 text-gray-400" />
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{receiptFile.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {(receiptFile.size / 1024).toFixed(2)} KB
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveFile}
                                                        className="bg-red-500 text-white rounded-full p-2 sm:p-1.5 hover:bg-red-600 transition-colors touch-manipulation"
                                                        title="Remove file"
                                                    >
                                                        <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Buttons - Responsive */}
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('my-applications'))}
                                        disabled={uploading}
                                        className="h-9 sm:h-10 px-3 sm:px-4 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={uploading || !receiptFile || !paymentAmount}
                                        className="h-9 sm:h-10 px-4 sm:px-6 bg-[#0d1f5c] hover:bg-[#1a3a8f] text-white gap-2 rounded-lg font-semibold min-w-[120px] sm:min-w-32 text-sm"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                                <span className="hidden sm:inline">Uploading...</span>
                                                <span className="inline sm:hidden">Upload...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="hidden sm:inline">Submit Receipt</span>
                                                <span className="inline sm:hidden">Submit</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* View Existing Receipt */}
                    {existingPayment && existingPayment.receipt_file_path && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Uploaded Receipt</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded border">
                                    <div className="flex items-center gap-3">
                                        <Receipt className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="font-semibold">Payment Receipt</p>
                                            <p className="text-sm text-gray-600">
                                                Uploaded on {new Date(existingPayment.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200"
                                        asChild
                                    >
                                        <a
                                            href={`/storage/${existingPayment.receipt_file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center"
                                            title="View Receipt"
                                        >
                                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
