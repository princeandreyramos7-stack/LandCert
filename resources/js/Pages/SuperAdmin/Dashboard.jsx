import { SuperAdminSidebar } from "@/Components/super-admin-sidebar";
import { Head } from "@inertiajs/react";
import { SuperAdminDashboard } from "@/Components/SuperAdmin/Dashboard";
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
} from "@/components/ui/sidebar";

export default function Page({
    applications = [],
    stats = {},
    analytics = null,
    evaluationDistribution = [],
    systemStats = {},
}) {
    return (
        <SidebarProvider>
            <Head title="Super Admin Dashboard" />
            <SuperAdminSidebar />
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
                                    <BreadcrumbPage className="text-gray-900 font-semibold">Super Admin Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-purple-50 to-indigo-50">
                    <SuperAdminDashboard
                        applications={applications}
                        stats={stats}
                        analytics={analytics}
                        systemStats={systemStats}
                    />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
