import { AdminSidebar } from "@/Components/admin-sidebar";
import { SuperAdminSidebar } from "@/Components/super-admin-sidebar";
import { Head, router } from "@inertiajs/react";
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";
import { Button } from "@/Components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/sidebar";
import { ArrowLeft, FileText } from "lucide-react";

export default function PaymentShow({ auth, payment, userType = 'admin' }) {
    const isSuperAdmin = userType === 'super_admin';
    const Sidebar = isSuperAdmin ? SuperAdminSidebar : AdminSidebar;
    const historyRoute = isSuperAdmin ? 'super-admin.payments.history' : 'admin.payments.history';
    const dashboardRoute = isSuperAdmin ? 'super-admin.dashboard' : 'admin.dashboard';

    const handleBackToHistory = () => {
        router.visit(route(historyRoute));
    };

    return (
        <SidebarProvider>
            <Head title={`Payment Details #${payment?.id || ""}`} />
            <Sidebar />
            <SidebarInset>
                {/* Header with Breadcrumbs */}
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        href={route(dashboardRoute)}
                                        className="text-slate-600 hover:text-slate-900"
                                    >
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        href={route("admin.payments.pending")}
                                        className="text-slate-600 hover:text-slate-900"
                                    >
                                        Payments
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        href={route("admin.payments.history")}
                                        className="text-slate-600 hover:text-slate-900"
                                    >
                                        History
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-slate-900 font-semibold">
                                        Details
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-blue-50 to-slate-50">
                    {/* Page Header */}
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        Payment Details #{payment?.id || ""}
                                    </h1>
                                    <p className="text-sm text-slate-600 mt-1">
                                        View complete payment information and audit trail
                                    </p>
                                </div>
                            </div>

                            {/* Back Button */}
                            <Button
                                variant="outline"
                                onClick={handleBackToHistory}
                                className="border-slate-200 hover:bg-slate-50"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to History
                            </Button>
                        </div>
                    </div>

                    {/* Payment Details Card - Full Width Display */}
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                        <PaymentDetailsCard payment={payment} />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
