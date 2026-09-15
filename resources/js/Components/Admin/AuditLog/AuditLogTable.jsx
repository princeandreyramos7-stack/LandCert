import React from "react";
import { Button } from "@/Components/ui/button";
import { Eye, Globe, Inbox } from "lucide-react";
import {
    actionTone,
    toneClasses,
    formatDate,
    formatActionLabel,
    timeAgo,
    roleLabel,
    initialsOf,
} from "./utils";

export function AuditLogTable({ logs, onViewDetails }) {
    const rows = logs?.data ?? [];

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 px-4 py-14 text-center">
                <div className="rounded-full bg-gray-50 p-3">
                    <Inbox className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                    No activity matches
                </p>
                <p className="text-xs text-gray-400">
                    Try a wider date range or clear the filters.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="-mx-4 hidden overflow-x-auto sm:mx-0 md:block">
                <table className="w-full min-w-[56rem] text-sm">
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr className="border-b border-gray-200 text-left text-[11px] font-bold uppercase tracking-wide text-[#0d1f5c]">
                            <th className="px-4 py-2.5 sm:px-3">When</th>
                            <th className="px-3 py-2.5">Who</th>
                            <th className="px-3 py-2.5">Action</th>
                            <th className="px-3 py-2.5">Details</th>
                            <th className="px-3 py-2.5">Reference</th>
                            <th className="px-3 py-2.5">From</th>
                            <th className="px-3 py-2.5 text-right">
                                <span className="sr-only">Open</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((log, i) => {
                            const tone = actionTone(log.action);
                            const role = log.user_type || log.user?.user_type;
                            return (
                                <tr
                                    key={log.id}
                                    onClick={() => onViewDetails(log)}
                                    className={`cursor-pointer border-b border-gray-100 align-top transition-colors hover:bg-[#0d1f5c]/[0.035] ${i % 2 === 1 ? "bg-gray-50/60" : "bg-white"}`}
                                >
                                    <td className="whitespace-nowrap px-4 py-3 sm:px-3">
                                        <div className="text-xs font-semibold text-gray-900">
                                            {timeAgo(log.created_at)}
                                        </div>
                                        <div className="mt-0.5 text-[11px] text-gray-400">
                                            {formatDate(log.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-black ${
                                                    role === "super_admin"
                                                        ? "bg-[#0d1f5c] text-[#d4a017]"
                                                        : role === "admin"
                                                          ? "bg-[#d4a017] text-[#0d1f5c]"
                                                          : "bg-gray-200 text-gray-700"
                                                }`}
                                                aria-hidden="true"
                                            >
                                                {initialsOf(
                                                    log.user_name || "System",
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate text-xs font-semibold text-gray-900">
                                                    {log.user_name || "System"}
                                                </div>
                                                <div className="truncate text-[11px] text-gray-400">
                                                    {roleLabel(role)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${toneClasses[tone]}`}
                                        >
                                            {formatActionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <p
                                            className="line-clamp-2 max-w-md text-xs text-gray-700"
                                            title={log.description}
                                        >
                                            {log.description}
                                        </p>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {log.application_number ? (
                                            <span className="rounded-md bg-[#0d1f5c]/5 px-2 py-0.5 font-mono text-[11px] font-bold text-[#0d1f5c]">
                                                {log.application_number}
                                            </span>
                                        ) : log.model_type && log.model_id ? (
                                            <span className="rounded-md border border-gray-200 px-2 py-0.5 text-[11px] text-gray-600">
                                                {String(log.model_type)
                                                    .split("\\")
                                                    .pop()}{" "}
                                                #{log.model_id}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {log.ip_address ? (
                                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-500">
                                                <Globe className="h-3 w-3 text-gray-300" />
                                                {log.ip_address}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(log);
                                            }}
                                            className="h-7 w-7 p-0 text-gray-400 hover:text-[#0d1f5c]"
                                            aria-label="View details"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Phones */}
            <ul className="divide-y divide-gray-100 md:hidden">
                {rows.map((log) => {
                    const tone = actionTone(log.action);
                    const role = log.user_type || log.user?.user_type;
                    return (
                        <li
                            key={log.id}
                            onClick={() => onViewDetails(log)}
                            className="cursor-pointer px-1 py-3 active:bg-gray-50"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span
                                    className={`inline-flex shrink-0 rounded-md px-2 py-0.5 border text-[11px] font-bold ${toneClasses[tone]}`}
                                >
                                    {formatActionLabel(log.action)}
                                </span>
                                <span className="shrink-0 text-[11px] text-gray-400">
                                    {timeAgo(log.created_at)}
                                </span>
                            </div>
                            <p className="mt-1.5 line-clamp-2 text-sm text-gray-700">
                                {log.description || "—"}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0d1f5c]/10 text-[9px] font-bold text-[#0d1f5c]">
                                        {initialsOf(
                                            log.user_name || log.user?.name,
                                        )}
                                    </span>
                                    {log.user_name ||
                                        log.user?.name ||
                                        "System"}
                                    {role && (
                                        <span className="text-gray-400">
                                            · {roleLabel(role)}
                                        </span>
                                    )}
                                </span>
                                {log.model_type && (
                                    <span className="font-mono text-[10px] text-gray-400">
                                        {String(log.model_type)
                                            .split("\\")
                                            .pop()}{" "}
                                        #{log.model_id}
                                    </span>
                                )}
                                {log.ip_address && (
                                    <span className="flex items-center gap-1 font-mono text-[10px] text-gray-400">
                                        <Globe className="h-3 w-3" />
                                        {log.ip_address}
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
