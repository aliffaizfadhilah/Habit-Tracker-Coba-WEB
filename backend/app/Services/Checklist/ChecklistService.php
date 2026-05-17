<?php

namespace App\Services\Checklist;

use App\Models\Activity;
use App\Models\Habit;
use App\Repositories\Contracts\ActivityLogRepositoryInterface;
use App\Services\Streak\StreakBuilder;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ChecklistService
{
    public function __construct(
        private readonly ActivityLogRepositoryInterface $logRepo,
        private readonly StreakBuilder                  $streakBuilder,
    ) {}

    public function toggleToday(Habit $habit): array
    {
        $today = Carbon::today()->toDateString();

        $activity = Activity::firstOrCreate(
            ['id_habit' => $habit->id_habit],
            ['id_habit' => $habit->id_habit, 'name' => $habit->title]
        );

        $existingLog = $this->logRepo->findTodayLog($activity->id_activity);

        if ($existingLog) {
            $this->logRepo->deleteLog($existingLog);
            $checked = false;
        } else {
            $this->logRepo->createLog([
                'id_activity' => $activity->id_activity,
                'date'        => $today,
                'status'      => 1,
            ]);
            $checked = true;
        }

        $this->streakBuilder
            ->loadActivityLogs($habit)
            ->calculatePeriodDays($habit)
            ->calculateCurrentStreak()
            ->calculateLongestStreak()
            ->calculateProgress()
            ->saveToHabit($habit);

        return [
            'checked'       => $checked,
            'checked_today' => $checked,
            'date'          => $today,
        ];
    }

    public function getCheckedDates(Habit $habit): Collection
    {
        return $this->logRepo->getCheckedDatesByHabit($habit);
    }

    public function getAllLogs(string $username): Collection
    {
        return $this->logRepo->getAllByUsername($username);
    }
}
