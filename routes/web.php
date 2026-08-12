<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CertificateController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [RequestController::class, 'dashboard'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'throttle:60,1'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Request routes
    Route::get('/request', [RequestController::class, 'index'])->name('request.index');
    Route::post('/request', [RequestController::class, 'store'])->middleware('throttle:10,1')->name('request.store');
    Route::get('/my-applications', [RequestController::class, 'myApplications'])->name('my-applications');
    
    // Payment routes for applicants
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
});

// Super Admin routes (highest privilege)
Route::middleware(['auth', 'role:super_admin'])->prefix('super-admin')->name('super-admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\SuperAdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/requests', [\App\Http\Controllers\SuperAdminController::class, 'requests'])->name('requests');
    
    // Management
    Route::get('/users', [\App\Http\Controllers\SuperAdminController::class, 'users'])->name('users');
    Route::get('/users/create', function () {
        return Inertia::render('SuperAdmin/CreateUser');
    })->name('users.create');
    Route::get('/users/{userId}/edit', [\App\Http\Controllers\SuperAdminController::class, 'editUser'])->name('users.edit');
    Route::get('/audit-logs', [\App\Http\Controllers\SuperAdminController::class, 'auditLogs'])->name('audit-logs');
    Route::get('/settings', [\App\Http\Controllers\SuperAdminController::class, 'settings'])->name('settings');
    
    // Super Admin specific actions
    Route::post('/approve-request/{reportId}', [\App\Http\Controllers\SuperAdminController::class, 'approveRequest'])->name('approve-request');
    Route::post('/reject-request/{reportId}', [\App\Http\Controllers\SuperAdminController::class, 'rejectRequest'])->name('reject-request');
    Route::post('/create-admin', [\App\Http\Controllers\SuperAdminController::class, 'createAdmin'])->name('create-admin');
    Route::put('/users/{userId}', [\App\Http\Controllers\SuperAdminController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{userId}', [\App\Http\Controllers\SuperAdminController::class, 'deleteUser'])->name('users.delete');
    
    // Certificate Management Routes (Physical Certificates)
    Route::get('/certificates', [\App\Http\Controllers\SuperAdminController::class, 'certificates'])->name('certificates');
    Route::put('/certificates/{certificate}', [\App\Http\Controllers\SuperAdminController::class, 'updateCertificate'])->name('certificates.update');
    Route::post('/certificates/{certificate}/mark-ready', [\App\Http\Controllers\SuperAdminController::class, 'markCertificateReady'])->name('certificates.mark-ready');
    Route::post('/certificates/{certificate}/release', [\App\Http\Controllers\SuperAdminController::class, 'releaseCertificate'])->name('certificates.release');
    
    // Payment Management Routes (Physical Payments)
    Route::get('/payments', [\App\Http\Controllers\SuperAdminController::class, 'payments'])->name('payments');
    Route::put('/payments/{payment}', [\App\Http\Controllers\SuperAdminController::class, 'updatePayment'])->name('payments.update');
    Route::post('/payments/{payment}/verify', [\App\Http\Controllers\SuperAdminController::class, 'verifyPayment'])->name('payments.verify');
    Route::post('/payments/{payment}/reject', [\App\Http\Controllers\SuperAdminController::class, 'rejectPayment'])->name('payments.reject');
});

// Admin routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/search', [AdminController::class, 'search'])->name('search');
    Route::get('/requests', [AdminController::class, 'requests'])->name('requests');
    Route::get('/requests/{id}', [AdminController::class, 'viewRequest'])->name('requests.view');
    Route::get('/applications', [AdminController::class, 'applications'])->name('applications');
    Route::get('/reports', function () {
        return Inertia::render('Admin/Reports');
    })->name('reports');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::put('/users/{userId}', [AdminController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{userId}', [AdminController::class, 'deleteUser'])->name('users.delete');
    Route::post('/update-evaluation/{reportId}', [AdminController::class, 'updateEvaluation'])->name('update-evaluation');
    Route::delete('/delete-request/{requestId}', [AdminController::class, 'deleteRequest'])->name('delete-request');
    
    // NEW: Streamlined Review Workflow
    Route::post('/review-application', [AdminController::class, 'reviewApplication'])->name('review-application');
    Route::get('/get-requirements', [AdminController::class, 'getRequirements'])->name('get-requirements');
    
    // Payment Management Routes (Admin can verify/reject)
    Route::get('/payments', [AdminController::class, 'payments'])->name('payments');
    Route::post('/payments/{payment}/verify', [AdminController::class, 'verifyPayment'])->name('payments.verify');
    Route::post('/payments/{payment}/reject', [AdminController::class, 'rejectPayment'])->name('payments.reject');
    
    // Certificate Management Routes (Admin can mark ready and record collection)
    Route::get('/certificates', [AdminController::class, 'certificates'])->name('certificates');
    Route::post('/certificates/{certificate}/mark-ready', [AdminController::class, 'markCertificateReady'])->name('certificates.mark-ready');
    Route::post('/certificates/{certificate}/release', [AdminController::class, 'releaseCertificate'])->name('certificates.release');
    
    // Export routes
    Route::get('/export/applications', [AdminController::class, 'exportApplications'])->name('export.applications');
    Route::get('/export/requests', [AdminController::class, 'exportRequests'])->name('export.requests');
    Route::get('/export/users', [AdminController::class, 'exportUsers'])->name('export.users');
    
    // Bulk action routes
    Route::post('/bulk/approve', [AdminController::class, 'bulkApprove'])->name('bulk.approve');
    Route::post('/bulk/reject', [AdminController::class, 'bulkReject'])->name('bulk.reject');
    Route::delete('/bulk/delete', [AdminController::class, 'bulkDelete'])->name('bulk.delete');
    
    // Audit log routes
    Route::get('/audit-logs', [AdminController::class, 'auditLogs'])->name('audit-logs');
    Route::get('/audit-logs/export', [AdminController::class, 'exportAuditLogs'])->name('audit-logs.export');
    Route::get('/audit-logs/{id}', [AdminController::class, 'viewAuditLog'])->name('audit-logs.view');
});

// Notification routes
Route::middleware('auth')->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [\App\Http\Controllers\NotificationController::class, 'page'])->name('page');
    Route::get('/list', [\App\Http\Controllers\NotificationController::class, 'index'])->name('index');
    Route::get('/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('unread-count');
    Route::post('/mark-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('mark-read');
    Route::post('/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
    Route::delete('/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('destroy');
    Route::delete('/', [\App\Http\Controllers\NotificationController::class, 'clearAll'])->name('clear-all');
});

require __DIR__.'/auth.php';
