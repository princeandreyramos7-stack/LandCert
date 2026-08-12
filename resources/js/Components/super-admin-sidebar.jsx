import * as React from "react";
import {
    LayoutDashboard,
    FileText,
    Users,
    Shield,
    ScrollText,
    FolderKanban,
    CreditCard,
    Award,
    Clock,
    History,
} from "lucide-react";

import { NavMain } from "@/Components/nav-main";
import { NavUser } from "@/Components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { usePage } from "@inertiajs/react";

export function SuperAdminSidebar({ ...props }) {
    const { auth } = usePage().props;

    const data = {
        user: {
            name: auth.user?.name || "Super Admin",
            email: auth.user?.email || "",
            avatar: "/avatars/shadcn.jpg",
        },
        navMain: [
            {
                title: "Super Admin Panel",
                url: "#",
                icon: Shield,
                isActive: true,
                items: [
                    {
                        title: "Dashboard",
                        url: route("super-admin.dashboard"),
                        icon: LayoutDashboard,
                    },
                    {
                        title: "Requests",
                        url: route("super-admin.requests"),
                        icon: FileText,
                    },
                ],
            },
            {
                title: "Payments",
                url: "#",
                icon: CreditCard,
                isActive: false,
                items: [
                    {
                        title: "Pending Payments",
                        url: route("super-admin.payments.pending"),
                        icon: Clock,
                    },
                    {
                        title: "Payment History",
                        url: route("super-admin.payments.history"),
                        icon: History,
                    },
                    {
                        title: "All Payments",
                        url: route("super-admin.payments"),
                        icon: CreditCard,
                    },
                ],
            },
            {
                title: "Management",
                url: "#",
                icon: FolderKanban,
                isActive: false,
                items: [
                    {
                        title: "Certificates",
                        url: route("super-admin.certificates.index"),
                        icon: Award,
                    },
                    {
                        title: "Users",
                        url: route("super-admin.users"),
                        icon: Users,
                    },
                    {
                        title: "Audit Logs",
                        url: route("super-admin.audit-logs"),
                        icon: ScrollText,
                    },
                ],
            },
        ],
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden flex-shrink-0">
                        <img
                            src="/images/Ilagan.png"
                            alt="CPDO Logo"
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-semibold">CPDO - Ilagan City</span>
                        <span className="text-xs text-muted-foreground">Super Administrator</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
