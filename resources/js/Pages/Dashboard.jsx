import { AppSidebar } from "@/Components/app-sidebar";
import { AdminSidebar } from "@/Components/admin-sidebar";
import { Dashboard } from "@/Components/Dashboard";
import { Head, usePage } from "@inertiajs/react";
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
import { Toaster } from "@/Components/ui/toaster";

export default function Page({ requests = [] }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.roles?.some(role => role.name === "admin");
    const Sidebar = isAdmin ? AdminSidebar : AppSidebar;

    return (
        <SidebarProvider>
            <Head title="Dashboard — CPDO"/>
            <Sidebar/>
            <SidebarInset>
                {/* Top bar */}
                <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-white border-b border-gray-100 shadow-sm transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 text-[#0d1f5c] hover:bg-[#0d1f5c]/5"/>
                        <Separator orientation="vertical" className="mr-2 h-4 bg-gray-200"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-sm font-bold text-[#0d1f5c]">
                                        Dashboard
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    {/* Right side — CPDO branding pill */}
                    <div className="ml-auto pr-4 hidden sm:flex items-center gap-2">
                        <img src="/images/Ilagan.png" alt="CPDO" className="w-6 h-6 object-contain"/>
                        <span className="text-[#0d1f5c] text-xs font-black tracking-wide">CPDO</span>
                        <span className="text-gray-300 text-xs">|</span>
                        <span className="text-gray-400 text-xs">City of Ilagan, Isabela</span>
                    </div>
                </header>

                {/* Content */}
                <div className="flex flex-1 flex-col min-h-screen overflow-x-hidden"
                    style={{ background: "#f5f7ff" }}>
                    <div className="flex-1 p-4 sm:p-6 overflow-x-hidden max-w-7xl w-full mx-auto">
                        <Dashboard requests={requests}/>
                    </div>
                </div>
            </SidebarInset>
            <Toaster/>
        </SidebarProvider>
    );
}
