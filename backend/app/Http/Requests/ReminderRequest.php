<?php

namespace App\Http\Requests;

class ReminderRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'reminder_time'    => 'nullable|date_format:H:i',
            'reminder_enabled' => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'reminder_time.date_format'  => 'Format waktu tidak valid.',
            'reminder_enabled.required'  => 'Status pengingat wajib diisi.',
        ];
    }
}
