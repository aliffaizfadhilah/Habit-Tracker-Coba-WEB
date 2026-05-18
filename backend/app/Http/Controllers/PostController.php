<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommentRequest;
use App\Http\Requests\PostRequest;
use App\Services\Post\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function __construct(private readonly PostService $postService) {}

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        if ($request->boolean('mine')) {
            $posts = $this->postService->getByUser($userId);
        } else {
            $since = (int) $request->query('since', 0);
            $posts = $since > 0
                ? $this->postService->getAllSince($userId, $since)
                : $this->postService->getAll($userId);
        }

        return response()->json(['success' => true, 'data' => $posts]);
    }

    public function store(PostRequest $request): JsonResponse
    {
        $post = $this->postService->create(
            $request->validated(),
            $request->file('image'),
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil dibuat!',
            'data'    => $post,
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $this->postService->delete($id, $request->user()->id);

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Postingan tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Postingan berhasil dihapus.']);
    }

    public function toggleLike(Request $request, int $id): JsonResponse
    {
        $result = $this->postService->toggleLike($id, $request->user()->id);

        if ($result === null) {
            return response()->json(['success' => false, 'message' => 'Postingan tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, ...$result]);
    }

    public function comments(int $id): JsonResponse
    {
        $comments = $this->postService->getComments($id);

        if ($comments === null) {
            return response()->json(['success' => false, 'message' => 'Postingan tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'data' => $comments]);
    }

    public function storeComment(CommentRequest $request, int $id): JsonResponse
    {
        $comment = $this->postService->addComment($id, $request->user()->id, $request->content);

        if ($comment === null) {
            return response()->json(['success' => false, 'message' => 'Postingan tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'data' => $comment], 201);
    }

    public function destroyComment(Request $request, int $postId, int $commentId): JsonResponse
    {
        $deleted = $this->postService->deleteComment($postId, $commentId, $request->user()->id);

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Komentar tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Komentar berhasil dihapus.']);
    }
}
