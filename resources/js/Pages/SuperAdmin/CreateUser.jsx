import { SuperAdminSidebar } from "@/Components/super-admin-sidebar";
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
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { UserPlus, User, Mail, Phone, MapPin, Key, Shield } from "lucide-react";

export default function CreateUser() {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        user_type: "applicant",
        contact_number: "",
        address: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password) {
            toast({
                variant: "destructive",
                title: "Required Fields Missing",
                description: "Please fill in name, email, and password.",
            });
            return;
        }

        router.post(route("super-admin.create-admin"), formData, {
            onSuccess: () => {
                toast({
                    title: "User Created!",
                    description: `User "${formData.name}" has been created successfully.`,
                });
                router.visit(route("super-admin.users"));
            },
            onError: (errors) => {
                toast({
                    variant: "destructive",
                    title: "Creation Failed!",
                    description: errors.email || "Failed to create user. Please try again.",
                });
            },
        });
    };

    return (
        <SidebarProvider>
            <Head title="Create New User - Super Admin" />
            <SuperAdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <a
                                        href={route("super-admin.users")}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        User Management
                                    </a>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <span className="mx-2 text-gray-400">›</span>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-gray-900 font-semibold">
                                        Create New User
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div
                    className="flex flex-1 flex-col gap-6 p-6 pt-0 min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, rgba(96, 165, 250, 0.05) 0%, transparent 50%)
                        `,
                    }}
                >
                    {/* Header */}
                    <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <UserPlus className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Create New User</h1>
                                <p className="text-blue-100">Add a new user to the system</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                            <CardHeader className="border-b">
                                <CardTitle className="text-xl font-semibold text-gray-900">
                                    User Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-purple-600" />
                                            Full Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-purple-600" />
                                            Email Address *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            placeholder="user@example.com"
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="flex items-center gap-2">
                                            <Key className="h-4 w-4 text-purple-600" />
                                            Password *
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({ ...formData, password: e.target.value })
                                            }
                                            placeholder="Enter password (min. 8 characters)"
                                            required
                                            minLength={8}
                                        />
                                    </div>

                                    {/* User Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor="user_type" className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-purple-600" />
                                            User Type *
                                        </Label>
                                        <Select
                                            value={formData.user_type}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, user_type: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="applicant">Applicant</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Contact Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="contact" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-purple-600" />
                                            Contact Number
                                        </Label>
                                        <Input
                                            id="contact"
                                            value={formData.contact_number}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    contact_number: e.target.value,
                                                })
                                            }
                                            placeholder="+63 XXX XXX XXXX"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address" className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-purple-600" />
                                            Address
                                        </Label>
                                        <Textarea
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) =>
                                                setFormData({ ...formData, address: e.target.value })
                                            }
                                            placeholder="Enter complete address"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route("super-admin.users"))}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Create User
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
