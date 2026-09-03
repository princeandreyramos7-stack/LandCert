<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CertificateController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * Hands back a current CSRF token, and refreshes the XSRF-TOKEN cookie as a
 * side effect of responding.
 *
 * A long form can sit open past the point where its token is still good — the
 * session may have been regenerated or expired underneath it. Rather than
 * making the applicant hit Submit a second time, the client fetches this on a
 * 419 and retries once. Deliberately outside the auth group: a guest whose
 * session lapsed still needs a token to post the login form.
 */
Route::get('/csrf-token', fn () => response()->json(['token' => csrf_token()]))
    ->name('csrf-token');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [RequestController::class, 'dashboard'])->middleware(['auth', 'verified', 'prevent.back'])->name('dashboard');

/*
 | Every page that used to carry a role prefix and a record id, served from a
 | plain address instead. The id-bearing routes further down are the way in:
 | each records what is being opened and forwards here.
 |
 | Kept out of the role-prefixed groups on purpose — the URL is the same
 | whoever is signed in, and CleanPageController hands off to the controller
 | that already builds the page for that role.
 */
Route::middleware(['auth', 'prevent.back'])->group(function () {
    foreach (\App\Http\Controllers\CleanPageController::slugs() as $cleanSlug) {
        Route::get('/' . $cleanSlug, [\App\Http\Controllers\CleanPageController::class, 'show'])
            ->defaults('slug', $cleanSlug)
            ->name('page.' . $cleanSlug);
    }

    // The list and section screens. No id to remember — the slug names the
    // page and the signed-in role decides which controller builds it.
    foreach (\App\Http\Controllers\CleanPageController::sectionSlugs() as $sectionSlug) {
        Route::get('/' . $sectionSlug, [\App\Http\Controllers\CleanPageController::class, 'section'])
            ->defaults('slug', $sectionSlug)
            ->name('section.' . $sectionSlug);
    }
});

Route::middleware(['auth', 'throttle:60,1', 'prevent.back'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    // Profile picture — shared by applicant, admin and super-admin profile pages.
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar'])->name('profile.avatar.destroy');
    
    // Request routes
    Route::get('/request', [RequestController::class, 'index'])->name('request.index');
    Route::post('/request', [RequestController::class, 'store'])->middleware('throttle:10,1')->name('request.store');
    Route::get('/requests/{id}/edit', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'edit-application', $id)); })->name('requests.edit');
    Route::put('/requests/{id}', [RequestController::class, 'update'])->middleware('throttle:10,1')->name('requests.update');
    Route::get('/my-applications', [RequestController::class, 'myApplications'])->name('my-applications');
    Route::get('/my-applications/index', [RequestController::class, 'myApplications'])->name('my-applications.index');
    Route::get('/my-applications/{id}/print', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'print-form', $id)); })->name('my-applications.print');
    Route::get('/my-applications/{id}/order-of-payment', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'order-of-payment', $id)); })->name('my-applications.order-of-payment');
    Route::get('/my-applications/{id}/details', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'application-details', $id)); })->name('my-applications.show');
    Route::post('/my-applications/{id}/notarized-form', [\App\Http\Controllers\RequirementDocumentController::class, 'uploadNotarizedForm'])->name('my-applications.notarized-form');
    Route::post('/my-applications/{id}/requirement-upload', [\App\Http\Controllers\RequirementDocumentController::class, 'uploadApplicantRequirement'])->name('my-applications.requirement-upload');
    Route::get('/requests/{id}/authorization-letter', [RequestController::class, 'authorizationLetter'])->name('requests.authorization-letter');
    
    // Requirement document routes (for viewing/deleting only - upload is now in Step 4)
    Route::delete('/requirements/{id}', [\App\Http\Controllers\RequirementDocumentController::class, 'destroy'])->name('requirements.destroy');
    Route::get('/requirements/{id}/view', [\App\Http\Controllers\RequirementDocumentController::class, 'view'])->name('requirements.view');
    
    // Payment receipt upload routes
    Route::get('/receipt/upload/{requestId}', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'upload-receipt', $id)); })->name('receipt.upload.page');
    
    // Payment routes for applicants
    Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
    Route::get('/payments/{payment}/receipt', [PaymentController::class, 'viewReceipt'])->name('payments.receipt.view');

    // Certificate download/preview (applicant-facing, ownership checked in controller)
    Route::get('/certificate/{certificate}/download', [CertificateController::class, 'applicantDownload'])->name('certificate.download');
    Route::get('/certificate/{certificate}/preview', [CertificateController::class, 'applicantPreview'])->name('certificate.preview');
    
    // Applicant print routes (standalone pages without admin layout)
    Route::get('/my-applications/{id}/print-certificate', [RequestController::class, 'printCertificate'])->name('print-certificate');
    Route::get('/my-applications/{id}/print-clearance', [RequestController::class, 'printClearance'])->name('print-clearance');
});

// Super Admin routes (highest privilege)
Route::middleware(['auth', 'role:super_admin', 'prevent.back'])->prefix('super-admin')->name('super-admin.')->group(function () {
    Route::get('/dashboard', function () { return redirect('/dashboard-panel'); })->name('dashboard');
    Route::get('/requests', function () { return redirect('/applications'); })->name('requests');
    Route::get('/requests/{id}/review', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'review-application', $id)); })->name('requests.review');
    
    // NEW: Split Review Pages
    Route::get('/requests/{id}/view-application', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'view-application', $id)); })->name('requests.view-application');
    Route::get('/requests/{id}/document-verification', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'document-verification', $id)); })->name('requests.document-verification');
    
    Route::get('/requests/{id}/print', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'print-form', $id)); })->name('requests.print');
    Route::get('/requests/{id}/generate-certificate', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'generate-certificate', $id)); })->name('generate-certificate');
    Route::post('/requests/{id}/certificate-details', [AdminController::class, 'saveCertificateDetails'])->name('certificate-details');
    Route::post('/update-project-type/{id}', [AdminController::class, 'updateProjectType'])->name('update-project-type');
    Route::post('/requests/{id}/application-details', [AdminController::class, 'updateApplicationDetails'])->name('application-details');
    Route::post('/requests/{id}/release-to-applicant', [AdminController::class, 'releaseToApplicant'])->name('release-to-applicant');
    Route::get('/requests/{id}/generate-clearance', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'generate-clearance', $id)); })->name('generate-clearance');
    Route::get('/requests/{id}/generate-order-of-payment', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'order-of-payment', $id)); })->name('generate-order-of-payment');
    Route::get('/export/requests', [\App\Http\Controllers\SuperAdminController::class, 'exportRequests'])->name('export.requests');
    
    // Management
    Route::get('/users', function () { return redirect('/users'); })->name('users');
    Route::get('/users/create', function () {
        return Inertia::render('SuperAdmin/CreateUser');
    })->name('users.create');
    Route::get('/users/{userId}/edit', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'edit-user', $id)); })->name('users.edit');
    Route::get('/audit-logs', function () { return redirect('/audit-logs'); })->name('audit-logs');
    Route::get('/settings', [\App\Http\Controllers\SuperAdminController::class, 'settings'])->name('settings');
    
    // Super Admin specific actions
    Route::post('/approve-request/{reportId}', [\App\Http\Controllers\SuperAdminController::class, 'approveRequest'])->name('approve-request');
    Route::post('/reject-request/{reportId}', [\App\Http\Controllers\SuperAdminController::class, 'rejectRequest'])->name('reject-request');
    Route::post('/requests/{requestId}/review-and-decide', [\App\Http\Controllers\SuperAdminController::class, 'reviewAndDecide'])->name('review-and-decide');
    Route::post('/create-admin', [\App\Http\Controllers\SuperAdminController::class, 'createAdmin'])->name('create-admin');
    Route::put('/users/{userId}', [\App\Http\Controllers\SuperAdminController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{userId}', [\App\Http\Controllers\SuperAdminController::class, 'deleteUser'])->name('users.delete');
    
    // Requirement verification toggle
    Route::post('/save-requirement-verification', [\App\Http\Controllers\SuperAdminController::class, 'saveRequirementVerification'])->name('save-requirement-verification');

    // Streamlined review workflow (same handler as the admin side; the Super Admin
    // Document Verification page marks an application reviewed here).
    Route::post('/review-application', [AdminController::class, 'reviewApplication'])->name('review-application');

    // Upload requirement document by super admin
    Route::post('/upload-requirement-document', [\App\Http\Controllers\SuperAdminController::class, 'uploadRequirementDocument'])->name('upload-requirement-document');
    
    // Certificate Management Routes (NEW: Using CertificateController with PDF generation)
    Route::prefix('certificates')->name('certificates.')->group(function () {
        Route::get('/', function () { return redirect('/certificates'); })->name('index');
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
    Route::get('/sms', function () { return redirect('/sms-broadcast'); })->name('sms.index');
    Route::post('/sms/send', [\App\Http\Controllers\SmsController::class, 'send'])->name('sms.send');
    Route::put('/sms/templates/{id}', [\App\Http\Controllers\SmsController::class, 'updateTemplate'])->name('sms.templates.update');
    Route::post('/sms/templates/{id}/reset', [\App\Http\Controllers\SmsController::class, 'resetTemplate'])->name('sms.templates.reset');

    // Print form
    Route::get('/requests/{id}/print', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'print-form', $id)); })->name('requests.print');
    Route::get('/export/requests', [\App\Http\Controllers\AdminController::class, 'exportRequests'])->name('export.requests');
    Route::get('/export/users', [\App\Http\Controllers\AdminController::class, 'exportUsers'])->name('export.users');
    Route::get('/export/payments', [\App\Http\Controllers\AdminController::class, 'exportPayments'])->name('export.payments');
    
    // Audit log export
    Route::get('/audit-logs/export', [\App\Http\Controllers\AdminController::class, 'exportAuditLogs'])->name('audit-logs.export');

    // Payment Management Routes - Unified Page
    Route::get('/payments', function () { return redirect('/payments'); })->name('payments');
    Route::post('/payments/record', [PaymentController::class, 'recordPayment'])->name('payments.record');
    Route::post('/payments/check-duplicate', [PaymentController::class, 'checkDuplicate'])->name('payments.check-duplicate');
    Route::post('/payments/upload-receipt', [\App\Http\Controllers\SuperAdminController::class, 'uploadReceipt'])->name('payments.upload-receipt');
    Route::get('/payments/{id}/show', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'payment-details', $id)); })->name('payments.show');
    Route::put('/payments/{payment}', [\App\Http\Controllers\SuperAdminController::class, 'updatePayment'])->name('payments.update');
    Route::post('/payments/{payment}/verify', [\App\Http\Controllers\SuperAdminController::class, 'verifyPayment'])->name('payments.verify');
    Route::post('/payments/{payment}/reject', [\App\Http\Controllers\SuperAdminController::class, 'rejectPayment'])->name('payments.reject');
    
    // Profile routes
    Route::get('/profile', [\App\Http\Controllers\SuperAdminController::class, 'profile'])->name('profile');
    Route::patch('/profile', [\App\Http\Controllers\SuperAdminController::class, 'updateProfile'])->name('profile.update');
    Route::put('/password', [\App\Http\Controllers\SuperAdminController::class, 'updatePassword'])->name('password.update');
});

// Admin routes
Route::middleware(['auth', 'role:admin', 'prevent.back'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () { return redirect('/dashboard-panel'); })->name('dashboard');
    Route::get('/search', [AdminController::class, 'search'])->name('search');
    Route::get('/requests', function () { return redirect('/applications'); })->name('requests');
    Route::get('/requests/{id}', [AdminController::class, 'viewRequest'])->name('requests.view');
    Route::get('/requests/{id}/review', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'review-application', $id)); })->name('requests.review');
    
    // NEW: Split Review Pages
    Route::get('/requests/{id}/view-application', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'view-application', $id)); })->name('requests.view-application');
    Route::get('/requests/{id}/document-verification', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'document-verification', $id)); })->name('requests.document-verification');
    
    Route::get('/reports', function () {
        return Inertia::render('Admin/Reports');
    })->name('reports');
    Route::get('/users', function () { return redirect('/users'); })->name('users');
    Route::put('/users/{userId}', [AdminController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{userId}', [AdminController::class, 'deleteUser'])->name('users.delete');
    Route::post('/update-evaluation/{reportId}', [AdminController::class, 'updateEvaluation'])->name('update-evaluation');
    Route::delete('/delete-request/{requestId}', [AdminController::class, 'deleteRequest'])->name('delete-request');
    
    // NEW: Streamlined Review Workflow
    Route::post('/review-application', [AdminController::class, 'reviewApplication'])->name('review-application');
    Route::get('/get-requirements', [AdminController::class, 'getRequirements'])->name('get-requirements');
    Route::post('/update-project-type/{id}', [AdminController::class, 'updateProjectType'])->name('update-project-type');
    Route::post('/requests/{id}/application-details', [AdminController::class, 'updateApplicationDetails'])->name('application-details');
    Route::post('/requests/{id}/release-to-applicant', [AdminController::class, 'releaseToApplicant'])->name('release-to-applicant');
    
    // Requirement verification toggle
    Route::post('/save-requirement-verification', [AdminController::class, 'saveRequirementVerification'])->name('save-requirement-verification');
    
    // Upload requirement document by admin
    Route::post('/upload-requirement-document', [AdminController::class, 'uploadRequirementDocument'])->name('upload-requirement-document');
    
    // Payment Management Routes - Unified Page
    Route::get('/payments', function () { return redirect('/payments'); })->name('payments');
    Route::post('/payments/record', [PaymentController::class, 'recordPayment'])->name('payments.record');
    Route::post('/payments/check-duplicate', [PaymentController::class, 'checkDuplicate'])->name('payments.check-duplicate');
    Route::post('/payments/upload-receipt', [AdminController::class, 'uploadReceipt'])->name('payments.upload-receipt');
    Route::get('/payments/{id}/show', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'payment-details', $id)); })->name('payments.show');
    Route::post('/payments/{payment}/verify', [AdminController::class, 'verifyPayment'])->name('payments.verify');
    Route::post('/payments/{payment}/reject', [AdminController::class, 'rejectPayment'])->name('payments.reject');
    
    // Certificate Management Routes (NEW: Using CertificateController with PDF generation)
    Route::prefix('certificates')->name('certificates.')->group(function () {
        Route::get('/', function () { return redirect('/certificates'); })->name('index');
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
    Route::get('/sms', function () { return redirect('/sms-broadcast'); })->name('sms.index');
    Route::post('/sms/send', [\App\Http\Controllers\SmsController::class, 'send'])->name('sms.send');

    // Print form
    Route::get('/requests/{id}/print', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'print-form', $id)); })->name('requests.print');
    
    // Generate documents routes
    Route::get('/requests/{id}/generate-certificate', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'generate-certificate', $id)); })->name('generate-certificate');
    Route::post('/requests/{id}/certificate-details', [AdminController::class, 'saveCertificateDetails'])->name('certificate-details');
    Route::get('/requests/{id}/generate-clearance', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'generate-clearance', $id)); })->name('generate-clearance');
    Route::get('/requests/{id}/generate-order-of-payment', function (\Illuminate\Http\Request $request, $id) { return redirect(\App\Http\Controllers\CleanPageController::remember($request, 'order-of-payment', $id)); })->name('generate-order-of-payment');
    
    // Bulk action routes
    Route::post('/bulk/approve', [AdminController::class, 'bulkApprove'])->name('bulk.approve');
    Route::post('/bulk/reject', [AdminController::class, 'bulkReject'])->name('bulk.reject');
    Route::delete('/bulk/delete', [AdminController::class, 'bulkDelete'])->name('bulk.delete');
    
    // Audit log routes
    Route::get('/audit-logs', function () { return redirect('/audit-logs'); })->name('audit-logs');
    Route::get('/audit-logs/export', [AdminController::class, 'exportAuditLogs'])->name('audit-logs.export');
    Route::get('/audit-logs/{id}', [AdminController::class, 'viewAuditLog'])->name('audit-logs.view');
    
    // Profile routes
    Route::get('/profile', [AdminController::class, 'profile'])->name('profile');
    Route::patch('/profile', [AdminController::class, 'updateProfile'])->name('profile.update');
    Route::put('/password', [AdminController::class, 'updatePassword'])->name('password.update');
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
