import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { Receipt, ArrowRight, CheckCircle } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

/**
 * Recent Payments Activity Widget
 * Displays last 5 verified payment confirmations
 * Requirements: FR9.3
 */
export function RecentPaymentsWidget({ recentPayments = [] }) {
    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold">Recent Payment Activity</CardTitle>
                        <p className="text-xs text-gray-500 mt-1">Last 5 verified payments</p>
                    </div>
                </div>
                <Link href="/admin/payments/history">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="pt-6">
                {recentPayments.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="flex justify-center mb-3">
                            <div className="p-3 bg-gray-100 rounded-full">
                                <Receipt className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">No recent payment activity</p>
                        <p className="text-xs text-gray-400 mt-1">Verified payments will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentPayments.map((payment, index) => (
                            <div 
                                key={payment.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 hover:border-green-300 transition-all duration-200 hover:shadow-md group"
                            >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="mt-1 flex-shrink-0">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge 
                                                variant="outline" 
                                                className="bg-white border-green-300 text-green-700 font-mono text-xs"
                                            >
                                                {payment.receipt_number || 'N/A'}
                                            </Badge>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(payment.amount)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 truncate">
                                            {payment.applicant_name || 'Unknown Applicant'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                            <span>Verified by: {payment.verified_by_name || 'Unknown'}</span>
                                            <span className="text-gray-300">•</span>
                                            <span>{formatDate(payment.verified_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                <Link href={`/admin/payments/${payment.id}/show`}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-green-600 hover:text-green-700 hover:bg-green-100"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {recentPayments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Showing {recentPayments.length} recent {recentPayments.length === 1 ? 'payment' : 'payments'}</span>
                            <Link 
                                href="/admin/payments/history"
                                className="text-green-600 hover:text-green-700 font-medium hover:underline"
                            >
                                View payment history →
                            </Link>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
