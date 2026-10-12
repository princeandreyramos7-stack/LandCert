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
import { BellRing, Loader2, Send, Users } from "lucide-react";

const MAX_MESSAGE = 1000;

const sentAt = (iso) =>
    iso
        ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
        : "";

/**
 * The Zoning Administrator's notifications to the Zoning Officers. Each
 * officer gets it in the bell and under "From the Zoning Administrator" on
 * their dashboard (OfficerNoticeController).
 */
export default function OfficerNotices({ officers = [], notices = [] }) {
    const { toast } = useToast();
    const form = useForm({ title: "", message: "", is_important: false, recipients: "all", user_ids: [] });
    const { data, setData, errors, processing } = form;

    const toggleOfficer = (id, checked) =>
        setData("user_ids", checked ? [...data.user_ids, id] : data.user_ids.filter((x) => x !== id));

    const count = data.recipients === "all" ? officers.length : data.user_ids.length;

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
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0d1f5c]">
                            <BellRing className="h-6 w-6" /> Notify Officers
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Send the Zoning Officers a notification. They see it in their notification bell and under
                            &ldquo;From the Zoning Administrator&rdquo; on their dashboard.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
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
                            <div className="mt-1 flex justify-between text-xs">
                                <span className="text-red-600">{errors.message}</span>
                                <span className="text-gray-400">{data.message.length}/{MAX_MESSAGE}</span>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <Switch checked={data.is_important} onCheckedChange={(v) => setData("is_important", v)} />
                            Mark as Important
                        </label>

                        <fieldset className="space-y-2">
                            <legend className="text-sm font-medium text-gray-700">Send to</legend>
                            <div className="flex flex-wrap gap-4 text-sm">
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
                                            <span className="truncate">
                                                {officer.name} <span className="text-gray-400">· {officer.email}</span>
                                            </span>
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
                                className="gap-2 bg-[#0d1f5c] hover:bg-[#0d1f5c]/90"
                            >
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Send to {count} officer{count === 1 ? "" : "s"}
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
                                            <p className="text-sm font-bold text-gray-900">{notice.title}</p>
                                            <span className="ml-auto text-xs text-gray-400">{sentAt(notice.sent_at)}</span>
                                        </div>
                                        <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{notice.message}</p>
                                        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-gray-500">
                                            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            <span>
                                                To {notice.recipients.join(", ")}
                                                {notice.sent_by && <> · by {notice.sent_by}</>}
                                            </span>
                                        </p>
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
