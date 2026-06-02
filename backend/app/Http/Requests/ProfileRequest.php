<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class ProfileRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $user = $this->user();

        return [
            'full_name' => 'required|string|max:100',
            'username'  => ['required', 'string', 'max:50', Rule::unique('users', 'username')->ignore($user->username, 'username')],
            'email'     => ['required', 'email', Rule::unique('users', 'email')->ignore($user->email, 'email')],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'username.required'  => 'Username wajib diisi.',
            'username.unique'    => 'Username sudah digunakan.',
            'email.required'     => 'Email wajib diisi.',
            'email.unique'       => 'Email sudah digunakan.',
        ];
    }
}
