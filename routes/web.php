<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\AdminController;
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
    
    // Payment routes
    Route::get('/receipt', [\App\Http\Controllers\PaymentController::class, 'index'])->name('receipt.index');
    Route::post('/receipt', [\App\Http\Controllers\PaymentController::class, 'store'])->name('receipt.store');
    
    // Certificate download
    Route::get('/certificate/{certificateId}/download', [\App\Http\Controllers\PaymentController::class, 'downloadCertificate'])->name('certificate.download');
    
    // Certificate preview routes (for design testing)
    Route::get('/certificate/preview', function() {
        $data = [
            'certificateNumber' => 'CERT-2024-00001',
            'applicantName' => 'Juan Dela Cruz',
            'projectLocation' => 'Barangay Alibagu, Ilagan City, Isabela',
            'projectType' => 'Residential Building',
            'projectNature' => 'Single Family Dwelling',
            'lotArea' => '500.00',
            'projectCost' => 2500000,
            'issuedDate' => now()->format('F d, Y'),
            'validUntil' => now()->addYears(5)->format('F d, Y'),
            'issuedBy' => 'Admin User',
        ];
        return view('certificates.professional-template', $data);
    })->name('certificate.preview');
    
    Route::get('/certificate/preview/professional', function() {
        $data = [
            'certificateNumber' => 'CERT-2024-00001',
            'applicantName' => 'Juan Dela Cruz',
            'projectLocation' => 'Barangay Alibagu, Ilagan City, Isabela',
            'projectType' => 'Residential Building',
            'projectNature' => 'Single Family Dwelling',
            'lotArea' => '500.00',
            'projectCost' => 2500000,
            'issuedDate' => now()->format('F d, Y'),
            'validUntil' => now()->addYears(5)->format('F d, Y'),
            'issuedBy' => 'Admin User',
        ];
        return view('certificates.professional-template', $data);
    })->name('certificate.preview.professional');
    
    Route::get('/certificate/preview/simple', function() {
        $data = [
            'certificateNumber' => 'CERT-2024-00002',
            'applicantName' => 'Maria Santos',
            'projectLocation' => 'Barangay San Juan, Ilagan City, Isabela',
            'projectType' => 'Commercial Building',
            'projectNature' => 'Office Building',
            'lotArea' => '750.00',
            'projectCost' => 5000000,
            'issuedDate' => now()->format('F d, Y'),
            'validUntil' => now()->addYears(5)->format('F d, Y'),
            'issuedBy' => 'Admin User',
        ];
        return view('certificates.simple-template', $data);
    })->name('certificate.preview.simple');
    
    Route::get('/certificate/preview/basic', function() {
        $data = [
            'certificateNumber' => 'CERT-2024-00003',
            'applicantName' => 'Pedro Reyes',
            'projectLocation' => 'Barangay Centro, Ilagan City, Isabela',
            'projectType' => 'Industrial Building',
            'projectNature' => 'Warehouse',
            'lotArea' => '1200.00',
            'projectCost' => 8000000,
            'issuedDate' => now()->format('F d, Y'),
            'validUntil' => now()->addYears(5)->format('F d, Y'),
            'issuedBy' => 'Admin User',
        ];
        return view('certificates.template', $data);
    })->name('certificate.preview.basic');
    
    Route::get('/certificate/preview/text-logo', function() {
        $data = [
            'certificateNumber' => 'CERT-2024-00004',
            'applicantName' => 'Ana Garcia',
            'projectLocation' => 'Barangay Maligaya, Ilagan City, Isabela',
            'projectType' => 'Mixed-Use Building',
            'projectNature' => 'Residential-Commercial',
            'lotArea' => '600.00',
            'projectCost' => 3500000,
            'issuedDate' => now()->format('F d, Y'),
            'validUntil' => now()->addYears(5)->format('F d, Y'),
            'issuedBy' => 'Admin User',
        ];
        return view('certificates.text-logo-template', $data);
    })->name('certificate.preview.text-logo');
});

// Admin routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/search', [AdminController::class, 'search'])->name('search');
    Route::get('/requests', [AdminController::class, 'requests'])->name('requests');
    Route::get('/applications', [AdminController::class, 'applications'])->name('applications');
    Route::get('/reports', function () {
        return Inertia::render('Admin/Reports');
    })->name('reports');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::put('/users/{userId}', [AdminController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{userId}', [AdminController::class, 'deleteUser'])->name('users.delete');
    Route::post('/update-evaluation/{reportId}', [AdminController::class, 'updateEvaluation'])->name('update-evaluation');
    Route::delete('/delete-request/{requestId}', [AdminController::class, 'deleteRequest'])->name('delete-request');
    
    // Payment verification routes
    Route::get('/payments', [AdminController::class, 'payments'])->name('payments');
    Route::post('/payments/{paymentId}/verify', [AdminController::class, 'verifyPayment'])->name('payments.verify');
    Route::post('/payments/{paymentId}/reject', [AdminController::class, 'rejectPayment'])->name('payments.reject');
    
    // Export routes
    Route::get('/export/payments', [AdminController::class, 'exportPayments'])->name('export.payments');
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
    
    // DSS and GIS routes
    Route::get('/zoning-map', [\App\Http\Controllers\DssController::class, 'zoningMap'])->name('zoning-map');
    Route::post('/requests/{request}/evaluate', [\App\Http\Controllers\DssController::class, 'evaluate'])->name('requests.evaluate');
    Route::get('/dss-evaluation/{evaluation}', [\App\Http\Controllers\DssController::class, 'show'])->name('dss-evaluation.show');
    
    // Property management routes
    Route::get('/properties/add', [\App\Http\Controllers\DssController::class, 'addProperty'])->name('properties.add');
    Route::post('/properties', [\App\Http\Controllers\DssController::class, 'storeProperty'])->name('properties.store');
});

// Notification routes
Route::middleware('auth')->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [\App\Http\Controllers\NotificationController::class, 'index'])->name('index');
    Route::get('/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('unread-count');
    Route::post('/mark-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('mark-read');
    Route::post('/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
    Route::delete('/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('destroy');
    Route::delete('/', [\App\Http\Controllers\NotificationController::class, 'clearAll'])->name('clear-all');
});

require __DIR__.'/auth.php';
