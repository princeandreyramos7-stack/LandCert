<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Rules\LowercaseEmailDomain;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                new LowercaseEmailDomain,
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }

    /**
     * Only trim. The `lowercase` rule that used to sit on this field rejected
     * "JuanDelaCruz@gmail.com" outright, which is a perfectly good address —
     * the name half is the mailbox owner's to capitalise. The domain half is
     * held to lowercase by LowercaseEmailDomain instead.
     */
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => trim($this->input('email'))]);
        }
    }
}
