<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent once, in addition to the regular ApplicationRejected notice, the
 * moment a request's denial_count reaches Request::MAX_DENIALS - see
 * AdminController's three denial sites. Deliberately a separate mailable
 * rather than a flag on ApplicationRejected: this one explains that online
 * resubmission is now closed, not what to fix and resubmit.
 */
class ApplicationPermanentlyDenied extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $application;
    public $applicantName;
    public $requestId;
    public $rejectionReason;

    public function __construct($application, $applicantName, $requestId, $rejectionReason = null)
    {
        $this->application = $application;
        $this->applicantName = $applicantName;
        $this->requestId = $requestId;
        $this->rejectionReason = $rejectionReason;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Application Denied - Online Resubmission Closed',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application-permanently-denied',
        );
    }

    /**
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
