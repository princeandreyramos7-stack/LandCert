# PowerShell Script to Refactor Index.jsx Files
# Run this from the project root directory

Write-Host "Starting component refactoring..." -ForegroundColor Green

# Step 1: Copy files to new locations
Write-Host "`nStep 1: Copying files to new locations..." -ForegroundColor Yellow

$fileMappings = @(
    @{Old="resources/js/Components/Admin/AuditLog/index.jsx"; New="resources/js/Components/Admin/AuditLogComponent.jsx"},
    @{Old="resources/js/Components/Admin/Dashboard/index.jsx"; New="resources/js/Components/Admin/AdminDashboard.jsx"},
    @{Old="resources/js/Components/Admin/Payments/index.jsx"; New="resources/js/Components/Admin/AdminPaymentList.jsx"},
    @{Old="resources/js/Components/Admin/Request/index.jsx"; New="resources/js/Components/Admin/AdminRequestList.jsx"},
    @{Old="resources/js/Components/Dashboard/index.jsx"; New="resources/js/Components/DashboardComponent.jsx"},
    @{Old="resources/js/Components/Receipt/index.jsx"; New="resources/js/Components/ReceiptList.jsx"},
    @{Old="resources/js/Components/Request_form/index.jsx"; New="resources/js/Components/RequestForm.jsx"},
    @{Old="resources/js/Pages/Request/index.jsx"; New="resources/js/Pages/RequestPage.jsx"}
)

foreach ($mapping in $fileMappings) {
    if (Test-Path $mapping.Old) {
        Copy-Item $mapping.Old $mapping.New -Force
        Write-Host "  ✓ Copied: $($mapping.Old) -> $($mapping.New)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ File not found: $($mapping.Old)" -ForegroundColor Red
    }
}

# Step 2: Update imports in files
Write-Host "`nStep 2: Updating imports..." -ForegroundColor Yellow

# Update Admin Dashboard