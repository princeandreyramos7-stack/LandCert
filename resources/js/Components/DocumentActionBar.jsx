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
            <div className="relative z-10 flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#d4a017]/20 border border-[#d4a017]/30 rounded-xl">
                        <Icon className="h-7 w-7 text-[#d4a017]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1 h-4 rounded-full bg-[#d4a017]" />
                            <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">
                                {eyebrow}
                            </p>
                        </div>
                        <h1 className="text-xl font-black text-white">{title}</h1>
                        {subtitle && <p className="text-blue-200/70 text-sm">{subtitle}</p>}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={onPrint}
                        className="bg-[#d4a017] hover:bg-[#b8910f] text-white"
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        {printLabel}
                    </Button>
                    <Button
                        onClick={onDownload}
                        className="bg-white hover:bg-gray-100 text-[#0d1f5c] border-white"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>
        </div>
    );
}
