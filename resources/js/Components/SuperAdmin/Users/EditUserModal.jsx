import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { useToast } from "@/Components/ui/use-toast";
import { User, Mail, Key, Shield, Phone, MapPin, Loader2 } from "lucide-react";

const BLANK = {
    name: "",
    email: "",
    password: "",
    user_type: "applicant",
    contact_number: "",
    address: "",
};

/**
 * Edit a user without leaving the list.
 *
 * The fields and the endpoint are the ones the standalone edit page used; only
 * the container changed. Editing a row is a small correction — sending someone
 * to another page and back for it lost their filters, their search and their
 * place in the list every time.
 */
export function EditUserModal({ user, isOpen, onClose }) {
    const { toast } = useToast();
    const [form, setForm] = useState(BLANK);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Reload whenever a different row is opened: the dialog stays mounted
    // between openings, so without this the second user edited would arrive
    // carrying the first one's details.
    useEffect(() => {
        if (!user) return;
        setForm({
            name: user.name || "",
            email: user.email || "",
            password: "",
            user_type: user.user_type || "applicant",
            contact_number: user.contact_number || "",
            address: user.address || "",
        });
        setErrors({});
    }, [user]);

    const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.name || !form.email) {
            toast({
                variant: "destructive",
                title: "Required Fields Missing",
                description: "Please fill in name and email.",
            });
            return;
        }

        setSaving(true);
        router.put(route("super-admin.users.update", user.id), form, {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: "User Updated!",
                    description: `User "${form.name}" has been updated successfully.`,
                });
                onClose();
            },
            onError: (responseErrors) => {
                setErrors(responseErrors || {});
                toast({
                    variant: "destructive",
                    title: "Update Failed!",
                    description:
                        responseErrors?.email ||
                        Object.values(responseErrors || {}).flat().join(" ") ||
                        "Failed to update user. Please try again.",
                });
            },
            onFinish: () => setSaving(false),
        });
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-[#0d1f5c]">Edit User</DialogTitle>
                    <DialogDescription>
                        Update the details for {user.name}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            Full Name *
                        </Label>
                        <Input
                            id="edit-name"
                            value={form.name}
                            onChange={(e) => set("name")(e.target.value)}
                            placeholder="Enter full name"
                            required
                        />
                        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            Email Address *
                        </Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => set("email")(e.target.value)}
                            placeholder="user@example.com"
                            required
                        />
                        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-password" className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-blue-600" />
                            Password
                        </Label>
                        <Input
                            id="edit-password"
                            type="password"
                            value={form.password}
                            onChange={(e) => set("password")(e.target.value)}
                            placeholder="Leave blank to keep current password"
                            minLength={8}
                        />
                        <p className="text-xs text-gray-500">
                            Leave blank to keep the current password.
                        </p>
                        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-user-type" className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            User Type *
                        </Label>
                        <Select value={form.user_type} onValueChange={set("user_type")}>
                            <SelectTrigger id="edit-user-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="applicant">Applicant</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.user_type && <p className="text-xs text-red-600">{errors.user_type}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-contact" className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-blue-600" />
                            Contact Number
                        </Label>
                        <Input
                            id="edit-contact"
                            value={form.contact_number}
                            onChange={(e) => set("contact_number")(e.target.value)}
                            placeholder="09XXXXXXXXX"
                        />
                        {errors.contact_number && (
                            <p className="text-xs text-red-600">{errors.contact_number}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-address" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            Address
                        </Label>
                        <Input
                            id="edit-address"
                            value={form.address}
                            onChange={(e) => set("address")(e.target.value)}
                            placeholder="Complete address"
                        />
                        {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="gap-2 bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90"
                        >
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {saving ? "Saving…" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
