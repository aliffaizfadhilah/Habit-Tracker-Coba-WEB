<?php

namespace App\Repositories\Eloquent;

use App\Models\Activity;
use App\Models\ActivityLog;
use App\Models\Habit;
use App\Repositories\Contracts\ActivityLogRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ActivityLogRepository implements ActivityLogRepositoryInterface
{
    public function firstOrCreateActivity(int $habitId, string $name): Activity
    {
        return Activity::firstOrCreate(
            ['id_habit' => $habitId],
            ['id_habit' => $habitId, 'name' => $name]
        );
    }

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
        /*
         * Subquery bertingkat:
         *   activity_logs WHERE id_activity IN (
         *     SELECT id_activity FROM habit_activities WHERE id_habit IN (
         *       SELECT id_habit FROM habits WHERE username = ? AND status = 1
         *     )
         *   )
         * Lebih eksplisit dibanding whereHas (yang menghasilkan EXISTS):
         * memudahkan optimasi index pada kolom id_habit dan id_activity.
         */
        $habitSubquery    = Habit::select('id_habit')
            ->where('username', $username)
            ->where('status', 1);

        $activitySubquery = Activity::select('id_activity')
            ->whereIn('id_habit', $habitSubquery);

        return ActivityLog::whereIn('id_activity', $activitySubquery)
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
