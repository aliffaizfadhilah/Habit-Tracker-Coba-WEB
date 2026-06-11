<?php

namespace App\Http\Controllers;

use App\Http\Requests\HabitRequest;
use App\Http\Requests\ReminderRequest;
use App\Services\Habit\HabitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HabitController extends Controller
{
    public function __construct(private readonly HabitService $habitService) {}

    public function index(Request $request): JsonResponse
    {
        $habits = $this->habitService->getAll($request->user()->username);

        return response()->json([
            'success' => true,
            'data'    => $habits->map(fn($h) => $this->habitService->formatHabit($h)),
        ]);
    }

    public function store(HabitRequest $request): JsonResponse
    {
        $habit = $this->habitService->create($request->validated(), $request->user()->username);

        return response()->json([
            'success' => true,
            'message' => 'Habit berhasil ditambahkan!',
            'data'    => $this->habitService->formatHabit($habit),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $habit = $this->habitService->find($id, $request->user()->username);

        if (!$habit) {
            return response()->json(['success' => false, 'message' => 'Habit tidak ditemukan.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->habitService->formatHabit($habit),
        ]);
    }

    public function update(HabitRequest $request, int $id): JsonResponse
    {
        $habit = $this->habitService->find($id, $request->user()->username);

        if (!$habit) {
            return response()->json(['success' => false, 'message' => 'Habit tidak ditemukan.'], 404);
        }

        $updated = $this->habitService->update($habit, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Habit berhasil diperbarui!',
            'data'    => $this->habitService->formatHabit($updated),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $habit = $this->habitService->find($id, $request->user()->username);

        if (!$habit) {
            return response()->json(['success' => false, 'message' => 'Habit tidak ditemukan.'], 404);
        }

        $this->habitService->delete($habit);

        return response()->json(['success' => true, 'message' => 'Habit berhasil dihapus.']);
    }

    public function updateReminder(ReminderRequest $request, int $id): JsonResponse
    {
        // Hanya blokir saat user mencoba MENGAKTIFKAN reminder — menonaktifkan tetap diizinkan
        if ($request->boolean('reminder_enabled')) {
            $consentRaw = $request->cookie('habittracker_cookie_consent');
            if ($consentRaw) {
                $consent = json_decode(urldecode($consentRaw), true);
                if (empty($consent['preferences']['preferences'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Aktifkan Cookie Preferensi di pengaturan cookie untuk menggunakan fitur pengingat.',
                    ], 403);
                }
            }
        }

        $habit = $this->habitService->find($id, $request->user()->username);

        if (!$habit) {
            return response()->json(['success' => false, 'message' => 'Habit tidak ditemukan.'], 404);
        }

        $updated = $this->habitService->updateReminder($habit, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Pengingat berhasil diperbarui!',
            'data'    => $this->habitService->formatHabit($updated),
        ]);
    }
}
