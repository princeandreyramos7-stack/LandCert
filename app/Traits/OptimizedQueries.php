<?php

namespace App\Traits;

trait OptimizedQueries
{
    /**
     * Get paginated requests with optimized queries
     */
    public function getOptimizedRequests($perPage = null)
    {
        $perPage = $perPage ?? config('performance.pagination.requests', 25);
        
        return \App\Models\Request::query()
            ->leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
            ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->leftJoin('locations', 'requests.id', '=', 'locations.request_id')
            ->leftJoin('properties', 'requests.id', '=', 'properties.request_id')
            ->leftJoin('normalized_corporations', 'applicants.id', '=', 'normalized_corporations.applicant_id')
            ->select([
                'requests.id',
                'requests.user_id',
                'requests.status',
                'requests.created_at',
                'requests.updated_at',
                'applicants.applicant_name',
                'applicants.applicant_address',
                'normalized_corporations.corporation_name',
                'normalized_projects.project_type',
                'normalized_projects.project_nature',
                'normalized_projects.project_cost',
                'locations.street_address as project_location_street',
                'locations.barangay as project_location_barangay',
                'locations.city_municipality as project_location_city',
                'locations.city_municipality as project_location_municipality',
                'locations.province as project_location_province',
                'properties.lot_area_sqm',
            ])
            ->with(['user:id,name,email'])
            ->orderBy('requests.created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get paginated payments with optimized queries
     */
    public function getOptimizedPayments($perPage = null, $status = null)
    {
        $perPage = $perPage ?? config('performance.pagination.payments', 25);
        
        $query = \App\Models\Payment::query()
            ->select([
                'payments.id',
                'payments.request_id',
                'payments.application_id',
                'payments.amount',
                'payments.payment_method',
                'payments.receipt_number',
                'payments.receipt_file_path',
                'payments.payment_date',
                'payments.payment_status',
                'payments.verified_by',
                'payments.verified_at',
                'payments.rejection_reason',
                'payments.notes',
                'payments.created_at',
                'payments.updated_at'
            ])
            ->with([
                'request' => function($query) {
                    $query->select('requests.id')
                        ->leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
                        ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
                        ->addSelect([
                            'applicants.applicant_name',
                            'normalized_projects.project_type'
                        ]);
                },
                'verifier:id,name,email'
            ])
            ->orderBy('payments.created_at', 'desc');

        if ($status && $status !== 'all') {
            $query->where('payment_status', $status);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get paginated users with optimized queries
     */
    public function getOptimizedUsers($perPage = null, $userType = null)
    {
        $perPage = $perPage ?? config('performance.pagination.users', 25);
        
        $query = \App\Models\User::query()
            ->select([
                'id', 'name', 'email', 'contact_number', 'address',
                'user_type', 'email_verified_at', 'created_at', 'updated_at'
            ])
            ->orderBy('created_at', 'desc');

        if ($userType && $userType !== 'all') {
            $query->where('user_type', $userType);
        }

        return $query->paginate($perPage);
    }

    /**
     * Process large dataset in chunks
     */
    public function processInChunks($query, $callback, $chunkSize = null)
    {
        $chunkSize = $chunkSize ?? config('performance.query.chunk_processing', 1000);
        
        $query->chunk($chunkSize, $callback);
    }
}
