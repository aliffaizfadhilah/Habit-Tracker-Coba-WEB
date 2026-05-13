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
            // Sudah dicentang → toggle off
            $existingLog->delete();
            $checked = false;
        } else {
            // Belum dicentang → buat log baru
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
        'success' => true,
        'checked' => $checked,
        'checked_today' => $checked,
        'date'    => $today,
    ]);

        return response()->json([
            'success' => true,
            'checked' => $checked,
            'checked_today' => $checked,
            'date'    => $today,
        ]);
    }
}