import { useState, useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

/* ── Reusable field wrapper ─────────────────────────────────────── */
function Field({ label, required, error, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#0d1f5c]">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && (
                <InputError message={error} className="mt-0.5 text-xs" />
            )}
        </div>
    );
}

/* ── Input base classes ─────────────────────────────────────────── */
const inputCls = (hasError) =>
    `block w-full pl-11 pr-4 py-3 text-sm border rounded-lg bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:border-transparent ${
        hasError
            ? 'border-red-300 focus:ring-red-400'
            : 'border-gray-200 hover:border-[#1a3a8f]/50 focus:ring-[#d4a017]'
    }`;

const iconCls = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formKey, setFormKey] = useState(Date.now()); // Force form remount

    // Clear form on mount to prevent autofill from showing after logout
    useEffect(() => {
        // Force a new form key to remount the form completely
        setFormKey(Date.now());
        
        // Clear the form data
        setData({
            email: '',
            password: '',
            remember: false,
        });

        // Clear the actual input fields after a small delay
        setTimeout(() => {
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            if (emailInput) {
                emailInput.value = '';
                emailInput.setAttribute('readonly', 'readonly');
                setTimeout(() => emailInput.removeAttribute('readonly'), 100);
            }
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.setAttribute('readonly', 'readonly');
                setTimeout(() => passwordInput.removeAttribute('readonly'), 100);
            }
        }, 50);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Sign In — CPDO" />

            {/* Header */}
            <div className="mb-7">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 rounded-full bg-[#d4a017]"/>
                    <p className="text-[#d4a017] text-xs font-black tracking-[0.2em] uppercase">CPDO LandCert</p>
                </div>
                <h2 className="text-2xl font-black text-[#0d1f5c]">Welcome Back</h2>
                <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue</p>
            </div>

            {/* Status */}
            {status && (
                <div className="mb-5 rounded-lg bg-green-50 border border-green-200 p-3.5 flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-sm text-green-700 font-medium">{status}</p>
                </div>
            )}

            <form key={formKey} onSubmit={submit} className="space-y-5" autoComplete="off">
                {/* Email */}
                <Field label="Email Address" required error={errors.email}>
                    <div className="relative">
                        <div className={iconCls}>
                            <Mail className="h-4 w-4 text-gray-400"/>
                        </div>
                        <input
                            key={`email-${formKey}`}
                            id="email" 
                            type="email" 
                            name="email-new"
                            value={data.email} 
                            autoComplete="new-password"
                            autoFocus
                            placeholder="you@example.com"
                            className={inputCls(errors.email)}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                </Field>

                {/* Password */}
                <Field label="Password" required error={errors.password}>
                    <div className="relative">
                        <div className={iconCls}>
                            <Lock className="h-4 w-4 text-gray-400"/>
                        </div>
                        <input
                            key={`password-${formKey}`}
                            id="password" 
                            type={showPassword ? 'text' : 'password'}
                            name="password-new" 
                            value={data.password}
                            autoComplete="new-password"
                            placeholder="Enter your password"
                            className={`${inputCls(errors.password)} pr-11`}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button type="button" tabIndex={-1}
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#0d1f5c] transition-colors focus:outline-none">
                            {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </button>
                    </div>
                </Field>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox name="remember" checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300 text-[#0d1f5c] focus:ring-[#d4a017]"/>
                        <span className="text-sm text-gray-600 group-hover:text-[#0d1f5c] transition-colors select-none">
                            Remember me
                        </span>
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')}
                            className="text-sm font-semibold text-[#0d1f5c] hover:text-[#d4a017] transition-colors">
                            Forgot password?
                        </Link>
                    )}
                </div>

                {/* Submit */}
                <button type="submit" disabled={processing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white font-bold text-sm shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
                    style={{ background: "linear-gradient(90deg,#0d1f5c,#1a3a8f)" }}>
                    {processing ? (
                        <><Loader2 className="h-4 w-4 animate-spin"/><span>Signing in...</span></>
                    ) : (
                        <><span>Sign In</span><ArrowRight className="h-4 w-4"/></>
                    )}
                </button>

                {/* Divider */}
                <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"/>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-3 bg-white text-xs text-gray-400">Don't have an account?</span>
                    </div>
                </div>

                {/* Register link */}
                <Link href={route('register')}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-bold border-2 border-[#0d1f5c]/20 text-[#0d1f5c] hover:border-[#d4a017] hover:text-[#d4a017] hover:bg-[#d4a017]/5 transition-all duration-200 group">
                    <span>Create a Free Account</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                </Link>
            </form>
        </GuestLayout>
    );
}
