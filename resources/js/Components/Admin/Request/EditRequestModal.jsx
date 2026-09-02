import React from "react";
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
import { Textarea } from "@/Components/ui/textarea";

export function EditRequestModal({
    isOpen,
    onClose,
    request,
    editData,
    onDataChange,
    onSubmit,
    isProcessing,
}) {
    if (!request) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Request #{request.id}</DialogTitle>
                    <DialogDescription>
                        Update request details and evaluation status
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="evaluation">Evaluation Status</Label>
                        <select
                            id="evaluation"
                            value={editData.evaluation}
                            onChange={(e) =>
                                onDataChange("evaluation", e.target.value)
                            }
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Denied</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={editData.description}
                            onChange={(e) =>
                                onDataChange("description", e.target.value)
                            }
                            placeholder="Project description..."
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={editData.amount}
                            onChange={(e) =>
                                onDataChange("amount", e.target.value)
                            }
                            placeholder="Project cost"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date_certified">Date Certified</Label>
                        <Input
                            id="date_certified"
                            type="date"
                            value={editData.date_certified}
                            onChange={(e) =>
                                onDataChange("date_certified", e.target.value)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="issued_by">Issued By</Label>
                        <Input
                            id="issued_by"
                            value={editData.issued_by}
                            onChange={(e) =>
                                onDataChange("issued_by", e.target.value)
                            }
                            placeholder="Official name"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
