<?php

namespace App\Services\Post;

use App\Models\Post;
use App\Models\PostComment;
use App\Repositories\Contracts\PostRepositoryInterface;
use App\Services\Share\ShareBuilder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostService
{
    public function __construct(
        private readonly PostRepositoryInterface $postRepo,
        private readonly ShareBuilder            $shareBuilder,
    ) {}

    public function getByUser(int $userId): Collection
    {
        return $this->postRepo->allByUser($userId)
            ->map(fn($p) => $this->formatPost($p, $userId));
    }

    public function getAll(int $currentUserId): Collection
    {
        return $this->postRepo->allVisibleToUser($currentUserId)
            ->map(fn($p) => $this->formatPost($p, $currentUserId));
    }

    public function getAllSince(int $currentUserId, int $sinceId): Collection
    {
        return $this->postRepo->allVisibleToUserSince($currentUserId, $sinceId)
            ->map(fn ($p) => $this->formatPost($p, $currentUserId));
    }

    public function create(array $data, UploadedFile $image, int $userId): array
    {
        $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
        $path     = $image->storeAs('posts', $filename, 'public');

        $payload = $this->shareBuilder
            ->withUserId($userId)
            ->withTitle($data['title'])
            ->withCaption($data['caption'] ?? null)
            ->withImagePath($path)
            ->build();

        $payload['is_private']   = (bool) ($data['is_private'] ?? false);
        $payload['frame_style']  = $data['frame_style'] ?? 'rect';

        if (!empty($data['habit_id'])) {
            $payload['habit_id']         = $data['habit_id'];
            $payload['habit_title']      = $data['habit_title'] ?? null;
            $payload['progress_percent'] = $data['progress_percent'] ?? null;
        }

        $post = $this->postRepo->create($payload);
        $post->load(['user', 'likes']);

        return $this->formatPost($post, $userId);
    }

    public function delete(int $postId, int $userId): bool
    {
        $post = $this->postRepo->findByIdAndUser($postId, $userId);

        if (!$post) {
            return false;
        }

        Storage::disk('public')->delete($post->image_path);
        $this->postRepo->delete($post);

        return true;
    }

    public function toggleLike(int $postId, int $userId): ?array
    {
        $post = $this->postRepo->findById($postId);

        if (!$post) {
            return null;
        }

        return $this->postRepo->toggleLike($postId, $userId);
    }

    public function getComments(int $postId): ?Collection
    {
        $post = $this->postRepo->findById($postId);

        if (!$post) {
            return null;
        }

        return $this->postRepo->getComments($postId)
            ->map(fn($c) => $this->formatComment($c));
    }

    public function addComment(int $postId, int $userId, string $content): ?array
    {
        $post = $this->postRepo->findById($postId);

        if (!$post) {
            return null;
        }

        $comment = $this->postRepo->createComment([
            'post_id' => $postId,
            'user_id' => $userId,
            'content' => $content,
        ]);

        $post->increment('comments_count');
        $comment->load('user');

        return $this->formatComment($comment);
    }

    public function deleteComment(int $postId, int $commentId, int $userId): bool
    {
        $comment = $this->postRepo->findComment($commentId, $postId, $userId);

        if (!$comment) {
            return false;
        }

        $this->postRepo->deleteComment($comment);

        $post = $this->postRepo->findById($postId);
        if ($post && $post->comments_count > 0) {
            $post->decrement('comments_count');
        }

        return true;
    }

    public function formatPost(Post $post, int $currentUserId): array
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
            'is_private'       => (bool) $post->is_private,
            'frame_style'      => $post->frame_style ?? 'rect',
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
