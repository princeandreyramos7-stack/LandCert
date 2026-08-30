import { useState } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, MapPin, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

/* ── Reusable field wrapper ─────────────────────────────────────── */
function Field({ label, required, hint, error, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#0d1f5c]">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
            {error && <InputError message={error} className="mt-0.5 text-xs"/>}
        </div>
    );
}

/* ── Input base classes ─────────────────────────────────────────── */
const inputCls = (hasError) =>
    `block w-full pl-11 pr-4 py-2.5 text-sm border rounded-lg bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:border-transparent ${
        hasError
            ? 'border-red-300 focus:ring-red-400'
            : 'border-gray-200 hover:border-[#1a3a8f]/50 focus:ring-[#d4a017]'
    }`;

const iconCls = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none";

/* ── Password strength ──────────────────────────────────────────── */
function getStrength(pw) {
    if (!pw) return { level: 0, label: '', color: '' };
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.match(/[a-z]/) && pw.match(/[A-Z]/)) s++;
    if (pw.match(/[0-9]/)) s++;
    if (pw.match(/[^a-zA-Z0-9]/)) s++;
    return [
        { level: 0, label: '', color: '' },
        { level: 1, label: 'Weak', color: 'bg-red-500' },
        { level: 2, label: 'Fair', color: 'bg-orange-500' },
        { level: 3, label: 'Good', color: 'bg-yellow-500' },
        { level: 4, label: 'Strong', color: 'bg-green-500' },
    ][s];
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        address: '',
        contact_number: '',
        password: '',
        password_confirmation: '',
    });
    const [showPw, setShowPw] = useState(false);
    const [showCpw, setShowCpw] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    const strength = getStrength(data.password);
    const pwMatch = data.password && data.password_confirmation && data.password === data.password_confirmation;
    const pwMismatch = data.password && data.password_confirmation && data.password !== data.password_confirmation;

    return (
        <GuestLayout>
            <Head title="Create Account — CPDO"/>

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 rounded-full bg-[#d4a017]"/>
                    <p className="text-[#d4a017] text-xs font-black tracking-[0.2em] uppercase">CPDO L.C</p>
                </div>
                <h2 className="text-2xl font-black text-[#0d1f5c]">Create Account</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Join the CPDO digital platform for faster permit processing
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">

                {/* Full Name */}
                <Field label="Full Name" required error={errors.name}>
                    <div className="relative">
                        <div className={iconCls}><User className="h-4 w-4 text-gray-400"/></div>
                        <input id="name" type="text" name="name" value={data.name}
                            autoComplete="name" autoFocus placeholder="Juan Dela Cruz"
                            className={inputCls(errors.name)}
                            onChange={(e) => setData('name', e.target.value)}/>
                    </div>
                </Field>

                {/* Email */}
                <Field label="Email Address" required error={errors.email}>
                    <div className="relative">
                        <div className={iconCls}><Mail className="h-4 w-4 text-gray-400"/></div>
                        <input id="email" type="email" name="email" value={data.email}
                            autoComplete="username" placeholder="you@example.com"
                            className={inputCls(errors.email)}
                            onChange={(e) => setData('email', e.target.value)}/>
                    </div>
                </Field>

                {/* Address */}
                <Field label="Address" error={errors.address}>
                    <div className="relative">
                        <div className={iconCls}><MapPin className="h-4 w-4 text-gray-400"/></div>
                        <input id="address" type="text" name="address" value={data.address}
                            autoComplete="address"
                            placeholder="Complete address in Ilagan City"
                            className={inputCls(errors.address)}
                            onChange={(e) => setData('address', e.target.value)}/>
                    </div>
                </Field>

                {/* Contact Number */}
                <Field label="Contact Number" hint="Format: 09XXXXXXXXX (11 digits)" error={errors.contact_number}>
                    <div className="relative">
                        <div className={iconCls}><Phone className="h-4 w-4 text-gray-400"/></div>
                        <input id="contact_number" type="tel" name="contact_number"
                            value={data.contact_number}
                            autoComplete="tel" placeholder="09XXXXXXXXX"
                            maxLength={11} pattern="09[0-9]{9}"
                            className={inputCls(errors.contact_number)}
                            onChange={(e) => setData('contact_number', e.target.value.replace(/\D/g, ''))}/>
                    </div>
                </Field>

                {/* Password */}
                <Field label="Password" required error={errors.password}>
                    <div className="relative">
                        <div className={iconCls}><Lock className="h-4 w-4 text-gray-400"/></div>
                        <input id="password" type={showPw ? 'text' : 'password'}
                            name="password" value={data.password}
                            autoComplete="new-password"
                            placeholder="Create a strong password"
                            className={`${inputCls(errors.password)} pr-11`}
                            onChange={(e) => setData('password', e.target.value)}/>
                        <button type="button" tabIndex={-1}
                            onClick={() => setShowPw(v => !v)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#0d1f5c] transition-colors focus:outline-none">
                            {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </button>
                    </div>

                    {/* Strength meter */}
                    {data.password && (
                        <div className="space-y-1 mt-1.5">
                            <div className="flex gap-1 h-1">
                                {[1,2,3,4].map(l => (
                                    <div key={l} className={`flex-1 rounded-full transition-all duration-300 ${l <= strength.level ? strength.color : 'bg-gray-100'}`}/>
                                ))}
                            </div>
                            {strength.label && (
                                <p className="text-xs text-gray-500">
                                    Strength: <span className="font-semibold text-gray-700">{strength.label}</span>
                                </p>
                            )}
                        </div>
                    )}
                </Field>

                {/* Confirm Password */}
                <Field label="Confirm Password" required error={errors.password_confirmation}>
                    <div className="relative">
                        <div className={iconCls}><Lock className="h-4 w-4 text-gray-400"/></div>
                        <input id="password_confirmation"
                            type={showCpw ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            placeholder="Re-enter your password"
                            className={`${inputCls(errors.password_confirmation || pwMismatch)} pr-11`}
                            onChange={(e) => setData('password_confirmation', e.target.value)}/>
                        <button type="button" tabIndex={-1}
                            onClick={() => setShowCpw(v => !v)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#0d1f5c] transition-colors focus:outline-none">
                            {showCpw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </button>
                    </div>

                    {/* Match indicator */}
                    {data.password_confirmation && data.password && (
                        <div className="mt-1">
                            {pwMatch ? (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5"/>Passwords match
                                </p>
                            ) : (
                                <p className="text-xs text-red-500">Passwords do not match</p>
                            )}
                        </div>
                    )}
                </Field>

                {/* Submit */}
                <button type="submit" disabled={processing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white font-bold text-sm shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] mt-2"
                    style={{ background: "linear-gradient(90deg,#0d1f5c,#1a3a8f)" }}>
                    {processing ? (
                        <><Loader2 className="h-4 w-4 animate-spin"/><span>Creating account...</span></>
                    ) : (
                        <><span>Create Account</span><ArrowRight className="h-4 w-4"/></>
                    )}
                </button>

                {/* Divider */}
                <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"/>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-3 bg-white text-xs text-gray-400">Already have an account?</span>
                    </div>
                </div>

                {/* Login link */}
                <Link href={route('login')}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-bold border-2 border-[#0d1f5c]/20 text-[#0d1f5c] hover:border-[#d4a017] hover:text-[#d4a017] hover:bg-[#d4a017]/5 transition-all duration-200 group">
                    <span>Sign In Instead</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                </Link>
            </form>
        </GuestLayout>
    );
}
