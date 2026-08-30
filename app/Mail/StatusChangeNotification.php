<?php

namespace App\Mail;

use App\Models\StatusHistory;
use App\Models\Request as RequestModel;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StatusChangeNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $statusHistory;
    public $request;
    public $user;

    /**
     * Create a new message instance.
     */
    public function __construct(StatusHistory $statusHistory, RequestModel $request, User $user)
    {
        $this->statusHistory = $statusHistory;
        $this->request = $request;
        $this->user = $user;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->getSubjectLine();
        
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Load relationships to access normalized data
        $this->request->load(['applicant']);
        
        return new Content(
            view: 'emails.status-change-notification',
            with: [
                'userName' => $this->user->name,
                'applicantName' => $this->request->applicant->applicant_name ?? 'Applicant',
                'requestId' => $this->request->id,
                'statusType' => $this->getStatusTypeLabel(),
                'oldStatus' => $this->getStatusLabel($this->statusHistory->old_status),
                'newStatus' => $this->getStatusLabel($this->statusHistory->new_status),
                'notes' => $this->statusHistory->notes,
                'changedAt' => $this->statusHistory->created_at->format('F j, Y g:i A'),
                'dashboardUrl' => route('dashboard'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
    
    /**
     * Get subject line based on status type and change.
     */
    private function getSubjectLine(): string
    {
        $statusType = $this->statusHistory->status_type;
        $newStatus = $this->statusHistory->new_status;
        
        $subjects = [
            'payment' => [
                'pending' => 'Payment Receipt Received - Under Review',
                'verified' => 'Payment Verified Successfully',
                'rejected' => 'Payment Verification Update',
            ],
            'certificate' => [
                'generated' => 'Certificate Generated - Ready for Download',
                'sent' => 'Certificate Sent to Your Email',
                'collected' => 'Certificate Downloaded Successfully',
            ],
            'application' => [
                'pending' => 'Application Received - Under Review',
                'approved' => 'Application Approved',
                'rejected' => 'Application Status Update',
            ],
        ];
        
        return $subjects[$statusType][$newStatus] ?? 'Application Status Update';
    }
    
    /**
     * Get human-readable status type label.
     */
    private function getStatusTypeLabel(): string
    {
        $labels = [
            'payment' => 'Payment',
            'certificate' => 'Certificate',
            'application' => 'Application',
        ];
        
        return $labels[$this->statusHistory->status_type] ?? ucfirst($this->statusHistory->status_type);
    }
    
    /**
     * Get human-readable status label.
     */
    private function getStatusLabel(?string $status): string
    {
        if (!$status) {
            return 'N/A';
        }
        
        $labels = [
            'pending' => 'Pending Review',
            'verified' => 'Verified',
            'rejected' => 'Denied',
            'approved' => 'Approved',
            'generated' => 'Generated',
            'sent' => 'Sent',
            'collected' => 'Collected/Downloaded',
        ];
        
        return $labels[$status] ?? ucfirst(str_replace('_', ' ', $status));
    }
}
