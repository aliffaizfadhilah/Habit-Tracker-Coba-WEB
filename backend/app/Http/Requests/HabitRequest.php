<?php

namespace App\Http\Requests;

class HabitRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'title'         => 'required|string|max:100',
            'category'      => 'required|string|max:30',
            'periode_start' => 'required|date',
            'periode_end'   => 'required|date|after_or_equal:periode_start',
            'reminder_time' => 'required|date_format:H:i',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'             => 'Judul habit wajib diisi.',
            'category.required'          => 'Kategori wajib dipilih.',
            'periode_start.required'     => 'Tanggal mulai wajib diisi.',
            'periode_end.required'       => 'Tanggal selesai wajib diisi.',
            'periode_end.after_or_equal' => 'Tanggal selesai harus setelah tanggal mulai.',
            'reminder_time.required'     => 'Waktu pengingat wajib diisi.',
            'reminder_time.date_format'  => 'Format waktu tidak valid.',
        ];
    }
}
