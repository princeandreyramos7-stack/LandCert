/**
 * Test Data for PaymentDetailsCard Component
 * 
 * Use this data to manually test the component in your browser
 * or integrate with your testing framework.
 */

// Complete payment with all fields
export const completePayment = {
    id: 123,
    request_id: 456,
    applicant_name: "Juan Dela Cruz",
    amount: 500.00,
    payment_method: "cash",
    receipt_number: "OR-2026-12345",
    payment_date: "2026-08-13",
    payment_status: "verified",
    verified_by: 2,
    verified_at: "2026-08-13T14:30:00.000000Z",
    created_at: "2026-08-13T14:25:00.000000Z",
    updated_at: "2026-08-13T14:30:00.000000Z",
    notes: "Physical OR verified. Payment received at Treasury Office.",
    receipt_file_path: "receipts/sample-receipt.jpg",
    verified_by_user: {
        id: 2,
        name: "Admin User",
        email: "admin@cpdo.gov.ph",
    },
    request: {
        id: 456,
        project_type: "Zoning Clearance",
        status: "payment_confirmed",
        payment_order_number: "PO-2026-456",
        applicant: {
            name: "Juan Dela Cruz"
        }
    },
    audit_trail: [
        {
            action: "Payment submitted",
            user: "Juan Dela Cruz",
            timestamp: "2026-08-13T14:25:00.000000Z",
            details: "Payment receipt uploaded by applicant",
        },
        {
            action: "Payment reviewed",
            user: "Admin User",
            timestamp: "2026-08-13T14:28:00.000000Z",
            details: "Initial verification check performed",
        },
        {
            action: "Payment verified",
            user: "Admin User",
            timestamp: "2026-08-13T14:30:00.000000Z",
            details: "Payment confirmed and approved",
        },
    ],
};

// Payment with bank transfer and reference number
export const bankTransferPayment = {
    id: 124,
    request_id: 457,
    applicant_name: "Maria Santos",
    amount: 750.00,
    payment_method: "bank_transfer",
    receipt_number: "OR-2026-12346",
    reference_number: "BT-987654321",
    payment_date: "2026-08-14",
    payment_status: "verified",
    receipt_file_path: "receipts/bank-receipt.pdf",
    verified_by: 3,
    verified_at: "2026-08-14T10:15:00.000000Z",
    created_at: "2026-08-14T09:30:00.000000Z",
    updated_at: "2026-08-14T10:15:00.000000Z",
    notes: "Bank transfer confirmed with reference number",
    verified_by_user: {
        id: 3,
        name: "Super Admin",
        email: "superadmin@cpdo.gov.ph",
    },
    request: {
        id: 457,
        project_type: "Building Permit",
        status: "payment_confirmed",
    },
};

// Payment with check
export const checkPayment = {
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
    verified_at: "2026-08-15T11:45:00.000000Z",
    created_at: "2026-08-15T11:30:00.000000Z",
    updated_at: "2026-08-15T11:45:00.000000Z",
    notes: "Check verified and cleared with bank",
    verified_by_user: {
        id: 2,
        name: "Admin User",
        email: "admin@cpdo.gov.ph",
    },
};

// Pending payment (not yet verified)
export const pendingPayment = {
    id: 126,
    request_id: 459,
    applicant_name: "Ana Garcia",
    amount: 300.00,
    payment_method: "gcash",
    receipt_number: "OR-2026-12348",
    reference_number: "GCASH-123456789",
    payment_date: "2026-08-16",
    payment_status: "pending",
    created_at: "2026-08-16T08:00:00.000000Z",
    updated_at: "2026-08-16T08:00:00.000000Z",
    notes: "Awaiting verification from admin",
    receipt_file_path: "receipts/gcash-receipt.jpg",
};

// Rejected payment
export const rejectedPayment = {
    id: 127,
    request_id: 460,
    applicant_name: "Carlos Lopez",
    amount: 450.00,
    payment_method: "cash",
    receipt_number: "OR-2026-12349",
    payment_date: "2026-08-17",
    payment_status: "rejected",
    rejection_reason: "OR number does not match Treasury Office records. Please provide the correct OR number or contact the Treasury Office for verification.",
    verified_by: 2,
    verified_at: "2026-08-17T15:20:00.000000Z",
    created_at: "2026-08-17T15:00:00.000000Z",
    updated_at: "2026-08-17T15:20:00.000000Z",
    verified_by_user: {
        id: 2,
        name: "Admin User",
        email: "admin@cpdo.gov.ph",
    },
};

// Minimal payment (only required fields)
export const minimalPayment = {
    id: 128,
    request_id: 461,
    amount: 250.00,
    payment_method: "cash",
    payment_date: "2026-08-18",
    payment_status: "pending",
    created_at: "2026-08-18T10:00:00.000000Z",
    updated_at: "2026-08-18T10:00:00.000000Z",
};

// Payment with PayMaya
export const paymayaPayment = {
    id: 129,
    request_id: 462,
    applicant_name: "Sofia Ramos",
    amount: 850.00,
    payment_method: "paymaya",
    receipt_number: "OR-2026-12350",
    reference_number: "PM-987654321",
    payment_date: "2026-08-18",
    payment_status: "verified",
    receipt_file_path: "receipts/paymaya-receipt.jpg",
    verified_by: 3,
    verified_at: "2026-08-18T16:30:00.000000Z",
    created_at: "2026-08-18T16:00:00.000000Z",
    updated_at: "2026-08-18T16:30:00.000000Z",
    notes: "Digital payment verified successfully",
    verified_by_user: {
        id: 3,
        name: "Super Admin",
        email: "superadmin@cpdo.gov.ph",
    },
    request: {
        id: 462,
        project_type: "Development Permit",
        status: "payment_confirmed",
        payment_order_number: "PO-2026-462",
    },
};

// Test cases for different scenarios
export const testScenarios = {
    "Complete Payment with All Fields": completePayment,
    "Bank Transfer with PDF Receipt": bankTransferPayment,
    "Check Payment": checkPayment,
    "Pending Payment (Unverified)": pendingPayment,
    "Rejected Payment": rejectedPayment,
    "Minimal Payment (Required Only)": minimalPayment,
    "Digital Payment (PayMaya)": paymayaPayment,
};

// Export all for convenience
export default {
    completePayment,
    bankTransferPayment,
    checkPayment,
    pendingPayment,
    rejectedPayment,
    minimalPayment,
    paymayaPayment,
    testScenarios,
};
