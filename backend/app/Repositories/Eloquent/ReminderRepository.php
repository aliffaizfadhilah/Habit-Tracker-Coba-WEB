<?php

namespace App\Repositories\Eloquent;

use App\Models\Habit;
use App\Repositories\Contracts\ReminderRepositoryInterface;
use Illuminate\Support\Collection;

class ReminderRepository implements ReminderRepositoryInterface
{
    public function findHabitsWithReminder(string $time): Collection
    {
        return Habit::where('status', 1)
            ->where('reminder_enabled', true)
            ->where('reminder_time', 'like', $time . '%')
            ->get();
    }

    public function updateReminder(Habit $habit, array $data): Habit
    {
        $habit->update($data);
        return $habit->fresh();
    }
}
