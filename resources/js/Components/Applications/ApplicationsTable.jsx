import { WithTooltip } from "@/Components/ui/icon-button";
import React from "react";
import { router } from "@inertiajs/react";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    MoreVertical,
    Eye,
    FileCheck,
    ClipboardCheck,
    MapPin,
    Inbox,
    Archive,
    ArchiveRestore,
} from "lucide-react";
import { stageProgress, STAGE_LABEL, stageOf } from "@/lib/processingSla";
import {
    getStatusColor,
    getStatusIcon,
    getStatusLabel,
    formatDate,
} from "@/Components/Admin/Request/utils";

const TYPE_TONES = {
    CZC: "bg-blue-50 text-blue-700 ring-blue-200",
    SUP: "bg-purple-50 text-purple-700 ring-purple-200",
    TUP: "bg-orange-50 text-orange-700 ring-orange-200",
    ZC: "bg-teal-50 text-teal-700 ring-teal-200",
};

export function TypeChip({ type }) {
    const code = String(type || "")
        .trim()
        .toUpperCase();
    if (!code)
        return <span className="text-xs italic text-gray-400">Not set</span>;
    return (
        <span
            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${TYPE_TONES[code] || "bg-gray-50 text-gray-700 ring-gray-200"}`}
        >
            {code}
        </span>
    );
}

/**
 * How long the application has sat at its current step, in working days,
 * against the Citizen's Charter limit for that step - red once it is over.
 * Time with the applicant (corrections, the fee) is shown but never counted
 * against the office.
 */
function Stage({ request, sla }) {
    const p = stageProgress(request, sla);
    if (!p) return null;
    const label = STAGE_LABEL[p.stage] || p.stage;
    const dayWord = p.days === 1 ? "day" : "days";
    if (!p.office) {
        return <span className="block text-[11px] text-gray-400">{label} {p.days} {dayWord}</span>;
    }
    return (
        <span
            className={`block text-[11px] ${p.overdue ? "font-semibold text-rose-600" : "text-gray-400"}`}
            title={`${p.days} working ${dayWord} in ${label}; the Citizen's Charter allows ${p.limit}`}
        >
            {p.overdue ? `${label} ${p.days} ${dayWord} · over the ${p.limit}-day limit` : `${label} ${p.days} of ${p.limit} ${p.limit === 1 ? "day" : "days"}`}
        </span>
    );
}

function menuItems(request, role) {
    if (role === "admin") {
        return [
            {
                label: "View Application",
                icon: Eye,
                href: route("admin.requests.view-application", request.id),
            },
            {
                label: "Document Verification",
                icon: FileCheck,
                href: route("admin.requests.view-application", request.id) + "?section=requirements",
            },
        ];
    }
    return [
        {
            label: "View Application",
            icon: Eye,
            href: route("super-admin.requests.view-application", request.id),
        },
        {
            label: "Document Verification",
            icon: ClipboardCheck,
            href: route("super-admin.requests.view-application", request.id) + "?section=requirements",
        },
    ];
}

/**
 * Everything is in the menu. There used to be a button beside it for the
 * likely next step, but it only repeated an item already in the menu two
 * inches away, and a row that offers the same thing twice reads as offering
 * two different things.
 */
function Actions({ request, role, archived = false }) {
    // The administrator keeps the archive: a closed application can be put
    // in it, and anything in it can be brought back.
    const closed = stageOf(request.status) === "closed";
    const archiveItem = role === "super_admin"
        ? (archived || request.archived_at
            ? { label: "Restore to board", icon: ArchiveRestore, post: route("super-admin.requests.unarchive", request.id) }
            : closed
                ? { label: "Archive", icon: Archive, post: route("super-admin.requests.archive", request.id) }
                : null)
        : null;

    return (
        <div className="flex items-center justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <WithTooltip
                    label="Actions"
                    hint="View, review, print or export this application"
                  >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500"
                        aria-label="More actions"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                  </WithTooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    onClick={(e) => e.stopPropagation()}
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    className="z-[100] min-w-[200px]"
                >
                    {menuItems(request, role).map((item) => (
                        <DropdownMenuItem
                            key={item.label}
                            onClick={() => router.visit(item.href)}
                            className="gap-2 text-sm cursor-pointer"
                        >
                            <item.icon className="h-4 w-4 text-gray-500" />{" "}
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                    {archiveItem && (
                        <DropdownMenuItem
                            onClick={() => router.post(archiveItem.post, {}, { preserveScroll: true })}
                            className="gap-2 text-sm cursor-pointer"
                        >
                            <archiveItem.icon className="h-4 w-4 text-gray-500" />{" "}
                            {archiveItem.label}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function Empty({ filtered, archived = false }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <span className="rounded-full bg-gray-50 p-3 text-gray-300">
                <Inbox className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-gray-700">
                {filtered
                    ? "Nothing matches these filters"
                    : archived
                        ? "The archive is empty"
                        : "No applications yet"}
            </p>
            <p className="text-xs text-gray-400">
                {filtered
                    ? "Try a different status, type or search term."
                    : archived
                        ? "Released or denied applications are moved here after the archive age set in the Citizen's Charter settings, or by hand from the row menu."
                        : "New applications appear here the moment they are filed."}
            </p>
        </div>
    );
}

const th =
    "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#0d1f5c]";

/**
 * All Applications as a table on wide screens and as cards on a phone. A row
 * opens the application; everything else is in the menu on the right.
 */
export function ApplicationsTable({ requests, role, filtered = false, sla, archived = false }) {
    if (!requests.length) return <Empty filtered={filtered} archived={archived} />;

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
                            <tr
                                key={r.id}
                                className="transition-colors hover:bg-[#0d1f5c]/[0.03]"
                            >
                                <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-bold text-[#0d1f5c]">
                                    {r.application_number || `#${r.id}`}
                                </td>
                                <td className="max-w-[260px] px-4 py-3">
                                    <p className="truncate text-sm font-semibold text-gray-900">
                                        {r.applicant_name || "—"}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                        {r.corporation_name ||
                                            r.project_nature ||
                                            r.user_email ||
                                            ""}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <TypeChip type={r.project_type} />
                                </td>
                                <td className="max-w-[240px] px-4 py-3">
                                    <p className="flex items-center gap-1 truncate text-sm text-gray-800">
                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                        {r.project_location_barangay || (
                                            <span className="italic text-gray-400">
                                                No barangay
                                            </span>
                                        )}
                                    </p>
                                    <p className="truncate pl-[18px] text-xs text-gray-400">
                                        {r.project_location_street || ""}
                                    </p>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                    {formatDate(r.created_at)}
                                    <Stage request={r} sla={sla} />
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        className={`whitespace-nowrap ${getStatusColor(r.status)}`}
                                    >
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(r.status)}
                                            {getStatusLabel(r.status)}
                                        </span>
                                    </Badge>
                                    {r.archived_at && (
                                        <span className="mt-1 block text-[11px] text-gray-400">archived {formatDate(r.archived_at)}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <Actions request={r} role={role} archived={archived} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phones */}
            <ul className="divide-y divide-gray-100 md:hidden">
                {requests.map((r) => (
                    <li
                        key={r.id}
                        className="px-4 py-3 active:bg-gray-50"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="font-mono text-xs font-bold text-[#0d1f5c]">
                                    {r.application_number || `#${r.id}`}
                                </p>
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {r.applicant_name || "—"}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                    {r.project_nature ||
                                        r.corporation_name ||
                                        ""}
                                </p>
                            </div>
                            <TypeChip type={r.project_type} />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {r.project_location_barangay || "No barangay"}
                            </span>
                            <span>{formatDate(r.created_at)}</span>
                            <Stage request={r} sla={sla} />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                            <Badge
                                className={`${getStatusColor(r.status)} text-[11px]`}
                            >
                                <span className="flex items-center gap-1">
                                    {getStatusIcon(r.status)}
                                    {getStatusLabel(r.status)}
                                </span>
                            </Badge>
                            <Actions request={r} role={role} archived={archived} />
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
