import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { Receipt, ArrowRight, CheckCircle } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';

export function RecentPaymentsWidget({ recentPayments = [] }) {
    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const formatDate = (ds) => {
        if (!ds) return 'N/A';
        return new Date(ds).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-green-600"/>
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-[#0d1f5c]">Recent Payment Activity</CardTitle>
                        <p className="text-xs text-gray-400 mt-0.5">Last 5 verified payments</p>
                    </div>
                </div>
                <Link href="/admin/payments/history">
                    <Button variant="ghost" size="sm" className="text-[#0d1f5c] hover:text-[#d4a017] hover:bg-[#d4a017]/5 text-xs font-bold">
                        View All <ArrowRight className="ml-1 h-3.5 w-3.5"/>
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="pt-4">
                {recentPayments.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                            <Receipt className="h-6 w-6 text-gray-300"/>
                        </div>
                        <p className="text-sm text-gray-500">No recent payment activity</p>
                        <p className="text-xs text-gray-400 mt-1">Verified payments will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentPayments.map((payment) => (
                            <div key={payment.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#0d1f5c]/20 hover:bg-[#0d1f5c]/[0.02] transition-all group">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0"/>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <Badge variant="outline" className="border-green-200 text-green-700 font-mono text-[10px] px-1.5 py-0">
                                                {payment.receipt_number || 'N/A'}
                                            </Badge>
                                            <span className="text-sm font-bold text-[#0d1f5c]">{formatCurrency(payment.amount)}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 truncate">{payment.applicant_name || 'Unknown'}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {payment.verified_by_name || 'Unknown'} · {formatDate(payment.verified_at)}
                                        </p>
                                    </div>
                                </div>
                                <Link href={`/admin/payments/${payment.id}/show`}>
                                    <Button variant="ghost" size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0d1f5c] hover:text-[#d4a017] h-7 w-7 p-0">
                                        <ArrowRight className="h-3.5 w-3.5"/>
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
                {recentPayments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                        <span>Showing {recentPayments.length} recent payment{recentPayments.length !== 1 ? 's' : ''}</span>
                        <Link href="/admin/payments/history" className="text-[#0d1f5c] hover:text-[#d4a017] font-semibold transition-colors">
                            View history →
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
