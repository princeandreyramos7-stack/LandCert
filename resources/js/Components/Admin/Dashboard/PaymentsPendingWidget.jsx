import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { Clock, ArrowRight, AlertCircle } from 'lucide-react';

export function PaymentsPendingWidget({ pendingPaymentsCount = 0 }) {
    return (
        <Card className="border-l-4 border-l-[#d4a017] bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold text-[#0d1f5c]">Payments Pending</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-[#d4a017]/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-[#d4a017]" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-3xl font-black text-[#0d1f5c] flex items-center gap-2">
                            {pendingPaymentsCount}
                            {pendingPaymentsCount > 0 && (
                                <AlertCircle className="h-5 w-5 text-[#d4a017] animate-pulse" />
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
                    </div>
                    <Link href="/admin/payments/pending">
                        <Button variant="ghost" size="sm" className="text-[#0d1f5c] hover:text-[#d4a017] hover:bg-[#d4a017]/5">
                            View All
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <div className="mt-3 h-1 bg-[#0d1f5c]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#d4a017] rounded-full transition-all duration-500"
                        style={{ width: pendingPaymentsCount > 0 ? '100%' : '0%' }}/>
                </div>
            </CardContent>
        </Card>
    );
}
