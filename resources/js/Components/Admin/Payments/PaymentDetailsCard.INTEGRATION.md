# PaymentDetailsCard Integration Guide

## Quick Start: Replacing the Details Modal in Payments.jsx

The `PaymentDetailsCard` component can replace the simple details modal in the existing `Payments.jsx` page for a richer, more comprehensive payment details view.

### Before (Current Implementation)
The current implementation shows basic payment details in a simple dialog:

```jsx
<Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
    <DialogContent className="max-w-2xl">
        <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        {selectedPayment && (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Basic fields */}
                </div>
            </div>
        )}
    </DialogContent>
</Dialog>
```

### After (Enhanced Implementation)
Replace with the PaymentDetailsCard for a comprehensive view:

```jsx
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";

<Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle>Payment Details #{selectedPayment?.id}</DialogTitle>
        </DialogHeader>
        {selectedPayment && (
            <PaymentDetailsCard payment={selectedPayment} />
        )}
    </DialogContent>
</Dialog>
```

## Step-by-Step Integration

### Step 1: Import the Component
At the top of `Payments.jsx`, add the import:

```jsx
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";
```

### Step 2: Update the Dialog Content
Replace the entire details modal section (around line 300-360) with:

```jsx
{/* Details Modal - Enhanced */}
<Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle className="text-2xl">
                Payment Details #{selectedPayment?.id}
            </DialogTitle>
        </DialogHeader>
        {selectedPayment && (
            <PaymentDetailsCard payment={selectedPayment} />
        )}
    </DialogContent>
</Dialog>
```

### Step 3: Verify Data Structure
Ensure the payment data includes all necessary relations. Update your controller query:

```php
// In PaymentController.php
public function index()
{
    $payments = Payment::with([
        'request.applicant',
        'verifiedByUser' // Add this relation
    ])
    // ... rest of your query
    ->paginate(25);
    
    return Inertia::render('Admin/Payments', [
        'payments' => $payments,
        // ...
    ]);
}
```

### Step 4: Add verifiedByUser Relationship to Payment Model
If not already present, add to `app/Models/Payment.php`:

```php
public function verifiedByUser()
{
    return $this->belongsTo(User::class, 'verified_by');
}
```

## Alternative: Create a Dedicated Payment Details Page

For a better user experience, create a separate page for payment details:

### 1. Create the Page Component
Create `resources/js/Pages/Admin/PaymentDetails.jsx`:

```jsx
import { Head } from "@inertiajs/react";
import { AdminSidebar } from "@/Components/admin-sidebar";
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/sidebar";
import { Button } from "@/Components/ui/button";
import { ArrowLeft } from "lucide-react";
import { router } from "@inertiajs/react";

export default function PaymentDetails({ auth, payment }) {
    return (
        <SidebarProvider>
            <Head title={`Payment #${payment.id} - Admin`} />
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4 w-full">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={route('admin.payments')}>
                                        Payments
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Payment #{payment.id}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="mb-4">
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('admin.payments'))}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Payments
                        </Button>
                    </div>
                    
                    <PaymentDetailsCard payment={payment} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
```

### 2. Add Route
In `routes/web.php`:

```php
Route::middleware(['auth', 'role:admin,super_admin'])->prefix('admin')->name('admin.')->group(function () {
    // Existing routes...
    Route::get('/payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');
});
```

### 3. Add Controller Method
In `app/Http/Controllers/PaymentController.php`:

```php
public function show(Payment $payment)
{
    $payment->load([
        'request.applicant',
        'verifiedByUser',
    ]);
    
    return Inertia::render('Admin/PaymentDetails', [
        'payment' => $payment,
    ]);
}
```

### 4. Update Payments.jsx to Navigate
Replace the `handleViewDetails` function:

```jsx
const handleViewDetails = (payment) => {
    router.get(route('admin.payments.show', payment.id));
};
```

## Benefits of the PaymentDetailsCard Component

1. **Comprehensive Display**: Shows all payment information, not just basic fields
2. **Receipt Viewing**: Built-in image preview and PDF viewing capability
3. **Verification Details**: Clear display of who verified and when
4. **Audit Trail**: Shows complete activity history if available
5. **Responsive Design**: Works perfectly on mobile, tablet, and desktop
6. **Professional UI**: Consistent styling with the rest of the application
7. **Accessibility**: WCAG compliant with proper ARIA labels
8. **Maintainable**: Single component for all payment detail views

## Testing the Integration

1. **View Payment Details**: Click the eye icon on any payment
2. **Check Receipt Display**: Verify images and PDFs load correctly
3. **Test Responsive**: Resize browser to test mobile/tablet views
4. **Verify All Sections**: Ensure all data sections display correctly
5. **Test Image Zoom**: Click on receipt images to test full-screen preview
6. **Test Download**: Verify receipt download works

## Troubleshooting

### Issue: Receipt images not showing
**Solution**: Verify storage link is created:
```bash
php artisan storage:link
```

### Issue: Missing verified_by_user data
**Solution**: Ensure relationship is loaded:
```php
$payment->load('verifiedByUser');
```

### Issue: Layout breaks on mobile
**Solution**: The component is already responsive, but ensure parent container doesn't have fixed width

### Issue: PDF not opening in new tab
**Solution**: Check file permissions and storage configuration

## Next Steps

1. Integrate the component into your Payments page
2. Test all payment statuses (pending, verified, rejected)
3. Verify receipt upload and viewing works
4. Test on different devices and screen sizes
5. Consider adding print functionality
6. Consider adding export to PDF functionality

## Support

If you encounter any issues:
1. Check the component README: `PaymentDetailsCard.README.md`
2. Review usage examples: `PaymentDetailsCard.example.jsx`
3. Verify your Payment model has all required relationships
4. Check that receipt files are accessible via storage link
