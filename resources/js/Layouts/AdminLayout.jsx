import React from "react";
import { AdminSidebar } from "@/Components/admin-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/Components/ui/sidebar";
import { Toaster } from "@/Components/ui/toaster";
import { Link } from "@inertiajs/react";

/**
 * Shared layout for all admin pages.
 * Usage: <AdminLayout title="Requests" breadcrumbs={[{label:"Dashboard",href:"/admin/dashboard"}]}>
 *          …content…
 *        </AdminLayout>
 */
export default function AdminLayout({ title, breadcrumbs = [], children }) {
    return (
        <SidebarProvider>
            <AdminSidebar/>
            <SidebarInset>
                {/* Top bar */}
                <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-white border-b border-gray-100 shadow-sm ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 text-[#0d1f5c] hover:bg-[#0d1f5c]/5"/>
                        <Separator orientation="vertical" className="mr-2 h-4 bg-gray-200"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((crumb, i) => (
                                    <React.Fragment key={i}>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink asChild>
                                                <Link href={crumb.href} className="text-gray-500 hover:text-[#0d1f5c] text-sm transition-colors">
                                                    {crumb.label}
                                                </Link>
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator/>
                                    </React.Fragment>
                                ))}
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-sm font-bold text-[#0d1f5c]">
                                        {title}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="ml-auto pr-4 hidden sm:flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d1f5c]/5 border border-[#0d1f5c]/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#d4a017] animate-pulse"/>
                            <span className="text-[#0d1f5c] text-xs font-black tracking-wide">CPDO L.C Zoning Officer</span>
                        </div>
                    </div>
                </header>

                {/* Page body */}
                <div className="flex flex-1 flex-col min-h-screen" style={{ background: "#f5f7ff" }}>
                    <div className="flex-1 p-4 sm:p-6">
                        {children}
                    </div>
                </div>
            </SidebarInset>
            <Toaster/>
        </SidebarProvider>
    );
}
