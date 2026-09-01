import { Head, Link, useForm, usePage } from "@inertiajs/react";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import { Transition } from "@headlessui/react";
import InputError from "@/Components/InputError";
import AvatarUpload from "@/Components/AvatarUpload";
import { useRef, useState } from "react";
import {
    User, Lock, Trash2, Mail, KeyRound, Eye, EyeOff,
    ShieldAlert, CheckCircle2, Save, AlertTriangle,
} from "lucide-react";

/* ── Field wrapper ─────────────────────────────────────── */
function Field({ label, error, children, hint }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#0d1f5c]">{label}</label>
            {children}
            {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
            {error && <InputError message={error} className="text-xs"/>}
        </div>
    );
}

const inputCls = (err) =>
    `block w-full px-4 py-2.5 text-sm border rounded-lg bg-white transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
        err ? "border-red-300 focus:ring-red-400"
            : "border-gray-200 hover:border-[#1a3a8f]/40 focus:ring-[#d4a017]"
    }`;

/* ── Section card ──────────────────────────────────────── */
function Section({ icon: Icon, title, desc, accent, badge, badgeColor, children }) {
    return (
        <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${accent} shadow-sm overflow-hidden`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(13,31,92,0.06)" }}>
                        <Icon className="w-5 h-5 text-[#0d1f5c]"/>
                    </div>
                    <div>
                        <h2 className="font-black text-[#0d1f5c] text-sm">{title}</h2>
                        <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                </div>
                {badge && (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeColor}`}>
                        {badge}
                    </span>
                )}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

/* ── Profile Info Form ─────────────────────────────────── */
function ProfileInfoForm({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    return (
        <form onSubmit={e => { e.preventDefault(); patch(route("profile.update")); }} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Full Name" error={errors.name}>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <input id="name" type="text" value={data.name} autoComplete="name" autoFocus
                            onChange={e => setData("name", e.target.value)}
                            className={`${inputCls(errors.name)} pl-10`}/>
                    </div>
                </Field>
                <Field label="Email Address" error={errors.email}>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <input id="email" type="email" value={data.email} autoComplete="username"
                            onChange={e => setData("email", e.target.value)}
                            className={`${inputCls(errors.email)} pl-10`}/>
                    </div>
                </Field>
            </div>

            {mustVerifyEmail && user.email_verified_at === null && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0"/>
                    <div className="text-sm text-yellow-800">
                        Your email address is unverified.{" "}
                        <Link href={route("verification.send")} method="post" as="button"
                            className="underline font-semibold hover:text-yellow-900">
                            Resend verification email
                        </Link>
                        {status === "verification-link-sent" && (
                            <p className="mt-1 text-green-700 font-medium">Verification email sent!</p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 pt-1">
                <button type="submit" disabled={processing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold shadow transition-all disabled:opacity-60"
                    style={{ background: "linear-gradient(90deg,#0d1f5c,#1a3a8f)" }}>
                    <Save className="w-4 h-4"/>
                    {processing ? "Saving…" : "Save Changes"}
                </button>
                <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0"
                    leave="transition ease-in-out" leaveTo="opacity-0">
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                        <CheckCircle2 className="w-4 h-4"/> Saved!
                    </span>
                </Transition>
            </div>
        </form>
    );
}

/* ── Password Form ─────────────────────────────────────── */
function PasswordForm() {
    const pwRef = useRef();
    const curPwRef = useRef();
    const [show, setShow] = useState({ cur: false, pw: false, cpw: false });

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: "", password: "", password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) { reset("password", "password_confirmation"); pwRef.current.focus(); }
                if (errs.current_password) { reset("current_password"); curPwRef.current.focus(); }
            },
        });
    };

    const PwInput = ({ id, label, field, refProp, autoComplete, showKey }) => (
        <Field label={label} error={errors[field]}>
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input id={id} type={show[showKey] ? "text" : "password"} ref={refProp}
                    value={data[field]} autoComplete={autoComplete}
                    onChange={e => setData(field, e.target.value)}
                    className={`${inputCls(errors[field])} pl-10 pr-10`}/>
                <button type="button" tabIndex={-1}
                    onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0d1f5c] transition-colors">
                    {show[showKey] ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
            </div>
        </Field>
    );

    return (
        <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <PwInput id="current_password" label="Current Password" field="current_password"
                    refProp={curPwRef} autoComplete="current-password" showKey="cur"/>
                <div/>{/* spacer */}
                <PwInput id="password" label="New Password" field="password"
                    refProp={pwRef} autoComplete="new-password" showKey="pw"/>
                <PwInput id="password_confirmation" label="Confirm New Password" field="password_confirmation"
                    autoComplete="new-password" showKey="cpw"/>
            </div>

            <div className="flex items-center gap-4 pt-1">
                <button type="submit" disabled={processing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold shadow transition-all disabled:opacity-60"
                    style={{ background: "linear-gradient(90deg,#d4a017,#b8880d)" }}>
                    <Lock className="w-4 h-4"/>
                    {processing ? "Updating…" : "Update Password"}
                </button>
                <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0"
                    leave="transition ease-in-out" leaveTo="opacity-0">
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                        <CheckCircle2 className="w-4 h-4"/> Password updated!
                    </span>
                </Transition>
            </div>
        </form>
    );
}

/* ── Delete Account ────────────────────────────────────── */
function DeleteAccount() {
    const [open, setOpen] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const pwRef = useRef();
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: "" });

    const submit = (e) => {
        e.preventDefault();
        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onError: () => pwRef.current.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm text-gray-500 max-w-lg">
                    Once your account is deleted, all data will be permanently removed.
                    Please download any information you wish to retain before proceeding.
                </p>
                <button onClick={() => setOpen(true)}
                    className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow transition-colors">
                    <Trash2 className="w-4 h-4"/> Delete Account
                </button>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => { setOpen(false); clearErrors(); reset(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100 bg-red-50 rounded-t-2xl">
                            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0"/>
                            <h3 className="font-black text-red-700 text-base">Delete Account</h3>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                This action <span className="font-bold text-red-600">cannot be undone</span>.
                                All your applications, data, and account information will be permanently deleted.
                                Enter your password to confirm.
                            </p>
                            <Field label="Your Password" error={errors.password}>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                                    <input id="del-password" type={showPw ? "text" : "password"}
                                        ref={pwRef} value={data.password} autoFocus
                                        onChange={e => setData("password", e.target.value)}
                                        placeholder="Enter your password"
                                        className={`${inputCls(errors.password)} pl-10 pr-10`}/>
                                    <button type="button" tabIndex={-1}
                                        onClick={() => setShowPw(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                    </button>
                                </div>
                            </Field>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setOpen(false); clearErrors(); reset(); }}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 transition-colors">
                                    <Trash2 className="w-4 h-4"/>
                                    {processing ? "Deleting…" : "Permanently Delete"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const initials = user?.name
        ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
        : "U";

    return (
        <>
            <Head title="Profile — CPDO LC"/>
            <ApplicantLayout title="My Account">
                <div className="space-y-6">

                    {/* ── Profile banner ─────────────────────────── */}
                    <div className="relative overflow-hidden rounded-2xl text-white"
                        style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}>
                        <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                            <defs><pattern id="pg" width="48" height="48" patternUnits="userSpaceOnUse">
                                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#93c5fd" strokeWidth="0.7"/>
                            </pattern></defs>
                            <rect width="100%" height="100%" fill="url(#pg)"/>
                        </svg>
                        <div className="absolute right-0 top-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                            style={{ background: "radial-gradient(circle,#d4a017,transparent 70%)" }}/>

                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 lg:p-8">
                            {/* Avatar — click the camera to upload a profile picture */}
                            <AvatarUpload
                                shape="rounded-2xl"
                                sizeClass="w-20 h-20"
                                fallback={<span className="font-black text-3xl">{initials}</span>}
                            />

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-1 h-4 rounded-full bg-[#d4a017]"/>
                                    <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">My Account</p>
                                </div>
                                <h1 className="text-2xl lg:text-3xl font-black truncate">{user?.name || "User"}</h1>
                                <p className="text-blue-200/70 text-sm mt-0.5">{user?.email}</p>
                            </div>

                            {/* Stats row */}
                            <div className="flex items-center gap-6 sm:gap-8 shrink-0">
                                {[
                                    { label: "Account Type", value: "Applicant" },
                                    { label: "Status", value: "Active" },
                                ].map((s, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-white font-black text-sm">{s.value}</p>
                                        <p className="text-blue-300/70 text-xs mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Two-column grid ─────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left — Profile Info */}
                        <Section icon={User} title="Profile Information"
                            desc="Update your name and email address"
                            accent="border-l-[#0d1f5c]"
                            badge="Personal" badgeColor="bg-[#0d1f5c]/8 text-[#0d1f5c]">
                            <ProfileInfoForm mustVerifyEmail={mustVerifyEmail} status={status}/>
                        </Section>

                        {/* Right — Password */}
                        <Section icon={Lock} title="Update Password"
                            desc="Use a long, random password to stay secure"
                            accent="border-l-[#d4a017]"
                            badge="Security" badgeColor="bg-[#d4a017]/10 text-[#d4a017]">
                            <PasswordForm/>
                        </Section>
                    </div>

                    {/* ── Delete account — full width ─────────────── */}
                    <Section icon={Trash2} title="Danger Zone"
                        desc="Permanently remove your account and all associated data"
                        accent="border-l-red-500"
                        badge="Irreversible" badgeColor="bg-red-50 text-red-600">
                        <DeleteAccount/>
                    </Section>

                </div>
            </ApplicantLayout>
        </>
    );
}
