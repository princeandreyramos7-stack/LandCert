<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuditLogService;
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
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Redirect based on user type
        $user = $request->user();
        
        if ($user->user_type === 'super_admin') {
            return redirect()->intended(route('super-admin.dashboard', absolute: false));
        }
        
        if ($user->user_type === 'admin') {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Log the logout action before invalidating the session
        AuditLogService::logLogout();

        // Logout the user
        Auth::guard('web')->logout();

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
