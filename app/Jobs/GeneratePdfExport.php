<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class GeneratePdfExport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes timeout for large exports
    
    protected $exportType;
    protected $data;
    protected $fileName;
    protected $userId;

    /**
     * Create a new job instance.
     */
    public function __construct($exportType, $data, $fileName, $userId = null)
    {
        $this->exportType = $exportType;
        $this->data = $data;
        $this->fileName = $fileName;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Generate PDF based on export type
            $pdf = $this->generatePdf();
            
            // Save to storage
            $path = 'exports/' . $this->fileName;
            Storage::put($path, $pdf->output());
            
            // Optionally notify user when complete
            if ($this->userId) {
                // You can implement notification here
                \Log::info("PDF export completed for user {$this->userId}: {$path}");
            }
            
        } catch (\Exception $e) {
            \Log::error("PDF export failed: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate PDF based on export type
     */
    private function generatePdf()
    {
        switch ($this->exportType) {
            case 'requests':
                return Pdf::loadView('exports.requests-pdf', ['requests' => $this->data])
                    ->setPaper('a4', 'landscape');
                    
            case 'payments':
                return Pdf::loadView('exports.payments-pdf', ['payments' => $this->data])
                    ->setPaper('a4', 'landscape');
                    
            case 'users':
                return Pdf::loadView('exports.users-pdf', ['users' => $this->data])
                    ->setPaper('a4', 'landscape');
                    
            default:
                throw new \Exception("Unknown export type: {$this->exportType}");
        }
    }
}
