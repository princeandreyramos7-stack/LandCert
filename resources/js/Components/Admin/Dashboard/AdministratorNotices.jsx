import React, { useState } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { BellRing, CheckCircle2, ChevronRight, Megaphone, Undo2 } from "lucide-react";
import { OFFICER_NOTICE_TYPE } from "@/lib/officerNotices";

const KINDS = {
    [OFFICER_NOTICE_TYPE]: { Icon: Megaphone, tile: "bg-blue-50 text-[#0d1f5c]", label: "Notice" },
    application_final_approved: { Icon: CheckCircle2, tile: "bg-emerald-50 text-emerald-700", label: "Approved" },
    application_returned: { Icon: Undo2, tile: "bg-orange-50 text-orange-700", label: "Returned" },
};

/** "Just now", "5 min ago", "3 hrs ago", "Yesterday", "Oct 2". */
function when(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    const minutes = Math.round((Date.now() - date) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
    if (hours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * "From the Zoning Administrator" on the Zoning Officer's dashboard: the
 * notices she sends (Super Admin → Notify Officers) and her decisions on the
 * officer's reviews. Each item is the officer's own in-app notification, so
 * reading it here marks it read in the bell too.
 */
export default function AdministratorNotices({ notices = [], className = "" }) {
    const [readIds, setReadIds] = useState(() => new Set());
    const [openId, setOpenId] = useState(null);
    const isRead = (notice) => notice.read || readIds.has(notice.id);
    const unread = notices.filter((n) => !isRead(n)).length;

    const open = (notice) => {
        if (!isRead(notice)) {
            setReadIds((ids) => new Set(ids).add(notice.id));
            axios.post("/notifications/mark-read", { id: notice.id }).catch(() => {});
        }
        // A decision opens its application; a notice just shows in full here.
        if (notice.type !== OFFICER_NOTICE_TYPE && notice.link) {
            router.visit(notice.link);
            return;
        }
        setOpenId((id) => (id === notice.id ? null : notice.id));
    };

    return (
        <section className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}>
            <header className="flex items-center gap-2.5 border-b border-gray-100 px-3 py-2.5 sm:px-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0d1f5c]">
                    <BellRing className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-[#0d1f5c]">From the Zoning Administrator</h2>
                    <p className="text-xs text-gray-500">Notices and decisions sent to you</p>
                </div>
                {unread > 0 && (
                    <span className="shrink-0 rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        {unread} new
                    </span>
                )}
            </header>

            {notices.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-500">
                    Nothing from the Zoning Administrator yet. Her notices and decisions on your reviews appear here.
                </p>
            ) : (
                <ul className="max-h-[22rem] divide-y divide-gray-100 overflow-y-auto">
                    {notices.map((notice) => {
                        const kind = KINDS[notice.type] ?? KINDS[OFFICER_NOTICE_TYPE];
                        const expanded = openId === notice.id;
                        const fresh = !isRead(notice);
                        return (
                            <li key={notice.id}>
                                <button
                                    type="button"
                                    onClick={() => open(notice)}
                                    className={`flex w-full gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-gray-50 sm:px-4 ${fresh ? "bg-blue-50/40" : ""}`}
                                >
                                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${kind.tile}`}>
                                        <kind.Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {fresh && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
                                            {notice.important && (
                                                <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Important</span>
                                            )}
                                            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{kind.label}</span>
                                            <span className="ml-auto shrink-0 text-[11px] text-gray-400">{when(notice.created_at)}</span>
                                        </div>
                                        <p className={`mt-0.5 text-sm text-gray-900 ${fresh ? "font-bold" : "font-semibold"}`}>{notice.title}</p>
                                        <p className={`mt-0.5 whitespace-pre-line text-xs leading-snug text-gray-600 ${expanded ? "" : "line-clamp-2"}`}>
                                            {notice.message}
                                        </p>
                                    </div>
                                    {notice.type !== OFFICER_NOTICE_TYPE && notice.link && (
                                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
