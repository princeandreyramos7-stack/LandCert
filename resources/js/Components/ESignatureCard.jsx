import { useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { PenLine, Upload, Loader2 } from "lucide-react";
import { DEFAULT_OFFICER_POSITION, DEFAULT_ADMINISTRATOR_POSITION } from "@/lib/signerName";

/**
 * My Profile, for staff: the e-signature that goes on the documents they
 * sign, and a way to replace it.
 *
 * A new signature is in force from the moment it is uploaded. Documents
 * issued from then on carry it; anything issued earlier keeps the signature
 * it was issued with. The printed position is shown but set by the
 * administrator (User Management → Signatory settings).
 */
export default function ESignatureCard() {
    const user = usePage().props.auth?.user;
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);

    if (!user || !["admin", "super_admin"].includes(user.user_type)) return null;

    const position = user.position || (user.user_type === "super_admin" ? DEFAULT_ADMINISTRATOR_POSITION : DEFAULT_OFFICER_POSITION);
    const src = preview || user.signature_url;

    const onFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setError("");
        setSaved(false);
        if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) { setError("Use a PNG (transparent background works best), JPG or WebP."); return; }
        if (file.size > 2 * 1024 * 1024) { setError("The image must be 2 MB or smaller."); return; }
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        router.post(route("profile.signature.update"), { signature: file }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setSaved(true),
            onError: (errs) => setError(errs.signature || "Upload failed. Please try again."),
            onFinish: () => { setUploading(false); setPreview(null); },
        });
    };

    return (
        <Card className="border-l-4 border-l-emerald-600">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PenLine className="w-5 h-5 text-emerald-700" />
                    E-signature
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                    Printed on the certificates, clearances and orders of payment you sign.
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 sm:w-64">
                        {src ? (
                            <img src={src} alt="Your e-signature" className="max-h-20 max-w-[90%] object-contain" />
                        ) : (
                            <span className="text-sm text-gray-400">No signature on file</span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">{user.name}</span>
                            <br />
                            <span className="text-gray-500">{position}</span>
                        </p>
                        <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.webp" className="sr-only" onChange={onFile} />
                        <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={uploading} onClick={() => inputRef.current?.click()}>
                            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                            {src ? "Replace signature" : "Upload signature"}
                        </Button>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {saved && !error && <p className="text-sm text-green-600">Saved. In force from now — documents already issued keep the signature they were issued with.</p>}
                        <p className="text-xs text-gray-400">
                            A new signature applies to documents issued from now on; older ones are not changed. Your position is set by the Zoning Administrator.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
