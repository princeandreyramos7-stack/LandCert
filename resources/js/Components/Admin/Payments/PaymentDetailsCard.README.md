# PaymentDetailsCard Component

## Overview
The `PaymentDetailsCard` component is a comprehensive React component designed to display detailed payment information for the CPDO Admin Payment Confirmation system. It provides a responsive, mobile-friendly card layout that displays all payment details, verification information, receipt images/PDFs, and audit trails.

## Features

### Core Display Features
- ✅ Display all payment information in organized card sections
- ✅ Show uploaded receipt image or PDF preview
- ✅ Display verification details (who verified, when)
- ✅ Show audit trail with activity history
- ✅ Responsive design for mobile, tablet, and desktop
- ✅ Full-screen image preview with zoom capability
- ✅ Download receipt functionality
- ✅ PDF receipt support with view in new tab
- ✅ Color-coded status badges
- ✅ Icon-enhanced information fields

### Responsive Design
- **Desktop**: Multi-column grid layout (up to 3 columns)
- **Tablet**: 2-column layout with adjusted spacing
- **Mobile**: Single-column stacked layout with touch-friendly buttons

## Requirements Met
- **FR6.1**: Admin can view full payment details ✅
- **FR6.2**: Details include all payment information, receipt, verifier, timestamp, and audit trail ✅
- **NFR3**: Responsive design with clear labels and mobile support ✅

## Component Structure

```jsx
<PaymentDetailsCard payment={paymentObject} />
```

## Props

### `payment` (Object, required)
The payment object containing all payment information.

#### Required Fields:
- `id` (number): Payment ID
- `request_id` (number): Associated request ID
- `amount` (number): Payment amount
- `payment_method` (string): Payment method (cash, check, bank_transfer, gcash, paymaya, other)
- `payment_date` (string): Date of payment
- `payment_status` (string): Status (verified, rejected, pending)
- `created_at` (string): Timestamp when payment was created
- `updated_at` (string): Timestamp when payment was last updated

#### Optional Fields:
- `applicant_name` (string): Name of applicant
- `receipt_number` (string): Official Receipt number
- `receipt_file_path` (string): Path to uploaded receipt file
- `check_number` (string): Check number (for check payments)
- `reference_number` (string): Reference number (for digital payments)
- `notes` (string): Additional notes
- `rejection_reason` (string): Reason for rejection (if rejected)
- `verified_by` (number): ID of user who verified
- `verified_at` (string): Timestamp of verification
- `verified_by_user` (object): User object with `id`, `name`, `email`
- `request` (object): Request details with `id`, `project_type`, `status`, `payment_order_number`
- `audit_trail` (array): Array of audit log entries

## Sections Displayed

### 1. Main Payment Information Card
Displays core payment details:
- Payment ID
- Request ID
- Applicant Name
- Amount (highlighted)
- Payment Method
- Payment Date
- Official Receipt Number
- Check/Reference Number (if applicable)
- Status Badge
- Submission Date

### 2. Request Details Card
Shows associated request information (if available):
- Project Type
- Request Status
- Payment Order Number

### 3. Verification Details Card
Shows who verified the payment and when:
- Verified By (name and email)
- Verified At (date and time)

### 4. Receipt Image/PDF Section
Displays uploaded receipt with actions:
- Image preview (for JPG/PNG)
- PDF indicator (for PDF files)
- Zoom to full screen (images only)
- View in new tab (PDFs only)
- Download button
- Full-screen modal preview for images

### 5. Notes Section
Shows any additional notes entered by admin

### 6. Rejection Reason Section
Displays rejection reason (if payment was rejected)

### 7. Audit Trail Section
Shows chronological activity log:
- Action performed
- User who performed action
- Timestamp
- Additional details

### 8. Activity Timestamps Card
Displays creation and last update timestamps

## Usage Examples

### Basic Usage
```jsx
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";

function PaymentDetailsPage({ payment }) {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Payment Details</h1>
            <PaymentDetailsCard payment={payment} />
        </div>
    );
}
```

### With Inertia.js Page
```jsx
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";

export default function Show({ payment }) {
    return (
        <AdminLayout>
            <Head title={`Payment #${payment.id}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Payment Details #{payment.id}
                        </h1>
                    </div>
                    
                    <PaymentDetailsCard payment={payment} />
                </div>
            </div>
        </AdminLayout>
    );
}
```

### In a Modal
```jsx
import { Dialog, DialogContent } from "@/Components/ui/dialog";
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";

function PaymentDetailsModal({ isOpen, onClose, payment }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <PaymentDetailsCard payment={payment} />
            </DialogContent>
        </Dialog>
    );
}
```

## Styling

The component uses Tailwind CSS with the following design system:

### Colors
- **Blue**: Primary actions and information
- **Green**: Verified status and verification details
- **Red**: Rejected status and rejection reasons
- **Yellow**: Pending status
- **Gray**: Neutral information and backgrounds

### Responsive Breakpoints
- `sm:` - 640px and up (tablet)
- `lg:` - 1024px and up (desktop)

### Key Classes
- Card containers: `bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm`
- Grid layouts: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- Buttons: `inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors`

## Accessibility

The component follows accessibility best practices:
- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader friendly text
- ✅ Color contrast compliance
- ✅ Focus states on buttons
- ✅ Alt text on images

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

### Required
- React 18.2+
- lucide-react (for icons)
- Tailwind CSS 3.2+

### Utilities
- `formatDate` from `./utils.jsx`
- `formatCurrency` from `./utils.jsx`

## File Structure

```
resources/js/Components/Admin/Payments/
├── PaymentDetailsCard.jsx           # Main component
├── PaymentDetailsCard.example.jsx   # Usage examples
├── PaymentDetailsCard.README.md     # This documentation
└── utils.jsx                        # Shared utilities
```

## Performance Considerations

1. **Image Optimization**: Receipt images are loaded on-demand
2. **Conditional Rendering**: Optional sections only render when data exists
3. **Lazy Preview**: Full-screen preview modal only renders when activated
4. **Efficient State**: Minimal state management (only for image preview)

## Testing Considerations

When testing this component, verify:

1. **Display Tests**
   - All payment fields display correctly
   - Optional fields show/hide appropriately
   - Status badges render with correct colors
   - Icons display correctly

2. **Interaction Tests**
   - Receipt download works
   - Image zoom/preview works
   - PDF opens in new tab
   - Close buttons function

3. **Responsive Tests**
   - Layout adapts on mobile screens
   - Buttons remain touch-friendly
   - Text remains readable at all sizes
   - Images scale appropriately

4. **Edge Cases**
   - Null/undefined payment object
   - Missing optional fields
   - Very long text in notes/reasons
   - Missing receipt file
   - Invalid date formats

## Future Enhancements

Potential improvements:
- 🔄 Print payment details functionality
- 🔄 Export to PDF
- 🔄 Share payment link
- 🔄 Copy payment details to clipboard
- 🔄 Timeline view for audit trail
- 🔄 Image annotation tools
- 🔄 Multi-image support

## Support

For issues or questions:
1. Check the usage examples in `PaymentDetailsCard.example.jsx`
2. Review the design document at `.kiro/specs/admin-payment-confirmation/design.md`
3. Contact the development team

## Version History

- **v1.0.0** (2026-08-20): Initial release
  - Full payment details display
  - Receipt image/PDF support
  - Verification details section
  - Audit trail support
  - Responsive design
  - Accessibility compliance
