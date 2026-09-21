<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        // Compose the full address line from PSGC codes
        $addressData = \App\Support\PhilippineAddress::resolve($validated, 'address');
        $validated['address'] = $addressData['line'] ?? '';
        
        $request->user()->fill($validated);

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Replace the signed-in staff member's e-signature. In force from now:
     * documents issued from today carry it; anything issued before keeps
     * the signature it was issued with. The position is the
     * administrator's to set (User Management), not changed here.
     */
    public function updateSignature(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless(in_array($user->user_type, ['admin', 'super_admin'], true), 403, 'Only staff sign documents.');

        $request->validate([
            'signature' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
        ]);

        $version = \App\Support\Signatories::set($user, $request->file('signature'), null, now(), $user->id, 'Replaced from My Profile');

        \App\Services\AuditLogService::logUpdate('User', $user->id, [], [
            'signature_path' => $version->signature_path,
            'effective_from' => $version->effective_from->toDateTimeString(),
        ], "{$user->name} replaced their e-signature");

        return back()->with('status', 'signature-updated')->with('success', 'Your new e-signature is in force from now. Documents already issued keep the signature they were issued with.');
    }

    /**
     * Upload / replace the signed-in user's profile picture.
     * Shared by the applicant, admin and super-admin profile pages.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $user = $request->user();

        // Drop the previous file so old avatars do not pile up.
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $path = $request->file('photo')->store('avatars', 'public');

        $user->forceFill(['avatar_path' => $path])->save();

        return back()->with('status', 'avatar-updated');
    }

    /**
     * Remove the signed-in user's profile picture.
     */
    public function deleteAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->forceFill(['avatar_path' => null])->save();

        return back()->with('status', 'avatar-removed');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
