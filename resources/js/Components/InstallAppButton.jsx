import { useState } from "react";
import { createPortal } from "react-dom";
import { Download, Share, X, PlusSquare } from "lucide-react";
import { usePwaInstall } from "@/lib/usePwaInstall";

/**
 * A same-page "Install App" button, for the two places an applicant is
 * most likely to be before they've ever installed it - the landing page
 * and the login page - rather than leaving it to whoever finds their own
 * browser's menu.
 *
 * Renders nothing once the app is already installed, and nothing on a
 * browser that offers no way to install at all (there is nothing useful
 * for the button to do there). On Chrome/Edge/Android it triggers the
 * real native install prompt; on iOS Safari - which never exposes a
 * programmatic install path - it opens the manual steps instead, since
 * there is no button-click way to finish the job there.
 */
export default function InstallAppButton({ className, label = "Install App" }) {
    const { installed, canPromptInstall, isIOS, promptInstall } = usePwaInstall();
    const [showIosHelp, setShowIosHelp] = useState(false);

    if (installed || (!canPromptInstall && !isIOS)) {
        return null;
    }

    const handleClick = () => {
        if (canPromptInstall) {
            promptInstall();
        } else if (isIOS) {
            setShowIosHelp(true);
        }
    };

    return (
        <>
            <button type="button" onClick={handleClick} className={className}>
                <Download className="h-4 w-4 shrink-0" />
                {label}
            </button>

            {showIosHelp &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
                        onClick={() => setShowIosHelp(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Install on iPhone"
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="relative px-6 py-5 text-white"
                                style={{ background: "linear-gradient(135deg,#0d1f5c,#1a3a8f)" }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowIosHelp(false)}
                                    aria-label="Close"
                                    className="absolute right-3.5 top-3.5 text-white/70 hover:text-white transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <p className="text-sm text-blue-100">Install on iPhone</p>
                                <p className="text-xl font-black">Add to Home Screen</p>
                            </div>

                            <div className="p-6 space-y-4">
                                {[
                                    <>
                                        Tap the <Share className="inline h-3.5 w-3.5 -mt-0.5 text-[#0d1f5c]" /> <strong>Share</strong> icon in Safari's toolbar.
                                    </>,
                                    <>
                                        Scroll down and tap <strong>Add to Home Screen</strong>{" "}
                                        <PlusSquare className="inline h-3.5 w-3.5 -mt-0.5 text-[#0d1f5c]" />.
                                    </>,
                                    <>
                                        Tap <strong>Add</strong> in the top-right corner.
                                    </>,
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="shrink-0 w-6 h-6 rounded-full bg-[#0d1f5c] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                                            {i + 1}
                                        </span>
                                        <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                                    </div>
                                ))}
                                <p className="text-xs text-gray-400 pt-1 border-t border-gray-100 mt-4">
                                    This has to be done from Safari — Chrome on iPhone can't install apps to the home screen.
                                </p>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
