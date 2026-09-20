import * as React from "react";
import { Link, usePage } from "@inertiajs/react";
import { activeNavUrl } from "@/lib/sidebarActive";
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
    FileBarChart,
    FolderArchive,
} from "lucide-react";
import BackupsFolder from "@/Components/SuperAdmin/BackupsFolder";
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

/*
 * Each entry links to the address the page is actually served at (the
 * /super-admin/... routes only redirect there), and names the detail pages
 * that belong under it so they keep their section lit. See lib/sidebarActive.
 */
const navGroups = [
    {
        label: "Administrator Panel",
        items: [
            {
                title: "Dashboard",
                url: "/dashboard-panel",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        label: "Processing",
        items: [
            {
                title: "Reviewed Applications",
                url: "/applications",
                icon: FileText,
                matches: ["/view-application", "/application-details", "/review-application", "/document-verification", "/edit-application", "/print-form"],
            },
            {
                title: "Payments",
                url: "/payments",
                icon: CreditCard,
                matches: ["/payment-details", "/receipt"],
            },
            {
                title: "Certificates",
                url: "/certificates",
                icon: Award,
                matches: ["/generate-certificate", "/generate-clearance", "/order-of-payment"],
            },
        ],
    },
    {
        label: "Management",
        items: [
            { title: "Users", url: "/users", icon: Users },
            {
                title: "Reports",
                url: "/reports",
                icon: FileBarChart,
            },
            {
                title: "Audit Logs",
                url: "/audit-logs",
                icon: ScrollText,
            },
            {
                title: "SMS to Officers",
                url: "/sms-broadcast",
                icon: MessageSquare,
            },
            {
                // Not a page: opens the backups folder over whatever page is open.
                title: "Backups",
                action: "backups",
                icon: FolderArchive,
            },
        ],
    },
];

export function SuperAdminSidebar({ ...props }) {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const [backupsOpen, setBackupsOpen] = React.useState(false);

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
    const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
    const activeUrl = activeNavUrl(navGroups, currentPath);

    return (
        <Sidebar collapsible="icon" {...props}>
            {/* Header */}
            <SidebarHeader className={`border-b border-sidebar-border py-4 ${collapsed ? "px-0" : "px-3"}`}>
                <Link
                    href="/dashboard-panel"
                    className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
                >
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
            <SidebarContent className={`py-3 space-y-1 ${collapsed ? "px-0" : "px-2"}`}>
                {navGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        {!collapsed && (
                            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] font-black tracking-[0.2em] uppercase mb-1 px-2">
                                {group.label}
                            </SidebarGroupLabel>
                        )}
                        <SidebarMenu>
                            {group.items.map((item) => {
                                if (item.action === "backups") {
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                type="button"
                                                onClick={() =>
                                                    setBackupsOpen(true)
                                                }
                                                tooltip={item.title}
                                                className={`text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-semibold ${collapsed ? "mx-auto justify-center" : ""}`}
                                            >
                                                <item.icon className="w-5 h-5 shrink-0" />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }
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
                                                }`}
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

            <BackupsFolder open={backupsOpen} onOpenChange={setBackupsOpen} />

            {/* Footer */}
            <SidebarFooter className={`border-t border-sidebar-border py-3 ${collapsed ? "px-0" : "px-2"}`}>
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
