<?php

namespace App\Http\Controllers;

use App\Models\Habit;
use App\Services\Checklist\ChecklistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function __construct(private readonly ChecklistService $checklistService) {}

    public function checkToday(Request $request, int $id): JsonResponse
    {
        $habit = Habit::where('id_habit', $id)
            ->where('username', $request->user()->username)
            ->where('status', 1)
            ->firstOrFail();

        $result = $this->checklistService->toggleToday($habit);

        return response()->json(['success' => true, ...$result]);
    }

    public function checklistHistory(Request $request, int $id): JsonResponse
    {
        $habit = Habit::where('id_habit', $id)
            ->where('username', $request->user()->username)
            ->firstOrFail();

        $dates = $this->checklistService->getCheckedDates($habit);

        return response()->json(['success' => true, 'data' => $dates]);
    }

    public function index(Request $request): JsonResponse
    {
        $logs = $this->checklistService->getAllLogs($request->user()->username);

        return response()->json(['success' => true, 'data' => $logs]);
    }
}
