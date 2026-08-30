import { useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Camera, Loader2, X } from "lucide-react";

/**
 * Profile-picture control used on the applicant, admin and super-admin profile
 * pages. Shows the current avatar (or a fallback), lets the user pick a new
 * image, uploads it to `profile.avatar.update`, and can remove it again.
 *
 * All three usages sit inside a dark gradient banner, so the helper text is
 * light-on-dark.
 */
export default function AvatarUpload({
    shape = "rounded-full",
    sizeClass = "w-20 h-20",
    ring = "border-4 border-white/20",
    fallback = null,
}) {
    const user = usePage().props.auth?.user;
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const src = preview || user?.avatar_url || null;
    const badgeShape = shape === "rounded-full" ? "rounded-full" : "rounded-xl";

    const onFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setError("");

        if (!/^image\/(jpe?g|png|webp)$/i.test(file.type)) {
            setError("Use a JPG, PNG or WebP image.");
            return;
        }
        if (file.size > 4 * 1024 * 1024) {
            setError("Image must be 4 MB or smaller.");
            return;
        }

        setPreview(URL.createObjectURL(file));
        setUploading(true);
        router.post(
            route("profile.avatar.update"),
            { photo: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (errs) => setError(errs.photo || "Upload failed. Please try again."),
                onFinish: () => {
                    setUploading(false);
                    setPreview(null);
                },
            }
        );
    };

    const remove = () => {
        setUploading(true);
        router.delete(route("profile.avatar.destroy"), {
            preserveScroll: true,
            onFinish: () => setUploading(false),
        });
    };

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="relative">
                <div
                    className={`${sizeClass} ${shape} ${ring} overflow-hidden bg-[#d4a017] flex items-center justify-center text-white shadow-xl`}
                >
                    {src ? (
                        <img src={src} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        fallback
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    title="Change photo"
                    className={`absolute -bottom-1 -right-1 w-8 h-8 ${badgeShape} bg-[#0d1f5c] text-white flex items-center justify-center border-2 border-white shadow-lg hover:bg-[#1a3a8f] transition disabled:opacity-60`}
                >
                    {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Camera className="w-4 h-4" />
                    )}
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={onFile}
                />
            </div>

            {user?.avatar_url && !uploading && (
                <button
                    type="button"
                    onClick={remove}
                    className="text-[11px] font-semibold text-white/70 hover:text-white flex items-center gap-1"
                >
                    <X className="w-3 h-3" /> Remove
                </button>
            )}

            {error && (
                <p className="text-[11px] font-semibold text-red-300 max-w-[9rem] text-center leading-tight">
                    {error}
                </p>
            )}
        </div>
    );
}
