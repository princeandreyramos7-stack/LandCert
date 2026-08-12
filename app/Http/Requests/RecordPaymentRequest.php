<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecordPaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only admin and super_admin user types can record payments
        return $this->user() && in_array($this->user()->user_type, ['admin', 'super_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     * Task 9.3: Secure file upload validation
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'request_id' => ['required', 'integer', 'exists:requests,id'],
            'receipt_number' => ['required', 'string', 'max:50'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'payment_date' => ['required', 'date', 'before_or_equal:today'],
            'payment_method' => ['required', Rule::in(['cash'])],
            'check_number' => ['nullable', 'string', 'max:50'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            // Task 9.3: Validate file types (jpg, jpeg, png, pdf only) and limit size to 2MB
            'receipt_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'request_id.required' => 'Request ID is required.',
            'request_id.exists' => 'The selected request does not exist.',
            'receipt_number.required' => 'Official Receipt number is required.',
            'receipt_number.max' => 'Receipt number cannot exceed 50 characters.',
            'amount.required' => 'Payment amount is required.',
            'amount.numeric' => 'Payment amount must be a valid number.',
            'amount.min' => 'Payment amount must be greater than zero.',
            'amount.max' => 'Payment amount cannot exceed ₱999,999.99.',
            'payment_date.required' => 'Payment date is required.',
            'payment_date.date' => 'Payment date must be a valid date.',
            'payment_date.before_or_equal' => 'Payment date cannot be in the future.',
            'payment_method.required' => 'Payment method is required.',
            'payment_method.in' => 'Invalid payment method selected.',
            'check_number.required_if' => 'Check number is required when payment method is Check.',
            'reference_number.required_if' => 'Reference number is required for this payment method.',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
            'receipt_file.file' => 'Receipt must be a valid file.',
            'receipt_file.mimes' => 'Receipt must be a JPG, JPEG, PNG, or PDF file.',
            'receipt_file.max' => 'Receipt file size cannot exceed 2MB.',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'request_id' => 'request',
            'receipt_number' => 'official receipt number',
            'payment_date' => 'payment date',
            'payment_method' => 'payment method',
            'check_number' => 'check number',
            'reference_number' => 'reference number',
            'receipt_file' => 'receipt file',
        ];
    }
}
