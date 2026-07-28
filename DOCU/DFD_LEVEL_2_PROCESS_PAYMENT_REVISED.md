# Data Flow Diagram - Level 2: Process 4.0 (Process Payment)

**Figure 2-7. Level 2 Data Flow Diagram - Process 4.0: Process Payment (Detailed)**

```
┌─────────────┐
│  Applicant  │
└──────┬──────┘
       │
       │ Payment Method Selection
       │
       ▼
┌─────────────────────┐
│       4.1           │
│  Select Payment     │
│  Method             │
└──────┬──────────────┘
       │
       │ Manual Payment Choice
       │
       ▼
┌─────────────────────┐
│       4.2           │
│  Upload Receipt     │
│  Image              │
└──────┬──────────────┘
       │
       │ Receipt Image
       │
       ▼
┌─────────────────────┐
│       4.3           │
│  Create Payment     │
│  Record             │
└──────┬──────────────┘
       │
       │ Payment Data
       │
       ▼
┌─────────────────────┐  ┌──────────────┐
│       4.4           │─►│ D3: Payments │
│  Store Payment      │  └──────────────┘
│  Information        │  Payment Record
└──────┬──────────────┘
       │
       │ Pending Payment Status
       │
       ▼
┌─────────────────────┐  ┌──────────────┐
│       4.5           │◄─│    Admin     │
│  Verify Payment     │  └──────────────┘
│                     │  Verification
│                     │  Decision
│                     │
│                     │  ┌──────────────┐
│                     │─►│ D3: Payments │
└──────┬──────────────┘  └──────────────┘
       │                 Updated Status
       │
       │ Verified Payment Status
       │
       ▼
┌─────────────────────┐  ┌──────────────────┐
│       4.6           │─►│ D6: Notifications│
│  Send Payment       │  └──────────────────┘
│  Confirmation       │  Notif Record
└─────────────────────┘
       │
       │ Payment Receipt Notification
       │
       ▼
┌─────────────┐
│  Applicant  │
└─────────────┘
```

## Discussion

Figure 2-7 illustrates Process 4.0 (Process Payment) decomposed into six sub-processes that handle the manual payment verification workflow.

**Process 4.1 (Select Payment Method)** receives Payment Method Selection from the Applicant. In this simplified workflow, the system handles manual payment processing where applicants pay at the CPDO office and upload proof of payment.

**Process 4.2 (Upload Receipt)** accepts the Manual Payment Choice and captures the Receipt Image. The applicant uploads a scanned copy or photograph of the official receipt issued by the CPDO cashier.

**Process 4.3 (Create Payment Record)** processes the uploaded receipt and prepares Payment Data for storage. This process associates the payment information with the corresponding application request.

**Process 4.4 (Store Payment Information)** saves the Payment Record in D3:Payments with an initial Pending Payment Status. This creates an auditable record of all payment submissions awaiting verification.

**Process 4.5 (Verify Payment)** enables Admin staff to review the uploaded receipt and make a Verification Decision (approve or reject). The process updates the payment Updated Status in D3:Payments based on the admin's verification. This manual verification step ensures payment authenticity and proper amount validation.

**Process 4.6 (Send Payment Confirmation)** creates a Notif Record in D6:Notifications and sends a Payment Receipt Notification to the Applicant informing them of the verification result. Approved payments allow the application to proceed to certificate generation, while rejected payments require resubmission.

The workflow emphasizes manual verification to maintain payment accuracy and provide administrative oversight. All payment transactions are recorded in D3:Payments for financial audit trails, and applicants receive notifications at each verification milestone stored in D6:Notifications.

---
