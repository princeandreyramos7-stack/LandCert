import React from "react";
import { Button } from "@/Components/ui/button";
import { Download, FileText, Printer } from "lucide-react";

/**
 * The blue bar that sits above a printable document on screen: what the
 * document is, which application it belongs to, and the Print / Download PDF
 * buttons. The Zoning Clearance, the Zoning Certification and the Application
 * Form all lead with this same bar.
 *
 * It never prints — `no-print` keeps it off the paper.
 *
 * @param {string} eyebrow      Small gold label above the title ("Clearance").
 * @param {string} title        Document name ("Zoning Clearance").
 * @param {string} subtitle     Line under the title ("Application No: …").
 * @param {string} printLabel   Text on the gold button.
 * @param {function} onPrint    Opens the browser print dialog.
 * @param {function} onDownload Saves the document as a PDF.
 * @param {Component} icon      Lucide icon for the tile. Defaults to FileText.
 */
export default function DocumentActionBar({
    eyebrow,
    title,
    subtitle,
    printLabel = "Print",
    onPrint,
    onDownload,
    icon: Icon = FileText,
}) {
    return (
        <div
            className="relative overflow-hidden rounded-2xl text-white mb-6 no-print"
            style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}
        >
            <div className="relative z-10 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="shrink-0 rounded-xl border border-[#d4a017]/30 bg-[#d4a017]/20 p-2.5 sm:p-3">
                        <Icon className="h-6 w-6 text-[#d4a017] sm:h-7 sm:w-7" />
                    </div>
                    <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                            <div className="h-4 w-1 shrink-0 rounded-full bg-[#d4a017]" />
                            <p className="truncate text-xs font-black uppercase tracking-widest text-[#d4a017]">
                                {eyebrow}
                            </p>
                        </div>
                        <h1 className="text-lg font-black text-white sm:text-xl">{title}</h1>
                        {subtitle && (
                            <p className="truncate text-xs text-blue-200/70 sm:text-sm">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {/* Icons alone on a phone: labels like "Print Certificate" and
                    "Download PDF" cannot both fit beside each other on a narrow
                    screen without wrapping or clipping. Each keeps a title and
                    aria-label so it stays identifiable without its text. */}
                <div className="flex shrink-0 gap-2 sm:gap-3">
                    <Button
                        onClick={onPrint}
                        title={printLabel}
                        aria-label={printLabel}
                        className="flex-1 bg-[#d4a017] px-3 text-white hover:bg-[#b8910f] sm:flex-none sm:px-4"
                    >
                        <Printer className="h-4 w-4 shrink-0 sm:mr-2" />
                        <span className="hidden sm:inline">{printLabel}</span>
                    </Button>
                    <Button
                        onClick={onDownload}
                        title="Download PDF"
                        aria-label="Download PDF"
                        className="flex-1 border-white bg-white px-3 text-[#0d1f5c] hover:bg-gray-100 sm:flex-none sm:px-4"
                    >
                        <Download className="h-4 w-4 shrink-0 sm:mr-2" />
                        <span className="hidden sm:inline">Download PDF</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
