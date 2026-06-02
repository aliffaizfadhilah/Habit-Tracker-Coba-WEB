<?php

namespace App\Repositories\Contracts;

use App\Models\Activity;
use App\Models\ActivityLog;
use App\Models\Habit;
use Illuminate\Support\Collection;

interface ActivityLogRepositoryInterface
{
    public function firstOrCreateActivity(int $habitId, string $name): Activity;
    public function findTodayLog(int $activityId): ?ActivityLog;
    public function createLog(array $data): ActivityLog;
    public function deleteLog(ActivityLog $log): void;
    public function getCheckedDatesByHabit(Habit $habit): Collection;
    public function getAllByUsername(string $username): Collection;
}
