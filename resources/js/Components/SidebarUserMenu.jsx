import * as React from "react";
import { Link, router } from "@inertiajs/react";
import { ChevronsUpDown, LogOut, User } from "lucide-react";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/Components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

/**
 * The signed-in user's card at the bottom of the sidebar, with My Profile and
 * Log Out.
 *
 * On a desktop the menu opens as a dropdown to the right of the sidebar. On a
 * phone there is no room to the right — the panel used to open off the edge of
 * the screen with the email cut in half — so instead it expands inline, inside
 * the sidebar, directly above the name and email.
 *
 * The applicant, admin and super-admin sidebars all render this, so the three
 * near-identical copies stay in step.
 */
export default function SidebarUserMenu({
    user,
    initials,
    collapsed = false,
    profileHref = "/profile",
    roleLabel = null,
}) {
    const { isMobile } = useSidebar();
    const [open, setOpen] = React.useState(false);

    const logOut = () => {
        router.post(
            "/logout",
            {},
            {
                onSuccess: () => (window.location.href = "/"),
                onError: () => (window.location.href = "/"),
            },
        );
    };

    const identity = (
        <>
            <p className="truncate text-sm font-bold text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
            {roleLabel && (
                <p className="mt-0.5 text-xs font-semibold text-[#d4a017]">
                    {roleLabel}
                </p>
            )}
        </>
    );

    const trigger = (
        <SidebarMenuButton
            size="lg"
            tooltip={user.name}
            className="rounded-xl text-sidebar-foreground transition-all duration-200 hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
        >
            {/* Avatar in a gold ring - on the rail this is the whole card. */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-primary text-xs font-black text-[#0d1f5c] shadow-[0_0_0_2px_hsl(var(--sidebar-primary)/0.45)] transition-transform duration-200 group-data-[collapsible=icon]:hover:scale-105">
                {user.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    initials
                )}
            </div>
            {!collapsed && (
                <>
                    <div className="grid min-w-0 flex-1 text-left leading-tight">
                        <span className="truncate text-sm font-semibold">
                            {user.name}
                        </span>
                        <span className="truncate text-xs text-sidebar-foreground/60">
                            {user.email}
                        </span>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
                </>
            )}
        </SidebarMenuButton>
    );

    // ── Phone: an inline panel above the user card, inside the sidebar ──
    if (isMobile) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    {open && (
                        <div className="mb-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                            <div className="border-b border-gray-100 px-3 py-2">
                                {identity}
                            </div>
                            <Link
                                href={profileHref}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <User className="h-4 w-4" />
                                My Profile
                            </Link>
                            <button
                                type="button"
                                onClick={logOut}
                                className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Log Out
                            </button>
                        </div>
                    )}

                    <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    // ── Desktop: the usual dropdown beside the sidebar ──
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="right"
                        align="end"
                        sideOffset={8}
                        collisionPadding={12}
                        className="w-56 max-w-[calc(100vw-1.5rem)] rounded-xl shadow-xl"
                    >
                        <div className="border-b border-gray-100 px-3 py-2">
                            {identity}
                        </div>
                        <DropdownMenuItem asChild>
                            <Link
                                href={profileHref}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                <User className="h-4 w-4" />
                                My Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                            onClick={logOut}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
