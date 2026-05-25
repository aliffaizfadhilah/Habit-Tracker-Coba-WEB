<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\ApiFormRequest;

class ForgotPasswordRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'email' => 'required|email',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi.',
            'email.email'    => 'Format email tidak valid.',
        ];
    }
}
