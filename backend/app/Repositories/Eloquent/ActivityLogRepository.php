<?php

namespace App\Repositories\Eloquent;

use App\Models\ActivityLog;
use App\Models\Habit;
use App\Repositories\Contracts\ActivityLogRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ActivityLogRepository implements ActivityLogRepositoryInterface
{
    public function findTodayLog(int $activityId): ?ActivityLog
    {
        return ActivityLog::where('id_activity', $activityId)
            ->whereDate('date', Carbon::today())
            ->first();
    }

    public function createLog(array $data): ActivityLog
    {
        return ActivityLog::create($data);
    }

    public function deleteLog(ActivityLog $log): void
    {
        $log->delete();
    }

    public function getCheckedDatesByHabit(Habit $habit): Collection
    {
        return $habit->activityLogs()
            ->where('status', 1)
            ->pluck('date')
            ->map(fn($date) => Carbon::parse($date)->toDateString())
            ->sort()
            ->values();
    }

    public function getAllByUsername(string $username): Collection
    {
        return ActivityLog::whereHas('activity.habit', fn($q) => $q->where('username', $username))
            ->with('activity.habit')
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn($log) => [
                'id'          => $log->id,
                'id_habit'    => $log->activity->id_habit,
                'habit_title' => $log->activity->habit->title ?? null,
                'date'        => Carbon::parse($log->date)->toDateString(),
                'status'      => $log->status,
            ]);
    }
}
