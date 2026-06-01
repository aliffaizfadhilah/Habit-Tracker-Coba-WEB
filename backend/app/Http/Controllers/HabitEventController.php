<?php

namespace App\Http\Controllers;

use App\Models\Habit;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HabitEventController extends Controller
{
    private const POLL_INTERVAL_SEC = 4;
    private const MAX_CONNECTION_SEC = 300;

    public function stream(Request $request): StreamedResponse
    {
        $username = $request->user()->username;

        return response()->stream(function () use ($username) {
            $lastTs   = $this->latestUpdate($username);
            $deadline = time() + self::MAX_CONNECTION_SEC;

            echo "retry: 3000\n\n";
            @ob_flush();
            @flush();

            while (time() < $deadline) {
                if (connection_aborted()) {
                    break;
                }

                $currentTs = $this->latestUpdate($username);

                if ($currentTs !== $lastTs) {
                    $lastTs = $currentTs;
                    echo "event: habits_updated\n";
                    echo 'data: {"ts":' . time() . "}\n\n";
                } else {
                    echo ": ping\n\n";
                }

                @ob_flush();
                @flush();
                sleep(self::POLL_INTERVAL_SEC);
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache, no-store',
            'X-Accel-Buffering' => 'no',
            'Connection'        => 'keep-alive',
        ]);
    }

    private function latestUpdate(string $username): string
    {
        return Habit::where('username', $username)->max('updated_at') ?? '0';
    }
}
