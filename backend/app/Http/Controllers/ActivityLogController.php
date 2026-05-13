<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityLog;
use App\Models\Habit;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function checkToday(Request $request, int $id): JsonResponse
    {
        $username = $request->user()->username;

        $habit = Habit::where('id_habit', $id)
            ->where('username', $username)
            ->where('status', 1)
            ->firstOrFail();

        $today = Carbon::today()->toDateString();

        $activity = Activity::firstOrCreate(
            ['id_habit' => $habit->id_habit],
            [
                'id_habit' => $habit->id_habit,
                'name'     => $habit->title,
            ]
        );

        $existingLog = ActivityLog::where('id_activity', $activity->id_activity)
            ->whereDate('date', $today)
            ->first();

        if ($existingLog) {
            $existingLog->delete();
            $checked = false;
        } else {
            ActivityLog::create([
                'id_activity' => $activity->id_activity,
                'date'        => $today,
                'status'      => 1,
            ]);
            $checked = true;
        }

        app(\App\Services\StreakBuilderService::class)
            ->loadActivityLogs($habit)
            ->calculatePeriodDays($habit)
            ->calculateCurrentStreak()
            ->calculateLongestStreak()
            ->calculateProgress()
            ->saveToHabit($habit)
            ->build();

        return response()->json([
            'success'       => true,
            'checked'       => $checked,
            'checked_today' => $checked,
            'date'          => $today,
        ]);
    }

    public function checklistHistory(Request $request, int $id): JsonResponse
    {
        $username = $request->user()->username;

        $habit = Habit::where('id_habit', $id)
            ->where('username', $username)
            ->firstOrFail();

        $checkedDates = $habit->activityLogs()
            ->where('status', 1)
            ->pluck('date')
            ->map(fn($date) => Carbon::parse($date)->toDateString())
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data'    => $checkedDates,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $username = $request->user()->username;

        $logs = ActivityLog::whereHas('activity.habit', fn($q) => $q->where('username', $username))
            ->with('activity.habit')
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn($log) => [
                'id'         => $log->id,
                'id_habit'   => $log->activity->id_habit,
                'habit_title'=> $log->activity->habit->title ?? null,
                'date'       => Carbon::parse($log->date)->toDateString(),
                'status'     => $log->status,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $logs,
        ]);
    }
}
