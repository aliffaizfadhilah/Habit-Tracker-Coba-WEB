<?php

namespace App\Services\Habit;

use App\Models\Habit;
use Carbon\Carbon;

/**
 * Factory — bertanggung jawab membuat instance Habit dengan data yang terstruktur.
 */
class HabitFactory
{
    public function create(array $data, string $username): Habit
    {
        $start      = Carbon::parse($data['periode_start']);
        $end        = Carbon::parse($data['periode_end']);
        $periodDays = $start->diffInDays($end) + 1;

        return Habit::create([
            'username'          => $username,
            'title'             => $data['title'],
            'category'          => $data['category'],
            'periode_start'     => $data['periode_start'],
            'periode_end'       => $data['periode_end'],
            'total_period_days' => $periodDays,
            'status'            => 1,
            'reminder_time'     => $data['reminder_time'],
            'reminder_enabled'  => true,
        ]);
    }

    public function buildUpdatePayload(array $data): array
    {
        $start      = Carbon::parse($data['periode_start']);
        $end        = Carbon::parse($data['periode_end']);
        $periodDays = $start->diffInDays($end) + 1;

        return [
            'title'             => $data['title'],
            'category'          => $data['category'],
            'periode_start'     => $data['periode_start'],
            'periode_end'       => $data['periode_end'],
            'total_period_days' => $periodDays,
            'reminder_time'     => $data['reminder_time'],
        ];
    }
}
