import { AdminSidebar } from "@/Components/admin-sidebar";
import { Head, router } from "@inertiajs/react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import {
    MoreVertical,
    Pencil,
    Trash2,
    Search,
    Download,
    User,
    Mail,
    Phone,
    MapPin,
    Save,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { useToast } from "@/Components/ui/use-toast";
import { Toaster } from "@/Components/ui/toaster";

export default function Users({ users }) {
    const [editingUser, setEditingUser] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const usersData = users?.data || users;

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return usersData;

        return usersData.filter(
            (user) =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.contact_number?.includes(searchTerm) ||
                user.id?.toString().includes(searchTerm)
        );
    }, [usersData, searchTerm]);

    const handlePageChange = (url) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    const renderPaginationLinks = () => {
        if (!users?.links || users.links.length <= 3) return null;

        return (
            <Pagination className="mt-6">
                <PaginationContent>
                    {users.links.map((link, index) => {
                        if (index === 0) {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationPrevious
                                        onClick={() =>
                                            handlePageChange(link.url)
                                        }
                                        className={
                                            !link.url
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                            );
                        }

                        if (index === users.links.length - 1) {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationNext
                                        onClick={() =>
                                            handlePageChange(link.url)
                                        }
                                        className={
                                            !link.url
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                            );
                        }

                        if (link.label === "...") {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem key={index}>
                                <PaginationLink
                                    onClick={() => handlePageChange(link.url)}
                                    isActive={link.active}
                                    className="cursor-pointer"
                                >
                                    {link.label}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}
                </PaginationContent>
            </Pagination>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user });
        setIsEditDialogOpen(true);
    };

    const handleDelete = (user) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(route("admin.users.delete", userToDelete.id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setUserToDelete(null);
                    toast({
                        title: "User Deleted!",
                        description: `User "${userToDelete.name}" has been permanently deleted from the system.`,
                    });
                },
                onError: () => {
                    setIsDeleteDialogOpen(false);
                    toast({
                        variant: "destructive",
                        title: "Delete Failed!",
                        description: "Failed to delete the user. Please try again or contact support if the problem persists.",
                    });
                },
            });
        }
    };

    const saveEdit = () => {
        if (editingUser) {
            // Basic validation
            if (!editingUser.name?.trim() || !editingUser.email?.trim()) {
                toast({
                    variant: "destructive",
                    title: "Required Fields Missing",
                    description: "Please fill in both name and email fields before saving.",
                });
                return;
            }

            router.put(
                route("admin.users.update", editingUser.id),
                {
                    name: editingUser.name,
                    email: editingUser.email,
                    contact_number: editingUser.contact_number,
                    address: editingUser.address,
                },
                {
                    onSuccess: () => {
                        setIsEditDialogOpen(false);
                        setEditingUser(null);
                        toast({
                            title: "User Updated!",
                            description: `User "${editingUser.name}" has been updated successfully.`,
                        });
                    },
                    onError: () => {
                        setIsEditDialogOpen(false);
                        toast({
                            variant: "destructive",
                            title: "Update Failed!",
                            description: "Failed to update the user information. Please check the data and try again.",
                        });
                    },
                }
            );
        }
    };

    return (
        <SidebarProvider>
            <Head title="Users" />
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <a
                                        href={route("admin.dashboard")}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Dashboard
                                    </a>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <span className="mx-2 text-gray-400">
                                        ›
                                    </span>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        User Management
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div
                    className="flex flex-1 flex-col gap-6 p-6 pt-0 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
                    style={{
                        backgroundImage: `
                 radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
                 radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
               `,
                    }}
                >
                    <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <CardHeader className="bg-blue-600 border-b border-blue-700 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-white">
                                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                            <Search className="h-6 w-6 text-white" />
                                        </div>
                                        Applicant Users
                                    </CardTitle>
                                    <p className="text-blue-100 mt-2">
                                        Total:{" "}
                                        {users?.total || usersData.length}{" "}
                                        applicants
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        onClick={() =>
                                            window.open(
                                                route("admin.export.users", {
                                                    format: "pdf",
                                                }),
                                                "_blank"
                                            )
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="gap-1 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                                    >
                                        <Download className="h-3 w-3" />
                                        Export PDF
                                    </Button>
                                    <div className="relative w-64">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                                        <Input
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>
                                                Contact Number
                                            </TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>User Type</TableHead>
                                            <TableHead>Registered</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={8}
                                                    className="text-center text-muted-foreground"
                                                >
                                                    {searchTerm
                                                        ? "No users match your search"
                                                        : "No applicants found"}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user, index) => (
                                                <TableRow
                                                    key={user.id}
                                                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                                                    style={{
                                                        animationDelay: `${
                                                            index * 50
                                                        }ms`,
                                                    }}
                                                >
                                                    <TableCell className="font-medium">
                                                        {user.id}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.contact_number ||
                                                            "N/A"}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {user.address || "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {user.user_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(
                                                            user.created_at
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            user
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            user
                                                                        )
                                                                    }
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
                            {renderPaginationLinks()}
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>

            {/* Edit Dialog - Enhanced Beautiful Design */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[100vh] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 border-0 shadow-2xl rounded-3xl">
                    {/* Modal Header with Gradient Background */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 -m-6 mb-6 rounded-t-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Pencil className="h-6 w-6" />
                                </div>
                                Edit User Profile
                            </DialogTitle>
                            <DialogDescription className="text-blue-100 text-lg">
                                Update user information and contact details
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* Scrollable Form Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                        {editingUser && (
                            <div className="space-y-6">
                                {/* Name Card */}
                                <div className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-blue-50 to-blue-100 backdrop-blur-sm rounded-2xl overflow-hidden border border-blue-200/50 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                        <Label
                                            htmlFor="name"
                                            className="text-base font-bold text-blue-900"
                                        >
                                            Full Name
                                        </Label>
                                    </div>
                                    <Input
                                        id="name"
                                        value={editingUser.name}
                                        onChange={(e) =>
                                            setEditingUser({
                                                ...editingUser,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full p-4 border-2 border-blue-200 rounded-xl bg-white/70 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-semibold text-blue-900 text-lg"
                                        placeholder="Enter full name"
                                    />
                                </div>

                                {/* Email Card */}
                                <div className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-purple-50 to-purple-100 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-200/50 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                            <Mail className="h-5 w-5 text-white" />
                                        </div>
                                        <Label
                                            htmlFor="email"
                                            className="text-base font-bold text-purple-900"
                                        >
                                            Email Address
                                        </Label>
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(e) =>
                                            setEditingUser({
                                                ...editingUser,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full p-4 border-2 border-purple-200 rounded-xl bg-white/70 backdrop-blur-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 font-semibold text-purple-900 text-lg"
                                        placeholder="user@example.com"
                                    />
                                </div>

                                {/* Contact Number Card */}
                                <div className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 backdrop-blur-sm rounded-2xl overflow-hidden border border-emerald-200/50 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                                            <Phone className="h-5 w-5 text-white" />
                                        </div>
                                        <Label
                                            htmlFor="contact"
                                            className="text-base font-bold text-emerald-900"
                                        >
                                            Contact Number
                                        </Label>
                                    </div>
                                    <Input
                                        id="contact"
                                        value={editingUser.contact_number || ""}
                                        onChange={(e) =>
                                            setEditingUser({
                                                ...editingUser,
                                                contact_number: e.target.value,
                                            })
                                        }
                                        className="w-full p-4 border-2 border-emerald-200 rounded-xl bg-white/70 backdrop-blur-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 font-semibold text-emerald-900 text-lg"
                                        placeholder="+63 XXX XXX XXXX"
                                    />
                                </div>

                                {/* Address Card */}
                                <div className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-amber-50 to-amber-100 backdrop-blur-sm rounded-2xl overflow-hidden border border-amber-200/50 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
                                            <MapPin className="h-5 w-5 text-white" />
                                        </div>
                                        <Label
                                            htmlFor="address"
                                            className="text-base font-bold text-amber-900"
                                        >
                                            Address
                                        </Label>
                                    </div>
                                    <Textarea
                                        id="address"
                                        value={editingUser.address || ""}
                                        onChange={(e) =>
                                            setEditingUser({
                                                ...editingUser,
                                                address: e.target.value,
                                            })
                                        }
                                        className="w-full p-4 border-2 border-amber-200 rounded-xl bg-white/70 backdrop-blur-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-amber-900 resize-none"
                                        rows="3"
                                        placeholder="Enter complete address"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Footer with Action Buttons */}
                    <div className="border-t bg-white/50 backdrop-blur-sm p-6 -m-6 mt-6 rounded-b-3xl">
                        <DialogFooter>
                            <div className="flex justify-end gap-4 w-full">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                    className="px-8 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-semibold text-gray-700 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={saveEdit}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <span className="flex items-center gap-2">
                                        <Save className="h-5 w-5" />
                                        Save Changes
                                    </span>
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {userToDelete?.name}
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster />
        </SidebarProvider>
    );
}
