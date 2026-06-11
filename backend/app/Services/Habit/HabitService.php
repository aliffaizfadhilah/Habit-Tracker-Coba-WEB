<?php

namespace App\Services\Habit;

use App\Models\Habit;
use App\Repositories\Contracts\HabitRepositoryInterface;
use App\Services\Streak\StreakBuilder;
use Illuminate\Support\Collection;
use App\Services\Habit\HabitFactory;

class HabitService
{
    public function __construct(
        private readonly HabitRepositoryInterface $habitRepo,
        private readonly HabitFactory             $factory,
    ) {}

    public function getAll(string $username): Collection
    {
        return $this->habitRepo->allByUsername($username);
    }

    public function create(array $data, string $username): Habit
    {
        return $this->factory->create($data, $username);
    }

    public function find(int $id, string $username): ?Habit
    {
        return $this->habitRepo->findByIdAndUsername($id, $username);
    }

    public function update(Habit $habit, array $data): Habit
    {
        $payload = $this->factory->buildUpdatePayload($data);
        $this->habitRepo->update($habit, $payload);

        $updated = $habit->fresh();

        (new StreakBuilder())
            ->loadActivityLogs($updated)
            ->calculatePeriodDays($updated)
            ->calculateCurrentStreak()
            ->calculateLongestStreak()
            ->calculateProgress()
            ->saveToHabit($updated);

        return $updated->fresh();
    }

    public function delete(Habit $habit): void
    {
        $this->habitRepo->update($habit, ['status' => 0]);
    }

    public function updateReminder(Habit $habit, array $data): Habit
    {
        $this->habitRepo->update($habit, [
            'reminder_time'    => $data['reminder_time'],
            'reminder_enabled' => $data['reminder_enabled'],
        ]);

        return $habit->fresh();
    }

    public function formatHabit(Habit $habit): array
    {
        $rawTime      = $habit->reminder_time;
        $reminderTime = $rawTime ? substr($rawTime, 0, 5) : null;

        return [
            'id_habit'             => $habit->id_habit,
            'title'                => $habit->title,
            'category'             => $habit->category,
            'periode_start'        => $habit->periode_start?->format('Y-m-d'),
            'periode_end'          => $habit->periode_end?->format('Y-m-d'),
            'current_streak'       => $habit->current_streak,
            'longest_streak'       => $habit->longest_streak,
            'progress_percent'     => $habit->progress_percent,
            'total_period_days'    => $habit->total_period_days,
            'total_completed_days' => $habit->total_completed_days,
            'reminder_time'        => $reminderTime,
            'reminder_enabled'     => (bool) $habit->reminder_enabled,
            'checked_today'        => $habit->activityLogs()
                ->whereDate('date', today())
                ->where('status', 1)
                ->exists(),
        ];
    }
}
