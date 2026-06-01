<?php

namespace App\Repositories\Contracts;

use App\Models\Habit;
use Illuminate\Support\Collection;

interface ReminderRepositoryInterface
{
    public function findHabitsWithReminder(string $time): Collection;
    public function updateReminder(Habit $habit, array $data): Habit;
}
