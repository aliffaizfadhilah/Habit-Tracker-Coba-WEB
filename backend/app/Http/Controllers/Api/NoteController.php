<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Note;
use Illuminate\Support\Facades\Auth;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $notes = Auth::user()->notes()
            ->orderBy('pinned', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notes
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'color' => 'nullable|string|max:7',
            'tags' => 'nullable|string',
            'pinned' => 'nullable|boolean',
            'reminder' => 'nullable|date',
        ]);

        $note = Auth::user()->notes()->create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $note
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Note $note)
    {
        if ($note->user_id !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $note
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Note $note)
    {
        if ($note->user_id !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'color' => 'nullable|string|max:7',
            'tags' => 'nullable|string',
            'pinned' => 'nullable|boolean',
            'reminder' => 'nullable|date',
            'reminder_alerted' => 'nullable|boolean',
        ]);

        // Jika reminder diperbarui, reset status alerted agar notifikasi bisa muncul lagi
        if ($request->has('reminder')) {
            $validated['reminder_alerted'] = false;
        }

        $note->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $note
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Note $note)
    {
        if ($note->user_id !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        $note->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Note deleted'
        ]);
    }

    /**
     * Poll for reminders.
     */
    public function poll()
    {
        $now = now();
        $reminders = Auth::user()->notes()
            ->where('reminder', '<=', $now)
            ->where('reminder_alerted', false)
            ->get();

        if ($reminders->count() > 0) {
            foreach ($reminders as $reminder) {
                $reminder->update(['reminder_alerted' => true]);
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'has_reminders' => true,
                    'reminders' => $reminders
                ]
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'has_reminders' => false
            ]
        ]);
    }
}
