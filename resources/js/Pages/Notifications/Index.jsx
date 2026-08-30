import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import { useToast } from "@/Components/ui/use-toast";
import { Toaster } from "@/Components/ui/toaster";
import {
    Bell, CheckCheck, Trash2, MailOpen, Clock,
    AlertCircle, CheckCircle, Info, BellOff,
} from "lucide-react";
import { LiveRefresh } from "@/Components/LiveRefresh";

/* ── Helpers ─────────────────────────────────────────────── */
function formatDate(ds) {
    const date = new Date(ds);
    const now  = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)     return "Just now";
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

const TYPE_CFG = {
    success: { icon: CheckCircle, dot: "bg-green-500",  bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200", label: "Success" },
    warning: { icon: AlertCircle, dot: "bg-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Warning" },
    error:   { icon: AlertCircle, dot: "bg-red-500",    bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",   label: "Error"   },
    info:    { icon: Info,        dot: "bg-blue-500",   bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",  label: "Info"    },
};

function typeCfg(t) { return TYPE_CFG[t] || TYPE_CFG.info; }

/* ── Notification row ────────────────────────────────────── */
function NotifRow({ notif, onRead, onDelete }) {
    const cfg = typeCfg(notif.type);
    const Icon = cfg.icon;
    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all group
            ${notif.read ? "bg-white border-gray-100" : "bg-[#0d1f5c]/[0.03] border-[#0d1f5c]/15"}`}>
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.border} border`}>
                <Icon className={`w-5 h-5 ${cfg.text}`}/>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#0d1f5c] text-sm">{notif.title}</p>
                        {!notif.read && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#d4a017]/15 text-[#d4a017] text-[10px] font-black uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017]"/>New
                            </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            {cfg.label}
                        </span>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read && (
                            <button onClick={() => onRead(notif.id)} title="Mark as read"
                                className="p-1.5 rounded-lg hover:bg-[#0d1f5c]/5 text-gray-400 hover:text-[#0d1f5c] transition-colors">
                                <MailOpen className="w-4 h-4"/>
                            </button>
                        )}
                        <button onClick={() => onDelete(notif.id)} title="Delete"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">{notif.message}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3"/>{formatDate(notif.created_at)}
                    </span>
                    {notif.link && (
                        <button onClick={() => router.visit(notif.link)}
                            className="text-[#0d1f5c] font-semibold hover:text-[#d4a017] transition-colors">
                            View details →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Main page ───────────────────────────────────────────── */
export default function NotificationsPage({ notifications }) {
    const { toast } = useToast();
    const [list, setList] = useState(notifications.data || []);

    const unreadCount = list.filter(n => !n.read).length;

    const markRead = async (id) => {
        try {
            await axios.post("/notifications/mark-read", { id });
            setList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            toast({ title: "Marked as read" });
        } catch { toast({ title: "Error", variant: "destructive" }); }
    };

    const markAllRead = async () => {
        try {
            await axios.post("/notifications/mark-all-read");
            setList(prev => prev.map(n => ({ ...n, read: true })));
            toast({ title: "All marked as read" });
        } catch { toast({ title: "Error", variant: "destructive" }); }
    };

    const deleteNotif = async (id) => {
        try {
            await axios.delete(`/notifications/${id}`);
            setList(prev => prev.filter(n => n.id !== id));
            toast({ title: "Notification deleted" });
        } catch { toast({ title: "Error", variant: "destructive" }); }
    };

    const clearAll = async () => {
        if (!confirm("Delete all notifications?")) return;
        try {
            await axios.delete("/notifications");
            setList([]);
            toast({ title: "All notifications cleared" });
        } catch { toast({ title: "Error", variant: "destructive" }); }
    };

    return (
        <>
            <Head title="Notifications — CPDO"/>
            <ApplicantLayout title="Notifications">
                <LiveRefresh only={["notifications"]} items={notifications} label="notifications" className="justify-end mb-4" />
                <div className="space-y-5">
                    {/* Page header */}
                    <div className="relative overflow-hidden rounded-2xl text-white"
                        style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}>
                        <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                            <defs><pattern id="ng" width="48" height="48" patternUnits="userSpaceOnUse">
                                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#93c5fd" strokeWidth="0.7"/>
                            </pattern></defs>
                            <rect width="100%" height="100%" fill="url(#ng)"/>
                        </svg>
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#d4a017]/20 border border-[#d4a017]/30 flex items-center justify-center">
                                    <Bell className="w-6 h-6 text-[#d4a017]"/>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1 h-4 rounded-full bg-[#d4a017]"/>
                                        <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">CPDO L.C</p>
                                    </div>
                                    <h1 className="text-xl font-black">Notifications</h1>
                                    <p className="text-blue-200/70 text-sm">Stay updated on your application status</p>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <span className="shrink-0 px-3 py-1.5 rounded-full bg-[#d4a017] text-white text-xs font-black">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Toolbar */}
                    {list.length > 0 && (
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <p className="text-sm text-gray-500">
                                {list.length} notification{list.length !== 1 ? "s" : ""}
                                {unreadCount > 0 && <>, <span className="font-semibold text-[#0d1f5c]">{unreadCount} unread</span></>}
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={markAllRead} disabled={unreadCount === 0}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#0d1f5c]/20 text-[#0d1f5c] text-xs font-bold hover:bg-[#0d1f5c]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    <CheckCheck className="w-3.5 h-3.5"/>Mark all read
                                </button>
                                <button onClick={clearAll}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5"/>Clear all
                                </button>
                            </div>
                        </div>
                    )}

                    {/* List */}
                    {list.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#0d1f5c]/5 flex items-center justify-center mb-4">
                                <BellOff className="w-8 h-8 text-[#0d1f5c]/25"/>
                            </div>
                            <h3 className="font-bold text-gray-700 mb-1">No notifications yet</h3>
                            <p className="text-sm text-gray-400 max-w-xs">
                                You'll see updates about your applications here as they are processed.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {list.map(n => (
                                <NotifRow key={n.id} notif={n} onRead={markRead} onDelete={deleteNotif}/>
                            ))}
                        </div>
                    )}
                </div>
            </ApplicantLayout>
            <Toaster/>
        </>
    );
}
