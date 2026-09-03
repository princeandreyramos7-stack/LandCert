import React, { useState, useMemo, useEffect } from "react";
import { TablePagination } from "@/Components/ui/table-pagination";
import { router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
    MoreVertical,
    Search,
    Download,
    UserPlus,
    Shield,
    Users,
    Pencil,
    Trash2,
    User,
    Mail,
    Phone,
    MapPin,
    Key,
    Filter,
    TrendingUp,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function SuperAdminUserManagement({ users }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterUserType, setFilterUserType] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const USERS_PER_PAGE = 10;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const { toast } = useToast();

    const usersData = users?.data || users || [];

    const filteredUsers = useMemo(() => {
        let filtered = usersData;

        if (filterUserType !== "all") {
            filtered = filtered.filter((u) => u.user_type === filterUserType);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (u) =>
                    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.contact_number?.includes(searchTerm) ||
                    u.id?.toString().includes(searchTerm)
            );
        }

        return filtered;
    }, [usersData, filterUserType, searchTerm]);

    // Filtering can leave the viewer on a page that no longer exists
    // (page 4 of a list that just shrank to 6 rows), which renders empty.
    useEffect(() => {
        setCurrentPage(1);
    }, [filterUserType, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * USERS_PER_PAGE;
        return filteredUsers.slice(start, start + USERS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const stats = useMemo(() => {
        return {
            total: usersData.length,
            applicants: usersData.filter((u) => u.user_type === "applicant").length,
            admins: usersData.filter((u) => u.user_type === "admin").length,
            super_admins: usersData.filter((u) => u.user_type === "super_admin").length,
        };
    }, [usersData]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getUserTypeBadge = (userType) => {
        const badges = {
            super_admin: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
            admin: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
            applicant: "bg-blue-500 text-white",
        };
        return badges[userType] || badges.applicant;
    };

    const getUserTypeLabel = (userType) => {
        const labels = {
            super_admin: "ZONING ADMINISTRATOR",
            admin: "ZONING OFFICER",
            applicant: "APPLICANT",
        };
        return labels[userType] || userType.toUpperCase();
    };

    const handleEdit = (user) => {
        router.visit(route("super-admin.users.edit", user.id));
    };

    const handleDelete = (user) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(route("super-admin.users.delete", userToDelete.id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setUserToDelete(null);
                    toast({
                        title: "User Deleted!",
                        description: `User "${userToDelete.name}" has been deleted.`,
                    });
                },
                onError: () => {
                    toast({
                        variant: "destructive",
                        title: "Delete Failed!",
                        description: "Failed to delete user.",
                    });
                },
            });
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Enhanced Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="shrink-0 p-3 bg-[#0d1f5c]/8 rounded-xl" style={{background:"rgba(13,31,92,0.06)"}}>
                            <Shield className="h-7 w-7 text-[#0d1f5c]"/>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase mb-0.5">User Management</p>
                            <h1 className="text-xl font-black text-[#0d1f5c]">System Users</h1>
                            <p className="text-gray-400 text-sm">Manage all system users and permissions</p>
                        </div>
                    </div>
                    <Button onClick={() => router.visit(route("super-admin.users.create"))}
                        className="w-full shrink-0 justify-center gap-2 bg-[#0d1f5c] font-bold text-white shadow hover:bg-[#1a3a8f] sm:w-auto">
                        <UserPlus className="h-4 w-4"/> Create New User
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Users",   value: stats.total,        icon: Users,  border: "border-l-[#0d1f5c]", iconBg: "bg-[#0d1f5c]/10", iconColor: "text-[#0d1f5c]" },
                    { label: "Super Admins",  value: stats.super_admins, icon: Shield, border: "border-l-[#d4a017]",  iconBg: "bg-[#d4a017]/10",  iconColor: "text-[#d4a017]"  },
                    { label: "Admins",        value: stats.admins,       icon: TrendingUp, border: "border-l-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
                    { label: "Applicants",    value: stats.applicants,   icon: Users,  border: "border-l-gray-400",   iconBg: "bg-gray-50",       iconColor: "text-gray-500"   },
                ].map((s, i) => (
                    <Card key={i} className={`border-l-4 ${s.border} bg-white shadow-sm hover:shadow-md transition-shadow`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
                                    <p className="text-3xl font-black text-[#0d1f5c]">{s.value}</p>
                                </div>
                                <div className={`h-9 w-9 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                                    <s.icon className={`h-5 w-5 ${s.iconColor}`}/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search and Filter */}
            <Card className="bg-white shadow-sm border border-gray-100">
                <CardHeader className="border-b border-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold text-[#0d1f5c] uppercase tracking-wide flex items-center gap-2">
                            <Filter className="h-4 w-4 text-[#d4a017]"/> Filter & Search
                        </CardTitle>
                        <Button onClick={() => window.open(route("admin.export.users", { format: "pdf" }), "_blank")}
                            variant="outline" size="sm" className="gap-2 border-gray-200 text-[#0d1f5c] hover:border-[#d4a017]">
                            <Download className="h-4 w-4"/> Export PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name, email, contact..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterUserType} onValueChange={setFilterUserType}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="super_admin">Super Admins</SelectItem>
                                <SelectItem value="admin">Admins</SelectItem>
                                <SelectItem value="applicant">Applicants</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="bg-white shadow-sm border border-gray-100">
                <CardContent className="p-6">
                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>User Type</TableHead>
                                    <TableHead>Registered</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            {searchTerm || filterUserType !== "all"
                                                ? "No users match your filters"
                                                : "No users found"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="hover:bg-[#0d1f5c]/[0.02] transition-colors"
                                        >
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.contact_number || "N/A"}</TableCell>
                                            <TableCell className="max-w-xs truncate">{user.address || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge className={getUserTypeBadge(user.user_type)}>
                                                    {user.user_type === "super_admin" && <Shield className="h-3 w-3 mr-1" />}
                                                    {getUserTypeLabel(user.user_type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(user.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(user)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            currentPage={currentPage}
                            totalItems={filteredUsers.length}
                            perPage={USERS_PER_PAGE}
                            onPageChange={setCurrentPage}
                            label="users"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete user "{userToDelete?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
