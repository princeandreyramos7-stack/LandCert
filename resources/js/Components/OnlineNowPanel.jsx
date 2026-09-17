import { Radio, Users } from "lucide-react";

/**
 * Who is using the system right now - the dashboards' live view. Everyone
 * seen in the last few minutes, with their role and the page they are on;
 * refreshed by the page's live poller (the `online` prop).
 */

const ROLE = {
    super_admin: { label: "Zoning Administrator", chip: "bg-[#d4a017]/15 text-[#8a6a0e]" },
    admin: { label: "Zoning Officer", chip: "bg-[#0d1f5c]/10 text-[#0d1f5c]" },
    applicant: { label: "Applicant", chip: "bg-emerald-50 text-emerald-700" },
};

const initials = (name = "") =>
    String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

const ago = (iso) => {
    if (!iso) return "";
    const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 45) return "just now";
    const m = Math.round(s / 60);
    return m <= 1 ? "1 min ago" : `${m} min ago`;
};

export function OnlineNowPanel({ online, className = "" }) {
    if (!online || online.unavailable) return null;
    const users = online.users || [];
    const byRole = online.by_role || {};

    return (
        <div className={`rounded-xl border border-gray-100 bg-white shadow-sm ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <Radio className="h-4 w-4" />
                        {online.online > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            </span>
                        )}
                    </span>
                    <div>
                        <p className="text-sm font-black text-[#0d1f5c]">
                            Live · {online.online} {online.online === 1 ? "person" : "people"} using the system
                        </p>
                        <p className="text-xs text-gray-400">
                            Seen in the last {online.window_minutes} minutes · {online.today} {online.today === 1 ? "person" : "people"} today
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {Object.entries(ROLE).map(([key, role]) => (
                        <span key={key} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${role.chip}`}>
                            {byRole[key] ?? 0} {role.label}{(byRole[key] ?? 0) === 1 ? "" : "s"}
                        </span>
                    ))}
                </div>
            </div>

            {users.length === 0 ? (
                <p className="flex items-center gap-2 px-4 py-5 text-sm text-gray-400 sm:px-5">
                    <Users className="h-4 w-4" /> Nobody else is signed in at the moment.
                </p>
            ) : (
                <ul className="grid gap-x-6 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
                    {users.map((u) => {
                        const role = ROLE[u.user_type] || { label: u.user_type, chip: "bg-gray-100 text-gray-600" };
                        return (
                            <li key={u.id} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                                {u.avatar_url ? (
                                    <img src={u.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                                ) : (
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d1f5c]/10 text-[11px] font-black text-[#0d1f5c]">
                                        {initials(u.name)}
                                    </span>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-900">{u.name}</p>
                                    <p className="text-[11px]">
                                        <span className={`rounded px-1 py-px font-bold ${role.chip}`}>{role.label}</span>
                                    </p>
                                    <p className="truncate text-[11px] text-gray-500">{u.page}</p>
                                </div>
                                <span className="shrink-0 text-[11px] text-gray-400">{ago(u.last_seen_at)}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
