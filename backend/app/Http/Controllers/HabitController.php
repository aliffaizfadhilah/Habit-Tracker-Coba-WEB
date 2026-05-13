<?php

namespace App\Http\Controllers;

use App\Models\Habit;
use App\Services\StreakBuilderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class HabitController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $username = $request->user()->username;

        $habits = Habit::where('username', $username)
            ->where('status', 1)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $habits->map(fn($h) => $this->formatHabit($h)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'         => 'required|string|max:100',
            'category'      => 'required|string|max:30',
            'periode_start' => 'required|date',
            'periode_end'   => 'required|date|after_or_equal:periode_start',
        ], [
            'title.required'         => 'Judul habit wajib diisi.',
            'category.required'      => 'Kategori wajib dipilih.',
            'periode_start.required' => 'Tanggal mulai wajib diisi.',
            'periode_end.required'   => 'Tanggal selesai wajib diisi.',
            'periode_end.after_or_equal' => 'Tanggal selesai harus setelah tanggal mulai.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $start      = Carbon::parse($request->periode_start);
        $end        = Carbon::parse($request->periode_end);
        $periodDays = $start->diffInDays($end) + 1;

        $habit = Habit::create([
            'username'          => $request->user()->username,
            'title'             => $request->title,
            'category'          => $request->category,
            'periode_start'     => $request->periode_start,
            'periode_end'       => $request->periode_end,
            'total_period_days' => $periodDays,
            'status'            => 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Habit berhasil ditambahkan!',
            'data'    => $this->formatHabit($habit),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $username = $request->user()->username;

        $habit = Habit::where('id_habit', $id)
            ->where('username', $username)
            ->where('status', 1)
            ->first();

        if (!$habit) {
            return response()->json([
                'success' => false,
                'message' => 'Habit tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->formatHabit($habit),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $username = $request->user()->username;

        $habit = Habit::where('id_habit', $id)
            ->where('username', $username)
            ->where('status', 1)
            ->first();

        if (!$habit) {
            return response()->json([
                'success' => false,
                'message' => 'Habit tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title'         => 'required|string|max:100',
            'category'      => 'required|string|max:30',
            'periode_start' => 'required|date',
            'periode_end'   => 'required|date|after_or_equal:periode_start',
        ], [
            'title.required'         => 'Judul habit wajib diisi.',
            'category.required'      => 'Kategori wajib dipilih.',
            'periode_start.required' => 'Tanggal mulai wajib diisi.',
            'periode_end.required'   => 'Tanggal selesai wajib diisi.',
            'periode_end.after_or_equal' => 'Tanggal selesai harus setelah tanggal mulai.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $start      = Carbon::parse($request->periode_start);
        $end        = Carbon::parse($request->periode_end);
        $periodDays = $start->diffInDays($end) + 1;

        $habit->update([
            'title'             => $request->title,
            'category'          => $request->category,
            'periode_start'     => $request->periode_start,
            'periode_end'       => $request->periode_end,
            'total_period_days' => $periodDays,
        ]);

        $updated = $habit->fresh();

        app(StreakBuilderService::class)
            ->loadActivityLogs($updated)
            ->calculatePeriodDays($updated)
            ->calculateCurrentStreak()
            ->calculateLongestStreak()
            ->calculateProgress()
            ->saveToHabit($updated)
            ->build();

        return response()->json([
            'success' => true,
            'message' => 'Habit berhasil diperbarui!',
            'data'    => $this->formatHabit($updated->fresh()),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $username = $request->user()->username;

        $habit = Habit::where('id_habit', $id)
            ->where('username', $username)
            ->where('status', 1)
            ->first();

        if (!$habit) {
            return response()->json([
                'success' => false,
                'message' => 'Habit tidak ditemukan.',
            ], 404);
        }

        $habit->update(['status' => 0]);

        return response()->json([
            'success' => true,
            'message' => 'Habit berhasil dihapus.',
        ]);
    }

    private function formatHabit(Habit $habit): array
    {
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
            'checked_today'        => $habit->activityLogs()
                ->whereDate('date', today())
                ->where('status', 1)
                ->exists(),
        ];
    }
}