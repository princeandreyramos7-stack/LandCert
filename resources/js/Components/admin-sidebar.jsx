import * as React from "react";
import {
    Shield,
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    CheckSquare,
    Map,
} from "lucide-react";
import { usePage } from "@inertiajs/react";

import { NavMain } from "@/Components/nav-main";
import { NavUser } from "@/Components/nav-user";
import { TeamSwitcher } from "@/Components/team-switcher";
import { NotificationBell } from "@/Components/NotificationBell";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/Components/ui/sidebar";

const teams = [
    {
        name: "CPDO - Ilagan City",
        logo: "/images/ilagan1.png",
        plan: "Administrator",
    },
];

const adminNavMain = [
    {
        title: "Admin Panel",
        url: "#",
        icon: Shield,
        isActive: true,
        items: [
            {
                title: "Dashboard",
                url: "/admin/dashboard",
            },
            {
                title: "Requests",
                url: "/admin/requests",
            },
        ],
    },
    {
        title: "GIS & Zoning",
        url: "#",
        icon: Map,
        isActive: false,
        items: [
            {
                title: "Zoning Map",
                url: "/admin/zoning-map",
            },
            {
                title: "Add Property",
                url: "/admin/properties/add",
            },
        ],
    },
    {
        title: "Management",
        url: "#",
        icon: Settings,
        isActive: false,
        items: [
            {
                title: "Users",
                url: "/admin/users",
            },
            {
                title: "Audit Logs",
                url: "/admin/audit-logs",
            },
        ],
    },
];

export function AdminSidebar({ ...props }) {
    const { auth } = usePage().props;

    const user = {
        name: auth?.user?.name || "Admin",
        email: auth?.user?.email || "admin@example.com",
        avatar: "/avatars/default.svg",
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={adminNavMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
