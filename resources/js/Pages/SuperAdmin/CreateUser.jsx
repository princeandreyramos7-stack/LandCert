import { Head, router } from "@inertiajs/react";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { useToast } from "@/Components/ui/use-toast";
import { Toaster } from "@/Components/ui/toaster";
import { useState } from "react";
import { UserPlus, User, Mail, Phone, MapPin, Key, Shield } from "lucide-react";

export default function CreateUser() {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "", email: "", password: "", user_type: "applicant",
        contact_number: "", address: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            toast({ variant: "destructive", title: "Required Fields Missing", description: "Please fill in name, email, and password." });
            return;
        }
        router.post(route("super-admin.create-admin"), formData, {
            onSuccess: () => {
                toast({ title: "User Created!", description: `User "${formData.name}" has been created successfully.` });
                router.visit(route("super-admin.users"));
            },
            onError: (errors) => {
                toast({ variant: "destructive", title: "Creation Failed!", description: errors.email || "Failed to create user." });
            },
        });
    };

    const fieldIcon = "h-4 w-4 text-[#d4a017]";
    const inputCls = "border-gray-200 focus:border-[#d4a017] focus:ring-[#d4a017]/20";

    return (
        <>
            <Head title="Create New User — CPDO Super Admin"/>
            <SuperAdminLayout title="Create New User" breadcrumbs={[{ label: "Dashboard", href: "/super-admin/dashboard" }, { label: "Users", href: "/super-admin/users" }]}>

                {/* Page header */}
                <div className="relative overflow-hidden rounded-2xl text-white mb-6"
                    style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}>
                    <div className="relative z-10 flex items-center gap-4 p-6">
                        <div className="p-3 bg-[#d4a017]/20 border border-[#d4a017]/30 rounded-xl">
                            <UserPlus className="h-7 w-7 text-[#d4a017]"/>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1 h-4 rounded-full bg-[#d4a017]"/>
                                <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">Super Admin</p>
                            </div>
                            <h1 className="text-xl font-black text-white">Create New User</h1>
                            <p className="text-blue-200/70 text-sm">Add a new user account to the system</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card className="bg-white border border-gray-100 shadow-sm">
                        <CardHeader className="border-b border-gray-50 px-6 py-4">
                            <CardTitle className="text-base font-black text-[#0d1f5c]">User Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-[#0d1f5c]">
                                        <User className={fieldIcon}/> Full Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="name" value={formData.name} placeholder="Juan Dela Cruz" required
                                        className={inputCls} onChange={e => setFormData({ ...formData, name: e.target.value })}/>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-[#0d1f5c]">
                                        <Mail className={fieldIcon}/> Email Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="email" type="email" value={formData.email} placeholder="user@example.com" required
                                        className={inputCls} onChange={e => setFormData({ ...formData, email: e.target.value })}/>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-[#0d1f5c]">
                                        <Key className={fieldIcon}/> Password <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="password" type="password" value={formData.password}
                                        placeholder="Min. 8 characters" required minLength={8}
                                        className={inputCls} onChange={e => setFormData({ ...formData, password: e.target.value })}/>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="user_type" className="flex items-center gap-2 text-sm font-semibold text-[#0d1f5c]">
                                        <Shield className={fieldIcon}/> User Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.user_type} onValueChange={v => setFormData({ ...formData, user_type: v })}>
                                        <SelectTrigger className={inputCls}><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="applicant">Applicant</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="contact" className="flex items-center gap-2 text-sm font-semibold text-[#0d1f5c]">
                                        <Phone className={fieldIcon}/> Contact Number
                                    </Label>
                                    <Input id="contact" value={formData.contact_number} placeholder="09XXXXXXXXX"
                                        className={inputCls} onChange={e => setFormData({ ...formData, contact_number: e.target.value })}/>
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="address" className="flex items-center gap-2 text-sm font-semibold text-[#0d1f5c]">
                                        <MapPin className={fieldIcon}/> Address
                                    </Label>
                                    <Textarea id="address" value={formData.address} placeholder="Enter complete address" rows={3}
                                        className={`${inputCls} resize-none`}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}/>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-50">
                                <Button type="button" variant="outline" className="border-gray-200"
                                    onClick={() => router.visit(route("super-admin.users"))}>Cancel</Button>
                                <Button type="submit" className="bg-[#0d1f5c] hover:bg-[#1a3a8f] text-white gap-2">
                                    <UserPlus className="h-4 w-4"/> Create User
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </SuperAdminLayout>
            <Toaster/>
        </>
    );
}
