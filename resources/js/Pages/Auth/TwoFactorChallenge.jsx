import { useState, useEffect, useRef } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { ShieldCheck, ArrowRight, Loader2, CheckCircle2, RotateCw } from 'lucide-react';

const RESEND_COOLDOWN_SECONDS = 60;

export default function TwoFactorChallenge({ maskedPhone, status }) {
    const { data, setData, post, processing, errors, reset } = useForm({ code: '' });
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
    const [resending, setResending] = useState(false);
    const [resendError, setResendError] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.verify'), { onFinish: () => reset('code') });
    };

    const resend = () => {
        setResending(true);
        setResendError(null);
        router.post(route('two-factor.resend'), {}, {
            preserveScroll: true,
            onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS),
            onError: (errs) => setResendError(errs.code || 'Could not resend the code.'),
            onFinish: () => setResending(false),
        });
    };

    return (
        <GuestLayout>
            <Head title="Verify Your Sign-In — CPDO" />

            <div className="mb-7">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 rounded-full bg-[#d4a017]"/>
                    <p className="text-[#d4a017] text-xs font-black tracking-[0.2em] uppercase">CPDO LC</p>
                </div>
                <h2 className="text-2xl font-black text-[#0d1f5c]">Verify It's You</h2>
                <p className="mt-1 text-sm text-gray-500">
                    {maskedPhone
                        ? <>We texted a 6-digit code to <span className="font-semibold text-[#0d1f5c]">{maskedPhone}</span>.</>
                        : 'Enter the 6-digit code we texted you.'}
                </p>
            </div>

            {status && (
                <div className="mb-5 rounded-lg bg-green-50 border border-green-200 p-3.5 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <p className="text-sm text-green-700 font-medium">{status}</p>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#0d1f5c]">
                        Verification Code<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <ShieldCheck className="h-4 w-4 text-gray-400"/>
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="000000"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className={`block w-full pl-11 pr-4 py-3 text-sm tracking-[0.4em] font-bold border rounded-lg bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:border-transparent ${
                                errors.code
                                    ? 'border-red-300 focus:ring-red-400'
                                    : 'border-gray-200 hover:border-[#1a3a8f]/50 focus:ring-[#d4a017]'
                            }`}
                        />
                    </div>
                    {errors.code && <InputError message={errors.code} className="mt-0.5 text-xs" />}
                </div>

                <button type="submit" disabled={processing || data.code.length !== 6}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white font-bold text-sm shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
                    style={{ background: "linear-gradient(90deg,#0d1f5c,#1a3a8f)" }}>
                    {processing ? (
                        <><Loader2 className="h-4 w-4 animate-spin"/><span>Verifying...</span></>
                    ) : (
                        <><span>Verify & Sign In</span><ArrowRight className="h-4 w-4"/></>
                    )}
                </button>

                <div className="text-center space-y-1.5">
                    <button type="button" onClick={resend} disabled={resending || cooldown > 0}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0d1f5c] hover:text-[#d4a017] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[#0d1f5c]">
                        {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <RotateCw className="h-3.5 w-3.5"/>}
                        <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}</span>
                    </button>
                    {resendError && <p className="text-xs text-red-500">{resendError}</p>}
                </div>
            </form>
        </GuestLayout>
    );
}
