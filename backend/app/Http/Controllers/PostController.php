<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostLike;
use App\Models\PostComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PostController extends Controller
{
    // ── Posts ─────────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $posts = Post::with(['user', 'likes'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $posts->map(fn($p) => $this->formatPost($p, $userId)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'            => 'required|string|max:150',
            'caption'          => 'nullable|string|max:1000',
            'image'            => 'required|file|image|max:10240',
            'habit_id'         => 'nullable|integer',
            'habit_title'      => 'nullable|string|max:100',
            'progress_percent' => 'nullable|numeric|min:0|max:100',
        ], [
            'title.required' => 'Judul postingan wajib diisi.',
            'image.required' => 'Gambar snapshot wajib disertakan.',
            'image.image'    => 'File harus berupa gambar.',
            'image.max'      => 'Ukuran gambar maksimal 10MB.',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $file     = $request->file('image');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path     = $file->storeAs('posts', $filename, 'public');

        $post = Post::create([
            'user_id'          => $request->user()->id,
            'habit_id'         => $request->habit_id,
            'title'            => $request->title,
            'caption'          => $request->caption,
            'image_path'       => $path,
            'habit_title'      => $request->habit_title,
            'progress_percent' => $request->progress_percent,
        ]);

        $post->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil dibuat!',
            'data'    => $this->formatPost($post, $request->user()->id),
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $post = Post::where('id', $id)->where('user_id', $request->user()->id)->first();

        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Postingan tidak ditemukan.'], 404);
        }

        Storage::disk('public')->delete($post->image_path);
        $post->delete();

        return response()->json(['success' => true, 'message' => 'Postingan berhasil dihapus.']);
    }

    // ── Likes ─────────────────────────────────────────────────────────────────

    public function toggleLike(Request $request, int $id): JsonResponse
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Postingan tidak ditemukan.'], 404);
        }

        $userId = $request->user()->id;
        $like   = PostLike::where('post_id', $id)->where('user_id', $userId)->first();

        if ($like) {
            $like->delete();
            $post->decrement('likes_count');
            $liked = false;
        } else {
            PostLike::create(['post_id' => $id, 'user_id' => $userId]);
            $post->increment('likes_count');
            $liked = true;
        }

        return response()->json([
            'success'     => true,
            'liked'       => $liked,
            'likes_count' => $post->fresh()->likes_count,
        ]);
    }

    // ── Comments ──────────────────────────────────────────────────────────────

    public function comments(int $id): JsonResponse
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Postingan tidak ditemukan.'], 404);
        }

        $comments = PostComment::with('user')
            ->where('post_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $comments->map(fn($c) => $this->formatComment($c)),
        ]);
    }

    public function storeComment(Request $request, int $id): JsonResponse
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['success' => false, 'message' => 'Postingan tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:500',
        ], [
            'content.required' => 'Komentar tidak boleh kosong.',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $comment = PostComment::create([
            'post_id' => $id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        $post->increment('comments_count');
        $comment->load('user');

        return response()->json([
            'success' => true,
            'data'    => $this->formatComment($comment),
        ], 201);
    }

    public function destroyComment(Request $request, int $postId, int $commentId): JsonResponse
    {
        $comment = PostComment::where('id', $commentId)
            ->where('post_id', $postId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Komentar tidak ditemukan.'], 404);
        }

        $comment->delete();

        $post = Post::find($postId);
        if ($post && $post->comments_count > 0) {
            $post->decrement('comments_count');
        }

        return response()->json(['success' => true, 'message' => 'Komentar berhasil dihapus.']);
    }

    // ── Formatters ────────────────────────────────────────────────────────────

    private function formatPost(Post $post, int $currentUserId): array
    {
        return [
            'id'               => $post->id,
            'title'            => $post->title,
            'caption'          => $post->caption,
            'image_url'        => '/storage/' . $post->image_path,
            'habit_title'      => $post->habit_title,
            'progress_percent' => $post->progress_percent,
            'likes_count'      => $post->likes_count,
            'comments_count'   => $post->comments_count,
            'liked_by_me'      => $post->likes->contains('user_id', $currentUserId),
            'is_mine'          => $post->user_id === $currentUserId,
            'created_at'       => $post->created_at?->toISOString(),
            'user'             => [
                'id'              => $post->user->id,
                'username'        => $post->user->username,
                'full_name'       => $post->user->full_name,
                'profile_picture' => $post->user->profile_picture,
            ],
        ];
    }

    private function formatComment(PostComment $comment): array
    {
        return [
            'id'         => $comment->id,
            'content'    => $comment->content,
            'created_at' => $comment->created_at?->toISOString(),
            'user'       => [
                'id'              => $comment->user->id,
                'username'        => $comment->user->username,
                'full_name'       => $comment->user->full_name,
                'profile_picture' => $comment->user->profile_picture,
            ],
        ];
    }
}
