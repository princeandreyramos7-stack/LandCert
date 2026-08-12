import { CheckCircle, XCircle, Clock } from "lucide-react";

/**
 * Format a date string to a more readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Format a currency value to Philippine Peso
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    if (amount === null || amount === undefined) return "₱0.00";
    
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(amount);
}

/**
 * Get status color classes based on payment status
 * @param {string} status - Payment status (verified, rejected, pending)
 * @returns {string} Tailwind CSS classes for status badge
 */
export function getStatusColor(status) {
    switch (status) {
        case "verified":
            return "bg-green-100 text-green-800 border-green-300";
        case "rejected":
            return "bg-red-100 text-red-800 border-red-300";
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-300";
        default:
            return "bg-blue-100 text-blue-800 border-blue-300";
    }
}

/**
 * Get status icon component based on payment status
 * @param {string} status - Payment status (verified, rejected, pending)
 * @returns {Object} Icon configuration with component and className
 */
export function getStatusIcon(status) {
    switch (status) {
        case "verified":
            return { Icon: CheckCircle, className: "w-4 h-4 text-green-600" };
        case "rejected":
            return { Icon: XCircle, className: "w-4 h-4 text-red-600" };
        case "pending":
            return { Icon: Clock, className: "w-4 h-4 text-yellow-600" };
        default:
            return { Icon: Clock, className: "w-4 h-4 text-blue-600" };
    }
}
