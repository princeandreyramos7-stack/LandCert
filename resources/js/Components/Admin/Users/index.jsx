import React, { useState, useMemo, useEffect } from "react";
import { TablePagination } from "@/Components/ui/table-pagination";
import { router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { useToast } from "@/Components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import {
    MoreVertical, Search, Download, Users, Pencil, Trash2,
    User, Mail, Phone, MapPin, Filter, Save,
} from "lucide-react";

export function AdminUserManagement({ users }) {
    const [searchTerm, setSearchTerm]       = useState("");
    const [filterUserType, setFilterUserType] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const USERS_PER_PAGE = 10;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen]     = useState(false);
    const [userToDelete, setUserToDelete]   = useState(null);
    const [editingUser, setEditingUser]     = useState(null);
    const { toast } = useToast();

    const usersData = users?.data || users || [];

    const filteredUsers = useMemo(() => {
        let filtered = usersData;
        if (filterUserType !== "all") filtered = filtered.filter(u => u.user_type === filterUserType);
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
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

    const stats = useMemo(() => ({
        total:      usersData.length,
        applicants: usersData.filter(u => u.user_type === "applicant").length,
    }), [usersData]);

    const formatDate = ds => new Date(ds).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    const handleEdit   = u => { setEditingUser({ ...u }); setIsEditDialogOpen(true); };
    const handleDelete = u => { setUserToDelete(u); setIsDeleteDialogOpen(true); };

    const confirmDelete = () => {
        if (!userToDelete) return;
        router.delete(route("admin.users.delete", userToDelete.id), {
            onSuccess: () => { setIsDeleteDialogOpen(false); setUserToDelete(null); toast({ title: "User Deleted!" }); },
            onError:   () => { toast({ variant: "destructive", title: "Delete Failed!" }); },
        });
    };

    const saveEdit = () => {
        if (!editingUser) return;
        if (!editingUser.name?.trim() || !editingUser.email?.trim()) {
            toast({ variant: "destructive", title: "Required Fields Missing", description: "Fill in name and email." });
            return;
        }
        router.put(route("admin.users.update", editingUser.id),
            { name: editingUser.name, email: editingUser.email, contact_number: editingUser.contact_number, address: editingUser.address },
            {
                onSuccess: () => { setIsEditDialogOpen(false); setEditingUser(null); toast({ title: "User Updated!" }); },
                onError:   () => { toast({ variant: "destructive", title: "Update Failed!" }); },
            }
        );
    };

    const inputCls = "border-gray-200 focus:border-[#d4a017] focus:ring-[#d4a017]/20";

    return (
        <div className="space-y-5">

            {/* Stat cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-l-4 border-l-[#0d1f5c] bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Users</p>
                                <p className="text-3xl font-black text-[#0d1f5c]">{stats.total}</p>
                            </div>
                            <div className="h-9 w-9 rounded-lg bg-[#0d1f5c]/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-[#0d1f5c]"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-gray-400 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Applicants</p>
                                <p className="text-3xl font-black text-[#0d1f5c]">{stats.applicants}</p>
                            </div>
                            <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-500"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter & Search */}
            <Card className="bg-white shadow-sm border border-gray-100">
                <CardHeader className="border-b border-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold text-[#0d1f5c] uppercase tracking-wide flex items-center gap-2">
                            <Filter className="h-4 w-4 text-[#d4a017]"/> Filter & Search
                        </CardTitle>
                        <Button onClick={() => window.open(route("admin.export.users", { format: "pdf" }), "_blank")}
                            variant="outline" size="sm" className="gap-2 border-gray-200 text-[#0d1f5c] hover:border-[#d4a017] hover:text-[#d4a017]">
                            <Download className="h-4 w-4"/> Export PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
                            <Input placeholder="Search by name, email, contact..." value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className={`pl-9 ${inputCls}`}/>
                        </div>
                        <Select value={filterUserType} onValueChange={setFilterUserType}>
                            <SelectTrigger className={`w-full sm:w-48 ${inputCls}`}>
                                <SelectValue placeholder="Filter by type"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="applicant">Applicants</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 border-b border-gray-100">
                                    <TableHead className="text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Name</TableHead>
                                    <TableHead className="text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Email</TableHead>
                                    <TableHead className="text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Contact</TableHead>
                                    <TableHead className="text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Address</TableHead>
                                    <TableHead className="text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Type</TableHead>
                                    <TableHead className="text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Registered</TableHead>
                                    <TableHead className="text-right text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-400 py-10">
                                            {searchTerm || filterUserType !== "all" ? "No users match your filters" : "No users found"}
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedUsers.map(user => (
                                    <TableRow key={user.id} className="hover:bg-[#0d1f5c]/[0.02] transition-colors border-b border-gray-50">
                                        <TableCell className="font-semibold text-[#0d1f5c] px-4 py-3">{user.name}</TableCell>
                                        <TableCell className="text-sm text-gray-600 px-4 py-3">{user.email}</TableCell>
                                        <TableCell className="text-sm text-gray-600 px-4 py-3">{user.contact_number || "N/A"}</TableCell>
                                        <TableCell className="max-w-xs truncate text-sm text-gray-600 px-4 py-3">{user.address || "N/A"}</TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge className="bg-[#0d1f5c]/10 text-[#0d1f5c] border-[#0d1f5c]/20 text-xs font-semibold">
                                                {user.user_type?.replace("_", " ").toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500 px-4 py-3">{formatDate(user.created_at)}</TableCell>
                                        <TableCell className="text-right px-4 py-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#0d1f5c]">
                                                        <MoreVertical className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl shadow-xl">
                                                    <DropdownMenuItem onClick={() => handleEdit(user)} className="cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4"/> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(user)} className="text-red-600 cursor-pointer">
                                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
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

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-lg bg-[#0d1f5c]/10 flex items-center justify-center">
                                <Pencil className="h-5 w-5 text-[#0d1f5c]"/>
                            </div>
                            <DialogTitle className="text-[#0d1f5c] font-black">Edit User</DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-500 text-sm">Update user information and contact details</DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <div className="space-y-4 py-2">
                            {[
                                { id: "en", label: "Full Name",       icon: User,  type: "text",  value: editingUser.name,             placeholder: "Enter full name",     onChange: v => setEditingUser({ ...editingUser, name: v }) },
                                { id: "ee", label: "Email Address",   icon: Mail,  type: "email", value: editingUser.email,            placeholder: "user@example.com",    onChange: v => setEditingUser({ ...editingUser, email: v }) },
                                { id: "ec", label: "Contact Number",  icon: Phone, type: "text",  value: editingUser.contact_number || "", placeholder: "09XXXXXXXXX",     onChange: v => setEditingUser({ ...editingUser, contact_number: v }) },
                            ].map(f => (
                                <div key={f.id} className="space-y-1.5">
                                    <Label className="flex items-center gap-2 text-sm font-semibold text-[#0d1f5c]">
                                        <f.icon className="h-4 w-4 text-[#d4a017]"/>{f.label}
                                    </Label>
                                    <Input type={f.type} value={f.value} placeholder={f.placeholder}
                                        onChange={e => f.onChange(e.target.value)} className={inputCls}/>
                                </div>
                            ))}
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-2 text-sm font-semibold text-[#0d1f5c]">
                                    <MapPin className="h-4 w-4 text-[#d4a017]"/>Address
                                </Label>
                                <Textarea value={editingUser.address || ""} rows={3} placeholder="Enter complete address"
                                    onChange={e => setEditingUser({ ...editingUser, address: e.target.value })}
                                    className={`${inputCls} resize-none`}/>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-gray-200">Cancel</Button>
                        <Button onClick={saveEdit} className="bg-[#0d1f5c] hover:bg-[#1a3a8f] text-white gap-2">
                            <Save className="h-4 w-4"/> Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="rounded-2xl max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[#0d1f5c] font-black">Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-gray-900">"{userToDelete?.name}"</span>? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
