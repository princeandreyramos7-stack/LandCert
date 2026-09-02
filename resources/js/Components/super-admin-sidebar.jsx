import * as React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    FileText,
    Users,
    ScrollText,
    CreditCard,
    Award,
    Clock,
    History,
    MessageSquare,
} from "lucide-react";
import SidebarUserMenu from "@/Components/SidebarUserMenu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarRail,
    useSidebar,
} from "@/Components/ui/sidebar";

const navGroups = [
    {
        label: "Administrator Panel",
        items: [
            {
                title: "Dashboard",
                url: "/super-admin/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: "Applications",
                url: "/super-admin/requests",
                icon: FileText,
            },
        ],
    },
    {
        label: "Processing",
        items: [
            {
                title: "Payments",
                url: "/super-admin/payments",
                icon: CreditCard,
            },
            {
                title: "Certificates",
                url: "/super-admin/certificates",
                icon: Award,
            },
        ],
    },
    {
        label: "Management",
        items: [
            { title: "Users", url: "/super-admin/users", icon: Users },
            {
                title: "Audit Logs",
                url: "/super-admin/audit-logs",
                icon: ScrollText,
            },
            {
                title: "SMS Broadcast",
                url: "/super-admin/sms",
                icon: MessageSquare,
            },
        ],
    },
];

export function SuperAdminSidebar({ ...props }) {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const collapsed = state === "collapsed";

    const user = {
        name: auth?.user?.name || "Zoning Administrator",
        email: auth?.user?.email || "superadmin@cpdo.gov.ph",
        avatar_url: auth?.user?.avatar_url,
    };

    const initials = user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    const rawPath =
        typeof window !== "undefined" ? window.location.pathname : "";

    // The document-generation pages live under /requests/{id}/... but belong to
    // the Certificates section, so highlight "Certificates" there, not "Applications".
    const currentPath =
        /\/(generate-certificate|generate-clearance|generate-order-of-payment)$/.test(rawPath)
            ? "/super-admin/certificates"
            : rawPath;

    return (
        <Sidebar collapsible="icon" {...props}>
            {/* Header */}
            <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
                <Link
                    href="/super-admin/dashboard"
                    className="flex items-center gap-3"
                >
                    <div className="w-9 h-9 rounded-full border-2 border-sidebar-primary/60 bg-sidebar-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                            src="/images/ilagan1.png"
                            alt="Ilagan Logo"
                            className="w-full h-full object-cover p-0.5"
                        />
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-sidebar-primary font-black text-sm leading-tight tracking-wide truncate">
                                Zoning Administrator
                            </p>
                            <p className="text-sidebar-foreground/50 text-[10px] tracking-widest leading-tight truncate">
                                City of Ilagan, Isabela
                            </p>
                        </div>
                    )}
                </Link>
            </SidebarHeader>

            {/* Nav */}
            <SidebarContent className="px-2 py-3 space-y-1">
                {navGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        {!collapsed && (
                            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] font-black tracking-[0.2em] uppercase mb-1 px-2">
                                {group.label}
                            </SidebarGroupLabel>
                        )}
                        <SidebarMenu>
                            {group.items.map((item) => {
                                const isActive =
                                    currentPath === item.url ||
                                    (currentPath.startsWith(item.url + "/") &&
                                        !group.items.some(
                                            (other) =>
                                                other.url !== item.url &&
                                                other.url.length >
                                                    item.url.length &&
                                                currentPath.startsWith(
                                                    other.url,
                                                ),
                                        ));
                                return (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={
                                                isActive
                                                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-bold hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-semibold"
                                            }
                                        >
                                            <Link
                                                href={item.url}
                                                className="flex items-center gap-3"
                                            >
                                                <item.icon className="w-5 h-5 shrink-0" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t border-sidebar-border px-2 py-3">
                <SidebarUserMenu
                    user={user}
                    initials={initials}
                    collapsed={collapsed}
                    profileHref="/super-admin/profile"
                    roleLabel="Zoning Administrator"
                />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
