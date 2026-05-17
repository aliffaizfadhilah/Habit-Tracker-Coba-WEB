<?php

namespace App\Repositories\Eloquent;

use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Repositories\Contracts\PostRepositoryInterface;
use Illuminate\Support\Collection;

class PostRepository implements PostRepositoryInterface
{
    public function allWithUsers(): Collection
    {
        return Post::with(['user', 'likes'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findById(int $id): ?Post
    {
        return Post::find($id);
    }

    public function findByIdAndUser(int $id, int $userId): ?Post
    {
        return Post::where('id', $id)->where('user_id', $userId)->first();
    }

    public function create(array $data): Post
    {
        return Post::create($data);
    }

    public function delete(Post $post): void
    {
        $post->delete();
    }

    public function toggleLike(int $postId, int $userId): array
    {
        $post = Post::find($postId);
        $like = PostLike::where('post_id', $postId)->where('user_id', $userId)->first();

        if ($like) {
            $like->delete();
            $post->decrement('likes_count');
            $liked = false;
        } else {
            PostLike::create(['post_id' => $postId, 'user_id' => $userId]);
            $post->increment('likes_count');
            $liked = true;
        }

        return [
            'liked'       => $liked,
            'likes_count' => $post->fresh()->likes_count,
        ];
    }

    public function getComments(int $postId): Collection
    {
        return PostComment::with('user')
            ->where('post_id', $postId)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function createComment(array $data): PostComment
    {
        return PostComment::create($data);
    }

    public function findComment(int $commentId, int $postId, int $userId): ?PostComment
    {
        return PostComment::where('id', $commentId)
            ->where('post_id', $postId)
            ->where('user_id', $userId)
            ->first();
    }

    public function deleteComment(PostComment $comment): void
    {
        $comment->delete();
    }
}
