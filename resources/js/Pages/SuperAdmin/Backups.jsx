import React, { useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { Button } from "@/Components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/Components/ui/dialog";
import {
    DatabaseBackup, Download, Trash2, Play, Clock, CheckCircle2, XCircle, HardDrive, CalendarClock, Loader2, Info,
} from "lucide-react";

const fmtBytes = (n) => {
    if (!n) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
    return `${(n / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }) : "—";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Backups, for the Zoning Administrator: what is on the disk, how the last
 * run went and when the next one is, a backup on demand, and the choice of
 * daily or weekly.
 */
export default function Backups({ backups = [], totalSize = 0, schedule, nextRun, lastRun, keepDays = 7 }) {
    const { flash } = usePage().props;
    const [running, setRunning] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);

    const form = useForm({
        frequency: schedule?.frequency ?? "daily",
        time: schedule?.time ?? "02:00",
        day: schedule?.day ?? 0,
    });

    const runNow = () => {
        setRunning(true);
        router.post(route("super-admin.backups.run"), {}, {
            preserveScroll: true,
            onFinish: () => setRunning(false),
        });
    };

    const saveSchedule = (e) => {
        e.preventDefault();
        form.put(route("super-admin.backups.schedule"), { preserveScroll: true });
    };

    const remove = () => {
        const file = pendingDelete;
        setPendingDelete(null);
        router.delete(route("super-admin.backups.destroy", file), { preserveScroll: true });
    };

    const latest = backups[0];

    return (
        <>
            <Head title="Backups — Zoning Administrator" />
            <SuperAdminLayout title="Backups" breadcrumbs={[{ label: "Dashboard", href: "/super-admin/dashboard" }]}>
                {/* Header */}
                <div className="mb-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl p-2.5" style={{ background: "rgba(13,31,92,0.06)" }}>
                                <DatabaseBackup className="h-6 w-6 text-[#0d1f5c]" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-[#0d1f5c]">Backups</h1>
                                <p className="mt-0.5 text-xs text-gray-400">
                                    Every record in the database and every uploaded file, zipped and kept on the server
                                </p>
                            </div>
                        </div>
                        <Button onClick={runNow} disabled={running} className="gap-2 bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90">
                            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            {running ? "Backing up…" : "Back up now"}
                        </Button>
                    </div>
                    {(flash?.success || flash?.error) && (
                        <div className={`mt-4 rounded-lg border px-3 py-2 text-sm ${flash.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                            {flash.error || flash.success}
                        </div>
                    )}
                </div>

                {/* Status tiles */}
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Tile
                        icon={lastRun ? (lastRun.ok ? CheckCircle2 : XCircle) : Clock}
                        tone={lastRun ? (lastRun.ok ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50") : "text-gray-500 bg-gray-50"}
                        label="Last run"
                        value={lastRun ? (lastRun.ok ? "Completed" : "Failed") : "No run recorded"}
                        note={lastRun ? `${fmtDate(lastRun.at)}${lastRun.trigger === "manual" ? " · by hand" : " · scheduled"}` : latest ? `Latest file ${fmtDate(latest.created_at)}` : "Nothing yet"}
                    />
                    <Tile icon={CalendarClock} tone="text-[#0d1f5c] bg-[#0d1f5c]/5" label="Next automatic run" value={fmtDate(nextRun)} note={schedule?.frequency === "weekly" ? `Every ${DAYS[schedule.day]} at ${schedule.time}` : `Every day at ${schedule?.time}`} />
                    <Tile icon={HardDrive} tone="text-[#d4a017] bg-[#d4a017]/10" label="On disk" value={`${backups.length} backup${backups.length === 1 ? "" : "s"}`} note={fmtBytes(totalSize)} />
                    <Tile icon={Info} tone="text-gray-600 bg-gray-50" label="Kept" value={`All for ${keepDays} days`} note="then daily, weekly and monthly copies" />
                </div>

                {lastRun && !lastRun.ok && lastRun.message && (
                    <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        <span className="font-semibold">The last backup failed:</span> {lastRun.message}
                    </div>
                )}

                <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
                    {/* Files */}
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-3">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-[#0d1f5c]">Backup files</h2>
                        </div>
                        {backups.length === 0 ? (
                            <p className="px-5 py-10 text-center text-sm text-gray-400">No backups on the server yet. Take one with the button above.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {backups.map((b, i) => (
                                    <li key={b.path} className="flex flex-wrap items-center gap-3 px-5 py-3">
                                        <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
                                            <DatabaseBackup className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-mono text-xs font-semibold text-gray-900">
                                                {b.name}
                                                {i === 0 && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 font-sans text-[10px] font-bold uppercase text-emerald-700">latest</span>}
                                            </p>
                                            <p className="text-[11px] text-gray-400">{fmtDate(b.created_at)} · {fmtBytes(b.size)}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <a
                                                href={route("super-admin.backups.download", b.name)}
                                                className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-200 px-2.5 text-xs font-semibold text-[#0d1f5c] transition-colors hover:border-[#d4a017] hover:text-[#d4a017]"
                                            >
                                                <Download className="h-3.5 w-3.5" /> Download
                                            </a>
                                            <Button variant="ghost" size="sm" onClick={() => setPendingDelete(b.name)} className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600" aria-label="Delete backup">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Schedule */}
                    <form onSubmit={saveSchedule} className="h-fit rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-[#0d1f5c]">Automatic backup</h2>
                        <p className="mt-1 text-xs text-gray-400">Runs on its own at the time set here.</p>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {["daily", "weekly"].map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => form.setData("frequency", f)}
                                    className={`rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition-colors ${form.data.frequency === f ? "border-[#0d1f5c] bg-[#0d1f5c] text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {form.data.frequency === "weekly" && (
                            <label className="mt-3 block text-xs font-medium text-gray-700">
                                Day
                                <select
                                    value={form.data.day}
                                    onChange={(e) => form.setData("day", Number(e.target.value))}
                                    className="mt-1 w-full rounded-md border border-gray-200 px-2 py-2 text-sm"
                                >
                                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                                </select>
                            </label>
                        )}

                        <label className="mt-3 block text-xs font-medium text-gray-700">
                            Time
                            <input
                                type="time"
                                value={form.data.time}
                                onChange={(e) => form.setData("time", e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-200 px-2 py-2 text-sm"
                            />
                        </label>
                        {form.errors.time && <p className="mt-1 text-xs text-rose-600">{form.errors.time}</p>}

                        <Button type="submit" disabled={form.processing} className="mt-4 w-full bg-[#d4a017] text-[#0d1f5c] hover:bg-[#d4a017]/90">
                            {form.processing ? "Saving…" : "Save schedule"}
                        </Button>

                        <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
                            Backups are stored on this server. Download one now and then and keep it somewhere else — a server that is lost takes its own backups with it.
                        </p>
                    </form>
                </div>

                <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete this backup?</DialogTitle>
                            <DialogDescription>
                                <span className="font-mono text-xs">{pendingDelete}</span> will be removed from the server. This cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setPendingDelete(null)}>Keep it</Button>
                            <Button onClick={remove} className="bg-rose-600 text-white hover:bg-rose-700">Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SuperAdminLayout>
        </>
    );
}

function Tile({ icon: Icon, tone, label, value, note }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <div className={`rounded-lg p-2 ${tone}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                <p className="truncate text-sm font-black text-gray-900">{value}</p>
                {note && <p className="truncate text-[11px] text-gray-400">{note}</p>}
            </div>
        </div>
    );
}
