<?php

namespace App\Mail;

use App\Models\Certificate;
use App\Models\Request as RequestModel;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CertificateReady extends Mailable
{
    use Queueable, SerializesModels;

    public $certificate;
    public $request;
    public $applicant;
    public $project;

    /**
     * Create a new message instance.
     */
    public function __construct(Certificate $certificate, RequestModel $request)
    {
        $this->certificate = $certificate;
        $this->request = $request;
        
        // Load relationships if not already loaded
        if (!$request->relationLoaded('applicant')) {
            $request->load('applicant', 'project');
        }
        
        $this->applicant = $request->applicant;
        $this->project = $request->project;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Certificate Ready for Pickup - CPDO Ilagan City',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.certificate-ready',
            with: [
                'certificate' => $this->certificate,
                'request' => $this->request,
                'applicant' => $this->applicant,
                'project' => $this->project,
                'certificateNumber' => $this->certificate->certificate_number,
                'applicantName' => $this->applicant->applicant_name ?? 'Valued Client',
                'projectType' => $this->getProjectTypeName($this->request->project_type),
            ]
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
     * Get human-readable project type name
     */
    private function getProjectTypeName($projectType)
    {
        $types = [
            'building_permit' => 'Building Permit',
            'occupancy_permit' => 'Occupancy Permit',
            'demolition_permit' => 'Demolition Permit',
            'electrical_permit' => 'Electrical Permit',
            'mechanical_permit' => 'Mechanical Permit',
            'plumbing_permit' => 'Plumbing Permit',
            'fencing_permit' => 'Fencing Permit',
            'excavation_grading' => 'Excavation & Grading Permit',
            'zoning_clearance' => 'Zoning Clearance',
            'certificate_of_occupancy' => 'Certificate of Occupancy',
            'other' => 'Other Permit',
        ];

        // A request whose project type was never set arrives here as null,
        // which str_replace() no longer accepts.
        return $types[$projectType] ?? ucwords(str_replace('_', ' ', (string) $projectType));
    }
}
