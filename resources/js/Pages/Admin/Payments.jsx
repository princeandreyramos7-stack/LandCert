import { AdminSidebar } from "@/Components/admin-sidebar";
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function Payments({ auth, payments, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.payment_status || 'all');
    const [methodFilter, setMethodFilter] = useState(filters?.payment_method || 'all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [verifyForm, setVerifyForm] = useState({
        amount: '',
        receipt_number: '',
        payment_date: '',
        notes: '',
    });

    const [rejectForm, setRejectForm] = useState({
        rejection_reason: '',
    });

    const handleSearch = () => {
        router.get(route('admin.payments'), {
            search,
            payment_status: statusFilter === 'all' ? '' : statusFilter,
            payment_method: methodFilter === 'all' ? '' : methodFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);
    };

    const handleVerify = (payment) => {
        setSelectedPayment(payment);
        setVerifyForm({
            amount: payment.amount || '',
            receipt_number: payment.receipt_number || '',
            payment_date: payment.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            notes: '',
        });
        setShowVerifyModal(true);
    };

    const handleReject = (payment) => {
        setSelectedPayment(payment);
        setRejectForm({
            rejection_reason: '',
        });
        setShowRejectModal(true);
    };

    const submitVerify = () => {
        setProcessing(true);
        router.post(route('admin.payments.verify', selectedPayment.id), verifyForm, {
            onFinish: () => {
                setProcessing(false);
                setShowVerifyModal(false);
                setSelectedPayment(null);
            },
        });
    };

    const submitReject = () => {
        setProcessing(true);
        router.post(route('admin.payments.reject', selectedPayment.id), rejectForm, {
            onFinish: () => {
                setProcessing(false);
                setShowRejectModal(false);
                setSelectedPayment(null);
            },
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { variant: 'secondary', label: 'Pending Verification' },
            verified: { variant: 'success', label: 'Verified' },
            rejected: { variant: 'destructive', label: 'Rejected' },
        };
        const config = statusMap[status] || { variant: 'secondary', label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getMethodBadge = (method) => {
        const methodMap = {
            cash: { variant: 'default', label: 'Cash' },
            check: { variant: 'outline', label: 'Check' },
            bank_transfer: { variant: 'secondary', label: 'Bank Transfer' },
        };
        const config = methodMap[method] || { variant: 'outline', label: method };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <SidebarProvider>
            <Head title="Payment Management - Admin" />
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-gray-900 font-semibold">
                                        Payment Management
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Content */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6">
                            {flash?.success && (
                                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                    {flash.success}
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Physical Payment Records</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Search payments..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-64"
                                        />
                                        <Button onClick={handleSearch} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Select value={statusFilter} onValueChange={(value) => {
                                        setStatusFilter(value);
                                        router.get(route('admin.payments'), {
                                            search,
                                            payment_status: value === 'all' ? '' : value,
                                            payment_method: methodFilter === 'all' ? '' : methodFilter,
                                        }, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="verified">Verified</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={methodFilter} onValueChange={(value) => {
                                        setMethodFilter(value);
                                        router.get(route('admin.payments'), {
                                            search,
                                            payment_status: statusFilter === 'all' ? '' : statusFilter,
                                            payment_method: value === 'all' ? '' : value,
                                        }, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Filter by method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Methods</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="check">Check</SelectItem>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Receipt #</TableHead>
                                        <TableHead>Applicant</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Payment Method</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-gray-500">
                                                No payments found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        payments.data.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium">
                                                    {payment.receipt_number || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {payment.request?.applicant_name || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    ₱{payment.amount ? parseFloat(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}
                                                </TableCell>
                                                <TableCell>
                                                    {getMethodBadge(payment.payment_method)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(payment.payment_status)}
                                                </TableCell>
                                                <TableCell>
                                                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(payment)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(payment)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {payment.payment_status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleVerify(payment)}
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Verify
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleReject(payment)}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {payments.links && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-gray-500">
                                        Showing {payments.from} to {payments.to} of {payments.total} payments
                                    </div>
                                    <div className="flex gap-2">
                                        {payments.links.map((link, index) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={link.active ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>

            {/* Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">Receipt Number</Label>
                                    <p>{selectedPayment.receipt_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedPayment.payment_status)}</div>
                                </div>
                                <div>
                                    <Label className="font-semibold">Applicant Name</Label>
                                    <p>{selectedPayment.request?.applicant_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Project Type</Label>
                                    <p>{selectedPayment.request?.project_type || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Amount</Label>
                                    <p className="text-lg font-semibold">
                                        ₱{selectedPayment.amount ? parseFloat(selectedPayment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Payment Method</Label>
                                    <div className="mt-1">{getMethodBadge(selectedPayment.payment_method)}</div>
                                </div>
                                <div>
                                    <Label className="font-semibold">Payment Date</Label>
                                    <p>{selectedPayment.payment_date ? new Date(selectedPayment.payment_date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">Submitted Date</Label>
                                    <p>{selectedPayment.created_at ? new Date(selectedPayment.created_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                            {selectedPayment.verified_by && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3">Verification Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="font-semibold">Verified By</Label>
                                            <p>{selectedPayment.verified_by_user?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="font-semibold">Verified At</Label>
                                            <p>{selectedPayment.verified_at ? new Date(selectedPayment.verified_at).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selectedPayment.rejection_reason && (
                                <div className="border-t pt-4">
                                    <Label className="font-semibold">Rejection Reason</Label>
                                    <p className="text-red-600 mt-1">{selectedPayment.rejection_reason}</p>
                                </div>
                            )}
                            {selectedPayment.notes && (
                                <div className="border-t pt-4">
                                    <Label className="font-semibold">Notes</Label>
                                    <p className="mt-1">{selectedPayment.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Verify Modal */}
            <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify Payment</DialogTitle>
                        <DialogDescription>
                            Confirm that the physical payment has been received and verified.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="amount">Amount (₱) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={verifyForm.amount}
                                onChange={(e) => setVerifyForm({ ...verifyForm, amount: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <Label htmlFor="receipt_number">Receipt Number *</Label>
                            <Input
                                id="receipt_number"
                                value={verifyForm.receipt_number}
                                onChange={(e) => setVerifyForm({ ...verifyForm, receipt_number: e.target.value })}
                                placeholder="Enter receipt number"
                            />
                        </div>
                        <div>
                            <Label htmlFor="payment_date">Payment Date *</Label>
                            <Input
                                id="payment_date"
                                type="date"
                                value={verifyForm.payment_date}
                                onChange={(e) => setVerifyForm({ ...verifyForm, payment_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={verifyForm.notes}
                                onChange={(e) => setVerifyForm({ ...verifyForm, notes: e.target.value })}
                                placeholder="Any additional notes..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowVerifyModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={submitVerify}
                            disabled={
                                processing ||
                                !verifyForm.amount ||
                                !verifyForm.receipt_number ||
                                !verifyForm.payment_date
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {processing ? 'Processing...' : 'Verify Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Payment</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting this payment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="rejection_reason">Rejection Reason *</Label>
                            <Textarea
                                id="rejection_reason"
                                value={rejectForm.rejection_reason}
                                onChange={(e) => setRejectForm({ ...rejectForm, rejection_reason: e.target.value })}
                                placeholder="Explain why this payment is being rejected..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={submitReject}
                            disabled={processing || !rejectForm.rejection_reason}
                        >
                            {processing ? 'Processing...' : 'Reject Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
