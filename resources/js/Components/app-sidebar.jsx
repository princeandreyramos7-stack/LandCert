import * as React from "react";
import { Link, usePage } from "@inertiajs/react";
import { activeNavUrl } from "@/lib/sidebarActive";
import {
    LayoutDashboard,
    FilePlus,
    FolderOpen,
    Bell,
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

/* ── Nav items ──────────────────────────────────────────────────── */
const navItems = [
    { title: "Dashboard",       url: "/dashboard",       icon: LayoutDashboard },
    { title: "New Application", url: "/request",         icon: FilePlus },
    { title: "My Applications", url: "/my-applications", icon: FolderOpen, matches: ["/application-details", "/print-form", "/order-of-payment", "/receipt"] },
    { title: "Notifications",   url: "/notifications",   icon: Bell },
];

/* ── Main sidebar ───────────────────────────────────────────────── */
export function AppSidebar({ ...props }) {
    const { auth } = usePage().props;
    const { state, isMobile } = useSidebar();
    const collapsed = state === "collapsed";

    const user = {
        name:  auth?.user?.name  || "User",
        email: auth?.user?.email || "user@example.com",
        avatar_url: auth?.user?.avatar_url,
    };

    const initials = user.name
        .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

    // Detect active path
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    // One flat list here, wrapped so the shared matcher can read it.
    const activeUrl = activeNavUrl([{ items: navItems }], currentPath);

    return (
        <Sidebar collapsible="icon" {...props}>

            {/* ── Header / Logo ──────────────────────────────────── */}
            <SidebarHeader className={`border-b border-sidebar-border py-4 ${collapsed ? "px-0" : "px-3"}`}>
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border-2 border-sidebar-primary/60 bg-sidebar-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                            src="/images/ilagan1-192.png"
                            alt="Ilagan Logo"
                            className="w-full h-full object-cover p-0.5"
                        />
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-sidebar-primary font-black text-sm leading-tight tracking-wide truncate">
                                CPDO LC
                            </p>
                            <p className="text-sidebar-foreground/50 text-[10px] tracking-widest leading-tight truncate">
                                City of Ilagan, Isabela
                            </p>
                        </div>
                    )}
                </Link>
            </SidebarHeader>

            {/* ── Nav links ──────────────────────────────────────── */}
            <SidebarContent className={`py-3 ${collapsed ? "px-0" : "px-2"}`}>
                <SidebarGroup>
                    {!collapsed && (
                        <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] font-black tracking-[0.2em] uppercase mb-1 px-2">
                            Navigation
                        </SidebarGroupLabel>
                    )}
                    <SidebarMenu>
                        {navItems.map((item) => {
                            const isActive = item.url === activeUrl;
                            return (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}
                                        tooltip={item.title}
                                        className={`${collapsed ? "mx-auto justify-center" : ""} ${
                                            isActive
                                                ? "bg-sidebar-primary text-sidebar-primary-foreground font-bold hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-semibold"
                                        }`}>
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5 shrink-0"/>
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Footer / User ──────────────────────────────────── */}
            <SidebarFooter className={`border-t border-sidebar-border py-3 ${collapsed ? "px-0" : "px-2"}`}>
                <SidebarUserMenu
                    user={user}
                    initials={initials}
                    collapsed={collapsed}
                    profileHref="/profile"
                />
            </SidebarFooter>

            <SidebarRail/>
        </Sidebar>
    );
}
