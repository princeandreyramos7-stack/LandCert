import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { fetchWithCsrf } from "@/lib/csrf";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Archive, AlertTriangle } from "lucide-react";

/**
 * Archives every closed application (released/collected/completed/rejected -
 * same rule as the per-row archive button) filed within a date range, in one
 * action. A preview is required before the button that actually archives
 * anything is enabled, so the office sees the count before committing - and
 * changing either date after previewing clears that count, so it can never
 * be stale by the time "Confirm" is pressed.
 */
export function BatchArchiveModal({ isOpen, onClose, routeName }) {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [preview, setPreview] = useState(null); // { count, sample }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const reset = () => {
        setDateFrom("");
        setDateTo("");
        setPreview(null);
        setError("");
    };

    const close = () => {
        reset();
        onClose();
    };

    const runPreview = async () => {
        if (!dateFrom || !dateTo) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetchWithCsrf(route(routeName), {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ date_from: dateFrom, date_to: dateTo, dry_run: true }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.message || "Could not check that date range.");
                return;
            }
            setPreview({ count: data.count, sample: data.sample || [], forDates: `${dateFrom}|${dateTo}` });
        } catch {
            setError("Could not reach the server. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const confirmArchive = () => {
        setLoading(true);
        router.post(
            route(routeName),
            { date_from: dateFrom, date_to: dateTo },
            {
                preserveScroll: true,
                onFinish: () => setLoading(false),
                onSuccess: close,
            }
        );
    };

    // A stale preview (run before the dates were last changed) never enables Confirm.
    const previewMatchesDates = preview?.forDates === `${dateFrom}|${dateTo}`;
    const canConfirm = previewMatchesDates && preview.count > 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
            <DialogContent role="dialog" aria-modal="true" aria-label="Batch archive applications" className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Archive className="h-5 w-5 text-[#0d1f5c]" />
                        Batch Archive
                    </DialogTitle>
                    <DialogDescription>
                        Archives every released, collected, completed, or rejected application filed in this date range.
                        An application still pending or in review is left untouched, even if it falls in the range.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 py-2">
                    <div>
                        <Label htmlFor="batch-archive-from">Date From</Label>
                        <Input
                            id="batch-archive-from"
                            type="date"
                            value={dateFrom}
                            max={dateTo || undefined}
                            onChange={(e) => { setDateFrom(e.target.value); setPreview(null); }}
                        />
                    </div>
                    <div>
                        <Label htmlFor="batch-archive-to">Date To</Label>
                        <Input
                            id="batch-archive-to"
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => { setDateTo(e.target.value); setPreview(null); }}
                        />
                    </div>
                </div>

                {error && (
                    <p className="flex items-center gap-1.5 text-sm text-rose-600">
                        <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                    </p>
                )}

                {previewMatchesDates && (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
                        {preview.count === 0 ? (
                            <p className="text-gray-600">No closed applications were filed in that range.</p>
                        ) : (
                            <>
                                <p className="font-semibold text-gray-800">{preview.count} application(s) will be archived.</p>
                                <ul className="mt-1.5 space-y-0.5 text-xs text-gray-500">
                                    {preview.sample.map((r) => (
                                        <li key={r.application_number}>{r.application_number} · {r.status} · {r.created_at}</li>
                                    ))}
                                    {preview.count > preview.sample.length && (
                                        <li>…and {preview.count - preview.sample.length} more</li>
                                    )}
                                </ul>
                            </>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={close} disabled={loading}>Cancel</Button>
                    {canConfirm ? (
                        <Button type="button" onClick={confirmArchive} disabled={loading} className="bg-[#0d1f5c] hover:bg-[#0d1f5c]/90">
                            Archive {preview.count} application(s)
                        </Button>
                    ) : (
                        <Button type="button" onClick={runPreview} disabled={loading || !dateFrom || !dateTo}>
                            {loading ? "Checking…" : "Preview"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
