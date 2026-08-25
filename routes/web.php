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

Route::get('/dashboard', [RequestController::class, 'dashboard'])->middleware(['auth', 'verified', 'prevent.back'])->name('dashboard');

Route::middleware(['auth', 'throttle:60,1', 'prevent.back'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Request routes
    Route::get('/request', [RequestController::class, 'index'])->name('request.index');
    Route::post('/request', [RequestController::class, 'store'])->middleware('throttle:10,1')->name('request.store');
    Route::get('/my-applications', [RequestController::class, 'myApplications'])->name('my-applications');
    Route::get('/my-applications/{id}/print', [\App\Http\Controllers\AdminController::class, 'printForm'])->name('my-applications.print');
    Route::get('/requests/{id}/authorization-letter', [RequestController::class, 'authorizationLetter'])->name('requests.authorization-letter');
    
    // Requirement document routes
    Route::get('/requirements/upload/{requestId}', [\App\Http\Controllers\RequirementDocumentController::class, 'index'])->name('requirements.upload.page');
    Route::post('/requirements/upload', [\App\Http\Controllers\RequirementDocumentController::class, 'upload'])->name('requirements.upload');
    Route::delete('/requirements/{id}', [\App\Http\Controllers\RequirementDocumentController::class, 'destroy'])->name('requirements.destroy');
    Route::get('/requirements/{id}/view', [\App\Http\Controllers\RequirementDocumentController::class, 'view'])->name('requirements.view');
    
    // Payment receipt upload routes
    Route::get('/receipt/upload/{requestId}', [PaymentController::class, 'uploadReceiptPage'])->name('receipt.upload.page');
    
    // Payment routes for applicants
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
    Route::get('/payments/{payment}/receipt', [PaymentController::class, 'viewReceipt'])->name('payments.receipt.view');

    // Certificate download/preview (applicant-facing, ownership checked in controller)
    Route::get('/certificate/{certificate}/download', [CertificateController::class, 'applicantDownload'])->name('certificate.download');
    Route::get('/certificate/{certificate}/preview', [CertificateController::class, 'applicantPreview'])->name('certificate.preview');
});

// Super Admin routes (highest privilege)
Route::middleware(['auth', 'role:super_admin', 'prevent.back'])->prefix('super-admin')->name('super-admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\SuperAdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/requests', [\App\Http\Controllers\SuperAdminController::class, 'requests'])->name('requests');
    Route::get('/requests/{id}/review', [\App\Http\Controllers\SuperAdminController::class, 'reviewRequest'])->name('requests.review');
    Route::get('/requests/{id}/print', [\App\Http\Controllers\AdminController::class, 'printForm'])->name('requests.print');
    Route::get('/export/requests', [\App\Http\Controllers\SuperAdminController::class, 'exportRequests'])->name('export.requests');
    
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
    
    // Certificate Management Routes (NEW: Using CertificateController with PDF generation)
    Route::prefix('certificates')->name('certificates.')->group(function () {
        Route::get('/', [CertificateController::class, 'index'])->name('index');
        Route::get('/{certificate}', [CertificateController::class, 'show'])->name('show');
        Route::get('/{certificate}/download', [CertificateController::class, 'download'])->name('download');
        Route::get('/{certificate}/preview', [CertificateController::class, 'preview'])->name('preview');
        Route::post('/{certificate}/mark-ready', [CertificateController::class, 'markReady'])->name('mark-ready');
        Route::post('/{certificate}/record-release', [CertificateController::class, 'recordRelease'])->name('record-release');
        Route::post('/upload-softcopy', [CertificateController::class, 'uploadSoftcopy'])->name('upload-softcopy');
        Route::post('/', [CertificateController::class, 'store'])->name('store');
        Route::put('/{certificate}', [CertificateController::class, 'update'])->name('update');
        Route::delete('/{certificate}', [CertificateController::class, 'destroy'])->name('destroy');
    });
    
    // Legacy certificate routes (keep for backward compatibility)
    Route::get('/certificates-old', [\App\Http\Controllers\SuperAdminController::class, 'certificates'])->name('certificates-old');
    Route::put('/certificates-old/{certificate}', [\App\Http\Controllers\SuperAdminController::class, 'updateCertificate'])->name('certificates-old.update');
    Route::post('/certificates-old/{certificate}/mark-ready', [\App\Http\Controllers\SuperAdminController::class, 'markCertificateReady'])->name('certificates-old.mark-ready');
    Route::post('/certificates-old/{certificate}/release', [\App\Http\Controllers\SuperAdminController::class, 'releaseCertificate'])->name('certificates-old.release');
    
    // SMS Broadcast + Auto-Templates
    Route::get('/sms', [\App\Http\Controllers\SmsController::class, 'index'])->name('sms.index');
    Route::post('/sms/send', [\App\Http\Controllers\SmsController::class, 'send'])->name('sms.send');
    Route::put('/sms/templates/{id}', [\App\Http\Controllers\SmsController::class, 'updateTemplate'])->name('sms.templates.update');
    Route::post('/sms/templates/{id}/reset', [\App\Http\Controllers\SmsController::class, 'resetTemplate'])->name('sms.templates.reset');

    // Print form
    Route::get('/requests/{id}/print', [\App\Http\Controllers\AdminController::class, 'printForm'])->name('requests.print');
    Route::get('/export/requests', [\App\Http\Controllers\AdminController::class, 'exportRequests'])->name('export.requests');
    Route::get('/export/users', [\App\Http\Controllers\AdminController::class, 'exportUsers'])->name('export.users');
    Route::get('/export/payments', [\App\Http\Controllers\AdminController::class, 'exportPayments'])->name('export.payments');
    
    // Audit log export
    Route::get('/audit-logs/export', [\App\Http\Controllers\AdminController::class, 'exportAuditLogs'])->name('audit-logs.export');

    // Payment Management Routes - Unified Page
    Route::get('/payments', [\App\Http\Controllers\SuperAdminController::class, 'payments'])->name('payments');
    Route::post('/payments/record', [PaymentController::class, 'recordPayment'])->name('payments.record');
    Route::post('/payments/check-duplicate', [PaymentController::class, 'checkDuplicate'])->name('payments.check-duplicate');
    Route::post('/payments/upload-receipt', [\App\Http\Controllers\SuperAdminController::class, 'uploadReceipt'])->name('payments.upload-receipt');
    Route::get('/payments/{id}/show', [PaymentController::class, 'show'])->name('payments.show');
    Route::put('/payments/{payment}', [\App\Http\Controllers\SuperAdminController::class, 'updatePayment'])->name('payments.update');
    Route::post('/payments/{payment}/verify', [\App\Http\Controllers\SuperAdminController::class, 'verifyPayment'])->name('payments.verify');
    Route::post('/payments/{payment}/reject', [\App\Http\Controllers\SuperAdminController::class, 'rejectPayment'])->name('payments.reject');
});

// Admin routes
Route::middleware(['auth', 'role:admin', 'prevent.back'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/search', [AdminController::class, 'search'])->name('search');
    Route::get('/requests', [AdminController::class, 'requests'])->name('requests');
    Route::get('/requests/{id}', [AdminController::class, 'viewRequest'])->name('requests.view');
    Route::get('/requests/{id}/review', [AdminController::class, 'reviewRequest'])->name('requests.review');
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
    Route::post('/update-project-type/{id}', [AdminController::class, 'updateProjectType'])->name('update-project-type');
    
    // Payment Management Routes - Unified Page
    Route::get('/payments', [AdminController::class, 'payments'])->name('payments');
    Route::post('/payments/record', [PaymentController::class, 'recordPayment'])->name('payments.record');
    Route::post('/payments/check-duplicate', [PaymentController::class, 'checkDuplicate'])->name('payments.check-duplicate');
    Route::post('/payments/upload-receipt', [AdminController::class, 'uploadReceipt'])->name('payments.upload-receipt');
    Route::get('/payments/{id}/show', [PaymentController::class, 'show'])->name('payments.show');
    Route::post('/payments/{payment}/verify', [AdminController::class, 'verifyPayment'])->name('payments.verify');
    Route::post('/payments/{payment}/reject', [AdminController::class, 'rejectPayment'])->name('payments.reject');
    
    // Certificate Management Routes (NEW: Using CertificateController with PDF generation)
    Route::prefix('certificates')->name('certificates.')->group(function () {
        Route::get('/', [CertificateController::class, 'index'])->name('index');
        Route::get('/{certificate}', [CertificateController::class, 'show'])->name('show');
        Route::get('/{certificate}/download', [CertificateController::class, 'download'])->name('download');
        Route::get('/{certificate}/preview', [CertificateController::class, 'preview'])->name('preview');
        Route::post('/{certificate}/mark-ready', [CertificateController::class, 'markReady'])->name('mark-ready');
        Route::post('/{certificate}/record-release', [CertificateController::class, 'recordRelease'])->name('record-release');
        Route::post('/upload-softcopy', [CertificateController::class, 'uploadSoftcopy'])->name('upload-softcopy');
        Route::post('/', [CertificateController::class, 'store'])->name('store');
        Route::put('/{certificate}', [CertificateController::class, 'update'])->name('update');
        Route::delete('/{certificate}', [CertificateController::class, 'destroy'])->name('destroy');
    });
    
    // Legacy certificate routes (keep for backward compatibility)
    Route::get('/certificates-old', [AdminController::class, 'certificates'])->name('certificates-old');
    Route::post('/certificates-old/{certificate}/mark-ready', [AdminController::class, 'markCertificateReady'])->name('certificates-old.mark-ready');
    Route::post('/certificates-old/{certificate}/release', [AdminController::class, 'releaseCertificate'])->name('certificates-old.release');
    
    // Export routes
    Route::get('/export/requests', [AdminController::class, 'exportRequests'])->name('export.requests');
    Route::get('/export/users', [AdminController::class, 'exportUsers'])->name('export.users');
    Route::get('/export/payments', [AdminController::class, 'exportPayments'])->name('export.payments');

    // SMS Broadcast only (admins can broadcast but NOT edit templates)
    Route::get('/sms', [\App\Http\Controllers\SmsController::class, 'index'])->name('sms.index');
    Route::post('/sms/send', [\App\Http\Controllers\SmsController::class, 'send'])->name('sms.send');

    // Print form
    Route::get('/requests/{id}/print', [AdminController::class, 'printForm'])->name('requests.print');
    
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
Route::middleware(['auth', 'prevent.back'])->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [\App\Http\Controllers\NotificationController::class, 'page'])->name('page');
    Route::get('/list', [\App\Http\Controllers\NotificationController::class, 'index'])->name('index');
    Route::get('/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('unread-count');
    Route::post('/mark-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('mark-read');
    Route::post('/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
    Route::delete('/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('destroy');
    Route::delete('/', [\App\Http\Controllers\NotificationController::class, 'clearAll'])->name('clear-all');
});

require __DIR__.'/auth.php';
