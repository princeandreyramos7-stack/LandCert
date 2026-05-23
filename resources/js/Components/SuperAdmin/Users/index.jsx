import React, { useState, useMemo } from "react";
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
        <div
            className="space-y-6 min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6"
            style={{
                backgroundImage: `
                    radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
                `,
            }}
        >
            {/* Enhanced Header with Pure Blue Background */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Shield className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">User Management</h1>
                            <p className="text-blue-100">Manage all system users and permissions</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.visit(route("super-admin.users.create"))}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <UserPlus className="h-5 w-5" />
                        Create New User
                    </Button>
                </div>
            </div>

            {/* Advanced Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-purple-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                                <p className="text-3xl font-bold text-purple-700">{stats.total}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>
                        <div className="mt-2 h-1 bg-purple-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-indigo-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Super Admins</p>
                                <p className="text-3xl font-bold text-indigo-700">{stats.super_admins}</p>
                            </div>
                            <Shield className="h-8 w-8 text-indigo-500" />
                        </div>
                        <div className="mt-2 h-1 bg-indigo-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${(stats.super_admins / stats.total) * 100}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                                <p className="text-3xl font-bold text-blue-700">{stats.admins}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${(stats.admins / stats.total) * 100}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-gray-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Applicants</p>
                                <p className="text-3xl font-bold text-gray-700">{stats.applicants}</p>
                            </div>
                            <Users className="h-8 w-8 text-gray-500" />
                        </div>
                        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full" style={{ width: `${(stats.applicants / stats.total) * 100}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter Section */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-purple-600" />
                            Filter & Search
                        </CardTitle>
                        <Button
                            onClick={() => window.open(route("admin.export.users", { format: "pdf" }), "_blank")}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export PDF
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
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gradient-to-r from-purple-50 to-indigo-50">
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
                                    filteredUsers.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300"
                                        >
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.contact_number || "N/A"}</TableCell>
                                            <TableCell className="max-w-xs truncate">{user.address || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge className={getUserTypeBadge(user.user_type)}>
                                                    {user.user_type === "super_admin" && <Shield className="h-3 w-3 mr-1" />}
                                                    {user.user_type.replace("_", " ").toUpperCase()}
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
