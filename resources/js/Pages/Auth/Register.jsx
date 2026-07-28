import { useState } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, MapPin, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        address: '',
        contact_number: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Password strength indicator
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        const levels = [
            { strength: 0, label: '', color: '' },
            { strength: 1, label: 'Weak', color: 'bg-red-500' },
            { strength: 2, label: 'Fair', color: 'bg-orange-500' },
            { strength: 3, label: 'Good', color: 'bg-yellow-500' },
            { strength: 4, label: 'Strong', color: 'bg-green-500' },
        ];

        return levels[strength];
    };

    const passwordStrength = getPasswordStrength(data.password);

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join CPDO digital services for faster permit processing
                    </p>
                </div>

                {/* Registration Form */}
                <form onSubmit={submit} className="space-y-5">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                className={`block w-full pl-11 pr-4 py-3 text-base border rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.name 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                autoComplete="name"
                                autoFocus
                                placeholder="Juan Dela Cruz"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                        </div>
                        {errors.name && (
                            <div className="animate-in slide-in-from-top-1 duration-200">
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                        )}
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className={`block w-full pl-11 pr-4 py-3 text-base border rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.email 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                autoComplete="username"
                                placeholder="you@example.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                        </div>
                        {errors.email && (
                            <div className="animate-in slide-in-from-top-1 duration-200">
                                <InputError message={errors.email} className="mt-1" />
                            </div>
                        )}
                    </div>

                    {/* Address Input */}
                    <div className="space-y-2">
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                            Address
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                id="address"
                                type="text"
                                name="address"
                                value={data.address}
                                className={`block w-full pl-11 pr-4 py-3 text-base border rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.address 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                autoComplete="address"
                                placeholder="Complete address in Ilagan City"
                                onChange={(e) => setData('address', e.target.value)}
                            />
                        </div>
                        {errors.address && (
                            <div className="animate-in slide-in-from-top-1 duration-200">
                                <InputError message={errors.address} className="mt-1" />
                            </div>
                        )}
                    </div>

                    {/* Contact Number Input */}
                    <div className="space-y-2">
                        <label htmlFor="contact_number" className="block text-sm font-semibold text-gray-700">
                            Contact Number
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                id="contact_number"
                                type="tel"
                                name="contact_number"
                                value={data.contact_number}
                                className={`block w-full pl-11 pr-4 py-3 text-base border rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.contact_number 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                autoComplete="tel"
                                placeholder="09XXXXXXXXX"
                                maxLength={11}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setData('contact_number', value);
                                }}
                                pattern="09[0-9]{9}"
                            />
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>Format: 09XXXXXXXXX (11 digits)</span>
                        </p>
                        {errors.contact_number && (
                            <div className="animate-in slide-in-from-top-1 duration-200">
                                <InputError message={errors.contact_number} className="mt-1" />
                            </div>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className={`block w-full pl-11 pr-12 py-3 text-base border rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.password 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                autoComplete="new-password"
                                placeholder="Create a strong password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {data.password && (
                            <div className="space-y-2 animate-in fade-in duration-300">
                                <div className="flex gap-1 h-1">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={`flex-1 rounded-full transition-all duration-300 ${
                                                level <= passwordStrength.strength
                                                    ? passwordStrength.color
                                                    : 'bg-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                                {passwordStrength.label && (
                                    <p className="text-xs text-gray-600">
                                        Password strength: <span className="font-semibold">{passwordStrength.label}</span>
                                    </p>
                                )}
                            </div>
                        )}
                        
                        {errors.password && (
                            <div className="animate-in slide-in-from-top-1 duration-200">
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2">
                        <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className={`block w-full pl-11 pr-12 py-3 text-base border rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.password_confirmation 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                autoComplete="new-password"
                                placeholder="Re-enter your password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        
                        {/* Password Match Indicator */}
                        {data.password_confirmation && data.password && (
                            <div className="animate-in fade-in duration-300">
                                {data.password === data.password_confirmation ? (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Passwords match
                                    </p>
                                ) : (
                                    <p className="text-xs text-red-600">
                                        Passwords do not match
                                    </p>
                                )}
                            </div>
                        )}
                        
                        {errors.password_confirmation && (
                            <div className="animate-in slide-in-from-top-1 duration-200">
                                <InputError message={errors.password_confirmation} className="mt-1" />
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Creating account...</span>
                            </>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-gray-50 text-gray-500">
                                Already have an account?
                            </span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <Link
                        href={route('login')}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
                    >
                        <span>Sign in instead</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </form>
            </div>
        </GuestLayout>
    );
}
