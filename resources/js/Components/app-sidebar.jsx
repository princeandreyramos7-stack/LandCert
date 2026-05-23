import * as React from "react";
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
} from "lucide-react";
import { usePage } from "@inertiajs/react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";

const teams = [
    {
        name: "LandCert",
        logo: "/images/ilagan1.png",
        plan: "CPDO - Ilagan City",
    },
];

const navMain = [
    {
        title: "Main Menu",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
            {
                title: "Dashboard",
                url: "/dashboard",
            },
            {
                title: "Application",
                url: "/request",
            },
            {
                title: "My Applications",
                url: "/my-applications",
            },
            {
                title: "Notifications",
                url: "/notifications",
            },
        ],
    },
];

export function AppSidebar({ ...props }) {
    const { auth } = usePage().props;

    const user = {
        name: auth?.user?.name || "User",
        email: auth?.user?.email || "user@example.com",
        avatar: "/avatars/default.svg",
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
