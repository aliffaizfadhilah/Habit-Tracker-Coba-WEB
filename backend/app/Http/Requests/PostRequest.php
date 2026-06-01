<?php

namespace App\Http\Requests;

class PostRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'title'            => 'required|string|max:150',
            'caption'          => 'nullable|string|max:1000',
            'image'            => 'required|file|image|max:10240',
            'habit_id'         => 'nullable|integer',
            'habit_title'      => 'nullable|string|max:100',
            'progress_percent' => 'nullable|numeric|min:0|max:100',
            'is_private'       => 'nullable|boolean',
            'frame_style'      => 'nullable|string|in:rect,circle,ring',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul postingan wajib diisi.',
            'image.required' => 'Gambar snapshot wajib disertakan.',
            'image.image'    => 'File harus berupa gambar.',
            'image.max'      => 'Ukuran gambar maksimal 10MB.',
        ];
    }
}
