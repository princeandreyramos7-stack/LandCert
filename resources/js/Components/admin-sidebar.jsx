import * as React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    History,
    Award,
    Users,
    Activity,
    ChevronRight,
    LogOut,
    ChevronsUpDown,
    Shield,
    MessageSquare,
    User,
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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/Components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

/* ── Nav structure ──────────────────────────────────────────────── */
const navGroups = [
    {
        label: "Admin Panel",
        items: [
            { title: "Dashboard",  url: "/admin/dashboard",  icon: LayoutDashboard },
            { title: "Applications",   url: "/admin/requests",   icon: FileText },
        ],
    },
    {
        label: "Processing",
        items: [
            { title: "Payments", url: "/admin/payments", icon: CreditCard },
            { title: "Certificates", url: "/admin/certificates", icon: Award },
        ],
    },
    {
        label: "Management",
        items: [
            { title: "Users",      url: "/admin/users",       icon: Users },
            { title: "Audit Logs", url: "/admin/audit-logs",  icon: Activity },
            { title: "SMS Broadcast", url: "/admin/sms",      icon: MessageSquare },
        ],
    },
];

/* ── Nav group (collapsible) ────────────────────────────────────── */
function NavGroup({ group, currentPath, collapsed }) {
    const hasActive = group.items.some(i => currentPath === i.url || currentPath.startsWith(i.url + "/"));
    const [open, setOpen] = React.useState(hasActive || group.label === "Admin Panel");

    return (
        <SidebarGroup>
            {!collapsed && (
                <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] font-black tracking-[0.2em] uppercase px-2 mb-1">
                    {group.label}
                </SidebarGroupLabel>
            )}
            <SidebarMenu>
                {group.items.map((item) => {
                    const isActive = currentPath === item.url ||
                                    (currentPath.startsWith(item.url + "/") &&
                                     // Prevent shorter URLs matching longer ones (e.g. /payments matching /payments/pending)
                                     !group.items.some(other =>
                                         other.url !== item.url &&
                                         other.url.length > item.url.length &&
                                         currentPath.startsWith(other.url)
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
    );
}

/* ── Main sidebar ───────────────────────────────────────────────── */
export function AdminSidebar({ ...props }) {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const collapsed = state === "collapsed";

    const user = {
        name:  auth?.user?.name  || "Admin",
        email: auth?.user?.email || "admin@example.com",
    };

    const initials = user.name
        .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

    return (
        <Sidebar collapsible="icon" {...props}>

            {/* ── Header ─────────────────────────────────────── */}
            <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border-2 border-sidebar-primary/60 bg-sidebar-primary/10 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-sidebar-primary"/>
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-sidebar-primary font-black text-sm leading-tight tracking-wide truncate">
                                Zoning Officer
                            </p>
                            <p className="text-sidebar-foreground/50 text-[10px] tracking-widest leading-tight truncate">
                                City of Ilagan, Isabela
                            </p>
                        </div>
                    )}
                </Link>
            </SidebarHeader>

            {/* ── Nav ────────────────────────────────────────── */}
            <SidebarContent className="px-2 py-3 space-y-1">
                {navGroups.map(group => (
                    <NavGroup
                        key={group.label}
                        group={group}
                        currentPath={currentPath}
                        collapsed={collapsed}
                    />
                ))}
            </SidebarContent>

            {/* ── Footer / User ──────────────────────────────── */}
            <SidebarFooter className="border-t border-sidebar-border px-2 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent">
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
                            <DropdownMenuContent side="right" align="end" sideOffset={8} className="w-56 rounded-xl shadow-xl">
                                <div className="px-3 py-2 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    <p className="text-xs text-[#d4a017] font-semibold mt-0.5">Zoning Officer</p>
                                </div>
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/profile" className="flex items-center gap-2 cursor-pointer">
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
