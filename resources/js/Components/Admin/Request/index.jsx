import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm, router } from "@inertiajs/react";
import { useToast } from "@/components/ui/use-toast";

// Local Components
import { RequestStats } from "./RequestStats";
import { RequestTable } from "./RequestTable";
import { RequestTableHeader } from "./RequestTableHeader";
import { RequestPagination } from "./RequestPagination";
import { EditRequestModal } from "./EditRequestModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { generateCSV, downloadCSV } from "./utils";

export function AdminRequestList({ requests, flash = {} }) {
    // State Management
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
            filtered = filtered.filter(
                (r) =>
                    r.applicant_name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    r.user_email
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    r.project_type
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    r.id?.toString().includes(searchTerm)
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
    const handleView = (request) => {
        // Navigate to request details page
        router.visit(route('admin.requests.view', request.id));
    };

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

    const handleMarkReviewed = (request) => {
        if (!request.report_id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No report found for this request.",
            });
            return;
        }

        router.post(
            route("admin.update-evaluation", request.report_id),
            {
                evaluation: "reviewed",
                description: "Request marked as reviewed by admin",
                issued_by: "Admin",
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: "Marked as Reviewed!",
                        description: `Request #${request.id} has been marked as reviewed.`,
                    });
                },
                onError: (errors) => {
                    toast({
                        variant: "destructive",
                        title: "Update Failed!",
                        description: "Failed to update the request status.",
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
            format: "pdf",
        });
        window.location.href = url;
        toast({
            title: "Export Started",
            description: "Your PDF file will download shortly.",
        });
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
                    {/* Table */}
                    <RequestTable
                        requests={filteredRequests}
                        onView={handleView}
                        onEdit={handleEdit}
                        onMarkReviewed={handleMarkReviewed}
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
        </div>
    );
}
