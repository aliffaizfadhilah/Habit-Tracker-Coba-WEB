<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type'   => 'required|in:bug,post,user',
            'reason' => 'nullable|string|max:100',
            'note'   => 'required|string|max:2000',
            'page'   => 'nullable|string|max:255',
        ]);

        $ua = $request->userAgent() ?? '';

        Report::create([
            'user_id'   => auth('api')->id(),
            'type'      => $request->type,
            'target_id' => $request->input('target_id'),
            'reason'    => $request->reason,
            'note'      => $request->note,
            'page'      => $request->page,
            'browser'   => substr($ua, 0, 150),
            'status'    => 'pending',
        ]);

        return response()->json(['success' => true, 'message' => 'Laporan berhasil dikirim. Terima kasih!'], 201);
    }
}
