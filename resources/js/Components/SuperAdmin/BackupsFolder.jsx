import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { fetchWithCsrf } from "@/lib/csrf";
import {
    FolderOpen, FileArchive, Download, Trash2, Play, Loader2, CheckCircle2, XCircle, CalendarClock, HardDrive, ChevronRight, RefreshCw,
} from "lucide-react";

const fmtBytes = (n) => {
    if (!n) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
    return `${(n / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};
const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }) : "—";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const api = async (method, url, body) => {
    const res = await fetchWithCsrf(url, {
        method,
        headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || (data.errors && Object.values(data.errors).flat()[0]) || `Request failed (${res.status})`);
    return data;
};

/**
 * The backups folder: every backup of the database and uploaded files, as a
 * folder the administrator opens from the sidebar - not a page of its own.
 * Take one now, download or delete one, and set when the automatic one runs.
 */
export default function BackupsFolder({ open, onOpenChange }) {
    const [folder, setFolder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(null); // "run" | "schedule" | file name
    const [notice, setNotice] = useState(null); // { ok, text }
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [schedule, setSchedule] = useState({ frequency: "daily", time: "02:00", day: 0 });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api("GET", route("super-admin.backups.index"));
            setFolder(data);
            if (data.schedule) setSchedule({ frequency: data.schedule.frequency ?? "daily", time: data.schedule.time ?? "02:00", day: data.schedule.day ?? 0 });
        } catch (e) {
            setNotice({ ok: false, text: e.message });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { if (open) { setNotice(null); load(); } }, [open, load]);

    const act = async (key, method, url, body, okText) => {
        setBusy(key);
        setNotice(null);
        try {
            const data = await api(method, url, body);
            setFolder(data);
            // A run that did not complete still answers 200 with the folder
            // and ok:false - the request worked, the backup did not.
            setNotice({ ok: data.ok !== false, text: data.message || okText });
        } catch (e) {
            setNotice({ ok: false, text: e.message });
            load();
        } finally {
            setBusy(null);
        }
    };

    const backups = folder?.backups ?? [];
    const lastRun = folder?.lastRun;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-3xl gap-0 overflow-hidden p-0">
                {/* Title bar, like a folder window */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-5 py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                        <span className="rounded-lg bg-[#d4a017]/15 p-2 text-[#d4a017]"><FolderOpen className="h-5 w-5" /></span>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="text-base font-black text-[#0d1f5c]">Backups</DialogTitle>
                            <DialogDescription className="flex items-center gap-1 text-[11px] text-gray-400 flex-wrap">
                                <span>Server</span><ChevronRight className="h-3 w-3" /><span>storage</span><ChevronRight className="h-3 w-3" /><span className="font-semibold text-gray-600">backups</span>
                                <span className="ml-2">· {backups.length} file{backups.length === 1 ? "" : "s"}, {fmtBytes(folder?.totalSize)}</span>
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="ghost" size="icon" onClick={load} disabled={loading} aria-label="Refresh" className="h-8 w-8 text-gray-500">
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                        <Button onClick={() => act("run", "POST", route("super-admin.backups.run"), null, "Backup completed.")} disabled={busy === "run"} className="h-9 gap-2 bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90 flex-1 sm:flex-none">
                            {busy === "run" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            <span className="hidden xs:inline">{busy === "run" ? "Backing up…" : "Back up now"}</span>
                            <span className="xs:hidden">{busy === "run" ? "..." : "Backup"}</span>
                        </Button>
                    </div>
                </div>

                {/* Status line */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-gray-100 px-5 py-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                        {lastRun ? (lastRun.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-rose-600" />) : <HardDrive className="h-3.5 w-3.5 text-gray-400" />}
                        {lastRun ? `Last run ${lastRun.ok ? "completed" : "failed"} · ${fmtDate(lastRun.at)}` : "No run recorded yet"}
                    </span>
                    <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-[#0d1f5c]" />Next automatic run {fmtDate(folder?.nextRun)}</span>
                    <span className="ml-auto hidden text-gray-400 sm:inline">All kept {folder?.keepDays ?? 7} days, then daily/weekly/monthly copies</span>
                </div>

                {notice && (
                    <div className={`px-5 py-2 text-sm ${notice.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{notice.text}</div>
                )}
                {lastRun && !lastRun.ok && lastRun.message && !notice && (
                    <div className="bg-rose-50 px-5 py-2 text-xs text-rose-700"><span className="font-semibold">The last backup failed:</span> {lastRun.message}</div>
                )}

                {/* Files */}
                <div className="max-h-[50vh] overflow-y-auto">
                    <div className="hidden grid-cols-[1fr_140px_80px_84px] gap-3 border-b border-gray-100 px-5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 sm:grid">
                        <span>Name</span><span>Date</span><span className="text-right">Size</span><span />
                    </div>
                    {loading && !folder ? (
                        <p className="px-5 py-10 text-center text-sm text-gray-400">Opening the folder…</p>
                    ) : backups.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <FolderOpen className="mx-auto h-8 w-8 text-gray-200" />
                            <p className="mt-2 text-sm font-semibold text-gray-600">This folder is empty</p>
                            <p className="text-xs text-gray-400">Press "Back up now" to make the first backup.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-50">
                            {backups.map((b, i) => (
                                <li key={b.name} className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-2 hover:bg-gray-50 sm:grid-cols-[1fr_140px_80px_84px]">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <FileArchive className="h-5 w-5 shrink-0 text-[#d4a017]" />
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-xs font-semibold text-gray-800">{b.name}</p>
                                            <p className="text-[11px] text-gray-400 sm:hidden">{fmtDate(b.created_at)} · {fmtBytes(b.size)}</p>
                                        </div>
                                        {i === 0 && <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">latest</span>}
                                    </div>
                                    <span className="hidden text-xs text-gray-500 sm:block">{fmtDate(b.created_at)}</span>
                                    <span className="hidden text-right text-xs text-gray-500 sm:block">{fmtBytes(b.size)}</span>
                                    <div className="flex items-center justify-end gap-0.5">
                                        <a href={route("super-admin.backups.download", b.name)} title="Download" aria-label={`Download ${b.name}`} className="rounded-md p-1.5 text-[#0d1f5c] hover:bg-[#0d1f5c]/10">
                                            <Download className="h-4 w-4" />
                                        </a>
                                        {confirmDelete === b.name ? (
                                            <button type="button" onClick={() => { setConfirmDelete(null); act(b.name, "DELETE", route("super-admin.backups.destroy", b.name), null, "Backup deleted."); }} className="rounded-md bg-rose-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-700">
                                                {busy === b.name ? "…" : "Delete?"}
                                            </button>
                                        ) : (
                                            <button type="button" onClick={() => setConfirmDelete(b.name)} onBlur={() => setTimeout(() => setConfirmDelete((c) => (c === b.name ? null : c)), 2500)} title="Delete" aria-label={`Delete ${b.name}`} className="rounded-md p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Automatic backup */}
                <form
                    onSubmit={(e) => { e.preventDefault(); act("schedule", "PUT", route("super-admin.backups.schedule"), schedule, "Schedule saved."); }}
                    className="flex flex-wrap items-center gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-3"
                >
                    <span className="mr-1 text-xs font-bold uppercase tracking-wide text-gray-500">Automatic backup</span>
                    <div className="flex overflow-hidden rounded-md border border-gray-200 bg-white text-xs font-semibold">
                        {["daily", "weekly"].map((f) => (
                            <button key={f} type="button" onClick={() => setSchedule((s) => ({ ...s, frequency: f }))} className={`px-3 py-1.5 capitalize ${schedule.frequency === f ? "bg-[#0d1f5c] text-white" : "text-gray-600 hover:bg-gray-50"}`}>{f}</button>
                        ))}
                    </div>
                    {schedule.frequency === "weekly" && (
                        <select value={schedule.day} onChange={(e) => setSchedule((s) => ({ ...s, day: Number(e.target.value) }))} aria-label="Day" className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs">
                            {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                        </select>
                    )}
                    <label className="flex items-center gap-1.5 text-xs text-gray-600">
                        at
                        <input type="time" value={schedule.time} onChange={(e) => setSchedule((s) => ({ ...s, time: e.target.value }))} className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs" />
                    </label>
                    <Button type="submit" size="sm" disabled={busy === "schedule"} className="h-8 bg-[#d4a017] px-3 text-xs font-bold text-[#0d1f5c] hover:bg-[#d4a017]/90">
                        {busy === "schedule" ? "Saving…" : "Save"}
                    </Button>
                    <span className="ml-auto text-[11px] text-gray-400">Download a copy now and then and keep it off this server.</span>
                </form>
            </DialogContent>
        </Dialog>
    );
}
