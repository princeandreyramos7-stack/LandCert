import React, { useState } from "react";
import { AdminSidebar } from "@/Components/admin-sidebar";
import { HeaderSlotProvider } from "@/Components/HeaderSlot";
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
import IdleLogout from "@/Components/IdleLogout";
import NotificationBell from "@/Components/NotificationBell";

/**
 * Shared layout for all admin pages.
 * Usage: <AdminLayout title="Requests">
 *          …content…
 *        </AdminLayout>
 */
// `breadcrumbs` is accepted but no longer rendered: the top bar shows the page
// name on its own. Dozens of pages still pass an ancestor trail, so the prop
// stays in the signature rather than being ripped out of every call site.
export default function AdminLayout({ title, breadcrumbs = [], children }) {
    // Where a page's live-refresh status lands: the top-right of the top bar,
    // beside the role badge. See @/Components/HeaderSlot.
    const [headerSlot, setHeaderSlot] = useState(null);

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                {/* Top bar */}
                <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-white border-b border-gray-100 shadow-sm ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 text-[#0d1f5c] hover:bg-[#0d1f5c]/5" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4 bg-gray-200"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="truncate text-sm font-bold text-[#0d1f5c]">
                                        {title}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-2 pr-4">
                        {/* Live-refresh status, portalled in by the page */}
                        <div ref={setHeaderSlot} className="flex items-center" />
                        <NotificationBell />
                        <div className="hidden sm:flex items-center gap-2">
                            <img
                                src="/images/Ilagan.png"
                                alt="CPDO LC"
                                className="w-6 h-6 object-contain"
                            />
                            <span className="text-[#0d1f5c] text-xs font-black tracking-wide">
                                CPDO LC
                            </span>
                            <span className="text-gray-300 text-xs">|</span>
                            <span className="text-gray-400 text-xs">City of Ilagan, Isabela</span>
                        </div>
                    </div>
                </header>

                {/* Page body */}
                <div
                    className="flex flex-1 flex-col min-h-screen"
                    style={{ background: "#f5f7ff" }}
                >
                    <div className="flex-1 p-4 sm:p-6">
                        <HeaderSlotProvider slot={headerSlot}>
                            {children}
                        </HeaderSlotProvider>
                    </div>
                </div>
            </SidebarInset>
            <Toaster />
            {/* Signs out after 10 minutes with no input. */}
            <IdleLogout />
        </SidebarProvider>
    );
}
