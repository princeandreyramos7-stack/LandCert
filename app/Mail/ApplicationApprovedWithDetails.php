<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationApprovedWithDetails extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $request;
    public $applicantName;
    public $paymentAmount;
    public $requirements;
    public $adminNotes;

    /**
     * Create a new message instance.
     */
    public function __construct(
        $request, 
        $applicantName, 
        $appointmentDate, // Keep parameter for backward compatibility but don't use
        $appointmentTime, // Keep parameter for backward compatibility but don't use
        $paymentAmount, 
        $requirements, 
        $adminNotes = null
    ) {
        $this->request = $request;
        $this->applicantName = $applicantName;
        $this->paymentAmount = $paymentAmount;
        $this->requirements = $requirements;
        $this->adminNotes = $adminNotes;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Application Approved - Payment Instructions',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.application-approved-with-details',
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
}
