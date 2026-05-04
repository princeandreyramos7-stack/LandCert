import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Building2,
    Plus,
    Eye,
    Award,
    FileText,
    Clock,
    DollarSign,
    Activity,
    Download,
} from "lucide-react";

export function EmptyState() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
            {/* Welcome Section */}
            <div className="text-center mb-12">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full blur-3xl opacity-20"></div>
                    <div className="relative rounded-full bg-gradient-to-br from-blue-50 to-emerald-50 p-12 shadow-2xl border border-blue-100">
                        <Building2 className="h-20 w-20 text-blue-600 mx-auto" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to CPDO System
                </h1>
                <p className="text-xl text-gray-600 mb-2">
                    Your Land Certification Dashboard
                </p>
                <p className="text-base text-gray-500 max-w-2xl mx-auto mb-8">
                    Submit and track your land certification requests with
                    ease. Get started by creating your first application
                    below.
                </p>
            </div>

            {/* Quick Start Actions */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-4xl mb-12">
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-dashed border-blue-200 hover:border-blue-400">
                    <CardContent className="p-6 text-center">
                        <div className="rounded-full bg-blue-100 p-4 w-16 h-16 mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                            <Plus className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                            New Application
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Start your land certification process
                        </p>
                        <Button
                            asChild
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                            <a href="/request">
                                <FileText className="h-4 w-4 mr-2" />
                                Submit Request
                            </a>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                        <div className="rounded-full bg-emerald-100 p-4 w-16 h-16 mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                            <Eye className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Track Progress
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Monitor your application status
                        </p>
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled
                        >
                            <Activity className="h-4 w-4 mr-2" />
                            No Requests Yet
                        </Button>
                    </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                        <div className="rounded-full bg-purple-100 p-4 w-16 h-16 mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                            <Award className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Get Certificate
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Download your certificates
                        </p>
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled
                        >
                            <Download className="h-4 w-4 mr-2" />
                            No Certificates
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Process Steps */}
            <div className="w-full max-w-4xl">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    How It Works
                </h2>
                <div className="grid gap-6 md:grid-cols-4">
                    {[
                        {
                            step: 1,
                            title: "Submit",
                            desc: "Fill out your application",
                            icon: FileText,
                            color: "blue",
                        },
                        {
                            step: 2,
                            title: "Review",
                            desc: "We process your request",
                            icon: Clock,
                            color: "amber",
                        },
                        {
                            step: 3,
                            title: "Payment",
                            desc: "Complete the payment",
                            icon: DollarSign,
                            color: "emerald",
                        },
                        {
                            step: 4,
                            title: "Certificate",
                            desc: "Download your certificate",
                            icon: Award,
                            color: "purple",
                        },
                    ].map((item, index) => (
                        <div key={index} className="text-center">
                            <div
                                className={`rounded-full bg-${item.color}-100 p-4 w-16 h-16 mx-auto mb-4`}
                            >
                                <item.icon
                                    className={`h-8 w-8 text-${item.color}-600`}
                                />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                                {item.step}. {item.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
