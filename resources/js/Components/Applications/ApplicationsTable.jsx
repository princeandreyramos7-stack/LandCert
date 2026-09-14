import React from "react";
import { router } from "@inertiajs/react";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { MoreVertical, Eye, FileCheck, ClipboardCheck, MapPin, Inbox } from "lucide-react";
import { getStatusColor, getStatusIcon, getStatusLabel, formatDate } from "@/Components/Admin/Request/utils";

const OPEN_STATUSES = ["pending", "for_verification", "reviewed", "pending_superadmin_approval", "in_applicant", "returned"];

/** Whole days since the application was filed. */
export const daysWaiting = (createdAt) => {
    if (!createdAt) return null;
    const ms = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(ms / 86400000));
};

const waitingLabel = (days) => (days === 0 ? "today" : days === 1 ? "1 day" : `${days} days`);

const TYPE_TONES = {
    CZC: "bg-blue-50 text-blue-700 ring-blue-200",
    SUP: "bg-purple-50 text-purple-700 ring-purple-200",
    TUP: "bg-orange-50 text-orange-700 ring-orange-200",
    ZC: "bg-teal-50 text-teal-700 ring-teal-200",
};

export function TypeChip({ type }) {
    const code = String(type || "").trim().toUpperCase();
    if (!code) return <span className="text-xs italic text-gray-400">Not set</span>;
    return (
        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${TYPE_TONES[code] || "bg-gray-50 text-gray-700 ring-gray-200"}`}>
            {code}
        </span>
    );
}

function Waiting({ request }) {
    const status = String(request.status || "").toLowerCase();
    const days = daysWaiting(request.created_at);
    if (!OPEN_STATUSES.includes(status) || days === null) return null;
    const slow = days >= 7;
    return (
        <span className={`block text-[11px] ${slow ? "font-semibold text-rose-600" : "text-gray-400"}`}>
            waiting {waitingLabel(days)}
        </span>
    );
}

/**
 * The primary action for a row: the one thing this role most likely wants to
 * do with an application in this state. Everything else sits in the menu.
 */
function primaryAction(request, role) {
    const status = String(request.status || "").toLowerCase();
    const isPending = ["pending", "for_verification", "in_applicant", "returned"].includes(status);
    const isForApproval = ["reviewed", "pending_superadmin_approval"].includes(status);

    if (role === "admin" && isPending) {
        return { label: "Verify documents", icon: FileCheck, href: route("admin.requests.document-verification", request.id), tone: "bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90" };
    }
    if (role === "super_admin" && isForApproval) {
        return { label: "Review & decide", icon: ClipboardCheck, href: route("super-admin.requests.document-verification", request.id), tone: "bg-[#d4a017] text-[#0d1f5c] hover:bg-[#d4a017]/90" };
    }
    const view = role === "admin" ? route("admin.requests.view-application", request.id) : route("super-admin.requests.view-application", request.id);
    return { label: "View", icon: Eye, href: view, tone: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50" };
}

function menuItems(request, role) {
    if (role === "admin") {
        return [
            { label: "View application", icon: Eye, href: route("admin.requests.view-application", request.id) },
            { label: "Document verification", icon: FileCheck, href: route("admin.requests.document-verification", request.id) },
            { label: "Review & evaluate", icon: ClipboardCheck, href: route("admin.requests.review", request.id) },
        ];
    }
    return [
        { label: "View application", icon: Eye, href: route("super-admin.requests.view-application", request.id) },
        { label: "Review & decide", icon: ClipboardCheck, href: route("super-admin.requests.document-verification", request.id) },
    ];
}

function Actions({ request, role }) {
    const main = primaryAction(request, role);
    return (
        <div className="flex items-center justify-end gap-1">
            <Button size="sm" onClick={(e) => { e.stopPropagation(); router.visit(main.href); }} className={`h-8 gap-1.5 px-3 text-xs font-semibold shadow-none ${main.tone}`}>
                <main.icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{main.label}</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" aria-label="More actions" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    {menuItems(request, role).map((item) => (
                        <DropdownMenuItem key={item.label} onClick={() => router.visit(item.href)} className="gap-2 text-sm">
                            <item.icon className="h-4 w-4 text-gray-500" /> {item.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function Empty({ filtered }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <span className="rounded-full bg-gray-50 p-3 text-gray-300"><Inbox className="h-6 w-6" /></span>
            <p className="text-sm font-semibold text-gray-700">{filtered ? "Nothing matches these filters" : "No applications yet"}</p>
            <p className="text-xs text-gray-400">{filtered ? "Try a different status, type or search term." : "New applications appear here the moment they are filed."}</p>
        </div>
    );
}

const th = "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#0d1f5c]";

/**
 * All Applications as a table on wide screens and as cards on a phone. Every
 * row opens the application; the button on the right is the next step for
 * this role, and the menu holds the rest.
 */
export function ApplicationsTable({ requests, role, filtered = false }) {
    if (!requests.length) return <Empty filtered={filtered} />;

    const open = (request) => router.visit(role === "admin" ? route("admin.requests.view-application", request.id) : route("super-admin.requests.view-application", request.id));

    return (
        <>
            {/* Wide screens */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[880px] border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/80">
                            <th className={th}>Application No.</th>
                            <th className={th}>Applicant &amp; project</th>
                            <th className={th}>Type</th>
                            <th className={th}>Location</th>
                            <th className={th}>Filed</th>
                            <th className={th}>Status</th>
                            <th className={`${th} text-right`}>Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map((r) => (
                            <tr key={r.id} onClick={() => open(r)} className="cursor-pointer transition-colors hover:bg-[#0d1f5c]/[0.03]">
                                <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-bold text-[#0d1f5c]">{r.application_number || `#${r.id}`}</td>
                                <td className="max-w-[260px] px-4 py-3">
                                    <p className="truncate text-sm font-semibold text-gray-900">{r.applicant_name || "—"}</p>
                                    <p className="truncate text-xs text-gray-500">{r.corporation_name || r.project_nature || r.user_email || ""}</p>
                                </td>
                                <td className="px-4 py-3"><TypeChip type={r.project_type} /></td>
                                <td className="max-w-[240px] px-4 py-3">
                                    <p className="flex items-center gap-1 truncate text-sm text-gray-800"><MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />{r.project_location_barangay || <span className="italic text-gray-400">No barangay</span>}</p>
                                    <p className="truncate pl-[18px] text-xs text-gray-400">{r.project_location_street || ""}</p>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                    {formatDate(r.created_at)}
                                    <Waiting request={r} />
                                </td>
                                <td className="px-4 py-3">
                                    <Badge className={`whitespace-nowrap ${getStatusColor(r.status)}`}>
                                        <span className="flex items-center gap-1">{getStatusIcon(r.status)}{getStatusLabel(r.status)}</span>
                                    </Badge>
                                </td>
                                <td className="px-4 py-3"><Actions request={r} role={role} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phones */}
            <ul className="divide-y divide-gray-100 md:hidden">
                {requests.map((r) => (
                    <li key={r.id} onClick={() => open(r)} className="cursor-pointer px-4 py-3 active:bg-gray-50">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="font-mono text-xs font-bold text-[#0d1f5c]">{r.application_number || `#${r.id}`}</p>
                                <p className="truncate text-sm font-semibold text-gray-900">{r.applicant_name || "—"}</p>
                                <p className="truncate text-xs text-gray-500">{r.project_nature || r.corporation_name || ""}</p>
                            </div>
                            <TypeChip type={r.project_type} />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.project_location_barangay || "No barangay"}</span>
                            <span>{formatDate(r.created_at)}</span>
                            <Waiting request={r} />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                            <Badge className={`${getStatusColor(r.status)} text-[11px]`}>
                                <span className="flex items-center gap-1">{getStatusIcon(r.status)}{getStatusLabel(r.status)}</span>
                            </Badge>
                            <Actions request={r} role={role} />
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
