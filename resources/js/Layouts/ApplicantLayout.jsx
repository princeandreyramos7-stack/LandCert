import { AppSidebar } from "@/Components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/Components/ui/sidebar";
import { Toaster } from "@/Components/ui/toaster";

/**
 * Shared layout for all applicant pages.
 * Usage: <ApplicantLayout title="My Applications">…content…</ApplicantLayout>
 */
export default function ApplicantLayout({ title, children }) {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                {/* Top bar */}
                <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-white border-b border-gray-100 shadow-sm ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 text-[#0d1f5c] hover:bg-[#0d1f5c]/5"/>
                        <Separator orientation="vertical" className="mr-2 h-4 bg-gray-200"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-sm font-bold text-[#0d1f5c]">
                                        {title}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="ml-auto pr-4 hidden sm:flex items-center gap-2">
                        <img src="/images/Ilagan.png" alt="CPDO" className="w-6 h-6 object-contain"/>
                        <span className="text-[#0d1f5c] text-xs font-black tracking-wide">CPDO</span>
                        <span className="text-gray-300 text-xs">|</span>
                        <span className="text-gray-400 text-xs">Ilagan City, Isabela</span>
                    </div>
                </header>

                {/* Page body */}
                <div className="flex flex-1 flex-col min-h-screen overflow-x-hidden" style={{ background: "#f5f7ff" }}>
                    <div className="flex-1 p-4 sm:p-6">
                        {children}
                    </div>
                </div>
            </SidebarInset>
            <Toaster/>
        </SidebarProvider>
    );
}
