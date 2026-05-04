import { AdminSidebar } from "@/Components/admin-sidebar";
import { Head } from "@inertiajs/react";
import { AdminDashboard } from "@/Components/Admin/Dashboard";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/sidebar";

export default function Page({
    applications = [],
    stats = {},
    analytics = null,
}) {
    return (
        <SidebarProvider>
            <Head title="Dashboard" />
            <AdminSidebar />
            <SidebarInset>
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
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-purple-50 to-slate-50">
                    <AdminDashboard
                        applications={applications}
                        stats={stats}
                        analytics={analytics}
                    />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
