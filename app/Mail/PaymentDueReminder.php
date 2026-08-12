<?php

namespace App\Mail;

use App\Models\Reminder;
use App\Models\Request as RequestModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentDueReminder extends Mailable
{
    use Queueable, SerializesModels;

    public $reminder;
    public $request;
    public $applicantName;
    public $daysRemaining;
    public $dueDate;

    /**
     * Create a new message instance.
     */
    public function __construct(Reminder $reminder)
    {
        $this->reminder = $reminder;
        $this->request = RequestModel::with(['applicant', 'project', 'location'])->find($reminder->related_id);
        $this->applicantName = $this->request && $this->request->applicant 
            ? $this->request->applicant->applicant_name 
            : 'Applicant';
        $this->daysRemaining = $reminder->metadata['days'] ?? 3;
        $this->dueDate = now()->addDays($this->daysRemaining)->format('F j, Y');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment Due Reminder - Action Required',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-due-reminder',
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
