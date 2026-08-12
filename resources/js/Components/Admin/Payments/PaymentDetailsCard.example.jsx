/**
 * PaymentDetailsCard Usage Example
 * 
 * This file demonstrates how to use the PaymentDetailsCard component
 * in different scenarios.
 */

import React from "react";
import { PaymentDetailsCard } from "./PaymentDetailsCard";

// Example 1: Basic Payment with Verification Details
export function BasicPaymentExample() {
    const payment = {
        id: 123,
        request_id: 456,
        applicant_name: "Juan Dela Cruz",
        amount: 500.00,
        payment_method: "cash",
        receipt_number: "OR-2026-12345",
        payment_date: "2026-08-13",
        payment_status: "verified",
        verified_by: 2,
        verified_at: "2026-08-13 14:30:00",
        created_at: "2026-08-13 14:25:00",
        updated_at: "2026-08-13 14:30:00",
        notes: "Physical OR verified",
        verified_by_user: {
            id: 2,
            name: "Admin User",
            email: "admin@cpdo.gov",
        },
        request: {
            id: 456,
            project_type: "Zoning Clearance",
            status: "payment_confirmed",
            payment_order_number: "PO-2026-456",
        },
    };

    return <PaymentDetailsCard payment={payment} />;
}

// Example 2: Payment with Receipt Image
export function PaymentWithReceiptExample() {
    const payment = {
        id: 124,
        request_id: 457,
        applicant_name: "Maria Santos",
        amount: 750.00,
        payment_method: "bank_transfer",
        receipt_number: "OR-2026-12346",
        reference_number: "BT-987654321",
        payment_date: "2026-08-14",
        payment_status: "verified",
        receipt_file_path: "receipts/sample-receipt.jpg",
        verified_by: 3,
        verified_at: "2026-08-14 10:15:00",
        created_at: "2026-08-14 09:30:00",
        updated_at: "2026-08-14 10:15:00",
        notes: "Receipt image uploaded and verified",
        verified_by_user: {
            id: 3,
            name: "Super Admin",
            email: "superadmin@cpdo.gov",
        },
        request: {
            id: 457,
            project_type: "Building Permit",
            status: "payment_confirmed",
        },
    };

    return <PaymentDetailsCard payment={payment} />;
}

// Example 3: Payment with Check
export function PaymentWithCheckExample() {
    const payment = {
        id: 125,
        request_id: 458,
        applicant_name: "Pedro Reyes",
        amount: 1200.00,
        payment_method: "check",
        receipt_number: "OR-2026-12347",
        check_number: "CHK-001234",
        payment_date: "2026-08-15",
        payment_status: "verified",
        verified_by: 2,
        verified_at: "2026-08-15 11:45:00",
        created_at: "2026-08-15 11:30:00",
        updated_at: "2026-08-15 11:45:00",
        notes: "Check verified and cleared",
        verified_by_user: {
            id: 2,
            name: "Admin User",
            email: "admin@cpdo.gov",
        },
    };

    return <PaymentDetailsCard payment={payment} />;
}

// Example 4: Pending Payment (No Verification Yet)
export function PendingPaymentExample() {
    const payment = {
        id: 126,
        request_id: 459,
        applicant_name: "Ana Garcia",
        amount: 300.00,
        payment_method: "gcash",
        receipt_number: "OR-2026-12348",
        reference_number: "GCASH-123456789",
        payment_date: "2026-08-16",
        payment_status: "pending",
        created_at: "2026-08-16 08:00:00",
        updated_at: "2026-08-16 08:00:00",
        notes: "Awaiting verification",
    };

    return <PaymentDetailsCard payment={payment} />;
}

// Example 5: Rejected Payment
export function RejectedPaymentExample() {
    const payment = {
        id: 127,
        request_id: 460,
        applicant_name: "Carlos Lopez",
        amount: 450.00,
        payment_method: "cash",
        receipt_number: "OR-2026-12349",
        payment_date: "2026-08-17",
        payment_status: "rejected",
        rejection_reason: "OR number does not match Treasury records. Please provide correct OR number.",
        verified_by: 2,
        verified_at: "2026-08-17 15:20:00",
        created_at: "2026-08-17 15:00:00",
        updated_at: "2026-08-17 15:20:00",
        verified_by_user: {
            id: 2,
            name: "Admin User",
            email: "admin@cpdo.gov",
        },
    };

    return <PaymentDetailsCard payment={payment} />;
}

// Example 6: Payment with Full Audit Trail
export function PaymentWithAuditTrailExample() {
    const payment = {
        id: 128,
        request_id: 461,
        applicant_name: "Sofia Ramos",
        amount: 850.00,
        payment_method: "paymaya",
        receipt_number: "OR-2026-12350",
        reference_number: "PM-987654321",
        payment_date: "2026-08-18",
        payment_status: "verified",
        receipt_file_path: "receipts/sample-receipt-2.jpg",
        verified_by: 3,
        verified_at: "2026-08-18 16:30:00",
        created_at: "2026-08-18 16:00:00",
        updated_at: "2026-08-18 16:30:00",
        notes: "Digital receipt verified successfully",
        verified_by_user: {
            id: 3,
            name: "Super Admin",
            email: "superadmin@cpdo.gov",
        },
        audit_trail: [
            {
                action: "Payment submitted",
                user: "Sofia Ramos",
                timestamp: "2026-08-18 16:00:00",
                details: "Payment receipt uploaded",
            },
            {
                action: "Payment reviewed",
                user: "Admin User",
                timestamp: "2026-08-18 16:15:00",
                details: "Initial review completed",
            },
            {
                action: "Payment verified",
                user: "Super Admin",
                timestamp: "2026-08-18 16:30:00",
                details: "Payment confirmed and approved",
            },
        ],
        request: {
            id: 461,
            project_type: "Development Permit",
            status: "payment_confirmed",
            payment_order_number: "PO-2026-461",
        },
    };

    return <PaymentDetailsCard payment={payment} />;
}

// Example 7: Payment with PDF Receipt
export function PaymentWithPDFReceiptExample() {
    const payment = {
        id: 129,
        request_id: 462,
        applicant_name: "Roberto Cruz",
        amount: 1500.00,
        payment_method: "bank_transfer",
        receipt_number: "OR-2026-12351",
        reference_number: "BT-111222333",
        payment_date: "2026-08-19",
        payment_status: "verified",
        receipt_file_path: "receipts/sample-receipt.pdf",
        verified_by: 2,
        verified_at: "2026-08-19 13:00:00",
        created_at: "2026-08-19 12:30:00",
        updated_at: "2026-08-19 13:00:00",
        notes: "PDF receipt from bank verified",
        verified_by_user: {
            id: 2,
            name: "Admin User",
            email: "admin@cpdo.gov",
        },
    };

    return <PaymentDetailsCard payment={payment} />;
}

// Example 8: Minimal Payment (No Optional Fields)
export function MinimalPaymentExample() {
    const payment = {
        id: 130,
        request_id: 463,
        applicant_name: "Lisa Fernandez",
        amount: 250.00,
        payment_method: "cash",
        payment_date: "2026-08-20",
        payment_status: "pending",
        created_at: "2026-08-20 10:00:00",
        updated_at: "2026-08-20 10:00:00",
    };

    return <PaymentDetailsCard payment={payment} />;
}

// How to use in a real page:
/*
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";

export default function PaymentShow({ payment }) {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Payment Details</h1>
            <PaymentDetailsCard payment={payment} />
        </div>
    );
}
*/
