import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";
import {
    CreditCard, Clock, CheckCircle2, XCircle, Search, Eye,
    DollarSign, AlertCircle, TrendingUp, RefreshCw,
} from "lucide-react";

const statusStyle = {
    verified: "bg-green-100 text-green-800 border-green-200",
    pending:  "bg-yellow-100 text-yellow-800 border-yellow-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
};
const statusIcon = {
    verified: <CheckCircle2 className="h-3 w-3 mr-1 inline" />,
    pending:  <Clock className="h-3 w-3 mr-1 inline" />,
    rejected: <XCircle className="h-3 w-3 mr-1 inline" />,
};
const fmt = (n) => Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

export default function Payments({ payments = {}, filters = {}, stats = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch]             = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.payment_status || "all");
    const [methodFilter, setMethodFilter] = useState(filters.payment_method || "all");
    const [selected, setSelected]         = useState(null);
    const [showDetails, setShowDetails]   = useState(false);
    const [showVerify, setShowVerify]     = useState(false);
    const [showReject, setShowReject]     = useState(false);
    const [processing, setProcessing]     = useState(false);
    const [verifyForm, setVerifyForm]     = useState({ amount: "", receipt_number: "", payment_date: "", notes: "" });
    const [rejectForm, setRejectForm]     = useState({ rejection_reason: "" });

    const paymentsData = payments.data || [];

    const applyFilters = (overrides = {}) => {
        router.get(route("super-admin.payments"), {
            search,
            payment_status: statusFilter === "all" ? "" : statusFilter,
            payment_method: methodFilter === "all" ? "" : methodFilter,
            ...overrides,
        }, { preserveState: true, preserveScroll: true });
    };

    const openVerify = (p) => {
        setSelected(p);
        setVerifyForm({
            amount: p.amount || "",
            receipt_number: p.receipt_number || "",
            payment_date: p.payment_date ? new Date(p.payment_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            notes: "",
        });
        setShowVerify(true);
    };

    const openReject = (p) => { setSelected(p); setRejectForm({ rejection_reason: "" }); setShowReject(true); };

    const submitVerify = () => {
        setProcessing(true);
        router.post(route("super-admin.payments.verify", selected.id), verifyForm, {
            onFinish: () => { setProcessing(false); setShowVerify(false); setSelected(null); },
        });
    };

    const submitReject = () => {
        setProcessing(true);
        router.post(route("super-admin.payments.reject", selected.id), rejectForm, {
            onFinish: () => { setProcessing(false); setShowReject(false); setSelected(null); },
        });
    };

    return (
        <>
            <Head title="All Payments — Zoning Administrator" />
            <SuperAdminLayout title="All Payments" breadcrumbs={[{ label: "Dashboard", href: "/super-admin/dashboard" }]}>

                {/* Page header card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl" style={{background:"rgba(13,31,92,0.06)"}}>
                                <CreditCard className="h-6 w-6 text-[#0d1f5c]"/>
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-[#0d1f5c]">All Payments</h1>
                                <p className="text-xs text-gray-400 mt-0.5">Full payment records across the system</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.reload()} className="gap-2 border-gray-200 text-[#0d1f5c] hover:border-[#d4a017] hover:text-[#d4a017]">
                            <RefreshCw className="h-4 w-4"/> Refresh
                        </Button>
                    </div>
                </div>

                {flash?.success && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />{flash.success}
                        </div>
                    )}

                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total Revenue", value: `₱${fmt(stats.total_revenue)}`, sub: `${stats.verified || 0} verified`, icon: DollarSign },
                            { label: "This Month",    value: `₱${fmt(stats.this_month)}`,    sub: `₱${fmt(stats.last_month)} last month`, icon: TrendingUp },
                            { label: "Pending",       value: stats.pending || 0,             sub: `₱${fmt(stats.pending_amount)} held`, icon: Clock },
                            { label: "Denied",      value: stats.rejected || 0,            sub: `${stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(1) : 0}% rate`, icon: AlertCircle },
                        ].map(({ label, value, sub, icon: Icon }) => (
                            <Card key={label} className="border border-slate-200 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
                                            <p className="text-xl font-bold text-slate-900">{value}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                                        </div>
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <Icon className="h-5 w-5 text-slate-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Status tabs */}
                    <div className="flex gap-2 flex-wrap my-4">
                        {[
                            { key: "all",      label: `All (${stats.total || 0})` },
                            { key: "pending",  label: `Pending (${stats.pending || 0})` },
                            { key: "verified", label: `Verified (${stats.verified || 0})` },
                            { key: "rejected", label: `Denied (${stats.rejected || 0})` },
                        ].map(({ key, label }) => (
                            <button key={key}
                                onClick={() => { setStatusFilter(key); applyFilters({ payment_status: key === "all" ? "" : key }); }}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                    statusFilter === key
                                        ? "bg-white text-[#0d1f5c] border-[#0d1f5c] ring-1 ring-[#0d1f5c] font-bold"
                                        : "bg-white text-slate-500 border-slate-300 hover:border-[#0d1f5c] hover:text-[#0d1f5c]"
                                }`}
                            >{label}</button>
                        ))}
                    </div>

                    {/* Main table */}
                    <Card className="border border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-200 p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-slate-500" />
                                    Payment Records
                                    <span className="text-slate-400 font-normal text-sm">({payments.total || 0})</span>
                                </CardTitle>
                                <div className="flex gap-2 flex-wrap">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <Input
                                            placeholder="Search OR# or applicant..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                                            className="pl-9 w-52 h-9"
                                        />
                                    </div>
                                    <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); applyFilters({ payment_method: v === "all" ? "" : v }); }}>
                                        <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Method" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Methods</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button size="sm" onClick={() => applyFilters()} className="h-9 bg-white hover:bg-gray-50 text-[#0d1f5c] border border-gray-200 hover:border-[#0d1f5c]">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            {["OR #", "Applicant", "Locational Clearance", "Amount", "Date", "Verified By", "Status", "Actions"].map(h => (
                                                <th key={h} className={`px-4 py-3 font-semibold text-slate-600 ${h === "Amount" ? "text-right" : h === "Actions" ? "text-center" : "text-left"}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentsData.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="py-16 text-center text-slate-400">
                                                    <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                                    <p className="font-medium">No payments found</p>
                                                </td>
                                            </tr>
                                        ) : paymentsData.map((payment, i) => (
                                            <tr key={payment.id}
                                                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 1 ? "bg-slate-50/40" : "bg-white"}`}
                                            >
                                                <td className="px-4 py-3 font-mono font-semibold text-blue-600 text-sm">
                                                    {payment.receipt_number || "—"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-800">{payment.applicant_name || "—"}</div>
                                                    <div className="text-xs text-slate-400">{payment.application_number || `#${payment.request_id}`}</div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 text-sm">
                                                    {payment.project_type || <span className="text-slate-300 italic">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-slate-800">₱{fmt(payment.amount)}</td>
                                                <td className="px-4 py-3 text-slate-600 text-sm">
                                                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 text-sm">
                                                    {payment.verified_by_name || payment.verified_by_user?.name || <span className="text-slate-300">—</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge className={`text-xs border ${statusStyle[payment.payment_status] || "bg-slate-100 text-slate-600"}`}>
                                                        {statusIcon[payment.payment_status]}
                                                        {payment.payment_status ? payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1) : "—"}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button variant="ghost" size="sm" onClick={() => { setSelected(payment); setShowDetails(true); }}
                                                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800" title="View details">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {payment.payment_status === "pending" && (
                                                            <>
                                                                <Button size="sm" onClick={() => openVerify(payment)}
                                                                    className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white text-xs">
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />Verify
                                                                </Button>
                                                                <Button variant="destructive" size="sm" onClick={() => openReject(payment)}
                                                                    className="h-7 px-2 text-xs">
                                                                    <XCircle className="h-3 w-3 mr-1" />Deny
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {payments.links && payments.total > 0 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                                    <p className="text-sm text-slate-500">
                                        Showing <b>{payments.from}</b>–<b>{payments.to}</b> of <b>{payments.total}</b>
                                    </p>
                                    <div className="flex gap-1">
                                        {payments.links.map((link, idx) => (
                                            <Button key={idx} variant={link.active ? "default" : "outline"} size="sm"
                                                onClick={() => link.url && router.get(link.url)} disabled={!link.url}
                                                className={`h-8 min-w-[32px] text-xs ${link.active ? "bg-white text-[#0d1f5c] border-[#0d1f5c] ring-1 ring-[#0d1f5c] font-bold hover:bg-gray-50" : ""}`}>
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

            {/* Details Modal */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-slate-600" />Payment Details
                        </DialogTitle>
                    </DialogHeader>
                    {selected && <PaymentDetailsCard payment={selected} />}
                </DialogContent>
            </Dialog>

            {/* Verify Modal */}
            <Dialog open={showVerify} onOpenChange={setShowVerify}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-5 w-5" />Verify Payment
                        </DialogTitle>
                        <DialogDescription>Confirm payment details before marking as verified.</DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm border border-slate-200 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Applicant</span>
                                <span className="font-medium">{selected.applicant_name || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Application No.</span>
                                <span className="font-medium">{selected.application_number || `#${selected.request_id}`}</span>
                            </div>
                        </div>
                    )}
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="v-amount">Amount (₱) <span className="text-red-500">*</span></Label>
                                <Input id="v-amount" type="number" step="0.01" value={verifyForm.amount}
                                    onChange={(e) => setVerifyForm({ ...verifyForm, amount: e.target.value })} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="v-date">Payment Date <span className="text-red-500">*</span></Label>
                                <Input id="v-date" type="date" value={verifyForm.payment_date}
                                    onChange={(e) => setVerifyForm({ ...verifyForm, payment_date: e.target.value })} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="v-or">OR Number <span className="text-red-500">*</span></Label>
                            <Input id="v-or" value={verifyForm.receipt_number}
                                onChange={(e) => setVerifyForm({ ...verifyForm, receipt_number: e.target.value })}
                                placeholder="Official Receipt number" className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="v-notes">Notes</Label>
                            <Textarea id="v-notes" value={verifyForm.notes}
                                onChange={(e) => setVerifyForm({ ...verifyForm, notes: e.target.value })}
                                rows={2} className="mt-1 resize-none" />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setShowVerify(false)} disabled={processing}>Cancel</Button>
                        <Button onClick={submitVerify}
                            disabled={processing || !verifyForm.amount || !verifyForm.receipt_number || !verifyForm.payment_date}
                            className="bg-green-600 hover:bg-green-700 text-white">
                            {processing ? "Processing..." : "Verify Payment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Deny Modal */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-700">
                            <XCircle className="h-5 w-5" />Deny Payment
                        </DialogTitle>
                        <DialogDescription>Provide a reason for denying this payment.</DialogDescription>
                    </DialogHeader>
                    <div>
                        <Label htmlFor="r-reason">Denial Reason <span className="text-red-500">*</span></Label>
                        <Textarea id="r-reason" value={rejectForm.rejection_reason}
                            onChange={(e) => setRejectForm({ rejection_reason: e.target.value })}
                            placeholder="Explain why this payment is being denied..."
                            rows={4} className="mt-1 resize-none" />
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setShowReject(false)} disabled={processing}>Cancel</Button>
                        <Button variant="destructive" onClick={submitReject}
                            disabled={processing || !rejectForm.rejection_reason.trim()}>
                            {processing ? "Processing..." : "Deny Payment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SuperAdminLayout>
        </>
    );
}
