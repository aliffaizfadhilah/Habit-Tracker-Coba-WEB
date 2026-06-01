<?php

namespace App\Http\Requests;

class CommentRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'content' => 'required|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Komentar tidak boleh kosong.',
        ];
    }
}
