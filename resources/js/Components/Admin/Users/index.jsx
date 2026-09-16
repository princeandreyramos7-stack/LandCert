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
import { PhilippineAddressFields } from "@/Components/Address/PhilippineAddressFields";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import {
    MoreVertical, Search, Download, Users, Pencil, Trash2,
    User, Mail, Phone, MapPin, Filter, Save, UserPlus, KeyRound, PhoneOff, CalendarPlus, FileText,
} from "lucide-react";

/** Initials for the avatar beside a name: "Juan Dela Cruz" -> "JD". */
const initialsOf = (name) => String(name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "?";

/**
 * The counts above the list, as filters. All of these accounts are
 * applicants, so the old "Total / Applicants" pair said the same number
 * twice; these are the cuts the officer actually reaches for.
 */
const TILES = [
    { key: "all",        label: "Applicants",          sub: "every account",         icon: Users,        tone: "text-[#0d1f5c]",  wash: "bg-[#0d1f5c]/5",  chip: "bg-[#0d1f5c] text-white",   ring: "ring-[#0d1f5c]",  match: () => true },
    { key: "with_phone", label: "With mobile number",  sub: "reachable by SMS",      icon: Phone,        tone: "text-emerald-800", wash: "bg-emerald-50",  chip: "bg-emerald-500 text-white", ring: "ring-emerald-500", match: (u) => Boolean(u.contact_number) },
    { key: "no_phone",   label: "No mobile number",    sub: "cannot be texted",      icon: PhoneOff,     tone: "text-amber-800",   wash: "bg-amber-50",    chip: "bg-amber-500 text-white",   ring: "ring-amber-500",   match: (u) => !u.contact_number },
    { key: "new",        label: "New this month",      sub: "registered recently",   icon: CalendarPlus, tone: "text-sky-800",     wash: "bg-sky-50",      chip: "bg-sky-500 text-white",     ring: "ring-sky-500",     match: (u) => { const d = new Date(u.created_at), n = new Date(); return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth(); } },
    { key: "with_apps",  label: "With applications",   sub: "have filed at least one", icon: FileText,   tone: "text-violet-800",  wash: "bg-violet-50",   chip: "bg-violet-500 text-white",  ring: "ring-violet-500",  match: (u) => Number(u.requests_count) > 0 },
];

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

    // Adding an applicant account for someone the office is helping at the
    // counter. Applicants only - staff accounts are the Administrator's to make.
    const EMPTY_APPLICANT = {
        name: "", email: "", contact_number: "", password: "", password_confirmation: "",
        // Picked from the PSGC, like sign-up; the server writes the address line.
        address_region_code: "", address_province_code: "", address_city_code: "", address_barangay_code: "", address_street: "",
    };
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newUser, setNewUser] = useState(EMPTY_APPLICANT);
    const [addErrors, setAddErrors] = useState({});
    const [adding, setAdding] = useState(false);

    const openAdd = () => { setNewUser(EMPTY_APPLICANT); setAddErrors({}); setIsAddDialogOpen(true); };

    const saveNew = () => {
        setAdding(true);
        router.post(route("admin.users.store"), newUser, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddDialogOpen(false);
                toast({ title: "Applicant account created", description: `${newUser.name} can now sign in with the e-mail and password you set.` });
            },
            onError: (errors) => setAddErrors(errors || {}),
            onFinish: () => setAdding(false),
        });
    };

    const usersData = users?.data || users || [];

    const filteredUsers = useMemo(() => {
        let filtered = usersData;
        const tile = TILES.find((t) => t.key === filterUserType) || TILES[0];
        filtered = filtered.filter(tile.match);
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

            {/* Counts, as filters: click one to see just those accounts. */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
                {TILES.map((t) => {
                    const selected = filterUserType === t.key;
                    const value = usersData.filter(t.match).length;
                    return (
                        <button key={t.key} type="button" onClick={() => setFilterUserType(selected ? "all" : t.key)} aria-pressed={selected}
                            className={`group flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 text-left transition-all hover:-translate-y-px hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${t.ring} ${selected ? `border-transparent ring-2 ${t.wash}` : "border-gray-100 shadow-sm"}`}>
                            <span className={`shrink-0 rounded-lg p-2 ${selected ? t.chip : `${t.wash} ${t.tone}`}`}><t.icon className="h-4 w-4"/></span>
                            <span className="min-w-0">
                                <span className={`block text-[10px] font-bold uppercase tracking-wide ${t.tone} opacity-80`}>{t.label}</span>
                                <span className="block text-xl font-black leading-tight text-gray-900">{value}</span>
                                <span className="hidden truncate text-[11px] text-gray-400 sm:block">{t.sub}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Filter & Search */}
            <Card className="bg-white shadow-sm border border-gray-100">
                <CardHeader className="border-b border-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold text-[#0d1f5c] uppercase tracking-wide flex items-center gap-2">
                            <Filter className="h-4 w-4 text-[#d4a017]"/> Filter & Search
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => window.open(route("admin.export.users", { format: "pdf" }), "_blank")}
                                variant="outline" size="sm" className="gap-2 border-gray-200 text-[#0d1f5c] hover:border-[#d4a017] hover:text-[#d4a017]">
                                <Download className="h-4 w-4"/> Export PDF
                            </Button>
                            <Button onClick={openAdd} size="sm" className="gap-2 bg-[#0d1f5c] text-white hover:bg-[#1a3a8f]">
                                <UserPlus className="h-4 w-4"/> Add Applicant
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
                            <Input placeholder="Search by name, e-mail or mobile number..." value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className={`pl-9 ${inputCls}`}/>
                        </div>
                        {filterUserType !== "all" && (
                            <Button variant="outline" onClick={() => setFilterUserType("all")} className="border-gray-200 text-sm">
                                Show all
                            </Button>
                        )}
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        Showing <span className="font-semibold text-gray-800">{filteredUsers.length}</span> of {usersData.length} applicant accounts
                    </p>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 border-b border-gray-100">
                                    <TableHead className="text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Applicant</TableHead>
                                    <TableHead className="text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Mobile</TableHead>
                                    <TableHead className="text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Address</TableHead>
                                    <TableHead className="text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Applications</TableHead>
                                    <TableHead className="text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Registered</TableHead>
                                    <TableHead className="text-right text-[#0d1f5c] font-bold text-xs uppercase tracking-wide px-4 py-3">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-400 py-10">
                                            {searchTerm || filterUserType !== "all" ? "No applicants match your filters" : "No applicant accounts yet"}
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedUsers.map(user => (
                                    <TableRow key={user.id} className="hover:bg-[#0d1f5c]/[0.02] transition-colors border-b border-gray-50">
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d1f5c]/10 text-xs font-black text-[#0d1f5c]">{initialsOf(user.name)}</span>
                                                <span className="min-w-0">
                                                    <span className="block truncate font-semibold text-[#0d1f5c]">{user.name}</span>
                                                    <span className="block truncate text-xs text-gray-500">{user.email}</span>
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-gray-600">
                                            {user.contact_number
                                                ? <span className="font-mono">{user.contact_number}</span>
                                                : <span className="inline-flex items-center gap-1 text-xs text-amber-700"><PhoneOff className="h-3 w-3"/> none</span>}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate px-4 py-3 text-sm text-gray-600" title={user.address || ""}>{user.address || "—"}</TableCell>
                                        <TableCell className="px-4 py-3">
                                            {Number(user.requests_count) > 0
                                                ? <Badge className="border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-50">{user.requests_count} {Number(user.requests_count) === 1 ? "application" : "applications"}</Badge>
                                                : <span className="text-xs text-gray-400">none yet</span>}
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

            {/* Add Applicant Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-lg bg-[#0d1f5c]/10 flex items-center justify-center">
                                <UserPlus className="h-5 w-5 text-[#0d1f5c]"/>
                            </div>
                            <DialogTitle className="text-[#0d1f5c] font-black">Add Applicant</DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-500 text-sm">
                            An applicant account, for someone the office is helping in person. Give them the e-mail and password so they can sign in and follow their application.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4 py-2" onSubmit={e => { e.preventDefault(); saveNew(); }}>
                        {[
                            { key: "name",                  label: "Full Name",        icon: User,     type: "text",     placeholder: "Juan Dela Cruz",        autoComplete: "off" },
                            { key: "email",                 label: "Email Address",    icon: Mail,     type: "email",    placeholder: "juan@example.com",      autoComplete: "off" },
                            { key: "contact_number",        label: "Mobile Number",    icon: Phone,    type: "tel",      placeholder: "09XXXXXXXXX",           autoComplete: "off", inputMode: "numeric" },
                            { key: "password",              label: "Password",         icon: KeyRound, type: "password", placeholder: "At least 8 characters", autoComplete: "new-password" },
                            { key: "password_confirmation", label: "Confirm Password", icon: KeyRound, type: "password", placeholder: "Type it again",          autoComplete: "new-password" },
                        ].map(f => (
                            <div key={f.key} className="space-y-1.5">
                                <Label htmlFor={`add-${f.key}`} className="flex items-center gap-2 text-sm font-semibold text-[#0d1f5c]">
                                    <f.icon className="h-4 w-4 text-[#d4a017]"/>{f.label}
                                </Label>
                                <Input id={`add-${f.key}`} type={f.type} value={newUser[f.key]} placeholder={f.placeholder}
                                    autoComplete={f.autoComplete} inputMode={f.inputMode} required
                                    onChange={e => setNewUser({ ...newUser, [f.key]: f.key === "contact_number" ? e.target.value.replace(/\D/g, "").slice(0, 11) : e.target.value })}
                                    className={`${inputCls} ${addErrors[f.key] ? "border-red-400" : ""}`}/>
                                {addErrors[f.key] && <p className="text-xs text-red-500">{addErrors[f.key]}</p>}
                            </div>
                        ))}
                        <PhilippineAddressFields
                            legend="Address"
                            prefix="address"
                            values={newUser}
                            errors={addErrors}
                            onChange={(key, value) => setNewUser((prev) => ({ ...prev, [key]: value }))}
                            required={false}
                            note="Optional. Filling it in now starts every application with it."
                        />
                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-gray-200" disabled={adding}>Cancel</Button>
                            <Button type="submit" disabled={adding} className="bg-[#0d1f5c] hover:bg-[#1a3a8f] text-white gap-2">
                                <UserPlus className="h-4 w-4"/> {adding ? "Creating…" : "Create Account"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

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
