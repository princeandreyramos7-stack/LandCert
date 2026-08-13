import { Head, usePage } from "@inertiajs/react";
import { AdminSidebar } from "@/Components/admin-sidebar";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import { MyApplicationsList } from "@/Components/MyApplications/MyApplicationsList";
import {
    SidebarInset, SidebarProvider, SidebarTrigger,
} from "@/Components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import { Toaster } from "@/Components/ui/toaster";

/* Admin variant of the layout (uses AdminSidebar) */
function AdminWrapper({ children }) {
    return (
        <SidebarProvider>
            <AdminSidebar/>
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-white border-b border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator orientation="vertical" className="mr-2 h-4"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-sm font-bold text-[#0d1f5c]">My Applications</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col min-h-screen overflow-x-hidden" style={{ background: "#f5f7ff" }}>
                    <div className="flex-1 p-4 sm:p-6">{children}</div>
                </div>
            </SidebarInset>
            <Toaster/>
        </SidebarProvider>
    );
}

export default function MyApplications({ applications = [] }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.roles?.some(r => r.name === "admin");

    if (isAdmin) {
        return (
            <>
                <Head title="My Applications"/>
                <AdminWrapper>
                    <MyApplicationsList applications={applications}/>
                </AdminWrapper>
            </>
        );
    }

    return (
        <>
            <Head title="My Applications — CPDO"/>
            <ApplicantLayout title="My Applications">
                <MyApplicationsList applications={applications}/>
            </ApplicantLayout>
        </>
    );
}
