import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { Clock, ArrowRight, AlertCircle } from 'lucide-react';

export function PaymentsPendingWidget({ pendingPaymentsCount = 0 }) {
    return (
        <Card className="border-l-4 border-l-orange-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payments Pending</CardTitle>
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-600" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-3xl font-bold text-orange-700 flex items-center gap-2">
                            {pendingPaymentsCount}
                            {pendingPaymentsCount > 0 && (
                                <AlertCircle className="h-5 w-5 text-orange-500 animate-pulse" />
                            )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Awaiting confirmation
                        </p>
                    </div>
                    <Link href="/admin/payments/pending">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                            View All
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <div className="mt-3 h-1 bg-orange-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-pulse" 
                        style={{ width: pendingPaymentsCount > 0 ? '100%' : '0%' }}
                    ></div>
                </div>
            </CardContent>
        </Card>
    );
}
