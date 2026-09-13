import * as React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    FilePlus,
    FolderOpen,
    Bell,
    ChevronsLeft,
    ChevronsRight,
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
import { cn } from "@/lib/utils";

/* ── Nav items ──────────────────────────────────────────────────── */
const navItems = [
    { title: "Dashboard",       url: "/dashboard",       icon: LayoutDashboard },
    { title: "New Application", url: "/request",         icon: FilePlus },
    { title: "My Applications", url: "/my-applications", icon: FolderOpen },
    { title: "Notifications",   url: "/notifications",   icon: Bell, badge: "unreadNotifications" },
];

/**
 * The applicant's sidebar.
 *
 * It starts collapsed to a rail of icons (see lib/applicantSidebar.js), so
 * the rail is the state it is mostly seen in and is drawn as a thing in its
 * own right rather than the menu with its labels cut off: square buttons
 * centred on the rail, the current page in gold with a marker on the edge, a
 * count on the bell, the seal in a gold ring at the top and the applicant at
 * the foot, and a control to open the menu out without going to the top bar.
 * Every item names itself in a tooltip while the labels are hidden.
 */
export function AppSidebar({ ...props }) {
    const { auth, unreadNotifications = 0 } = usePage().props;
    const { state, isMobile, toggleSidebar } = useSidebar();
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

    const counts = { unreadNotifications };

    return (
        <Sidebar collapsible="icon" {...props}>

            {/* ── Header / Logo ──────────────────────────────────── */}
            <SidebarHeader className="border-b border-sidebar-border/70 px-3 py-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
                <Link
                    href="/dashboard"
                    aria-label="CPDO LC — Dashboard"
                    className="flex items-center gap-3 rounded-xl px-1.5 py-1 transition-colors hover:bg-white/5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                >
                    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-[0_0_0_2px_hsl(var(--sidebar-primary)/0.85),0_8px_18px_-8px_rgba(0,0,0,0.8)] transition-transform duration-200 hover:scale-105">
                        <img
                            src="/images/ilagan1.png"
                            alt="City of Ilagan"
                            className="h-full w-full object-cover p-0.5"
                        />
                    </div>
                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-sm font-black leading-tight tracking-wide text-sidebar-primary">
                            CPDO LC
                        </p>
                        <p className="truncate text-[10px] leading-tight tracking-widest text-sidebar-foreground/50">
                            City of Ilagan, Isabela
                        </p>
                    </div>
                </Link>
            </SidebarHeader>

            {/* ── Nav links ──────────────────────────────────────── */}
            <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:px-0">
                <SidebarGroup className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
                    <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/40">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:items-center">
                        {navItems.map((item) => {
                            const isActive = currentPath === item.url ||
                                (item.url !== "/dashboard" && currentPath.startsWith(item.url));
                            const count = item.badge ? Number(counts[item.badge] || 0) : 0;

                            return (
                                <SidebarMenuItem key={item.url} className="group-data-[collapsible=icon]:w-auto">
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}
                                        tooltip={count > 0 ? `${item.title} (${count} unread)` : item.title}
                                        className={cn(
                                            "relative h-10 rounded-xl px-3 font-semibold transition-all duration-200",
                                            "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center",
                                            isActive
                                                ? "bg-sidebar-primary text-[#0d1f5c] shadow-[0_10px_22px_-10px_hsl(var(--sidebar-primary))] hover:bg-sidebar-primary hover:text-[#0d1f5c] data-[active=true]:bg-sidebar-primary data-[active=true]:text-[#0d1f5c]"
                                                : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-white hover:translate-x-0.5 group-data-[collapsible=icon]:hover:translate-x-0 group-data-[collapsible=icon]:hover:scale-105"
                                        )}
                                    >
                                        <Link href={item.url} className="flex w-full items-center gap-3 group-data-[collapsible=icon]:justify-center">
                                            {/* The marker on the sidebar's edge for the current page. */}
                                            {isActive && (
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary group-data-[collapsible=icon]:-left-3"
                                                />
                                            )}
                                            <item.icon className="!size-5 shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                                            <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                                            {count > 0 && (
                                                <span
                                                    className={cn(
                                                        "ml-auto grid h-5 min-w-[1.25rem] place-items-center rounded-full px-1.5 text-[10px] font-black leading-none",
                                                        isActive ? "bg-[#0d1f5c] text-sidebar-primary" : "bg-sidebar-primary text-[#0d1f5c]",
                                                        // On the rail the count sits on the button's corner.
                                                        "group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:-right-1.5 group-data-[collapsible=icon]:-top-1.5 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:ring-2 group-data-[collapsible=icon]:ring-[hsl(var(--sidebar-background))]"
                                                    )}
                                                >
                                                    {count > 99 ? "99+" : count}
                                                </span>
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Footer / User ──────────────────────────────────── */}
            <SidebarFooter className="gap-2 border-t border-sidebar-border/70 px-2 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
                {/* Open the menu out, or fold it away, from the sidebar itself:
                    the trigger in the top bar is a long way from the rail on a
                    tall screen. Phones slide the whole sidebar in and out and
                    have no use for it. */}
                {!isMobile && (
                    <SidebarMenuButton
                        onClick={toggleSidebar}
                        tooltip={collapsed ? "Expand menu" : undefined}
                        aria-label={collapsed ? "Expand menu" : "Collapse menu"}
                        className="h-9 rounded-xl text-sidebar-foreground/60 transition-all duration-200 hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
                    >
                        {collapsed ? <ChevronsRight className="!size-4" /> : <ChevronsLeft className="!size-4" />}
                        <span className="text-xs font-semibold group-data-[collapsible=icon]:hidden">Collapse menu</span>
                    </SidebarMenuButton>
                )}

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
