import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/Components/ui/table";
import { 
    FileText, 
    Search, 
    ArrowUpDown, 
    ArrowUp, 
    ArrowDown,
    DollarSign,
    Clock
} from "lucide-react";
import { formatCurrency, formatDate } from "./utils.jsx";

/**
 * PaymentsPendingTable Component
 * 
 * Displays list of approved requests awaiting payment with:
 * - Request ID, Applicant Name, Amount Due, Approval Date, Days Waiting
 * - Sorting functionality for date, amount, applicant name
 * - Search functionality for request ID and applicant name
 * - "Record Payment" button for each row
 * 
 * @param {Object} props
 * @param {Array} props.pendingPayments - Array of pending payment requests
 * @param {Function} props.onRecordPayment - Callback when "Record Payment" is clicked
 */
export function PaymentsPendingTable({ pendingPayments = [], onRecordPayment }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({
        key: "days_waiting",
        direction: "desc"
    });

    // Calculate days waiting for each request
    const calculateDaysWaiting = (approvedDate) => {
        if (!approvedDate) return 0;
        const approved = new Date(approvedDate);
        const today = new Date();
        const diffTime = Math.abs(today - approved);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Filter payments based on search term
    const filteredPayments = useMemo(() => {
        if (!searchTerm) return pendingPayments;

        const searchLower = searchTerm.toLowerCase();
        return pendingPayments.filter((payment) => {
            const requestId = payment.request_id?.toString() || "";
            const applicantName = payment.applicant_name?.toLowerCase() || "";
            
            return (
                requestId.includes(searchLower) ||
                applicantName.includes(searchLower)
            );
        });
    }, [pendingPayments, searchTerm]);

    // Sort filtered payments
    const sortedPayments = useMemo(() => {
        const sorted = [...filteredPayments];

        if (sortConfig.key) {
            sorted.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case "applicant_name":
                        aValue = a.applicant_name?.toLowerCase() || "";
                        bValue = b.applicant_name?.toLowerCase() || "";
                        break;
                    case "expected_amount":
                        aValue = parseFloat(a.expected_amount) || 0;
                        bValue = parseFloat(b.expected_amount) || 0;
                        break;
                    case "approved_at":
                        aValue = new Date(a.approved_at || 0);
                        bValue = new Date(b.approved_at || 0);
                        break;
                    case "days_waiting":
                        aValue = calculateDaysWaiting(a.approved_at);
                        bValue = calculateDaysWaiting(b.approved_at);
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }

        return sorted;
    }, [filteredPayments, sortConfig]);

    // Handle sort column click
    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            direction:
                prevConfig.key === key && prevConfig.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    };

    // Get sort icon for column
    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
        }
        return sortConfig.direction === "asc" ? (
            <ArrowUp className="h-4 w-4 ml-1 text-blue-600" />
        ) : (
            <ArrowDown className="h-4 w-4 ml-1 text-blue-600" />
        );
    };

    // Get badge color based on days waiting
    const getDaysWaitingBadge = (days) => {
        if (days >= 7) {
            return "bg-rose-100 text-rose-800 border-rose-300";
        } else if (days >= 3) {
            return "bg-amber-100 text-amber-800 border-amber-300";
        } else {
            return "bg-emerald-100 text-emerald-800 border-emerald-300";
        }
    };

    return (
        <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-xl font-bold text-[#0d1f5c]">
                        <div className="p-1.5 sm:p-2 rounded-xl flex-shrink-0" style={{background:"rgba(13,31,92,0.06)"}}>
                            <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-[#0d1f5c]" />
                        </div>
                        <span className="truncate">Payments Pending ({sortedPayments.length})</span>
                    </CardTitle>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                        <Input
                            placeholder="Search by Application ID or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-gray-200 focus:border-[#d4a017]"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {sortedPayments.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                                <DollarSign className="h-12 w-12 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            {searchTerm
                                ? "No matching requests found"
                                : "No pending payments"}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm
                                ? "Try adjusting your search criteria"
                                : "All approved requests have been paid"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-24">
                                        <div className="flex items-center">
                                            Application ID
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <button
                                            onClick={() => handleSort("applicant_name")}
                                            className="flex items-center hover:text-blue-600 transition-colors"
                                        >
                                            Applicant Name
                                            {getSortIcon("applicant_name")}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center">
                                            Project Type
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <button
                                            onClick={() => handleSort("expected_amount")}
                                            className="flex items-center ml-auto hover:text-blue-600 transition-colors"
                                        >
                                            Amount Due
                                            {getSortIcon("expected_amount")}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button
                                            onClick={() => handleSort("approved_at")}
                                            className="flex items-center hover:text-blue-600 transition-colors"
                                        >
                                            Approval Date
                                            {getSortIcon("approved_at")}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button
                                            onClick={() => handleSort("days_waiting")}
                                            className="flex items-center hover:text-blue-600 transition-colors"
                                        >
                                            Days Waiting
                                            {getSortIcon("days_waiting")}
                                        </button>
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedPayments.map((payment) => {
                                    const daysWaiting = calculateDaysWaiting(
                                        payment.approved_at
                                    );

                                    return (
                                        <TableRow
                                            key={payment.request_id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="font-mono text-sm font-medium">
                                                #{payment.request_id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-gray-900">
                                                    {payment.applicant_name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-600">
                                                    {payment.project_type || "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-semibold text-gray-900">
                                                    {formatCurrency(payment.expected_amount)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-600">
                                                    {formatDate(payment.approved_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={getDaysWaitingBadge(
                                                        daysWaiting
                                                    )}
                                                >
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {daysWaiting} {daysWaiting === 1 ? "day" : "days"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    onClick={() =>
                                                        onRecordPayment(payment)
                                                    }
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                    Record Payment
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
