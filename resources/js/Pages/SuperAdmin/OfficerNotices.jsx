import React from "react";
import { Head, useForm } from "@inertiajs/react";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Switch } from "@/Components/ui/switch";
import { Checkbox } from "@/Components/ui/checkbox";
import { useToast } from "@/Components/ui/use-toast";
import { AlertCircle, BellRing, Loader2, MessageSquare, PhoneOff, Send, Users } from "lucide-react";

const MAX_MESSAGE = 1000;

const sentAt = (iso) =>
    iso
        ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
        : "";

/**
 * The text an officer's phone receives - the same wording the server builds
 * (OfficerNoticeController::smsText), so the preview is what is sent.
 */
function smsText(title, message, important, max) {
    const text = `${important ? "IMPORTANT - " : ""}CPDO Notice: ${title.trim()}\n${message.trim()}`;
    if (text.length <= max) return text;
    const tail = "... (full notice on your CPDO dashboard)";
    return text.slice(0, max - tail.length).trimEnd() + tail;
}

/**
 * Everything the Zoning Administrator sends the Zoning Officers. Each notice
 * reaches them in the bell and under "From the Zoning Administrator" on their
 * dashboard, and - when "Also send as a text message" is on - on their phones
 * too. This page took over "SMS to Officers" (OfficerNoticeController).
 */
export default function OfficerNotices({ officers = [], notices = [], sms = { enabled: false, sender: "", max: 320 } }) {
    const { toast } = useToast();
    const form = useForm({ title: "", message: "", is_important: false, send_sms: false, recipients: "all", user_ids: [] });
    const { data, setData, errors, processing } = form;

    const toggleOfficer = (id, checked) =>
        setData("user_ids", checked ? [...data.user_ids, id] : data.user_ids.filter((x) => x !== id));

    const chosen = data.recipients === "all" ? officers : officers.filter((o) => data.user_ids.includes(o.id));
    const count = chosen.length;
    const noPhone = chosen.filter((o) => !o.has_phone);
    const text = smsText(data.title, data.message, data.is_important, sms.max);
    const parts = text.length <= 160 ? 1 : Math.ceil(text.length / 153);

    const submit = (e) => {
        e.preventDefault();
        form.post("/super-admin/officer-notices", {
            preserveScroll: true,
            onSuccess: (page) => {
                form.reset();
                toast({ title: "Sent", description: page.props.flash?.success || "The Zoning Officers have been notified." });
            },
            onError: () => toast({ variant: "destructive", title: "Not sent", description: "Check the form and try again." }),
        });
    };

    return (
        <>
            <Head title="Notify Officers" />
            <SuperAdminLayout title="Notify Officers" breadcrumbs={[{ label: "Dashboard", href: "/super-admin/dashboard" }]}>
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="shrink-0 rounded-xl p-2.5" style={{ background: "rgba(13,31,92,0.06)" }}>
                                <BellRing className="h-6 w-6 text-[#0d1f5c]" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg font-black text-[#0d1f5c]">Notify Officers</h1>
                                <p className="mt-0.5 text-xs text-gray-400">
                                    Notices to the Zoning Officers - in their notification bell and on their dashboard, and by text message when you turn it on
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                        <div>
                            <Label htmlFor="notice-title">Title</Label>
                            <Input
                                id="notice-title"
                                value={data.title}
                                maxLength={160}
                                onChange={(e) => setData("title", e.target.value)}
                                placeholder="e.g. Updated setback rule for river easements"
                                className="mt-1"
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                        </div>

                        <div>
                            <Label htmlFor="notice-message">Message</Label>
                            <Textarea
                                id="notice-message"
                                rows={5}
                                value={data.message}
                                maxLength={MAX_MESSAGE}
                                onChange={(e) => setData("message", e.target.value)}
                                placeholder="What the officers need to know or do."
                                className="mt-1"
                            />
                            <div className="mt-1 flex justify-between gap-2 text-xs">
                                <span className="text-red-600">{errors.message}</span>
                                <span className="shrink-0 text-gray-400">{data.message.length}/{MAX_MESSAGE}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
                            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                <Switch checked={data.is_important} onCheckedChange={(v) => setData("is_important", v)} />
                                Mark as Important
                            </label>
                            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                <Switch checked={data.send_sms} onCheckedChange={(v) => setData("send_sms", v)} />
                                <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-[#d4a017]" /> Also send as a text message</span>
                            </label>
                        </div>

                        {data.send_sms && (
                            <div className="space-y-3 rounded-xl border border-[#0d1f5c]/10 bg-[#0d1f5c]/[0.03] p-3 sm:p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0d1f5c]">
                                        Text message{sms.sender ? ` from ${sms.sender}` : ""}
                                    </p>
                                    <p className={`text-xs ${parts > 1 ? "font-semibold text-amber-700" : "text-gray-500"}`}>
                                        {text.length} characters · {parts} text{parts === 1 ? "" : "s"} each
                                    </p>
                                </div>
                                <p className="whitespace-pre-wrap break-words rounded-lg bg-white px-3 py-2 text-sm leading-relaxed text-gray-700 shadow-sm">
                                    {data.title.trim() || data.message.trim() ? text : <span className="italic text-gray-400">The title and message appear here as the officers' phones will show them.</span>}
                                </p>
                                <p className="text-xs text-gray-500">
                                    A long notice is cut at {sms.max} characters; the whole of it is always in the app.
                                </p>
                                {noPhone.length > 0 && (
                                    <p className="flex items-start gap-2 text-xs text-amber-800">
                                        <PhoneOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        <span>
                                            No mobile number on file for {noPhone.map((o) => o.name).join(", ")} - they get the notice in the app only.
                                        </span>
                                    </p>
                                )}
                                {!sms.enabled && (
                                    <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        <span><span className="font-semibold">SMS is switched off on this server.</span> The notice still goes out in the app, but no text will be delivered and each one is reported as failed.</span>
                                    </p>
                                )}
                            </div>
                        )}

                        <fieldset className="space-y-2">
                            <legend className="text-sm font-medium text-gray-700">Send to</legend>
                            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-4">
                                {[
                                    ["all", `All Zoning Officers (${officers.length})`],
                                    ["selected", "Selected officers"],
                                ].map(([value, label]) => (
                                    <label key={value} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="recipients"
                                            value={value}
                                            checked={data.recipients === value}
                                            onChange={() => setData("recipients", value)}
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                            {data.recipients === "selected" && (
                                <div className="grid gap-2 rounded-lg border border-gray-100 p-3 sm:grid-cols-2">
                                    {officers.length === 0 && <p className="text-sm text-gray-500">There are no Zoning Officer accounts.</p>}
                                    {officers.map((officer) => (
                                        <label key={officer.id} className="flex min-w-0 items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={data.user_ids.includes(officer.id)}
                                                onCheckedChange={(v) => toggleOfficer(officer.id, v === true)}
                                            />
                                            <span className="min-w-0 truncate">
                                                {officer.name} <span className="text-gray-400">· {officer.email}</span>
                                            </span>
                                            {!officer.has_phone && (
                                                <PhoneOff className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-label="No mobile number" />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {(errors.recipients || errors.user_ids) && (
                                <p className="text-xs text-red-600">{errors.recipients || errors.user_ids}</p>
                            )}
                        </fieldset>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing || !data.title.trim() || !data.message.trim() || count === 0}
                                className="w-full gap-2 bg-[#0d1f5c] hover:bg-[#0d1f5c]/90 sm:w-auto"
                            >
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Send to {count} officer{count === 1 ? "" : "s"}{data.send_sms ? " · in-app + SMS" : ""}
                            </Button>
                        </div>
                    </form>

                    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <header className="border-b border-gray-100 px-4 py-3">
                            <h2 className="text-base font-bold text-[#0d1f5c]">Sent</h2>
                        </header>
                        {notices.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-gray-500">Nothing has been sent yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {notices.map((notice) => (
                                    <li key={notice.id} className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {notice.is_important && (
                                                <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Important</span>
                                            )}
                                            {notice.via_sms && (
                                                <span className="inline-flex items-center gap-1 rounded bg-[#d4a017]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#8a6508]">
                                                    <MessageSquare className="h-3 w-3" /> SMS
                                                </span>
                                            )}
                                            <p className="min-w-0 break-words text-sm font-bold text-gray-900">{notice.title}</p>
                                            <span className="ml-auto text-xs text-gray-400">{sentAt(notice.sent_at)}</span>
                                        </div>
                                        <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-700">{notice.message}</p>
                                        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-gray-500">
                                            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            <span>
                                                To {notice.recipients.join(", ")}
                                                {notice.sent_by && <> · by {notice.sent_by}</>}
                                            </span>
                                        </p>
                                        {notice.via_sms && notice.sms_sent !== null && (
                                            <p className="mt-1 flex items-start gap-1.5 text-xs text-gray-500">
                                                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                <span>
                                                    Texted {notice.sms_sent}
                                                    {notice.sms_failed ? <span className="text-rose-600"> · {notice.sms_failed} failed</span> : null}
                                                    {notice.sms_skipped ? <span className="text-amber-700"> · {notice.sms_skipped} with no mobile number</span> : null}
                                                </span>
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </SuperAdminLayout>
        </>
    );
}
