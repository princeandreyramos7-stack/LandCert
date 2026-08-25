import { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Search, User, FileText, DollarSign, ChevronRight } from "lucide-react";

/**
 * AddPaymentPickerModal
 *
 * Lets an admin pick which approved-but-unpaid application to record a
 * manual payment for. Selecting a row hands the request off to the caller
 * (which opens RecordPaymentModal, where the receipt image can be attached).
 */
export function AddPaymentPickerModal({ isOpen, onClose, requests = [], onSelect }) {
    const [search, setSearch] = useState("");

    // Only requests that don't already have a verified payment can have a new one recorded
    const unpaidRequests = useMemo(
        () => requests.filter((r) => !r.has_payment),
        [requests]
    );

    const filtered = useMemo(() => {
        if (!search.trim()) return unpaidRequests;
        const term = search.toLowerCase();
        return unpaidRequests.filter(
            (r) =>
                r.applicant_name?.toLowerCase().includes(term) ||
                r.control_number?.toLowerCase().includes(term) ||
                String(r.request_id).includes(term)
        );
    }, [unpaidRequests, search]);

    const handleClose = () => {
        setSearch("");
        onClose();
    };

    const handlePick = (request) => {
        onSelect(request);
        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#0d1f5c]">
                        Add Payment
                    </DialogTitle>
                    <DialogDescription>
                        Select the approved application to manually record a payment for.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        autoFocus
                        placeholder="Search by applicant, control number, or request ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2">
                    {filtered.length === 0 ? (
                        <div className="py-10 text-center text-slate-500">
                            <FileText className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm font-medium">
                                {unpaidRequests.length === 0
                                    ? "No approved applications are awaiting payment."
                                    : "No matches found."}
                            </p>
                        </div>
                    ) : (
                        filtered.map((request) => (
                            <button
                                key={request.request_id}
                                type="button"
                                onClick={() => handlePick(request)}
                                className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#0d1f5c]/40 hover:bg-slate-50 transition-colors"
                            >
                                <div className="p-2 rounded-full bg-blue-100 shrink-0">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">
                                        {request.applicant_name}
                                    </p>
                                    <p className="text-xs text-slate-500 font-mono">
                                        {request.control_number || `#${request.request_id}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-semibold text-[#0d1f5c] shrink-0">
                                    <DollarSign className="h-3.5 w-3.5" />
                                    {parseFloat(request.expected_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                            </button>
                        ))
                    )}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
