import { AppSidebar } from "@/components/app-sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Head, usePage } from "@inertiajs/react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { MyApplicationsList } from "@/Components/MyApplications/MyApplicationsList";

export default function MyApplications({ applications = [] }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.roles?.some((role) => role.name === "admin");
    const Sidebar = isAdmin ? AdminSidebar : AppSidebar;

    return (
        <SidebarProvider>
            <Head title="My Applications" />
            <Sidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>My Applications</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col min-h-screen bg-white overflow-x-hidden">
                    <div className="flex-1 p-6 overflow-x-hidden">
                        <MyApplicationsList applications={applications} />
                    </div>
                </div>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}
