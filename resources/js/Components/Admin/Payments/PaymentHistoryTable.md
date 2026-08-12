# PaymentHistoryTable Component

## Overview
This component displays a filterable and searchable table of payment history records for the Admin Payment Confirmation feature.

## Requirements Coverage

### FR5.1: Admin can view all payment records ✓
- Component accepts `payments` array prop
- Displays all payment records in a table format
- Shows appropriate empty state when no payments exist

### FR5.2: Payment list shows required columns ✓
- ✓ OR Number (receipt_number)
- ✓ Request ID
- ✓ Applicant Name
- ✓ Amount
- ✓ Date (payment_date)
- ✓ Verified By (verified_by_name)
- ✓ Status (payment_status with badge)

### FR5.3: Filter by Status, Date Range, Payment Method ✓
- ✓ Status filter dropdown (All, Verified, Rejected, Pending)
- ✓ Payment method filter dropdown (All methods + dynamic list)
- ✓ Date range filters (From Date and To Date)
- ✓ Clear filters button to reset all filters

### FR5.4: Search functionality ✓
- ✓ Search by OR Number
- ✓ Search by Request ID
- ✓ Search by Applicant Name
- Search input with icon and proper placeholder

### Additional Features
- ✓ Pagination (25 items per page as specified in design)
- ✓ Results count display
- ✓ Filter active indicator badge
- ✓ Export placeholder (for future implementation)
- ✓ Click handler to view payment details
- ✓ Responsive design with proper styling
- ✓ Empty state with helpful message

## Props

```typescript
{
  payments: Array<Payment>,      // Array of payment objects
  onViewDetails: (payment) => void,  // Callback when viewing payment details
  className: string              // Optional additional CSS classes
}
```

## Payment Object Structure

```typescript
{
  id: number,
  receipt_number: string,
  request_id: number,
  applicant_name: string,
  amount: number,
  payment_date: string,
  payment_method: string,
  payment_status: 'pending' | 'verified' | 'rejected',
  verified_by_name: string,
}
```

## Usage Example

```jsx
import { PaymentHistoryTable } from "@/Components/Admin/Payments/PaymentHistoryTable";

function PaymentHistoryPage({ payments }) {
  const handleViewDetails = (payment) => {
    // Navigate to payment details or open modal
    Inertia.visit(`/admin/payments/${payment.id}`);
  };

  return (
    <PaymentHistoryTable
      payments={payments}
      onViewDetails={handleViewDetails}
    />
  );
}
```

## Features

### Filtering
- **Status Filter**: Filter by verified, rejected, pending, or all statuses
- **Payment Method Filter**: Filter by specific payment methods (dynamically populated)
- **Date Range Filter**: Filter payments between two dates
- **Search**: Real-time search across OR numbers, request IDs, and applicant names

### Pagination
- Shows 25 items per page (as per design specification)
- Previous/Next navigation buttons
- Current page and total pages display
- Automatically resets to page 1 when filters change

### Display
- Clean, modern table design with hover effects
- Status badges with appropriate colors and icons
- Formatted currency display (₱ format)
- Formatted date display (MMM DD, YYYY)
- Responsive layout

### Interactions
- Click any row to view payment details
- Click "View" button to view payment details (stops propagation)
- Clear all filters with one click
- Export functionality placeholder for future implementation

## Styling
- Uses Tailwind CSS and custom component library (shadcn/ui)
- Consistent with existing admin UI patterns
- Responsive design for mobile, tablet, and desktop
- Hover effects for better UX

## Dependencies
- React (hooks: useState, useMemo)
- shadcn/ui components (Badge, Button, Input, Select)
- lucide-react icons
- Local utils (getStatusColor, getStatusIcon, formatDate, formatCurrency)

## Testing Considerations
- Test filtering logic with various combinations
- Test search functionality across all searchable fields
- Test pagination with different data set sizes
- Test empty state rendering
- Test date range filtering edge cases
- Test responsive behavior on different screen sizes
