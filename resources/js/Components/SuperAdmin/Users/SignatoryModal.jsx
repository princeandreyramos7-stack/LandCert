import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
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
import { useToast } from "@/Components/ui/use-toast";
import { PenLine, Upload, Loader2, CalendarDays } from "lucide-react";
import { DEFAULT_OFFICER_POSITION, DEFAULT_ADMINISTRATOR_POSITION } from "@/lib/signerName";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * The administrator sets how a staff member signs: their e-signature image
 * and the position printed under their name, in force from a date.
 *
 * Nothing already issued changes. A certificate issued before the date keeps
 * the signature and title it was issued with; from the date on, documents
 * carry the new ones. That is what lets staff rotate without old documents
 * quietly re-signing themselves.
 */
export function SignatoryModal({ user, isOpen, onClose }) {
    const { toast } = useToast();
    const fileRef = useRef(null);
    const [position, setPosition] = useState("");
    const [effectiveFrom, setEffectiveFrom] = useState(today());
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && user) {
            setPosition(user.position || "");
            setEffectiveFrom(today());
            setFile(null);
            setPreview(null);
            setErrors({});
        }
    }, [isOpen, user]);

    if (!user) return null;

    const fallback = user.user_type === "super_admin" ? DEFAULT_ADMINISTRATOR_POSITION : DEFAULT_OFFICER_POSITION;

    const pick = (e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (!f) return;
        if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) { setErrors({ signature: "Use a PNG (transparent background works best), JPG or WebP." }); return; }
        if (f.size > 2 * 1024 * 1024) { setErrors({ signature: "The image must be 2 MB or smaller." }); return; }
        setErrors({});
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const submit = (e) => {
        e.preventDefault();
        const changedPosition = position.trim() !== (user.position || "").trim();
        if (!file && !changedPosition) {
            setErrors({ position: "Change the position, choose a new signature, or both." });
            return;
        }
        setSaving(true);
        router.post(
            route("super-admin.users.signatory", user.id),
            { position: position.trim(), effective_from: effectiveFrom, signature: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast({ title: "Signatory settings saved", description: `${user.name}: in force from ${effectiveFrom}.` });
                    onClose();
                },
                onError: (errs) => setErrors(errs),
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg bg-white sm:rounded-2xl">
                <DialogHeader className="text-left">
                    <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                        <PenLine className="h-4 w-4 text-[#0d1f5c]" />
                        Signatory settings — {user.name}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        How this {user.user_type === "super_admin" ? "administrator" : "officer"} signs certificates, clearances and orders of payment.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="position">Position printed under the name</Label>
                        <Input
                            id="position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            placeholder={fallback}
                            maxLength={150}
                        />
                        <p className="text-xs text-gray-400">Use " / " to print a two-line title, e.g. <span className="font-mono">City Planning &amp; Development Coordinator / Zoning Administrator</span>.</p>
                        {errors.position && <p className="text-sm text-red-600">{errors.position}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>E-signature</Label>
                        <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-3">
                            <div className="flex h-16 w-40 shrink-0 items-center justify-center rounded bg-gray-50">
                                {preview || user.signature_url ? (
                                    <img src={preview || user.signature_url} alt="" className="max-h-14 max-w-full object-contain" />
                                ) : (
                                    <span className="text-xs text-gray-400">No signature on file</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1 text-sm">
                                <p className="text-gray-700">
                                    {preview ? <span className="font-medium">New signature chosen</span> : user.signature_url ? <>On file{user.signature_since ? ` since ${user.signature_since}` : ""}</> : "Nothing on file"}
                                </p>
                                <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp" className="sr-only" onChange={pick} />
                                <Button type="button" variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => fileRef.current?.click()}>
                                    <Upload className="h-3.5 w-3.5" /> {user.signature_url ? "Replace signature" : "Upload signature"}
                                </Button>
                            </div>
                        </div>
                        {errors.signature && <p className="text-sm text-red-600">{errors.signature}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="effective_from" className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> In force from</Label>
                        <Input id="effective_from" type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} className="w-48" />
                        <p className="text-xs text-gray-400">
                            Documents issued from this date print the new signature and position. Anything issued before it keeps what it was issued with.
                        </p>
                        {errors.effective_from && <p className="text-sm text-red-600">{errors.effective_from}</p>}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                        <Button type="submit" className="bg-[#0d1f5c] hover:bg-[#0d1f5c]/90" disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
