<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuditLogService;
use App\Services\TwoFactorAuthService;
use App\Support\PostLoginRedirect;
use App\Support\SingleSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     *
     * The texted one-time code lives at registration only (see
     * RegisteredUserController::store) - a sign-in with the right password
     * finishes here directly. Session regeneration matters more than usual
     * for exactly that reason: this is now the one place a plain password
     * alone hands out a trusted session, so a fixation attack has only this
     * one path to close.
     *
     * A password match alone is not enough for an applicant account that
     * never finished that code: Auth::attempt() has already signed them in
     * by the time this runs, so that has to be undone, not just refused,
     * before sending them back into the same challenge a fresh registration
     * gets. Staff accounts are exempt - they are provisioned directly by an
     * administrator (AdminUserSeeder, SuperAdminController::createAdmin),
     * never through self-registration, so there was never a code for them
     * to have completed in the first place.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = $request->user();

        if ($user->user_type === 'applicant' && !$user->phone_verified_at) {
            $remember = $request->boolean('remember');
            Auth::guard('web')->logout();

            return app(TwoFactorAuthService::class)->beginChallenge($request, $user, $remember);
        }

        $request->session()->regenerate();

        // At most one signed-in session for this account from here on - see
        // App\Support\SingleSession and its middleware counterpart.
        SingleSession::claim($user, $request);

        // A fresh session gets a fresh history key: the pages the browser
        // remembers from before this sign-in cannot be brought back with
        // the Back button.
        Inertia::clearHistory();

        return PostLoginRedirect::for($user, $request);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Log the logout action before invalidating the session
        AuditLogService::logLogout();

        // Captured before logout drops it: nothing else may claim to be
        // this account's active session once it has signed itself out.
        $user = $request->user();

        // Logout the user
        Auth::guard('web')->logout();

        if ($user) {
            SingleSession::release($user);
        }

        // Invalidate the session
        $request->session()->invalidate();

        // Regenerate CSRF token
        $request->session()->regenerateToken();

        // Flush all session data
        $request->session()->flush();

        // Clear authentication cookies
        cookie()->queue(cookie()->forget('laravel_session'));
        cookie()->queue(cookie()->forget('XSRF-TOKEN'));

        // Create response with no-cache headers and Inertia location header
        $response = redirect('/');
        
        // Add headers to prevent caching
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
        
        // For Inertia, add X-Inertia-Location header to force full page reload
        if ($request->inertia()) {
            $response->headers->set('X-Inertia-Location', '/');
        }

        return $response;
    }
}
