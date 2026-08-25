import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { User, Mail, Lock, Shield, Save, Eye, EyeOff } from 'lucide-react';

export default function Profile({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;

    // Profile Information Form
    const { data: profileData, setData: setProfileData, patch: patchProfile, errors: profileErrors, processing: profileProcessing, recentlySuccessful: profileSuccess } = useForm({
        name: user.name,
        email: user.email,
    });

    // Password Update Form
    const { data: passwordData, setData: setPasswordData, put: putPassword, errors: passwordErrors, processing: passwordProcessing, reset: resetPassword, recentlySuccessful: passwordSuccess } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        patchProfile(route('admin.profile.update'));
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        putPassword(route('admin.password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    return (
        <>
            <Head title="Profile - Admin" />
            
            <AdminLayout title="My Profile">
                <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="relative overflow-hidden rounded-2xl text-white"
                        style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}>
                        <div className="relative z-10 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-[#d4a017]/20 border-2 border-[#d4a017]/30 flex items-center justify-center">
                                    <User className="w-8 h-8 text-[#d4a017]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Profile Settings</h2>
                                    <p className="text-blue-200/70 text-sm mt-1">Manage your account information and security</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Profile Information */}
                        <Card className="border-l-4 border-l-[#0d1f5c]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-[#0d1f5c]" />
                                    Profile Information
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1">
                                    Update your account name and email address
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="name"
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData('name', e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                        {profileErrors.name && (
                                            <p className="text-sm text-red-600">{profileErrors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData('email', e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                        {profileErrors.email && (
                                            <p className="text-sm text-red-600">{profileErrors.email}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <Button
                                            type="submit"
                                            disabled={profileProcessing}
                                            className="bg-[#0d1f5c] hover:bg-[#1a3a8f]"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {profileProcessing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        {profileSuccess && (
                                            <p className="text-sm text-green-600">Saved successfully!</p>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Update Password */}
                        <Card className="border-l-4 border-l-[#d4a017]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-[#d4a017]" />
                                    Update Password
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1">
                                    Ensure your account is using a strong password
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Current Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="current_password"
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {passwordErrors.current_password && (
                                            <p className="text-sm text-red-600">{passwordErrors.current_password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData('password', e.target.value)}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {passwordErrors.password && (
                                            <p className="text-sm text-red-600">{passwordErrors.password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="password_confirmation"
                                                type={showPasswordConfirmation ? "text" : "password"}
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {passwordErrors.password_confirmation && (
                                            <p className="text-sm text-red-600">{passwordErrors.password_confirmation}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <Button
                                            type="submit"
                                            disabled={passwordProcessing}
                                            className="bg-[#d4a017] hover:bg-[#b8850f] text-white"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {passwordProcessing ? 'Updating...' : 'Update Password'}
                                        </Button>
                                        {passwordSuccess && (
                                            <p className="text-sm text-green-600">Password updated!</p>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
