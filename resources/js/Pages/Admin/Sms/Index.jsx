import { Head, useForm, usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
    MessageSquare, Users, Search, CheckSquare, Square,
    Send, RefreshCw, Smartphone, AlertCircle, CheckCircle2,
    FileText, ChevronDown, ChevronUp, Settings, RotateCcw,
    ToggleLeft, ToggleRight, Edit3, Save, X,
} from "lucide-react";

/* ── Char counter ──────────────────────────────────────────── */
function CharCount({ text }) {
    const len  = text.length;
    const segs = Math.ceil(len / 160) || 1;
    const cls  = len > 300 ? "text-red-500" : len > 160 ? "text-amber-500" : "text-gray-400";
    return (
        <span className={`text-xs font-mono ${cls}`}>
            {len} chars {segs > 1 && <span className="text-amber-500">({segs} SMS segments)</span>}
        </span>
    );
}

/* ── User row ──────────────────────────────────────────────── */
function UserRow({ user, selected, onToggle }) {
    return (
        <tr className={`border-b border-gray-50 hover:bg-[#0d1f5c]/[0.02] cursor-pointer transition-colors ${selected ? "bg-[#0d1f5c]/[0.03]" : ""}`}
            onClick={() => onToggle(user.id)}>
            <td className="px-4 py-3 w-10">
                {selected ? <CheckSquare className="w-4 h-4 text-[#0d1f5c]"/> : <Square className="w-4 h-4 text-gray-300"/>}
            </td>
            <td className="px-4 py-3">
                <p className="font-semibold text-[#0d1f5c] text-sm">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
            </td>
            <td className="px-4 py-3 font-mono text-sm text-gray-600">{user.contact_number}</td>
            <td className="px-4 py-3">
                <Badge className="bg-[#0d1f5c]/10 text-[#0d1f5c] border-[#0d1f5c]/20 text-xs">{user.user_type}</Badge>
            </td>
        </tr>
    );
}

/* ── Auto-template card ────────────────────────────────────── */
function TemplateCard({ tpl, updateRoute, resetRoute }) {
    const [editing, setEditing] = useState(false);
    const [msg, setMsg]         = useState(tpl.message);
    const [saving, setSaving]   = useState(false);
    const [enabled, setEnabled] = useState(tpl.enabled);

    const save = () => {
        setSaving(true);
        router.put(route(updateRoute, tpl.id), { message: msg, enabled },
            {
                preserveScroll: true,
                onSuccess: () => { setSaving(false); setEditing(false); },
                onError:   () =>  setSaving(false),
            }
        );
    };

    const reset = () => {
        if (!confirm(`Reset "${tpl.event_label}" to default message?`)) return;
        router.post(route(resetRoute, tpl.id), {}, {
            preserveScroll: true,
            onSuccess: () => { setMsg(tpl.message); setEditing(false); },
        });
    };

    const toggleEnabled = () => {
        const next = !enabled;
        setEnabled(next);
        router.put(route(updateRoute, tpl.id), { message: msg, enabled: next }, { preserveScroll: true });
    };

    const vars = tpl.variables || [];

    return (
        <Card className={`bg-white shadow-sm border ${enabled ? "border-gray-100" : "border-gray-100 opacity-60"} overflow-hidden`}>
            <CardHeader className="px-5 py-4 border-b border-gray-50">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="font-bold text-[#0d1f5c] text-sm">{tpl.event_label}</h3>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{tpl.event_key}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={toggleEnabled} title={enabled ? "Disable" : "Enable"}
                            className={`transition-colors ${enabled ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-gray-600"}`}>
                            {enabled ? <ToggleRight className="w-5 h-5"/> : <ToggleLeft className="w-5 h-5"/>}
                        </button>
                        <button onClick={reset} title="Reset to default"
                            className="text-gray-400 hover:text-amber-600 transition-colors">
                            <RotateCcw className="w-4 h-4"/>
                        </button>
                        <button onClick={() => setEditing(v => !v)} title="Edit"
                            className={`transition-colors ${editing ? "text-[#d4a017]" : "text-gray-400 hover:text-[#0d1f5c]"}`}>
                            <Edit3 className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
                {/* Available variables */}
                {vars.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {vars.map(v => (
                            <span key={v} className="px-1.5 py-0.5 rounded bg-[#0d1f5c]/5 text-[#0d1f5c] text-[10px] font-mono cursor-pointer hover:bg-[#0d1f5c]/10"
                                onClick={() => editing && setMsg(m => m + v)}>
                                {v}
                            </span>
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1 self-center">click to insert</span>
                    </div>
                )}

                {editing ? (
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs font-semibold text-[#0d1f5c]">Message</label>
                            <CharCount text={msg}/>
                        </div>
                        <textarea rows={4} value={msg} onChange={e => setMsg(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#d4a017]/30 focus:border-[#d4a017]"/>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => { setEditing(false); setMsg(tpl.message); }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                                <X className="w-3 h-3"/> Cancel
                            </button>
                            <button onClick={save} disabled={saving}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-60"
                                style={{ background: "linear-gradient(90deg,#0d1f5c,#1a3a8f)" }}>
                                {saving ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>}
                                {saving ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/60 px-3 py-2.5 rounded-lg border border-gray-100">
                        {msg || <span className="text-gray-300 italic">No message set</span>}
                    </p>
                )}

                {!enabled && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0"/>
                        This notification is disabled — no SMS will be sent for this event.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function SmsIndex({ users = [], stats = {}, broadcastTpls = [], autoTemplates = [] }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.user?.user_type === "super_admin";
    const Layout    = isSuperAdmin ? SuperAdminLayout : AdminLayout;
    const prefix    = isSuperAdmin ? "super-admin" : "admin";
    const breadcrumbs = [{ label: "Dashboard", href: `/${prefix}/dashboard` }];

    const flash = usePage().props.flash;

    const [activeTab,       setActiveTab]       = useState("broadcast");
    const [search,          setSearch]          = useState("");
    const [showBroadcastTpl,setShowBroadcastTpl]= useState(false);

    const { data, setData, post, processing } = useForm({
        recipients: "all",
        user_ids:   [],
        message:    "",
    });

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return users.filter(u => !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.contact_number?.includes(q));
    }, [users, search]);

    const allSelected = filtered.length > 0 && filtered.every(u => data.user_ids.includes(u.id));

    const toggleUser = id => setData("user_ids", data.user_ids.includes(id)
        ? data.user_ids.filter(x => x !== id)
        : [...data.user_ids, id]
    );

    const toggleAll = () => {
        if (allSelected) {
            setData("user_ids", data.user_ids.filter(id => !filtered.some(u => u.id === id)));
        } else {
            setData("user_ids", [...new Set([...data.user_ids, ...filtered.map(u => u.id)])]);
        }
    };

    const recipientCount = data.recipients === "all" ? stats.with_phone : data.user_ids.length;

    const submit = e => {
        e.preventDefault();
        if (!data.message.trim() || (data.recipients === "selected" && data.user_ids.length === 0)) return;
        post(route(`${prefix}.sms.send`));
    };

    return (
        <>
            <Head title="SMS — CPDO"/>
            <Layout title="SMS Notifications" breadcrumbs={breadcrumbs}>

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl mb-5 text-sm">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600"/>{flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-500"/>{flash.error}
                    </div>
                )}

                {/* Page header */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#d4a017]/10 border border-[#d4a017]/20">
                                <MessageSquare className="h-6 w-6 text-[#d4a017]"/>
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-[#0d1f5c]">SMS Notifications</h1>
                                <p className="text-xs text-gray-400 mt-0.5">Broadcast messages &amp; manage auto-notification templates</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${stats.sms_enabled ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${stats.sms_enabled ? "bg-green-500 animate-pulse" : "bg-red-500"}`}/>
                                {stats.sms_enabled ? "SMS Active" : "SMS Disabled"}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-[#0d1f5c]/20 bg-[#0d1f5c]/5 text-[#0d1f5c]">
                                <Smartphone className="w-3.5 h-3.5"/> {stats.sender}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-5">
                    {[
                        { key: "broadcast", label: "Broadcast SMS",              icon: Send },
                        ...(isSuperAdmin ? [{ key: "templates", label: "Auto-Notification Templates", icon: Settings }] : []),
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${
                                activeTab === tab.key
                                    ? "bg-white border-[#0d1f5c] text-[#0d1f5c] shadow-sm"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}>
                            <tab.icon className="w-4 h-4"/> {tab.label}
                        </button>
                    ))}
                </div>

                {/* ══════════════════════════════════════════════
                    TAB: BROADCAST
                   ══════════════════════════════════════════════ */}
                {activeTab === "broadcast" && (
                    <>
                        {/* Stat cards */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <Card className="border-l-4 border-l-[#0d1f5c] bg-white shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Applicants</p>
                                    <p className="text-3xl font-black text-[#0d1f5c]">{stats.total_users}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-l-4 border-l-[#d4a017] bg-white shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">With Phone</p>
                                    <p className="text-3xl font-black text-[#0d1f5c]">{stats.with_phone}</p>
                                </CardContent>
                            </Card>
                            <Card className={`border-l-4 ${recipientCount > 0 ? "border-l-green-500" : "border-l-gray-300"} bg-white shadow-sm`}>
                                <CardContent className="p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Will Receive</p>
                                    <p className={`text-3xl font-black ${recipientCount > 0 ? "text-green-700" : "text-gray-400"}`}>{recipientCount}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                                {/* Left: Compose */}
                                <div className="space-y-4">
                                    {/* Recipients */}
                                    <Card className="bg-white shadow-sm border border-gray-100">
                                        <CardHeader className="border-b border-gray-50 px-5 py-4">
                                            <CardTitle className="text-sm font-bold text-[#0d1f5c] uppercase tracking-wide flex items-center gap-2">
                                                <Users className="w-4 h-4 text-[#d4a017]"/> Recipients
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-5 space-y-3">
                                            {[
                                                { value: "all",      label: "All Users with Phone", desc: `${stats.with_phone} recipients` },
                                                { value: "selected", label: "Selected Users",        desc: `${data.user_ids.length} selected` },
                                            ].map(opt => (
                                                <label key={opt.value}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${data.recipients === opt.value ? "border-[#0d1f5c] bg-[#0d1f5c]/[0.03]" : "border-gray-100 hover:border-gray-200"}`}>
                                                    <input type="radio" name="recipients" value={opt.value}
                                                        checked={data.recipients === opt.value}
                                                        onChange={() => setData("recipients", opt.value)}
                                                        className="accent-[#0d1f5c] w-4 h-4"/>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#0d1f5c]">{opt.label}</p>
                                                        <p className="text-xs text-gray-400">{opt.desc}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    {/* Message */}
                                    <Card className="bg-white shadow-sm border border-gray-100">
                                        <CardHeader className="border-b border-gray-50 px-5 py-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-bold text-[#0d1f5c] uppercase tracking-wide flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-[#d4a017]"/> Message
                                                </CardTitle>
                                                <button type="button" onClick={() => setShowBroadcastTpl(v => !v)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-[#0d1f5c] hover:text-[#d4a017] transition-colors">
                                                    Templates {showBroadcastTpl ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
                                                </button>
                                            </div>
                                        </CardHeader>

                                        {showBroadcastTpl && (
                                            <div className="border-b border-gray-50 p-4 space-y-2 bg-gray-50/50">
                                                {broadcastTpls.map((tpl, i) => (
                                                    <button key={i} type="button"
                                                        onClick={() => { setData("message", tpl.message); setShowBroadcastTpl(false); }}
                                                        className="w-full text-left px-3 py-2.5 rounded-lg border border-gray-100 bg-white hover:border-[#d4a017] hover:bg-[#d4a017]/5 transition-all group">
                                                        <p className="text-xs font-bold text-[#0d1f5c] group-hover:text-[#d4a017]">{tpl.label}</p>
                                                        {tpl.message && <p className="text-xs text-gray-400 mt-0.5 truncate">{tpl.message}</p>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <CardContent className="p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold text-[#0d1f5c]">
                                                    Text <span className="text-gray-400 font-normal">— use <code className="bg-gray-100 px-1 rounded">{"{name}"}</code> to personalise</span>
                                                </label>
                                                <CharCount text={data.message}/>
                                            </div>
                                            <textarea rows={6} value={data.message}
                                                onChange={e => setData("message", e.target.value)}
                                                placeholder="Type your message… {name} will be replaced per recipient."
                                                required
                                                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#d4a017]/30 focus:border-[#d4a017]"/>

                                            {data.message && (
                                                <div className="bg-[#0d1f5c]/[0.03] border border-[#0d1f5c]/10 rounded-lg p-3">
                                                    <p className="text-[10px] font-black text-[#0d1f5c] uppercase tracking-widest mb-1.5">Preview</p>
                                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                        {data.message.replace(/{name}/g, "Juan Dela Cruz")}
                                                    </p>
                                                </div>
                                            )}

                                            <Button type="submit"
                                                disabled={processing || !data.message.trim() || (data.recipients === "selected" && data.user_ids.length === 0)}
                                                className="w-full gap-2 font-bold text-white disabled:opacity-50"
                                                style={{ background: "linear-gradient(90deg,#0d1f5c,#1a3a8f)" }}>
                                                {processing
                                                    ? <><RefreshCw className="w-4 h-4 animate-spin"/> Sending…</>
                                                    : <><Send className="w-4 h-4"/> Send to {recipientCount} Recipient{recipientCount !== 1 ? "s" : ""}</>
                                                }
                                            </Button>

                                            {data.recipients === "selected" && data.user_ids.length === 0 && (
                                                <p className="text-xs text-amber-600 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5"/> Select at least one user.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right: User selector */}
                                <div>
                                    <Card className={`bg-white shadow-sm border border-gray-100 overflow-hidden ${data.recipients === "all" ? "opacity-60 pointer-events-none" : ""}`}>
                                        <CardHeader className="border-b border-gray-50 px-5 py-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <CardTitle className="text-sm font-bold text-[#0d1f5c] uppercase tracking-wide flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-[#d4a017]"/> Select Users
                                                    {data.user_ids.length > 0 && (
                                                        <Badge className="bg-[#0d1f5c] text-white text-xs ml-1">{data.user_ids.length}</Badge>
                                                    )}
                                                </CardTitle>
                                                <button type="button" onClick={toggleAll}
                                                    className="text-xs font-bold text-[#0d1f5c] hover:text-[#d4a017] transition-colors">
                                                    {allSelected ? "Deselect All" : "Select All"}
                                                </button>
                                            </div>
                                            <div className="relative mt-3">
                                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
                                                <Input placeholder="Search users…" value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                    className="pl-9 border-gray-200 focus:border-[#d4a017] h-9 text-sm"/>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="overflow-y-auto max-h-[500px]">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                                                        <tr>
                                                            <th className="w-10 px-4 py-3"/>
                                                            <th className="text-left px-4 py-3 text-[#0d1f5c] font-bold text-xs uppercase tracking-wide">User</th>
                                                            <th className="text-left px-4 py-3 text-[#0d1f5c] font-bold text-xs uppercase tracking-wide">Phone</th>
                                                            <th className="text-left px-4 py-3 text-[#0d1f5c] font-bold text-xs uppercase tracking-wide">Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filtered.length === 0 ? (
                                                            <tr><td colSpan={4} className="py-10 text-center text-gray-400 text-sm">No users with phone numbers</td></tr>
                                                        ) : filtered.map(u => (
                                                            <UserRow key={u.id} user={u}
                                                                selected={data.user_ids.includes(u.id)}
                                                                onToggle={toggleUser}/>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
                                                Showing {filtered.length} of {users.length} users with phone numbers
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {data.recipients === "all" && (
                                        <p className="mt-2 text-xs text-gray-400 text-center">Switch to "Selected Users" to pick individual recipients</p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </>
                )}

                {/* ══════════════════════════════════════════════
                    TAB: AUTO-NOTIFICATION TEMPLATES
                   ══════════════════════════════════════════════ */}
                {/* Templates tab — super admin only */}
                {activeTab === "templates" && isSuperAdmin && (
                    <div className="space-y-4">
                        <div className="bg-[#0d1f5c]/[0.03] border border-[#0d1f5c]/10 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-[#0d1f5c] shrink-0 mt-0.5"/>
                            <div className="text-sm text-[#0d1f5c]">
                                <p className="font-bold mb-1">Auto-Notification Templates</p>
                                <p className="text-gray-500 text-xs leading-relaxed">
                                    These messages are sent automatically when the corresponding action occurs in the system.
                                    Click the edit icon on any card to customise the message. Use the variable badges to insert dynamic fields.
                                    Toggle the switch to enable or disable individual notifications.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {autoTemplates.map(tpl => (
                                <TemplateCard key={tpl.id} tpl={tpl}
                                    updateRoute={`${prefix}.sms.templates.update`}
                                    resetRoute={`${prefix}.sms.templates.reset`}/>
                            ))}
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
}
