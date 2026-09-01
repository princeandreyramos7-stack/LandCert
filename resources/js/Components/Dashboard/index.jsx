import React, { useMemo } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Calendar,
    ArrowRight,
    FilePlus,
    FolderOpen,
} from "lucide-react";

/* ── Helpers ────────────────────────────────────────────────────── */
function formatDate(ds) {
    if (!ds) return "—";
    return new Date(ds).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

const APPROVED_CFG = { label: "Application Approved", icon: CheckCircle, bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" };
const STATUS_MAP = {
    pending:      { label: "Pending",      icon: Clock,        bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-200", dot: "bg-yellow-500" },
    approved:     { label: "Approved",     icon: CheckCircle,  bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",  dot: "bg-green-500"  },
    rejected:     { label: "Denied",     icon: XCircle,      bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",    dot: "bg-red-500"    },
    "under review":{ label: "Under Review", icon: AlertCircle, bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",   dot: "bg-blue-500"   },
    // Everything after the payment is verified is just "Application Approved".
    payment_confirmed:     APPROVED_CFG,
    certificate_preparing: APPROVED_CFG,
    certificate_ready:     APPROVED_CFG,
    released:              APPROVED_CFG,
};

function statusCfg(s) {
    return STATUS_MAP[s?.toLowerCase()] || STATUS_MAP.pending;
}

/* ── Stat card ──────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, accent, desc }) {
    return (
        <div className={`bg-white rounded-xl border ${accent.border} border-l-4 ${accent.left} p-5 hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                <div className={`w-9 h-9 rounded-lg ${accent.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${accent.iconColor}`}/>
                </div>
            </div>
            <p className="text-3xl font-black text-[#0d1f5c]">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{desc}</p>
        </div>
    );
}

/* ── Quick action card ──────────────────────────────────────────── */
function ActionCard({ href, icon: Icon, title, desc, iconBg, iconColor }) {
    return (
        <Link href={href}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-[#d4a017]/40 transition-all group">
            <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-6 h-6 ${iconColor}`}/>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0d1f5c] text-sm">{title}</p>
                <p className="text-xs text-gray-500 truncate">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#d4a017] group-hover:translate-x-1 transition-all shrink-0"/>
        </Link>
    );
}

/* ── Status badge ───────────────────────────────────────────────── */
function StatusBadge({ status }) {
    const cfg = statusCfg(status);
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
            {cfg.label}
        </span>
    );
}

/* ── Main component ─────────────────────────────────────────────── */
export function Dashboard({ requests }) {
    const { auth } = usePage().props;
    const userName = auth?.user?.name || "User";
    const firstName = userName.split(" ")[0];

    const data = requests?.data || requests || [];

    const stats = useMemo(() => ({
        total:       data.length,
        pending:     data.filter(r => r.status?.toLowerCase() === "pending").length,
        approved:    data.filter(r => r.status?.toLowerCase() === "approved").length,
        underReview: data.filter(r => r.status?.toLowerCase() === "under review").length,
        rejected:    data.filter(r => r.status?.toLowerCase() === "rejected").length,
    }), [data]);

    const recent = useMemo(() => data.slice(0, 5), [data]);

    const statCards = [
        {
            label: "Total Applications",
            value: stats.total,
            icon: FileText,
            desc: "All submitted applications",
            accent: { border: "border-gray-100", left: "border-l-[#0d1f5c]", iconBg: "bg-[#0d1f5c]/10", iconColor: "text-[#0d1f5c]" },
        },
        {
            label: "Pending Review",
            value: stats.pending,
            icon: Clock,
            desc: "Awaiting processing",
            accent: { border: "border-yellow-50", left: "border-l-yellow-500", iconBg: "bg-yellow-50", iconColor: "text-yellow-600" },
        },
        {
            label: "Under Review",
            value: stats.underReview,
            icon: AlertCircle,
            desc: "Being evaluated",
            accent: { border: "border-blue-50", left: "border-l-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        },
        {
            label: "Approved",
            value: stats.approved,
            icon: CheckCircle,
            desc: "Successfully approved",
            accent: { border: "border-green-50", left: "border-l-green-500", iconBg: "bg-green-50", iconColor: "text-green-600" },
        },
        {
            label: "Denied",
            value: stats.rejected,
            icon: XCircle,
            desc: "Not approved",
            accent: { border: "border-red-50", left: "border-l-red-500", iconBg: "bg-red-50", iconColor: "text-red-500" },
        },
    ];

    return (
        <div className="space-y-6">

            {/* ── Welcome banner ──────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl text-white"
                style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}>
                {/* Grid overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs><pattern id="dg" width="48" height="48" patternUnits="userSpaceOnUse">
                        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#93c5fd" strokeWidth="0.7"/>
                    </pattern></defs>
                    <rect width="100%" height="100%" fill="url(#dg)"/>
                </svg>
                {/* Gold orb */}
                <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
                    style={{ background: "radial-gradient(circle,#d4a017,transparent 70%)" }}/>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 lg:p-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-5 rounded-full bg-[#d4a017]"/>
                            <p className="text-[#d4a017] text-xs font-black tracking-[0.2em] uppercase">CPDO LC</p>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black leading-tight">
                            Good day, {firstName}!
                        </h1>
                        <p className="text-blue-200/80 text-sm mt-1">
                            Track and manage your land use permit applications in one place.
                        </p>
                    </div>
                    <Link href="/request"
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#d4a017] hover:bg-[#b8880d] text-white text-sm font-bold shadow transition-colors whitespace-nowrap">
                        <FilePlus className="w-4 h-4"/>
                        New Application
                    </Link>
                </div>
            </div>

            {/* ── Stat cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((s, i) => (
                    <StatCard key={i} {...s}/>
                ))}
            </div>

            {/* ── Recent Applications ─────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                    <div>
                        <h2 className="font-black text-[#0d1f5c] text-base">Recent Applications</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Your latest submitted applications</p>
                    </div>
                    <Link href="/my-applications"
                        className="flex items-center gap-1.5 text-xs font-bold text-[#0d1f5c] hover:text-[#d4a017] transition-colors group">
                        View All
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"/>
                    </Link>
                </div>

                {recent.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#0d1f5c]/5 flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-[#0d1f5c]/30"/>
                        </div>
                        <h3 className="font-bold text-gray-700 text-base mb-1">No Applications Yet</h3>
                        <p className="text-sm text-gray-400 mb-5 max-w-xs">
                            Start by submitting your first land use permit application.
                        </p>
                        <Link href="/request"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold shadow transition-colors"
                            style={{ background: "linear-gradient(90deg,#0d1f5c,#1a3a8f)" }}>
                            <FilePlus className="w-4 h-4"/>
                            Start New Application
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {recent.map((app) => {
                            const cfg = statusCfg(app.status);
                            return (
                                <div key={app.id}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors group">
                                    {/* ID badge */}
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm text-white"
                                        style={{ background: "linear-gradient(135deg,#0d1f5c,#1a3a8f)" }}>
                                        #{app.id}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#0d1f5c] text-sm truncate">
                                            {app.applicant_name || "Unnamed Applicant"}
                                        </p>
                                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3"/>
                                                {formatDate(app.created_at)}
                                            </span>
                                            {app.project_type && (
                                                <span className="truncate max-w-[160px]">{app.project_type}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <StatusBadge status={app.status}/>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Quick Actions ────────────────────────────────────── */}
            <div>
                <h2 className="font-black text-[#0d1f5c] text-base mb-3">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ActionCard
                        href="/request"
                        icon={FilePlus}
                        title="New Application"
                        desc="Submit a new zoning or land use permit request"
                        iconBg="bg-[#0d1f5c]/10"
                        iconColor="text-[#0d1f5c]"
                    />
                    <ActionCard
                        href="/my-applications"
                        icon={FolderOpen}
                        title="Track My Applications"
                        desc="View all your submitted applications and their status"
                        iconBg="bg-[#d4a017]/10"
                        iconColor="text-[#d4a017]"
                    />
                    <ActionCard
                        href="/notifications"
                        icon={AlertCircle}
                        title="Notifications"
                        desc="Check updates and messages from CPDO"
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                    />
                    <ActionCard
                        href="/profile"
                        icon={TrendingUp}
                        title="My Profile"
                        desc="Manage your account information and settings"
                        iconBg="bg-green-50"
                        iconColor="text-green-600"
                    />
                </div>
            </div>
        </div>
    );
}
