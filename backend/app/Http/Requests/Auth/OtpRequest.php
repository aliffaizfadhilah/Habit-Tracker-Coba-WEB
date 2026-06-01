<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\ApiFormRequest;

class OtpRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi.',
            'otp.required'   => 'Kode OTP wajib diisi.',
            'otp.size'       => 'Kode OTP harus 6 digit.',
        ];
    }
}
