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
    public $appointmentDate;
    public $appointmentTime;
    public $paymentAmount;
    public $requirements;
    public $adminNotes;

    /**
     * Create a new message instance.
     */
    public function __construct(
        $request, 
        $applicantName, 
        $appointmentDate, 
        $appointmentTime, 
        $paymentAmount, 
        $requirements, 
        $adminNotes = null
    ) {
        $this->request = $request;
        $this->applicantName = $applicantName;
        $this->appointmentDate = $appointmentDate;
        $this->appointmentTime = $appointmentTime;
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
            subject: 'Application Approved - Appointment Scheduled',
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
