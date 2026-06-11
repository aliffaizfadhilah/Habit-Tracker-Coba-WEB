<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Services\Post\PostService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FeedEventController extends Controller
{
    public function __construct(private readonly PostService $postService) {}

    private const POLL_INTERVAL_SEC = 5;
    private const MAX_CONNECTION_SEC = 300;

    public function stream(Request $request): StreamedResponse
    {
        $cursor = max(0, (int) $request->query('cursor', 0));
        $userId = $request->user()->id;

        return response()->stream(function () use ($cursor, $userId) {
            $lastId   = $cursor;
            $deadline = time() + self::MAX_CONNECTION_SEC;

            echo "retry: 3000\n\n";
            @ob_flush();
            @flush();

            while (time() < $deadline) {
                if (connection_aborted()) {
                    break;
                }

                $newPosts = Post::with(['user', 'likes'])
                    ->where('id', '>', $lastId)
                    ->where(function ($q) use ($userId) {
                        $q->where('is_private', false)
                          ->orWhere('user_id', $userId);
                    })
                    ->orderBy('id', 'asc')
                    ->get();

                if ($newPosts->isNotEmpty()) {
                    $lastId    = $newPosts->max('id');
                    $formatted = $newPosts
                        ->map(fn ($p) => $this->postService->formatPost($p, $userId))
                        ->values()
                        ->toArray();

                    echo "event: new_posts\n";
                    echo 'data: ' . json_encode(['posts' => $formatted, 'cursor' => $lastId]) . "\n\n";
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
}
