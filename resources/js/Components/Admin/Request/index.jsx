import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import BulkActions from "@/Components/ui/bulk-actions";
import { useForm, router } from "@inertiajs/react";
import { useToast } from "@/Components/ui/use-toast";

// Local Components
import { RequestStats } from "./RequestStats";
import { RequestTable } from "./RequestTable";
import { RequestTableHeader } from "./RequestTableHeader";
import { RequestPagination } from "./RequestPagination";
import { EditRequestModal } from "./EditRequestModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { ApproveConfirmDialog } from "./ApproveConfirmDialog";
import { RejectDialog } from "./RejectDialog";
import { generateCSV, downloadCSV } from "./utils";

export function AdminRequestList({ requests, flash = {} }) {
    // State Management
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const { toast } = useToast();

    // Edit Form
    const {
        data: editData,
        setData: setEditData,
        processing: editProcessing,
    } = useForm({
        evaluation: "",
        description: "",
        amount: "",
        date_certified: "",
        issued_by: "",
    });

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: "Success!",
                description: flash.success,
                duration: 5000,
            });
        }
        if (flash?.error) {
            toast({
                variant: "destructive",
                title: "Some operations failed",
                description: flash.error,
                duration: 7000,
            });
        }
    }, [flash, toast]);

    // Data Processing
    const requestsData = requests?.data || requests || [];

    const filteredRequests = useMemo(() => {
        let filtered = requestsData;

        if (filterStatus !== "all") {
            filtered = filtered.filter((r) => r.status === filterStatus);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.applicant_name?.toLowerCase().includes(term) ||
                    r.user_email?.toLowerCase().includes(term) ||
                    r.project_type?.toLowerCase().includes(term) ||
                    r.control_number?.toLowerCase().includes(term) ||
                    r.id?.toString().includes(term)
            );
        }

        return filtered;
    }, [requestsData, filterStatus, searchTerm]);

    const stats = useMemo(() => {
        return {
            total: requestsData.length,
            pending: requestsData.filter((r) => r.status === "pending").length,
            approved: requestsData.filter((r) => r.status === "approved")
                .length,
            rejected: requestsData.filter((r) => r.status === "rejected")
                .length,
        };
    }, [requestsData]);

    // Event Handlers
    const handleEdit = (request) => {
        setSelectedRequest(request);
        setEditData({
            evaluation: request.evaluation || request.status || "pending",
            description: request.project_nature || "",
            amount: request.project_cost || "",
            date_certified: "",
            issued_by: "",
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();

        if (!selectedRequest.report_id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No report found for this request.",
            });
            return;
        }

        router.post(
            route("admin.update-evaluation", selectedRequest.report_id),
            editData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: "Success!",
                        description: "Request updated successfully!",
                    });
                    setIsEditModalOpen(false);
                },
                onError: (errors) => {
                    console.error("Update error:", errors);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to update request.",
                    });
                },
            }
        );
    };

    const handleApprove = (request) => {
        if (!request.report_id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No report found for this request.",
            });
            return;
        }
        setSelectedRequest(request);
        setIsApproveDialogOpen(true);
    };

    const confirmApprove = () => {
        if (!selectedRequest) return;

        router.post(
            route("admin.update-evaluation", selectedRequest.report_id),
            {
                evaluation: "approved",
                issued_by: "Admin",
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsApproveDialogOpen(false);
                    setSelectedRequest(null);
                    toast({
                        title: "Request Approved!",
                        description: `Request #${selectedRequest.id} from ${selectedRequest.applicant_name} has been approved successfully.`,
                    });
                },
                onError: (errors) => {
                    setIsApproveDialogOpen(false);
                    toast({
                        variant: "destructive",
                        title: "Approval Failed!",
                        description: "Failed to approve the request.",
                    });
                },
            }
        );
    };

    const handleReject = (request) => {
        if (!request.report_id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No report found for this request.",
            });
            return;
        }
        setSelectedRequest(request);
        setIsRejectDialogOpen(true);
    };

    const confirmReject = (rejectionFeedback) => {
        if (!selectedRequest) return;

        if (!rejectionFeedback.trim()) {
            toast({
                variant: "destructive",
                title: "Feedback Required",
                description: "Please provide feedback for rejection.",
            });
            return;
        }

        router.post(
            route("admin.update-evaluation", selectedRequest.report_id),
            {
                evaluation: "rejected",
                description: rejectionFeedback.trim(),
                issued_by: "Admin",
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsRejectDialogOpen(false);
                    setSelectedRequest(null);
                    toast({
                        title: "Request Declined!",
                        description: `Request #${selectedRequest.id} has been declined.`,
                    });
                },
                onError: (errors) => {
                    setIsRejectDialogOpen(false);
                    toast({
                        variant: "destructive",
                        title: "Decline Failed!",
                        description: "Failed to decline the request.",
                    });
                },
            }
        );
    };

    const handleDelete = (request) => {
        setSelectedRequest(request);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedRequest) return;

        router.delete(route("admin.delete-request", selectedRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedRequest(null);
                toast({
                    title: "Request Deleted!",
                    description: `Request #${selectedRequest.id} has been deleted.`,
                });
            },
            onError: (errors) => {
                setIsDeleteDialogOpen(false);
                toast({
                    variant: "destructive",
                    title: "Delete Failed!",
                    description: "Failed to delete the request.",
                });
            },
        });
    };

    const handleExport = () => {
        const url = route("admin.export.requests", {
            status: filterStatus,
            format: "csv",
        });
        window.location.href = url;
        toast({
            title: "Export Started",
            description: "Your Excel file will download shortly.",
        });
    };

    // Selection Handlers
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedItems(filteredRequests.map((request) => request.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (requestId, checked) => {
        if (checked) {
            setSelectedItems((prev) => [...prev, requestId]);
        } else {
            setSelectedItems((prev) => prev.filter((id) => id !== requestId));
        }
    };

    const handleClearSelection = () => {
        setSelectedItems([]);
    };

    // Bulk Actions
    const handleBulkApprove = async (selectedIds) => {
        setBulkLoading(true);
        try {
            await new Promise((resolve, reject) => {
                router.post(
                    route("admin.bulk.approve"),
                    { request_ids: selectedIds },
                    {
                        preserveScroll: true,
                        onSuccess: () => resolve(),
                        onError: (errors) =>
                            reject(new Error("Failed to approve requests")),
                    }
                );
            });
        } catch (error) {
            throw error;
        } finally {
            setBulkLoading(false);
        }
    };

    const handleBulkReject = async (selectedIds, reason) => {
        setBulkLoading(true);
        try {
            await new Promise((resolve, reject) => {
                router.post(
                    route("admin.bulk.reject"),
                    { request_ids: selectedIds, reason: reason },
                    {
                        preserveScroll: true,
                        onSuccess: () => resolve(),
                        onError: (errors) =>
                            reject(new Error("Failed to reject requests")),
                    }
                );
            });
        } catch (error) {
            throw error;
        } finally {
            setBulkLoading(false);
        }
    };

    const handleBulkDelete = async (selectedIds) => {
        setBulkLoading(true);
        try {
            await new Promise((resolve, reject) => {
                router.delete(route("admin.bulk.delete"), {
                    data: { request_ids: selectedIds },
                    preserveScroll: true,
                    onSuccess: () => resolve(),
                    onError: (errors) =>
                        reject(new Error("Failed to delete requests")),
                });
            });
        } catch (error) {
            throw error;
        } finally {
            setBulkLoading(false);
        }
    };

    const handleBulkExport = (selectedIds) => {
        const selectedRequests = filteredRequests.filter((req) =>
            selectedIds.includes(req.id)
        );
        const csvContent = generateCSV(selectedRequests);
        downloadCSV(
            csvContent,
            `selected-requests-${new Date().toISOString().split("T")[0]}.csv`
        );
    };

    const handlePageChange = (url) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    return (
        <div className="space-y-6 min-h-screen bg-white p-6">
            {/* Statistics Cards */}
            <RequestStats stats={stats} onFilterChange={setFilterStatus} />

            {/* Requests Table */}
            <RequestTableHeader
                filteredCount={filteredRequests.length}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onClearFilter={() => setFilterStatus("all")}
                onExport={handleExport}
            />

            <Card>
                <CardContent>
                    {/* Bulk Actions */}
                    <BulkActions
                        selectedItems={selectedItems}
                        onClearSelection={handleClearSelection}
                        onBulkApprove={handleBulkApprove}
                        onBulkReject={handleBulkReject}
                        onBulkDelete={handleBulkDelete}
                        onBulkExport={handleBulkExport}
                        isLoading={bulkLoading}
                        className="mb-6"
                    />

                    {/* Table */}
                    <RequestTable
                        requests={filteredRequests}
                        selectedItems={selectedItems}
                        onSelectAll={handleSelectAll}
                        onSelectItem={handleSelectItem}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    {/* Pagination */}
                    <RequestPagination
                        paginationData={requests}
                        onPageChange={handlePageChange}
                    />
                </CardContent>
            </Card>

            {/* Modals and Dialogs */}
            <EditRequestModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                request={selectedRequest}
                editData={editData}
                onDataChange={(field, value) => setEditData(field, value)}
                onSubmit={handleEditSubmit}
                isProcessing={editProcessing}
            />

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                request={selectedRequest}
                onConfirm={confirmDelete}
            />

            <ApproveConfirmDialog
                isOpen={isApproveDialogOpen}
                onClose={() => setIsApproveDialogOpen(false)}
                request={selectedRequest}
                onConfirm={confirmApprove}
            />

            <RejectDialog
                isOpen={isRejectDialogOpen}
                onClose={() => setIsRejectDialogOpen(false)}
                request={selectedRequest}
                onConfirm={confirmReject}
            />
        </div>
    );
}
