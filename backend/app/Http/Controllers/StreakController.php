<?php

namespace App\Http\Controllers;

use App\Models\Habit;
use App\Services\StreakBuilderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StreakController extends Controller
{
    public function __construct(
        private StreakBuilderService $streakBuilder
    ) {}

    public function index(Request $request): JsonResponse
    {
        $username = $request->user()->username;

        $habits = Habit::where('username', $username)
            ->where('status', 1)
            ->get();

        if ($habits->isEmpty()) {
            return response()->json([
                'success' => true,
                'data'    => [],
                'summary' => [
                    'total_habits'         => 0,
                    'total_current_streak' => 0,
                    'longest_streak'       => 0,
                    'avg_progress'         => 0,
                ],
            ]);
        }

        $results = $habits->map(function (Habit $habit) {
            $stats = (new StreakBuilderService())
                ->loadActivityLogs($habit)      // Step 1
                ->calculatePeriodDays($habit)   // Step 2
                ->calculateCurrentStreak()      // Step 3
                ->calculateLongestStreak()      // Step 4
                ->calculateProgress()           // Step 5
                ->saveToHabit($habit)           // Step 6
                ->build();                      // Ambil hasil

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
            ];
        });

        // Summary keseluruhan untuk ditampilkan di StatCard Dashboard
        $summary = [
            'total_habits'         => $results->count(),
            'total_current_streak' => $results->sum('current_streak'),
            'longest_streak'       => $results->max('longest_streak'),
            'avg_progress'         => round($results->avg('progress_percent'), 2),
        ];

        return response()->json([
            'success' => true,
            'data'    => $results,
            'summary' => $summary,
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $username = $request->user()->username;

        $habits = Habit::where('username', $username)
            ->where('status', 1)
            ->get();

        if ($habits->isEmpty()) {
            return response()->json([
                'success' => true,
                'data'    => [
                    'total_habits'         => 0,
                    'total_current_streak' => 0,
                    'longest_streak'       => 0,
                    'avg_progress'         => 0,
                ],
            ]);
        }

        $results = $habits->map(fn (Habit $habit) => [
            'current_streak'   => $habit->current_streak,
            'longest_streak'   => $habit->longest_streak,
            'progress_percent' => $habit->progress_percent,
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
        $username = $request->user()->username;

        $habit = Habit::where('id_habit', $id)
            ->where('username', $username)
            ->where('status', 1)
            ->firstOrFail();

        $stats = app(StreakBuilderService::class)
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
