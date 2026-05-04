import React from "react";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { MoreVertical, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { getStatusColor, getStatusIcon, formatDate, formatCurrency } from "./utils";

export function PaymentTable({
    payments,
    selectedPayments,
    onSelectAll,
    onSelectPayment,
    onView,
    onVerify,
    onReject,
}) {
    const pendingPayments = payments.filter((p) => p.payment_status === "pending");
    const allPendingSelected =
        selectedPayments.length > 0 &&
        selectedPayments.length === pendingPayments.length;

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-3 font-semibold w-12">
                            <input
                                type="checkbox"
                                checked={allPendingSelected}
                                onChange={onSelectAll}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                        </th>
                        <th className="text-left p-3 font-semibold">ID</th>
                        <th className="text-left p-3 font-semibold">Applicant</th>
                        <th className="text-left p-3 font-semibold">Amount</th>
                        <th className="text-left p-3 font-semibold">Method</th>
                        <th className="text-left p-3 font-semibold">Date</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="p-8 text-center text-gray-500">
                                No payments found
                            </td>
                        </tr>
                    ) : (
                        payments.map((payment) => (
                            <tr
                                key={payment.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="p-3">
                                    {payment.payment_status === "pending" && (
                                        <input
                                            type="checkbox"
                                            checked={selectedPayments.includes(
                                                payment.id
                                            )}
                                            onChange={() =>
                                                onSelectPayment(payment.id)
                                            }
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                    )}
                                </td>
                                <td className="p-3 font-mono text-sm">
                                    #{payment.id}
                                </td>
                                <td className="p-3">
                                    <div>
                                        <p className="font-medium">
                                            {payment.applicant_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Request #{payment.request_id}
                                        </p>
                                    </div>
                                </td>
                                <td className="p-3 font-semibold">
                                    {formatCurrency(payment.amount)}
                                </td>
                                <td className="p-3 text-sm capitalize">
                                    {payment.payment_method?.replace("_", " ")}
                                </td>
                                <td className="p-3 text-sm">
                                    {formatDate(payment.payment_date)}
                                </td>
                                <td className="p-3">
                                    <Badge
                                        className={getStatusColor(
                                            payment.payment_status
                                        )}
                                    >
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(payment.payment_status)}
                                            {payment.payment_status
                                                ?.charAt(0)
                                                .toUpperCase() +
                                                payment.payment_status?.slice(1)}
                                        </span>
                                    </Badge>
                                </td>
                                <td className="p-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => onView(payment)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            {payment.payment_status === "pending" && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onVerify(payment)
                                                        }
                                                        className="text-emerald-600"
                                                    >
                                                        <ThumbsUp className="h-4 w-4 mr-2" />
                                                        Verify
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onReject(payment)
                                                        }
                                                        className="text-rose-600"
                                                    >
                                                        <ThumbsDown className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
