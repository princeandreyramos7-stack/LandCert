import * as React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    FilePlus,
    FolderOpen,
    Bell,
    User,
    LogOut,
    ChevronsUpDown,
} from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

/* ── Nav items ──────────────────────────────────────────────────── */
const navItems = [
    { title: "Dashboard",       url: "/dashboard",       icon: LayoutDashboard },
    { title: "New Application", url: "/request",         icon: FilePlus },
    { title: "My Applications", url: "/my-applications", icon: FolderOpen },
    { title: "Notifications",   url: "/notifications",   icon: Bell },
    { title: "Profile",         url: "/profile",         icon: User },
];

/* ── Main sidebar ───────────────────────────────────────────────── */
export function AppSidebar({ ...props }) {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const collapsed = state === "collapsed";

    const user = {
        name:  auth?.user?.name  || "User",
        email: auth?.user?.email || "user@example.com",
    };

    const initials = user.name
        .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

    // Detect active path
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

    return (
        <Sidebar collapsible="icon" {...props}>

            {/* ── Header / Logo ──────────────────────────────────── */}
            <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border-2 border-sidebar-primary/60 bg-sidebar-primary/10 flex items-center justify-center shrink-0">
                        <img src="/images/Ilagan.png" alt="CPDO" className="w-6 h-6 object-contain"/>
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-sidebar-primary font-black text-sm leading-tight tracking-wide truncate">
                                CPDO LandCert
                            </p>
                            <p className="text-sidebar-foreground/50 text-[10px] tracking-widest leading-tight truncate">
                                Ilagan City, Isabela
                            </p>
                        </div>
                    )}
                </Link>
            </SidebarHeader>

            {/* ── Nav links ──────────────────────────────────────── */}
            <SidebarContent className="px-2 py-3">
                <SidebarGroup>
                    {!collapsed && (
                        <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] font-black tracking-[0.2em] uppercase mb-1 px-2">
                            Navigation
                        </SidebarGroupLabel>
                    )}
                    <SidebarMenu>
                        {navItems.map((item) => {
                            const isActive = currentPath === item.url ||
                                (item.url !== "/dashboard" && currentPath.startsWith(item.url));
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
                                        }>
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
            <SidebarFooter className="border-t border-sidebar-border px-2 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                    <div className="w-8 h-8 rounded-full bg-sidebar-primary/80 flex items-center justify-center text-sidebar-primary-foreground font-black text-xs shrink-0">
                                        {initials}
                                    </div>
                                    {!collapsed && (
                                        <>
                                            <div className="flex-1 min-w-0 grid text-left leading-tight">
                                                <span className="truncate font-semibold text-sm">{user.name}</span>
                                                <span className="truncate text-xs text-sidebar-foreground/60">{user.email}</span>
                                            </div>
                                            <ChevronsUpDown className="w-4 h-4 text-sidebar-foreground/50 shrink-0"/>
                                        </>
                                    )}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="right" align="end" sideOffset={8}
                                className="w-56 rounded-xl shadow-xl">
                                <div className="px-3 py-2 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                                        <User className="w-4 h-4"/>My Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    onClick={() => {
                                        router.post("/logout", {}, {
                                            onSuccess: () => window.location.href = '/',
                                            onError: () => window.location.href = '/'
                                        });
                                    }}>
                                    <LogOut className="w-4 h-4 mr-2"/>Log Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail/>
        </Sidebar>
    );
}
