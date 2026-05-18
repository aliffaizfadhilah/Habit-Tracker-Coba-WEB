<?php

namespace App\Http\Controllers;

use App\Models\Habit;
use App\Services\Streak\StreakBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StreakController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $username = $request->user()->username;
        $habits   = Habit::where('username', $username)->where('status', 1)->get();

        if ($habits->isEmpty()) {
            return response()->json([
                'success' => true,
                'data'    => [],
                'summary' => ['total_habits' => 0, 'total_current_streak' => 0, 'longest_streak' => 0, 'avg_progress' => 0],
            ]);
        }

        $results = $habits->map(function (Habit $habit) {
            $stats = (new StreakBuilder())
                ->loadActivityLogs($habit)
                ->calculatePeriodDays($habit)
                ->calculateCurrentStreak()
                ->calculateLongestStreak()
                ->calculateProgress()
                ->saveToHabit($habit)
                ->build();

            $checkedToday = $habit->activityLogs()
                ->whereDate('date', today())
                ->where('status', 1)
                ->exists();

            return [
                'id_habit'             => $habit->id_habit,
                'title'                => $habit->title,
                'category'             => $habit->category,
                'periode_start'        => $habit->periode_start?->format('Y-m-d'),
                'periode_end'          => $habit->periode_end?->format('Y-m-d'),
                'current_streak'       => $stats['current_streak'],
                'longest_streak'       => $stats['longest_streak'],
                'progress_percent'     => $stats['progress_percent'],
                'total_period_days'    => $stats['total_period_days'],
                'total_completed_days' => $stats['total_completed_days'],
                'checked_today'        => $checkedToday,
                'reminder_time'        => $habit->reminder_time ? substr($habit->reminder_time, 0, 5) : null,
                'reminder_enabled'     => (bool) $habit->reminder_enabled,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $results,
            'summary' => [
                'total_habits'         => $results->count(),
                'total_current_streak' => $results->sum('current_streak'),
                'longest_streak'       => $results->max('longest_streak'),
                'avg_progress'         => round($results->avg('progress_percent'), 2),
            ],
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $habits = Habit::where('username', $request->user()->username)->where('status', 1)->get();

        if ($habits->isEmpty()) {
            return response()->json([
                'success' => true,
                'data'    => ['total_habits' => 0, 'total_current_streak' => 0, 'longest_streak' => 0, 'avg_progress' => 0],
            ]);
        }

        $results = $habits->map(fn(Habit $h) => [
            'current_streak'   => $h->current_streak,
            'longest_streak'   => $h->longest_streak,
            'progress_percent' => $h->progress_percent,
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'total_habits'         => $results->count(),
                'total_current_streak' => $results->sum('current_streak'),
                'longest_streak'       => $results->max('longest_streak'),
                'avg_progress'         => round($results->avg('progress_percent'), 2),
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $habit = Habit::where('id_habit', $id)
            ->where('username', $request->user()->username)
            ->where('status', 1)
            ->firstOrFail();

        $stats = (new StreakBuilder())
            ->loadActivityLogs($habit)
            ->calculatePeriodDays($habit)
            ->calculateCurrentStreak()
            ->calculateLongestStreak()
            ->calculateProgress()
            ->saveToHabit($habit)
            ->build();

        $checkedToday = $habit->activityLogs()
            ->whereDate('date', today())
            ->where('status', 1)
            ->exists();

        return response()->json([
            'success' => true,
            'data'    => array_merge(['id_habit' => $habit->id_habit, 'title' => $habit->title, 'checked_today' => $checkedToday], $stats),
        ]);
    }
}
